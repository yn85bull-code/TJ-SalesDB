import json
import re
from pathlib import Path

html = Path("outputs/tj-sales-os-lite-demo.html").read_text(encoding="utf-8")
match = re.search(r"const MOCK_ROWS = (\[.*?\]);", html, re.S)
rows = json.loads(match.group(1))
for row in rows:
    if row.get("営業部名") == "千葉営業部":
        keys = ["AA赤字Q", "AA赤字比率", "AA赤字金額", "当月AAMQ", "査定CVR", "成約CVR"]
        for key in keys:
            print(f"{key}: {row.get(key)}")
        break
