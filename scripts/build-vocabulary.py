"""Rebuild the browser bundle after editing the predefined JSON word list."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
words = json.loads((root / "data/n5-words.json").read_text())
assert words and all(all(entry.get(k) for k in ("id", "word", "reading", "romaji", "meaning")) for entry in words)
assert len({entry["id"] for entry in words}) == len(words)
(root / "data/n5-words.js").write_text(
    "// OpenJLPT N5 vocabulary subset, CC BY-SA 4.0. See data/README.md.\n"
    "// Generated from n5-words.json by scripts/build-vocabulary.py.\n"
    "window.KINDLE_N5_WORDS = " + json.dumps(words, ensure_ascii=False, separators=(",", ":")) + ";\n"
)
print(f"Bundled {len(words)} N5 entries.")
