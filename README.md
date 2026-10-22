# MiniMax Hailuo API examples: Hailuo 3.0 video and Speech-2.8 TTS (useapi.net)

Runnable Node.js examples for the [MiniMax Hailuo API](https://useapi.net/docs/api-minimax-v1?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) by [useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api): generate Hailuo 3.0 (MiniMax H3) and Hailuo 2.3, 02 and 01 video (plus Seedance 2.0, 2.0 Fast and 2.0 Mini, Veo 3.1 and Veo 3.1 Fast, and Sora 2 hosted by MiniMax), Speech-2.8 text-to-speech with more than 600 voices and voice cloning, Music-3.0 and Music-2.6 songs, and images (Midjourney V7 and Niji 7, Nano Banana Pro and 2, GPT Image 2 and 1.5, Seedream 5.0 and 4.5, image-01). Video and images run through a REST API on your [Hailuo AI subscription](https://hailuoai.video/subscribe): Free, Standard $10.50, Pro $38, Master $89 or Max $216 a month. Songs and speech use the separate [MiniMax Audio subscription](https://www.minimax.io/audio/subscribe): Free, Starter $5, Creator $15, Standard $30 or Pro $99 a month (as of October 2026). Several accounts are load-balanced, with no developer-platform balance.

Each example reads a list of prompts from a JSON file, submits them through the useapi.net MiniMax API, polls each task until it is final, and downloads every result — so you can queue a batch and come back to the winners.

| Example | What it does | Tutorial |
|---|---|---|
| [`video/`](./video) | Batch-generate Hailuo 3.0, 2.3, 02 and 01 video (plus Seedance 2.0, Veo 3.1 and Sora 2 via MiniMax) from text and/or image prompts, any model selectable per prompt, load-balanced across every connected account | [How to Generate Hailuo 02 and 2.3 Video with curl: MiniMax Tutorial](https://useapi.net/docs/articles/minimax-bash?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) |
| [`speech/`](./speech) | Batch-generate Speech 2.8 narration: pick from more than 600 voices or your cloned voices, steer emotion and pacing with inline markup, and download every MP3 | [How to Generate Text-to-Speech (TTS) Audio with the MiniMax (Hailuo) API](https://useapi.net/docs/articles/minimax-speech-bash?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) |

## Quick start

You need [Node.js](https://nodejs.org) v21 or newer (no dependencies to install), a useapi.net [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api), and a connected [MiniMax account](https://useapi.net/docs/start-here/setup-minimax?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) (one [$15/month subscription](https://useapi.net/docs/subscription?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) covers every useapi.net API):

```bash
git clone https://github.com/useapi/minimax-api.git
cd minimax-api/video
node ./videos.mjs <API_TOKEN>
```

`API_TOKEN` is your useapi.net token. The video script discovers your connected MiniMax accounts and load-balances the batch automatically — no per-account email argument is needed. Edit `videos.json` to queue your own prompts. Every supported parameter is documented on the [POST /videos/create](https://useapi.net/docs/api-minimax-v1/post-minimax-videos-create?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) endpoint page.

For speech instead of video:

```bash
cd minimax-api/speech
node ./speech.mjs <API_TOKEN> --voices british   # find a voice_id
node ./speech.mjs <API_TOKEN>                    # generate lines.json
```

## Common questions

<!-- Official API figures in these answers, verified 2026-10-18, re-read against useapi.net/docs/api-minimax-v1 2026-10-22: https://platform.minimax.io/docs/pricing/overview (MiniMax-H3 $0.08/s 768P, $0.13/s 2K, paid Music and Lyrics APIs closed to new users from 2026-08-20). -->

- **Is there a Hailuo API?** Yes, through useapi.net: the MiniMax API runs on your Hailuo AI subscription, and MiniMax H3 (Hailuo 3.0) costs about $0.059 per second at 768p on the monthly Master plan, against $0.08 on MiniMax's pay-as-you-go [developer platform](https://platform.minimax.io/docs/pricing/overview) (as of October 2026). The same account also runs Hailuo 2.3 and 02, Veo 3.1, Sora 2 and Seedance 2.0 video, and images with Midjourney V7, Nano Banana Pro, GPT Image 2 and Seedream 5.0, none of which MiniMax's developer platform sells.
- **Which video models can I use?** Through useapi.net, all of these, on your Hailuo AI subscription: `Hailuo-3.0` (768p or 2K, 4–15 seconds, native audio, start/end frames and image, video and audio references), `T2V-2.3` / `I2V-2.3` / `I2V-2.3-Fast`, `02` and the Hailuo 01 family, plus `Seedance-2.0` / `-Fast` / `-Mini`, `Veo-3.1` / `Veo-3.1-Fast` and `Sora-2`. Pass the name in the `model` field of [POST /videos/create](https://useapi.net/docs/api-minimax-v1/post-minimax-videos-create?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api).
- **Is there a MiniMax TTS API?** Yes, and through useapi.net speech-2.8-hd costs $33 per million characters on a MiniMax Audio Pro plan ($99/month), against $100 pay as you go on MiniMax's developer platform (as of October 2026). [POST /speech/create](https://useapi.net/docs/api-minimax-v1/post-minimax-speech-create?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) adds emotion and pause markup and word timings for captions, with more than 600 voices in 40 languages, and [voice cloning](https://useapi.net/docs/api-minimax-v1/post-minimax-speech-clone-voice?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) costs no credits. The [`speech/`](./speech) example batch-generates narration.
- **Is there a MiniMax music API?** Yes, through useapi.net, while MiniMax's paid music and lyrics APIs have been closed to new users since August 20, 2026. [POST /music/create](https://useapi.net/docs/api-minimax-v1/post-minimax-music-create?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) makes full songs with vocals on Music-3.0 and Music-2.6 for about $0.01 a song on a MiniMax Audio Pro plan, against $0.15 pay as you go (as of October 2026), from your lyrics or lyrics the model writes.
- **Where do I get an API key?** Through useapi.net you need no MiniMax platform key and no pay-as-you-go balance: you call this API with our [API token](https://useapi.net/docs/start-here/setup-useapi?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) and connect your Hailuo AI account once through the [MiniMax setup](https://useapi.net/docs/start-here/setup-minimax?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api), which links it right in your browser, with no software to install.
- **How much does it cost?** Through useapi.net, on Master billed yearly ($71.20/month for 10,500 credits), Hailuo 3.0 at 2K costs about $0.081 a second, against $0.13 on MiniMax's pay-as-you-go API (as of October 2026). [Hailuo AI subscriptions](https://hailuoai.video/subscribe) are Standard $10.50, Pro $38, Master $89 or Max $216 a month, up to 20% less yearly. Music and speech use a MiniMax Audio website subscription, such as Pro at $99 a month. See the [cost estimator](https://useapi.net/docs/api-minimax-v1?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api).
- **How many accounts can I connect?** Through useapi.net, one [$15/month subscription](https://useapi.net/docs/subscription?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) covers every API and 3 MiniMax accounts, and each extra $10/month subscription adds 3 more. The [`video/`](./video) example load-balances a batch across every connected account with [GET /scheduler/available](https://useapi.net/docs/api-minimax-v1/get-minimax-scheduler-available?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api), so paid accounts keep running while free ones queue.
- More answers: [MiniMax (Hailuo) API questions](https://useapi.net/docs/articles/minimax-bash?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api#frequently-asked-questions).

## Tutorials

- [How to Generate Hailuo 02 and 2.3 Video with curl: MiniMax Tutorial](https://useapi.net/docs/articles/minimax-bash?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api): batch-generate Hailuo 01, 02 and 2.3 video, plus Veo 3.1, Sora 2 and Seedance 2.0 hosted by MiniMax, with a complete Node.js example.
- [How to Generate Text-to-Speech (TTS) Audio with the MiniMax (Hailuo) API](https://useapi.net/docs/articles/minimax-speech-bash?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api): Speech 2.8 end to end: picking a voice, emotion and pause markup, word timings for captions, voice cloning, streaming, and what it costs.
- [Seedance 2.0 and 2.5 API Pricing: Every Route, Compared](https://useapi.net/docs/articles/seedance-2-api-pricing?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api)
- [Suno API Alternative: Mureka, Lyria 3.5, TemPolor and MiniMax](https://useapi.net/docs/articles/suno-api-alternative?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api)
- [Four AI Music APIs on the Same Six Briefs: TemPolor v4.8, MiniMax Music-3.0, Lyria 3.5 and Mureka V9.5](https://useapi.net/docs/articles/ai-music-flagships-compared?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api)

Music has its own endpoints too, [POST /music/create](https://useapi.net/docs/api-minimax-v1/post-minimax-music-create?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api), but is not scripted in this repo yet. The [ai-music-comparison](https://github.com/useapi/ai-music-comparison) repo calls MiniMax Music-3.0 next to TemPolor, Lyria 3.5 and Mureka V9.5.

## 中文说明

这是 [useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) 托管的海螺 API（MiniMax Hailuo API）示例代码（Node.js）。通过 REST API 调用 **海螺 3.0（Hailuo 3.0 / MiniMax H3）** 和 **Hailuo 2.3 / 02 / 01** 视频（以及 MiniMax 上的 **Seedance 2.0**、**Veo 3.1**、**Sora 2**），**Speech-2.8** 语音合成（超过 600 种音色、声音克隆），**Music-3.0** 歌曲和图片生成。

- 使用你的海螺 AI 网站订阅（Hailuo AI subscription）积分，无需 MiniMax 开发者平台的 API Key。多个账号自动负载均衡。
- 价格：生成消耗你海螺 AI 订阅的积分，useapi.net 不按生成次数另收费。以 Master 套餐（每月 89 美元）计，海螺 3.0 768P 约每秒 0.059 美元、2K 约每秒 0.102 美元，MiniMax 官方 [按量付费 API](https://platform.minimax.io/docs/pricing/overview) 为每秒 0.08 和 0.13 美元（截至 2026 年 10 月）。
- 音乐：MiniMax 官方付费音乐与歌词 API 自 2026 年 8 月 20 日起不再向新用户开放，通过 useapi.net 可使用你的 MiniMax Audio 网站订阅生成歌曲。

主要示例：[`video/`](./video)（批量生成视频，可按提示词选择模型）和 [`speech/`](./speech)（批量生成语音旁白）。快速开始见上方 [Quick start](#quick-start)。教程：[How to Generate Hailuo 02 and 2.3 Video with curl: MiniMax Tutorial](https://useapi.net/docs/articles/minimax-bash?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api)。完整文档：[MiniMax API](https://useapi.net/docs/api-minimax-v1?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api)，账号绑定：[MiniMax setup](https://useapi.net/docs/start-here/setup-minimax?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api)。

useapi.net 是第三方 API，与 MiniMax 及海螺 AI 无关联。

## About useapi.net

[useapi.net](https://useapi.net/?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api) is a third-party REST API for AI services. The MiniMax API runs on your [Hailuo AI subscription](https://hailuoai.video/subscribe) and your [MiniMax Audio subscription](https://www.minimax.io/audio/subscribe), so you spend their credits at website rates instead of metered developer-API pricing. See the models and pricing on the [MiniMax API overview](https://useapi.net/docs/api-minimax-v1?utm_source=github.com&utm_medium=referral&utm_campaign=minimax-api).

Visit our [Discord Server](https://discord.gg/w28uK3cnmF) or [Telegram Channel](https://t.me/use_api) for any support questions and concerns.

We regularly post guides and tutorials on the [YouTube Channel](https://www.youtube.com/@useapi-net).

## License

The example code in this repository is released under the [MIT License](./LICENSE). It covers the example scripts only, not the useapi.net service or API.
