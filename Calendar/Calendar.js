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

        let nameChange = false,
            name, stripped_name;

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

                    case 'seasons-config':
                        sendSeasonsConfigMenu();
                    break;

                    case 'single-season-config':
                        let season = args.shift();

                        if(!season){
                            makeAndSendMenu('No season was given.', '', 'gm');
                            return;
                        }

                        if(args.length > 0){
                            let setting = args.shift().split('|');
                            let key = setting.shift();
                            let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                            if(key === "name"){
                                nameChange = true;
                                stripped_name = strip(value).toLowerCase();
                                state[state_name].calendar.seasons[stripped_name] = state[state_name].calendar.seasons[month];
                                state[state_name].calendar.seasons[stripped_name].name = value;
                                delete state[state_name].calendar.seasons[season]
                            }else{
                                state[state_name].calendar.months[seasons][key] = value;
                            }
                        }

                        sendSingleSeasonConfigMenu((nameChange) ? stripped_name : season);
                    break;

                    case 'new-season':
                        name = args.shift();
                        let months = args.shift();

                        if(!name || state[state_name].calendar.seasons[strip(name).toLowerCase()]){
                            makeAndSendMenu('No name was given or name already exists.', '');
                            return;
                        }

                        stripped_name = strip(name).toLowerCase();

                        state[state_name].calendar.seasons[stripped_name] = { name, months }

                        sendSingleSeasonConfigMenu(stripped_name);
                    break;

                    case 'months-config':
                        sendMonthsConfigMenu();
                    break;

                    case 'single-month-config':
                        let month = args.shift();

                        if(!month){
                            makeAndSendMenu('No month was given.', '', 'gm');
                            return;
                        }

                        if(args.length > 0){
                            let setting = args.shift().split('|');
                            let key = setting.shift();
                            let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                            if(key === "name"){
                                nameChange = true;
                                stripped_name = strip(value).toLowerCase();
                                state[state_name].calendar.months[stripped_name] = state[state_name].calendar.months[month];
                                state[state_name].calendar.months[stripped_name].name = value;
                                delete state[state_name].calendar.months[month]
                            }else{
                                state[state_name].calendar.months[month][key] = value;
                            }
                        }

                        sendSingleMonthConfigMenu((nameChange) ? stripped_name : month);
                    break;

                    case 'new-month':
                        name = args.shift();

                        if(!name || state[state_name].calendar.months[strip(name).toLowerCase()]){
                            makeAndSendMenu('No name was given or name already exists.', '');
                            return;
                        }

                        state[state_name].calendar.months[strip(name).toLowerCase()] = {
                            name,
                            days: 0,
                            avg_temp: 10,
                            weather_type: 'Dry'
                        }

                        sendSingleMonthConfigMenu(strip(name).toLowerCase());
                    break;

                    case 'holidays-config':
                        sendHolidaysConfigMenu();
                    break;

                    case 'single-holiday-config':
                        let holiday = args.shift();

                        if(!holiday){
                            makeAndSendMenu('No holiday was given.', '', 'gm');
                            return;
                        }

                        if(args.length > 0){
                            let setting = args.shift().split('|');
                            let key = setting.shift();
                            let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                            log(key + ': ' + value)

                            if(key === "name"){
                                nameChange = true;
                                stripped_name = strip(value).toLowerCase();
                                state[state_name].calendar.holidays[stripped_name] = state[state_name].calendar.holidays[holiday];
                                state[state_name].calendar.holidays[stripped_name].name = value;
                                delete state[state_name].calendar.holidays[holiday]
                            }else{
                                state[state_name].calendar.holidays[holiday][key] = value;
                            }
                        }

                        sendSingleHolidayConfigMenu((nameChange) ? stripped_name : holiday);
                    break;

                    case 'new-holiday':
                        name = args.shift();

                        if(!name || state[state_name].calendar.holidays[strip(name).toLowerCase()]){
                            sendError('No name was given or name already exists.', 'gm');
                            return;
                        }

                        state[state_name].calendar.holidays[strip(name).toLowerCase()] = {
                            name,
                            day: 1,
                            month: '&nbsp;'
                        }

                        sendSingleHolidayConfigMenu(strip(name).toLowerCase());
                    break;

                    case 'weather-config':
                        sendWeatherConfigMenu();
                    break;

                    case 'single-weather-config':
                        let weather = args.shift();

                        if(!weather){
                            sendError('No weather was given.', 'gm');
                            return;
                        }

                        if(args.length > 0){
                            let setting = args.shift().split('|');
                            let key = setting.shift();
                            let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                            log(key + ': ' + value)

                            if(key === "name"){
                                nameChange = true;
                                stripped_name = strip(value).toLowerCase();
                                state[state_name].calendar.weather_types[stripped_name] = state[state_name].calendar.weather_types[weather];
                                state[state_name].calendar.weather_types[stripped_name].name = value;
                                delete state[state_name].calendar.weather_types[weather]
                            }else{
                                state[state_name].calendar.weather_types[weather][key] = value;
                            }
                        }

                        sendSingleWeatherConfigMenu((nameChange) ? stripped_name : weather);
                    break;

                    case 'new-weather':
                        name = args.shift();

                        if(!name || state[state_name].calendar.weather_types[strip(name).toLowerCase()]){
                            sendError('No name was given or name already exists.', 'gm');
                            return;
                        }

                        state[state_name].calendar.weather_types[strip(name).toLowerCase()] = {
                            name,
                            texts: []
                        }

                        sendSingleWeatherConfigMenu(strip(name).toLowerCase());
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
        let seasonsConfigButton = makeButton('Seasons Setup', '!' + state[state_name].config.command + ' seasons-config', styles.button);
        let holidaysConfigButton = makeButton('Holidays Setup', '!' + state[state_name].config.command + ' holidays-config', styles.button);
        let weatherConfigButton = makeButton('Weather Setup', '!' + state[state_name].config.command + ' weather-config', styles.button);
        let resetButton = makeButton('Reset', '!' + state[state_name].config.command + ' reset', styles.button + styles.fullWidth);

        let title_text = (first) ? script_name + ' First Time Setup' : script_name + ' Config';
        message = (message) ? '<p>'+message+'</p>' : '';
        let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+monthsConfigButton+'<br>'+seasonsConfigButton+'<br>'+holidaysConfigButton+'<br>'+weatherConfigButton+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+state[state_name].config.command+' config`.</p><hr>'+resetButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    sendSeasonsConfigMenu = (message) => {
        let listItems = [];

        let seasons = state[state_name].calendar.seasons;
        for (let [key, value] of Object.entries(seasons)) { 
            listItems.push(makeButton(value.name + ' (' + value.months + ')', '!' + state[state_name].config.command + ' single-season-config ' + strip(value.name).toLowerCase(), styles.textButton));
        }

        let newButton = makeButton('Add New', '!' + state[state_name].config.command + ' new-season ?{Name} ?{Months|1-3}', styles.button);
        let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' config', styles.button + styles.fullWidth);

        let title_text = script_name + ' Seasons Config';
        message = (message) ? '<p>'+message+'</p>' : '';
        let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+newButton+'<hr>'+backButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    sendSingleSeasonConfigMenu = (season) => {
        let stripped_name = strip(season).toLowerCase()

        if(!season || (!state[state_name].calendar.seasons[stripped_name])){
            makeAndSendMenu('No valid season was given. Please create one.', '', 'gm');
            return;
        }

        season = state[state_name].calendar.seasons[stripped_name];

        // TODO: Change months with dropdown and multiple month selection.

        let nameButton = makeButton(season.name, '!' + state[state_name].config.command + ' single-season-config ' + stripped_name + ' name|?{Name|'+season.name+'}', styles.button + styles.float.right),
            monthsButton = makeButton(season.months, '!' + state[state_name].config.command + ' single-season-config ' + stripped_name + ' months|?{Months|'+season.days+'}', styles.button + styles.float.right);

        let listItems = [
            '<span style="'+styles.float.left+'">Name:</span> ' + nameButton,
            '<span style="'+styles.float.left+'">Months:</span> ' + monthsButton
        ];

        let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' seasons-config', styles.button + styles.fullWidth);

        let title_text = script_name + ' ' + season.name + ' Config';
        let contents = makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+backButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    sendMonthsConfigMenu = (message) => {
        let listItems = [];

        let months = state[state_name].calendar.months;
        for (let [key, value] of Object.entries(months)) { 
            listItems.push(makeButton(value.name + ' (' + value.days + ')', '!' + state[state_name].config.command + ' single-month-config ' + strip(value.name).toLowerCase(), styles.textButton));
        }

        let newButton = makeButton('Add New', '!' + state[state_name].config.command + ' new-month ?{Name}', styles.button);
        let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' config', styles.button + styles.fullWidth);

        let title_text = script_name + ' Months Config';
        message = (message) ? '<p>'+message+'</p>' : '';
        let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+newButton+'<hr>'+backButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    sendSingleMonthConfigMenu = (month) => {
        let stripped_name = strip(month).toLowerCase()

        if(!month || (!state[state_name].calendar.months[stripped_name])){
            makeAndSendMenu('No valid months was given. Please create one.', '', 'gm');
            return;
        }

        month = state[state_name].calendar.months[stripped_name];

        // TODO: No month check

        let weatherTypeDropdown = '?{Month';
        Object.keys(state[state_name].calendar.weather_types).forEach((key) => {
            weatherTypeDropdown += '|'+state[state_name].calendar.weather_types[key].name+','+key
        })
        weatherTypeDropdown += '}';

        let nameButton = makeButton(month.name, '!' + state[state_name].config.command + ' single-month-config ' + stripped_name + ' name|?{Name|'+month.name+'}', styles.button + styles.float.right),
            daysButton = makeButton(month.days, '!' + state[state_name].config.command + ' single-month-config ' + stripped_name + ' days|?{days|'+month.days+'}', styles.button + styles.float.right),
            avgTempButton = makeButton(month.avg_temp, '!' + state[state_name].config.command + ' single-month-config ' + stripped_name + ' avg_temp|?{avg_temp|'+month.avg_temp+'}', styles.button + styles.float.right),
            weatherTypeButton = makeButton(month.weather_type, '!' + state[state_name].config.command + ' single-month-config ' + stripped_name + ' weather_type|'+weatherTypeDropdown, styles.button + styles.float.right);

        let listItems = [
            '<span style="'+styles.float.left+'">Name:</span> ' + nameButton,
            '<span style="'+styles.float.left+'">Day:</span> ' + daysButton,
            '<span style="'+styles.float.left+'">Avg. Temp:</span> ' + avgTempButton,
            '<span style="'+styles.float.left+'">Weather Type:</span> ' + weatherTypeButton,
        ];

        let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' months-config', styles.button + styles.fullWidth);

        let title_text = script_name + ' ' + month.name + ' Config';
        let contents = makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+backButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    sendHolidaysConfigMenu = (message) => {
        let listItems = [];

        let holidays = state[state_name].calendar.holidays;
        for (let [key, value] of Object.entries(holidays)) { 
            listItems.push(makeButton(value.name + ' (' + value.month + '/' + value.day + ')', '!' + state[state_name].config.command + ' single-holiday-config ' + strip(value.name).toLowerCase(), styles.textButton));
        }

        let newButton = makeButton('Add New', '!' + state[state_name].config.command + ' new-holiday ?{Name}', styles.button);
        let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' config', styles.button + styles.fullWidth);

        let title_text = script_name + ' Holidays Config';
        message = (message) ? '<p>'+message+'</p>' : '';
        let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+newButton+'<hr>'+backButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    sendSingleHolidayConfigMenu = (holiday) => {
        let stripped_name = strip(holiday).toLowerCase()

        if(!holiday || (!state[state_name].calendar.holidays[stripped_name])){
            makeAndSendMenu('No valid holiday was given. Please create one.', '', 'gm');
            return;
        }

        holiday = state[state_name].calendar.holidays[stripped_name];

        // TODO: No month check

        let monthsDropdown = '?{Month';
        Object.keys(state[state_name].calendar.months).forEach((key) => {
            monthsDropdown += '|'+state[state_name].calendar.months[key].name+','+key
        })
        monthsDropdown += '}';

        let nameButton = makeButton(holiday.name, '!' + state[state_name].config.command + ' single-holiday-config ' + stripped_name + ' name|?{Name|'+holiday.name+'}', styles.button + styles.float.right),
            dayButton = makeButton(holiday.day, '!' + state[state_name].config.command + ' single-holiday-config ' + stripped_name + ' day|?{Day|'+holiday.day+'}', styles.button + styles.float.right),
            monthButton = makeButton(holiday.month, '!' + state[state_name].config.command + ' single-holiday-config ' + stripped_name + ' month|'+monthsDropdown, styles.button + styles.float.right);

        let listItems = [
            '<span style="'+styles.float.left+'">Name:</span> ' + nameButton,
            '<span style="'+styles.float.left+'">Day:</span> ' + dayButton,
            '<span style="'+styles.float.left+'">Month:</span> ' + monthButton,
        ];

        let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' holidays-config', styles.button + styles.fullWidth);

        let title_text = script_name + ' ' + holiday.name + ' Config';
        let contents = makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+backButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    sendWeatherConfigMenu = (message) => {
        let listItems = [];

        let weather_types = state[state_name].calendar.weather_types;
        for (let [key, value] of Object.entries(weather_types)) { 
            listItems.push(makeButton(value.name + ' (' + value.texts.length + ')', '!' + state[state_name].config.command + ' single-weather-config ' + strip(value.name).toLowerCase(), styles.textButton));
        }

        let newButton = makeButton('Add New', '!' + state[state_name].config.command + ' new-weather ?{Name}', styles.button);
        let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' config', styles.button + styles.fullWidth);

        let title_text = script_name + ' Weather Config';
        message = (message) ? '<p>'+message+'</p>' : '';
        let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+newButton+'<hr>'+backButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    sendSingleWeatherConfigMenu = (weather) => {
        let stripped_name = strip(weather).toLowerCase()

        if(!weather || (!state[state_name].calendar.weather_types[stripped_name])){
            makeAndSendMenu('No valid weather type was given. Please create one.', '', 'gm');
            return;
        }

        weather = state[state_name].calendar.weather_types[stripped_name];

        let nameButton = makeButton(weather.name, '!' + state[state_name].config.command + ' single-weather-config ' + stripped_name + ' name|?{Name|'+weather.name+'}', styles.button + styles.float.right);

        let listItems = [
            '<span style="'+styles.float.left+'">Name:</span> ' + nameButton,
        ];

        let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' weather-config', styles.button + styles.fullWidth);

        let title_text = script_name + ' ' + weather.name + ' Config';
        let contents = makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+backButton;
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

    strip = (str) => {
        return str.replace(/[^a-zA-Z0-9]+/g, '_');
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
                    rainy: {
                        name: 'Rainy',
                        texts: [
                            "It's a light rainy day outside.",
                        ],
                    },
                    dry: {
                        name: 'Dry',
                        texts: [
                            "Dry.",
                        ],
                    },
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