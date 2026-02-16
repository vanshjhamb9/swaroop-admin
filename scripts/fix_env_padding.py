import os
import re

env_path = '.env'
if not os.path.exists(env_path):
    print(".env not found")
    exit(1)

with open(env_path, 'r') as f:
    content = f.read()

# Pattern to find the private key inside quotes, handling multi-line
pattern = r'FIREBASE_ADMIN_PRIVATE_KEY="(.*?)"'
match = re.search(pattern, content, re.DOTALL)

if match:
    raw_value = match.group(1)
    
    # 1. Standardize to PEM format: remove whitespace and literal \n from the base64 part
    # Keep headers
    header = "-----BEGIN PRIVATE KEY-----"
    footer = "-----END PRIVATE KEY-----"
    
    if header in raw_value and footer in raw_value:
        # Extract base64 part
        base64_part = raw_value.replace(header, '').replace(footer, '')
        base64_part = base64_part.replace('\\n', '').replace('\n', '').replace('\r', '').replace(' ', '')
        
        # 2. Fix padding
        while len(base64_part) % 4 != 0:
            base64_part += '='
        
        # 3. Reconstruct correctly as single line with literal \n
        final_key = header + "\\n" + base64_part + "\\n" + footer + "\\n"
        
        # 4. Update content
        new_content = content.replace(match.group(0), f'FIREBASE_ADMIN_PRIVATE_KEY="{final_key}"')
        
        with open(env_path, 'w') as f:
            f.write(new_content)
        print(f"✅ Fixed key padding. New base64 length: {len(base64_part)}")
    else:
        print("❌ Could not find PEM headers in key value")
else:
    print("❌ Could not find FIREBASE_ADMIN_PRIVATE_KEY in .env")
