createWhisperName = (name) => {
    return name.split(' ').shift();
},

// STRINGS
handleLongString = (str, max=8) => {
    return (str.length > max) ? str.slice(0, 8) + '...' : str;
},

ucFirst = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
},

// STATUSMARKERS
statusmarkersToObject = (stats) => {
    return _.reduce(stats.split(/,/), function(memo, value) {
        var parts = value.split(/@/),
            num = parseInt(parts[1] || '0', 10);

        if (parts[0].length) {
            memo[parts[0]] = Math.max(num, memo[parts[0]] || 0);
        }

        return memo;
    }, {});
},

objectToStatusmarkers = (obj) => {
    return _.map(obj, function(value, key) {
                return key === 'dead' || value < 1 || value > 9 ? key : key + '@' + parseInt(value);
            })
            .join(',');
},


/*
markers = ['blue', 'brown', 'green', 'pink', 'purple', 'red', 'yellow', '-', 'all-for-one', 'angel-outfit', 'archery-target', 'arrowed', 'aura', 'back-pain', 'black-flag', 'bleeding-eye', 'bolt-shield', 'broken-heart', 'broken-shield', 'broken-skull', 'chained-heart', 'chemical-bolt', 'cobweb', 'dead', 'death-zone', 'drink-me', 'edge-crack', 'fishing-net', 'fist', 'fluffy-wing', 'flying-flag', 'frozen-orb', 'grab', 'grenade', 'half-haze', 'half-heart', 'interdiction', 'lightning-helix', 'ninja-mask', 'overdrive', 'padlock', 'pummeled', 'radioactive', 'rolling-tomb', 'screaming', 'sentry-gun', 'skull', 'sleepy', 'snail', 'spanner',   'stopwatch','strong', 'three-leaves', 'tread', 'trophy', 'white-tower'],
let markerDropdown = '?{Marker';
markers.forEach((marker) => {
    markerDropdown += '|'+ucFirst(marker).replace('-', ' ')+','+marker
})
markerDropdown += '}';

let death_markerButton = makeButton(state[state_name].config.death_statusmarker, '!' + state[state_name].config.command + ' config death_statusmarker|'+markerDropdown, styles.button + styles.float.right);