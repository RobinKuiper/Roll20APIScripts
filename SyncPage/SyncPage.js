/*
 * Version 0.1.0
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1014
 * Roll20: https://app.roll20.net/users/1226016/robin-k
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
 * Patreon: https://patreon.com/robinkuiper
 * Paypal.me: https://www.paypal.me/robinkuiper
*/

var SyncPage = SyncPage || (function() {
    'use strict';

    // Styling for the chat responses.
    const styles = {
        reset: 'padding: 0; margin: 0;',
        menu:  'background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;',
        button: 'background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center;',
        list: 'list-style: none;',
        float: {
            right: 'float: right;',
            left: 'float: left;'
        },
        overflow: 'overflow: hidden;',
        fullWidth: 'width: 100%;',
        underline: 'text-decoration: underline;',
        strikethrough: 'text-decoration: strikethrough'
    },
    script_name = 'SyncPage',
    state_name = 'SYNCPAGE',

    handleInput = (msg) => {
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

                case 'config':
                    if(args.length > 0){
                        let setting = args.shift().split('|');
                        let key = setting.shift();
                        let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                        state[state_name].config[key] = value;
                    }

                    sendConfigMenu();
                break;

                default:
                    doSync();
                break;
            }
        }
    },

    doSync = (page) => {
        let original_page = findObjs({ _type: 'page', name: page.get('name').split(']')[1] })[0];
        let synced_page = createObj('page', {
            showgrid: original_page.get('showgrid'),
            showdarkness: original_page.get('showdarkness'),
            showlighting: original_page.get('showlighting'),
            width: original_page.get('width'),
            height: original_page.get('height'),
            snapping_increment: original_page.get('snapping_increment'),
            grid_opacity: original_page.get('grid_opacity'),
            fog_opacity: original_page.get('fog_opacity'),
            background_color: original_page.get('background_color'),
            gridcolor: original_page.get('gridcolor'),
            grid_type: original_page.get('grid_type'),
            scale_number: original_page.get('scale_number'),
            scale_units: original_page.get('scale_units'),
            gridlabels: original_page.get('gridlabels'),
            diagonaltype: original_page.get('diagonaltype'),
            archived: original_page.get('archived'),
            lightupdatedrop: original_page.get('lightupdatedrop'),
            lightenforcelos: original_page.get('lightenforcelos'),
            lightrestrictmove: original_page.get('lightrestrictmove'),
            lightglobalillum: original_page.get('lightglobalillum'),
        });

        findObjs({ pageid }).forEach(object => {
            let attributes = {
                name: object.get('name'),
                pageid: synced_page.get('id'),
                layer: object.get('layer'),
                width: object.get('width'),
                height: object.get('height'),
                top: object.get('top'),
                left: object.get('left'),
                controlledby: object.get('controlledby'),
                rotation: object.get('rotation')
            };

            switch(object.get('type')){
                case 'path':
                    attributes.path = object.get('path');
                    attributes.fill = object.get('fill');
                    attributes.stroke = object.get('stroke');
                    attributes.stroke_width = object.get('stroke_width');
                    attributes.scaleX = object.get('scaleX');
                    attributes.scaleY = object.get('scaleY');
                break;

                case 'text':
                    attributes.text = object.get('text');
                    attributes.font_size = object.get('font_size');
                    attributes.color = object.get('color');
                    attributes.font_family = object.get('font_family');
                break;

                case 'graphic':
                    attributes.imgsrc = object.get('imgsrc');
                    attributes.bar1_link = object.get('bar1_link');
                    attributes.bar2_link = object.get('bar2_link');
                    attributes.bar3_link = object.get('bar3_link');
                    attributes.represents = object.get('represents');
                    attributes.isdrawing = object.get('isdrawing');
                    attributes.flipv = object.get('flipv');
                    attributes.fliph = object.get('fliph');
                    attributes.gmnotes = object.get('gmnotes');
                    attributes.bar1_value = object.get('bar1_value');
                    attributes.bar2_value = object.get('bar2_value');
                    attributes.bar3_value = object.get('bar3_value');
                    attributes.bar1_max = object.get('bar1_max');
                    attributes.bar2_max = object.get('bar2_max');
                    attributes.bar3_max = object.get('bar3_max');
                    attributes.aura1_radius = object.get('aura1_radius');
                    attributes.aura2_radius = object.get('aura2_radius');
                    attributes.aura1_color = object.get('aura1_color');
                    attributes.aura2_color = object.get('aura2_color');
                    attributes.aura1_square = object.get('aura1_square');
                    attributes.aura2_square = object.get('aura2_square');
                    attributes.tint_color = object.get('tint_color');
                    attributes.statusmarkers = object.get('statusmarkers');
                    attributes.showname = object.get('showname');
                    attributes.showplayers_name = object.get('showplayers_name');
                    attributes.showplayers_bar1 = object.get('showplayers_bar1');
                    attributes.showplayers_bar2 = object.get('showplayers_bar2');
                    attributes.showplayers_bar3 = object.get('showplayers_bar3');
                    attributes.showplayers_aura1 = object.get('showplayers_aura1');
                    attributes.showplayers_aura2 = object.get('showplayers_aura2');
                    attributes.playersedit_name = object.get('playersedit_name');
                    attributes.playersedit_bar1 = object.get('playersedit_bar1');
                    attributes.playersedit_bar2 = object.get('playersedit_bar2');
                    attributes.playersedit_bar3 = object.get('playersedit_bar3');
                    attributes.playersedit_aura1 = object.get('playersedit_aura1');
                    attributes.playersedit_aura2 = object.get('playersedit_aura2');
                    attributes.light_radius = object.get('light_radius');
                    attributes.light_dimradius = object.get('light_dimradius');
                    attributes.light_otherplayers = object.get('light_otherplayers');
                    attributes.light_hassight = object.get('light_hassight');
                    attributes.light_angle = object.get('light_angle');
                    attributes.light_losangle = object.get('light_losangle');
                    attributes.lastmove = object.get('lastmove');
                    attributes.light_multiplier = object.get('light_multiplier');
                break;
            }

            createObj(object.get('type'), attributes);
        });

        state[state_name].synced.push({ pageid: synced_page });
    },

    handlePageChange = (obj, prev) => {
        /*if(!state[state_name].synced[obj.get('id')] || obj === prev) return;

        if(obj.get('zorder') !== prev._zorder){
            // Tokens changed.
        }*/

        if(obj.get('name') !== prev.name || obj.get('name').toLowerCase().includes('[synced]')){
            // Page got synced status
            doSync(obj);
        }
    },

    sendConfigMenu = (first, message) => {
        let commandButton = makeButton('!'+state[state_name].config.command, '!' + state[state_name].config.command + ' config command|?{Command (without !)}', styles.button + styles.float.right)

        let listItems = [
            '<span style="'+styles.float.left+'">Command:</span> ' + commandButton,
        ];

        let resetButton = makeButton('Reset', '!' + state[state_name].config.command + ' reset', styles.button + styles.fullWidth);

        let title_text = (first) ? script_name + ' First Time Setup' : script_name + ' Config';
        message = (message) ? '<p>'+message+'</p>' : '';
        let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+state[state_name].config.command+' config`.</p><hr>'+resetButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    sendHelpMenu = (first) => {
        let configButton = makeButton('Config', '!' + state[state_name].config.command + ' config', styles.button + styles.fullWidth)

        let listItems = [
            '<span style="'+styles.underline+'">!'+state[state_name].config.command+' help</span> - Shows this menu.',
            '<span style="'+styles.underline+'">!'+state[state_name].config.command+' config</span> - Shows the configuration menu.',
        ]

        let contents = '<b>Commands:</b>'+makeList(listItems, styles.reset + styles.list)+'<hr>'+configButton;
        makeAndSendMenu(contents, script_name + ' Help', 'gm')
    },

    makeAndSendMenu = (contents, title, whisper) => {
        title = (title && title != '') ? makeTitle(title) : '';
        whisper = (whisper && whisper !== '') ? '/w ' + whisper + ' ' : '';
        sendChat(script_name, whisper + '<div style="'+styles.menu+styles.overflow+'">'+title+contents+'</div>');
    },

    makeTitle = (title) => {
        return '<h3 style="margin-bottom: 10px;">'+title+'</h3>';
    },

    makeButton = (title, href, style) => {
        return '<a style="'+style+'" href="'+href+'">'+title+'</a>';
    },

    makeList = (items, listStyle, itemStyle) => {
        let list = '<ul style="'+listStyle+'">';
        items.forEach((item) => {
            list += '<li style="'+itemStyle+'">'+item+'</li>';
        });
        list += '</ul>';
        return list;
    },

    pre_log = (message) => {
        log('---------------------------------------------------------------------------------------------');
        if(message === 'line'){ return; }
        log(message);
        log('---------------------------------------------------------------------------------------------');
    },

    checkInstall = () => {
        if(!_.has(state, state_name)){
            state[state_name] = state[state_name] || {};
        }
        setDefaults();

        log(script_name + ' Ready! Command: !'+state[state_name].config.command);
        if(state[state_name].config.debug){ makeAndSendMenu(script_name + ' Ready! Debug On.', '', 'gm') }
    },

    registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:page', handlePageChange);
    },

    setDefaults = (reset) => {
        const defaults = {
            config: {
                command: 'sync'
            },
            synced: []
        };

        if(!state[state_name].config){
            state[state_name].config = defaults.config;
        }else{
            if(!state[state_name].config.hasOwnProperty('command')){
                state[state_name].config.command = defaults.config.command;
            }
        }

        if(typeof state[state_name].synced !== 'array'){
            state[state_name].synced = defaults.synced;
        }

        if(!state[state_name].config.hasOwnProperty('firsttime') && !reset){
            sendConfigMenu(true);
            state[state_name].config.firsttime = false;
        }
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    }
})();

on('ready',function() {
    'use strict';

    SyncPage.CheckInstall();
    SyncPage.RegisterEventHandlers();
});