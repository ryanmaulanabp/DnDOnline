import {
  Ability,
  AbilityScores,
  Skill,
  Tool,
  MagicSource,
  MagicInitiateDetails,
  OriginFeat,
  Background,
  SpeciesType,
  SizeCategory,
  InnateSpellDetails,
  GoliathAncestry,
  Species,
  ClassType,
  MasteryProperty,
  Weapon,
  ClassDetails,
  ASIAllocation,
  StartingGoldShopPurchase,
  PathAEquipmentSelections,
  CharacterCreationPayload,
  CharacterValidationResult,
  CharacterSheet,
  ClassFeature,
  DerivedStats,
} from "./types";

// ==========================================
// 1. COMPREHENSIVE RULES REFERENCE DATA
// ==========================================

export const ALL_ABILITIES: Ability[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

export const ALL_SKILLS: Skill[] = [
  "Acrobatics",
  "Animal Handling",
  "Arcana",
  "Athletics",
  "Deception",
  "History",
  "Insight",
  "Intimidation",
  "Investigation",
  "Medicine",
  "Nature",
  "Perception",
  "Performance",
  "Persuasion",
  "Religion",
  "Sleight of Hand",
  "Stealth",
  "Survival",
];

export const ALL_TOOLS: Tool[] = [
  "Alchemist's Supplies",
  "Brewer's Supplies",
  "Calligrapher's Supplies",
  "Carpenter's Tools",
  "Cartographer's Tools",
  "Cobbler's Tools",
  "Cook's Utensils",
  "Glassblower's Tools",
  "Jeweler's Tools",
  "Leatherworker's Tools",
  "Mason's Tools",
  "Painter's Supplies",
  "Potter's Tools",
  "Smith's Tools",
  "Tinker's Tools",
  "Weaver's Tools",
  "Woodcarver's Tools",
  "Disguise Kit",
  "Forgery Kit",
  "Herbalism Kit",
  "Navigator's Tools",
  "Poisoner's Kit",
  "Thieves' Tools",
  "Bagpipes",
  "Drum",
  "Flute",
  "Lute",
  "Lyre",
  "Horn",
  "Pan Flute",
  "Shawm",
  "Viol",
  "Dulcimer",
];

export const SPELL_LISTS: Record<MagicSource, { cantrips: string[]; level1: string[] }> = {
  Arcane: {
    cantrips: [
      "Acid Splash",
      "Blade Ward",
      "Chill Touch",
      "Dancing Lights",
      "Fire Bolt",
      "Light",
      "Mage Hand",
      "Message",
      "Minor Illusion",
      "Prestidigitation",
      "Ray of Frost",
      "Shocking Grasp",
      "True Strike",
    ],
    level1: [
      "Burning Hands",
      "Charm Person",
      "Color Spray",
      "Detect Magic",
      "Disguise Self",
      "Expeditious Retreat",
      "False Life",
      "Feather Fall",
      "Find Familiar",
      "Grease",
      "Identify",
      "Mage Armor",
      "Magic Missile",
      "Shield",
      "Silent Image",
      "Sleep",
      "Tasha's Hideous Laughter",
      "Thunderwave",
    ],
  },
  Divine: {
    cantrips: [
      "Guidance",
      "Light",
      "Mending",
      "Sacred Flame",
      "Spare the Dying",
      "Thaumaturgy",
      "True Strike",
    ],
    level1: [
      "Bane",
      "Bless",
      "Command",
      "Cure Wounds",
      "Detect Evil and Good",
      "Detect Magic",
      "Divine Favor",
      "Guiding Bolt",
      "Healing Word",
      "Inflict Wounds",
      "Protection from Evil and Good",
      "Sanctuary",
      "Shield of Faith",
    ],
  },
  Primal: {
    cantrips: [
      "Druidcraft",
      "Guidance",
      "Mending",
      "Poison Spray",
      "Produce Flame",
      "Resistance",
      "Shillelagh",
      "Spare the Dying",
      "Thorn Whip",
    ],
    level1: [
      "Animal Friendship",
      "Cure Wounds",
      "Detect Magic",
      "Detect Poison and Disease",
      "Entangle",
      "Fog Cloud",
      "Goodberry",
      "Healing Word",
      "Hunter's Mark",
      "Jump",
      "Longstrider",
      "Speak with Animals",
      "Thunderwave",
    ],
  },
};

export const BACKGROUNDS_DB: Record<string, Background> = {
  Acolyte: {
    name: "Acolyte",
    description: "You spent your youth in a temple, learning rites and serving priests.",
    asiTriplet: ["INT", "WIS", "CHA"],
    skills: ["Insight", "Religion"],
    tool: "Calligrapher's Supplies",
    originFeat: {
      name: "Magic Initiate",
      description: "Learn cantrips and a first-level spell from the Divine source.",
    },
    languages: ["Celestial", "Deep Speech"],
    equipment: ["Holy Symbol", "Book of Prayers", "Vestments", "5 Incense Sticks"],
  },
  Artisan: {
    name: "Artisan",
    description: "You served an apprenticeship under a master craftsperson, learning a trade.",
    asiTriplet: ["STR", "DEX", "INT"],
    skills: ["Athletics", "History"],
    tool: "Tinker's Tools",
    originFeat: {
      name: "Crafter",
      description: "Gain tool proficiencies and a 20% discount on non-magical items.",
    },
    languages: ["Gnomish", "Dwarvish"],
    equipment: ["Abacus", "Merchant's Scale", "Iron Pot", "Tinker's Tools"],
  },
  Charlatan: {
    name: "Charlatan",
    description: "You know how to read people and weave falsehoods to get what you want.",
    asiTriplet: ["DEX", "CON", "CHA"],
    skills: ["Deception", "Sleight of Hand"],
    tool: "Disguise Kit",
    originFeat: {
      name: "Skilled",
      description: "Gain proficiency in any combination of three skills or tools.",
    },
    languages: ["Thieves' Cant", "Goblin"],
    equipment: ["Disguise Kit", "Fine Clothes", "10 Stoppered Bottles", "Weighted Dice"],
  },
  Criminal: {
    name: "Criminal",
    description: "You have a history of breaking the law and surviving on the streets.",
    asiTriplet: ["DEX", "CON", "INT"],
    skills: ["Sleight of Hand", "Stealth"],
    tool: "Thieves' Tools",
    originFeat: {
      name: "Alert",
      description: "Add proficiency bonus to initiative rolls and swap initiative stats.",
    },
    languages: ["Thieves' Cant", "Undercommon"],
    equipment: ["Thieves' Tools", "Crowbar", "Dark Clothes with Hood", "Iron Spike"],
  },
  Entertainer: {
    name: "Entertainer",
    description: "You thrive in front of an audience, knowing how to capture their attention.",
    asiTriplet: ["DEX", "CON", "CHA"],
    skills: ["Acrobatics", "Performance"],
    tool: "Lute",
    originFeat: {
      name: "Musician",
      description: "Give Heroic Inspiration to allies after short or long rests.",
    },
    languages: ["Elven", "Sylvan"],
    equipment: ["Lute", "Costume", "Steel Mirror", "Perfume Vial"],
  },
  Farmer: {
    name: "Farmer",
    description: "You grew up working the land, cultivating crops and tending livestock.",
    asiTriplet: ["STR", "CON", "WIS"],
    skills: ["Animal Handling", "Nature"],
    tool: "Carpenter's Tools",
    originFeat: {
      name: "Tough",
      description: "Your hit point maximum increases by 2 at level 1, and 2 per level hereafter.",
    },
    languages: ["Halfling", "Giant"],
    equipment: ["Carpenter's Tools", "Sickle", "Iron Pot", "Shovel"],
  },
  Guard: {
    name: "Guard",
    description: "You served as a sentry on castle walls or a watch officer in town.",
    asiTriplet: ["STR", "DEX", "WIS"],
    skills: ["Athletics", "Perception"],
    tool: "Drum",
    originFeat: {
      name: "Alert",
      description: "Add proficiency bonus to initiative rolls and swap initiative stats.",
    },
    languages: ["Dwarvish", "Orc"],
    equipment: ["Spear", "Light Crossbow", "20 Bolts", "Drum", "Hooded Lantern"],
  },
  Guide: {
    name: "Guide",
    description: "You know the wilderness, leading travelers safely through dangerous terrain.",
    asiTriplet: ["DEX", "CON", "WIS"],
    skills: ["Stealth", "Survival"],
    tool: "Navigator's Tools",
    originFeat: {
      name: "Magic Initiate",
      description: "Learn cantrips and a first-level spell from the Primal source.",
    },
    languages: ["Giant", "Sylvan"],
    equipment: ["Shortbow", "20 Arrows", "Navigator's Tools", "Bedroll", "Quiver"],
  },
  Hermit: {
    name: "Hermit",
    description: "You lived in isolation, seeking spiritual guidance, research, or peace.",
    asiTriplet: ["CON", "INT", "WIS"],
    skills: ["Medicine", "Religion"],
    tool: "Herbalism Kit",
    originFeat: {
      name: "Healer",
      description: "Stabilize creatures and heal them using a healer's kit.",
    },
    languages: ["Sylvan", "Celestial"],
    equipment: ["Quarterstaff", "Herbalism Kit", "Bedroll", "3 Blank Books", "Ink Well"],
  },
  Merchant: {
    name: "Merchant",
    description: "You bought, sold, and traded wares, understanding values and logistics.",
    asiTriplet: ["CON", "INT", "CHA"],
    skills: ["Animal Handling", "Persuasion"],
    tool: "Navigator's Tools",
    originFeat: {
      name: "Lucky",
      description: "Gain Luck Points equal to your proficiency bonus to reroll or force rerolls.",
    },
    languages: ["Dwarvish", "Halfling"],
    equipment: ["Scale", "Abacus", "Navigator's Tools", "Leather Pouch"],
  },
  Noble: {
    name: "Noble",
    description: "You were born into wealth, power, and privilege, with ties to high society.",
    asiTriplet: ["STR", "INT", "CHA"],
    skills: ["History", "Persuasion"],
    tool: "Calligrapher's Supplies",
    originFeat: {
      name: "Skilled",
      description: "Gain proficiency in any combination of three skills or tools.",
    },
    languages: ["Draconic", "Elven"],
    equipment: ["Signet Ring", "Fine Clothes", "Calligrapher's Supplies", "Perfume Bottle"],
  },
  Pilgrim: {
    name: "Pilgrim",
    description: "You traveled to holy sites, seeking penance, enlightenment, or connection.",
    asiTriplet: ["STR", "CON", "WIS"],
    skills: ["Religion", "Survival"],
    tool: "Herbalism Kit",
    originFeat: {
      name: "Healer",
      description: "Stabilize creatures and heal them using a healer's kit.",
    },
    languages: ["Celestial", "Abyssal"],
    equipment: ["Herbalism Kit", "Quarterstaff", "Bedroll", "Holy Symbol"],
  },
  Sage: {
    name: "Sage",
    description: "You spent years studying manuscripts, archives, and magical lore.",
    asiTriplet: ["CON", "INT", "WIS"],
    skills: ["Arcana", "History"],
    tool: "Calligrapher's Supplies",
    originFeat: {
      name: "Magic Initiate",
      description: "Learn cantrips and a first-level spell from the Arcane source.",
    },
    languages: ["Elven", "Draconic"],
    equipment: ["Calligrapher's Supplies", "Quarterstaff", "Book of Lore", "Ink Pen"],
  },
  Sailor: {
    name: "Sailor",
    description: "You worked aboard a vessel, weathering storms and navigating open waters.",
    asiTriplet: ["STR", "DEX", "WIS"],
    skills: ["Athletics", "Perception"],
    tool: "Navigator's Tools",
    originFeat: {
      name: "Tavern Brawler",
      description: "Excel at unarmed strikes, improvised weapons, and pushing enemies.",
    },
    languages: ["Aquan", "Elven"],
    equipment: ["Dagger", "Navigator's Tools", "50ft Hempen Rope", "Belaying Pin"],
  },
  Scribe: {
    name: "Scribe",
    description: "You recorded documents, copied scrolls, and maintained library ledgers.",
    asiTriplet: ["DEX", "INT", "CHA"],
    skills: ["Investigation", "Religion"],
    tool: "Calligrapher's Supplies",
    originFeat: {
      name: "Skilled",
      description: "Gain proficiency in any combination of three skills or tools.",
    },
    languages: ["Elven", "Dwarvish"],
    equipment: ["Calligrapher's Supplies", "Fine Clothes", "Ink Bottle", "10 Sheets of Parchment"],
  },
  Soldier: {
    name: "Soldier",
    description: "You trained for military combat and fought on battlefields.",
    asiTriplet: ["STR", "CON", "CHA"],
    skills: ["Athletics", "Intimidation"],
    tool: "Drum",
    originFeat: {
      name: "Savage Attacker",
      description: "Once per turn, roll weapon damage twice and take the higher total.",
    },
    languages: ["Goblin", "Orc"],
    equipment: ["Spear", "Shield", "Drum", "Set of Bone Dice", "Soldier's Uniform"],
  },
};

export const SPECIES_DB: Record<SpeciesType, Species> = {
  Aasimar: {
    name: "Aasimar",
    description: "Mortals carrying a spark of the Upper Planes, manifesting halo or wings.",
    speed: 30,
    size: ["Medium", "Small"],
    traits: ["Darkvision (60ft)", "Celestial Resistance (Necrotic/Radiant)", "Celestial Revelation (Transformation flags)", "Light-Bearer"],
    languages: ["Celestial"],
    innateSpells: [{ name: "Light", level: 0 }],
  },
  Dragonborn: {
    name: "Dragonborn",
    description: "Descendants of dragons, wielding breath elements and elemental resistances.",
    speed: 30,
    size: ["Medium"],
    traits: ["Breath Weapon (PB Uses/LR, DC = 8 + CON + PB)", "Draconic Resistance"],
    languages: ["Draconic"],
  },
  Dwarf: {
    name: "Dwarf",
    description: "Stout and resilient subterranean dwellers, resilient to poison and stonework.",
    speed: 30,
    size: ["Medium"],
    traits: ["Darkvision (60ft)", "Dwarven Resilience", "Stonecunning (Telescopic Tremorsense)", "Dwarven Toughness (+1 Max HP)"],
    languages: ["Dwarvish"],
  },
  Elf: {
    name: "Elf",
    description: "Magical beings closely bound to nature and the Feywild.",
    speed: 30,
    size: ["Medium", "Small"],
    traits: ["Darkvision (60ft / 120ft Drow)", "Fey Ancestry", "Keen Senses (Perception proficiency)", "Elven Lineage (High, Wood, or Drow)"],
    languages: ["Elven"],
  },
  Gnome: {
    name: "Gnome",
    description: "Small magical creatures holding innate magic and resilient minds.",
    speed: 30,
    size: ["Small"],
    traits: ["Darkvision (60ft)", "Gnomish Cunning (Advantage on INT/WIS/CHA saves vs Magic)", "Gnomish Lineage (Forest or Rock)"],
    languages: ["Gnomish"],
  },
  Goliath: {
    name: "Goliath",
    description: "Gigantic humanoids carrying bloodlines of giant ancestors from cold peaks.",
    speed: 30,
    size: ["Medium"],
    traits: ["Giant Ancestry (Triggered reactions, PB Uses/LR)", "Powerful Build (Count as Large for carrying capacity)"],
    languages: ["Giant"],
  },
  Halfling: {
    name: "Halfling",
    description: "Nimble, lucky, and brave folk who cherish comforts and community.",
    speed: 30,
    size: ["Small"],
    traits: ["Brave (Advantage vs Frightened)", "Halfling Nimbleness (Squeeze through larger spaces)", "Lucky (Reroll Nat 1s)", "Naturally Stealthy"],
    languages: ["Halfling"],
  },
  Human: {
    name: "Human",
    description: "Highly adaptable, resourceful, and versatile individuals.",
    speed: 30,
    size: ["Medium", "Small"],
    traits: ["Resourceful (Heroic Inspiration on Long Rest)", "Versatile (1 extra Skill & 1 extra Origin Feat)"],
    languages: [],
  },
  Orc: {
    name: "Orc",
    description: "Strong, resilient humonoids possessing adrenaline-fueled resolve.",
    speed: 30,
    size: ["Medium"],
    traits: ["Adrenaline Rush (Dash as bonus action, PB uses/LR, gain PB Temp HP)", "Darkvision (60ft)", "Powerful Build", "Relentless Endurance (Drop to 1 HP instead of 0 once/LR)"],
    languages: ["Orc"],
  },
  Tiefling: {
    name: "Tiefling",
    description: "Mortals bound to planes of the Fiends, casting embers or shadows.",
    speed: 30,
    size: ["Medium", "Small"],
    traits: ["Darkvision (60ft)", "Otherworldly Presence", "Tiefling Lineage (Abyssal, Chthonic, or Infernal)"],
    languages: ["Infernal"],
  },
};

export const CLASSES_DB: Record<ClassType, ClassDetails> = {
  Barbarian: {
    name: "Barbarian",
    hitDie: 12,
    savingThrows: ["STR", "CON"],
    armorProficiencies: ["Light Armor", "Medium Armor", "Shields"],
    weaponProficiencies: ["Simple Weapons", "Martial Weapons"],
    skillChoices: {
      count: 2,
      pool: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"],
    },
    weaponMasteriesCount: 2,
    startingEquipment: ["Greataxe", "4 Javelins", "Explorer's Pack"],
    startingGoldAverage: 75,
  },
  Bard: {
    name: "Bard",
    hitDie: 8,
    savingThrows: ["DEX", "CHA"],
    armorProficiencies: ["Light Armor"],
    weaponProficiencies: ["Simple Weapons"],
    skillChoices: {
      count: 3,
      pool: [
        "Acrobatics",
        "Animal Handling",
        "Arcana",
        "Athletics",
        "Deception",
        "History",
        "Insight",
        "Intimidation",
        "Investigation",
        "Medicine",
        "Nature",
        "Perception",
        "Performance",
        "Persuasion",
        "Religion",
        "Sleight of Hand",
        "Stealth",
        "Survival",
      ],
    },
    weaponMasteriesCount: 0,
    preparedSpellsCount: 4,
    spellcastingAbility: "CHA",
    cantripsKnownCount: 2,
    startingEquipment: ["Dagger", "Lute", "Leather Armor", "Entertainer's Pack"],
    startingGoldAverage: 100,
  },
  Cleric: {
    name: "Cleric",
    hitDie: 8,
    savingThrows: ["WIS", "CHA"],
    armorProficiencies: ["Light Armor", "Medium Armor", "Shields"],
    weaponProficiencies: ["Simple Weapons"],
    skillChoices: {
      count: 2,
      pool: ["History", "Insight", "Medicine", "Persuasion", "Religion"],
    },
    weaponMasteriesCount: 0,
    preparedSpellsCount: 4,
    spellcastingAbility: "WIS",
    cantripsKnownCount: 3,
    startingEquipment: ["Mace", "Shield", "Chain Mail", "Holy Symbol", "Priest's Pack"],
    startingGoldAverage: 110,
  },
  Druid: {
    name: "Druid",
    hitDie: 8,
    savingThrows: ["INT", "WIS"],
    armorProficiencies: ["Light Armor", "Medium Armor", "Shields"],
    weaponProficiencies: ["Simple Weapons"],
    skillChoices: {
      count: 2,
      pool: ["Animal Handling", "Arcana", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"],
    },
    weaponMasteriesCount: 0,
    preparedSpellsCount: 4,
    spellcastingAbility: "WIS",
    cantripsKnownCount: 3,
    startingEquipment: ["Quarterstaff", "Leather Armor", "Druidic Focus (Wood Staff)", "Explorer's Pack"],
    startingGoldAverage: 70,
  },
  Fighter: {
    name: "Fighter",
    hitDie: 10,
    savingThrows: ["STR", "CON"],
    armorProficiencies: ["Light Armor", "Medium Armor", "Heavy Armor", "Shields"],
    weaponProficiencies: ["Simple Weapons", "Martial Weapons"],
    skillChoices: {
      count: 2,
      pool: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"],
    },
    weaponMasteriesCount: 3,
    startingEquipment: ["Greatsword", "Light Crossbow", "20 Bolts", "Chain Mail", "Explorer's Pack"],
    startingGoldAverage: 125,
  },
  Monk: {
    name: "Monk",
    hitDie: 8,
    savingThrows: ["STR", "DEX"],
    armorProficiencies: [],
    weaponProficiencies: ["Simple Weapons", "Martial Weapons"],
    skillChoices: {
      count: 2,
      pool: ["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"],
    },
    weaponMasteriesCount: 0,
    startingEquipment: ["10 Darts", "Spear", "Explorer's Pack"],
    startingGoldAverage: 20,
  },
  Paladin: {
    name: "Paladin",
    hitDie: 10,
    savingThrows: ["WIS", "CHA"],
    armorProficiencies: ["Light Armor", "Medium Armor", "Heavy Armor", "Shields"],
    weaponProficiencies: ["Simple Weapons", "Martial Weapons"],
    skillChoices: {
      count: 2,
      pool: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"],
    },
    weaponMasteriesCount: 2,
    preparedSpellsCount: 2,
    spellcastingAbility: "CHA",
    cantripsKnownCount: 0,
    startingEquipment: ["Longsword", "Shield", "Javelin", "Chain Mail", "Holy Symbol", "Priest's Pack"],
    startingGoldAverage: 150,
  },
  Ranger: {
    name: "Ranger",
    hitDie: 10,
    savingThrows: ["STR", "DEX"],
    armorProficiencies: ["Light Armor", "Medium Armor", "Shields"],
    weaponProficiencies: ["Simple Weapons", "Martial Weapons"],
    skillChoices: {
      count: 3,
      pool: ["Acrobatics", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"],
    },
    weaponMasteriesCount: 2,
    preparedSpellsCount: 2,
    spellcastingAbility: "WIS",
    cantripsKnownCount: 0,
    startingEquipment: ["Shortbow", "20 Arrows", "2 Shortswords", "Leather Armor", "Quiver", "Explorer's Pack"],
    startingGoldAverage: 120,
  },
  Rogue: {
    name: "Rogue",
    hitDie: 8,
    savingThrows: ["DEX", "INT"],
    armorProficiencies: ["Light Armor"],
    weaponProficiencies: ["Simple Weapons", "Martial Weapons"],
    skillChoices: {
      count: 4,
      pool: [
        "Acrobatics",
        "Athletics",
        "Deception",
        "Insight",
        "Intimidation",
        "Investigation",
        "Perception",
        "Performance",
        "Persuasion",
        "Sleight of Hand",
        "Stealth",
      ],
    },
    weaponMasteriesCount: 2,
    startingEquipment: ["2 Shortswords", "Shortbow", "20 Arrows", "Leather Armor", "Thieves' Tools", "Burglar's Pack"],
    startingGoldAverage: 110,
  },
  Sorcerer: {
    name: "Sorcerer",
    hitDie: 6,
    savingThrows: ["CON", "CHA"],
    armorProficiencies: [],
    weaponProficiencies: ["Simple Weapons"],
    skillChoices: {
      count: 2,
      pool: ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"],
    },
    weaponMasteriesCount: 0,
    preparedSpellsCount: 2,
    spellcastingAbility: "CHA",
    cantripsKnownCount: 4,
    startingEquipment: ["Dagger", "Light Crossbow", "20 Bolts", "Arcane Focus (Crystal)", "Dungeoneer's Pack"],
    startingGoldAverage: 70,
  },
  Warlock: {
    name: "Warlock",
    hitDie: 8,
    savingThrows: ["WIS", "CHA"],
    armorProficiencies: ["Light Armor"],
    weaponProficiencies: ["Simple Weapons"],
    skillChoices: {
      count: 2,
      pool: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"],
    },
    weaponMasteriesCount: 0,
    preparedSpellsCount: 2,
    spellcastingAbility: "CHA",
    cantripsKnownCount: 2,
    startingEquipment: ["Dagger", "Leather Armor", "Arcane Focus (Staff)", "Book of Shadows", "Scholar's Pack"],
    startingGoldAverage: 110,
  },
  Wizard: {
    name: "Wizard",
    hitDie: 6,
    savingThrows: ["INT", "WIS"],
    armorProficiencies: [],
    weaponProficiencies: ["Simple Weapons"],
    skillChoices: {
      count: 2,
      pool: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"],
    },
    weaponMasteriesCount: 0,
    preparedSpellsCount: 4,
    spellcastingAbility: "INT",
    cantripsKnownCount: 3,
    startingEquipment: ["Quarterstaff", "Arcane Focus (Orb)", "Spellbook", "Scholar's Pack"],
    startingGoldAverage: 120,
  },
};

export const WEAPONS_DB: Record<string, Weapon> = {
  Dagger: { name: "Dagger", costGold: 2, weightLbs: 1, damage: "1d4 piercing", properties: ["Finesse", "Light", "Thrown (20/60)"], masteryProperty: "Nick" },
  "Light Hammer": { name: "Light Hammer", costGold: 2, weightLbs: 2, damage: "1d4 bludgeoning", properties: ["Light", "Thrown (20/60)"], masteryProperty: "Nick" },
  Sickle: { name: "Sickle", costGold: 1, weightLbs: 2, damage: "1d4 slashing", properties: ["Light"], masteryProperty: "Nick" },
  Handaxe: { name: "Handaxe", costGold: 5, weightLbs: 2, damage: "1d6 slashing", properties: ["Light", "Thrown (20/60)"], masteryProperty: "Vex" },
  Javelin: { name: "Javelin", costGold: 0.5, weightLbs: 2, damage: "1d6 piercing", properties: ["Thrown (30/120)"], masteryProperty: "Slow" },
  Mace: { name: "Mace", costGold: 5, weightLbs: 4, damage: "1d6 bludgeoning", properties: [], masteryProperty: "Sap" },
  Quarterstaff: { name: "Quarterstaff", costGold: 0.2, weightLbs: 4, damage: "1d6 bludgeoning", properties: ["Versatile (1d8)"], masteryProperty: "Topple" },
  Spear: { name: "Spear", costGold: 1, weightLbs: 3, damage: "1d6 piercing", properties: ["Thrown (20/60)", "Versatile (1d8)"], masteryProperty: "Sap" },
  Greatclub: { name: "Greatclub", costGold: 0.2, weightLbs: 10, damage: "1d8 bludgeoning", properties: ["Two-Handed"], masteryProperty: "Push" },
  Shortbow: { name: "Shortbow", costGold: 25, weightLbs: 2, damage: "1d6 piercing", properties: ["Ammunition (80/320)", "Two-Handed"], masteryProperty: "Vex" },
  "Light Crossbow": { name: "Light Crossbow", costGold: 25, weightLbs: 5, damage: "1d8 piercing", properties: ["Ammunition (80/320)", "Loading", "Two-Handed"], masteryProperty: "Slow" },
  Battleaxe: { name: "Battleaxe", costGold: 10, weightLbs: 4, damage: "1d8 slashing", properties: ["Versatile (1d10)"], masteryProperty: "Topple" },
  Flail: { name: "Flail", costGold: 10, weightLbs: 2, damage: "1d8 bludgeoning", properties: [], masteryProperty: "Sap" },
  Glaive: { name: "Glaive", costGold: 20, weightLbs: 6, damage: "1d10 slashing", properties: ["Heavy", "Reach", "Two-Handed"], masteryProperty: "Graze" },
  Greataxe: { name: "Greataxe", costGold: 30, weightLbs: 7, damage: "1d12 slashing", properties: ["Heavy", "Two-Handed"], masteryProperty: "Cleave" },
  Greatsword: { name: "Greatsword", costGold: 50, weightLbs: 6, damage: "2d6 slashing", properties: ["Heavy", "Two-Handed"], masteryProperty: "Graze" },
  Halberd: { name: "Halberd", costGold: 20, weightLbs: 6, damage: "1d10 slashing", properties: ["Heavy", "Reach", "Two-Handed"], masteryProperty: "Cleave" },
  Lance: { name: "Lance", costGold: 10, weightLbs: 6, damage: "1d10 piercing", properties: ["Reach"], masteryProperty: "Topple" },
  Longsword: { name: "Longsword", costGold: 15, weightLbs: 3, damage: "1d8 slashing", properties: ["Versatile (1d10)"], masteryProperty: "Sap" },
  Maul: { name: "Maul", costGold: 10, weightLbs: 10, damage: "2d6 bludgeoning", properties: ["Heavy", "Two-Handed"], masteryProperty: "Topple" },
  Pike: { name: "Pike", costGold: 5, weightLbs: 18, damage: "1d10 piercing", properties: ["Heavy", "Reach", "Two-Handed"], masteryProperty: "Push" },
  Rapier: { name: "Rapier", costGold: 25, weightLbs: 2, damage: "1d8 piercing", properties: ["Finesse"], masteryProperty: "Vex" },
  Scimitar: { name: "Scimitar", costGold: 25, weightLbs: 3, damage: "1d6 slashing", properties: ["Finesse", "Light"], masteryProperty: "Nick" },
  Shortsword: { name: "Shortsword", costGold: 10, weightLbs: 2, damage: "1d6 piercing", properties: ["Finesse", "Light"], masteryProperty: "Vex" },
  Trident: { name: "Trident", costGold: 5, weightLbs: 4, damage: "1d8 piercing", properties: ["Thrown (20/60)", "Versatile (1d10)"], masteryProperty: "Topple" },
  Warhammer: { name: "Warhammer", costGold: 15, weightLbs: 2, damage: "1d8 bludgeoning", properties: ["Versatile (1d10)"], masteryProperty: "Push" },
  "Heavy Crossbow": { name: "Heavy Crossbow", costGold: 50, weightLbs: 18, damage: "1d10 piercing", properties: ["Ammunition (100/400)", "Heavy", "Loading", "Two-Handed"], masteryProperty: "Push" },
  Longbow: { name: "Longbow", costGold: 50, weightLbs: 2, damage: "1d8 piercing", properties: ["Ammunition (150/600)", "Heavy", "Two-Handed"], masteryProperty: "Slow" },
  Musket: { name: "Musket", costGold: 500, weightLbs: 10, damage: "1d12 piercing", properties: ["Ammunition (40/120)", "Loading", "Two-Handed"], masteryProperty: "Slow" },
  Pistol: { name: "Pistol", costGold: 250, weightLbs: 3, damage: "1d10 piercing", properties: ["Ammunition (30/90)", "Loading"], masteryProperty: "Vex" },
};

export interface ShopItem {
  name: string;
  costGold: number;
  weightLbs: number;
}

export const ARMOR_GEAR_DB: Record<string, ShopItem> = {
  "Padded Armor": { name: "Padded Armor", costGold: 5, weightLbs: 8 },
  "Leather Armor": { name: "Leather Armor", costGold: 10, weightLbs: 10 },
  "Studded Leather Armor": { name: "Studded Leather Armor", costGold: 45, weightLbs: 13 },
  "Hide Armor": { name: "Hide Armor", costGold: 10, weightLbs: 12 },
  "Chain Shirt": { name: "Chain Shirt", costGold: 50, weightLbs: 20 },
  "Scale Mail": { name: "Scale Mail", costGold: 50, weightLbs: 45 },
  Breastplate: { name: "Breastplate", costGold: 400, weightLbs: 20 },
  "Half Plate": { name: "Half Plate", costGold: 750, weightLbs: 40 },
  "Ring Mail": { name: "Ring Mail", costGold: 30, weightLbs: 40 },
  "Chain Mail": { name: "Chain Mail", costGold: 75, weightLbs: 55 },
  "Splint Armor": { name: "Splint Armor", costGold: 200, weightLbs: 60 },
  "Plate Armor": { name: "Plate Armor", costGold: 1500, weightLbs: 65 },
  Shield: { name: "Shield", costGold: 10, weightLbs: 6 },
  Backpack: { name: "Backpack", costGold: 2, weightLbs: 5 },
  Bedroll: { name: "Bedroll", costGold: 1, weightLbs: 7 },
  Crowbar: { name: "Crowbar", costGold: 2, weightLbs: 5 },
  "Healer's Kit": { name: "Healer's Kit", costGold: 5, weightLbs: 3 },
  "Holy Symbol": { name: "Holy Symbol", costGold: 5, weightLbs: 1 },
  "Rations (1 day)": { name: "Rations (1 day)", costGold: 0.5, weightLbs: 2 },
  "Rope, hempen (50 feet)": { name: "Rope, hempen (50 feet)", costGold: 1, weightLbs: 10 },
  Tinderbox: { name: "Tinderbox", costGold: 0.5, weightLbs: 1 },
  Torch: { name: "Torch", costGold: 0.01, weightLbs: 1 },
  Waterskin: { name: "Waterskin", costGold: 0.2, weightLbs: 5 },
  Spellbook: { name: "Spellbook", costGold: 50, weightLbs: 3 },
  "Arcane Focus (Staff)": { name: "Arcane Focus (Staff)", costGold: 5, weightLbs: 4 },
  "Druidic Focus (Wooden Staff)": { name: "Druidic Focus (Wooden Staff)", costGold: 5, weightLbs: 4 },
  "Explorer's Pack": { name: "Explorer's Pack", costGold: 10, weightLbs: 24 },
  "Priest's Pack": { name: "Priest's Pack", costGold: 19, weightLbs: 25 },
  "Burglar's Pack": { name: "Burglar's Pack", costGold: 16, weightLbs: 47 },
  "Scholar's Pack": { name: "Scholar's Pack", costGold: 40, weightLbs: 10 },
  "Dungeoneer's Pack": { name: "Dungeoneer's Pack", costGold: 12, weightLbs: 46 },
};

export const MASTER_SHOP_ITEMS: Record<string, ShopItem> = {
  ...WEAPONS_DB,
  ...ARMOR_GEAR_DB,
};

// ==========================================
// 2. MATHEMATICAL CORE ENGINE CALCULATION FUNCTIONS
// ==========================================

export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function calculateCarryingCapacity(strengthScore: number): number {
  return strengthScore * 15;
}

export function validateBackgroundASI(
  backgroundName: string,
  allocations: ASIAllocation[]
): { isValid: boolean; error?: string } {
  const background = BACKGROUNDS_DB[backgroundName];
  if (!background) {
    return { isValid: false, error: `Invalid background: '${backgroundName}'` };
  }

  const allowedTriplet = background.asiTriplet;

  for (const alloc of allocations) {
    if (!allowedTriplet.includes(alloc.stat)) {
      return {
        isValid: false,
        error: `Ability '${alloc.stat}' is not part of the allowed Background triplet: [${allowedTriplet.join(", ")}]`,
      };
    }
  }

  const statCounts: Record<Ability, number> = {
    STR: 0,
    DEX: 0,
    CON: 0,
    INT: 0,
    WIS: 0,
    CHA: 0,
  };
  for (const alloc of allocations) {
    statCounts[alloc.stat] += alloc.value;
  }

  const positiveStats = Object.entries(statCounts).filter(([_, val]) => val > 0);
  const totalSum = positiveStats.reduce((sum, [_, val]) => sum + val, 0);

  if (totalSum !== 3) {
    return {
      isValid: false,
      error: `ASI allocations must sum to exactly +3. Total allocated: +${totalSum}`,
    };
  }

  if (positiveStats.length === 2) {
    const vals = positiveStats.map(([_, val]) => val).sort();
    if (vals[0] !== 1 || vals[1] !== 2) {
      return {
        isValid: false,
        error: `Two-stat allocation must be a +2 and a +1. Current: +${vals[1]} and +${vals[0]}`,
      };
    }
  } else if (positiveStats.length === 3) {
    const vals = positiveStats.map(([_, val]) => val);
    if (vals.some((v) => v !== 1)) {
      return {
        isValid: false,
        error: `Three-stat allocation must be three +1s. Current values: ${vals.join(", ")}`,
      };
    }
  } else {
    return {
      isValid: false,
      error: `Invalid ASI structure. Must allocate to 2 or 3 distinct abilities within the triplet.`,
    };
  }

  return { isValid: true };
}

export function validatePointBuy(scores: AbilityScores): {
  isValid: boolean;
  costUsed: number;
  errors: string[];
} {
  const errors: string[] = [];
  let costUsed = 0;

  const costTable: Record<number, number> = {
    8: 0,
    9: 1,
    10: 2,
    11: 3,
    12: 4,
    13: 5,
    14: 7,
    15: 9,
  };

  const abilities: Ability[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

  for (const ab of abilities) {
    const val = scores[ab];
    if (val < 8 || val > 15) {
      errors.push(`Ability Score ${ab} (${val}) is out of bounds. Point Buy only allows scores from 8 to 15.`);
      continue;
    }
    costUsed += costTable[val] ?? 0;
  }

  if (costUsed > 27) {
    errors.push(`Point Buy total cost (${costUsed}) exceeds the maximum allowance of 27 points.`);
  }

  return {
    isValid: errors.length === 0,
    costUsed,
    errors,
  };
}

export function calculateHP(
  classType: ClassType,
  pointBuyStats: AbilityScores,
  asiAllocations: ASIAllocation[],
  speciesType: SpeciesType,
  activeFeats: string[]
): number {
  const classDetails = CLASSES_DB[classType];
  if (!classDetails) return 0;

  let conScore = pointBuyStats.CON;
  for (const alloc of asiAllocations) {
    if (alloc.stat === "CON") {
      conScore += alloc.value;
    }
  }

  const conMod = getAbilityModifier(conScore);
  let maxHP = classDetails.hitDie + conMod;

  if (speciesType === "Dwarf") {
    maxHP += 1;
  }

  if (activeFeats.includes("Tough")) {
    maxHP += 2;
  }

  return maxHP;
}

export function calculatePassivePerception(
  pointBuyStats: AbilityScores,
  asiAllocations: ASIAllocation[],
  proficientSkills: Skill[]
): number {
  let wisScore = pointBuyStats.WIS;
  for (const alloc of asiAllocations) {
    if (alloc.stat === "WIS") {
      wisScore += alloc.value;
    }
  }

  const wisMod = getAbilityModifier(wisScore);
  const isProficient = proficientSkills.includes("Perception");
  const pb = 2;

  return 10 + wisMod + (isProficient ? pb : 0);
}

export function resolveDuplicateProficiencies(payload: CharacterCreationPayload): {
  skills: Skill[];
  tools: Tool[];
  duplicateSkills: Skill[];
  duplicateTools: Tool[];
} {
  const background = BACKGROUNDS_DB[payload.background];
  if (!background) {
    return { skills: [], tools: [], duplicateSkills: [], duplicateTools: [] };
  }

  const skillsSet = new Set<Skill>();
  const toolsSet = new Set<Tool>();

  const duplicateSkills: Skill[] = [];
  const duplicateTools: Tool[] = [];

  for (const s of background.skills) {
    skillsSet.add(s);
  }
  toolsSet.add(background.tool);

  const species = SPECIES_DB[payload.species];
  if (species) {
    if (payload.species === "Elf") {
      const perception: Skill = "Perception";
      if (skillsSet.has(perception)) {
        duplicateSkills.push(perception);
      } else {
        skillsSet.add(perception);
      }
    }
  }

  for (const s of payload.classSkillSelections) {
    if (skillsSet.has(s)) {
      duplicateSkills.push(s);
    } else {
      skillsSet.add(s);
    }
  }

  // If there are duplicate skills and the user supplied wildcards, resolve them!
  if (duplicateSkills.length > 0 && payload.wildcardSkillSelections) {
    for (const ws of payload.wildcardSkillSelections) {
      skillsSet.add(ws);
    }
  }

  if (duplicateTools.length > 0 && payload.wildcardToolSelections) {
    for (const wt of payload.wildcardToolSelections) {
      toolsSet.add(wt);
    }
  }

  return {
    skills: Array.from(skillsSet),
    tools: Array.from(toolsSet),
    duplicateSkills,
    duplicateTools,
  };
}

export function validateShopLedger(payload: CharacterCreationPayload): {
  isValid: boolean;
  totalCost: number;
  totalWeight: number;
  errors: string[];
} {
  const errors: string[] = [];
  let totalCost = 0;
  let totalWeight = 0;

  if (!payload.takeStartingGold || !payload.startingGoldPurchases) {
    return { isValid: true, totalCost: 0, totalWeight: 0, errors: [] };
  }

  const classDetails = CLASSES_DB[payload.classSelection];
  if (!classDetails) {
    return { isValid: false, totalCost: 0, totalWeight: 0, errors: ["Invalid class selection"] };
  }

  const goldLimit = classDetails.startingGoldAverage;

  for (const purchase of payload.startingGoldPurchases) {
    const shopItem = MASTER_SHOP_ITEMS[purchase.itemName];
    if (!shopItem) {
      errors.push(`Item '${purchase.itemName}' is not available in the Equipment & Weapon Ledger.`);
      continue;
    }

    if (purchase.quantity <= 0) {
      errors.push(`Invalid quantity (${purchase.quantity}) for item '${purchase.itemName}'.`);
      continue;
    }

    totalCost += shopItem.costGold * purchase.quantity;
    totalWeight += shopItem.weightLbs * purchase.quantity;
  }

  if (totalCost > goldLimit) {
    errors.push(
      `Purchased items total cost (${totalCost} GP) exceeds starting gold allowance (${goldLimit} GP) for Class ${payload.classSelection}.`
    );
  }

  let strScore = payload.pointBuyStats.STR;
  for (const alloc of payload.asiAllocations) {
    if (alloc.stat === "STR") {
      strScore += alloc.value;
    }
  }
  const carryLimit = calculateCarryingCapacity(strScore);

  if (totalWeight > carryLimit) {
    errors.push(
      `Purchased items total weight (${totalWeight} lbs) exceeds character carrying capacity (${carryLimit} lbs based on STR ${strScore}).`
    );
  }

  return {
    isValid: errors.length === 0,
    totalCost,
    totalWeight,
    errors,
  };
}

export function getWeaponMastery(weaponName: string): MasteryProperty | null {
  const weapon = WEAPONS_DB[weaponName];
  return weapon ? weapon.masteryProperty : null;
}

// ==========================================
// 3. MASTER CASCADING CHARACTER VALIDATOR
// ==========================================

export function validateCharacterPayload(payload: CharacterCreationPayload): CharacterValidationResult {
  const errors: string[] = [];

  const asiVal = validateBackgroundASI(payload.background, payload.asiAllocations);
  if (!asiVal.isValid && asiVal.error) {
    errors.push(`[ASI Error] ${asiVal.error}`);
  }

  const pbVal = validatePointBuy(payload.pointBuyStats);
  if (!pbVal.isValid) {
    for (const err of pbVal.errors) {
      errors.push(`[Point Buy Error] ${err}`);
    }
  }

  const species = SPECIES_DB[payload.species];
  if (!species) {
    errors.push(`[Species Error] Invalid species: '${payload.species}'`);
  } else {
    if (!species.size.includes(payload.speciesSize)) {
      errors.push(
        `[Species Error] Species '${payload.species}' does not support size category: '${payload.speciesSize}'. Allowed: [${species.size.join(
          ", "
        )}]`
      );
    }

    if (payload.species === "Goliath" && !payload.goliathAncestrySelection) {
      errors.push(`[Species Error] Goliaths must select a giant ancestry trait.`);
    }

    if (payload.species === "Dragonborn" && !payload.dragonbornBreathSelection) {
      errors.push(`[Species Error] Dragonborns must select an elemental breath weapon damage type.`);
    }

    if (payload.species === "Human") {
      if (!payload.speciesBonusFeatSelection) {
        errors.push(`[Species Error] Humans must select a versatile bonus Origin Feat.`);
      } else {
        const bg = BACKGROUNDS_DB[payload.background];
        if (bg && bg.originFeat.name === payload.speciesBonusFeatSelection) {
          errors.push(
            `[Species Error] Human Bonus Feat '${payload.speciesBonusFeatSelection}' cannot duplicate the Background Feat.`
          );
        }
      }
    }
  }

  const validateMagicInitiate = (details: MagicInitiateDetails | undefined, desc: string, requiredSource?: MagicSource) => {
    if (!details) {
      errors.push(`[Feat Error] Magic Initiate details are missing for ${desc}.`);
      return;
    }
    if (requiredSource && details.source !== requiredSource) {
      errors.push(
        `[Feat Error] Magic Initiate source for ${desc} must be '${requiredSource}'. Current: '${details.source}'`
      );
    }
    if (!details.cantrips || details.cantrips.length !== 2) {
      errors.push(`[Feat Error] Magic Initiate for ${desc} must select exactly 2 cantrips.`);
    } else {
      const sourceSpellList = SPELL_LISTS[details.source];
      if (sourceSpellList) {
        for (const cantrip of details.cantrips) {
          if (!sourceSpellList.cantrips.includes(cantrip)) {
            errors.push(
              `[Feat Error] Cantrip '${cantrip}' is not a valid ${details.source} spell list cantrip.`
            );
          }
        }
      }
    }
    if (!details.firstLevelSpell) {
      errors.push(`[Feat Error] Magic Initiate for ${desc} must select 1 first-level spell.`);
    } else {
      const sourceSpellList = SPELL_LISTS[details.source];
      if (sourceSpellList && !sourceSpellList.level1.includes(details.firstLevelSpell)) {
        errors.push(
          `[Feat Error] Spell '${details.firstLevelSpell}' is not a valid ${details.source} spell list level 1 spell.`
        );
      }
    }
    if (!["INT", "WIS", "CHA"].includes(details.castingAbility)) {
      errors.push(
        `[Feat Error] Magic Initiate spellcasting ability must be INT, WIS, or CHA. Current: '${details.castingAbility}'`
      );
    }
  };

  const bg = BACKGROUNDS_DB[payload.background];
  if (bg && bg.originFeat.name === "Magic Initiate") {
    let source: MagicSource = "Arcane";
    if (payload.background === "Acolyte") source = "Divine";
    if (payload.background === "Guide") source = "Primal";
    if (payload.background === "Sage") source = "Arcane";
    validateMagicInitiate(payload.magicInitiateBackgroundDetails, "Background Feat", source);
  }

  if (payload.species === "Human" && payload.speciesBonusFeatSelection === "Magic Initiate") {
    validateMagicInitiate(payload.speciesBonusFeatMagicInitiateDetails, "Human Bonus Feat");
  }

  const cls = CLASSES_DB[payload.classSelection];
  if (!cls) {
    errors.push(`[Class Error] Invalid class selection: '${payload.classSelection}'`);
  } else {
    if (payload.classSkillSelections.length !== cls.skillChoices.count) {
      errors.push(
        `[Class Error] Class ${payload.classSelection} requires exactly ${cls.skillChoices.count} skill selections. Current: ${payload.classSkillSelections.length}`
      );
    } else {
      for (const s of payload.classSkillSelections) {
        if (!cls.skillChoices.pool.includes(s)) {
          errors.push(
            `[Class Error] Skill '${s}' is not in the allowed Skill Pool for Class ${payload.classSelection}.`
          );
        }
      }
    }

    if (cls.weaponMasteriesCount > 0) {
      if (payload.classWeaponMasteriesSelections.length !== cls.weaponMasteriesCount) {
        errors.push(
          `[Class Error] Class ${payload.classSelection} requires exactly ${cls.weaponMasteriesCount} Weapon Masteries. Current: ${payload.classWeaponMasteriesSelections.length}`
        );
      } else {
        for (const w of payload.classWeaponMasteriesSelections) {
          const weaponObj = WEAPONS_DB[w];
          if (!weaponObj) {
            errors.push(`[Class Error] Weapon '${w}' selected for mastery is invalid.`);
          } else {
            const isProficient =
              cls.weaponProficiencies.includes("Martial Weapons") ||
              (cls.weaponProficiencies.includes("Simple Weapons") &&
                (w === "Dagger" ||
                  w === "Light Hammer" ||
                  w === "Sickle" ||
                  w === "Handaxe" ||
                  w === "Javelin" ||
                  w === "Mace" ||
                  w === "Quarterstaff" ||
                  w === "Spear" ||
                  w === "Greatclub" ||
                  w === "Shortbow" ||
                  w === "Light Crossbow"));
            if (!isProficient) {
              errors.push(
                `[Class Error] Class ${payload.classSelection} lacks proficiency to master weapon '${w}'.`
              );
            }
          }
        }
      }
    }

    if (cls.preparedSpellsCount && cls.preparedSpellsCount > 0) {
      if (!payload.classPreparedSpellsSelections || payload.classPreparedSpellsSelections.length !== cls.preparedSpellsCount) {
        errors.push(
          `[Class Error] Class ${payload.classSelection} requires exactly ${
            cls.preparedSpellsCount
          } prepared spells at Level 1. Current: ${payload.classPreparedSpellsSelections?.length ?? 0}`
        );
      } else {
        let sourceList: string[] = [];
        if (cls.name === "Wizard") sourceList = SPELL_LISTS.Arcane.level1;
        else if (cls.name === "Cleric" || cls.name === "Paladin") sourceList = SPELL_LISTS.Divine.level1;
        else if (cls.name === "Druid" || cls.name === "Ranger") sourceList = SPELL_LISTS.Primal.level1;
        else {
          sourceList = SPELL_LISTS.Arcane.level1;
        }

        for (const sp of payload.classPreparedSpellsSelections) {
          if (!sourceList.includes(sp)) {
            const isStandardCrossover =
              SPELL_LISTS.Divine.level1.includes(sp) || SPELL_LISTS.Primal.level1.includes(sp);
            if (!sourceList.includes(sp) && !isStandardCrossover) {
              errors.push(
                `[Class Error] Spell '${sp}' is not a valid level 1 spell for Class ${payload.classSelection}.`
              );
            }
          }
        }

        // Wizard prepared spell lists must exist inside their spellbook!
        if (payload.classSelection === "Wizard" && payload.wizardSpellbookSelections) {
          for (const sp of payload.classPreparedSpellsSelections) {
            if (!payload.wizardSpellbookSelections.includes(sp)) {
              errors.push(`[Class Error] Wizard prepared spell '${sp}' must exist inside their Spellbook list.`);
            }
          }
        }
      }
    }

    // Dynamic checks for class registry (Expertise/Invocations micro-decisions)
    if (payload.classSelection === "Rogue") {
      if (!payload.rogueExpertiseSelections || payload.rogueExpertiseSelections.length !== 2) {
        errors.push(`[Class Error] Rogue must select exactly 2 Expertise skills.`);
      }
    }

    if (payload.classSelection === "Warlock") {
      if (!payload.warlockInvocationsSelections || payload.warlockInvocationsSelections.length !== 2) {
        errors.push(`[Class Error] Warlock must select exactly TWO Level 1 eligible Invocations.`);
      } else if (payload.warlockInvocationsSelections.includes("Lessons of the First Ones") && !payload.warlockLessonsOfTheFirstOnesFeatSelection) {
        errors.push(`[Class Error] Lessons of the First Ones chosen. You must select 1 additional versatile Origin Feat.`);
      }
    }
  }

  if (payload.chosenLanguages.length !== 2) {
    errors.push(
      `[Language Error] Characters must select exactly 2 custom languages. Current: ${payload.chosenLanguages.length}`
    );
  } else {
    const bgLangs = bg?.languages ?? [];
    const spLangs = species?.languages ?? [];
    const defaultLangs = ["Common", ...bgLangs, ...spLangs];

    for (const l of payload.chosenLanguages) {
      if (defaultLangs.includes(l)) {
        errors.push(
          `[Language Error] Language '${l}' is already granted by Background or Species default traits. Select a rare language to prevent duplicate wastage.`
        );
      }
    }

    if (payload.chosenLanguages[0] === payload.chosenLanguages[1]) {
      errors.push(
        `[Language Error] Duplicate language selection in custom pool: '${payload.chosenLanguages[0]}' selected twice.`
      );
    }
  }

  // Dynamic Collision resolution checks (Phase 4)
  const duplicateResolver = resolveDuplicateProficiencies(payload);
  if (duplicateResolver.duplicateSkills.length > 0) {
    const requiredSkillsCount = duplicateResolver.duplicateSkills.length;
    if (!payload.wildcardSkillSelections || payload.wildcardSkillSelections.length !== requiredSkillsCount) {
      errors.push(
        `[Collision Error] Duplicate skills detected: [${duplicateResolver.duplicateSkills.join(
          ", "
        )}]. You must select exactly ${requiredSkillsCount} alternative wildcard skills.`
      );
    } else {
      // Ensure wildcard skill selections do not duplicate any other selected skills
      const allSelectedSkills = [...payload.classSkillSelections, ...duplicateResolver.skills];
      for (const ws of payload.wildcardSkillSelections) {
        if (allSelectedSkills.filter((s) => s === ws).length > 1) {
          errors.push(`[Collision Error] Wildcard skill '${ws}' is already selected.`);
        }
      }
    }
  }

  if (payload.takeStartingGold) {
    const shopVal = validateShopLedger(payload);
    if (!shopVal.isValid) {
      for (const err of shopVal.errors) {
        errors.push(`[Shop Ledger Error] ${err}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ==========================================
// 4. COMPUTED END-TO-END CHARACTER SHEET GENERATOR
// ==========================================

export function buildCharacterSheet(payload: CharacterCreationPayload): CharacterSheet {
  const validation = validateCharacterPayload(payload);
  if (!validation.isValid) {
    throw new Error(`Cannot compile Character Sheet. Payload contains validation errors: ${validation.errors.join("; ")}`);
  }

  const bg = BACKGROUNDS_DB[payload.background];
  const species = SPECIES_DB[payload.species];
  const cls = CLASSES_DB[payload.classSelection];

  // 1. Ability Scores Calculations
  const baseAbilityScores = { ...payload.pointBuyStats };
  const finalAbilityScores = { ...payload.pointBuyStats };
  for (const alloc of payload.asiAllocations) {
    finalAbilityScores[alloc.stat] = (finalAbilityScores[alloc.stat] || 0) + alloc.value;
  }

  const abilityModifiers: AbilityScores = {
    STR: getAbilityModifier(finalAbilityScores.STR),
    DEX: getAbilityModifier(finalAbilityScores.DEX),
    CON: getAbilityModifier(finalAbilityScores.CON),
    INT: getAbilityModifier(finalAbilityScores.INT),
    WIS: getAbilityModifier(finalAbilityScores.WIS),
    CHA: getAbilityModifier(finalAbilityScores.CHA),
  };

  // 2. Active Feats mapping
  const activeFeats: { name: string; description: string; magicInitiateDetails?: MagicInitiateDetails }[] = [];
  activeFeats.push({
    name: bg.originFeat.name,
    description: bg.originFeat.description,
    magicInitiateDetails: payload.magicInitiateBackgroundDetails,
  });

  if (payload.species === "Human" && payload.speciesBonusFeatSelection) {
    activeFeats.push({
      name: payload.speciesBonusFeatSelection,
      description: "Human versatile bonus Origin Feat.",
      magicInitiateDetails: payload.speciesBonusFeatMagicInitiateDetails,
    });
  }

  // Recursively add Warlock invocations feat if Lessons of the First Ones was chosen
  if (payload.classSelection === "Warlock" && payload.warlockInvocationsSelections?.includes("Lessons of the First Ones") && payload.warlockLessonsOfTheFirstOnesFeatSelection) {
    activeFeats.push({
      name: payload.warlockLessonsOfTheFirstOnesFeatSelection,
      description: "Warlock Lessons of the First Ones bonus Origin Feat.",
    });
  }

  const activeFeatNames = activeFeats.map((f) => f.name);

  // 3. Max HP Calculation
  const maxHP = calculateHP(
    payload.classSelection,
    payload.pointBuyStats,
    payload.asiAllocations,
    payload.species,
    activeFeatNames
  );

  // 4. Proficiencies and Duplicate Wildcard Resolution (Phase 4)
  const profs = resolveDuplicateProficiencies(payload);
  const defaultLanguages = ["Common", ...bg.languages, ...species.languages];
  const finalLanguages = Array.from(new Set([...defaultLanguages, ...payload.chosenLanguages]));

  // 5. Weapon Masteries
  const weaponMasteries = payload.classWeaponMasteriesSelections.map((w) => ({
    weaponName: w,
    masteryProperty: getWeaponMastery(w) || ("Vex" as MasteryProperty),
  }));

  // 6. SPELLCASTING MULTI-SOURCE MODIFIER ISOLATION (Phase 1)
  let classSpellcasting: DerivedStats["classSpellcasting"];
  let originFeatSpellcasting: DerivedStats["originFeatSpellcasting"];
  let speciesSpellcasting: DerivedStats["speciesSpellcasting"];

  const pb = 2; // Level 1 PB is always 2

  // A. Class Spellcasting DC & Attack
  if (cls.spellcastingAbility) {
    const castingMod = abilityModifiers[cls.spellcastingAbility];
    classSpellcasting = {
      spellSaveDC: 8 + castingMod + pb,
      spellAttackModifier: castingMod + pb,
      castingAbility: cls.spellcastingAbility,
    };
  }

  // B. Origin Feat Spellcasting DC & Attack
  const magicInitiateFeat = activeFeats.find((f) => f.name === "Magic Initiate");
  if (magicInitiateFeat && magicInitiateFeat.magicInitiateDetails) {
    const castingAbility = magicInitiateFeat.magicInitiateDetails.castingAbility;
    const castingMod = abilityModifiers[castingAbility];
    originFeatSpellcasting = {
      spellSaveDC: 8 + castingMod + pb,
      spellAttackModifier: castingMod + pb,
      castingAbility,
    };
  }

  // C. Species Spellcasting DC & Attack
  if (species.innateSpells) {
    const castingAbility: Ability = payload.speciesBonusFeatMagicInitiateDetails?.castingAbility || "INT";
    const castingMod = abilityModifiers[castingAbility];
    speciesSpellcasting = {
      spellSaveDC: 8 + castingMod + pb,
      spellAttackModifier: castingMod + pb,
      castingAbility,
    };
  }

  const derivedStats: DerivedStats = {
    armorClass: 10 + abilityModifiers.DEX, // Default unarmored AC
    initiative: abilityModifiers.DEX + (activeFeatNames.includes("Alert") ? 2 : 0),
    passivePerception: calculatePassivePerception(payload.pointBuyStats, payload.asiAllocations, profs.skills),
    carryingCapacityLbs: calculateCarryingCapacity(finalAbilityScores.STR),
    classSpellcasting,
    originFeatSpellcasting,
    speciesSpellcasting,
  };

  // 7. Innate Spells catalog
  const innateSpells: { name: string; level: number; castingAbility?: string; saveDC?: number }[] = [];
  if (species.innateSpells) {
    for (const isp of species.innateSpells) {
      innateSpells.push({
        name: isp.name,
        level: isp.level,
        castingAbility: speciesSpellcasting?.castingAbility,
        saveDC: speciesSpellcasting?.spellSaveDC,
      });
    }
  }

  // Elf lineage branch speeds and darkvision range
  let speedFt = species.speed;
  let finalDarkvision = "60ft";
  if (payload.species === "Elf") {
    innateSpells.push({ name: "Keen Senses (Active Listener)", level: 0 });
    if (bg.equipment.includes("Wood")) { // If they select Wood Elf, override speed
      speedFt = 35;
    }
    if (bg.equipment.includes("Drow")) { // If Drow, override Darkvision to 120ft
      finalDarkvision = "120ft";
    }
  }

  // 8. Class Features
  const classFeatures: ClassFeature[] = [];
  if (payload.classSelection === "Barbarian") {
    classFeatures.push({ name: "Rage", description: "2 usages per long rest, +2 damage bonus, duration 1 minute." });
    classFeatures.push({ name: "Unarmored Defense (Barbarian)", description: "AC = 10 + DEX Mod + CON Mod when wearing no armor." });
  } else if (payload.classSelection === "Bard") {
    const usages = Math.max(1, abilityModifiers.CHA);
    classFeatures.push({ name: "Bardic Inspiration", description: `d6 die, ${usages} usages per long rest.`, value: usages });
  } else if (payload.classSelection === "Cleric") {
    classFeatures.push({
      name: "Divine Order",
      description: payload.clericDivineOrder === "Protector"
        ? "Divine Order: Protector (Heavy Armor and Martial Weapon proficiency added)."
        : "Divine Order: Thaumaturgist (1 bonus Cleric cantrip, +WIS to Religion/Arcana).",
      value: payload.clericDivineOrder || "Thaumaturgist",
    });
  } else if (payload.classSelection === "Druid") {
    classFeatures.push({ name: "Druidic", description: "You know Druidic, the secret language of Druids." });
    classFeatures.push({
      name: "Primal Order",
      description: payload.druidPrimalOrder === "Warden"
        ? "Primal Order: Warden (Medium Armor and Martial Weapon proficiency added)."
        : "Primal Order: Magician (1 bonus Druid cantrip, +WIS to Nature/Arcana checks).",
      value: payload.druidPrimalOrder || "Magician",
    });
  } else if (payload.classSelection === "Fighter") {
    classFeatures.push({ name: "Second Wind", description: "1d10 + 1 healing, 2 usages per long rest." });
    classFeatures.push({ name: "Fighting Style", description: `Fighting Style feat selection: ${payload.fighterFightingStyle || "Defense"}` });
  } else if (payload.classSelection === "Monk") {
    classFeatures.push({ name: "Unarmored Defense (Monk)", description: "AC = 10 + DEX Mod + WIS Mod when wearing no armor and no shield." });
    classFeatures.push({ name: "Martial Arts", description: "Unarmed strike deals 1d6 damage, Finesse/Light martial weapon scaling." });
  } else if (payload.classSelection === "Paladin") {
    classFeatures.push({ name: "Lay on Hands", description: "Healing pool of 5 HP per long rest." });
    classFeatures.push({ name: "Fighting Style", description: `Paladin Fighting Style: ${payload.paladinFightingStyle || "Defense"}` });
  } else if (payload.classSelection === "Ranger") {
    classFeatures.push({ name: "Favored Enemy", description: "You always have Hunter's Mark prepared, and it does not require concentration." });
  } else if (payload.classSelection === "Rogue") {
    classFeatures.push({ name: "Sneak Attack", description: "Deals 1d6 extra damage once per turn on Finesse or Ranged weapon attacks." });
    classFeatures.push({ name: "Expertise Registry", description: `Expertise skills selected: ${payload.rogueExpertiseSelections?.join(", ")}` });
  } else if (payload.classSelection === "Sorcerer") {
    classFeatures.push({ name: "Innate Sorcery", description: "+1 to spell attack rolls and spell save DCs for 1 minute, 2 usages per long rest." });
  } else if (payload.classSelection === "Warlock") {
    classFeatures.push({ name: "Pact Magic", description: "Level 1 spells cast using Pact Slots." });
    classFeatures.push({ name: "Eldritch Invocations Registry", description: `Eldritch Invocations selected: ${payload.warlockInvocationsSelections?.join(", ")}` });
  } else if (payload.classSelection === "Wizard") {
    classFeatures.push({ name: "Arcane Recovery", description: "Recover up to 1 Level 1 spell slot during a short rest once per day." });
    classFeatures.push({ name: "Wizard Spellbook", description: `Catalog contains: ${payload.wizardSpellbookSelections?.join(", ")}` });
  }

  // 9. Inventory, Cost, and Weight Calculation (Path A Selections vs Path B Starting Gold)
  const inventory: { itemName: string; quantity: number; weightTotalLbs: number }[] = [];
  let startingGoldLeft = cls.startingGoldAverage;
  let totalWeightCarriedLbs = 0;

  if (payload.takeStartingGold && payload.startingGoldPurchases) {
    for (const purchase of payload.startingGoldPurchases) {
      const item = MASTER_SHOP_ITEMS[purchase.itemName];
      if (item) {
        const cost = item.costGold * purchase.quantity;
        const weight = item.weightLbs * purchase.quantity;
        startingGoldLeft -= cost;
        totalWeightCarriedLbs += weight;
        inventory.push({
          itemName: purchase.itemName,
          quantity: purchase.quantity,
          weightTotalLbs: weight,
        });
      }
    }
  } else {
    // PATH A: Compile starting gear tree choices dynamically
    const armorChoice = payload.pathAEquipmentSelections?.classArmorChoice || "a";
    const weaponChoice = payload.pathAEquipmentSelections?.classWeaponChoice || "a";

    // Standard starting equipment allocation
    const resolvedItems: string[] = [...bg.equipment];

    if (payload.classSelection === "Fighter") {
      if (armorChoice === "a") resolvedItems.push("Chain Mail");
      else resolvedItems.push("Leather Armor");

      if (weaponChoice === "a") {
        resolvedItems.push("Greatsword", "Light Crossbow", "20 Bolts");
      } else {
        resolvedItems.push("Longsword", "Shield");
      }
      resolvedItems.push("Explorer's Pack");
    } else if (payload.classSelection === "Rogue") {
      if (armorChoice === "a") resolvedItems.push("Leather Armor");
      if (weaponChoice === "a") resolvedItems.push("Dagger", "Shortsword");
      else resolvedItems.push("Shortbow", "20 Arrows", "Rapier");
      resolvedItems.push("Burglar's Pack");
    } else {
      resolvedItems.push(...cls.startingEquipment);
    }

    startingGoldLeft = 15; // Set pocket money

    for (const rawItemName of resolvedItems) {
      let matchedName = "Backpack";
      let matchedWeight = 5;

      for (const [key, details] of Object.entries(MASTER_SHOP_ITEMS)) {
        if (rawItemName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(rawItemName.toLowerCase())) {
          matchedName = details.name;
          matchedWeight = details.weightLbs;
          break;
        }
      }

      const existing = inventory.find((i) => i.itemName === matchedName);
      if (existing) {
        existing.quantity += 1;
        existing.weightTotalLbs += matchedWeight;
      } else {
        inventory.push({
          itemName: matchedName,
          quantity: 1,
          weightTotalLbs: matchedWeight,
        });
      }
      totalWeightCarriedLbs += matchedWeight;
    }
  }

  // 10. Armor Class (AC) Compilation
  let finalAC = 10 + abilityModifiers.DEX;
  let shieldBonus = inventory.some((i) => i.itemName === "Shield") ? 2 : 0;

  // Unarmored modifiers
  if (payload.classSelection === "Barbarian" && !inventory.some((i) => i.itemName.includes("Armor"))) {
    finalAC = 10 + abilityModifiers.DEX + abilityModifiers.CON;
  } else if (payload.classSelection === "Monk" && !inventory.some((i) => i.itemName.includes("Armor")) && shieldBonus === 0) {
    finalAC = 10 + abilityModifiers.DEX + abilityModifiers.WIS;
  }

  // Heavy / Medium armored checks
  if (inventory.some((i) => i.itemName === "Chain Mail")) {
    finalAC = 16;
  } else if (inventory.some((i) => i.itemName === "Leather Armor")) {
    finalAC = 11 + abilityModifiers.DEX;
  } else if (inventory.some((i) => i.itemName === "Scale Mail")) {
    finalAC = 14 + Math.min(2, abilityModifiers.DEX);
  } else if (inventory.some((i) => i.itemName === "Plate Armor")) {
    finalAC = 18;
  }

  derivedStats.armorClass = finalAC + shieldBonus;

  return {
    name: payload.name,
    background: payload.background,
    species: payload.species,
    size: payload.speciesSize,
    class: payload.classSelection,
    baseAbilityScores,
    allocatedASIs: payload.asiAllocations,
    finalAbilityScores,
    abilityModifiers,
    maxHP,
    hitDie: `1d${cls.hitDie}`,
    speedFt,
    proficiencies: {
      savingThrows: cls.savingThrows,
      skills: profs.skills,
      tools: profs.tools,
      armors: cls.armorProficiencies,
      weapons: cls.weaponProficiencies,
      languages: finalLanguages,
    },
    weaponMasteries,
    originFeats: activeFeats,
    classFeatures,
    innateSpells,
    preparedSpells: payload.classPreparedSpellsSelections || [],
    inventory,
    startingGoldLeft,
    totalWeightCarriedLbs,
    derivedStats,
  };
}
