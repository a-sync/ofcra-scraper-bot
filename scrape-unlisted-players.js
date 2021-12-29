
const axios = require('axios');
const fs = require('fs-extra');
const players = require('./ofcra-players.json');

async function main () {
    for (let i = 0; i <= 1592; i++) {
        console.log('\nID:', i);
        if (players[i] === undefined) {
            const player_html = await axios.get('https://game.ofcra.org/stats/player.php?id=' + i).catch(err => {
                if (err.response.status === 500) {
                    console.log('  n/a');
                } else {
                    console.error('  ' + err.message);
                }
            });

            if (player_html) {
                // console.log('  player_html.data.length', player_html.data.length);
                const player_name = player_html.data.match(/<h1 class=\"h2\">Player details - (.+?)\s+(<span class=\"verified\"><\/span>)?<\/h1>/);

                if (player_name.length > 0) {
                    console.log('  ' + player_name[1]);
                    
                    players[i] = { Name: player_name[1] };
                }
            }
        } else {
            console.log('  ' + players[i].Name);
        }
        
        //if (i > 9) break;//debug
    }

    fs.writeFileSync('ofcra-players-all.json', JSON.stringify(players, null, 2));
}

main();
