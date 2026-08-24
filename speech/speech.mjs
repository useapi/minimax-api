/*

Script version 1.0, August 23, 2026

Script to generate speech from text using MiniMax API by useapi.net 🚀
For more details visit https://useapi.net/docs/api-minimax-v1

Installation Instructions:
==========================

You need Node.js v21 or newer installed to run this script. Download and install Node.js from:

- Windows, macOS, Linux: https://nodejs.org/

After installation, verify by running the following commands in a terminal:

   node -v

Running the Script:
===================

Usage: node speech.mjs <API_TOKEN> [LINES_FILE]
       node speech.mjs <API_TOKEN> --voices [SEARCH]

Replace API_TOKEN with your actual useapi.net API token, see https://useapi.net/docs/start-here/setup-useapi
If optional LINES_FILE not provided lines.json will be used.

Example #1:
--------

node speech.mjs user:1234-abcdefhijklmnopqrstuv

This command executes the script using API token user:1234-abcdefhijklmnopqrstuv

Example #2:
--------

node speech.mjs user:1234-abcdefhijklmnopqrstuv mylines.json

This command executes the script using API token user:1234-abcdefhijklmnopqrstuv and loads lines from mylines.json file.

Example #3:
--------

node speech.mjs user:1234-abcdefhijklmnopqrstuv --voices british

Every line needs a voice_id, and the ids are opaque numbers. This lists the account's
voice catalogue, filtered to entries whose name or tags contain "british". Drop the
search term to list all 600+.

Changelog:
==========

- August 23, 2026: Initial version.

*/

import readline from 'node:readline';
import fs from 'fs/promises';
import { writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';

// Constants
const RESULTS_FILE = 'speech_results.txt';
const ERRORS_FILE = 'speech_errors.txt';
const SLEEP_429 = 20 * 1000; // in milliseconds
const SLEEP_POLL = 5 * 1000; // in milliseconds

const urlAccounts = 'https://api.useapi.net/v1/minimax/accounts';
const urlAvailable = 'https://api.useapi.net/v1/minimax/scheduler/available';
const urlCreate = 'https://api.useapi.net/v1/minimax/speech/create';
const urlSpeech = 'https://api.useapi.net/v1/minimax/speech/';
const urlVoices = 'https://api.useapi.net/v1/minimax/speech/voices/';

// Track accounts without an audio subscription (HTTP 412)
const noAudioSubscription = [];

let audioAccountsCount = 0;

// Utility to sleep for given milliseconds
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const elapsedTimeSec = (start) => (Date.now() - start) / 1000;

// The results file is tab separated — speech text routinely contains commas.
const label = (text) => (text ?? '').replace(/[\r\n\t]+/g, ' ').slice(0, 80);

// Function to fetch configured MiniMax API accounts
async function fetchAccounts(apiToken) {
    const response = await fetch(urlAccounts, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiToken}`
        }
    });

    if (!response.ok) {
        console.error(`⛔ Error fetching accounts (HTTP ${response.status}): ${response.statusText}`);
        process.exit(1);
    }

    return response.json();
}

// Speech has no local slot ceiling the way video does — scheduler/available reports
// how many speech generations each account already has in flight as executingAudio,
// so submit to the least busy one and let MiniMax's own 429 throttle the rest.
async function pickAccount(apiToken, accounts) {
    if (accounts.length == 1)
        return accounts[0];

    const candidates = accounts.filter(a => !noAudioSubscription.includes(a));

    if (candidates.length == 0)
        return undefined;

    try {
        const response = await fetch(urlAvailable, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${apiToken}`
            }
        });

        if (response.ok) {
            const json = await response.json();
            const load = Object.fromEntries((json.available ?? [])
                .map(a => [a.account, a.executingAudio ?? 0]));
            console.log(`Speech generations in flight:`,
                candidates.map(a => `${a} (${load[a] ?? 0})`).join(', '));
            return [...candidates].sort((a, b) => (load[a] ?? 0) - (load[b] ?? 0))[0];
        }
    } catch (error) {
        // Availability is an optimization, not a requirement — fall through.
        console.warn(`⚠️  Unable to read account availability:`, error.message ?? error);
    }

    return candidates[0];
}

// Function to list the voice catalogue so you can pick a voice_id for lines.json
async function listVoices(apiToken, account, search) {
    const url = new URL(urlVoices);
    if (account)
        url.searchParams.set('account', account);

    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiToken}`
        }
    });

    if (!response.ok) {
        console.error(`⛔ Error fetching voices (HTTP ${response.status}):`, await response.text());
        process.exit(1);
    }

    const json = await response.json();
    const needle = search?.toLowerCase();

    const voices = (json.voice_list ?? []).filter(v => !needle
        || v.voice_name?.toLowerCase().includes(needle)
        || v.tag_list?.some(t => t.toLowerCase().includes(needle)));

    for (const voice of voices)
        console.log(`${voice.voice_id}\t${voice.voice_name}\t${(voice.tag_list ?? []).join(', ')}`);

    console.log(`\n${voices.length} of ${json.total ?? voices.length} voice(s)${needle ? ` matching "${search}"` : ''}.`);

    if (json.has_more)
        console.log(`More pages are available — see https://useapi.net/docs/api-minimax-v1/get-minimax-speech-voices for page / page_size.`);
}

// Function to submit one line.
// `fields` is the line object minus the local-only `name` — it carries `text` and
// `voice_id` plus any optional parameters (model, emotion, speed, pitch, vol,
// language_boost, effects, …) and is forwarded to speech/create as-is.
async function submitLine(apiToken, lineIndex, name, fields) {
    const { text } = fields;
    console.log(`\n👉 Line #${lineIndex}: ${label(text)}`);

    const account = await pickAccount(apiToken, audioAccounts);

    if (!account) {
        console.error(`⛔ No MiniMax account with an audio subscription left`);
        process.exit(1);
    }

    const info = `Line #${lineIndex} account ${account}`;
    const startTime = Date.now();

    console.log(`${info} …`);

    const createResponse = await fetch(urlCreate, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify({ account, ...fields })
    });

    const createBody = await createResponse.text();

    // speech/create answers 201 Created, not 200
    if (createResponse.ok) {
        const json = JSON.parse(createBody);
        const audioId = json.audioId;
        if (audioId) {
            console.log(`🆗 ${audioId} (${elapsedTimeSec(startTime)} sec)`);
            await fs.appendFile(RESULTS_FILE, `${audioId}\t${name ?? ''}\t${label(text)}\n`);
            return 200;
        } else {
            const error = `No audioId found in HTTP ${createResponse.status} response`;
            console.log(`❓ ${info}: ${error}`, createBody);
            await fs.appendFile(ERRORS_FILE, `${error}\t${label(text)}\n`);
            return 500;
        }
    } else {
        let returnStatus = createResponse.status;
        switch (createResponse.status) {
            case 502: // Happens when MiniMax website is too busy
            case 504: // Happens when MiniMax website is too busy
            case 429: // Too many speech generations already running on this account
                console.log(`🔄️ ${info}: retry on HTTP ${createResponse.status}`);
                returnStatus = 429;
                break;
            case 422:
                console.log(`🛑 ${info}: MODERATED text`, createBody);
                await fs.appendFile(ERRORS_FILE, `${createResponse.status}\t${label(text)}\n`);
                break;
            case 412:
                // Speech bills against the MiniMax audio subscription, the same one music
                // uses — video credit on the account does not help.
                console.log(`🛑 ${info}: account has no audio subscription`, createBody);
                noAudioSubscription.push(account);
                break;
            default:
                console.log(`❗ ${info}: FAILED with HTTP ${createResponse.status}`, createBody);
                await fs.appendFile(ERRORS_FILE, `${createResponse.status}\t${label(text)}\n`);
        }
        return returnStatus;
    }
}

// Function to poll each submitted audioId and download the finished MP3
async function download(apiToken) {
    try {
        const resultsContent = await fs.readFile(RESULTS_FILE, 'utf8');
        const lines = resultsContent.trim().split('\n');

        for (const line of lines) {
            const [audioId, name, text] = line.split('\t');
            const audioFilename = `${name || audioId.replace(/:/g, '_')}.mp3`;

            console.log(`👉 ${audioId}`);

            try {
                await fs.access(audioFilename);
                console.log(`⚠️ ${audioFilename} already exists. Skipping download.`);
                continue;
            } catch {
                // File does not exist, proceed with downloading
            }

            while (true) {
                const response = await fetch(`${urlSpeech}${audioId}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${apiToken}`
                    }
                });

                if (!response.ok) {
                    console.log(`⛔ Unable to retrieve ${audioId} (HTTP ${response.status}):\n${text}\n`, await response.text());
                    break;
                }

                // statusLabel / statusFinal are added by useapi.net — every MiniMax
                // history row reports status 0 whether or not it finished, so poll on
                // statusFinal rather than status.
                const { statusFinal, statusLabel, audio_url, code, error } = await response.json();

                if (statusFinal) {
                    if (audio_url) {
                        console.log(`✅ Downloading ${audio_url} to ${audioFilename}`);
                        try {
                            const audioResponse = await fetch(audio_url);
                            if (!audioResponse.ok) {
                                console.error(`⛔ Unable to download ${audioId} (HTTP ${audioResponse.status}):\n${text}\n`, audio_url);
                                break;
                            }
                            const stream = Readable.fromWeb(audioResponse.body);
                            await writeFile(audioFilename, stream);
                        } catch (err) {
                            console.error(`⛔ Error during download: ${err}`);
                        }
                    } else
                        console.error(`🛑 ${audioId} ${statusLabel} (${code ?? ''} ${error ?? ''}):\n${text}\n`);

                    break;
                } else {
                    console.log(`⌛ ${audioId} is ${statusLabel} and still in progress, waiting…`);
                    await sleep(SLEEP_POLL);
                }
            }
        }
    } catch (error) {
        console.log(`⛔ Error during download:`, error.stack || error);
    }
}

// Accounts with an audio subscription, resolved once at startup
let audioAccounts = [];

// Main function
async function main() {
    const apiToken = process.argv[2];
    const secondArg = process.argv[3];

    if (!apiToken) {
        console.error('Usage: node speech.mjs <API_TOKEN> [LINES_FILE]');
        console.error('       node speech.mjs <API_TOKEN> --voices [SEARCH]');
        process.exit(1);
    }

    console.log('Script v1.0');

    console.log('Node version is: ' + process.version);

    try {
        audioAccounts = await resolveAudioAccounts(apiToken);

        if (secondArg == '--voices') {
            await listVoices(apiToken, audioAccounts[0], process.argv[4]);
            return;
        }

        const linesFile = secondArg || 'lines.json'; // Default to 'lines.json' if not provided

        if (await fileExists(RESULTS_FILE)) {
            let user_input;
            while (!['y', 'n'].includes(user_input)) {
                user_input = (await promptUser(`❔ ${RESULTS_FILE} file detected. Do you want to download the results now? (y/n): `))?.toLowerCase();
                if (user_input == 'y') {
                    await download(apiToken);
                    await fs.unlink(RESULTS_FILE);
                }
            }
        }

        const start = new Date();
        try {
            console.info('START EXECUTION', start);
            await execute(apiToken, linesFile);
        }
        finally {
            console.info('COMPLETED', new Date());
            console.info('EXECUTION ELAPSED', diffInMinutesAndSeconds(start, new Date()));
        }

        try {
            console.info('START DOWNLOAD', start);
            await download(apiToken);
        }
        finally {
            console.info('TOTAL ELAPSED', diffInMinutesAndSeconds(start, new Date()));
        }
    } catch (error) {
        console.error('⛔ Error during execution:', error.stack || error);
    }
}

async function resolveAudioAccounts(apiToken) {
    const accounts = await fetchAccounts(apiToken);

    const found = Object.values(accounts)
        .filter(a => a.supportAudio)  // Accounts with audio support
        .filter(a => !a.error)        // Active accounts without error
        .map(a => a.account);

    console.info(`Configured active MiniMax API audio accounts`, found.length);

    if (found.length <= 0) {
        console.error(`⛔ No configured active audio accounts found. Please refer to https://useapi.net/docs/start-here/setup-minimax`);
        process.exit(1);
    }

    audioAccountsCount = found.length;

    return found;
}

async function execute(apiToken, linesFile) {
    const linesData = await fs.readFile(linesFile, 'utf8');
    const lines = JSON.parse(linesData);
    console.log(`Total number of lines to process`, lines.length);

    let warnings = [];

    // First pass: check for warnings
    for (let i = 0; i < lines.length; i++) {
        const { text, voice_id } = lines[i];

        if (!text)
            warnings.push(`⚠️  Skip empty text at index ${i}`);

        if (!voice_id)
            warnings.push(`⚠️  Missing voice_id at index ${i}. Run with --voices to list the catalogue.`);
    }

    if (warnings.length > 0) {
        warnings.forEach(warning => console.warn(warning));
        console.error(`⛔ Execution stopped due to warnings.`);
        process.exit(1);
    }

    for (let i = 0; i < lines.length; i++) {
        const { name, ...fields } = lines[i];
        while (true) {
            const responseCode = await submitLine(apiToken, i + 1, name, fields);
            if (responseCode == 429)
                await sleep(SLEEP_429);
            else
                if (responseCode == 412) {
                    // Check if there are no audio accounts left at all
                    if (audioAccountsCount == noAudioSubscription.length) {
                        console.error(`⛔ No configured account has an audio subscription. Speech bills against the MiniMax audio plan, the same one music uses.`);
                        process.exit(1);
                    }
                } else
                    break;
        }
    }
}

// Utility function to check if a file exists
async function fileExists(path) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}

// Function to prompt user input
async function promptUser(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => rl.question(query, answer => {
        rl.close();
        resolve(answer);
    }));
}

function diffInMinutesAndSeconds(date1, date2) {
    const diffInSeconds = Math.floor((date2 - date1) / 1000);
    return `${Math.floor(diffInSeconds / 60)} minutes ${diffInSeconds % 60} seconds`;
};

main();
