# MiniMax (Hailuo) video — MiniMax API batch generation (Node.js)

Batch-generate [Hailuo 3.0, 2.3, 02 and 01](https://hailuoai.video) video, plus Veo 3.1, Sora 2 and Seedance 2.0 hosted by MiniMax, on your [Hailuo AI subscription](https://hailuoai.video/subscribe) through the [MiniMax API](https://useapi.net/docs/api-minimax-v1?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) by [useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api).

Full walkthrough: [How to Generate Hailuo 02 and 2.3 Video with curl: MiniMax Tutorial](https://useapi.net/docs/articles/minimax-bash?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api)

Videos made with this API, on YouTube: [Pennywise the Clown • MiniMax T2V 2.3](https://www.youtube.com/watch?v=iIF5wY8Kweg) · [The Lady • MiniMax I2V 2.3](https://youtube.com/shorts/pc9WNBGRBg8) · [MiniMax 02 End Frame](https://youtube.com/shorts/g6_nL6FXI3k) · [Cupcake is no good • Hailuo 02](https://youtube.com/shorts/38I2M0EbqSg) · [Making funny faces • MiniMax 02 540p](https://www.youtube.com/watch?v=LkiSlL19T_0) · [The Cat Exorcist • MiniMax AI](https://www.youtube.com/watch?v=4W4FE4FU2EM)

`videos.mjs` reads prompts from `videos.json`, uploads any local image (parameter `file`), submits each job to [`POST /videos/create`](https://useapi.net/docs/api-minimax-v1/post-minimax-videos-create?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api), polls [`GET /videos/{videoId}`](https://useapi.net/docs/api-minimax-v1/get-minimax-videos-videoId?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) until each task is final, and downloads every finished MP4. Accounts are picked automatically for you via [`GET /scheduler/available`](https://useapi.net/docs/api-minimax-v1/get-minimax-scheduler-available?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) — so a batch is load-balanced across every connected MiniMax account.

## Prerequisites

- [Node.js](https://nodejs.org) v21 or newer (no dependencies to install — uses built-in `fetch`)
- A useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api)
- A connected [MiniMax account](https://useapi.net/docs/start-here/setup-minimax?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) (with video support)

## Usage

```bash
node ./videos.mjs <API_TOKEN> [PROMPTS_FILE]
```

`PROMPTS_FILE` defaults to `videos.json`. The script discovers your connected accounts and load-balances the batch automatically — there is no per-account email argument.

## Prompts

`videos.json` is an array of prompt objects. Either `prompt` (text) or `file` (a local `.png` or `.jpeg` image; rename `.webp` to `.jpeg`) is required; you can supply both. Omit `model` to fall back to the Hailuo 01 defaults (`T2V-01` for text, `I2V-01` for an image — 720p, 6 sec). Set `model` plus the parameters that model supports — `options` (resolution/duration for Hailuo 02/2.3, Sora 2 and Veo 3.1), `resolution` and `duration` (Hailuo 3.0 and Seedance 2.0), `aspectRatio` (Hailuo 3.0, Sora 2, Veo, Seedance), and `end_frame_fileID` where supported. Any field other than the local `file` upload path is forwarded to `videos/create` as-is. Every supported parameter — and the full per-model matrix — is documented on [POST /videos/create](https://useapi.net/docs/api-minimax-v1/post-minimax-videos-create?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api). Local image paths in `videos.json` are inputs you supply — they are not included in this repo.

---

Support: [Discord](https://discord.gg/w28uK3cnmF) · [Telegram](https://t.me/use_api) · [YouTube](https://www.youtube.com/@useapi-net)
