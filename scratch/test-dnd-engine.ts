import { validateCharacterPayload, buildCharacterSheet, calculateHP } from "../lib/dnd/engine";
import { CharacterCreationPayload } from "../lib/dnd/types";

// Helper function to print test results
function assertTest(name: string, condition: boolean, message?: string) {
  if (condition) {
    console.log(`[PASS] ${name}`);
  } else {
    console.error(`[FAIL] ${name} ${message ? `- ${message}` : ""}`);
    process.exit(1);
  }
}

console.log("==========================================");
console.log("D&D 2024 CORE RULES ENGINE - SANITY TESTS");
console.log("==========================================\n");

// ----------------------------------------
// TEST 1: Valid Level 1 Wizard Character Payload
// ----------------------------------------
const validWizardPayload: CharacterCreationPayload = {
  name: "Glandalf the Blue",
  background: "Acolyte", // Triplet: INT, WIS, CHA
  asiAllocations: [
    { stat: "INT", value: 2 },
    { stat: "WIS", value: 1 },
  ],
  species: "Elf",
  speciesSize: "Medium",
  classSelection: "Wizard",
  classSkillSelections: ["Arcana", "History"], // Wizard skills pool
  classWeaponMasteriesSelections: [],
  classPreparedSpellsSelections: ["Shield", "Magic Missile", "Mage Armor", "Thunderwave"], // Wizard prepared spells
  pointBuyStats: {
    STR: 8,   // 0 pts
    DEX: 14,  // 7 pts
    CON: 13,  // 5 pts
    INT: 15,  // 9 pts
    WIS: 13,  // 5 pts
    CHA: 9,   // 1 pt
  },          // Total: 27 points
  chosenLanguages: ["Gnomish", "Giant"], // Default background: Celestial, Deep Speech; Species: Elven
  magicInitiateBackgroundDetails: {
    source: "Divine", // Acolyte requires Divine
    cantrips: ["Guidance", "Sacred Flame"],
    firstLevelSpell: "Bless",
    castingAbility: "WIS",
  },
  takeStartingGold: false,
};

const validation1 = validateCharacterPayload(validWizardPayload);
assertTest("Valid Level 1 Wizard Character Validation", validation1.isValid, validation1.errors.join("; "));

// Compile Character Sheet
const sheet1 = buildCharacterSheet(validWizardPayload);
assertTest("Compile Character Sheet Object Success", !!sheet1);
assertTest("Base Wizard Max HP Calculation", sheet1.maxHP === 7, `Expected 7 (6 base + 1 CON). Got ${sheet1.maxHP}`);
assertTest("Base Wizard AC Calculation", sheet1.derivedStats.armorClass === 12, `Expected 12 (10 base + 2 DEX). Got ${sheet1.derivedStats.armorClass}`);
assertTest("Spell Save DC Calculation", sheet1.derivedStats.spellSaveDC === 13, `Expected 13 (8 base + 3 INT_mod + 2 PB). Got ${sheet1.derivedStats.spellSaveDC}`);
assertTest("Spell Attack Modifier Calculation", sheet1.derivedStats.spellAttackModifier === 5, `Expected 5 (3 INT_mod + 2 PB). Got ${sheet1.derivedStats.spellAttackModifier}`);

// ----------------------------------------
// TEST 2: Background ASI Violation (Strength on Acolyte)
// ----------------------------------------
const invalidAsiPayload: CharacterCreationPayload = {
  ...validWizardPayload,
  asiAllocations: [
    { stat: "STR", value: 2 }, // Invalid: Strength is NOT in [INT, WIS, CHA]
    { stat: "INT", value: 1 },
  ],
};

const validation2 = validateCharacterPayload(invalidAsiPayload);
assertTest(
  "Invalid Background ASI (Strength on Acolyte) Rejection",
  !validation2.isValid,
  "Should have failed background ASI triplet constraint."
);
assertTest(
  "Invalid Background ASI Error Message check",
  validation2.errors.some((err) => err.includes("not part of the allowed Background triplet")),
  `Expected triplet error message. Found: ${validation2.errors.join("; ")}`
);

// ----------------------------------------
// TEST 3: Invalid Point Buy (Out of Bounds & Cost limit)
// ----------------------------------------
const invalidPbPayload: CharacterCreationPayload = {
  ...validWizardPayload,
  pointBuyStats: {
    STR: 16,  // Invalid: Max is 15
    DEX: 14,
    CON: 14,
    INT: 15,
    WIS: 12,
    CHA: 8,
  },
};

const validation3 = validateCharacterPayload(invalidPbPayload);
assertTest(
  "Invalid Point Buy (Score of 16) Rejection",
  !validation3.isValid,
  "Should have failed Point Buy check because STR is 16."
);

// ----------------------------------------
// TEST 4: HP Calculation Scaling (Tough and Dwarf Traits)
// ----------------------------------------
// Class: Barbarian (d12), CON: 14 (+2 mod). Dwarf: +1 HP, Tough: +2 HP.
// Expected HP: 12 + 2 (CON) + 1 (Dwarf) + 2 (Tough) = 17 HP
const pointBuyStats = { STR: 15, DEX: 13, CON: 14, INT: 8, WIS: 10, CHA: 10 };
const calculatedHP = calculateHP(
  "Barbarian",
  pointBuyStats,
  [], // No extra CON asi
  "Dwarf",
  ["Tough"]
);
assertTest(
  "HP Calculation Scaling for Dwarf Barbarian with Tough Feat",
  calculatedHP === 17,
  `Calculated: ${calculatedHP}, Expected: 17`
);

// ----------------------------------------
// TEST 5: Language Overlap Validation
// ----------------------------------------
const overlappingLanguagePayload: CharacterCreationPayload = {
  ...validWizardPayload,
  chosenLanguages: ["Elven", "Giant"], // Invalid: "Elven" is already granted by Elf species!
};

const validation5 = validateCharacterPayload(overlappingLanguagePayload);
assertTest(
  "Overlapping Species Language Prevention",
  !validation5.isValid,
  "Should have failed because Elven is a default species language."
);
assertTest(
  "Overlapping Language Error Message check",
  validation5.errors.some((err) => err.includes("already granted by Background or Species default")),
  `Expected duplicate language error. Found: ${validation5.errors.join("; ")}`
);

// ----------------------------------------
// TEST 6: Shop Ledger Spending & Carrying Weight
// ----------------------------------------
const startingGoldShopPayload: CharacterCreationPayload = {
  ...validWizardPayload,
  takeStartingGold: true,
  startingGoldPurchases: [
    { itemName: "Plate Armor", quantity: 1 }, // 1500 GP (Wizard gold limit is 120 GP!)
    { itemName: "Pike", quantity: 2 },        // 36 lbs
  ],
};

const validation6 = validateCharacterPayload(startingGoldShopPayload);
assertTest(
  "Starting Gold Budget Cap & Overweight Rejection",
  !validation6.isValid,
  "Should have failed shop ledger validations due to budget overflow."
);

// ----------------------------------------
// TEST 7: Advanced Character Sheet AC & Initiative (Alert Feat) Compilation
// ----------------------------------------
const alertFighterPayload: CharacterCreationPayload = {
  name: "Brog the Shield",
  background: "Criminal", // tripler: DEX, CON, INT. Feat: Alert
  asiAllocations: [
    { stat: "DEX", value: 2 },
    { stat: "CON", value: 1 },
  ],
  species: "Dwarf",
  speciesSize: "Medium",
  classSelection: "Fighter",
  classSkillSelections: ["Athletics", "Perception"],
  classWeaponMasteriesSelections: ["Greatsword", "Light Crossbow", "Halberd"], // 3 masteries
  pointBuyStats: {
    STR: 15,  // 9 pts
    DEX: 13,  // 5 pts
    CON: 14,  // 7 pts
    INT: 10,  // 2 pts
    WIS: 12,  // 4 pts
    CHA: 8,   // 0 pts
  },          // Total: 27 points
  chosenLanguages: ["Goblin", "Orc"],
  takeStartingGold: true,
  startingGoldPurchases: [
    { itemName: "Chain Mail", quantity: 1 }, // AC = 16, weight = 55 lbs
    { itemName: "Shield", quantity: 1 },     // AC = +2, weight = 6 lbs
    { itemName: "Greatsword", quantity: 1 }, // weight = 6 lbs
  ],                                         // Total spent: 75 (Mail) + 10 (Shield) + 50 (Greatsword) = 135 GP (Limit for Fighter is 125 GP! This is invalid. Let's make it valid by removing Greatsword and buying shortsword!)
};

// Adjust gold purchases to make it valid under 125 GP budget
const validFighterPayload: CharacterCreationPayload = {
  ...alertFighterPayload,
  startingGoldPurchases: [
    { itemName: "Chain Mail", quantity: 1 }, // 75 GP
    { itemName: "Shield", quantity: 1 },     // 10 GP
    { itemName: "Shortsword", quantity: 1 }, // 10 GP. Total: 95 GP.
  ],
};

const validation7 = validateCharacterPayload(validFighterPayload);
assertTest("Valid Starting Gold Fighter Validation", validation7.isValid, validation7.errors.join("; "));

const sheet7 = buildCharacterSheet(validFighterPayload);
assertTest("Alert Fighter AC (Chain Mail + Shield)", sheet7.derivedStats.armorClass === 18, `Expected AC 18. Got ${sheet7.derivedStats.armorClass}`);
// DEX mod is +2 (13 base + 2 ASI = 15 score, +2 mod). Alert Feat adds +2 PB to initiative. Total: +4
assertTest("Alert Fighter Initiative (+2 DEX + 2 PB)", sheet7.derivedStats.initiative === 4, `Expected Initiative +4. Got ${sheet7.derivedStats.initiative}`);
assertTest("Dwarf Fighter Max HP scaling", sheet7.maxHP === 13, `Expected HP 13 (10 base + 2 CON + 1 Dwarf toughness). Got ${sheet7.maxHP}`);

console.log("\n==========================================");
console.log("ALL TESTS COMPLETED SUCCESSFULLY! 100% COMPLIANT!");
console.log("==========================================");
