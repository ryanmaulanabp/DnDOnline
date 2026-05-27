export type Ability = "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";

export interface AbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export type Skill =
  | "Acrobatics"
  | "Animal Handling"
  | "Arcana"
  | "Athletics"
  | "Deception"
  | "History"
  | "Insight"
  | "Intimidation"
  | "Investigation"
  | "Medicine"
  | "Nature"
  | "Perception"
  | "Performance"
  | "Persuasion"
  | "Religion"
  | "Sleight of Hand"
  | "Stealth"
  | "Survival";

export type Tool =
  | "Alchemist's Supplies"
  | "Brewer's Supplies"
  | "Calligrapher's Supplies"
  | "Carpenter's Tools"
  | "Cartographer's Tools"
  | "Cobbler's Tools"
  | "Cook's Utensils"
  | "Glassblower's Tools"
  | "Jeweler's Tools"
  | "Leatherworker's Tools"
  | "Mason's Tools"
  | "Painter's Supplies"
  | "Potter's Tools"
  | "Smith's Tools"
  | "Tinker's Tools"
  | "Weaver's Tools"
  | "Woodcarver's Tools"
  | "Disguise Kit"
  | "Forgery Kit"
  | "Herbalism Kit"
  | "Navigator's Tools"
  | "Poisoner's Kit"
  | "Thieves' Tools"
  | "Bagpipes"
  | "Drum"
  | "Flute"
  | "Lute"
  | "Lyre"
  | "Horn"
  | "Pan Flute"
  | "Shawm"
  | "Viol"
  | "Dulcimer";

export type MagicSource = "Arcane" | "Divine" | "Primal";

export interface MagicInitiateDetails {
  source: MagicSource;
  cantrips: string[];
  firstLevelSpell: string;
  castingAbility: "INT" | "WIS" | "CHA";
}

export interface OriginFeat {
  name: string;
  description: string;
  prerequisites?: string;
  magicInitiate?: MagicInitiateDetails;
  skilledChosen?: (Skill | Tool)[];
}

export interface Background {
  name: string;
  description: string;
  asiTriplet: [Ability, Ability, Ability];
  skills: [Skill, Skill];
  tool: Tool;
  originFeat: OriginFeat;
  languages: string[];
  equipment: string[];
}

export type SpeciesType =
  | "Aasimar"
  | "Dragonborn"
  | "Dwarf"
  | "Elf"
  | "Gnome"
  | "Goliath"
  | "Halfling"
  | "Human"
  | "Orc"
  | "Tiefling";

export type SizeCategory = "Medium" | "Small";

export interface InnateSpellDetails {
  name: string;
  level: number;
  usesPerLongRest?: string; // e.g. "1" or "PB"
}

export type GoliathAncestry =
  | "Cloud Giant (Teleportation)"
  | "Fire Giant (Extra Damage)"
  | "Frost Giant (Cold Ward)"
  | "Hill Giant (Knock Down)"
  | "Stone Giant (Reaction Damage Reduction)"
  | "Storm Giant (Thunder Reaction)";

export interface Species {
  name: SpeciesType;
  description: string;
  speed: number;
  size: SizeCategory[];
  traits: string[];
  languages: string[];
  innateSpells?: InnateSpellDetails[];
  bonusFeat?: OriginFeat; // Human bonus feat
  goliathAncestry?: GoliathAncestry;
  dragonbornBreathElement?: "Acid" | "Cold" | "Fire" | "Lightning" | "Poison";
}

export type ClassType =
  | "Barbarian"
  | "Bard"
  | "Cleric"
  | "Druid"
  | "Fighter"
  | "Monk"
  | "Paladin"
  | "Ranger"
  | "Rogue"
  | "Sorcerer"
  | "Warlock"
  | "Wizard";

export type MasteryProperty =
  | "Cleave"
  | "Graze"
  | "Nick"
  | "Push"
  | "Sap"
  | "Slow"
  | "Topple"
  | "Vex";

export interface Weapon {
  name: string;
  costGold: number;
  weightLbs: number;
  damage: string;
  properties: string[];
  masteryProperty: MasteryProperty;
}

export interface ClassDetails {
  name: ClassType;
  hitDie: number;
  savingThrows: [Ability, Ability];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  skillChoices: {
    count: number;
    pool: Skill[];
  };
  weaponMasteriesCount: number;
  preparedSpellsCount?: number;
  spellcastingAbility?: Ability;
  cantripsKnownCount?: number;
  startingEquipment: string[];
  startingGoldAverage: number;
}

export interface ASIAllocation {
  stat: Ability;
  value: number; // e.g. +2 or +1
}

export interface StartingGoldShopPurchase {
  itemName: string;
  quantity: number;
}

// Choice tree for Path A Equipment packages
export interface PathAEquipmentSelections {
  classArmorChoice?: "a" | "b";
  classWeaponChoice?: "a" | "b";
  classPackChoice?: "a" | "b";
}

export interface CharacterCreationPayload {
  name: string;
  background: string;
  asiAllocations: ASIAllocation[]; // Strict +2/+1 or +1/+1/+1 exclusive to Background triplet
  species: SpeciesType;
  speciesSize: SizeCategory;
  goliathAncestrySelection?: GoliathAncestry;
  dragonbornBreathSelection?: "Acid" | "Cold" | "Fire" | "Lightning" | "Poison";
  speciesBonusFeatSelection?: string; // For Human additional Origin Feat name
  speciesBonusFeatMagicInitiateDetails?: MagicInitiateDetails; // If Human selects Magic Initiate
  magicInitiateBackgroundDetails?: MagicInitiateDetails; // If Background grants Magic Initiate
  
  // Class selection and granual Level 1 choices
  classSelection: ClassType;
  classSkillSelections: Skill[];
  classWeaponMasteriesSelections: string[]; // List of weapon names selected to master
  classPreparedSpellsSelections?: string[];
  
  // granual class-specific micro-decisions (Phase 2)
  clericDivineOrder?: "Protector" | "Thaumaturgist";
  druidPrimalOrder?: "Magician" | "Warden";
  fighterFightingStyle?: "Archery" | "Defense" | "Dueling" | "Great Weapon Fighting" | "Interception" | "Two-Weapon Fighting";
  paladinFightingStyle?: "Defense" | "Dueling" | "Great Weapon Fighting" | "Blessed Warrior";
  rogueExpertiseSelections?: [Skill, Skill];
  warlockInvocationsSelections?: [string, string];
  warlockLessonsOfTheFirstOnesFeatSelection?: string; // If 'Lessons of the First Ones' is chosen
  wizardSpellbookSelections?: string[]; // wizard spellbook catalog
  
  // Dynamic Wildcard resolvers for collisions (Phase 4)
  wildcardSkillSelections?: Skill[];
  wildcardToolSelections?: Tool[];
  
  pointBuyStats: AbilityScores;
  chosenLanguages: string[]; // Custom languages (usually 2, after filtering background/species defaults)
  
  // Inventory (Phase 5)
  takeStartingGold: boolean;
  startingGoldPurchases?: StartingGoldShopPurchase[];
  pathAEquipmentSelections?: PathAEquipmentSelections; // Choice tree selections
}

// ==========================================
// 4. COMPUTED LEVEL 1 CHARACTER SHEET DEFINITIONS
// ==========================================

export interface ClassFeature {
  name: string;
  description: string;
  value?: string | number;
}

export interface DerivedStats {
  armorClass: number;
  initiative: number;
  passivePerception: number;
  carryingCapacityLbs: number;
  classSpellcasting?: {
    spellSaveDC: number;
    spellAttackModifier: number;
    castingAbility: Ability;
  };
  originFeatSpellcasting?: {
    spellSaveDC: number;
    spellAttackModifier: number;
    castingAbility: Ability;
  };
  speciesSpellcasting?: {
    spellSaveDC: number;
    spellAttackModifier: number;
    castingAbility: Ability;
  };
}

export interface CharacterSheet {
  name: string;
  background: string;
  species: SpeciesType;
  size: SizeCategory;
  class: ClassType;
  baseAbilityScores: AbilityScores;
  allocatedASIs: ASIAllocation[];
  finalAbilityScores: AbilityScores;
  abilityModifiers: AbilityScores;
  maxHP: number;
  hitDie: string; // e.g. "1d10"
  speedFt: number;
  proficiencies: {
    savingThrows: Ability[];
    skills: Skill[];
    tools: Tool[];
    armors: string[];
    weapons: string[];
    languages: string[];
  };
  weaponMasteries: {
    weaponName: string;
    masteryProperty: MasteryProperty;
  }[];
  originFeats: {
    name: string;
    description: string;
    magicInitiateDetails?: MagicInitiateDetails;
  }[];
  classFeatures: ClassFeature[];
  innateSpells: {
    name: string;
    level: number;
    castingAbility?: string;
    saveDC?: number;
  }[];
  preparedSpells: string[];
  inventory: {
    itemName: string;
    quantity: number;
    weightTotalLbs: number;
  }[];
  startingGoldLeft: number;
  totalWeightCarriedLbs: number;
  derivedStats: DerivedStats;
}

export interface CharacterValidationResult {
  isValid: boolean;
  errors: string[];
}
