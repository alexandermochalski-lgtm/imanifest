import zipfile

z = zipfile.ZipFile(r"C:\Users\Por7\OneDrive\Desktop\imanifest\_extract\app.imanifest.money\app.zip")
print("==== MIGRATION COURSES ====")
print(z.read("database/migrations/2023_11_09_051049_create_courses_table.php").decode("utf-8", "replace"))
print("\n==== FRONTEND INDEX snippet ====")
idx = z.read("resources/views/frontend/layout/courses/index.blade.php").decode("utf-8", "replace")
print(idx[:6000])
