# Speech generation — MiniMax API batch text-to-speech (Node.js)

Batch-generate narration with **MiniMax Speech 2.8** through the [MiniMax API](https://useapi.net/docs/api-minimax-v1) by [useapi.net](https://useapi.net), driving your own [MiniMax / Hailuo](https://hailuoai.video) account.

`speech.mjs` reads lines from `lines.json`, submits each one to [`POST /speech/create`](https://useapi.net/docs/api-minimax-v1/post-minimax-speech-create), polls [`GET /speech/{audioId}`](https://useapi.net/docs/api-minimax-v1/get-minimax-speech_audio_id) until each generation is final, and downloads every MP3.

## Prerequisites

- [Node.js](https://nodejs.org) v21 or newer (no dependencies to install — uses built-in `fetch`)
- A useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi)
- A connected [MiniMax account](https://useapi.net/docs/start-here/setup-minimax) **with an audio subscription** — speech bills against the MiniMax audio plan, the same one music uses. Without it the call returns `412` however much video credit the account holds.

## Usage

```bash
node ./speech.mjs <API_TOKEN> [LINES_FILE]
node ./speech.mjs <API_TOKEN> --voices [SEARCH]
```

`LINES_FILE` defaults to `lines.json`.

Every line needs a `voice_id`, and the ids are opaque numbers, so start by finding one:

```bash
node ./speech.mjs user:1234-abc --voices british
```

That lists the account's catalogue — 600+ built-in voices, plus any you cloned with [POST /speech/clone-voice](https://useapi.net/docs/api-minimax-v1/post-minimax-speech-clone-voice) — filtered to entries whose name or tags contain `british`. Drop the search term to list all of them.

The script discovers every connected account that reports `supportAudio` and submits each line to whichever has the fewest speech generations already running. Speech has no local slot ceiling the way video does — MiniMax itself returns `429` once an account is at its limit, and the script waits and retries.

If a `speech_results.txt` file from a previous run is present, the script offers to resume — polling those generations and downloading their audio — before submitting anything new. Errors are appended to `speech_errors.txt`.

## Lines

`lines.json` is an array of line objects. Only two fields are required:

- `text` — **required**, the words to speak. Max `5000` characters on an `hd` model, `10000` on a `turbo` one. Supports inline markup (below).
- `voice_id` — **required**, from `--voices`.
- `name` — optional, used as the output filename (`name.mp3`). Without it the file is named after the `audioId`.
- `model` — optional. Default `speech-2.8-hd`. Also `speech-2.8-turbo`, `speech-2.6-hd`, `speech-2.6-turbo`, and the 2.5 previews.
- `emotion` — optional, one of `happy`, `sad`, `angry`, `fearful`, `disgusted`, `surprised`, `neutral`, `fluent`. Leave it out and mark up the text instead.
- `speed` (`0.5`–`2`), `pitch` (`-12`–`12`), `vol`, `language_boost`, the voice effects — all optional.

Everything except `name` is forwarded to `speech/create` as-is, so any parameter the endpoint accepts works without changing the script. Every one of them is documented on [POST /speech/create](https://useapi.net/docs/api-minimax-v1/post-minimax-speech-create).

### Text markup

Three kinds of markup go directly inside `text`, and they combine. Emotion tags are free — they are stripped before billing. Sound and pause markup is billed as written.

| Markup | Example | Values |
|---|---|---|
| Emotion | `{happy}Great news!{/happy}` | The eight emotions above, max 15 spans per request |
| Sound | `That's wonderful (chuckle)` | `laughs`, `chuckle`, `coughs`, `sighs`, `gasps`, `breath`, `humming`, and more |
| Pause | `Wait for it <#0.5#> there!` | Seconds, `0.01` to `99.99` |

## Cost

Speech bills per character against the MiniMax audio balance — 1 credit per character on an `hd` model, 0.6 on a `turbo` one. [GET /speech/{audioId}](https://useapi.net/docs/api-minimax-v1/get-minimax-speech_audio_id) reports what was actually charged as `cost_credit`.

## Tutorial

[How to Generate Text-to-Speech Audio with the MiniMax (Hailuo) API](https://useapi.net/docs/articles/minimax-speech-bash) — the full walkthrough: picking a voice, steering delivery, word timings for captions, voice cloning, streaming, and what it costs.
