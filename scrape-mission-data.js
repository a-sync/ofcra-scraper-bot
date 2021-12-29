
const axios = require('axios');
const fs = require('fs-extra');
const missions = require('./ofcra-missions.json');

async function main () {
    let i = 0;
    for (const op_id in missions) {
        i++;
        console.log('\nOP ID', op_id);

        missions[op_id]['end_winner'] = '';
        missions[op_id]['commanders'] = {};

        const mission_html = await axios.get('https://game.ofcra.org/stats/mission.php?id=' + missions[op_id]['ID']);
        // console.log('mission_html.data.length', mission_html.data.length);

        const lead_and_score = mission_html.data.match(/<h3>Lead and score<\/h3>\s*<ul>\s*(.*?)\s*<\/ul>/);
        if (lead_and_score.length > 0) {
            const winner = lead_and_score[0].match(/<li>Victory\: <span class=\"\w+\">(.*?)<\/span><\/li>/);
            if (winner !== null && typeof winner[1] === 'string') {
                // console.log('winner', winner[1]);
                missions[op_id]['end_winner'] = winner[1];
            }

            const leads = lead_and_score[0].matchAll(/<li>(\w+) side leader\: <a class=\"\w+\" href=\"player\.php\?id=\d+\">(.*?)<\/a><\/li>/g);
            if (leads !== null) {
                const cmd = [...leads];
                if (cmd.length) {
                    for (const c of cmd) {
                        // console.log('cmd', c[1], c[2]);
                        missions[op_id]['commanders'][c[1]] = c[2];
                    }
                }
            }
        } else {
            console.error('  failed to parse lead & score');
        }

        console.log('  win', missions[op_id]['end_winner']);
        console.log('  cmd', missions[op_id]['commanders']);
        // if (i > 9) break; // debug
    }

    console.log('missions scraped: ' + i);
    fs.writeFileSync('ofcra-ops.json', JSON.stringify(missions, null, 2));
}

main();
