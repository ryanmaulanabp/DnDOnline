// File: lib/dnd-data.ts

import { POINT_BUY_COSTS, ALIGNMENTS } from "./data/general";
import { BACKGROUNDS } from "./data/backgrounds";
import { RACES } from "./data/races";
import { CLASSES } from "./data/classes";
import { SUBCLASSES } from "./data/subclasses";
import { SPELL_DATABASE as BASE_SPELLS } from "./data/spells";
import { ADDITIONAL_SPELLS } from "./data/spells-addon";

// Merge BASE_SPELLS and ADDITIONAL_SPELLS deeply
const MERGED_SPELLS = { ...BASE_SPELLS };

for (const className in ADDITIONAL_SPELLS) {
  if (!MERGED_SPELLS[className]) {
    MERGED_SPELLS[className] = ADDITIONAL_SPELLS[className];
  } else {
    for (const level in ADDITIONAL_SPELLS[className]) {
      if (!MERGED_SPELLS[className][level]) {
        MERGED_SPELLS[className][level] = ADDITIONAL_SPELLS[className][level];
      } else {
        MERGED_SPELLS[className][level] = [
          ...MERGED_SPELLS[className][level],
          ...ADDITIONAL_SPELLS[className][level]
        ];
        
        // Remove duplicates by name
        const uniqueSpells: any[] = [];
        const seenNames = new Set();
        for (const spell of MERGED_SPELLS[className][level]) {
          if (!seenNames.has(spell.name)) {
            seenNames.add(spell.name);
            uniqueSpells.push(spell);
          }
        }
        
        // Sort spells alphabetically
        uniqueSpells.sort((a, b) => a.name.localeCompare(b.name));
        
        MERGED_SPELLS[className][level] = uniqueSpells;
      }
    }
  }
}

export { POINT_BUY_COSTS, ALIGNMENTS, BACKGROUNDS, RACES, CLASSES, SUBCLASSES };
export const SPELL_DATABASE = MERGED_SPELLS;