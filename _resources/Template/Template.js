/*
 * Version 0.1.0
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1095
 * Roll20: https://app.roll20.net/users/1226016/robin
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
 * Patreon: https://patreon.com/robinkuiper
 * Paypal.me: https://www.paypal.me/robinkuiper
*/

var Template = Template || (function() {
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
    script_name = 'Template',
    state_name = 'TEMPLATE',

    handleInput = (msg) => {
        if (msg.type != 'api') return;

        let config = config;

        // Split the message into command and argument(s)
        let args = msg.content.split(' ');
        let command = args.shift().substring(1);
        let extracommand = args.shift();

        if (command == config.command) {
            if(!playerIsGM(msg.playerid)){
                // Player Commands
                switch(extracommand){
                    default:

                    break;
                }
            }else{
                // GM Commands
                switch(extracommand){
                    case 'reset':
                        state[state_name] = {};
                        setDefaults(true);
                        config_menus.main();
                    break;

                    case 'config':
                        if(args.length > 0){
                            let setting = args.shift().split('|');
                            let key = setting.shift();
                            let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                            state[state_name].config[key] = value;
                        }

                        config_menus.main();
                    break;

                    default:
                        config_menus.main();
                    break;
                }
            }
        }
    },

    config_menus = {
        main = (first, message) => {
            let config = state[state_name].config;

            let commandButton = make.button('!'+config.command, '!' + config.command + ' config command|?{Command (without !)}', styles.button + styles.float.right);

            let listItems = [
                '<span style="'+styles.float.left+'">Command:</span> ' + commandButton,
            ];

            let resetButton = make.button('Reset', '!' + config.command + ' reset', styles.button + styles.fullWidth);

            let title_text = (first) ? script_name + ' First Time Setup' : script_name + ' Config';
            message = (message) ? '<p>'+message+'</p>' : '';
            let contents = message+make.list(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+config.command+' config`.</p><hr>'+resetButton;
            make.menu(contents, title_text, 'gm');
        },
    },

    message = {
        error = (message, whisper='gm', style='border-color: red; color: red;') => {
            make.menu(message, '', whisper, style);
        },

        normal = (message, whisper='gm', style='') => {
            make.menu(message, '', whisper, style)
        },

        success = (message, whisper='gm', style='border-color: green; color: green;') => {
            make.menu(message, '', whisper, style)
        },
    },

    make = {
        menu = (contents, title, whisper, style='') => {
            title = (title && title != '') ? make.title(title) : '';
            whisper = (whisper && whisper !== '') ? '/w ' + whisper + ' ' : '';
            sendChat(script_name, whisper + '<div style="'+styles.menu+styles.overflow+style+'">'+title+contents+'</div>', null, {noarchive:true});
        },

        title = (title) => {
            return '<h3 style="margin-bottom: 10px;">'+title+'</h3>';
        },

        button = (title, href, style) => {
            return '<a style="'+style+'" href="'+href+'">'+title+'</a>';
        },

        list = (items, listStyle, itemStyle) => {
            let list = '<ul style="'+listStyle+'">';
            items.forEach((item) => {
                list += '<li style="'+itemStyle+'">'+item+'</li>';
            });
            list += '</ul>';
            return list;
        },
    },

    checkInstall = () => {
        if(!_.has(state, state_name)){
            state[state_name] = state[state_name] || {};
        }
        setDefaults();

        log(script_name + ' Ready! Command: !'+state[state_name].config.command);
        if(state[state_name].debug){ make.menu(script_name + ' Ready! Debug On.', '', 'gm') }
    },

    registerEventHandlers = () => {
        on('chat:message', handleInput);
    },

    setDefaults = (reset) => {
        const defaults = {
            config: {
                command: 'template'
            },
            debug: false
        };

        if(!state[state_name].debug){
            state[state_name].debug = defaults.debug;
        }

        if(!state[state_name].config){
            state[state_name].config = defaults.config;
        }else{
            if(!state[state_name].config.hasOwnProperty('command')){
                state[state_name].config.command = defaults.config.command;
            }
        }

        if(!state[state_name].config.hasOwnProperty('firsttime') && !reset){
            config_menus.main(true);
            state[state_name].config.firsttime = false;
        }
    };

    return {
        checkInstall,
        registerEventHandlers
    }
})();

on('ready',function() {
    'use strict';

    Template.checkInstall();
    Template.registerEventHandlers();
});