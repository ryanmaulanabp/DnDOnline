const fs = require("fs");
const path = require("path");

const files = [
  "app/characters/[id]/components/VitalsHeader.tsx",
  "app/characters/[id]/components/HeroModules.tsx",
  "app/characters/[id]/components/ActionTabs.tsx",
  "app/characters/[id]/components/DiceModal.tsx",
  "app/characters/[id]/components/SpellAndFeatures.tsx",
  "app/characters/[id]/CharacterClient.tsx"
];

const basePath = "c:/Users/Ryan Maulana/dnd-online";

const replacements = [
  // VitalsHeader (EXP & Modals) - Gold/Yellow theme for EXP
  { from: /purple-400/g, to: "yellow-600" },
  { from: /purple-500/g, to: "yellow-500" },
  { from: /purple-600/g, to: "yellow-700" },
  { from: /pink-500/g, to: "yellow-400" },
  
  // VitalsHeader (Temp HP) - Slate/Silver theme
  { from: /cyan-300/g, to: "slate-300" },
  { from: /cyan-400/g, to: "slate-400" },
  { from: /cyan-500/g, to: "slate-500" },
  { from: /cyan-600/g, to: "slate-600" },

  // General Blue -> Stone/Amber
  { from: /blue-300/g, to: "amber-600" },
  { from: /blue-400/g, to: "amber-700" },
  { from: /blue-500/g, to: "amber-800" },
  { from: /blue-600/g, to: "stone-700" },
  { from: /blue-900/g, to: "stone-800" },

  // Bright Green -> Emerald/Muted Green
  { from: /green-400/g, to: "emerald-600" },
  { from: /green-500/g, to: "emerald-700" },
  { from: /green-600/g, to: "emerald-800" },
];

for (const f of files) {
  const p = path.join(basePath, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, "utf-8");
    for (const r of replacements) {
      content = content.replace(r.from, r.to);
    }
    fs.writeFileSync(p, content);
    console.log("Updated", f);
  }
}
