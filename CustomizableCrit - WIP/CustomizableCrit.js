/* WORK IN PROGRESS
 *
 * Version 0.1.0
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1014
 * Roll20: https://app.roll20.net/users/1226016/robin-k
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
*/

var CustomizableCrit = CustomizableCrit || (function() {
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
    script_name = 'CustomizableCrit',
    state_name = 'CUSTOMIZABLECRIT',

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
                    sendConfigMenu(false, 'The settings are resetted to default.');
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
                    //!critical hit.bludgeoning 15 3
                    let table_string = extracommand;
                    let roll_result = args.shift();
                    let roll_amount = args.shift();

                    let result = rollOnTable(table_string);

                    makeAndSendMenu(result, '', 'gm');
                break;
            }
        }
    },

    rollOnTable = (table_string) => {
        pre_log()
        let table = state[state_name].tables;
        table_string.split('.').forEach(t => {
            table = table[t];
        });

        let result = '';
        let roll = Math.round(Math.random() * ((table.length-1) - 0) + 0);

        result += table[roll].desc;

        if(!table[roll].extras) return result;

        table[roll].extras.forEach(extra => {
            result += '\n'+rollOnTable(extra);
        })

        return result;
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
        sendChat(script_name, whisper + '<div style="'+styles.menu+styles.overflow+'">'+title+contents+'</div>', null, {noarchive:true});
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
    },

    setDefaults = (reset) => {
        const defaults = {
            config: {
                command: 'critical'
            },
            tables: {
                hit: {
                    bludgeoning: [
                        { desc: '<b>You call that a crit?</b> Roll damage as normal.'},
                        { desc: '<b>Smashed off balance?</b> Roll damage as normal and the next attack against the creature has advantage.'},
                        { desc: '<b>Good Hit!</b> Do not roll your damage dice, instead deal the maximum result possible with those dice.'},
                        { desc: '<b>Sent reeling!</b> Do not roll your damage dice, instead deal the maximum result possible with those dice and push the creature up to 15 feet in any direction.'},
                        { desc: '<b>Great hit!</b> Roll your damage dice twice and add them together.'},
                        { desc: '<b>Take a seat!</b> Roll damage dice twice and add them together and the creature is knocked prone.'},
                        { desc: '<b>Rocked and rolled!</b> Roll damage dice twice and add them together, push the creature up to 15 feet away, and the creature is knocked prone.'},
                        { desc: '<b>Grievous injury!</b> Deal the maximum amount of damage from your normal damage dice then roll your damage dice and add the result. Then roll on the Minor Injury chart. If the creature is wearing heavy armor roll on the Major Injury chart instead.', extras: ['injuries.minor'] },
                        { desc: '<b>Crushed!</b> Deal the twice maximum result of your damage dice and roll on the major injury table.', extras: ['injuries.major'] },
                        { desc: '<b>Splat!</b> Deal the maximum result of your damage dice twice, the creature is stunned until the end of your next turn, and roll on the major injury table.', extras: ['injuries.major'] },
                    ],
                    piercing: [],
                    slashing: [],
                    acid: [],
                    cold: [],
                    fire: [],
                    force: [],
                    lightning: [],
                    necrotic: [],
                    poison: [],
                    psychic: [],
                    radiant: [],
                    thunder: [],
                },
                miss: {
                    melee: [],
                    ranged_throw: [],
                    ranged_shoot: [],
                    natural_weapon: [],
                    spell: []
                },
                injuries: {
                    minor: [{desc: 'minor1'}],
                    major: [{desc: 'major2'}]
                }
            }
        };

        if(!state[state_name].config){
            state[state_name].config = defaults.config;
        }else{
            if(!state[state_name].config.hasOwnProperty('command')){
                state[state_name].config.command = defaults.config.command;
            }
        }

        if(!state[state_name].hasOwnProperty('tables')){
            state[state_name].tables = defaults.tables;
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

    CustomizableCrit.CheckInstall();
    CustomizableCrit.RegisterEventHandlers();
});