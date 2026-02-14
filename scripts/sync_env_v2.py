import json
import re

# Read the known good JSON
with open('service-account.json', 'r') as f:
    sa = json.load(f)

private_key = sa['private_key']
# Convert the actual newlines in the key to literal \n string
formatted_key = private_key.replace('\n', '\\n')

filename = '.env'
with open(filename, 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.startswith('FIREBASE_ADMIN_PRIVATE_KEY='):
        new_lines.append(f'FIREBASE_ADMIN_PRIVATE_KEY="{formatted_key}"\n')
    else:
        new_lines.append(line)

with open(filename, 'w') as f:
    f.writelines(new_lines)

print("Updated .env with verified key from JSON.")
