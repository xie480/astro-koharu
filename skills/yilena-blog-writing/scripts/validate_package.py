"""Check bundled evidence, internal links and sample-selection invariants."""

import hashlib
import json
from pathlib import Path
import re
import sys

from select_samples import FALLBACK, select


def main():
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]
    manifest = json.loads((root / "_meta/corpus-manifest.json").read_text(encoding="utf-8"))
    corpus = json.loads((root / "_meta/corpus.json").read_text(encoding="utf-8"))["articles"]
    assert len(manifest["articles"]) == len(corpus) == 59, "Expected frozen 59-file corpus"
    ids = [r["id"] for r in corpus]
    assert len(set(ids)) == 59, "Duplicate corpus IDs"
    evidence_count = 0
    compact = lambda s: re.sub(r"\s+", "", s)
    for entry in corpus:
        path = root / entry["raw"]
        data = path.read_bytes()
        assert hashlib.sha256(data).hexdigest() == entry["sha256"], f"Changed raw: {entry['id']}"
        annotation = entry["annotation"]
        assert annotation["id"] == entry["id"]
        for key in ["article_type", "topic_tags", "hook_type", "hook_excerpt", "structure_pattern",
                    "structure_outline", "ending_type", "source_types", "notable", "evidence", "voice_mode", "style_weight"]:
            assert key in annotation, f"Missing {entry['id']}.{key}"
        lines = data.decode("utf-8").splitlines()
        for evidence in annotation["evidence"]:
            start = evidence.get("line_start", evidence.get("line"))
            end = evidence.get("line_end", start)
            assert start and 1 <= start <= end <= len(lines), f"Invalid evidence range: {entry['id']}"
            quote = evidence["quote"]
            assert compact(quote) in compact("\n".join(lines[start - 1:end])), f"Unmatched quote: {entry['id']}:{start}"
            evidence_count += 1
    unique = [r for r in corpus if not r.get("duplicate_of")]
    assert len(unique) == 58
    for mode in FALLBACK:
        for topic in ["", "Redis 缓存", "Java", "不存在的题材"]:
            samples = select(root, mode, topic)
            assert len(samples) == len({r["id"] for r in samples}) == 5
            assert len({next(a["body_sha256"] for a in corpus if a["id"] == r["id"]) for r in samples}) == 5
            direct = sum(r["family"] == mode for r in unique)
            assert sum(r["family"] == mode for r in samples) == min(direct, 5), f"Genre precedence failed: {mode}"
    for path in [root / "SKILL.md", *sorted((root / "references").glob("*.md"))]:
        for target in re.findall(r"\]\(([^)]+)\)", path.read_text(encoding="utf-8")):
            if "://" in target or target.startswith("#"):
                continue
            target = target.split("#", 1)[0]
            assert (path.parent / target).exists(), f"Missing link: {path.name} -> {target}"
    regression = select(root, "方案复盘", "数据库 批量导入 性能优化 单条错误记录")
    assert "C001" in {r["id"] for r in regression}, "Dropped directly relevant request-count optimization sample"
    assert len((root / "references/Writing-DNA.md").read_text(encoding="utf-8")) < 4000, "Integration guide too long"
    print(json.dumps({"raw_files": 59, "distinct_bodies": 58, "annotated": 59,
                      "evidence_quotes_checked": evidence_count, "selector_cases": len(FALLBACK) * 4 + 1,
                      "internal_links": "passed", "Writing-DNA_chars": len((root / "references/Writing-DNA.md").read_text(encoding="utf-8"))},
                     ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
