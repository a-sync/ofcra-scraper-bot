const puppeteer = require('puppeteer-core');
const ofcra_ops = require('./ofcra-ops.json');

const HOST = 'https://ofcra-stats.devs.space';//http://localhost

// Valid types to parse
const op_type_event_id = {
    'Official game': 'official',
    'Public game': 'public',
    'Small game': 'small'
};

const op_winner_side_id = {
    'Bluefor': 'WEST',
    'Redfor': 'EAST',
    'Greenfor': 'GUER',
    'Civilian': 'CIV'
};

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        // channel: 'chrome-canary',
        executablePath: 'C:\\Users\\Smith\\AppData\\Local\\Google\\Chrome SxS\\Application\\chrome.exe',
        userDataDir: './userData',
        defaultViewport: null
    });
    const page = await browser.newPage();

    page.on('console', consoleObj => {
        if (consoleObj.type() === 'error') {
            console.error('  ' + consoleObj.text());
        }
    })

    console.log('Login...');
    let login_res = await page.goto(HOST + '/login/puppeteer/e69b75cb143e5406dadf96ea6f674346258584d3afaf9f70e3de798105de8cc2');
    console.log('login_res.status()', login_res.status());

    let c = 0;
    for (const op_id in ofcra_ops) {
        console.log('\nTask ' + (++c) + '. (op id: ' + op_id + ')');
        const op = ofcra_ops[op_id];

        if (op_type_event_id[op.Type] === undefined) {
            console.log('  skipping op with type `' + op.Type + '`');
            continue;
        }
        if (op.TOTAL < 7) {
            console.log('  skipping op with less than `7` players');
            continue;
        }

        await page.goto(HOST + '/manage/' + op_id);
        if ((await page.$('button[value=parse]')) !== null) {
            await page.click('.mdc-radio input[id=event-' + op_type_event_id[op.Type] + ']');

            console.log('  start parse');
            await Promise.all([
                page.click('button[value=parse]'),
                page.waitForNavigation({waitUntil: 'load', timeout: 0})
            ]);

            if (op.Author !== '' || op.end_winner !== '' || Object.keys(op.commanders).length > 0) {
                await page.goto(HOST + '/manage/' + op_id + '/verify');

                if (op.Author !== '') {
                    console.log('  author: ' + op.Author);
                    // await page.type('input[name=mission_author]', op.Author, { delay: 50 });
                    await page.$eval('input[name=mission_author]', el => el.value = op.Author);
                }

                if (op.end_winner !== '') {
                    console.log('  winner: ' + op_winner_side_id[op.end_winner]);
                    await page.click('.mdc-checkbox input[value=' + op_winner_side_id[op.end_winner] + ']');
                }

                if (Object.keys(op.commanders).length > 0) {
                    for (const s in op.commanders) {
                        const name = op.commanders[s];

                        console.log('  ' + op_winner_side_id[s] + ' CMD: ' + name);
                        await page.evaluate((side_class, cmd_name) => {
                            const select = document.querySelector('#cmd-' + side_class);
                            const select_options = select.querySelectorAll('option');
                            const selected_option = [...select_options].find(option => {
                                const text_arr = option.text.split(' ', 2);
                                return text_arr[1] === cmd_name;
                            });
    
                            if (selected_option !== undefined) {
                                selected_option.selected = true;
                            } else {
                                console.error('  failed to find commander in select');
                            }
                            // reset_form();
                        }, op_winner_side_id[s].toLowerCase(), name);
                    }
                }

                console.log('  save verified data');
                await Promise.all([
                    page.click('button[value=update]'),
                    page.waitForNavigation({waitUntil: 'load'})
                ]);
            } else {
                console.log('  no verified data');
            }
        } else {
            console.log('  already parsed');
        }
    }

    await browser.close();
})();
