import zipfile
import re

z = zipfile.ZipFile(r"C:\Users\Por7\OneDrive\Desktop\imanifest\_extract\app.imanifest.money\app.zip")
data = z.read("resources/views/home.blade.php").decode("utf-8", "replace")
print("len", len(data))
idx = data.lower().find("money making")
print(data[max(0, idx - 500) : idx + 900])
print("\n==== DEFAULT STRINGS ====")
for m in re.finditer(r"\?\?\s*'([^']{10,160})'", data):
    print("-", m.group(1).replace("\n", " ")[:160])
print("\n==== course create blade? ====")
names = [n for n in z.namelist() if "course" in n.lower() and n.endswith(".php")]
print("\n".join(names[:80]))
