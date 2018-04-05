/*
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1014
 * Roll20: https://app.roll20.net/users/1226016/robin-k
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
*/

(function() {
    const config = {
        sendOnlyToGM: false, // Send the descriptions only to the gm?
        showDescOnStatusChange: true // Show condition description on status marker change?
    }

    const style = "background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;";
    const buttonStyle = "text-decoration: underline; background-color: #fff; color: #000; padding: 0";

    const conditions = {
        blinded: {
            name: 'Blinded',
            description: '<p>A blinded creature can’t see and automatically fails any ability check that requires sight.</p><p>Attack rolls against the creature have advantage, and the creature’s Attack rolls have disadvantage.</p>',
            icon: 'bleeding-eye'
        },
        charmed: {
            name: 'Charmed',
            description: '<p>A charmed creature can’t Attack the charmer or target the charmer with harmful Abilities or magical effects.</p><p>The charmer has advantage on any ability check to interact socially with the creature.</p>',
            icon: 'broken-heart'
        },
        deafened: {
            name: 'Deafened',
            description: '<p>A deafened creature can’t hear and automatically fails any ability check that requires hearing.</p>',
            icon: 'edge-crack'
        },
        frightened: {
            name: 'Frightened',
            description: '<p>A frightened creature has disadvantage on Ability Checks and Attack rolls while the source of its fear is within line of sight.</p><p>The creature can’t willingly move closer to the source of its fear.</p>',
            icon: 'screaming'
        },
        grappled: {
            name: 'Grappled',
            description: '<p>A grappled creature’s speed becomes 0, and it can’t benefit from any bonus to its speed.</p><p>The condition ends if the Grappler is <a style="' + buttonStyle + '" href="!condition incapacitated">incapacitated</a>.</p><p>The condition also ends if an effect removes the grappled creature from the reach of the Grappler or Grappling effect, such as when a creature is hurled away by the Thunderwave spell.</p>',
            icon: 'grab'
        },
        incapacitated: {
            name: 'Incapacitated',
            description: '<p>An incapacitated creature can’t take actions or reactions.</p>',
            icon: 'interdiction'
        },
        invisibility: {
            name: 'Invisibility',
            description: '<p>An invisible creature is impossible to see without the aid of magic or a Special sense. For the purpose of Hiding, the creature is heavily obscured. The creature’s location can be detected by any noise it makes or any tracks it leaves.</p><p>Attack rolls against the creature have disadvantage, and the creature’s Attack rolls have advantage.</p>',
            icon: 'ninja-mask'
        },
        paralyzed: {
            name: 'Paralyzed',
            description: '<p>A paralyzed creature is <a style="' + buttonStyle + '" href="!condition incapacitated">incapacitated</a> and can’t move or speak.</p><p>The creature automatically fails Strength and Dexterity saving throws.</p><p>Attack rolls against the creature have advantage.</p><p>Any Attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.</p>',
            icon: 'pummeled'
        },
        petrified: {
            name: 'Petrified',
            description: '<p>A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.</p><p>The creature is <a style="' + buttonStyle + '" href="!condition incapacitated">incapacitated</a>, can’t move or speak, and is unaware of its surroundings.</p><p>Attack rolls against the creature have advantage.</p><p>The creature automatically fails Strength and Dexterity saving throws.</p><p>The creature has Resistance to all damage.</p><p>The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized.</p>',
            icon: 'frozen-orb'
        },
        poisoned: {
            name: 'Poisoned',
            description: '<p>A poisoned creature has disadvantage on Attack rolls and Ability Checks.</p>',
            icon: 'chemical-bolt'
        },
        prone: {
            name: 'Prone',
            description: '<p>A prone creature’s only Movement option is to crawl, unless it stands up and thereby ends the condition.</p><p>The creature has disadvantage on Attack rolls.</p><p>An Attack roll against the creature has advantage if the attacker is within 5 feet of the creature. Otherwise, the Attack roll has disadvantage.</p>',
            icon: 'back-pain'
        },
        restrained: {
            name: 'Restrained',
            description: '<p>A restrained creature’s speed becomes 0, and it can’t benefit from any bonus to its speed.</p><p>Attack rolls against the creature have advantage, and the creature’s Attack rolls have disadvantage.</p><p>The creature has disadvantage on Dexterity saving throws.</p>',
            icon: 'fishing-net'
        },
        stunned: {
            name: 'Stunned',
            description: '<p>A stunned creature is <a style="' + buttonStyle + '" href="!condition incapacitated">incapacitated</a>, can’t move, and can speak only falteringly.</p><p>The creature automatically fails Strength and Dexterity saving throws.</p><p>Attack rolls against the creature have advantage.</p>',
            icon: 'fist'
        },
        unconscious: {
            name: 'Unconscious',
            description: '<p>An unconscious creature is <a style="' + buttonStyle + '" href="!condition incapacitated">incapacitated</a>, can’t move or speak, and is unaware of its surroundings</p><p>The creature drops whatever it’s holding and falls prone.</p><p>The creature automatically fails Strength and Dexterity saving throws.</p><p>Attack rolls against the creature have advantage.</p><p>Any Attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.</p>',
            icon: 'sleepy'
        },
    }

    const whisper = (config.sendOnlyToGM) ? '/w gm ' : '';

    on('chat:message', function(msg) {
        if (msg.type != 'api') return;

        // !condition Blinded

        let args = msg.content.split(' ');
        let command = args.shift().substring(1);
        let conditionName = args[0];

        if(command === 'condition'){
            if(conditionName){
                let condition;
                if(condition = getConditionByName(conditionName)){
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
            if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange){
                TokenMod.ObserveTokenChange(function(obj,prev){
                handleStatusmarkerChange(obj,prev);
                });
            }
        });

        on('change:graphic:statusmarkers', (obj, prev) => {
            handleStatusmarkerChange(obj,prev);
        });
    }

    const handleStatusmarkerChange = (obj, prev) => {
        if(obj.get('statusmarkers') !== prev.statusmarkers){
            var prevstatusmarkers = prev.statusmarkers.split(",");
            var statusmarkers = obj.get('statusmarkers').split(",");

            statusmarkers.forEach(function(marker){
                if(marker !== ""){
                    if(!prevstatusmarkers.includes(marker)){
                        let condition;
                        if(condition = getConditionByMarker(marker)){
                            sendConditionToChat(condition);
                        }
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
        sendChat("", whisper + "<div style='" + style + "'><h2>"+condition.name+"</h2>"+ condition.description +"</div>");
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