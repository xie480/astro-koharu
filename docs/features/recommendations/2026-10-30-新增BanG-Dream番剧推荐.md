# 新增 BanG Dream 番剧推荐

## 1. 背景与目标

根据用户给出的标题关键词、个人评分和评语，向 `/recommendations` 新增 3 部 BanG Dream 系列番剧。正式标题、作品链接、检索标签和卡片封面由公开资料补全；个人评分与评语保持用户原文。

## 2. 本轮条目

| ID | 正式标题 | 评分 | 标签 | 收录日期 |
| --- | --- | ---: | --- | --- |
| `anime-030` | BanG Dream! Ave Mujica - The Die is Cast - | 7.0 | 乐队、音乐、剧情、心理、青春、群像 | 2026-10-30 |
| `anime-031` | BanG Dream! It's MyGO!!!!! | 7.5 | 乐队、音乐、青春、校园、友情、成长 | 2026-10-30 |
| `anime-032` | BanG Dream! YUME∞MITA | 8.0 | 乐队、音乐、青春、校园、虚拟主播、成长 | 2026-10-30 |

用户评语原样保留：Ave Mujica 为“梦到什么是什么”；YUME∞MITA 为“剧情稍微有点崩坏吧，但最起码在其他方面很出色，尤其是人设”。MyGO!!!!! 未提供评语，因此描述字段留空。

## 3. 资料来源与标签取舍

- [Ave Mujica 官方故事页](https://anime.bang-dream.com/avemujica/story/)与[官方英文介绍](https://en.bang-dream.com/anime/avemujica/)用于核对正式作品名与戏剧、秘密、乐队主题。
- [MyGO!!!!! 官方故事页](https://anime.bang-dream.com/mygo/story/)用于核对正式作品名及乐队、青春、成员关系等主题。
- [YUME∞MITA 官方故事页](https://anime.bang-dream.com/yumemita/story/)和[梦限大 MewType 官方介绍](https://bang-dream.com/artist/yumemita/)用于核对正式作品名、虚拟乐队设定及青春成长主题。
- 封面使用对应的 TMDB 图片直链：Ave Mujica 参考[TMDB 作品页](https://www.themoviedb.org/tv/274580-bang-dream-ave-mujica)；MyGO!!!!! 对应[Anime.com 作品页](https://www.anime.com/shows/bang-dream-its-mygo)所展示的海报；YUME∞MITA 对应[Plex 作品页](https://watch.plex.tv/show/bang-dream-yumemita-1)展示的 TMDB 海报。
- 标签根据官方作品简介和乐队设定归纳，作为站内筛选关键词，不替代官方分级或作品类型分类。

## 4. 数据与排序

条目加入 `src/data/recommendations.json`，沿用 anime ID 序列并新增 `anime-030` 至 `anime-032`；`order` 使用 111–113，排序结果为 MyGO!!!!!、YUME∞MITA、Ave Mujica，与用户提供的次序不同。三个条目的 `addedAt` 统一为 `2026-10-30`。卡片默认排序仍沿用访问时随机打乱的现有行为。

## 5. 验证

- JSON 数据解析通过，总量由 110 增至 113，原有 110 条保持不变；新增 ID、`order` 唯一，评分/评语与用户输入一致，标签齐全，封面和官方链接均为 HTTPS，收录日期均为 `2026-10-30`。
- 定向 Biome 检查、`lint-md` 和 `git diff --check` 通过。
- 全仓 `pnpm lint:fix` 因 `[ERROR] fetch failed` 未完成；未运行测试（本次仅新增静态推荐数据）。
