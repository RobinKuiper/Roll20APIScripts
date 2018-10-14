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
                        if(args[0].toLowerCase() === "yes"){
                            state[state_name] = {};
                            setDefaults(true);
                            state[state_name].calendar.current.weather = getWeather(getMonth().weather_type);
                            sendConfigMenu();
                        }
                    break;

                    case 'export':
                        jsonExport();
                    break;

                    case 'import':
                        let json;
                        let calendar = msg.content.substring(('!'+state[state_name].config.command+' import ').length);
                        try{
                            json = JSON.parse(calendar);
                        } catch(e) {
                            makeAndSendMenu('This is not a valid JSON string.');
                            return;
                        }
                        state[state_name].calendar = json;
                        sendConfigMenu();
                    break;

                    case 'config':
                        let type = 'config',
                            config_menu = false;

                        if(args.length > 0){
                            if(args[0] === 'export' || args[0] === 'import'){
                                if(args[0] === 'export'){
                                    jsonExport('config');
                                }
                                if(args[0] === 'import'){
                                    let json;
                                    let config = msg.content.substring(('!'+state[state_name].config.command+' config import ').length);
                                    try{
                                        json = JSON.parse(config);
                                    } catch(e) {
                                        makeAndSendMenu('This is not a valid JSON string.');
                                        return;
                                    }
                                    state[state_name].config = json;
                                    sendConfigMenu();
                                }

                                return;
                            }

                            let what = args[0];

                            switch(what){
                                case 'month':
                                    what = args.shift();
                                    config_menu = 'sendMonthsConfigMenu';
                                    type = 'config';
                                break;

                                case 'season':
                                    what = args.shift();
                                    config_menu = 'sendSeasonsConfigMenu';
                                    type = 'config';
                                break;

                                case 'holiday':
                                    what = args.shift();
                                    config_menu = 'sendHolidaysConfigMenu';
                                    type = 'config';
                                break;

                                case 'weather':
                                    what = args.shift();
                                    config_menu = 'sendWeatherConfigMenu';
                                    type = 'config';
                                break;

                                case 'landingpage':
                                    what = args.shift();
                                    config_menu = 'sendLandingpageConfigMenu';
                                    type = 'config';
                                break;

                                default:
                                    what = 'config';
                                    config_menu = 'normal';
                                    type = 'config';
                                break;
                            }

                            if(args.length > 0){
                                let setting = args.shift().split('|');
                                let key = setting.shift();

                                let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                                if(key === 'use_handout' && value) getOrCreateHandout();
                                if(key === 'show_handout_players' && state[state_name].config.use_handout){
                                    let handout = getOrCreateHandout();

                                    handout.set('inplayerjournals', (value) ? 'all' : '');
                                }

                                state[state_name][type][key] = value;
                            }
                        }

                        if(!config_menu || config_menu === 'normal') sendConfigMenu();
                        else config_menus[config_menu]();
                    break;

                    case 'set-text-token':
                        if(!msg.selected || !msg.selected.length || msg.selected.length > 1 || msg.selected[0]._type !== 'text'){
                            sendConfigMenu(false, '<span style="color: red">You should have a <u>text</u> token selected. (<b>Only 1</b>)</span>');
                            return;
                        }

                        state[state_name].config.token = msg.selected[0]._id;

                        setToken();

                        sendConfigMenu(false, '<span style="color: green">Token set!</span>');
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
                            }else if(key === 'month'){
                                changeMonth(value);
                                sendMenu();
                                return;
                            }

                            state[state_name].calendar.current[key] = value;
                        }

                        sendMenu();
                    break;

                    case 'change-weather':
                        state[state_name].calendar.current.weather = getWeather(getMonth().weather_type);

                        sendMenu();
                    break;

                    case 'advance-day':
                        advanceDay();
                        sendMenu();
                    break;

                    case 'menu':
                        sendMenu();
                    break;

                    case 'send':
                        let monthId = state[state_name].calendar.current.month,
                            day = state[state_name].calendar.current.day;
                        month = state[state_name].calendar.months[monthId];

                        let calText = (state[state_name].config.use_table && state[state_name].config.send_table) ? generateTable(month.days, day) : '';
                        calText += "<p>Today is " + getDateString() + '.</p>';
                        calText += (state[state_name].config.use_weather && state[state_name].config.send_weather) ? "<hr><b>Weather</b><br>" + state[state_name].calendar.current.weather : '';

                        makeAndSendMenu(calText, script_name);
                    break;

                    default:
                        sendMenu();
                    break;
                }
            }
        }
    },

    getOrCreateHandout = () => {
        let handout = findObjs({
                type: 'handout',
                name: script_name
            });

        let inplayerjournals = (state[state_name].config.show_handout_players) ? "all" : "";

        handout = (handout && handout[0]) ? handout[0] : createObj("handout", {
            name: script_name,
            inplayerjournals
        });

        log(handout)

        handout.set('notes', generateTable(getMonth().days, getCurrentDay()));

        return handout
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

    changeMonth = (monthId) => {
        if(!state[state_name].calendar.months[monthId]){
            sendError('Month given does not exist.');
            return;
        }

        state[state_name].calendar.current.month = monthId;
        state[state_name].calendar.current.weather = getWeather(getMonth().weather_type);
        state[state_name].calendar.current.day = (getCurrentDay() > getMonth().days) ? 1 : getCurrentDay();

        if(state[state_name].config.use_token) setToken();
        if(state[state_name].config.use_handout) getOrCreateHandout();
    },

    getDateString = () =>{
        return getMonth().name + ' ' + getCurrentDay() + ', ' + getYear();
    },

    advanceDay = (days=1) => {
        let newDay = getCurrentDay()+days;

        if(newDay > getMonth().days){
            if(state[state_name].calendar.months[getCurrentMonthId() + 1]){
                state[state_name].calendar.current.month++;
            }else{
                state[state_name].calendar.current.month = 0;
                state[state_name].calendar.current.year++;
            }
            state[state_name].calendar.current.day = 1;
        }else if(newDay <= 0){
            if(state[state_name].calendar.months[getCurrentMonthId() - 1]){
                state[state_name].calendar.current.month--;
            }else{
                state[state_name].calendar.current.month = state[state_name].calendar.months.length-1;
                state[state_name].calendar.current.year--;
            }
        }else{
            state[state_name].calendar.current.day = newDay;
        }

        state[state_name].calendar.current.weather = getWeather(getMonth().weather_type);

        if(state[state_name].config.use_token) setToken();
        if(state[state_name].config.use_handout) getOrCreateHandout();
    },

    setToken = () => {
        let token = getObj('text', state[state_name].config.token);
        if(token){
            token.set('text', getDateString());
        }
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

    getYear = () => {
        return state[state_name].calendar.current.year;
    },

    getWeather = (weather_type) => {
        let weather = state[state_name].calendar.weather_types[weather_type];

        let randomNumber = Math.floor(Math.random() * weather.texts.length) + 0; 

        return weather.texts[randomNumber];
    },

    getHolidays = (month=getCurrentMonthId(), day=getCurrentDay()) => {
        let holidays = getObjects(state[state_name].calendar.holidays, 'month', month);

        return holidays.filter(holiday => holiday.day === day).map(holiday => holiday);
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
        let changeWeatherButton = makeButton("Change Weather", '!' + state[state_name].config.command + ' change-weather', styles.button + styles.float.right);

        let holidaysText = (getHolidays().length) ? '<hr><b>Holidays</b><br>' : '';
        getHolidays().forEach(holiday => {
            holidaysText += holiday.name + '<br>';
        });

        let contents = (state[state_name].config.use_table) ? generateTable(getMonth().days, getCurrentDay()) : '';
        contents += (state[state_name].config.use_weather) ? '<hr><b>Weather</b><br>'+state[state_name].calendar.current.weather + '<br>' + changeWeatherButton + '<br>' : '';
        contents += (state[state_name].config.use_holidays) ? holidaysText : '';
        contents += '<hr><b>Change</b><br>' + makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow);
        contents += '<hr>'+advanceDayButton+'<br>'+sendToPlayersButton;
        makeAndSendMenu(contents, script_name + ' Menu', 'gm');
    },

    sendConfigMenu = (first, message) => {
        let config = state[state_name].config;

        let commandButton = makeButton('!'+config.command, '!' + config.command + ' config command|?{Command (without !)}', styles.button + styles.float.right),
            useTableButton = makeButton(config.use_table, '!' + config.command + ' config use_table|'+!config.use_table, styles.button + styles.float.right),
            useHandoutButton = makeButton(config.use_handout, '!' + config.command + ' config use_handout|'+!config.use_handout, styles.button + styles.float.right),
            useTokenButton = makeButton(config.use_token, '!' + config.command + ' config use_token|'+!config.use_token, styles.button + styles.float.right);

        let sendTableButton = makeButton(config.send_table, '!' + config.command + ' config send_table|'+!config.send_table, styles.button + styles.float.right);
        let showPlayersHandoutButton = makeButton(config.show_handout_players, '!' + config.command + ' config show_handout_players|'+!config.show_handout_players, styles.button + styles.float.right);
        let setTokenButton = makeButton('Set Token', '!' + config.command + ' set-text-token', styles.button);

        let listItems = [
            '<span style="'+styles.float.left+'">Command:</span> ' + commandButton,
            '<span style="'+styles.float.left+'">Use Text Token:</span> ' + useTokenButton,
            '<span style="'+styles.float.left+'">Use Table:</span> ' + useTableButton,
            '<span style="'+styles.float.left+'">Use Handout:</span> ' + useHandoutButton,
        ];

        if(config.use_table){
            listItems.push('<span style="'+styles.float.left+'">Send Table:</span> ' + sendTableButton);
        }

        if(config.use_handout){
            listItems.push('<span style="'+styles.float.left+'">Show Handout to Players:</span> ' + showPlayersHandoutButton);
        }

        let monthsConfigButton = makeButton('Months Setup', '!' + config.command + ' config month', styles.button);
        let seasonsConfigButton = makeButton('Seasons Setup', '!' + config.command + ' config season', styles.button);
        let holidaysConfigButton = makeButton('Holidays Setup', '!' + config.command + ' config holiday', styles.button);
        let weatherConfigButton = makeButton('Weather Setup', '!' + config.command + ' config weather', styles.button);

        let resetButton = makeButton('Reset', '!' + config.command + ' reset ?{Are you sure? Type Yes}', styles.button + styles.fullWidth + 'background-color: red;');

        let exportConfigButton = makeButton('Export Config', '!' + config.command + ' config export', styles.button + styles.fullWidth);
        let importConfigButton = makeButton('Import Config', '!' + config.command + ' config import ?{Json}', styles.button + styles.fullWidth);

        let exportCalendarButton = makeButton('Export Calendar', '!' + config.command + ' export', styles.button + styles.fullWidth);
        let importCalendarButton = makeButton('Import Calendar', '!' + config.command + ' import ?{Json}', styles.button + styles.fullWidth);

        let buttons = '';

        if(config.use_token){
            buttons += setTokenButton + ' <span style="font-size: 8pt">(Select text token first.)</span><br><br>';
        }

        buttons += monthsConfigButton + '<br>';
        buttons += seasonsConfigButton + '<br>';
        buttons += holidaysConfigButton + '<br>';
        buttons += weatherConfigButton + '<br>';

        let importButtons = exportCalendarButton+importCalendarButton+'<br>'+exportConfigButton+importConfigButton+'<br>'+resetButton;

        let title_text = (first) ? script_name + ' First Time Setup' : script_name + ' Config';
        message = (message) ? '<p style="font-weight: bold">'+message+'</p><hr>' : '';
        let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+buttons+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+config.command+' config`.</p><hr>'+importButtons;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    config_menus = {
        sendSeasonsConfigMenu: (message) => {
            let config = state[state_name].config;

            let useSeasonsButton = makeButton(config.use_seasons, '!' + config.command + ' config season use_seasons|'+!config.use_seasons, styles.button + styles.float.right);

            let settingsListItems = [
                '<span style="'+styles.float.left+'">Use Seasons:</span> ' + useSeasonsButton,
            ]

            let listItems = [];

            let seasons = state[state_name].calendar.seasons;
            for (let [key, value] of Object.entries(seasons)) { 
                listItems.push(makeButton(value.name + ' (' + value.months + ')', '!' + config.command + ' single-item-config seasons ' + key, styles.textButton));
            }

            let newButton = makeButton('Add New', '!' + config.command + ' new season ?{Name} ?{Months|1-3}', styles.button);
            let backButton = makeButton('< Back', '!'+config.command + ' config', styles.button + styles.fullWidth);

            let title_text = script_name + ' Seasons Config';
            message = (message) ? '<p>'+message+'</p>' : '';
            let contents = message+makeList(settingsListItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+newButton+'<hr>'+backButton;
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
            let config = state[state_name].config;

            let useHolidaysButton = makeButton(config.use_holidays, '!' + config.command + ' config holiday use_holidays|'+!config.use_holidays, styles.button + styles.float.right),
                sendHolidaysButton = makeButton(config.send_holidays, '!' + config.command + ' config holiday send_holidays|'+!config.send_holidays, styles.button + styles.float.right);

            let settingsListItems = [
                '<span style="'+styles.float.left+'">Use Holidays:</span> ' + useHolidaysButton,
            ];

            if(config.use_holidays){
                settingsListItems.push('<span style="'+styles.float.left+'">Send Holidays:</span> ' + sendHolidaysButton);
            }

            let listItems = [];

            let holidays = state[state_name].calendar.holidays;
            for (let [key, value] of Object.entries(holidays)) { 
                listItems.push(makeButton(value.name + ' (' + value.month + '/' + value.day + ')', '!' + state[state_name].config.command + ' single-item-config holidays ' + key, styles.textButton));
            }

            let newButton = makeButton('Add New', '!' + state[state_name].config.command + ' new holiday ?{Name}', styles.button);
            let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' config', styles.button + styles.fullWidth);

            let title_text = script_name + ' Holidays Config';
            message = (message) ? '<p>'+message+'</p>' : '';
            let contents = message+makeList(settingsListItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+newButton+'<hr>'+backButton;
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
            let config = state[state_name].config;

            let useWeatherButton = makeButton(config.use_weather, '!' + config.command + ' config weather use_weather|'+!config.use_weather, styles.button + styles.float.right),
                sendWeatherButton = makeButton(config.send_weather, '!' + config.command + ' config weather send_weather|'+!config.send_weather, styles.button + styles.float.right);

            let settingsListItems = [
                '<span style="'+styles.float.left+'">Use Weather:</span> ' + useWeatherButton,
            ];

            if(config.use_weather){
                settingsListItems.push('<span style="'+styles.float.left+'">Send Weather:</span> ' + sendWeatherButton);
            }

            let listItems = [];

            let weather_types = state[state_name].calendar.weather_types;
            for (let [key, value] of Object.entries(weather_types)) { 
                listItems.push(makeButton(value.name + ' (' + value.texts.length + ')', '!' + config.command + ' single-item-config weather_types ' + key, styles.textButton));
            }

            let newButton = makeButton('Add New', '!' + config.command + ' new weather ?{Name}', styles.button);
            let backButton = makeButton('< Back', '!'+config.command + ' config', styles.button + styles.fullWidth);

            let title_text = script_name + ' Weather Config';
            message = (message) ? '<p>'+message+'</p>' : '';
            let contents = message+makeList(settingsListItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+newButton+'<hr>'+backButton;
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

    jsonExport = (type='calendar') => {
        makeAndSendMenu('<pre>'+HE(JSON.stringify(state[state_name][type]))+'</pre><p>Copy the entire content above and save it to your pc.</p>');
    },

    //return an array of objects according to key, value, or key and value matching, optionally ignoring objects in array of names
    getObjects = (obj, key, val, except) => {
        except = except || [];
        let objects = [];
        for (let i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                if (except.indexOf(i) != -1) {
                    continue;
                }
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

    esRE = function (s) {
        var escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
        return s.replace(escapeForRegexp,"\\$1");
    },

    HE = (function(){
        var entities={
                //' ' : '&'+'nbsp'+';',
                '<' : '&'+'lt'+';',
                '>' : '&'+'gt'+';',
                "'" : '&'+'#39'+';',
                '@' : '&'+'#64'+';',
                '{' : '&'+'#123'+';',
                '|' : '&'+'#124'+';',
                '}' : '&'+'#125'+';',
                '[' : '&'+'#91'+';',
                ']' : '&'+'#93'+';',
                '"' : '&'+'quot'+';'
            },
            re=new RegExp('('+_.map(_.keys(entities),esRE).join('|')+')','g');
        return function(s){
            return s.replace(re, function(c){ return entities[c] || c; });
        };
    }()),

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
                command: 'cal',
                use_seasons: true,
                use_holidays: true,
                use_weather: true,
                use_table: true,
                send_holidays: true,
                send_weather: true,
                send_table: true,
                use_token: false,
                tokenId: false,
                use_handout: false,
                show_handout_players: true
            },
            calendar:{
                current: {
                    month: 0,
                    day: 1,
                    year: 2018,
                    weather: 0
                },
                months: [
                    { name: "Januari", days: 31, avg_temp: 10, weather_type: 0 },
                    { name: "Februari", days: 28, avg_temp: 10, weather_type: 1 },
                    { name: "March", days: 31, avg_temp: 10, weather_type: 1 },
                    { name: "April", days: 30, avg_temp: 10, weather_type: 1 },
                    { name: "May", days: 31, avg_temp: 10, weather_type: 1 },
                    { name: "June", days: 30, avg_temp: 10, weather_type: 1 },
                    { name: "July", days: 31, avg_temp: 10, weather_type: 1 },
                    { name: "August", days: 31, avg_temp: 10, weather_type: 1 },
                    { name: "September", days: 30, avg_temp: 10, weather_type: 1 },
                    { name: "October", days: 31, avg_temp: 10, weather_type: 1 },
                    { name: "November", days: 30, avg_temp: 10, weather_type: 1 },
                    { name: "December", days: 31, avg_temp: 10, weather_type: 1 },
                ],
                seasons: [
                    { name: "Autumn", months: "1-3" },
                    { name: "Winter", months: "1-3" },
                    { name: "Spring", months: "1-3" },
                    { name: "Summer", months: "1-3" },
                ],
                leap: {
                    year: 4,
                    month: 2
                },
                holidays: {
                    christmass: { name: "1st Chrismass", month: 11, day: 25 },
                    christmass2: { name: "2nd Chrismass", month: 11, day: 26 },
                },
                weather_types: [
                    {
                        name: 'Rainy',
                        texts: [
                            "It's a light rainy day outside.",
                            "It's raining very hard today."
                        ],
                    },
                    {
                        name: 'Dry',
                        texts: [
                            "Dry.",
                            "Dryness is keeping on and on!"
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
            state[state_name].calendar.current.weather = getWeather(getMonth().weather_type);
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