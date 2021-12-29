
const fs = require('fs-extra');
const ops = require('./ofcra-ops.json');

const filtered_ops = [];
for (const i in ops) {
    filtered_ops.push({
        id: i,
        mission_author: ops[i].Author
    });
}

fs.writeFileSync('ofcra-ops-authors.json', JSON.stringify(filtered_ops, null, 2));
