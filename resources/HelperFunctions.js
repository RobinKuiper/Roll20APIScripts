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