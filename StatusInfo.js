/*
 * Version: 0.1.3
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1014
 * Roll20: https://app.roll20.net/users/1226016/robin-k
 * Roll20 Thread: https://app.roll20.net/forum/post/6252784/script-statusinfo
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
*/

(function() {
    const config = {
        sendOnlyToGM: false, // Send the descriptions only to the gm?
        showDescOnStatusChange: true // Show condition description on status marker change?
    }

    // Styling for the chat responses.
    const style = "background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;";
    const buttonStyle = "text-decoration: underline; background-color: #fff; color: #000; padding: 0";

    // All the conditions with descriptions/icons.
    const conditions = {
        blinded: {
            name: 'Blinded',
            descriptions: [
                'A blinded creature can’t see and automatically fails any ability check that requires sight.',
                'Attack rolls against the creature have advantage, and the creature’s Attack rolls have disadvantage.'
            ],
            icon: 'bleeding-eye'
        },
        charmed: {
            name: 'Charmed',
            descriptions: [
                'A charmed creature can’t Attack the charmer or target the charmer with harmful Abilities or magical effects.',
                'The charmer has advantage on any ability check to interact socially with the creature.'
            ],
            icon: 'broken-heart'
        },
        deafened: {
            name: 'Deafened',
            descriptions: [
                'A deafened creature can’t hear and automatically fails any ability check that requires hearing.'
            ],
            icon: 'edge-crack'
        },
        frightened: {
            name: 'Frightened',
            descriptions: [
                'A frightened creature has disadvantage on Ability Checks and Attack rolls while the source of its fear is within line of sight.',
                'The creature can’t willingly move closer to the source of its fear.'
            ],
            icon: 'screaming'
        },
        grappled: {
            name: 'Grappled',
            descriptions: [
                'A grappled creature’s speed becomes 0, and it can’t benefit from any bonus to its speed.',
                'The condition ends if the Grappler is <a style="' + buttonStyle + '" href="!condition incapacitated">incapacitated</a>.',
                'The condition also ends if an effect removes the grappled creature from the reach of the Grappler or Grappling effect, such as when a creature is hurled away by the Thunderwave spell.'
            ],
            icon: 'grab'
        },
        incapacitated: {
            name: 'Incapacitated',
            descriptions: [
                'An incapacitated creature can’t take actions or reactions.'
            ],
            icon: 'interdiction'
        },
        invisibility: {
            name: 'Invisibility',
            descriptions: [
                'An invisible creature is impossible to see without the aid of magic or a Special sense. For the purpose of Hiding, the creature is heavily obscured. The creature’s location can be detected by any noise it makes or any tracks it leaves.',
                'Attack rolls against the creature have disadvantage, and the creature’s Attack rolls have advantage.'
            ],
            icon: 'ninja-mask'
        },
        paralyzed: {
            name: 'Paralyzed',
            descriptions: [
                'A paralyzed creature is <a style="' + buttonStyle + '" href="!condition incapacitated">incapacitated</a> and can’t move or speak.',
                'The creature automatically fails Strength and Dexterity saving throws.',
                'Attack rolls against the creature have advantage.',
                'Any Attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.'
            ],
            icon: 'pummeled'
        },
        petrified: {
            name: 'Petrified',
            descriptions: [
                'A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.',
                'The creature is <a style="' + buttonStyle + '" href="!condition incapacitated">incapacitated</a>, can’t move or speak, and is unaware of its surroundings.',
                'Attack rolls against the creature have advantage.',
                'The creature automatically fails Strength and Dexterity saving throws.',
                'The creature has Resistance to all damage.',
                'The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized.'
            ],
            icon: 'frozen-orb'
        },
        poisoned: {
            name: 'Poisoned',
            descriptions: [
                'A poisoned creature has disadvantage on Attack rolls and Ability Checks.'
            ],
            icon: 'chemical-bolt'
        },
        prone: {
            name: 'Prone',
            descriptions: [
                'A prone creature’s only Movement option is to crawl, unless it stands up and thereby ends the condition.',
                'The creature has disadvantage on Attack rolls.',
                'An Attack roll against the creature has advantage if the attacker is within 5 feet of the creature. Otherwise, the Attack roll has disadvantage.'
            ],
            icon: 'back-pain'
        },
        restrained: {
            name: 'Restrained',
            descriptions: [
                'A restrained creature’s speed becomes 0, and it can’t benefit from any bonus to its speed.',
                'Attack rolls against the creature have advantage, and the creature’s Attack rolls have disadvantage.',
                'The creature has disadvantage on Dexterity saving throws.'
            ],
            icon: 'fishing-net'
        },
        stunned: {
            name: 'Stunned',
            descriptions: [
                'A stunned creature is <a style="' + buttonStyle + '" href="!condition incapacitated">incapacitated</a>, can’t move, and can speak only falteringly.',
                'The creature automatically fails Strength and Dexterity saving throws.',
                'Attack rolls against the creature have advantage.'
            ],
            icon: 'fist'
        },
        unconscious: {
            name: 'Unconscious',
            descriptions: [
                'An unconscious creature is <a style="' + buttonStyle + '" href="!condition incapacitated">incapacitated</a>, can’t move or speak, and is unaware of its surroundings.',
                'The creature drops whatever it’s holding and falls prone.',
                'The creature automatically fails Strength and Dexterity saving throws.',
                'Attack rolls against the creature have advantage.',
                'Any Attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.'
            ],
            icon: 'sleepy'
        },
    }

    // Check if response needs to be whispered to the gm only.
    const whisper = (config.sendOnlyToGM) ? '/w gm ' : '';

    on('chat:message', function(msg) {
        if (msg.type != 'api') return;

        // !condition Blinded

        // Split the message into command and argument(s)
        let args = msg.content.split(' ');
        let command = args.shift().substring(1);
        let conditionName = args[0];

        if(command === 'condition'){
            if(conditionName){
                let condition;
                // Check if hte condition exists in the condition object.
                if(condition = getConditionByName(conditionName)){
                    // Send it to chat.
                    sendConditionToChat(condition);
                }else{
                    sendChat('Error', whisper + 'Condition ' + conditionName + ' does not exist.');
                }
            }else{
                sendChat('', '<div style="'+style+'">Type `!condition` with the condition name behind it, eg: `!condition prone`</div>')
            }
        }
    });

    if(config.showDescOnStatusChange){
        on('ready', () => {
            // Handle condition descriptions when tokenmod changes the statusmarkers on a token.
            if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange){
                TokenMod.ObserveTokenChange(function(obj,prev){
                handleStatusmarkerChange(obj,prev);
                });
            }
        });

        // Handle condition descriptions when the statusmarkers are changed manually on a token.
        on('change:graphic:statusmarkers', (obj, prev) => {
            handleStatusmarkerChange(obj,prev);
        });
    }

    const handleStatusmarkerChange = (obj, prev) => {
        // Check if the statusmarkers string is different from the previous statusmarkers string.
        if(obj.get('statusmarkers') !== prev.statusmarkers){
            // Create arrays from the statusmarkers strings.
            var prevstatusmarkers = prev.statusmarkers.split(",");
            var statusmarkers = obj.get('statusmarkers').split(",");

            // Loop through the statusmarkers array.
            statusmarkers.forEach(function(marker){
                // If it is a new statusmarkers, get the condition from the conditions object, and send it to chat.
                if(marker !== "" && !prevstatusmarkers.includes(marker)){
                    let condition;
                    if(condition = getConditionByMarker(marker)){
                        sendConditionToChat(condition);
                    }
                }
            });
        }
    }

    const getConditionByMarker = (marker) => {
        return getObjects(conditions, 'icon', marker).shift() || false;
    }

    const getConditionByName = (name) => {
        return conditions[name.toLowerCase()] || false;
    }

    const sendConditionToChat = (condition) => {
        let description = '';
        condition.descriptions.forEach((desc) => {
            description += '<p>'+desc+'</p>';
        });
        sendChat("", whisper + "<div style='" + style + "'><h2>"+condition.name+"</h2>"+ description +"</div>");
    }

    //return an array of objects according to key, value, or key and value matching
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