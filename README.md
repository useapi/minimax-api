# MiniMax (Hailuo) API examples (useapi.net)

Runnable Node.js examples for the [MiniMax API](https://useapi.net/docs/api-minimax-v1) by [useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) — drive your own [MiniMax / Hailuo](https://hailuoai.video) account over a simple REST API. Generate **Hailuo 01 / 02 / 2.3** video (plus **Veo 3.1** and **Sora 2** via MiniMax), **Speech 2.8** narration with 600+ voices and voice cloning, and a deep image roster — **Midjourney V7 / NiJi 7**, **Nano Banana 2 / Pro**, **GPT Image 1.5 / 2.0**, **Seedream 4.5 / 5.0**, image-01 — all from one account with multi-account load balancing and no per-call metering.

Each example reads a list of prompts from a JSON file, submits them through the useapi.net MiniMax API, polls each task until it is final, and downloads every result — so you can queue a batch and come back to the winners.

| Example | What it does | Tutorial |
|---|---|---|
| [`video/`](./video) | Batch-generate **Hailuo 01 / 02 / 2.3** video (plus **Veo 3.1**, **Sora 2** and **Seedance 2.0** via MiniMax) from text and/or image prompts, load-balanced across every connected account | [How to Generate AI Video with the MiniMax (Hailuo) API](https://useapi.net/docs/articles/minimax-bash) |
| [`speech/`](./speech) | Batch-generate **Speech 2.8** narration — pick from 600+ voices or your own clones, steer emotion and pacing with inline markup, and download every MP3 | [How to Generate Text-to-Speech Audio with the MiniMax (Hailuo) API](https://useapi.net/docs/articles/minimax-speech-bash) |

## Quick start

You need [Node.js](https://nodejs.org) v21 or newer (no dependencies to install), a useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api), and a connected [MiniMax account](https://useapi.net/docs/start-here/setup-minimax) (one [$15/month subscription](https://useapi.net/docs/subscription?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) covers every useapi.net API):

```bash
git clone https://github.com/useapi/minimax-api.git
cd minimax-api/video
node ./videos.mjs <API_TOKEN>
```

`API_TOKEN` is your useapi.net token. The video script discovers your connected MiniMax accounts and load-balances the batch automatically — no per-account email argument is needed. Edit `videos.json` to queue your own prompts. Every supported parameter is documented on the [POST /videos/create](https://useapi.net/docs/api-minimax-v1/post-minimax-videos-create) endpoint page.

For speech instead of video:

```bash
cd minimax-api/speech
node ./speech.mjs <API_TOKEN> --voices british   # find a voice_id
node ./speech.mjs <API_TOKEN>                    # generate lines.json
```

## Tutorials

- [How to Generate AI Video with the MiniMax (Hailuo) API](https://useapi.net/docs/articles/minimax-bash) — batch-generate Hailuo 01 / 02 / 2.3 video, plus Veo 3.1, Sora 2 and Seedance 2.0 hosted by MiniMax, with a complete Node.js example.
- [How to Generate Text-to-Speech Audio with the MiniMax (Hailuo) API](https://useapi.net/docs/articles/minimax-speech-bash) — Speech 2.8 end to end: picking a voice, emotion and pause markup, word timings for captions, voice cloning, streaming, and what it costs.

**Music** has its own endpoints too — [POST /music/create](https://useapi.net/docs/api-minimax-v1/post-minimax-music-create) — but is not scripted in this repo yet. For a batch music example see [mureka-api](https://github.com/useapi/mureka-api).

## About useapi.net

[useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) is an experimental REST API for AI services. The MiniMax API drives your own [MiniMax / Hailuo](https://hailuoai.video) account, so you spend your plan's credits at consumer rates instead of metered developer-API pricing. See the [model matrix](https://useapi.net/model-matrix?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) and pricing on the [API overview](https://useapi.net/docs/api-minimax-v1).

Visit our [Discord Server](https://discord.gg/w28uK3cnmF) or [Telegram Channel](https://t.me/use_api) for any support questions and concerns.

We regularly post guides and tutorials on the [YouTube Channel](https://www.youtube.com/@useapi-net).