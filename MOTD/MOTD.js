/*
 * Version 0.0.4
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1014
 * Roll20: https://app.roll20.net/users/1226016/robin-k
 * Roll20 Thread: https://app.roll20.net/forum/post/6248700/script-beta-beyondimporter-import-dndbeyond-character-sheets
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
*/

(function() {
    // Styling for the chat responses.
    const style = "overflow: hidden; background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;";
    const buttonStyle = "background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center;";
    const float_right = 'float: right;';
    const listStyle = 'list-style: none; padding: 0; margin: 0;';

    let script_name = 'MOTD';
    let state_name = 'MOTD';

    let allowed_tags = ['<b>','<i>','<u>','<p>','<br>'];

    on('ready',()=>{ 
        checkInstall();
        log(script_name + ' Ready! Command: !'+state[state_name].config.command);
        if(state[state_name].config.debug){ sendChat('', script_name + ' Ready!'); }
    });

    on('change:player:_online', (obj) => {
        let message = state[state_name].message;
        let show = (!state[state_name].config.onlyOnce || !state[state_name].showedTo.includes(obj.get('d20userid')))
        if(show && obj.get('online') && message && message !== ''){
            setTimeout(() => {
                makeAndSendMenu(message, 'Message of the Day', obj.get('displayname'));
                state[state_name].showedTo.push(obj.get('d20userid'));
            }, 6000)
        }
    });

    on('chat:message', (msg) => {
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

                case 'show':
                    makeAndSendMenu(state[state_name].message, 'Message of the Day', args.shift());
                break;

                case 'message':
                    state[state_name].message = strip_tags(args.join(' '), allowed_tags.join('')) + allowed_tags.join('').replace(/\</g, '</'); // End the message with the closing tags of the allowed tags, Roll20 automaticly deletes not used tags.
                    state[state_name].showedTo = [];
                    sendConfigMenu();
                break;

                default:
                    sendHelpMenu();
                break;
            }
        }
    });

    const sendConfigMenu = (first) => {
        let commandButton = makeButton('!'+state[state_name].config.command, '!' + state[state_name].config.command + ' config command|?{Command (without !)}', buttonStyle + float_right);
        let onlyOnceButton = makeButton(state[state_name].config.onlyOnce, '!' + state[state_name].config.command + ' config onlyOnce|'+!state[state_name].config.onlyOnce, buttonStyle + float_right)

        let listItems = [
            '<span style="float: left">Command:</span> ' + commandButton,
            '<span style="float: left">Show message once:</span> ' + onlyOnceButton,
        ];

        let setMessageButton = makeButton('Set Message', '!' + state[state_name].config.command + ' message ?{Message}', buttonStyle + ' width: 100%');
        let resetButton = makeButton('Reset', '!' + state[state_name].config.command + ' reset', buttonStyle + ' width: 100%');

        let title_text = (first) ? script_name + ' First Time Setup' : script_name + ' Config';
        let current_message = (state[state_name].message !== '') ? '<b>Current Message:</b> <p>'+state[state_name].message+'</p>' : '';
        let contents = current_message+setMessageButton+'<hr><b>Settings</b> '+makeList(listItems, listStyle + ' overflow:hidden;', 'overflow: hidden')+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+state[state_name].config.command+' config`.</p><hr>'+resetButton;
        makeAndSendMenu(contents, title_text, 'gm');
    }

    const removeHTMLTags = (string) => {
       return string.replace(/(<([^>]+)>)/ig,'');
    }

    const strip_tags = (input, allowed) => {
        allowed = (((allowed || '') + '')
            .toLowerCase()
            .match(/<[a-z][a-z0-9]*>/g) || [])
            .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
            commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
        
        return input.replace(commentsAndPhpTags, '')
            .replace(tags, function($0, $1) {
                return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
            });
    }

    const sendHelpMenu = (first) => {
        let configButton = makeButton('Config', '!' + state[state_name].config.command + ' config', buttonStyle + ' width: 100%;')

        let listItems = [
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' help</span> - Shows this menu.',
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' config</span> - Shows the configuration menu.',
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' message [MESSAGE]</span> - Sets a new message (some HTML is allowed, see below).',
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' show</span> - Shows the Message of the Day.',
            '<span style="text-decoration: underline">!'+state[state_name].config.command+' show gm</span> - Shows the Message of the Day to the GM.',
        ]

        let htmlListItems = [];
        allowed_tags.forEach(tag => {
            let showable_open_tag = tag.replace(/&/g, '&amp;').replace(/</g, '&lt;'),
                close_tag = tag.replace(/\</g, '</'),
                showable_close_tag = close_tag.replace(/&/g, '&amp;').replace(/</g, '&lt;'),
                example = tag + 'Example' + close_tag,
                tag_show = showable_open_tag + 'Example' + showable_close_tag;
            
            switch(tag){
                case '<p>':
                    example = 'Paragraph';
                break;

                case '<br>':
                    example = 'Line Break';
                    tag_show = 'Example&lt;br>';
                break;
            }

            htmlListItems.push(tag_show + ' - ' + example);
        })

        let htmlDescription = '<b>HTML Description</b><br>';
        htmlDescription += '<p>Some HTML tags are allowed within the message:</p>';
        htmlDescription += makeList(htmlListItems, listStyle) + '<hr>';
        htmlDescription += '<b>Example Message</b>';
        htmlDescription += '<p>"&lt;i>This message will be italic.&lt;/i>"</p>';
        htmlDescription += '<p>Will look like this:</p>'
        htmlDescription += '<p>"<i>This message will be italic.</i>"</p>'


        let contents = '<b>Commands:</b>'+makeList(listItems, listStyle)+'<hr>'+htmlDescription+'<hr>'+configButton;
        makeAndSendMenu(contents, script_name + ' Help', 'gm')
    }

    const makeAndSendMenu = (contents, title, whisper) => {
        title = (title && title != '') ? makeTitle(title) : '';
        whisper = (whisper && whisper !== '') ? '/w ' + whisper + ' ' : '';
        sendChat(script_name, whisper + '<div style="'+style+'">'+title+contents+'</div>');
    }

    const makeTitle = (title) => {
        return '<h3 style="margin-bottom: 10px;">'+title+'</h3>';
    }

    const makeButton = (title, href, style) => {
        return '<a style="'+style+'" href="'+href+'">'+title+'</a>';
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
    }

    const setDefaults = (reset) => {
        const defaults = {
            config: {
                command: 'motd',
                onlyOnce: true
            },
            message: '',
            showedTo: [],
        };

        if(!state[state_name].config){
            state[state_name].config = defaults.config;
        }else{
            if(!state[state_name].config.hasOwnProperty('command')){
                state[state_name].config.command = defaults.config.command;
            }
            if(!state[state_name].config.hasOwnProperty('onlyOnce')){
                state[state_name].config.onlyOnce = defaults.config.onlyOnce;
            }
        }
        if(!state[state_name].hasOwnProperty('message')){
            state[state_name].message = defaults.message;
        }
        if(!state[state_name].hasOwnProperty('showedTo')){
            state[state_name].showedTo = defaults.showedTo;
        }

        if(!state[state_name].config.hasOwnProperty('firsttime') && !reset){
            sendConfigMenu(true);
            state[state_name].config.firsttime = false;
        }
    }
})();