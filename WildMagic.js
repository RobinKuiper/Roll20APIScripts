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

var WildMagic = WildMagic || (function() {
    'use strict';

    // Change the settings below.
    const CHARACTERS = 'Xandir,Whisper'; // A comma seperated list of characters who use Wild Magic (Multiple characters: 'John,Jake,Aron').
    const TIDES_MARKER = 'rolling-bomb'; // The status marker used while Tides of Chaos is active.
    const TIDES_MACRO = ''; // The name of the Tides of Chaos macro (case sensitive).
    const NORMAL_MACRO = ''; // The name of the normal macro (case sensitive).

    on('chat:message', (msg) => {
        if(msg && msg.rolltemplate && (msg.rolltemplate === 'spell' || msg.rolltemplate === 'atk' || msg.rolltemplate === 'dmg' || msg.rolltemplate === 'atkdmg')){
            let tides = false;
            let character_name = msg.content.match(/charname=([^\n{}]*[^"\n{}])/);            
            character_name = RegExp.$1;
            let attack_name = msg.content.match(/rname=([^\n{}]*[^"\n{}])/);            
            attack_name = RegExp.$1;
            let id = findObjs({ name: character_name, _type: 'character' }).shift().get('id') || false;
            if((msg.rolltemplate === 'atk' || msg.rolltemplate === 'dmg' || msg.rolltemplate === 'atkdmg') && (!id || !getObjects(getRepeatingSectionAttrs(id, 'spell-'), 'current', attack_name).length)) return;
            let allowed_characters = CHARACTERS.split(',');
            if(allowed_characters.includes(character_name)){
                let tokens = findObjs({
                    _type: 'graphic',
                    name: character_name,
                    pageid: Campaign().get('playerpageid')
                });
                if(tokens){
                    tokens.forEach(token => {
                        if(tides) return;

                        if(token.get('status_'+TIDES_MARKER)){
                            tides = true;
                        }  
                    })
                }

                let macros = findObjs({
                    _type: 'macro',
                    name: (tides) ? TIDES_MACRO : NORMAL_MACRO
                });

                if(!macros || !macros.length){
                    let text = (tides) ? 'Could not find the Tides of Chaos macro, please check it\'s name in the script.' : 'Could not find the normal macro, please check it\'s name in the script.';
                    sendChat('Wild Magic', text);
                    return
                }

                sendChat('Wild Magic', macros.shift().get('action'));
            }
        }
    });

    const getRepeatingSectionAttrs = (characterId, sectionName) => {
      const prefix = `repeating_${sectionName}`;
      return _.filter(findObjs({ type: 'attribute', characterid: characterId }),
        attr => attr.get('name').indexOf(prefix) === 0);
    }

    const getObjects = (obj, key, val) => {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
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
    }

})();