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

var Calendar = Calendar || (function() {
    'use strict';

    // Styling for the chat responses.
    const styles = {
        reset: 'padding: 0; margin: 0;',
        menu:  'background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;',
        button: 'background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center;',
        textButton: 'background-color: transparent; border: none; padding: 0; color: #000; text-decoration: underline',
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
    script_name = 'Calendar',
    state_name = 'CALENDAR',

    handleInput = (msg) => {
        if (msg.type != 'api') return;

        // Split the message into command and argument(s)
        let args = msg.content.split(' ');
        let command = args.shift().substring(1);
        let extracommand = args.shift();

        if (command == state[state_name].config.command) {
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

                    case 'months-config':
                        if(args.length > 0){
                            let setting = args.shift().split('|');
                            let key = setting.shift();
                            let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                            state[state_name].config[key] = value;
                        }

                        sendMonthsConfigMenu();
                    break;

                    default:
                        sendConfigMenu();
                    break;
                }
            }
        }
    },

    sendConfigMenu = (first, message) => {
        let commandButton = makeButton('!'+state[state_name].config.command, '!' + state[state_name].config.command + ' config command|?{Command (without !)}', styles.button + styles.float.right);

        let listItems = [
            '<span style="'+styles.float.left+'">Command:</span> ' + commandButton,
        ];

        let monthsConfigButton = makeButton('Months Setup', '!' + state[state_name].config.command + ' months-config', styles.button);
        let resetButton = makeButton('Reset', '!' + state[state_name].config.command + ' reset', styles.button + styles.fullWidth);

        let title_text = (first) ? script_name + ' First Time Setup' : script_name + ' Config';
        message = (message) ? '<p>'+message+'</p>' : '';
        let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+monthsConfigButton+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+state[state_name].config.command+' config`.</p><hr>'+resetButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    sendMonthsConfigMenu = (message) => {
        let listItems = [];

        let months = state[state_name].calendar.months;
        for (let [key, value] of Object.entries(months)) { 
            listItems.push(makeButton(value.name, '#', styles.button));
        }

        let newButton = makeButton('Add New', '#', styles.button);

        let title_text = script_name + ' Months Config';
        message = (message) ? '<p>'+message+'</p>' : '';
        let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+newButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    sendError = (error, whisper='gm') => {
        makeAndSendMenu(error, '', whisper, 'border-color: red; color: red;');
    },

    makeAndSendMenu = (contents, title, whisper, style='') => {
        title = (title && title != '') ? makeTitle(title) : '';
        whisper = (whisper && whisper !== '') ? '/w ' + whisper + ' ' : '';
        sendChat(script_name, whisper + '<div style="'+styles.menu+styles.overflow+style+'">'+title+contents+'</div>', null, {noarchive:true});
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

    checkInstall = () => {
        if(!_.has(state, state_name)){
            state[state_name] = state[state_name] || {};
        }
        setDefaults();

        log(script_name + ' Ready! Command: !'+state[state_name].config.command);
        if(state[state_name].debug){ makeAndSendMenu(script_name + ' Ready! Debug On.', '', 'gm') }
    },

    registerEventHandlers = () => {
        on('chat:message', handleInput);
    },

    setDefaults = (reset) => {
        const defaults = {
            config: {
                command: 'cal'
            },
            calendar:{
                months: {
                    januari: { name: "Januari", days: 31, avg_temp: 10, weather_type: "Rainy" },
                    februari: { name: "Februari", days: 28, avg_temp: 10, weather_type: "Dry" },
                },
                seasons: {
                    winter: { name: "Winter", months: "1-3" }
                },
                leap: {
                    year: 4,
                    month: 2
                },
                holidays: {
                    party: { name: "PARTY", month: 1, day: 2 }
                },
                weather_types: {
                    Rainy: [
                        { text: "It's a light rainy day outside." }
                    ],
                    Dry: [
                        { text: "Dry!" }
                    ]
                }
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
        if(!state[state_name].calendar){
            state[state_name].calendar = defaults.calendar;
        }else{
            if(!state[state_name].calendar.hasOwnProperty('months')){
                state[state_name].calendar.months = defaults.calendar.months;
            }
            if(!state[state_name].calendar.hasOwnProperty('seasons')){
                state[state_name].calendar.seasons = defaults.calendar.seasons;
            }
            if(!state[state_name].calendar.hasOwnProperty('leap')){
                state[state_name].calendar.leap = defaults.calendar.leap;
            }else{
                if(!state[state_name].calendar.leap.hasOwnProperty('year')){
                    state[state_name].calendar.leap.year = defaults.calendar.leap.year;
                }
                if(!state[state_name].calendar.leap.hasOwnProperty('month')){
                    state[state_name].calendar.leap.month = defaults.calendar.leap.month;
                }
            }
            if(!state[state_name].calendar.hasOwnProperty('holidays')){
                state[state_name].calendar.holidays = defaults.calendar.holidays;
            }
            if(!state[state_name].calendar.hasOwnProperty('weather_types')){
                state[state_name].calendar.weather_types = defaults.calendar.weather_types;
            }
        }

        if(!state[state_name].config.hasOwnProperty('firsttime') && !reset){
            sendConfigMenu(true);
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

    Calendar.checkInstall();
    Calendar.registerEventHandlers();
});