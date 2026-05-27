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
  wizardSpellbookSelections: ["Shield", "Magic Missile", "Mage Armor", "Thunderwave", "Identify", "Grease"],
};

const validation1 = validateCharacterPayload(validWizardPayload);
assertTest("Valid Level 1 Wizard Character Validation", validation1.isValid, validation1.errors.join("; "));

// Compile Character Sheet
const sheet1 = buildCharacterSheet(validWizardPayload);
assertTest("Compile Character Sheet Object Success", !!sheet1);
assertTest("Base Wizard Max HP Calculation", sheet1.maxHP === 7, `Expected 7 (6 base + 1 CON). Got ${sheet1.maxHP}`);
assertTest("Base Wizard AC Calculation", sheet1.derivedStats.armorClass === 12, `Expected 12 (10 base + 2 DEX). Got ${sheet1.derivedStats.armorClass}`);

// ----------------------------------------
// TEST 2: Multi-Source Isolated Spellcasting Modifiers (Phase 1)
// ----------------------------------------
assertTest(
  "Wizard Class Spellcasting isolation (INT-based)",
  sheet1.derivedStats.classSpellcasting?.castingAbility === "INT" &&
    sheet1.derivedStats.classSpellcasting?.spellSaveDC === 13 &&
    sheet1.derivedStats.classSpellcasting?.spellAttackModifier === 5,
  `Class spellcasting did not isolate INT mod correctly.`
);
assertTest(
  "Wizard Origin Feat Spellcasting isolation (WIS-based)",
  sheet1.derivedStats.originFeatSpellcasting?.castingAbility === "WIS" &&
    sheet1.derivedStats.originFeatSpellcasting?.spellSaveDC === 12 &&
    sheet1.derivedStats.originFeatSpellcasting?.spellAttackModifier === 4,
  `Origin feat spellcasting did not isolate WIS mod correctly.`
);

// ----------------------------------------
// TEST 3: Background ASI Violation (Strength on Acolyte)
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

// ----------------------------------------
// TEST 4: Invalid Point Buy (Out of Bounds & Cost limit)
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
// TEST 5: HP Calculation Scaling (Tough and Dwarf Traits)
// ----------------------------------------
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
// TEST 6: Language Overlap Validation
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

// ----------------------------------------
// TEST 7: Shop Ledger Spending & Carrying Weight
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
// TEST 8: Alert Fighter AC & Initiative (Alert Feat) Compilation
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
    { itemName: "Shortsword", quantity: 1 }, // 10 GP. Total: 95 GP.
  ],
};

const validation7 = validateCharacterPayload(alertFighterPayload);
assertTest("Valid Starting Gold Fighter Validation", validation7.isValid, validation7.errors.join("; "));

const sheet7 = buildCharacterSheet(alertFighterPayload);
assertTest("Alert Fighter AC (Chain Mail + Shield)", sheet7.derivedStats.armorClass === 18, `Expected AC 18. Got ${sheet7.derivedStats.armorClass}`);
assertTest("Alert Fighter Initiative (+2 DEX + 2 PB)", sheet7.derivedStats.initiative === 4, `Expected Initiative +4. Got ${sheet7.derivedStats.initiative}`);
assertTest("Dwarf Fighter Max HP scaling", sheet7.maxHP === 13, `Expected HP 13 (10 base + 2 CON + 1 Dwarf toughness). Got ${sheet7.maxHP}`);

// ----------------------------------------
// TEST 9: Background Skill Collision Resolver (Phase 4)
// ----------------------------------------
// Cleric Acolyte. Background grants Religion. Cleric selects Religion -> COLLISION!
const collisionClericPayload: CharacterCreationPayload = {
  name: "Brother Marcus",
  background: "Acolyte", // tripler: INT, WIS, CHA. Skills: Insight, Religion.
  asiAllocations: [
    { stat: "WIS", value: 2 },
    { stat: "CHA", value: 1 },
  ],
  species: "Human",
  speciesSize: "Medium",
  speciesBonusFeatSelection: "Tough",
  classSelection: "Cleric",
  classSkillSelections: ["History", "Religion"], // Religion COLLIDES with Acolyte!
  classWeaponMasteriesSelections: [],
  classPreparedSpellsSelections: ["Bless", "Healing Word", "Guiding Bolt", "Shield of Faith"],
  pointBuyStats: {
    STR: 10,  // 2 pts
    DEX: 12,  // 4 pts
    CON: 14,  // 7 pts
    INT: 10,  // 2 pts
    WIS: 15,  // 9 pts
    CHA: 11,  // 3 pts
  },          // Total: 27 points
  chosenLanguages: ["Gnomish", "Orc"],
  magicInitiateBackgroundDetails: {
    source: "Divine",
    cantrips: ["Guidance", "Light"],
    firstLevelSpell: "Bless",
    castingAbility: "WIS",
  },
  takeStartingGold: false,
};

// Check rejection without wildcards
const validationCollisionFail = validateCharacterPayload(collisionClericPayload);
assertTest(
  "Skill Collision Rejection without wildcards",
  !validationCollisionFail.isValid,
  "Should have failed because Religion is selected twice without wildcard alternates."
);

// Resolve with wildcard skill Athletics
const resolvedClericPayload: CharacterCreationPayload = {
  ...collisionClericPayload,
  wildcardSkillSelections: ["Athletics"], // wildcard alternative
};
const validationCollisionPass = validateCharacterPayload(resolvedClericPayload);
assertTest("Skill Collision Resolution with wildcard Athletics", validationCollisionPass.isValid, validationCollisionPass.errors.join("; "));

const sheetCollision = buildCharacterSheet(resolvedClericPayload);
assertTest(
  "Resolved skills include wildcard Athletics",
  sheetCollision.proficiencies.skills.includes("Athletics"),
  "Athletics was not registered in final proficiencies list."
);

// ----------------------------------------
// TEST 10: Warlock Invocations Lessons of the First Ones (Recursion Phase 2)
// ----------------------------------------
const warlockPayload: CharacterCreationPayload = {
  name: "Malakor the Dark",
  background: "Sage", // tripler: CON, INT, WIS. Feat: Magic Initiate (Arcane)
  asiAllocations: [
    { stat: "INT", value: 2 },
    { stat: "WIS", value: 1 },
  ],
  species: "Tiefling",
  speciesSize: "Medium",
  classSelection: "Warlock",
  classSkillSelections: ["Deception", "Investigation"],
  classWeaponMasteriesSelections: [],
  classPreparedSpellsSelections: ["Charm Person", "Thunderwave"],
  warlockInvocationsSelections: ["Fiendish Vigor", "Lessons of the First Ones"], // Lessons of the First Ones triggers recursion!
  warlockLessonsOfTheFirstOnesFeatSelection: "Tough", // Recursive Origin Feat choice
  pointBuyStats: {
    STR: 8,   // 0 pts
    DEX: 14,  // 7 pts
    CON: 14,  // 7 pts
    INT: 13,  // 5 pts
    WIS: 13,  // 5 pts
    CHA: 11,  // 3 pts
  },          // Total: 27 points
  chosenLanguages: ["Gnomish", "Giant"],
  magicInitiateBackgroundDetails: {
    source: "Arcane",
    cantrips: ["Fire Bolt", "Mage Hand"],
    firstLevelSpell: "Shield",
    castingAbility: "INT",
  },
  takeStartingGold: false,
};

const validationWarlock = validateCharacterPayload(warlockPayload);
assertTest("Warlock Lessons of the First Ones Validation", validationWarlock.isValid, validationWarlock.errors.join("; "));

const warlockSheet = buildCharacterSheet(warlockPayload);
// Warlock base HP is 8. CON modifier is +2. Tough feat adds +2. Total: 12 HP!
assertTest(
  "Warlock recursive Tough feat HP scaling",
  warlockSheet.maxHP === 12,
  `Expected HP 12 (8 base + 2 CON + 2 Tough feat recursively). Got ${warlockSheet.maxHP}`
);

// ----------------------------------------
// TEST 11: Path A Starting Gear Choice Trees (Phase 5)
// ----------------------------------------
const pathAFighterPayload: CharacterCreationPayload = {
  ...alertFighterPayload,
  takeStartingGold: false, // Path A Starting Packages!
  pathAEquipmentSelections: {
    classArmorChoice: "a", // Chain Mail
    classWeaponChoice: "b", // Longsword + Shield
  },
};

const validationPathA = validateCharacterPayload(pathAFighterPayload);
assertTest("Fighter Path A Gear Choices Validation", validationPathA.isValid, validationPathA.errors.join("; "));

const pathASheet = buildCharacterSheet(pathAFighterPayload);
assertTest(
  "Path A AC calculations compile to AC 18",
  pathASheet.derivedStats.armorClass === 18,
  `Expected AC 18 from Chain Mail + Shield. Got ${pathASheet.derivedStats.armorClass}`
);
assertTest(
  "Path A inventory includes Chain Mail, Shield, and Longsword",
  pathASheet.inventory.some((i) => i.itemName === "Chain Mail") &&
    pathASheet.inventory.some((i) => i.itemName === "Shield") &&
    pathASheet.inventory.some((i) => i.itemName === "Longsword"),
  "Missing armor/weapon selection mapping from starting gear choice trees."
);

console.log("\n==========================================");
console.log("ALL TESTS COMPLETED SUCCESSFULLY! 100% COMPLIANT!");
console.log("==========================================");
