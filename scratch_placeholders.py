import re
import os

filepath = r"d:\DEBI\final_test\records.csv"
placeholders = set()

with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        matches = re.findall(r"\{\{([^}]+)\}\}", line)
        for match in matches:
            placeholders.add(match)

with open("scratch_placeholders.txt", "w", encoding="utf-8") as out:
    for p in sorted(placeholders):
        out.write(p + "\n")
