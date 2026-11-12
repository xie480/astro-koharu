"""Snapshot and measure a Markdown corpus using the Python standard library.

Run from any directory. --snapshot reads only Git-tracked blog paths and refuses
to replace an existing snapshot; ordinary runs read the bundled raw corpus.
Default term counts use an explicit lexicon. --jieba-root optionally adds
approximate POS-tagged tables; generation and sample selection do not need it.
"""

import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import statistics
import subprocess
import sys


FAMILIES = {
    "方案复盘": [1, 2, 11, 17, 18, 19, 20, 22, 23, 24, 50, 51, 53, 57, 58],
    "排障": [4, 5, 7, 9, 10, 46, 59],
    "项目记录": [3, 6, 54, 55, 56],
    "深度解析": [8, 12, 13, 14, 15, 16, 48, 49],
    "工具介绍": [21],
    "教程": list(range(25, 46)) + [47],
    "随笔": [52],
}


def family_for(article_id):
    return next((name for name, ids in FAMILIES.items() if int(article_id[1:]) in ids), "未分类")


NOUNS = """系统 数据 用户 线程 方法 对象 问题 场景 数据库 任务 请求 消息 接口 内存
服务 缓存 事务 连接 模型 代码 业务 参数 结果 状态 机制 资源 时间 方式 类型 过程
操作 文件 信息 节点 结构 性能 队列 逻辑 组件 索引 上下文 记忆 工具 框架 配置
容器 条件 网络 类 变量 函数 锁 算法 查询 版本 客户端 服务端 应用 程序 进程
实例 集合 元素 数组 列表 字符串 字段 表 主键 对话 提示词 向量 检索 知识
能力 边界 策略 成本 吞吐量 延迟 并发量 线程池 连接池 日志 异常 错误码
权限 路径 端口 地址 协议 页面 事件 监听器 语句 关键字 注解 依赖 数据量
消息队列 分布式 数据源 分片 副本 生产者 消费者 磁盘 硬盘 指针 CPU JVM
Redis MySQL Java Spring Kafka RabbitMQ RocketMQ Agent RAG MCP LLM Token
工作流 规划 生命周期 评估 提交 向量数据库 SQL 服务器 文档 源码 配置项
""".split()
VERBS = """使用 进行 实现 处理 执行 获取 创建 需要 支持 提供 返回 通过 保证 避免
调用 设置 维护 存储 读取 写入 添加 删除 更新 修改 判断 选择 定义 管理 解决
理解 设计 优化 分析 发现 查看 发送 接收 加载 初始化 访问 触发 注册 生成
等待 阻塞 释放 转换 分配 建立 保存 控制 引入 结合 限制 提升 降低 匹配
检索 组织 拆分 合并 解释 验证 记录 计算 排序 遍历 比较 消费 监听 捕获
封装 扩展 覆盖 恢复 同步 异步 批量 缓存""".split()
ADVERBS = """其实 直接 一般 通常 首先 然后 最后 因此 所以 但是 不过 同时
这里 此时 此外 例如 比如 也就是说 简单来说 本质上 反而 仍然 依然
可能 一定 完全 只要 只有 主要 尤其 显然 自然 真正 最终 进一步 至少
已经 并不 并非 仅仅 更加 非常 相对 其实就是 总之 换句话说""".split()


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def split_frontmatter(text):
    match = re.match(r"\A\ufeff?---\r?\n(.*?)\r?\n---(?:\r?\n|$)", text, re.S)
    return (match.group(1), text[match.end():]) if match else ("", text)


def scalar(frontmatter, key):
    # Only scalar fields used by the corpus index, not a general YAML parser.
    match = re.search(rf'^\s*[\'\"]?{key}[\'\"]?\s*:\s*(.*?)\s*$', frontmatter, re.M)
    if not match:
        return ""
    value = match.group(1)
    if value.startswith('"'):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            pass
    return value.strip("\"'")


def clean_inline(text):
    text = re.sub(r"!\[[^\]]*\]\([^\n]*?\)", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^\n]*?\)", r"\1", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"[`*_~]", "", text)
    text = re.sub(r"^\s*(?:>\s*|[-+*]\s+|\d+[.)、]\s*)", "", text)
    return text.strip()


def char_count(text):
    return len(re.sub(r"\s", "", text))


def sentence_lengths(text):
    # Chinese full stops/questions/exclamations and English ?!; decimal dots
    # and technical dotted identifiers are intentionally not terminators.
    return [char_count(s) for s in re.split(r"[。！？!?]+", text) if char_count(s)]


def measure(text, posseg=None):
    frontmatter, body = split_frontmatter(text)
    headings, blocks, images, paragraphs = [], [], [], []
    buffer, fence, fence_content, fence_language = [], None, [], ""
    plain_lines, table_rows, quotes, thematic_breaks, log_lines = [], 0, 0, 0, 0

    def flush():
        if buffer:
            value = clean_inline(" ".join(buffer))
            if value:
                paragraphs.append(value)
            buffer.clear()

    for number, line in enumerate(body.splitlines(), 1):
        marker = re.match(r"^\s*(`{3,}|~{3,})(.*)$", line)
        if fence:
            if marker and marker.group(1)[0] == fence[0] and len(marker.group(1)) >= len(fence):
                blocks.append({"language": fence_language, "chars": char_count("\n".join(fence_content))})
                fence, fence_content = None, []
            else:
                fence_content.append(line)
            continue
        if marker:
            flush()
            fence, fence_language = marker.group(1), marker.group(2).strip().lower()
            continue
        # A few migrated posts put complete logs/SQL in blockquotes rather than
        # fences. Preserve their evidence in raw but do not measure them as prose.
        if re.match(r"^\s*>\s*(?:\d{4}-\d{2}-\d{2}T\S+\s+|(?:java|org|com)\.[\w.]+(?:Exception|Error):|(?:ERROR|WARN|INFO|DEBUG)\s+\d+|(?:SET|SELECT|UPDATE|INSERT|DELETE|ALTER|CREATE|DROP)\s+)", line):
            flush()
            log_lines += 1
            continue
        for m in re.finditer(r"!\[([^\]]*)\]\((\S+?)(?:\s+\"[^\"]*\")?\)", line):
            images.append({"alt": m.group(1), "url": m.group(2), "body_line": number})
        for m in re.finditer(r'<img[^>]+src=[\"\']([^\"\']+)[\"\']', line):
            images.append({"alt": "HTML image", "url": m.group(1), "body_line": number})
        heading = re.match(r"^\s*(#{1,6})\s+(.+)$", line)
        if heading:
            flush()
            headings.append({"level": len(heading.group(1)), "text": clean_inline(heading.group(2))})
            continue
        if re.match(r"^\s*(?:[-*_]\s*){3,}$", line):
            flush()
            thematic_breaks += 1
            continue
        if line.count("|") >= 2:
            flush()
            table_rows += 1
            continue
        if not line.strip() or re.match(r"^\s*\[[^\]]+\]:\s*\S+", line):
            flush()
            continue
        if re.match(r"^\s*>\s*", line):
            quotes += 1
        if re.match(r"^\s*(?:[-+*]\s+|\d+[.)、]\s*)", line):
            flush()
        buffer.append(line)
        plain_lines.append(line)
    flush()
    if fence:
        blocks.append({"language": fence_language, "chars": char_count("\n".join(fence_content)), "unclosed": True})
    prose = "\n".join(paragraphs)
    lengths = [n for paragraph in paragraphs for n in sentence_lengths(paragraph)]
    bold = len(re.findall(r"\*\*[^*\n]+\*\*|__[^_\n]+__", "\n".join(plain_lines)))
    result = {
        "body_chars": char_count(body), "prose_chars": char_count(prose),
        "code_chars": sum(b["chars"] for b in blocks),
        "paragraph_chars": [char_count(p) for p in paragraphs],
        "paragraph_sentences": [len(sentence_lengths(p)) for p in paragraphs],
        "sentence_lengths": lengths,
        "headings": headings, "code_blocks": blocks, "images": images,
        "table_rows": table_rows, "quote_lines": quotes, "bold_spans": bold,
        "excluded_quoted_log_lines": log_lines,
        "thematic_breaks": thematic_breaks,
        "punctuation": {p: prose.count(p) for p in ["，", "。", "：", "；", "？", "！", "——", "（", "）", "(", ")", "“", "”"]},
        "latin_tokens": len(re.findall(r"[A-Za-z][A-Za-z0-9_+.-]*", prose)),
        "lexicon_counts": {
            kind: {term: prose.count(term) for term in terms if term in prose}
            for kind, terms in [("nouns", NOUNS), ("verbs", VERBS), ("adverbs_and_connectors", ADVERBS)]
        },
    }
    if posseg:
        counts = {"nouns": Counter(), "verbs": Counter(), "adverbs": Counter(), "english_terms": Counter()}
        for word, flag in posseg.cut(prose):
            if len(word.strip()) < 2:
                continue
            kind = ("nouns" if flag.startswith("n") else "verbs" if flag.startswith("v")
                    else "adverbs" if flag == "d" else "english_terms" if flag == "eng" else None)
            if kind:
                counts[kind][word] += 1
        result["pos_counts"] = {kind: dict(counter) for kind, counter in counts.items()}
    return result


def summarize(records):
    total = lambda key: sum(r["metrics"][key] for r in records)
    sentences = [n for r in records for n in r["metrics"]["sentence_lengths"]]
    paragraphs = [n for r in records for n in r["metrics"]["paragraph_chars"]]
    p_sentences = [n for r in records for n in r["metrics"]["paragraph_sentences"]]
    sentence_count = len(sentences)
    lexicons = {}
    for kind in ["nouns", "verbs", "adverbs_and_connectors"]:
        counts = Counter()
        for r in records:
            counts.update(r["metrics"]["lexicon_counts"][kind])
        lexicons[kind] = counts.most_common(100 if kind == "nouns" else 50)
    result = {
        "articles": len(records), "prose_chars": total("prose_chars"), "body_chars": total("body_chars"),
        "code_chars": total("code_chars"), "sentence_count": sentence_count,
        "mean_sentence_chars": round(statistics.mean(sentences), 2) if sentences else 0,
        "median_sentence_chars": statistics.median(sentences) if sentences else 0,
        "short_sentence_percent": round(sum(n <= 15 for n in sentences) / sentence_count * 100, 2) if sentences else 0,
        "long_sentence_percent": round(sum(n >= 50 for n in sentences) / sentence_count * 100, 2) if sentences else 0,
        "mean_paragraph_chars": round(statistics.mean(paragraphs), 2) if paragraphs else 0,
        "median_paragraph_chars": statistics.median(paragraphs) if paragraphs else 0,
        "mean_paragraph_sentences": round(statistics.mean(p_sentences), 2) if p_sentences else 0,
        "images": sum(len(r["metrics"]["images"]) for r in records),
        "articles_with_images": sum(bool(r["metrics"]["images"]) for r in records),
        "code_blocks": sum(len(r["metrics"]["code_blocks"]) for r in records),
        "mermaid_blocks": sum(b["language"] == "mermaid" for r in records for b in r["metrics"]["code_blocks"]),
        "articles_with_tables": sum(r["metrics"]["table_rows"] > 0 for r in records),
        "bold_spans": total("bold_spans"),
        "excluded_quoted_log_lines": total("excluded_quoted_log_lines"),
        "bold_per_1000_prose_chars": round(total("bold_spans") / max(total("prose_chars"), 1) * 1000, 2),
        "mean_heading_chars": round(statistics.mean(char_count(h["text"]) for r in records for h in r["metrics"]["headings"]), 2),
        "punctuation": dict(sum((Counter(r["metrics"]["punctuation"]) for r in records), Counter())),
        "lexicon_top": lexicons,
    }
    if any("pos_counts" in r["metrics"] for r in records):
        result["pos_top"] = {}
        for kind in ["nouns", "verbs", "adverbs", "english_terms"]:
            counts = Counter()
            for r in records:
                counts.update(r["metrics"].get("pos_counts", {}).get(kind, {}))
            result["pos_top"][kind] = counts.most_common(100 if kind == "nouns" else 50)
    return result


def snapshot(repo, skill):
    if (skill / "raw").exists():
        raise SystemExit("Snapshot already exists; use a new output directory to preserve evidence.")
    names = subprocess.check_output(["git", "ls-files", "-z", "src/content/blog"], cwd=repo).decode("utf-8").split("\0")
    files = [p for p in names if p.endswith((".md", ".mdx"))]
    records = []
    for i, source in enumerate(files, 1):
        data = (repo / source).read_bytes()
        fm, _ = split_frontmatter(data.decode("utf-8"))
        article_id = f"C{i:03d}"
        raw = f"raw/{article_id}.md"
        (skill / "raw").mkdir(parents=True, exist_ok=True)
        (skill / raw).write_bytes(data)
        records.append({
            "id": article_id, "source": source, "raw": raw,
            "title": scalar(fm, "title"), "date": scalar(fm, "date"),
            "author": scalar(fm, "author"), "sha256": hashlib.sha256(data).hexdigest(),
        })
    write_json(skill / "_meta/corpus-manifest.json", {
        "snapshot_date": "2026-10-30", "source_commit": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=repo).decode().strip(),
        "selection": "Git-tracked Markdown under src/content/blog at snapshot time; working-tree bytes", "articles": records,
    })


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--skill-root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--snapshot", type=Path, metavar="REPO", help="create immutable raw corpus from Git-tracked blog paths")
    parser.add_argument("--jieba-root", type=Path, help="optional import root containing jieba 0.42.1 for POS tables")
    args = parser.parse_args()
    skill = args.skill_root.resolve()
    if args.snapshot:
        snapshot(args.snapshot.resolve(), skill)
    posseg = None
    if args.jieba_root:
        sys.path.insert(0, str(args.jieba_root.resolve()))
        import jieba.posseg as posseg
    manifest = read_json(skill / "_meta/corpus-manifest.json")
    records = []
    for record in manifest["articles"]:
        data = (skill / record["raw"]).read_bytes()
        if hashlib.sha256(data).hexdigest() != record["sha256"]:
            raise SystemExit(f"Snapshot integrity failed: {record['id']}")
        records.append({**record, "family": family_for(record["id"]), "metrics": measure(data.decode("utf-8"), posseg)})
    # Body hashes intentionally ignore frontmatter and newline representation.
    # Keep the last matching record as representative, retain every raw file.
    representatives = {}
    for r in records:
        _, body = split_frontmatter((skill / r["raw"]).read_text(encoding="utf-8"))
        r["body_sha256"] = hashlib.sha256(body.encode("utf-8")).hexdigest()
        representatives[r["body_sha256"]] = r["id"]
    for r in records:
        if representatives[r["body_sha256"]] != r["id"]:
            r["duplicate_of"] = representatives[r["body_sha256"]]
    unique = [r for r in records if "duplicate_of" not in r]
    annotations = {}
    for path in sorted((skill / "_meta").glob("annotations-*.json")):
        for item in read_json(path):
            if item["id"] in annotations:
                raise SystemExit(f"Duplicate annotation: {item['id']}")
            annotations[item["id"]] = item
    for r in records:
        if r["id"] in annotations:
            r["annotation"] = annotations[r["id"]]
    groups = {}
    for r in unique:
        groups.setdefault(r["family"], []).append(r)
    compact_records = []
    for r in records:
        metrics_path = f"_meta/metrics/{r['id']}.json"
        write_json(skill / metrics_path, r["metrics"])
        basic = {key: value for key, value in r["metrics"].items() if isinstance(value, (int, float))}
        basic.update({"images": len(r["metrics"]["images"]), "code_blocks": len(r["metrics"]["code_blocks"]),
                      "headings": len(r["metrics"]["headings"]),
                      "opening_paragraph_chars": next(iter(r["metrics"]["paragraph_chars"]), 0)})
        compact_records.append({**r, "metrics": basic, "metrics_path": metrics_path})
    write_json(skill / "_meta/corpus.json", {"articles": compact_records})
    stats = {
        "method": "Markdown heuristic; frontmatter, fenced code, headings, table rows, standalone images and recognized quoted log/SQL lines excluded from prose. List items and ordinary quotes retained. Whitespace excluded from character length. Sentence boundaries: Chinese 。！？ and English ?!. English full stop/semicolon not boundaries. Lexicon matches overlap, are case-sensitive, and are not full POS tagging. Exact body hashes determine duplicates; keep last representative. In this snapshot C057 duplicates C058.",
        "pos_method": "jieba 0.42.1 default dictionary; >=2-character tokens; noun n*, verb v*, adverb d, English eng. Automatic tags are approximate, not manually verified authorship or linguistic ground truth." if posseg else "not executed; lexicon tables only",
        "all_59": summarize(records), "deduplicated_58": summarize(unique),
        "groups_deduplicated": {name: summarize(items) for name, items in groups.items()},
    }
    write_json(skill / "_meta/statistics.json", stats)
    print(json.dumps({"articles": len(records), "annotated": len(annotations), "summary": stats["deduplicated_58"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
