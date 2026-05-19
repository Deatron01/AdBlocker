import json
import os

# Fájlnevek definiálása
HOSTS_FILE = "hosts.txt"
MAX_RULES_PER_FILE = 25000  # Biztonságos limit a Chrome 30k-s korlátja alatt

if not os.path.exists(HOSTS_FILE):
    print(f"Hiba: A {HOSTS_FILE} nem található a mappában!")
    exit()

print("A hosts.txt feldolgozása elindult...")

all_rules = []
rule_id = 1

with open(HOSTS_FILE, "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        
        # Kihagyjuk a kommenteket és az üres sorokat
        if not line or line.startswith("#"):
            continue
            
        # A hosts fájlok formátuma: "0.0.0.0 valami.com" vagy "127.0.0.1 valami.com"
        parts = line.split()
        if len(parts) >= 2 and parts[0] in ["0.0.0.0", "127.0.0.1"]:
            domain = parts[1]
            
            # Alapértelmezett lokális címek kiszűrése
            if domain in ["localhost", "broadcasthost", "0.0.0.0"]:
                continue
                
            # Chrome Manifest V3 formátumú szabály generálása
            rule = {
                "id": rule_id,
                "priority": 1,
                "action": { "type": "block" },
                "condition": {
                    "urlFilter": f"||{domain}",
                    "resourceTypes": ["main_frame", "sub_frame", "script", "image", "xmlhttprequest"]
                }
            }
            all_rules.append(rule)
            rule_id += 1

# Szabályok feldarabolása és mentése több fájlba
file_index = 1
generated_files = []

for i in range(0, len(all_rules), MAX_RULES_PER_FILE):
    chunk = all_rules[i:i + MAX_RULES_PER_FILE]
    filename = f"rules{file_index}.json"
    
    with open(filename, "w", encoding="utf-8") as out_file:
        json.dump(chunk, out_file, indent=2)
        
    generated_files.append(filename)
    print(f"-> {filename} sikeresen létrehozva ({len(chunk)} szabállyal).")
    file_index += 1

print(f"\nKész! Összesen {len(all_rules)} szabály lett szétosztva {len(generated_files)} fájlba.")