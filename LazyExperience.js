/* WORK IN PROGRESS
 * Version 0.0.13
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1014
 * Roll20: https://app.roll20.net/users/1226016/robin-k
 * Roll20 Thread: https://app.roll20.net/forum/post/6248700/script-beta-beyondimporter-import-dndbeyond-character-sheets
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
*/

/*
 * TODO
 * Add XP by only Characterid
 * Check styling variables
 * Check styling of the different menus
 * Color to the buttons!
 * Check all commands
 * Give XP directly?
*/

(function() {
    // Styling for the chat responses.
    const style = "overflow: hidden; background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;";
    const buttonStyle = "background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center; float: right;"
    const buttonStyle2 = "background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center;";
    const conditionStyle = "background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;";
    const conditionButtonStyle = "text-decoration: underline; background-color: #fff; color: #000; padding: 0";
    const listStyle = 'list-style: none; padding: 0; margin: 0;';

    let script_name = 'Lazy Experience';
    let state_name = 'LAZYEXPERIENCE';

    let markers = ['blue', 'brown', 'green', 'pink', 'purple', 'red', 'yellow', '-', 'all-for-one', 'angel-outfit', 'archery-target', 'arrowed', 'aura', 'back-pain', 'black-flag', 'bleeding-eye', 'bolt-shield', 'broken-heart', 'broken-shield', 'broken-skull', 'chained-heart', 'chemical-bolt', 'cobweb', 'dead', 'death-zone', 'drink-me', 'edge-crack', 'fishing-net', 'fist', 'fluffy-wing', 'flying-flag', 'frozen-orb', 'grab', 'grenade', 'half-haze', 'half-heart', 'interdiction', 'lightning-helix', 'ninja-mask', 'overdrive', 'padlock', 'pummeled', 'radioactive', 'rolling-tomb', 'screaming', 'sentry-gun', 'skull', 'sleepy', 'snail', 'spanner',   'stopwatch','strong', 'three-leaves', 'tread', 'trophy', 'white-tower']

    let playerid;

    on('ready',()=>{ 
        checkInstall();
        log(script_name + ' Ready!');
        if(state[state_name].config.debug){ sendChat('', script_name + ' Ready!'); }

        // Handle condition descriptions when tokenmod changes the statusmarkers on a token.
        if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange){
            TokenMod.ObserveTokenChange(function(obj,prev){
                handleStatusmarkerChange(obj,prev);
            });
        }
    });

    on('change:graphic:statusmarkers', (obj, prev) => {
        handleStatusmarkerChange(obj,prev);
    });

    on('chat:message', function(msg) {
        if (msg.type != 'api') return;

        // Split the message into command and argument(s)
        let args = msg.content.split(' ');
        let command = args.shift().substring(1);
        let extracommand = args.shift();

        if (command == state[state_name].config.command) {
            switch(extracommand){
                case 'help':
                    sendHelpMenu();
                break;

                case 'reset':
                    state[state_name] = {};
                    setDefaults(true);
                    sendConfigMenu();
                break;

                case 'menu':
                    sendMenu();
                break;

                case 'resetxp':
                    resetExperience();
                    sendMenu();
                break;

                case 'refresh':
                    refreshPlayers();
                    sendConfigMenu();
                break;

                case 'refreshcharacters':
                    playerid = args.shift();
                    refreshCharacters();
                    sendPlayerConfigMenu(playerid);
                break;

                case 'player':
                    let todo = args.shift();

                    switch(todo){
                        case 'remove':
                            playerid = args.shift();
                            let sure = (args.shift() === 'yes');
                            if(sure){
                                delete state[state_name].players[playerid];
                                sendConfigMenu();
                            }
                        break;

                        default:
                            playerid = args.shift();
                            state[state_name].players[playerid].active = (todo === 'true');
                            sendPlayerConfigMenu(playerid);
                        break;
                    }
                break;

                case 'setcharactive':
                    let characterid = args.shift();
                    playerid = args.shift();
                    let active = args.shift();

                    state[state_name].players[playerid].characters.forEach((character, i, array) => {
                        if((character.id === characterid)){
                            state[state_name].players[playerid].characters[i].active = (active === 'true');
                        }
                    });

                    sendPlayerConfigMenu(playerid)
                break;

                case 'config':
                    if(args.length > 0){
                        let setting = args.shift();
                        if(setting === 'player'){
                            playerid = args.shift();
                            sendPlayerConfigMenu(playerid);
                        }else{
                            setting = setting.split('|');
                            let key = setting.shift();
                            let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                            value = (key === 'marker' && value === '-') ? state[state_name].config[key] : value;
                            if(key == 'extra_players'){
                                state[state_name][key] = value;
                            }else{
                                state[state_name].config[key] = value;
                            }

                            sendConfigMenu();
                        }
                    }else{
                        sendConfigMenu();
                    }                    
                break;

                case 'add':
                    let experience = args.shift()*1;
                    playerid = args.shift();

                    if(!playerid){
                        let total_experience = experience+getExperience();
                        setExperience(total_experience);
                        sendChat(script_name, '/w gm <div style="'+style+'">' + experience + ' experience added, total experience is now: '+ total_experience +'</div>');
                    }else{
                        if(playerExists(playerid)){
                            let characterid = args.shift();
                            let player = state[state_name].players[playerid];
                            let character = getObjects(player.characters, 'id', characterid).shift();
                            let total_experience = experience+character.experience;
                            state[state_name].players[playerid].characters.forEach((character, i) => {
                                if(characterid === character.id){
                                    state[state_name].players[playerid].characters[i].experience = total_experience;
                                }
                            });
                            sendChat(script_name, '/w gm <div style="'+style+'">' + experience + ' experience added to '+character.name+', total experience for '+character.name+' is now: '+ total_experience +'</div>');
                        }else{
                            sendChat(script_name, '/w gm <div style="'+style+'">Player does not exists. You can try and refresh the player list.<hr>'+makeButton('Refresh Players', '!'+state[state_name].config.command + ' refresh', buttonStyle2)+'</div>')
                        }                        
                    }
                break

                case 'show':
                    sendChat(script_name, '/w gm <div style="'+style+'">Current Experience: ' + getExperience() + '</div>');
                break;

                case 'end':
                    let xpSharers = getExperienceSharers();
                    let session_experience = (xpSharers > 0) ? (Math.floor(getExperience()/xpSharers)) : 0;

                    sendChat(script_name, '<div style="'+style+'"><b>Session Ended</b><br>Everyone gets <b>'+session_experience+' experience.</b></div>');

                    let character_experiences = '';
                    for(playerid in state[state_name].players){
                        let player = state[state_name].players[playerid];
                        if(player.active){
                            player.characters.forEach((character, i) => {
                                if(character.active){
                                    let total_experience = character.experience+session_experience
                                    character_experiences += character.name + ': ' + character.experience + ' | Total: <b>' + total_experience + '</b><br>';
                                    if(state[state_name].config.updatesheet){
                                        let full_total_experience = getAttrByName(character.id, state[state_name].config.experience_attribute_name, 'current')*1 + total_experience*1;
                                        let attributes = {};
                                        attributes[state[state_name].config.experience_attribute_name] = full_total_experience;
                                        setAttrs(character.id, attributes);

                                        sendChat(script_name, '/w ' + character.name.split(' ').shift() + ' <div style="'+style+'">You get '+character.experience+' extra experience, bringing your total this session to <b>' + total_experience + '</b> experience. <p>Your sheet has been updated, your total experience is now '+full_total_experience+'</p></div>');
                                    }else{
                                        sendChat(script_name, '/w ' + character.name.split(' ').shift() + ' <div style="'+style+'">You get '+character.experience+' extra experience, bringing your total this session to <b>' + total_experience + '</b> experience.</div>');
                                    }
                                }
                            });
                        }
                    }

                    sendChat(script_name, '/w gm <div style="'+style+'">Session Experience: '+session_experience+'<hr>'+character_experiences+'</div>')

                    resetExperience();
                break;

                default:
                    sendHelpMenu();
                break;
            }
        }
    });

    const getExperienceSharers = () => {
        let xpSharers = state[state_name].extra_players*1;

        if(state[state_name].players.length === 0){ return xpSharers; }
        
        for(let playerid in state[state_name].players){
            if(state[state_name].players[playerid].active){
                state[state_name].players[playerid].characters.forEach((character) => {
                    if(character.active){
                        xpSharers++;
                    }
                });
            }
        }

        return xpSharers;
    }

    const playerExists = (playerid) => {
        return (state[state_name].players[playerid]);
    }

    const getActivePlayerCount = () => {
        let counter = 0;
        for(var name in state[state_name].players){
            if(state[state_name].players[name].active){ counter++; }
        }
        return counter;
    }

    const getPlayers = (object) => {
        let players = []
        findObjs({ _type: 'player' }).forEach((player) => {
            if(!playerIsGM(player.get('id'))){
                if(object){
                    players.push({
                        name: player.get('_displayname'),
                        id: player.get('_id')
                    })
                }else{
                    players.push(player.get('_id'));
                }
            }
        });
        return players;
    }

    const getPlayerCharacters = (playerid) => {
        return findObjs({
            _type: 'character',
            controlledby: playerid,
            inplayerjournals: playerid
        }).map(character => {
            return {
                name: character.get('name'),
                id: character.get('id'),
                active: true,
                experience: 0
            }
        });
    }

    const getPlayerid = (player_name) => {
        return getObjects(getPlayers(true), 'name', player_name).shift().id
    }

    const getExperience = () => {
        return state[state_name].session_experience;
    }

    const getExperienceByPlayerName = (player_name) => {
        return getExperienceByPlayerid(getPlayerid(player_name));
    }

    const getExperienceByPlayerid = (playerid) => {
        return state[state_name].players[playerid].experience;
    }

    const setExperience = (experience, playerid) => {
        if(playerid){
            state[state_name].players[playerid].experience += experience;
        }else{
            state[state_name].session_experience += experience;
        }
    }

    const setExperienceToPlayerName = (experience, player_name) => {
        setExperienceToPlayerid(experience, getPlayerid(player_name));
    }

    const setExperienceToPlayerid = (experience, playerid) => {
        setExperience(experience, playerid);
    }

    //return an array of objects according to key, value, or key and value matching
    const getObjects = (obj, key, val) => {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(getObjects(obj[i], key, val));    
            } else 
            //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
            if (i == key && obj[i] == val || i == key && val == '') { //
                objects.push(obj);
            } else if (obj[i] == val && key == ''){
                //only add if the object is not already in the array
                if (objects.lastIndexOf(obj) == -1){
                    objects.push(obj);
                }
            }
        }
        return objects;
    }

    const resetExperience = () => {
        state[state_name].session_experience = 0;
        for(let playerid in state[state_name].players){
            let player = state[state_name].players[playerid];
            player.characters.forEach((character, i) => {
                state[state_name].players[playerid].characters[i].experience = 0;
            })
        }
    }

    const handleStatusmarkerChange = (obj, prev) => {
        // Check if the statusmarkers string is different from the previous statusmarkers string.
        if(obj.get('statusmarkers') !== prev.statusmarkers){
            // Create arrays from the statusmarkers strings.
            var prevstatusmarkers = prev.statusmarkers.split(",");
            var statusmarkers = obj.get('statusmarkers').split(",");

            if(!prevstatusmarkers.includes(state[state_name].config.marker) && statusmarkers.includes(state[state_name].config.marker)){
                var experience = findObjs({                                                          
                    _type: "attribute",
                    name: state[state_name].config.experience_attribute_name,
                    characterid: obj.get('represents')                    
                }).shift().get('current');

                if(experience > 0){
                    let yesButton = makeButton('Yes', '!' + state[state_name].config.command + ' add '+experience, buttonStyle2);
                    sendChat('LazyExperience', '/w gm <div style="'+style+'"><b>' + obj.get('name') + '</b> just died, do you want to add <b>'+experience+'</b> xp to the threshold?<br>'+yesButton+'</div>');
                }                
            }
        }
    }

    const sendMenu = () => {
        let addXPButton = makeButton('Add Session Experience', '!' + state[state_name].config.command + ' add ?{Experience}', buttonStyle2);
        let endButton = makeButton('End Session', '!' + state[state_name].config.command + ' end', buttonStyle2);
        let resetXPButton = makeButton('Reset Experience', '!' + state[state_name].config.command + ' resetxp', buttonStyle2);
        //let addXPSelectedButton = makeButton('Add XP: Selected', '!' + state[state_name].config.command + ' add ?{selectedExperience}', buttonStyle2);

        let playerListItems = [];
        for(var playerid in state[state_name].players){
            let player = state[state_name].players[playerid];
            if(player.active){
                let characterListItems = [];
                let characterDropdown = '?{Character';
                let characterIds = [];
                player.characters.forEach(character => {
                    if(character.active){
                        let name = (character.name.length > 8) ? character.name.slice(0, 8) + '...' : character.name;
                        characterListItems.push(name + ': ' + character.experience);
                        characterDropdown += '|'+character.name+','+character.id;
                        characterIds.push(character.id);
                    }
                });
                characterDropdown += '}';
                characterDropdown = (characterIds.length === 1) ? characterIds[0] : characterDropdown;
                let addExperienceButton = (characterIds.length > 0) ? makeButton('Add xp', '!' + state[state_name].config.command + ' add ?{Experience} ' + playerid + ' ' + characterDropdown, buttonStyle + ' float: right; font-size: 10pt;', (player.characters.length > 0)) : '';
                playerListItems.push('<span style="float: left; font-weight: bold">' + player.name + '<br>' + makeList(characterListItems, listStyle + 'margin-left: 5px;', 'font-size: 10pt;') + '</span> ' + addExperienceButton);
            }
        }

        sendChat(script_name, '/w gm <div style="'+style+'">'+makeTitle(script_name + ' menu')+'Session Experience: '+getExperience()+'<br>Experience Divisors: ' + getExperienceSharers() + '<hr>'+makeList(playerListItems, listStyle + ' overflow: hidden;', 'overflow: hidden;')+'<hr>'+addXPButton+'<br>'+endButton+'<hr>'+resetXPButton+'</div>');
    }

    const ucFirst = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const sendConfigMenu = (first) => {
        let commandButton = makeButton('!'+state[state_name].config.command, '!' + state[state_name].config.command + ' config command|?{Command (without !)}', buttonStyle);
        let markerDropdown = '?{Marker';
        markers.forEach((marker) => {
            markerDropdown += '|'+ucFirst(marker).replace('-', ' ')+','+marker
        })
        markerDropdown += '}';

        let markerButton = makeButton(state[state_name].config.marker, '!' + state[state_name].config.command + ' config marker|'+markerDropdown, buttonStyle);
        let experienceAttributeButton = makeButton(state[state_name].config.experience_attribute_name, '!' + state[state_name].config.command + ' config experience_attribute_name|?{Attribute}', buttonStyle);
        let extraPlayersButton = makeButton(state[state_name].extra_players, '!' + state[state_name].config.command + ' config extra_players|?{Players}', buttonStyle);
        let updateSheetButton = makeButton(state[state_name].config.updatesheet, '!' + state[state_name].config.command + ' config updatesheet|'+!state[state_name].config.updatesheet, buttonStyle);

        let listItems = [
            '<span style="float: left">Command:</span> ' + commandButton,
            '<span style="float: left">Marker:</span> ' + markerButton,
            '<span style="float: left">XP Attribute:</span> ' + experienceAttributeButton,
            '<span style="float: left">Extra Players:</span> ' + extraPlayersButton,
            '<span style="float: left">Update Sheets:</span> ' + updateSheetButton,
        ];

        let playerListItems = [];
        if(Object.keys(state[state_name].players).length > 0){
            for(var playerid in state[state_name].players){
                let player = state[state_name].players[playerid];
                let activeStyle = (player.active) ? '' : 'text-decoration: line-through;';
                playerListItems.push('<span style="float: left; ' + activeStyle + '">'+player.name+'</span> ' + makeButton('Config', '!' + state[state_name].config.command + ' config player '+playerid, buttonStyle));
            }
        }else{
            playerListItems.push('No players found.');
        }

        let refreshPlayersButton = makeButton('Refresh Players', '!' + state[state_name].config.command + ' refresh', buttonStyle + ' width: 100%');
        let resetXPButton = makeButton('Reset Experience', '!' + state[state_name].config.command + ' resetxp', buttonStyle + ' width: 100%');
        let resetButton = makeButton('Reset Config', '!' + state[state_name].config.command + ' reset', buttonStyle + ' width: 100%');

        let title_text = (first) ? script_name + ' First Time Setup' : script_name + ' Config';
        let text = '<div style="'+style+'">'+makeTitle(title_text)+makeList(listItems, listStyle + ' overflow:hidden;', 'overflow: hidden')+'<hr><b>Players</b><br><br>'+makeList(playerListItems, listStyle + ' overflow:hidden;', 'overflow: hidden')+'<hr>'+refreshPlayersButton+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+state[state_name].config.command+' config`.</p><hr>'+resetXPButton+'<br>'+resetButton+'</div>';

        sendChat('', '/w gm ' + text);
    }

    const sendPlayerConfigMenu = (playerid) => {
        let player = state[state_name].players[playerid];
        let activeButton = makeButton((player.active) ? 'Active' : 'Not Active', '!' + state[state_name].config.command + ' player '+!player.active+' '+playerid, buttonStyle2);

        let characterListItems = [];
        let characterDropdown = '?{Character';
        player.characters.forEach((character) => {
            let mainButton = makeButton((character.active) ? 'Active' : 'Not Active', '!' + state[state_name].config.command + ' setcharactive ' + character.id + ' ' + playerid + ' ' + !character.active, buttonStyle);
            let main = (character.main) ? '<b style="float: right">Main</b>' : mainButton;
            characterListItems.push('<span style="float: left;">'+character.name+'<br><span style="font-size: 8pt">Experience: '+character.experience+'</span></span> ' + main);
            characterDropdown += '|'+character.name+','+character.id;
        });
        characterDropdown += '}';

        let addExperienceButton = makeButton('Add Experience', '!' + state[state_name].config.command + ' add ?{Experience} ' + playerid + ' ' + characterDropdown, buttonStyle2, (player.characters.length > 0));

        let listItems = [
            activeButton,
            addExperienceButton,
        ];

        let refreshCharactersButton = makeButton('Refresh Characters', '!' + state[state_name].config.command + ' refreshcharacters '+playerid, buttonStyle + ' width: 100%');
        let removeButton = makeButton('Remove', '!' + state[state_name].config.command + ' player remove ' + playerid + ' ?{Are you sure?|Yes,yes|No,no}', buttonStyle + ' width: 100%;');
        let backButton = makeButton('Back', '!' + state[state_name].config.command + ' config', buttonStyle + ' width: 100%');

        let text = '<div style="'+style+'">'+makeTitle(player.name + ' - Config')+'Experience: '+player.experience+'<hr>'+makeList(listItems, listStyle + ' overflow:hidden;', 'overflow: hidden')+'<hr><b>Characters</b>'+makeList(characterListItems, listStyle + ' overflow:hidden;', 'overflow: hidden;')+refreshCharactersButton+'<hr>'+backButton+'<hr>'+removeButton+'</div>';

        sendChat('', '/w gm ' + text);
    }

    const sendHelpMenu = (first) => {
        let configButton = makeButton('Config', '!' + state[state_name].config.command + ' config', buttonStyle + ' width: 100%;')

        let listItems = [
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' help</span> - Shows this menu.',
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' config</span> - Shows the configuration menu.',
        ]

        let text = '<div style="'+style+'">'+makeTitle(script_name + ' Help')+'<b>Commands:</b>'+makeList(listItems, listStyle)+'<hr>'+configButton+'</div>';

        sendChat('', '/w gm ' + text);
    }

    const makeTitle = (title) => {
        return '<h3 style="margin-bottom: 10px;">'+title+'</h3>';
    }

    const makeButton = (title, href, style, disabled) => {
        let disableStyle = (disabled) ? 'pointer-events: none' : '';
        return '<a style="'+style+disableStyle+'" href="'+href+'">'+title+'</a>';
    }

    const makeList = (items, listStyle, itemStyle) => {
        let list = '<ul style="'+listStyle+'">';
        items.forEach((item) => {
            list += '<li style="'+itemStyle+'">'+item+'</li>';
        });
        list += '</ul>';
        return list;
    }

    const pre_log = (message) => {
        log('---------------------------------------------------------------------------------------------');
        log(message);
        log('---------------------------------------------------------------------------------------------');
    }

    const checkInstall = () => {
        if(!_.has(state, state_name)){
            state[state_name] = state[state_name] || {};
        }
        setDefaults();
        refreshPlayers();
    }

    const getPlayerById = (playerid) => {
        return findObjs({
            _type: 'player',
            _id: playerid
        }).shift()
    }

    const refreshPlayers = () => {
        let saved_players = Object.keys(state[state_name].players).map((playerid, i) => { return playerid });

        // Player added?
        array_diff(saved_players, getPlayers()).forEach((playerid) => {
            player = getPlayerById(playerid);
            state[state_name].players[playerid] = {
                name: player.get('_displayname'),
                id: playerid,
                active: true,
                experience: 0,
                characters: getPlayerCharacters(playerid)
            };
        });

        // Player removed?
        array_diff(getPlayers(), saved_players).forEach((playerid) => {
            delete state[state_name].players[player];
        });
    }

    const refreshCharacters = () => {
        for(let playerid in state[state_name].players){
            let characterids = getPlayerCharacters(playerid).map((character) => { return character.id });
            let saved_characterids = (state[state_name].players[playerid].characters.length > 0) ? state[state_name].players[playerid].characters.map((character) => { return character.id }) : [];

            // Player added?
            array_diff(saved_characterids, characterids).forEach((characterid) => {
                state[state_name].players[playerid].characters.push(getObjects(getPlayerCharacters(playerid), 'id', characterid).shift());
            });

            // Player removed?
            array_diff(characterids, saved_characterids).forEach((characterid) => {
                state[state_name].players[playerid].characters.forEach((character, i) => {
                    if(character.id === characterid){
                        delete state[state_name].players[playerid].characters[i];
                    }
                })
            });
        }
    }

    const array_diff = (a, b) => {
        return b.filter(function(i) {return a.indexOf(i) < 0;});
    }

    const setDefaults = (reset) => {
        const defaults = {
            config: {
                command: 'lxp',
                marker: 'dead',
                experience_attribute_name: 'xp',
                directxp: false,
                updatesheet: false
            },
            players: {},
            extra_players: 0,
            session_experience: 0
        };

        getPlayers(true).forEach((player) => {
            defaults.players[player.id] = {
                name: player.name,
                id: player.id,
                active: true,
                experience: 0,
                characters: getPlayerCharacters(player.id)
            };
        });

        if(!state[state_name].config){
            state[state_name].config = defaults.config;
        }else{
            if(!state[state_name].config.hasOwnProperty('command')){
                state[state_name].config.command = defaults.config.command;
            }
            if(!state[state_name].config.hasOwnProperty('marker')){
                state[state_name].config.marker = defaults.config.marker;
            }
            if(!state[state_name].config.hasOwnProperty('experience_attribute_name')){
                state[state_name].config.experience_attribute_name = defaults.config.experience_attribute_name;
            }
            if(!state[state_name].config.hasOwnProperty('directxp')){
                state[state_name].config.directxp = defaults.config.directxp;
            }
            if(!state[state_name].config.hasOwnProperty('updatesheet')){
                state[state_name].config.updatesheet = defaults.config.updatesheet;
            }
        }

        if(!state[state_name].hasOwnProperty('players') || typeof state[state_name].players !== 'object' || state[state_name].players === {}){
            state[state_name].players = defaults.players;
        }
        if(!state[state_name].hasOwnProperty('extra_players')){
            state[state_name].extra_players = defaults.extra_players;
        }
        if(!state[state_name].hasOwnProperty('session_experience')){
            state[state_name].session_experience = defaults.session_experience;
        }

        if(!state[state_name].config.hasOwnProperty('firsttime') || state[state_name].config.firsttime && !reset){
            sendConfigMenu(true);
            state[state_name].config.firsttime = false;
        }
    }
})();