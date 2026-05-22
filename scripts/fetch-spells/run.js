const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { translate } = require('@vitalets/google-translate-api');

const CACHE_FILE = path.join(__dirname, 'spells-cache.json');
const OUTPUT_FILE = path.join(__dirname, '../../lib/data/spells.ts');
const DELAY_MS = 3000; // 3 second delay between translations to prevent rate limit

const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchSpells() {
  console.log("Fetching spell list...");
  const res = await axios.get("https://www.dnd5eapi.co/api/spells");
  const spellList = res.data.results;
  
  let cache = {};
  if (fs.existsSync(CACHE_FILE)) {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  }

  console.log(`Found ${spellList.length} spells. Translating missing ones...`);

  let count = 0;
  for (let i = 0; i < spellList.length; i++) {
    const item = spellList[i];
    if (cache[item.index]) {
      continue;
    }

    let success = false;
    let retries = 0;
    while (!success && retries < 3) {
      try {
        console.log(`[${i+1}/${spellList.length}] Fetching & translating ${item.name}...`);
        const details = await axios.get(`https://www.dnd5eapi.co${item.url}`);
        const data = details.data;

        const descText = data.desc ? data.desc.join('\n') : "";
        const higherLevelText = data.higher_level ? "\nLevel Tinggi: " + data.higher_level.join('\n') : "";
        const fullDesc = descText + higherLevelText;

        let translatedDesc = "";
        if (fullDesc) {
          const { text } = await translate(fullDesc, { to: 'id' });
          translatedDesc = text;
          await delay(DELAY_MS);
        }

        cache[item.index] = {
          name: data.name,
          components: data.components ? data.components.join(", ") : "",
          level: data.level,
          classes: data.classes.map(c => c.name),
          desc: translatedDesc
        };

        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
        count++;
        success = true;
      } catch (err) {
        console.error(`Error processing ${item.name}:`, err.message);
        retries++;
        console.log(`Waiting 15 seconds before retry ${retries}/3...`);
        await delay(15000);
      }
    }
    
    if (!success) {
        console.log("Failed after 3 retries. Saving current progress and moving to builder...");
        break;
    }
  }

  console.log("Building spells.ts structure...");
  
  const spellsByClass = {
    Bard: {}, Cleric: {}, Druid: {}, Paladin: {}, Ranger: {}, Sorcerer: {}, Warlock: {}, Wizard: {}
  };

  const initLevels = (cls) => {
    spellsByClass[cls]["Cantrips"] = [];
    for (let i = 1; i <= 9; i++) spellsByClass[cls][`Level${i}`] = [];
  };

  Object.keys(spellsByClass).forEach(initLevels);

  for (const key in cache) {
    const spell = cache[key];
    const lvlKey = spell.level === 0 ? "Cantrips" : `Level${spell.level}`;
    
    spell.classes.forEach(cls => {
      if (spellsByClass[cls] && spellsByClass[cls][lvlKey]) {
        spellsByClass[cls][lvlKey].push({
          name: spell.name,
          components: spell.components,
          desc: spell.desc.replace(/"/g, '\\"').replace(/\n/g, '\\n')
        });
      }
    });
  }

  let tsContent = 'export const SPELL_DATABASE: Record<string, any> = {\n';
  
  for (const cls in spellsByClass) {
    tsContent += `  ${cls}: {\n`;
    for (const lvl in spellsByClass[cls]) {
      const spellArr = spellsByClass[cls][lvl];
      if (spellArr.length > 0) {
        tsContent += `    ${lvl}: [\n`;
        spellArr.forEach(s => {
          tsContent += `      { name: "${s.name}", components: "${s.components}", desc: "${s.desc}" },\n`;
        });
        tsContent += `    ],\n`;
      } else {
        tsContent += `    ${lvl}: [],\n`;
      }
    }
    tsContent += `  },\n`;
  }
  tsContent += '};\n';

  fs.writeFileSync(OUTPUT_FILE, tsContent);
  console.log("Successfully wrote to lib/data/spells.ts!");
}

fetchSpells().catch(console.error);
