var ApiHelper = ApiHelper || (function() {
    'use strict';

    const script_name = 'ApiHelper',
    underscore_names = ['id','type','pageid','path','subtype','cardid','zorder','d20userid','displayname','online','lastpage','macrobar','playerid','rollabletableid','characterid','currentDeck','currentIndex','currentCardShown','deckid','parentid',],

    handleInput = (msg) => {
        if (msg.type != 'api') return;

        // Split the message into command and argument(s)
        let args = msg.content.split(' ');
        let command = args.shift().substring(1);
        let extracommand = args.shift();
        let options;

        if (command == 'api') {
            switch(extracommand){
                // !api remove name:Lyralei type:graphic --not pageid:-KmmW14C0UKL4R8X7g6K
                case 'remove':
                    options = processOptions(args, true);
                    findObjs(options.remove).forEach(result => {
                        let JustDoIt = true;
                        for(let not in options.not){
                            if(result.get(not) === options.not[not]){
                                JustDoIt = false;
                            }
                        }

                        if(JustDoIt){
                            let log_text = 'Removed ['+result.get('type')+'] ';
                            log_text += result.get('name') || result.get('displayname') || result.get('id');
                            log_text += (result.get('pageid')) ? ' from page ' + getObj('page', result.get('pageid')).get('name') : '';    

                            log(log_text);
                            result.remove();
                        }
                    })
                break;

                case 'find':
                    options = processOptions(args);
                    let objects = findObjs(options.find);
                    objects.forEach(obj => {
                        let whole_object = true;
                        for(let value in options.values){
                            whole_object = false;
                            log(value + ': ' + obj.get(value));
                        }

                        if(whole_object){
                            log(obj.get('type').toUpperCase())
                            log(obj);
                        }
                    });
                break;

                case 'cls':
                    let i = 0;
                    while(i < 100){
                        log('');
                        i++
                    }
                break;

                default:
                    
                break;
            }
        }
    },

    processOptions = (args, remove) => {
        let options = {
            find: {},
            not: {},
            remove: {},
            values: {}
        };
        const run_type = (remove) ? 'remove' : 'find';
        let type = run_type;
        args.forEach((option, i) => {
            if(option.includes('--')){
                type = option.replace('--', '');
                type = (options[type]) ? type : run_type;
                return;
            }

            option = option.split(':');
            let key = option[0];
            let value = option[1];
            if(underscore_names.includes(key)){
                key = '_'+key;
            }
            options[type][key] = value;
        });

        return options;
    },

    pre_log = (message) => {
        log('---------------------------------------------------------------------------------------------');
        if(message === 'line'){ return; }
        log(message);
        log('---------------------------------------------------------------------------------------------');
    },

    registerEventHandlers = () => {
        on('chat:message', handleInput);
    };

    return {
        RegisterEventHandlers: registerEventHandlers
    }
})();

on('ready',function() {
    'use strict';

    ApiHelper.RegisterEventHandlers();
});