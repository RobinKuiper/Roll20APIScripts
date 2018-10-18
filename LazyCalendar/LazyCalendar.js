/*
 * Version 0.2.0
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1095
 * Roll20: https://app.roll20.net/users/1226016/robin
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
 * Patreon: https://patreon.com/robinkuiper
 * Paypal.me: https://www.paypal.me/robinkuiper
*/

var LazyCalendar = LazyCalendar || (function() {
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
    script_name = 'LazyCalendar',
    state_name = 'LAZYCALENDAR',

    handleInput = (msg) => {
        if (msg.type != 'api') return;

        let config = state[state_name].config,
            calendar = state[state_name].calendar;

        // Split the message into command and argument(s)
        let args = msg.content.split(' ');
        let command = args.shift().substring(1);
        let extracommand = args.shift();

        if (command == config.command) {
            if(!playerIsGM(msg.playerid)){
                // Player Commands
                switch(extracommand){
                    case 'show':
                        if(config.player_show_command) showToPlayers(args.shift());
                    break;

                    default:
                        if(config.player_show_command) showToPlayers(extracommand);
                    break;
                }
            }else{
                // GM Commands
                switch(extracommand){
                    case 'reset':
                        if(args.shift().toLowerCase() !== 'yes') return;

                        state[state_name] = {};
                        setDefaults(true);
                        config_menus.main();
                    break;

                    case 'import':
                        let type = args.shift();
                        let json = msg.content.substring(('!'+state[state_name].config.command+' import ' + type + ' ').length);
                        jsonImport(type, json);

                        config_menus.main();
                    break;

                    case 'export':
                        jsonExport(args.shift());
                    break;

                    case 'config':
                        let menu = 'main';

                        if(args[0] && !args[0].includes('|')){
                            menu = args.shift();
                        }

                        if(args.length > 0){
                            let setting = args.shift().split('|');
                            let key = setting.shift();
                            let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                            if(key === 'use_handout' && value) getOrCreateHandout();
                            if(key === 'show_handout_players' && config.use_handout){
                                let handout = getOrCreateHandout();

                                handout.set('inplayerjournals', (value) ? 'all' : '');
                            }

                            config[key] = value;
                        }

                        config_menus[menu]();
                    break;

                    case 'month':
                        let monthId = args.shift();

                        if(!monthId){
                            message.error('No month id was given.');
                            return;
                        }

                        if(monthId === 'new'){
                            let monthName = args.join(' ');

                            if(!monthName){
                                message.error('No name was given.');
                                return;
                            }

                            monthId = create.month(monthName);

                            config_menus.months();

                            return;
                        }

                        monthId = parseInt(monthId, 10);

                        if(!calendar.months[monthId]){
                            message.error('Unknown month.');
                            return;
                        }

                        if(args[0] === 'set'){
                            args.splice(0, 1);
                            let setting = args.join(' ').split('|');
                            let key = setting.shift();
                            let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                            calendar.months[monthId][key] = value;
                        }

                        if(args[0] === 'remove'){
                            remove.month(monthId);
                            config_menus.months();
                            return;
                        }

                        config_menus.month(monthId);
                    break;

                    case 'weekday':
                        let weekdayId = args.shift();

                        if(!weekdayId){
                            message.error('No weekday id was given.');
                        }

                        if(weekdayId === 'new'){
                            let weekdayName = args.join(' ');

                            if(!weekdayName){
                                message.error('No name was given.');
                                return;
                            }

                            weekdayId = create.weekday(weekdayName);

                            config_menus.weekdays();

                            return;
                        }

                        weekdayId = parseInt(weekdayId, 10);

                        if(!calendar.weekdays[weekdayId]){
                            message.error('Unknown weekday.');
                            return;
                        }

                        if(args[0] === 'set'){
                            args.splice(0, 1);
                            let setting = args.join(' ').split('|');
                            let key = setting.shift();
                            let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                            calendar.weekdays[weekdayId] = value;
                        }

                        if(args[0] === 'remove'){
                            remove.weekday(weekdayId);
                            config_menus.weekdays();
                            return;
                        }

                        config_menus.weekdays();
                    break;

                    case 'holiday':
                        let holidayId = args.shift();

                        if(!holidayId){
                            message.error('No holiday id was given.');
                            return;
                        }

                        if(holidayId === 'new'){
                            let holidayName = args.join(' ');

                            if(!holidayName){
                                message.error('No name was given.');
                                return;
                            }

                            holidayId = create.holiday(holidayName);

                            config_menus.holidays();

                            return;
                        }

                        holidayId = parseInt(holidayId, 10);

                        if(!calendar.holidays[holidayId]){
                            message.error('Unknown holiday.');
                            return;
                        }

                        if(args[0] === 'set'){
                            args.splice(0, 1);
                            let setting = args.join(' ').split('|');
                            let key = setting.shift();
                            let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                            calendar.holidays[holidayId][key] = value;
                        }

                        if(args[0] === 'remove'){
                            remove.holiday(holidayId);
                            config_menus.holidays();
                            return;
                        }

                        config_menus.holiday(holidayId);
                    break;

                    case 'weather_type':
                        let weather_typeId = args.shift();

                        if(!weather_typeId){
                            message.error('No weather type id was given.');
                            return;
                        }

                        if(weather_typeId === 'new'){
                            let weather_typeName = args.join(' ');

                            if(!weather_typeName){
                                message.error('No name was given.');
                                return;
                            }

                            weather_typeId = create.weather_type(weather_typeName);

                            config_menus.weather_types();

                            return;
                        }

                        weather_typeId = parseInt(weather_typeId, 10);

                        if(!calendar.weather_types[weather_typeId]){
                            message.error('Unknown weather type.');
                            return;
                        }

                        let Do = args.shift();

                        if(Do === 'set'){
                            let setting = args.join(' ').split('|');
                            let key = setting.shift();
                            let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                            calendar.weather_types[weather_typeId][key] = value;
                        }

                        if(Do === 'remove'){
                            remove.weather_type(weather_typeId, args.shift());
                            config_menus.weather_types();
                            return;
                        }

                        if(Do === 'text'){
                            let textId = args.shift();

                            if(textId === 'new'){
                                let weather_type_text = args.join(' ');
                                if(!weather_type_text || weather_type_text === ''){
                                    sendError('No text was given.');
                                    return;
                                }
                                create.weather_type_text(weather_typeId, weather_type_text);
                            }

                            if(args[0] === 'remove'){
                                remove.weather_type_text(weather_typeId, textId);
                            }else{
                                calendar.weather_types[weather_typeId].texts[textId] = args.join(' ');
                            }
                        }

                        config_menus.weather_type(weather_typeId);
                    break;

                    case 'change-weather':
                        setCurrentWeather();
                        sendMenu();
                    break;

                    case 'set-token':
                        if(!msg.selected || !msg.selected.length){
                            message.error('Select a text token first.');
                            return;
                        }

                        if(msg.selected.length > 1){
                            message.error('Only one text token should be selected.');
                            return;
                        }

                        if(msg.selected[0]._type !== 'text'){
                            message.error('Selected token is not of type Text.');
                            return;
                        }

                        if(setToken(msg.selected[0]._id)){
                            message.success('Token Set!');
                            return;
                        }

                        message.error('Something went wrong, probably the text token is not found.');
                    break;

                    case 'advance':
                        switch(args.shift()){
                            case 'day':
                            advanceDay(args.shift());
                            break;

                            case 'month':
                            advanceMonth(args.shift());
                            break;

                            case 'year':
                            advanceYear(args.shift());
                            break;

                            default:
                            advanceDay(args.shift());
                            break;
                        }

                        sendMenu();
                    break;

                    case 'set':
                        switch(args.shift()){
                            case 'day':
                            setDay(args.shift());
                            break;

                            case 'month':
                            setMonth(args.shift());
                            break;

                            case 'year':
                            setYear(args.shift());
                            break;

                            default:
                            setDay(args.shift());
                            break;
                        }

                        sendMenu();
                    break;

                    case 'show':
                        showToPlayers(args.shift())
                    break;

                    case 'menu':
                        sendMenu();
                    break;

                    default:
                        sendMenu();
                    break;
                }
            }
        }
    },

    create = {
        month: (name) => {
            let calendar = state[state_name].calendar;

            calendar.months.push({
                name,
                days: 31,
                avg_temp: 10,
                weather_type: 0,
            });

            return calendar.months.length - 1;
        },

        weekday: (name) => {
            let calendar = state[state_name].calendar;

            calendar.weekdays.push(name);

            return calendar.weekdays.length - 1;
        },

        holiday: (name) => {
            let calendar = state[state_name].calendar;

            calendar.holidays.push({
                name,
                day: 1,
                month: 0,
            });

            return calendar.holidays.length - 1;
        },

        weather_type: (name) => {
            let calendar = state[state_name].calendar;

            calendar.weather_types.push({
                name,
                texts: []
            });

            return calendar.weather_types.length - 1;
        },

        weather_type_text: (weather_typeId, text) => {
            let calendar = state[state_name].calendar;

            calendar.weather_types[weather_typeId].texts.push(text);

            return calendar.weather_types[weather_typeId].texts.length - 1;
        }
    },

    remove = {
        month: (monthId) => {
            if(getCurrentMonthId() === monthId){
                message.error('This is the current month, we can\'t remove this.');
                return;
            }

            for(var i = state[state_name].calendar.holidays.length - 1; i >= 0; i--) {
                if(state[state_name].calendar.holidays[i].month === monthId) state[state_name].calendar.holidays.splice(i, 1);
            }

            state[state_name].calendar.months.splice(monthId, 1)
        },
        weekday: (weekdayId) => {
            if(state[state_name].calendar.weekdays.length === 1){
                message.error('There needs to be atleast 1 weekday, you can create a new one first or rename this one.');
                return;
            }

            state[state_name].calendar.weekdays.splice(weekdayId, 1)
        },
        holiday: (holidayId) => state[state_name].calendar.holidays.splice(holidayId, 1),
        weather_type: (weather_typeId, new_weather_typeId) => {
            if(state[state_name].calendar.weather_types.length === 1){
                message.error('There needs to be atleast 1 weather type, you can create a new one first or rename this one.');
                return;
            }

            if(!new_weather_typeId || new_weather_typeId === weather_typeId){
                message.error('New weather type is the same or not defined.');
                return;
            }

            new_weather_typeId = (new_weather_typeId > weather_typeId) ? new_weather_typeId - 1 : new_weather_typeId;

            state[state_name].calendar.months.forEach((month, id) => {
                if(month.weather_type === weather_typeId) state[state_name].calendar.months[id].weather_type = new_weather_typeId;
            });
            
            state[state_name].calendar.weather_types.splice(weather_typeId, 1);
        },
        weather_type_text: (weather_typeId, textId) => state[state_name].calendar.weather_types[weather_typeId].texts.splice(textId, 1),
    },

    showToPlayers = (details='full') => {
        let config = state[state_name].config;

        let contents = '';

        if(config.use_table && config.send_table && (details === 'full' || details === 'table')){
            contents += generateTable();
        }

        if(details === 'full' || details === 'date')
            contents += getDateString();

        if(config.use_weather && config.send_weather && (details === 'full' || details === 'weather')){
            if(details === 'full') contents += '<hr>';
            contents += '<b>Weather</b><br>'+getCurrentWeather();
        }

        if(config.use_holidays && config.send_holidays && (details === 'full' || details === 'holidays')){
            if(details === 'full') contents += '<hr>';
            contents += '<b>Holidays</b><br>';
            contents += (!getHolidays().length) ? 'No holidays in this month.' : '';
            getHolidays().forEach(holiday => {
                contents += '<i>'+getMonth().name + ' ' + holiday.day + ' - ' + holiday.name + '</i><br>'
            });
        }

        make.menu(contents, script_name);
    },

    sendMenu = () => {
        let config = state[state_name].config,
            command = '!' + config.command;

        let buttons = {
            change_weather: make.button('Change Weather', command + ' change-weather', styles.button + styles.float.right),
            advance: make.button('Day', command + ' advance day', styles.button),
            advance_month: make.button('Month', command + ' advance month', styles.button),
            advance_year: make.button('Year', command + ' advance year', styles.button),
            showFull: make.button('Full', command + ' show full', styles.button),
            showWeather: make.button('Weather', command + ' show weather', styles.button),
            showDate: make.button('Date', command + ' show date', styles.button),
            showHolidays: make.button('Holidays', command + ' show holidays', styles.button),
            set_day: make.button(getCurrentDoM(), command + ' set day ?{Day}', styles.button + styles.float.right),
            set_month: make.button(getMonth(getCurrentMonthId()).name, command + ' set month ' + dropdown.months(), styles.button + styles.float.right),
            set_year: make.button(getCurrentYear(), command + ' set year ?{Year}', styles.button + styles.float.right),
        }

        let setListItems = [
            make.buttonListItem('Day', buttons.set_day),
            make.buttonListItem('Month', buttons.set_month),
            make.buttonListItem('Year', buttons.set_year)
        ]

        let contents = '';

        if(config.use_table){
            contents += generateTable();
        }

        contents += getDateString();

        if(config.use_weather){
            contents += '<hr><b>Weather</b><br>'+getCurrentWeather();
            contents += '<br>' + buttons.change_weather + '<br>';
        }

        if(config.use_holidays){
            contents += '<hr><b>Holidays</b><br>';
            contents += (!getHolidays().length) ? 'No holidays in this month.' : '';
            getHolidays().forEach(holiday => {
                contents += '<i>'+getMonth().name + ' ' + holiday.day + ' - ' + holiday.name + '</i><br>'
            });
        }

        contents += '<hr>';
        contents += '<b>Set</b>' + make.list(setListItems);
        contents += '<hr>';
        contents += '<b>Advance</b>: ' + buttons.advance + buttons.advance_month + buttons.advance_year;
        contents += '<hr>';
        contents += '<b>Send</b>: ' + buttons.showFull + buttons.showDate + buttons.showHolidays + buttons.showWeather;

        make.menu(contents, script_name, 'gm');
    },

    advanceDay = (days=1) => {
        let config = state[state_name].config;

        days = parseInt(days, 10);

        setCurrentDoW(getCurrentDoW() + days);
        setCurrentDoM(getCurrentDoM() + days);
        setCurrentDoY(getCurrentDoY() + days);

        if(config.use_weather) setCurrentWeather(getMonth().weather_type);
        if(config.use_token) setToken();
        if(config.use_handout) getOrCreateHandout();
    },

    advanceMonth = (months=1) => {
        months = parseInt(months, 10);

        let days_skipped = 0;
        let reset = false;

        if(getCurrentMonthId() < getCurrentMonthId() + months){
            for(let i = getCurrentMonthId(); i < getCurrentMonthId() + months; i++){
                if(reset === false && !getMonth(i)) reset = 1;

                days_skipped += getMonth((reset === false) ? i : reset - 1).days;

                if(reset !== false) reset++;
            }
        }else{
            for(let i = getCurrentMonthId() + months; i < getCurrentMonthId(); i++){
                if(reset === false && !getMonth(i)) reset = 1;

                days_skipped += getMonth((reset === false) ? i : reset - 1).days;

                if(reset !== false) reset++;
            }

            days_skipped = -days_skipped;
        }

        advanceDay(days_skipped);
    },

    advanceYear = (years=1) => {
        let config = state[state_name].config;

        years = parseInt(years, 10);

        //let skipped_days = years*getTotalYearDays();

        //advanceDay(skipped_days);

        setCurrentYear(getCurrentYear() + years);

        if(config.use_token) setToken();
        if(config.use_handout) getOrCreateHandout();
    },

    setDay = (day) => {
        day = parseInt(day, 10);

        let total_days_in_month = getMonth().days;

        if(day <= 0 || day > total_days_in_month){
            message.error('There are not this many days in the month.');
            return;
        }

        advanceDay(day-getCurrentDoM());
    },

    setMonth = (monthId) => {
        let calendar = state[state_name].calendar;

        monthId = parseInt(monthId, 10);

        if(!getMonth(monthId)){
            message.error('Month given does not exist.');
            return;
        }

        advanceMonth(monthId - getCurrentMonthId());
    },

    setYear = (year) => {
        advanceYear(year-getCurrentYear());
    },

    generateTable = (totalDays=getMonth().days, currentDay=getCurrentDoM()) => {
        let calendar = state[state_name].calendar,
            totalWeekdays = calendar.weekdays.length,
            DoW = getCurrentDoW(),
            DoM = getCurrentDoM(),
            DoY = getCurrentDoY();

        let table = '<b>'+getMonth().name+'</b><table border="1" style="'+styles.fullWidth+'">';

        table += '<tr>';
        calendar.weekdays.forEach(day => {
            table += '<th style="font-size: 9pt">'+handleLongString(day, 3, '')+'</th>';
        });
        table += '</tr>'

        for(let i = 0; i < Math.ceil(totalDays/totalWeekdays)+1; i++){
            table += '<tr>';
            if(i === 0){
                if(DoW !== DoM && DoM !== DoY){
                    for(let k = 1; k < DoW; k++){
                        table += '<td style="border: none">&nbsp;</td>';
                    }
                }
            }

            for(let j = 1; j <= totalWeekdays; j++){
                let dayGen = ((totalWeekdays*i)+j);

                if(i === 0){
                    if(DoW !== DoM && DoM !== DoY){
                        if(dayGen < DoW){
                            continue;
                        }
                    }
                }

                if(DoW !== DoM && DoM !== DoY){
                    dayGen = dayGen - DoW + 1;
                }
                
                let dayStyle = (dayGen === currentDay) ? 'padding-left: 4px; padding-right: 3px; font-weight: bold; color: white; background-color: green; border: 1px solid transparent; border-radius: 50%;' : '';
                if(totalDays < dayGen) break;
                table += '<td><span style="'+dayStyle+'">'+dayGen+'</span></td>'
                
            }
            table += '</tr>';
        }
        table += '</table>';

        return table;
    },

    getDateString = () => getWeekdayName() + ' ' + getCurrentDoM() + ' ' + getMonth().name + ', ' + getCurrentYear(),

    getCurrentDoY = () => state[state_name].calendar.current.day_of_the_year,

    setCurrentDoY = (day) => {
        let totalYearDays = getTotalYearDays();

        if(day > totalYearDays){
            advanceYear();
            setCurrentDoY(day - totalYearDays);
            return;
        }

        state[state_name].calendar.current.day_of_the_year = day
    },

    getCurrentDoM = () => state[state_name].calendar.current.day_of_the_month,

    setCurrentDoM = (day) => {
        let totalMonthDays = getMonth().days;

        if(day > totalMonthDays){
            setCurrentMonthId(getCurrentMonthId() + 1);
            setCurrentDoM(day - totalMonthDays);
            return;
        }else if(day < 1){
            setCurrentMonthId(getCurrentMonthId() - 1);
            setCurrentDoM(day + totalMonthDays);
            return;
        }

        state[state_name].calendar.current.day_of_the_month = day
    },

    getCurrentDoW = () => state[state_name].calendar.current.day_of_the_week,

    setCurrentDoW = (day) => {
        let calendar = state[state_name].calendar;

        let totalWeekdays = calendar.weekdays.length;

        if(day > totalWeekdays){
            setCurrentDoW(day - totalWeekdays);
            return;
        }else if(day < 0){
            setCurrentDoW(day + totalWeekdays);
            return;
        }

        state[state_name].calendar.current.day_of_the_week = day;
    },

    getTotalYearDays = () => state[state_name].calendar.months.reduce((total, month) => { return { days: total.days + month.days } }).days,

    getCurrentMonthId = () => state[state_name].calendar.current.month,

    setCurrentMonthId = (monthId) => {
        let calendar = state[state_name].calendar;

        if(!calendar.months[monthId]){
            monthId = 0;
        }

        state[state_name].calendar.current.month = monthId
    },

    getCurrentYear = () => state[state_name].calendar.current.year,

    setCurrentYear = (year) => state[state_name].calendar.current.year = year,

    getCurrentWeather = () => state[state_name].calendar.current.weather,

    setCurrentWeather = (weather_type=getMonth().weather_type) => {
        let calendar = state[state_name].calendar,
            weather_types = calendar.weather_types;

        if(!weather_types[weather_type]){
            message.error('Weather type not found.');
            return;
        };

        let randomNumber = Math.floor(Math.random() * weather_types[weather_type].texts.length) + 0; 

        calendar.current.weather = weather_types[weather_type].texts[randomNumber];

        return calendar.current.weather;
    },

    getMonth = (monthId=getCurrentMonthId()) => state[state_name].calendar.months[monthId] || false,

    getWeekdayName = (dayId=getCurrentDoW()) => state[state_name].calendar.weekdays[dayId-1],

    getHolidays = (monthId=getCurrentMonthId()) => getObjects(state[state_name].calendar.holidays, 'month', monthId),

    getHoliday = (holidayId) => state[state_name].calendar.holidays[holidayId] || false,

    getWeather_type = (weather_typeId) => state[state_name].calendar.weather_types[weather_typeId] || false,

    getTokenId = () => state[state_name].config.tokenId,

    setToken = (tokenId=getTokenId()) => {
        if(tokenId !== getTokenId()) state[state_name].config.tokenId = tokenId;

        let token = getObj('text', tokenId);
        if(token){
            token.set('text', getDateString());
            return true;
        }

        message.error('Text token not found.');
    },

    getOrCreateHandout = () => {
        let config = state[state_name].config;

        let handout = findObjs({
                type: 'handout',
                name: script_name
            });

        let inplayerjournals = (state[state_name].config.show_handout_players) ? "all" : "";

        handout = (handout && handout[0]) ? handout[0] : createObj("handout", {
            name: script_name,
            inplayerjournals
        });

        // TODO use and send settings.

        let table = generateTable(getMonth().days, getCurrentDoM());
        let upcoming_events = getObjects(state[state_name].calendar.holidays, 'month', getCurrentMonthId()).map(holiday => {
            return '<i>'+getMonth().name+' '+holiday.day+' - '+holiday.name+'</i>';
        });
        upcoming_events = (upcoming_events.length) ? upcoming_events : ['No events this month.'];
        upcoming_events = '<b>Events this Month</b><br>'+make.list(upcoming_events);

        let notes = '';

        if(config.use_table) notes += table;
        notes += getDateString() + '<br><br>';
        if(config.use_weather) notes += '<b>Weather</b><br><i>'+state[state_name].calendar.current.weather+'</i>';
        if(config.use_holidays) notes += '<hr>'+upcoming_events;

        handout.set('notes', notes);

        return handout
    },

    config_menus = {
        main: (first, message) => {
            let config = state[state_name].config,
                command = '!' + config.command;

            let buttons = {
                command: make.button('!'+config.command, command + ' config command|?{Command (without !)}', styles.button + styles.float.right),
                playerShowCommand: make.button(config.player_show_command, command + ' config player_show_command|'+!config.player_show_command, styles.button + styles.float.right),
                useToken: make.button(config.use_token, command + ' config use_token|'+!config.use_token, styles.button + styles.float.right),
                useTable: make.button(config.use_table, command + ' config use_table|'+!config.use_table, styles.button + styles.float.right),
                useHandout: make.button(config.use_handout, command + ' config use_handout|'+!config.use_handout, styles.button + styles.float.right),
                showHandout: make.button(config.show_handout_players, command + ' config show_handout_players|'+!config.show_handout_players, styles.button + styles.float.right),
                sendTable: make.button(config.send_table, command + ' config send_table|'+!config.send_table, styles.button + styles.float.right),
                setToken: make.button('Set Token', command + ' set-token', styles.button),
                reset: make.button('Reset Config', command + ' reset ?{Are you sure? Type Yes}', styles.button + styles.fullWidth + ' background-color: red;'),
                months: make.button('Months Setup', command + ' config months', styles.button),
                weekdays: make.button('Weekday Setup', command + ' config weekdays', styles.button),
                holidays: make.button('Holidays Setup', command + ' config holidays', styles.button),
                weather: make.button('Weather Setup', command + ' config weather_types', styles.button),
                importConfig: make.button('Import Config', command + ' import config ?{JSON}', styles.button + styles.fullWidth),
                exportConfig: make.button('Export Config', command + ' export config', styles.button + styles.fullWidth),
                importCalendar: make.button('Import Calendar', command + ' import calendar ?{JSON}', styles.button + styles.fullWidth),
                exportCalendar: make.button('Export Calendar', command + ' export calendar', styles.button + styles.fullWidth),
            }

            let configListItems = [];
            configListItems.push(make.buttonListItem('Command', buttons.command));
            configListItems.push(make.buttonListItem('Player \'Show\' Command', buttons.playerShowCommand));
            configListItems.push(make.buttonListItem('Use Table', buttons.useTable));
            if(config.use_table) configListItems.push(make.buttonListItem('Send Table to Players', buttons.sendTable));
            configListItems.push(make.buttonListItem('Use Handout', buttons.useHandout));
            if(config.use_handout) configListItems.push(make.buttonListItem('Show Handout to Players', buttons.showHandout));
            configListItems.push(make.buttonListItem('Use Token', buttons.useToken));
            if(config.use_token) configListItems.push(buttons.setToken + ' <span style="font-size: 8pt">(Select text token first.)</span>');

            let menuListItems = [
                buttons.months,
                buttons.weekdays,
                buttons.holidays,
                buttons.weather
            ];

            let importListItems = [
                buttons.exportCalendar,
                buttons.importCalendar,
                buttons.exportConfig,
                buttons.importConfig,
                buttons.reset
            ]

            let title = (first) ? script_name + ' First Time Setup' : script_name + ' Config';

            let contents = (message) ? '<p>'+message+'</p>' : '';
            contents += make.list(configListItems);
            contents += '<hr>';
            contents += make.list(menuListItems);
            contents += '<hr>';
            contents += '<p style="font-size: 80%">You can always come back to this config by typing `!'+config.command+' config`.</p>';
            contents += '<hr>';
            contents += make.list(importListItems, styles.reset + styles.list + styles.overflow + ' margin-right: -5px');

            make.menu(contents, title, 'gm');
        },

        months: () => {
            let config = state[state_name].config,
                command = '!' + config.command,
                calendar = state[state_name].calendar;

            let monthListItems = [];
            calendar.months.forEach((month, monthId) => {
                monthListItems.push(make.button(month.name + ' ('+month.days+')', command + ' month ' + monthId, styles.textButton));
            });

            let buttons = {
                add: make.button('Add New', command + ' month new ?{Name}', styles.button),
                back: make.button('< Back', command + ' config', styles.button)
            }

            let contents = make.list(monthListItems);
            contents += '<hr>';
            contents += buttons.add;
            contents += '<hr>';
            contents += buttons.back;

            let title = script_name + ' Months';
            make.menu(contents, title, 'gm');
        },

        month: (monthId) => {
            let config = state[state_name].config,
                command = '!' + config.command,
                calendar = state[state_name].calendar,
                month = getMonth(monthId);

            let buttons = {
                name: make.button(month.name, command + ' month ' + monthId + ' set name|?{Name|'+month.name+'}', styles.button + styles.float.right),
                days: make.button(month.days, command + ' month ' + monthId + ' set days|?{Days|'+month.days+'}', styles.button + styles.float.right),
                temp: make.button(month.avg_temp, command + ' month ' + monthId + ' set avg_temp|?{Average Temperature|'+month.avg_temp+'}', styles.button + styles.float.right),
                weather: make.button(calendar.weather_types[month.weather_type].name, command + ' month ' + monthId + ' set weather_type|'+dropdown.weather_type(), styles.button + styles.float.right),
                remove: make.button('Remove', command + ' month ' + monthId + ' remove', styles.button + styles.fullWidth + ' background-color: red;'),
                back: make.button('< Back', command + ' config months', styles.button + styles.fullWidth),
            }

            let listItems = [
                make.buttonListItem('Name', buttons.name),
                make.buttonListItem('Days', buttons.days),
                make.buttonListItem('Avg. Temp', buttons.temp),
                make.buttonListItem('Weather Type', buttons.weather),
            ]

            let contents = make.list(listItems);
            contents += '<hr>';
            contents += '<span style="font-size: 8pt">Holidays in this month will also be removed.</span>';
            contents += buttons.remove;
            contents += buttons.back;

            let title = script_name + ' - ' + month.name;
            make.menu(contents, title);
        },

        weekdays: () => {
            let config = state[state_name].config,
                command = '!' + config.command,
                calendar = state[state_name].calendar;

            let listItems = [];
            calendar.weekdays.forEach((weekday, id) => {
                listItems.push(make.buttonListItem(make.button(weekday, command + ' weekday ' + id + ' set name|?{name|'+weekday+'}', styles.textButton), make.button('Remove', command + ' weekday ' + id + ' remove', styles.button + styles.float.right)));
            });

            let buttons = {
                add: make.button('Add New', command + ' weekday new ?{Name}', styles.button),
                back: make.button('< Back', command + ' config', styles.button)
            }

            let contents = make.list(listItems);
            contents += '<hr>';
            contents += buttons.add;
            contents += '<hr>';
            contents += buttons.back;

            let title = script_name + ' Weekdays';
            make.menu(contents, title, 'gm');
        },

        holidays: () => {
            let config = state[state_name].config,
                command = '!' + config.command,
                calendar = state[state_name].calendar;

            let listItems = [];
            calendar.holidays.forEach((holiday, id) => {
                listItems.push(make.button(holiday.name, command + ' holiday ' + id, styles.textButton));
            });

            let buttons = {
                add: make.button('Add New', command + ' holiday new ?{Name}', styles.button),
                back: make.button('< Back', command + ' config', styles.button),
                use: make.button(config.use_holidays, command + ' config holidays use_holidays|'+!config.use_holidays, styles.button + styles.float.right),
                send: make.button(config.send_holidays, command + ' config holidays use_holidays|'+!config.send_holidays, styles.button + styles.float.right),
            }

            let configListItems = [];
            configListItems.push(make.buttonListItem('Use Holidays', buttons.use));
            if(config.use_holidays) configListItems.push(make.buttonListItem('Send Holidays', buttons.send));

            let contents = make.list(configListItems);
            contents += '<hr>';
            contents += make.list(listItems);
            contents += '<hr>';
            contents += buttons.add;
            contents += '<hr>';
            contents += buttons.back;

            let title = script_name + ' Holidays';
            make.menu(contents, title, 'gm');
        },

        holiday: (id) => {
            let config = state[state_name].config,
                command = '!' + config.command,
                calendar = state[state_name].calendar,
                holiday = getHoliday(id);

            let buttons = {
                name: make.button(holiday.name, command + ' holiday ' + id + ' set name|?{Name|'+holiday.name+'}', styles.button + styles.float.right),
                day: make.button(holiday.day, command + ' holiday ' + id + ' set day|?{Day|'+holiday.day+'}', styles.button + styles.float.right),
                month: make.button(getMonth(holiday.month).name, command + ' holiday ' + id + ' set month|'+dropdown.months(), styles.button + styles.float.right),
                remove: make.button('Remove', command + ' holiday ' + id + ' remove', styles.button + styles.fullWidth + ' background-color: red;'),
                back: make.button('< Back', command + ' config holidays', styles.button + styles.fullWidth),
            }

            let listItems = [
                make.buttonListItem('Name', buttons.name),
                make.buttonListItem('Day', buttons.day),
                make.buttonListItem('Month', buttons.month),
            ]

            let contents = make.list(listItems);
            contents += '<hr>';
            contents += buttons.remove;
            contents += buttons.back;

            let title = script_name + ' - ' + holiday.name;
            make.menu(contents, title);
        },

        weather_types: () => {
            let config = state[state_name].config,
                command = '!' + config.command,
                calendar = state[state_name].calendar;

            let listItems = [];
            calendar.weather_types.forEach((weather_type, id) => {
                listItems.push(make.button(weather_type.name, command + ' weather_type ' + id, styles.textButton));
            });

            let buttons = {
                add: make.button('Add New', command + ' weather_type new ?{Name}', styles.button),
                back: make.button('< Back', command + ' config', styles.button),
                use: make.button(config.use_weather, command + ' config weather_types use_weather|'+!config.use_weather, styles.button + styles.float.right),
                send: make.button(config.send_weather, command + ' config weather_types send_weather|'+!config.send_weather, styles.button + styles.float.right),
            }

            let configListItems = [];
            configListItems.push(make.buttonListItem('Use Weather', buttons.use));
            if(config.use_holidays) configListItems.push(make.buttonListItem('Send Weather', buttons.send));

            let contents = make.list(configListItems);
            contents += '<hr>';
            contents += make.list(listItems);
            contents += '<hr>';
            contents += buttons.add;
            contents += '<hr>';
            contents += buttons.back;

            let title = script_name + ' Weather';
            make.menu(contents, title, 'gm');
        },

        weather_type: (id) => {
            let config = state[state_name].config,
                command = '!' + config.command,
                weather_type = getWeather_type(id);

            let weather_type_change_id = (state[state_name].calendar.weather_types.length <= 2) ? (id === 0) ? 1 : 0 : dropdown.weather_type('Change months with this weather type to', [id]);

            let buttons = {
                name: make.button(weather_type.name, command + ' weather_type ' + id + ' set name|?{Name|'+weather_type.name+'}', styles.button + styles.float.right),
                create_text: make.button('Add Text', command + ' weather_type ' + id + ' text new ?{Text}', styles.button),
                remove: make.button('Remove', command + ' weather_type ' + id + ' remove '+weather_type_change_id, styles.button + styles.fullWidth + ' background-color: red;'),
                back: make.button('< Back', command + ' config weather_types', styles.button + styles.fullWidth),
            }

            let listItems = [
                make.buttonListItem('Name', buttons.name),
            ]

            let textListItems = [];
            weather_type.texts.forEach((text, textId) => {
                textListItems.push(make.buttonListItem(make.button(handleLongString(text, 25, '...'), command + ' weather_type ' + id + ' text ' + textId + ' ?{Text|'+text+'}', styles.textButton), make.button('Remove', command + ' weather_type ' + id + ' text ' + textId + ' remove', styles.button + styles.float.right)));
            });

            let contents = make.list(listItems);
            contents += '<hr>';
            contents += make.list(textListItems);
            contents += buttons.create_text;
            contents += '<hr>';
            contents += buttons.remove;
            contents += buttons.back;

            let title = script_name + ' - ' + weather_type.name;
            make.menu(contents, title);
        },
    },

    dropdown = {
        weather_type: (title='Weather Type', excludes=[]) => {
            let calendar = state[state_name].calendar;

            let dropdown = '?{'+title;
            calendar.weather_types.forEach((weather_type, id) => {
                if(!excludes.includes(id)) dropdown += '|' + weather_type.name + ',' + id;
            });
            dropdown += '}';

            return dropdown;
        },

        months: () => {
            let calendar = state[state_name].calendar;

            let dropdown = '?{Month';
            calendar.months.forEach((month, id) => {
                dropdown += '|' + month.name + ',' + id;
            });
            dropdown += '}';

            return dropdown;
        }
    },

    message = {
        error: (message, whisper='gm', style='border-color: red; color: red;') => {
            make.menu(message, '', whisper, style);
        },

        normal: (message, whisper='gm', style='') => {
            make.menu(message, '', whisper, style)
        },

        success: (message, whisper='gm', style='border-color: green; color: green;') => {
            make.menu(message, '', whisper, style)
        },
    },

    make = {
        menu: (contents, title, whisper, style='') => {
            title = (title && title != '') ? make.title(title) : '';
            whisper = (whisper && whisper !== '') ? '/w ' + whisper + ' ' : '';
            sendChat(script_name, whisper + '<div style="'+styles.menu+styles.overflow+style+'">'+title+contents+'</div>', null, {noarchive:true});
        },

        title: (title) => {
            return '<h3 style="margin-bottom: 10px;">'+title+'</h3>';
        },

        button: (title, href, style) => {
            return '<a style="'+style+'" href="'+href+'">'+title+'</a>';
        },

        list: (items, listStyle=styles.reset + styles.list + styles.overflow, itemStyle=styles.overflow) => {
            let list = '<ul style="'+listStyle+'">';
            items.forEach((item) => {
                list += '<li style="'+itemStyle+'">'+item+'</li>';
            });
            list += '</ul>';
            return list;
        },

        buttonListItem: (title, button) => {
            return '<span style="'+styles.float.left+'">'+title+':</span> ' + button;
        },
    },

    jsonExport = (type='calendar') => {
        make.menu('<pre>'+HE(JSON.stringify(state[state_name][type]))+'</pre><p>Copy the entire content above and save it to your pc.</p>');
    },

    jsonImport = (type='calendar', json) => {
        try{
            json = JSON.parse(json);
        } catch(e) {
            message.error('This is not a valid JSON string.');
            return;
        }
        state[state_name][type] = json;
    },

    handleLongString = (str, max=8, end='') => (str.length > max) ? str.slice(0, max) + end : str,

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
            if (i == key && obj[i] == val || i == key && val === '') { //
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
                show_handout_players: true,
                player_show_command: false,
            },
            calendar:{
                current: {
                    month: 0,
                    day_of_the_year: 1,
                    day_of_the_week: 1,
                    day_of_the_month: 1,
                    year: 2018,
                    weather: 'Misty - A low mist hangs in the air that limits vision to a maximum of 150 ft. for everything of large size and smaller. Any such target is assumed to have total cover while anything huge or larger past this range is considered to have three-quarters cover. Any Survival(wisdom) check made to navigate through the mist has disadvantage.',
                },
                weekdays: [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday'
                ],
                months: [
                    { name: "Januari", days: 31, avg_temp: 10, weather_type: 0 },
                    { name: "Februari", days: 28, avg_temp: 10, weather_type: 0 },
                    { name: "March", days: 31, avg_temp: 10, weather_type: 0 },
                    { name: "April", days: 30, avg_temp: 10, weather_type: 1 },
                    { name: "May", days: 31, avg_temp: 10, weather_type: 1 },
                    { name: "June", days: 30, avg_temp: 10, weather_type: 1 },
                    { name: "July", days: 31, avg_temp: 10, weather_type: 1 },
                    { name: "August", days: 31, avg_temp: 10, weather_type: 1 },
                    { name: "September", days: 30, avg_temp: 10, weather_type: 0 },
                    { name: "October", days: 31, avg_temp: 10, weather_type: 0 },
                    { name: "November", days: 30, avg_temp: 10, weather_type: 2 },
                    { name: "December", days: 31, avg_temp: 10, weather_type: 2 },
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
                holidays: [
                    { name: "New Year's Day", month: 0, day: 1 },
                    { name: "Valentine's Day", month: 1, day: 14 },
                    { name: "Independence Day", month: 6, day: 4 },
                    { name: "Halloween", month: 9, day: 31 },
                    { name: "1st Chrismass Day", month: 11, day: 25 },
                    { name: "2nd Chrismass Day", month: 11, day: 26 },
                    { name: "New Year's Eve", month: 11, day: 31 },
                ],
                weather_types: [
                    {
                        name: 'Rainy',
                        texts: [
                            'Misty - A low mist hangs in the air that limits vision to a maximum of 150 ft. for everything of large size and smaller. Any such target is assumed to have total cover while anything huge or larger past this range is considered to have three-quarters cover. Any Survival(wisdom) check made to navigate through the mist has disadvantage.',
                            'Heavy Mist - A thick almost tangible mist drowns out any vision past 15ft. for everything large and smaller, with anything huge or larger only being visible up to 30ft. away. All sight based abilities outside of the 15ft. range are at disadvantage and all creatures and objects outside of that range are assumed to have total cover. This disadvantage cannot be negated and also applies to navigation unless the DM specifically allows you to.',
                            'Dry and Sunny - These days are rare and should be enjoyed.',
                            'Sunny with Rain Showers - Smaller localised rain clouds fill the skies, leaving the days filled both with rain and rainbows. There will be a 1 in 3 chance of it currently being dry on the character’s position.',
                            'Rainy - A sheet of rain falls over the land, creating a damp but slightly cosy atmosphere while walking under the massive trees of the jungle. Though the humidity rises most places within the jungle are still relatively dry due to the thick canopy catching most of the rain.',
                            'Heavy Rain - Rain and wind tear at the trees and pour down on any poor adventurer out to test their luck. Any Wisdom(perception) checks beyond 150ft. become blurred and are at disadvantage except for anything that’s huge or larger. Any creature outside of this range that is large or smaller gains the benefits of three-quarters cover and missile weapons ranges are halved.',
                            'Tropical Storm - The sky darkens as lighting, rain and mayhem rain down from above while the wind tears the trees away from the earth itself. Rivers swell and rage through the jungle, preventing any form of travel by boat. Any guide worth their salt knows that the best choice is to hunker down and wait out the storm, but there are always those foolish enough to think they can test mother nature. Anyone braving the storm immediately gains a level of exhaustion and must make a DC 10 Constitution saving throw at the end of the day to prevent weariness from setting in. On top of the attributes of “Heavy Rain” all characters are also at disadvantage for making Wisdom(survival) checks to navigate.',
                            'Extremely Warm and Rainy - The heat rises to 35°C and above making movement cumbersome. Any character that decides to travel long distances during these days gets a level of exhaustion.',
                            'Extremely Warm and Dry - The heat rises to 35°C and above making movement cumbersome. Any character that decides to travel long distances during these days gets a level of exhaustion. Characters will need to actively prevent being dehydrated throughout the day.',
                        ],
                    },
                    {
                        name: 'Dry',
                        texts: [
                            'Misty - A low mist hangs in the air that limits vision to a maximum of 150 ft. for everything of large size and smaller. Any such target is assumed to have total cover while anything huge or larger past this range is considered to have three-quarters cover. Any Survival(wisdom) check made to navigate through the mist has disadvantage.',
                            'Heavy Mist - A thick almost tangible mist drowns out any vision past 15ft. for everything large and smaller, with anything huge or larger only being visible up to 30ft. away. All sight based abilities outside of the 15ft. range are at disadvantage and all creatures and objects outside of that range are assumed to have total cover. This disadvantage cannot be negated and also applies to navigation unless the DM specifically allows you to.',
                            'Dry and Sunny - These days are rare and should be enjoyed.',
                            'Sunny with Rain Showers - Smaller localised rain clouds fill the skies, leaving the days filled both with rain and rainbows. There will be a 1 in 3 chance of it currently being dry on the character’s position.',
                            'Rainy - A sheet of rain falls over the land, creating a damp but slightly cosy atmosphere while walking under the massive trees of the jungle. Though the humidity rises most places within the jungle are still relatively dry due to the thick canopy catching most of the rain.',
                            'Heavy Rain - Rain and wind tear at the trees and pour down on any poor adventurer out to test their luck. Any Wisdom(perception) checks beyond 150ft. become blurred and are at disadvantage except for anything that’s huge or larger. Any creature outside of this range that is large or smaller gains the benefits of three-quarters cover and missile weapons ranges are halved.',
                            'Tropical Storm - The sky darkens as lighting, rain and mayhem rain down from above while the wind tears the trees away from the earth itself. Rivers swell and rage through the jungle, preventing any form of travel by boat. Any guide worth their salt knows that the best choice is to hunker down and wait out the storm, but there are always those foolish enough to think they can test mother nature. Anyone braving the storm immediately gains a level of exhaustion and must make a DC 10 Constitution saving throw at the end of the day to prevent weariness from setting in. On top of the attributes of “Heavy Rain” all characters are also at disadvantage for making Wisdom(survival) checks to navigate.',
                            'Extremely Warm and Rainy - The heat rises to 35°C and above making movement cumbersome. Any character that decides to travel long distances during these days gets a level of exhaustion.',
                            'Extremely Warm and Dry - The heat rises to 35°C and above making movement cumbersome. Any character that decides to travel long distances during these days gets a level of exhaustion. Characters will need to actively prevent being dehydrated throughout the day.',
                        ],
                    },
                    {
                        name: 'Extreme',
                        texts: [
                            'Misty - A low mist hangs in the air that limits vision to a maximum of 150 ft. for everything of large size and smaller. Any such target is assumed to have total cover while anything huge or larger past this range is considered to have three-quarters cover. Any Survival(wisdom) check made to navigate through the mist has disadvantage.',
                            'Heavy Mist - A thick almost tangible mist drowns out any vision past 15ft. for everything large and smaller, with anything huge or larger only being visible up to 30ft. away. All sight based abilities outside of the 15ft. range are at disadvantage and all creatures and objects outside of that range are assumed to have total cover. This disadvantage cannot be negated and also applies to navigation unless the DM specifically allows you to.',
                            'Sunny with Rain Showers - Smaller localised rain clouds fill the skies, leaving the days filled both with rain and rainbows. There will be a 1 in 3 chance of it currently being dry on the character’s position.',
                            'Rainy - A sheet of rain falls over the land, creating a damp but slightly cosy atmosphere while walking under the massive trees of the jungle. Though the humidity rises most places within the jungle are still relatively dry due to the thick canopy catching most of the rain.',
                            'Heavy Rain - Rain and wind tear at the trees and pour down on any poor adventurer out to test their luck. Any Wisdom(perception) checks beyond 150ft. become blurred and are at disadvantage except for anything that’s huge or larger. Any creature outside of this range that is large or smaller gains the benefits of three-quarters cover and missile weapons ranges are halved.',
                            'Tropical Storm - The sky darkens as lighting, rain and mayhem rain down from above while the wind tears the trees away from the earth itself. Rivers swell and rage through the jungle, preventing any form of travel by boat. Any guide worth their salt knows that the best choice is to hunker down and wait out the storm, but there are always those foolish enough to think they can test mother nature. Anyone braving the storm immediately gains a level of exhaustion and must make a DC 10 Constitution saving throw at the end of the day to prevent weariness from setting in. On top of the attributes of “Heavy Rain” all characters are also at disadvantage for making Wisdom(survival) checks to navigate.',
                            'Extremely Warm and Rainy - The heat rises to 35°C and above making movement cumbersome. Any character that decides to travel long distances during these days gets a level of exhaustion.',
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
            if(!state[state_name].config.hasOwnProperty('use_seasons')){
                state[state_name].config.use_seasons = defaults.config.use_seasons;
            }
            if(!state[state_name].config.hasOwnProperty('use_holidays')){
                state[state_name].config.use_holidays = defaults.config.use_holidays;
            }
            if(!state[state_name].config.hasOwnProperty('use_weather')){
                state[state_name].config.use_weather = defaults.config.use_weather;
            }
            if(!state[state_name].config.hasOwnProperty('use_table')){
                state[state_name].config.use_table = defaults.config.use_table;
            }
            if(!state[state_name].config.hasOwnProperty('send_holidays')){
                state[state_name].config.send_holidays = defaults.config.send_holidays;
            }
            if(!state[state_name].config.hasOwnProperty('send_weather')){
                state[state_name].config.send_weather = defaults.config.send_weather;
            }
            if(!state[state_name].config.hasOwnProperty('send_table')){
                state[state_name].config.send_table = defaults.config.send_table;
            }
            if(!state[state_name].config.hasOwnProperty('use_token')){
                state[state_name].config.use_token = defaults.config.use_token;
            }
            if(!state[state_name].config.hasOwnProperty('tokenId')){
                state[state_name].config.tokenId = defaults.config.tokenId;
            }
            if(!state[state_name].config.hasOwnProperty('use_handout')){
                state[state_name].config.use_handout = defaults.config.use_handout;
            }
            if(!state[state_name].config.hasOwnProperty('show_handout_players')){
                state[state_name].config.show_handout_players = defaults.config.show_handout_players;
            }
            if(!state[state_name].config.hasOwnProperty('player_show_command')){
                state[state_name].config.player_show_command = defaults.config.player_show_command;
            }
        }
        if(!state[state_name].calendar){
            state[state_name].calendar = defaults.calendar;
        }else{
            if(!state[state_name].calendar.hasOwnProperty('current')){
                state[state_name].calendar.current = defaults.calendar.current;
            }else{
                if(!state[state_name].calendar.current.hasOwnProperty('day_of_the_month')){
                    state[state_name].calendar.current.day_of_the_month = defaults.calendar.current.day_of_the_month;
                }
                if(!state[state_name].calendar.current.hasOwnProperty('day_of_the_week')){
                    state[state_name].calendar.current.day_of_the_week = defaults.calendar.current.day_of_the_week;
                }
                if(!state[state_name].calendar.current.hasOwnProperty('day_of_the_year')){
                    state[state_name].calendar.current.day_of_the_year = defaults.calendar.current.day_of_the_year;
                }
                if(!state[state_name].calendar.current.hasOwnProperty('month')){
                    state[state_name].calendar.current.month = defaults.calendar.current.month;
                }
                if(!state[state_name].calendar.current.hasOwnProperty('year')){
                    state[state_name].calendar.current.year = defaults.calendar.current.year;
                }
                if(!state[state_name].calendar.current.hasOwnProperty('weather')){
                    state[state_name].calendar.current.weather = defaults.calendar.current.weather;
                }
            }
            if(!state[state_name].calendar.hasOwnProperty('months')){
                state[state_name].calendar.months = defaults.calendar.months;
            }
            if(!state[state_name].calendar.hasOwnProperty('weekdays')){
                state[state_name].calendar.weekdays = defaults.calendar.weekdays;
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

    LazyCalendar.checkInstall();
    LazyCalendar.registerEventHandlers();
});