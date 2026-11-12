"""Select five distinct, genre-aware calibration texts; never generates prose."""

import argparse
import json
from pathlib import Path
import re


RELATED = {
    "性能优化": ["性能", "优化", "请求次数", "网络IO", "批处理", "预加载"],
    "批量导入": ["批量导入", "Excel", "券码", "批处理", "批量"],
    "往返": ["往返", "网络IO", "请求次数", "访问次数", "批处理"],
    "数据库": ["数据库", "MySQL", "SQL", "分表", "DB"],
    "错误": ["错误", "异常", "错误码", "Result", "故障"],
    "缓存": ["缓存", "Redis", "Caffeine", "冷热"],
    "消息队列": ["消息队列", "Kafka", "RabbitMQ", "RocketMQ"],
}


FALLBACK = {
    "教程": ["深度解析", "方案复盘", "排障", "项目记录", "工具介绍", "随笔"],
    "深度解析": ["教程", "方案复盘", "工具介绍", "排障", "项目记录", "随笔"],
    "方案复盘": ["教程", "深度解析", "排障", "项目记录", "工具介绍", "随笔"],
    "排障": ["教程", "方案复盘", "工具介绍", "项目记录", "深度解析", "随笔"],
    "项目记录": ["工具介绍", "方案复盘", "教程", "排障", "深度解析", "随笔"],
    "工具介绍": ["项目记录", "教程", "方案复盘", "排障", "深度解析", "随笔"],
    "随笔": ["项目记录", "工具介绍", "方案复盘", "排障", "教程", "深度解析"],
}


def select(root, mode, topic, count=5):
    records = json.loads((root / "_meta/corpus.json").read_text(encoding="utf-8"))["articles"]
    terms = [s.casefold() for s in re.split(r"[\s,，、;/]+", topic) if s.strip()]
    families = [mode, *FALLBACK[mode]]

    def matches(record):
        annotation = record["annotation"]
        haystack = " ".join([record["title"], *annotation.get("topic_tags", []),
                             *annotation.get("structure_outline", []), annotation.get("notable", "")]).casefold()
        result = {}
        for term in terms:
            variants = {term}
            for concept, aliases in RELATED.items():
                if concept in term:
                    variants.update(s.casefold() for s in aliases)
            hits = sorted(s for s in variants if s in haystack)
            if hits:
                result[term] = hits
        return result

    matching = {r["id"]: matches(r) for r in records}

    def rank(record):
        # Match more requested subtopics first; use date within equal relevance.
        # This remains lexical retrieval, not semantic similarity or proof that
        # the article was read. Emit reasons so a human/agent can adjust it.
        return (families.index(record["family"]), -len(matching[record["id"]]),
                -int(re.sub(r"\D", "", record["date"][:10]) or 0), record["id"])

    candidates = sorted((r for r in records if not r.get("duplicate_of")), key=rank)
    if len(candidates) < count:
        raise ValueError(f"Need {count} distinct texts; only {len(candidates)} available")
    output = []
    for r in candidates[:count]:
        same = r["family"] == mode
        output.append({
            "id": r["id"], "title": r["title"], "date": r["date"],
            "family": r["family"], "voice_mode": r["annotation"]["voice_mode"],
            "matched_topic_terms": matching[r["id"]],
            "role": "主要体裁校准" if same else "相近体裁补充；只借叙述动作，不外推体裁规则",
            "raw": r["raw"], "absolute_path": str((root / r["raw"]).resolve()),
        })
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=FALLBACK, required=True)
    parser.add_argument("--topic", default="", help="space-separated topic words improve matching")
    parser.add_argument("--skill-root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.skill_root.resolve()
    results = select(root, args.mode, args.topic)
    print(json.dumps({
        "mode": args.mode, "topic": args.topic, "instruction": "Read all five full raw texts; this list is not reading completion.",
        "limited_direct_samples": sum(r["family"] == args.mode for r in results) < 5,
        "samples": results,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
