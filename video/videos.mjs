/*

Script version 3.0, June 15, 2026

Script to generate videos using prompts with MiniMax API by useapi.net 🚀
For more details visit https://useapi.net/docs/api-minimax-v1 

Installation Instructions:
==========================

You need Node.js v21 or newer installed to run this script. Download and install Node.js from:

- Windows, macOS, Linux: https://nodejs.org/

After installation, verify by running the following commands in a terminal:

   node -v

Running the Script:
===================

Usage: node videos.mjs <API_TOKEN> [PROMPTS_FILE]

Replace API_TOKEN with your actual useapi.net API token, see https://useapi.net/docs/start-here/setup-useapi
If optional PROMPTS_FILE not provided videos.json will be used.

Example #1:
--------

node videos.mjs user:1234-abcdefhijklmnopqrstuv 

This command executes the script using API token user:1234-abcdefhijklmnopqrstuv 

Example #2:
--------

node videos.mjs user:1234-abcdefhijklmnopqrstuv myprompts.json

This command executes the script using API token user:1234-abcdefhijklmnopqrstuv and load prompts from myprompts.json file.

Changelog:
==========

- October 23, 2024: Response code 596 handling added https://useapi.net/docs/api-minimax-v1/post-minimax-videos-create#responses.
- October 25, 2024: The param prompt is optional and no longer needed if a fileID is provided.
- November 4, 2024: Retry on 502 and 504.
- June 15, 2026: Pass through per-prompt model parameters (model, options, resolution, duration, aspectRatio, end_frame_fileID, …) so you can target Hailuo 02/2.3, Sora 2, Veo 3.1 and Seedance 2.0. Any field other than the local "file" upload path is forwarded to videos/create as-is.

*/

import readline from 'node:readline';
import fs from 'fs/promises';
import { writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';

// Constants
const RESULTS_FILE = 'videos_results.txt';
const ERRORS_FILE = 'videos_errors.txt';
const SLEEP_429 = 20 * 1000; // in milliseconds
const SLEEP_DOWNLOAD = 30 * 1000; // in milliseconds

const urlAccounts = 'https://api.useapi.net/v1/minimax/accounts';
const urlAvailable = 'https://api.useapi.net/v1/minimax/scheduler/available';
const urlCreate = 'https://api.useapi.net/v1/minimax/videos/create';
const urlDownload = 'https://api.useapi.net/v1/minimax/videos/';
const urlUploadFile = 'https://api.useapi.net/v1/minimax/files/?account=';

// To upload .webp rename it to .jpeg
const supportedFileExtensions = ['png', 'jpeg']

// account: { filename: fileID }
const uploadedFiles = {};

let availableAccountsCount = 0;

// Track accounts without any credits left
const outOfCredits = [];

// Utility to sleep for given milliseconds
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

const elapsedTimeSec = (start) => (Date.now() - start) / 1000;

async function uploadFile(apiToken, account, filename) {
    if (!uploadedFiles[account])
        uploadedFiles[account] = {};

    // Check if already uploaded for provided account
    if (uploadedFiles[account].hasOwnProperty(filename))
        return uploadedFiles[account][filename];

    const startTime = Date.now();

    console.log(`⬆️  Account ${account} uploading file…`, filename);

    const body = new Blob([await fs.readFile(filename)]);

    const fileExt = filename.split('.').pop();

    const response = await fetch(`${urlUploadFile}${account}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': `image/${fileExt}`
        },
        body
    });

    if (response.ok) {
        const json = await response.json();
        console.log(`🆗  fileID (${elapsedTimeSec(startTime)} sec)`, json.fileID);
        uploadedFiles[account][filename] = json.fileID;
    }
    else {
        console.error(`❗ Unable to upload file HTTP ${response.status} (${elapsedTimeSec(startTime)} sec)`, await response.text());
        // Do not attempt to upload failed file again 
        uploadedFiles[account][filename] = undefined;
    }

    return uploadedFiles[account][filename];
}

// Function to submit a prompt.
// `fields` is the prompt object minus the local `file` upload path — it carries
// `prompt` plus any optional model parameters (model, options, resolution,
// duration, aspectRatio, end_frame_fileID, …) and is forwarded to videos/create as-is.
async function submitPrompt(apiToken, filename, promptIndex, fields) {
    const { prompt } = fields;
    console.log(`\n👉 Prompt #${promptIndex}: ${prompt ?? '(image only)'}`);

    const availableResponse = await fetch(urlAvailable, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiToken}`
        }
    });

    const availableJSON = await availableResponse.json();

    console.log(`Currently executing ${availableJSON.executing.length} generation(s).`);

    const available = availableJSON.available
        .filter(a => !outOfCredits.includes(a.account));

    console.log(`Available accounts ${available.length}:`, available.map(a => `${a.account} (${a.available})`).join(', '));

    if (available.length == 0) {
        console.log(`🔄️ Waiting for currently running generations to complete …`);
        return 429;
    }

    const account = available[0].account;

    const fileID = filename ? await uploadFile(apiToken, account, filename) : undefined;

    const info = `Prompt #${promptIndex} account ${account}`;

    console.log(`${info} …`);

    const createResponse = await fetch(urlCreate, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify({ account, fileID, ...fields })
    });

    const createBody = await createResponse.text();

    if (createResponse.status == 200) {
        const json = JSON.parse(createBody);
        const videoId = json.videoId;
        if (videoId) {
            await fs.appendFile(RESULTS_FILE, `${videoId},${prompt}\n`);
            return 200;
        } else {
            const error = `No videoId found in HTTP 200 response`;
            console.log(`❓ ${info}: ${error}`, createBody);
            await fs.appendFile(ERRORS_FILE, `${error},${prompt}\n`);
            return 500;
        }
    } else {
        let returnStatus = createResponse.status;
        switch (createResponse.status) {
            case 502: // Happens when MiniMax website is too busy
            case 504: // Happens when MiniMax website is too busy
            case 429:
                console.log(`🔄️ ${info}: retry on HTTP ${createResponse.status}`);
                returnStatus = 429;
                break;
            case 422:
                console.log(`🛑 ${info}: MODERATED prompt`, createBody);
                await fs.appendFile(ERRORS_FILE, `${createResponse.status},${prompt}\n`);
                break;
            case 412:
                console.log(`🛑 ${info}: account run out of credits`, createBody);
                outOfCredits.push(account);
                break;
            default:
                console.log(`❗ ${info}: FAILED with HTTP ${createResponse.status}`, createBody);
                await fs.appendFile(ERRORS_FILE, `${createResponse.status},${prompt}\n`);
        }
        return returnStatus;
    }
}

// Function to download videos based on VIDEO IDs
async function download(apiToken) {
    try {
        const resultsContent = await fs.readFile(RESULTS_FILE, 'utf8');
        const lines = resultsContent.trim().split('\n');

        for (const line of lines) {
            const [videoId, prompt] = line.split(',');
            const videoFilename = `${videoId.replace(/:/g, '_')}.mp4`;

            console.log(`👉 ${videoId}`);

            try {
                await fs.access(videoFilename);
                console.log(`⚠️ ${videoFilename} already exists. Skipping download.`);
                continue;
            } catch {
                // File does not exist, proceed with downloading
            }

            while (true) {
                const response = await fetch(`${urlDownload}${videoId}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${apiToken}`
                    }
                });

                if (!response.ok) {
                    console.log(`🛑 MODERATED ${videoId} (HTTP ${response.status}):\n${prompt}\n`, await response.text());
                    break;
                }

                const taskResponseBody = await response.json();
                const { status, statusFinal, statusLabel, downloadURL, videoURL, percent } = taskResponseBody;

                if (statusFinal) {
                    const url = downloadURL ?? videoURL;

                    if (url) {
                        console.log(`✅ Downloading ${url} to ${videoFilename}`);
                        try {
                            const videoResponse = await fetch(url);
                            if (!videoResponse.ok) {
                                console.error(`⛔ Unable to download ${videoId} (HTTP ${videoResponse.status}):\n${prompt}\n`, url);
                                break;
                            }
                            const stream = Readable.fromWeb(videoResponse.body);
                            await writeFile(videoFilename, stream);
                        } catch (err) {
                            console.error(`⛔ Error during download: ${err}`);
                        }
                    } else
                        console.error(`🛑 Unable to download ${videoId} status (${status} ${statusLabel}):\n${prompt}\n`);

                    break;
                } else {
                    console.log(`⌛ ${videoId} status (${status} ${statusLabel}) and is still in progress (${percent}%), waiting…`);
                    await sleep(SLEEP_DOWNLOAD);
                }
            }
        }
    } catch (error) {
        console.log(`⛔ Error during download:`, error.stack || error);
    }
}

// Main function
async function main() {
    const apiToken = process.argv[2];
    const promptFile = process.argv[3] || 'videos.json'; // Default to 'videos.json' if not provided

    if (!apiToken) {
        console.error('Usage: node videos.mjs <API_TOKEN> [PROMPTS_FILE]');
        process.exit(1);
    }

    console.log('Script v3.0');

    console.log('Node version is: ' + process.version);

    try {
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
            await execute(apiToken, promptFile); // Pass the promptFile to execute function
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

async function execute(apiToken, promptFile) {
    const accounts = await fetchAccounts(apiToken);

    const videoAccounts = Object.values(accounts)
        .filter(a => a.supportVideo)  // Accounts with video support
        .filter(a => !a.error);       // Active accounts without error

    console.info(`Configured active MiniMax API video accounts`, videoAccounts.length);

    if (videoAccounts.length <= 0) {
        console.error(`⛔ No configured active video accounts found. Please refer to https://useapi.net/docs/start-here/setup-useapi`);
        process.exit(1);
    }

    availableAccountsCount = videoAccounts.length;

    const promptData = await fs.readFile(promptFile, 'utf8');
    const prompts = JSON.parse(promptData);
    console.log(`Total number of prompts to process`, prompts.length);

    let warnings = [];

    // First pass: check for warnings
    for (let i = 0; i < prompts.length; i++) {
        const { file, prompt } = prompts[i];

        if (!prompt && !file) {
            warnings.push(`⚠️  Skip empty prompt with empty file at index ${i}`);
            continue;
        }

        if (file) {
            try {
                await fs.access(file);
            } catch {
                warnings.push(`⚠️  Specified file '${file}' does not exist. Skip prompt ${i}`);
                continue;
            }

            const ext = file.split('.').pop();
            if (!supportedFileExtensions.includes(ext)) {
                warnings.push(`⚠️  File ${file} extension ${ext} now supported. Skip prompt ${i}`);
                continue;
            }
        }
    }

    if (warnings.length > 0) {
        warnings.forEach(warning => console.warn(warning));
        console.error(`⛔ Execution stopped due to warnings.`);
        process.exit(1);
    }

    for (let i = 0; i < prompts.length; i++) {
        const { file, ...fields } = prompts[i];
        while (true) {
            const responseCode = await submitPrompt(apiToken, file, i + 1, fields);
            if (responseCode == 429)
                await sleep(SLEEP_429);
            else
                if (responseCode == 412) {
                    // Check if there's no accounts left at all
                    if (availableAccountsCount == outOfCredits.length) {
                        console.error(`⛔ All configured video accounts run out of credits`);
                        process.exit(1);
                    }
                } else
                    if (responseCode == 596) {
                        console.error(`⛔ Your hailuoai.video account has been placed on hold, which may last a few hours. It may be a good idea to pause operations until then.`);
                        process.exit(1);
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
