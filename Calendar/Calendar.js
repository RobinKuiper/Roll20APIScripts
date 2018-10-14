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

// TODO USE ARRAYS?

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
            name, stripped_name, id,
            weatherId, textId, month, what;

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

                            switch(key){
                                case 'month':
                                    config_menus.sendMonthsConfigMenu();
                                    return;
                                break;

                                case 'season':
                                    config_menus.sendSeasonsConfigMenu();
                                    return;
                                break;

                                case 'holiday':
                                    config_menus.sendHolidaysConfigMenu();
                                    return;
                                break;

                                case 'weather':
                                    config_menus.sendWeatherConfigMenu();
                                    return;
                                break;
                            }

                            let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                            state[state_name].config[key] = value;
                        }

                        sendConfigMenu();
                    break;

                    case 'single-item-config':
                        what = args.shift();
                        id = args.shift();

                        if(!id || !what){
                            sendError('No valid id was given.');
                            return;
                        }

                        if(args.length > 0){
                            let setting = args.shift().split('|');
                            let key = setting.shift();
                            let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                            state[state_name].calendar[what][id][key] = value;
                        }

                        config_menus[what+'SingleConfigMenu'](id);
                    break;

                    case 'new':
                        what = args.shift();
                        name = args.shift();

                        if(!name || !what){
                            sendError('Something went wrong, please try again.');
                            return;
                        }

                        switch(what){
                            case 'month':
                                state[state_name].calendar.months.push({
                                    name,
                                    days: 0,
                                    avg_temp: 10,
                                    weather_type: 0
                                });
    
                                config_menus.sendMonthsConfigMenu();
                                return;
                            break;

                            case 'season':
                                let months = args.shift();
                                state[state_name].calendar.seasons.push({ name, months });

                                config_menus.sendSeasonsConfigMenu();
                                return;
                            break;

                            case 'holiday':
                                state[state_name].calendar.holidays.push({
                                    name,
                                    day: 1,
                                    month: '&nbsp;'
                                });

                                config_menus.sendHolidaysConfigMenu();
                            break;

                            case 'weather':
                                state[state_name].calendar.weather_types.push({
                                    name,
                                    texts: []
                                });

                                config_menus.sendWeatherConfigMenu();
                            break;
                        }
                    break;

                    case 'create-weather-text':
                        weatherId = args.shift();
                        let text = args.join(' ');

                        if(!state[state_name].calendar.weather_types[weatherId]){
                            sendError('Weather Type not found.');
                            return;
                        }

                        state[state_name].calendar.weather_types[weatherId].texts.push(text);

                        config_menus.weather_typesSingleConfigMenu(weatherId);
                    break;

                    case 'change-weather-text':
                        weatherId = args.shift();
                        textId = args.shift();
                        let newText = args.join(' ');

                        if(!state[state_name].calendar.weather_types[weatherId]){
                            sendError('Weather Type not found.');
                            return;
                        }
                        if(!state[state_name].calendar.weather_types[weatherId].texts.length || !state[state_name].calendar.weather_types[weatherId].texts[textId]){
                            sendError('Selected text does not exist.');
                            return;
                        }
                        if(newText === ''){
                            // TODO: DO REMOVE?
                        }

                        state[state_name].calendar.weather_types[weatherId].texts[textId] = newText;

                        config_menus.weather_typesSingleConfigMenu(weatherId);
                    break;

                    case 'delete-weather-text':
                        weatherId = args.shift();
                        textId = args.shift();

                        if(!state[state_name].calendar.weather_types[weatherId]){
                            sendError('Weather Type not found.');
                            return;
                        }
                        if(!state[state_name].calendar.weather_types[weatherId].texts.length || !state[state_name].calendar.weather_types[weatherId].texts[textId]){
                            sendError('Selected text does not exist.');
                            return;
                        }

                        state[state_name].calendar.weather_types[weatherId].texts.splice(textId, 1);

                        config_menus.weather_typesSingleConfigMenu(weatherId);
                    break;

                    case 'current':
                        if(args.length > 0){
                            let setting = args.shift().split('|');
                            let key = setting.shift();
                            let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                            if(key === 'day'){
                                advanceDay(value-state[state_name].calendar.current.day);
                                sendMenu();
                                return;
                            }

                            state[state_name].calendar.current[key] = value;
                        }

                        sendMenu();
                    break;

                    case 'advance-day':
                        advanceDay();
                    break;

                    case 'menu':
                        sendMenu();
                    break;

                    case 'send':
                        let monthId = state[state_name].calendar.current.month,
                            day = state[state_name].calendar.current.day;
                        month = state[state_name].calendar.months[monthId];

                        let calText = generateTable(month.days, day) + " \
                            <p>Today is " + month.name + ' ' + day + '.</p> \
                            <hr> \
                            <b>Weather</b><br> \
                            ' + state[state_name].calendar.current.weather;

                        makeAndSendMenu(calText, script_name);
                    break;

                    default:
                        sendMenu();
                    break;
                }
            }
        }
    },

    generateTable = (totalDays, currentDay) => {
        let table = '<table border="1" style="'+styles.fullWidth+'">';
        for(let i = 0; i < Math.ceil(totalDays/7); i++){
            table += '<tr>';
            for(let j = 1; j <= 7; j++){
                let dayGen = ((7*i)+j);
                let dayStyle = (dayGen === currentDay) ? 'font-weight: bold; color: green;' : '';
                if(totalDays < dayGen) break;
                table += '<td style="'+dayStyle+'">'+dayGen+'</td>'
            }
            table += '</tr>';
        }
        table += '</table>';

        return table;
    },

    advanceDay = (days=1) => {
        let newDay = getCurrentDay()+days;

        if(newDay > getMonth().days){
            if(state[state_name].calendar.months[getCurrentMonthId() + 1]){
                state[state_name].calendar.current.month++;
            }else{
                state[state_name].calendar.current.month = 0;
            }
            state[state_name].calendar.current.day = 1;
        }else if(newDay <= 0){
            if(state[state_name].calendar.months[getCurrentMonthId() - 1]){
                state[state_name].calendar.current.month--;
            }else{
                state[state_name].calendar.current.month = state[state_name].calendar.months.length-1;
            }
        }else{
            state[state_name].calendar.current.day = newDay;
        }

        state[state_name].calendar.current.weather = getWeather(getMonth().weather_type);

        sendMenu();
    },

    getMonth = (monthId=getCurrentMonthId()) => {
        return state[state_name].calendar.months[monthId];
    },

    getCurrentMonthId = () => {
        return state[state_name].calendar.current.month;
    },

    getCurrentDay = () => {
        return state[state_name].calendar.current.day;
    },

    getWeather = (weather_type) => {
        let weather = state[state_name].calendar.weather_types[weather_type];

        let randomNumber = Math.floor(Math.random() * weather.texts.length) + 0; 

        return weather.texts[randomNumber];
    },

    sendMenu = () => {
        // TODO: No month check

        let monthsDropdown = '?{Month';
        state[state_name].calendar.months.forEach((month, key) => {
            monthsDropdown += '|'+month.name+','+key
        })
        monthsDropdown += '}';

        let currentDayButton = makeButton(state[state_name].calendar.current.day, '!' + state[state_name].config.command + ' current day|?{Day|'+state[state_name].calendar.current.day+'}', styles.button + styles.float.right),
            currentMonthButton = makeButton(getMonth().name, '!' + state[state_name].config.command + ' current month|'+monthsDropdown, styles.button + styles.float.right);

        let listItems = [
            '<span style="'+styles.float.left+'">Day:</span> ' + currentDayButton,
            '<span style="'+styles.float.left+'">Month:</span> ' + currentMonthButton,
        ];

        let advanceDayButton = makeButton("Advance Day", '!' + state[state_name].config.command + ' advance-day', styles.button);
        let sendToPlayersButton = makeButton("Send to Players", '!' + state[state_name].config.command + ' send', styles.button);

        let contents = generateTable(getMonth().days, getCurrentDay()) + '<hr><b>Weather</b><br>'+state[state_name].calendar.current.weather + '<hr><b>Change</b><br>' + makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+advanceDayButton+sendToPlayersButton;
        makeAndSendMenu(contents, script_name + ' Menu', 'gm');
    },

    sendConfigMenu = (first, message) => {
        let commandButton = makeButton('!'+state[state_name].config.command, '!' + state[state_name].config.command + ' config command|?{Command (without !)}', styles.button + styles.float.right);

        let listItems = [
            '<span style="'+styles.float.left+'">Command:</span> ' + commandButton,
        ];

        let monthsConfigButton = makeButton('Months Setup', '!' + state[state_name].config.command + ' config month', styles.button);
        let seasonsConfigButton = makeButton('Seasons Setup', '!' + state[state_name].config.command + ' config season', styles.button);
        let holidaysConfigButton = makeButton('Holidays Setup', '!' + state[state_name].config.command + ' config holiday', styles.button);
        let weatherConfigButton = makeButton('Weather Setup', '!' + state[state_name].config.command + ' config weather', styles.button);
        let resetButton = makeButton('Reset', '!' + state[state_name].config.command + ' reset', styles.button + styles.fullWidth);

        let title_text = (first) ? script_name + ' First Time Setup' : script_name + ' Config';
        message = (message) ? '<p>'+message+'</p>' : '';
        let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+monthsConfigButton+'<br>'+seasonsConfigButton+'<br>'+holidaysConfigButton+'<br>'+weatherConfigButton+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+state[state_name].config.command+' config`.</p><hr>'+resetButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    config_menus = {
        sendSeasonsConfigMenu: (message) => {
            let listItems = [];

            let seasons = state[state_name].calendar.seasons;
            for (let [key, value] of Object.entries(seasons)) { 
                listItems.push(makeButton(value.name + ' (' + value.months + ')', '!' + state[state_name].config.command + ' single-item-config seasons ' + key, styles.textButton));
            }

            let newButton = makeButton('Add New', '!' + state[state_name].config.command + ' new season ?{Name} ?{Months|1-3}', styles.button);
            let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' config', styles.button + styles.fullWidth);

            let title_text = script_name + ' Seasons Config';
            message = (message) ? '<p>'+message+'</p>' : '';
            let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+newButton+'<hr>'+backButton;
            makeAndSendMenu(contents, title_text, 'gm');
        },

        seasonsSingleConfigMenu: (key) => {
            if(!key || (!state[state_name].calendar.seasons[key])){
                makeAndSendMenu('No valid season was given. Please create one.', '', 'gm');
                return;
            }

            let season = state[state_name].calendar.seasons[key];

            // TODO: Change months with dropdown and multiple month selection.

            let nameButton = makeButton(season.name, '!' + state[state_name].config.command + ' single-item-config seasons ' + key + ' name|?{Name|'+season.name+'}', styles.button + styles.float.right),
                monthsButton = makeButton(season.months, '!' + state[state_name].config.command + ' single-item-config seasons ' + key + ' months|?{Months|'+season.days+'}', styles.button + styles.float.right);

            let listItems = [
                '<span style="'+styles.float.left+'">Name:</span> ' + nameButton,
                '<span style="'+styles.float.left+'">Months:</span> ' + monthsButton
            ];

            let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' config season', styles.button + styles.fullWidth);

            let title_text = script_name + ' ' + season.name + ' Config';
            let contents = makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+backButton;
            makeAndSendMenu(contents, title_text, 'gm');
        },

        sendMonthsConfigMenu: (message) => {
            let listItems = [];

            let months = state[state_name].calendar.months;
            for (let [key, value] of Object.entries(months)) { 
                listItems.push(makeButton(value.name + ' (' + value.days + ')', '!' + state[state_name].config.command + ' single-item-config months ' + key, styles.textButton));
            }

            let newButton = makeButton('Add New', '!' + state[state_name].config.command + ' new month ?{Name}', styles.button);
            let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' config', styles.button + styles.fullWidth);

            let title_text = script_name + ' Months Config';
            message = (message) ? '<p>'+message+'</p>' : '';
            let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+newButton+'<hr>'+backButton;
            makeAndSendMenu(contents, title_text, 'gm');
        },

        sendMonthsConfigMenu: (message) => {
            let listItems = [];

            let months = state[state_name].calendar.months;
            for (let [key, value] of Object.entries(months)) { 
                listItems.push(makeButton(value.name + ' (' + value.days + ')', '!' + state[state_name].config.command + ' single-item-config months ' + key, styles.textButton));
            }

            let newButton = makeButton('Add New', '!' + state[state_name].config.command + ' new month ?{Name}', styles.button);
            let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' config', styles.button + styles.fullWidth);

            let title_text = script_name + ' Months Config';
            message = (message) ? '<p>'+message+'</p>' : '';
            let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+newButton+'<hr>'+backButton;
            makeAndSendMenu(contents, title_text, 'gm');
        },

        monthsSingleConfigMenu: (key) => {
            if(!key || (!state[state_name].calendar.months[key])){
                makeAndSendMenu('No valid month was given. Please create one.', '', 'gm');
                return;
            }

            let month = state[state_name].calendar.months[key];

            // TODO: No weather_types check

            let weatherTypeDropdown = '?{Weather Type';
            state[state_name].calendar.weather_types.forEach((weather, key) => {
                weatherTypeDropdown += '|'+weather.name+','+key
            })
            weatherTypeDropdown += '}';

            let nameButton = makeButton(month.name, '!' + state[state_name].config.command + ' single-item-config months ' + key + ' name|?{Name|'+month.name+'}', styles.button + styles.float.right),
                daysButton = makeButton(month.days, '!' + state[state_name].config.command + ' single-item-config months ' + key + ' days|?{days|'+month.days+'}', styles.button + styles.float.right),
                avgTempButton = makeButton(month.avg_temp, '!' + state[state_name].config.command + ' single-item-config months ' + key + ' avg_temp|?{avg_temp|'+month.avg_temp+'}', styles.button + styles.float.right),
                weatherTypeButton = makeButton(state[state_name].calendar.weather_types[month.weather_type].name, '!' + state[state_name].config.command + ' single-item-config months ' + key + ' weather_type|'+weatherTypeDropdown, styles.button + styles.float.right);

            let listItems = [
                '<span style="'+styles.float.left+'">Name:</span> ' + nameButton,
                '<span style="'+styles.float.left+'">Day:</span> ' + daysButton,
                '<span style="'+styles.float.left+'">Avg. Temp:</span> ' + avgTempButton,
                '<span style="'+styles.float.left+'">Weather Type:</span> ' + weatherTypeButton,
            ];

            let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' config month', styles.button + styles.fullWidth);

            let title_text = script_name + ' ' + month.name + ' Config';
            let contents = makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+backButton;
            makeAndSendMenu(contents, title_text, 'gm');
        },

        sendHolidaysConfigMenu: (message) => {
            let listItems = [];

            let holidays = state[state_name].calendar.holidays;
            for (let [key, value] of Object.entries(holidays)) { 
                listItems.push(makeButton(value.name + ' (' + value.month + '/' + value.day + ')', '!' + state[state_name].config.command + ' single-item-config holidays ' + key, styles.textButton));
            }

            let newButton = makeButton('Add New', '!' + state[state_name].config.command + ' new holiday ?{Name}', styles.button);
            let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' config', styles.button + styles.fullWidth);

            let title_text = script_name + ' Holidays Config';
            message = (message) ? '<p>'+message+'</p>' : '';
            let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+newButton+'<hr>'+backButton;
            makeAndSendMenu(contents, title_text, 'gm');
        },

        holidaysSingleConfigMenu: (key) => {
            if(!key || (!state[state_name].calendar.holidays[key])){
                makeAndSendMenu('No valid holiday was given. Please create one.', '', 'gm');
                return;
            }

            let holiday = state[state_name].calendar.holidays[key];

            // TODO: No month check

            let monthsDropdown = '?{Month';
            state[state_name].calendar.months.forEach((month, key) => {
                monthsDropdown += '|'+month.name+','+key
            })
            monthsDropdown += '}';

            let nameButton = makeButton(holiday.name, '!' + state[state_name].config.command + ' single-item-config holidays ' + key + ' name|?{Name|'+holiday.name+'}', styles.button + styles.float.right),
                dayButton = makeButton(holiday.day, '!' + state[state_name].config.command + ' single-item-config holidays ' + key + ' day|?{Day|'+holiday.day+'}', styles.button + styles.float.right),
                monthButton = makeButton(state[state_name].calendar.months[holiday.month].name, '!' + state[state_name].config.command + ' single-item-config holidays ' + key + ' month|'+monthsDropdown, styles.button + styles.float.right);

            let listItems = [
                '<span style="'+styles.float.left+'">Name:</span> ' + nameButton,
                '<span style="'+styles.float.left+'">Day:</span> ' + dayButton,
                '<span style="'+styles.float.left+'">Month:</span> ' + monthButton,
            ];

            let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' config holiday', styles.button + styles.fullWidth);

            let title_text = script_name + ' ' + holiday.name + ' Config';
            let contents = makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+backButton;
            makeAndSendMenu(contents, title_text, 'gm');
        },

        sendWeatherConfigMenu: (message) => {
            let listItems = [];

            let weather_types = state[state_name].calendar.weather_types;
            for (let [key, value] of Object.entries(weather_types)) { 
                listItems.push(makeButton(value.name + ' (' + value.texts.length + ')', '!' + state[state_name].config.command + ' single-item-config weather_types ' + key, styles.textButton));
            }

            let newButton = makeButton('Add New', '!' + state[state_name].config.command + ' new weather ?{Name}', styles.button);
            let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' config', styles.button + styles.fullWidth);

            let title_text = script_name + ' Weather Config';
            message = (message) ? '<p>'+message+'</p>' : '';
            let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+newButton+'<hr>'+backButton;
            makeAndSendMenu(contents, title_text, 'gm');
        },

        weather_typesSingleConfigMenu: (key) => {
            if(!key || (!state[state_name].calendar.weather_types[key])){
                makeAndSendMenu('No valid weather type was given. Please create one.', '', 'gm');
                return;
            }

            let weather = state[state_name].calendar.weather_types[key];

            let nameButton = makeButton(weather.name, '!' + state[state_name].config.command + ' single-item-config weather_types ' + key + ' name|?{Name|'+weather.name+'}', styles.button + styles.float.right);

            let listItems = [
                '<span style="'+styles.float.left+'">Name:</span> ' + nameButton,
            ];

            let textListItems = [];
            state[state_name].calendar.weather_types[key].texts.forEach((text, i) => {
                let button = makeButton(handleLongString(text, 25), '!' + state[state_name].config.command + ' change-weather-text ' + key + ' ' + i + ' ?{Text|'+text+'}', styles.textButton + styles.float.left);
                let deleteButton = makeButton('<img src="https://s3.amazonaws.com/files.d20.io/images/11381509/YcG-o2Q1-CrwKD_nXh5yAA/thumb.png?1439051579" />', '!' + state[state_name].config.command + ' delete-weather-text ' + key + ' ' + i, styles.button + styles.float.right + 'width: 16px; height: 16px;');
                textListItems.push(button + deleteButton);
            });


            let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' config weather', styles.button + styles.fullWidth);
            let newTextbutton = makeButton('Add Text', '!'+state[state_name].config.command + ' create-weather-text ' + key + ' ?{Text}', styles.button);

            let title_text = script_name + ' ' + weather.name + ' Config';
            let contents = makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+makeList(textListItems, styles.reset + styles.list + styles.overflow, styles.overflow)+newTextbutton+'<hr>'+backButton;
            makeAndSendMenu(contents, title_text, 'gm');
        },
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

    handleLongString = (str, max=8) => {
        return (str.length > max) ? str.slice(0, max) + '...' : str;
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
                current: {
                    month: 0,
                    day: 1,
                    weather: 0
                },
                months: [
                    { name: "Januari", days: 31, avg_temp: 10, weather_type: 0 },
                    { name: "Februari", days: 28, avg_temp: 10, weather_type: 1 },
                ],
                seasons: [
                    { name: "Winter", months: "1-3" }
                ],
                leap: {
                    year: 4,
                    month: 2
                },
                holidays: {
                    party: { name: "PARTY", month: 0, day: 2 }
                },
                weather_types: [
                    {
                        name: 'Rainy',
                        texts: [
                            "It's a light rainy day outside.",
                        ],
                    },
                    {
                        name: 'Dry',
                        texts: [
                            "Dry.",
                        ],
                    },
                ]
            }
        };

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
            if(!state[state_name].calendar.hasOwnProperty('current')){
                state[state_name].calendar.current = defaults.calendar.current;
            }else{
                if(!state[state_name].calendar.current.hasOwnProperty('day')){
                    state[state_name].calendar.current.day = defaults.calendar.current.day;
                }
                if(!state[state_name].calendar.current.hasOwnProperty('month')){
                    state[state_name].calendar.current.month = defaults.calendar.current.month;
                }
            }
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