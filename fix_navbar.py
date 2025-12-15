import re

# Read the CSS file
with open('src/styles/index.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace only in .nav-links a block (around line 1073-1084)
# Replace font-size: 0.9rem with 0.8rem
content = re.sub(
    r'(\.nav-links a \{[^}]*font-size: )0\.9rem;',
    r'\g<1>0.8rem;',
    content
)

# Replace padding: 0.6rem 1.2rem with 0.6rem 0.9rem  
content = re.sub(
    r'(\.nav-links a \{[^}]*padding: 0\.6rem )1\.2rem;',
    r'\g<1>0.9rem;',
    content
)

# Replace gap: 0.5rem with 0.4rem
content = re.sub(
    r'(\.nav-links a \{[^}]*gap: )0\.5rem;',
    r'\g<1>0.4rem;',
    content
)

# Write back
with open('src/styles/index.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("CSS updated successfully!")
