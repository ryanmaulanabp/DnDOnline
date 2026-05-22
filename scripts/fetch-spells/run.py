import requests
import json
import os
import time
from deep_translator import GoogleTranslator

CACHE_FILE = 'spells-cache.json'
OUTPUT_FILE = '../../lib/data/spells.ts'

def fetch_spells():
    print("Fetching spell list...")
    res = requests.get("https://www.dnd5eapi.co/api/spells")
    spell_list = res.json().get('results', [])
    
    cache = {}
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            cache = json.load(f)
            
    print(f"Found {len(spell_list)} spells. Translating missing ones...")
    translator = GoogleTranslator(source='en', target='id')
    
    count = 0
    for i, item in enumerate(spell_list):
        if item['index'] in cache:
            continue
            
        success = False
        retries = 0
        while not success and retries < 3:
            try:
                print(f"[{i+1}/{len(spell_list)}] Fetching & translating {item['name']}...")
                details = requests.get(f"https://www.dnd5eapi.co{item['url']}").json()
                
                desc_text = "\n".join(details.get('desc', []))
                higher_level_text = "\nLevel Tinggi: " + "\n".join(details.get('higher_level', [])) if details.get('higher_level') else ""
                full_desc = desc_text + higher_level_text
                
                translated_desc = ""
                if full_desc:
                    translated_desc = translator.translate(full_desc[:4900]) # Safe limit
                    time.sleep(0.5) # Small delay to be polite
                    
                cache[item['index']] = {
                    'name': details['name'],
                    'components': ", ".join(details.get('components', [])),
                    'level': details['level'],
                    'classes': [c['name'] for c in details.get('classes', [])],
                    'desc': translated_desc
                }
                
                with open(CACHE_FILE, 'w', encoding='utf-8') as f:
                    json.dump(cache, f, indent=2, ensure_ascii=False)
                    
                count += 1
                success = True
            except Exception as e:
                print(f"Error processing {item['name']}: {e}")
                retries += 1
                time.sleep(5)
                
        if not success:
            print("Failed after 3 retries. Stopping.")
            break
            
    print("Building spells.ts structure...")
    
    spells_by_class = {
        "Bard": {}, "Cleric": {}, "Druid": {}, "Paladin": {}, 
        "Ranger": {}, "Sorcerer": {}, "Warlock": {}, "Wizard": {}
    }
    
    for cls in spells_by_class:
        spells_by_class[cls]["Cantrips"] = []
        for j in range(1, 10):
            spells_by_class[cls][f"Level{j}"] = []
            
    for key, spell in cache.items():
        lvl_key = "Cantrips" if spell['level'] == 0 else f"Level{spell['level']}"
        for cls in spell['classes']:
            if cls in spells_by_class and lvl_key in spells_by_class[cls]:
                spells_by_class[cls][lvl_key].append({
                    "name": spell['name'],
                    "components": spell['components'],
                    "desc": spell['desc'].replace('"', '\\"').replace('\n', '\\n')
                })
                
    ts_content = 'export const SPELL_DATABASE: Record<string, any> = {\n'
    for cls, levels in spells_by_class.items():
        ts_content += f'  {cls}: {{\n'
        for lvl, spells in levels.items():
            if spells:
                ts_content += f'    {lvl}: [\n'
                for s in spells:
                    ts_content += f'      {{ name: "{s["name"]}", components: "{s["components"]}", desc: "{s["desc"]}" }},\n'
                ts_content += '    ],\n'
            else:
                ts_content += f'    {lvl}: [],\n'
        ts_content += '  },\n'
    ts_content += '};\n'
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(ts_content)
        
    print("Successfully wrote to lib/data/spells.ts!")

if __name__ == "__main__":
    fetch_spells()
