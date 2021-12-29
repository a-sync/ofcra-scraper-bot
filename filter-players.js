
const fs = require('fs-extra');
const players = require('./ofcra-players-all.json');

const names = {};
const filtered_players = [];
for (const i in players) {
    const o = players[i];
    if (names[o.Name] === undefined) {
        filtered_players.push({
            id: i,
            name: o.Name
        });
    } else {
        console.log('DUPE NAME! ', o.Name, i);
    }
    names[o.Name] = true;
}

fs.writeFileSync('ofcra-players-all-filtered.json', JSON.stringify(filtered_players, null, 2));
