# MiniMax (Hailuo) API examples (useapi.net)

Runnable Node.js examples for the [MiniMax API](https://useapi.net/docs/api-minimax-v1) by [useapi.net](https://useapi.net) — drive your own [MiniMax / Hailuo](https://hailuoai.video) account over a simple REST API. Generate **Hailuo 01 / 02 / 2.3** video (plus **Veo 3.1** and **Sora 2** via MiniMax) and a deep image roster — **Midjourney V7 / NiJi 7**, **Nano Banana / 2 / Pro**, **GPT Image 1.5 / 2.0**, **Seedream 4.5 / 5.0**, image-01 — all from one account with multi-account load balancing and no per-call metering.

Each example reads a list of prompts from a JSON file, submits them through the useapi.net MiniMax API, polls each task until it is final, and downloads every result — so you can queue a batch and come back to the winners.

| Example | What it does | Tutorial |
|---|---|---|
| [`video/`](./video) | Batch-generate **Hailuo 01 / 02 / 2.3** video (plus **Veo 3.1**, **Sora 2** and **Seedance 2.0** via MiniMax) from text and/or image prompts, load-balanced across every connected account | [How to Generate AI Video with the MiniMax (Hailuo) API](https://useapi.net/docs/articles/minimax-bash) |

## Quick start

You need [Node.js](https://nodejs.org) v21 or newer (no dependencies to install), a useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi), and a connected [MiniMax account](https://useapi.net/docs/start-here/setup-minimax) (one [$15/month subscription](https://useapi.net/docs/subscription) covers every useapi.net API):

```bash
git clone https://github.com/useapi/minimax-api.git
cd minimax-api/video
node ./videos.mjs <API_TOKEN>
```

`API_TOKEN` is your useapi.net token. The video script discovers your connected MiniMax accounts and load-balances the batch automatically — no per-account email argument is needed. Edit `videos.json` to queue your own prompts. Every supported parameter is documented on the [POST /videos/create](https://useapi.net/docs/api-minimax-v1/post-minimax-videos-create) endpoint page.

## Tutorials

- [How to Generate AI Video with the MiniMax (Hailuo) API](https://useapi.net/docs/articles/minimax-bash) — batch-generate Hailuo 01 / 02 / 2.3 video, plus Veo 3.1, Sora 2 and Seedance 2.0 hosted by MiniMax, with a complete Node.js example.

**Speech 2.5** and **Music 2.0** are available via the [MiniMax Agent](https://useapi.net/docs/api-minimax-v1/post-minimax-agent) (`POST /agent`), not scripted in this repo.

## About useapi.net

[useapi.net](https://useapi.net) is an experimental REST API for AI services. The MiniMax API drives your own [MiniMax / Hailuo](https://hailuoai.video) account, so you spend your plan's credits at consumer rates instead of metered developer-API pricing. See the [model matrix](https://useapi.net/model-matrix) and pricing on the [API overview](https://useapi.net/docs/api-minimax-v1).

Visit our [Discord Server](https://discord.gg/w28uK3cnmF) or [Telegram Channel](https://t.me/use_api) for any support questions and concerns.

We regularly post guides and tutorials on the [YouTube Channel](https://www.youtube.com/@midjourneyapi).
