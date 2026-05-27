import { z } from "zod";
import {
  ALL_ABILITIES,
  ALL_SKILLS,
  ALL_TOOLS,
  BACKGROUNDS_DB,
  SPECIES_DB,
  CLASSES_DB,
  WEAPONS_DB,
  MASTER_SHOP_ITEMS,
  validateCharacterPayload,
} from "./engine";
import {
  Ability,
  SpeciesType,
  ClassType,
  SizeCategory,
  GoliathAncestry,
} from "./types";

// ==========================================
// 1. NESTED COMPONENT SCHEMAS
// ==========================================

export const AbilitySchema = z.enum(["STR", "DEX", "CON", "INT", "WIS", "CHA"]);

export const AbilityScoresSchema = z.object({
  STR: z.number().int().min(8).max(15),
  DEX: z.number().int().min(8).max(15),
  CON: z.number().int().min(8).max(15),
  INT: z.number().int().min(8).max(15),
  WIS: z.number().int().min(8).max(15),
  CHA: z.number().int().min(8).max(15),
});

export const ASIAllocationSchema = z.object({
  stat: AbilitySchema,
  value: z.number().int().min(1).max(2),
});

export const MagicSourceSchema = z.enum(["Arcane", "Divine", "Primal"]);

export const MagicInitiateDetailsSchema = z.object({
  source: MagicSourceSchema,
  cantrips: z.array(z.string()).min(2).max(2),
  firstLevelSpell: z.string().min(1),
  castingAbility: z.enum(["INT", "WIS", "CHA"]),
});

export const GoliathAncestrySchema = z.enum([
  "Cloud Giant (Teleportation)",
  "Fire Giant (Extra Damage)",
  "Frost Giant (Cold Ward)",
  "Hill Giant (Knock Down)",
  "Stone Giant (Reaction Damage Reduction)",
  "Storm Giant (Thunder Reaction)",
]);

export const SizeCategorySchema = z.enum(["Medium", "Small"]);

export const SpeciesTypeSchema = z.enum([
  "Aasimar",
  "Dragonborn",
  "Dwarf",
  "Elf",
  "Gnome",
  "Goliath",
  "Halfling",
  "Human",
  "Orc",
  "Tiefling",
]);

export const ClassTypeSchema = z.enum([
  "Barbarian",
  "Bard",
  "Cleric",
  "Druid",
  "Fighter",
  "Monk",
  "Paladin",
  "Ranger",
  "Rogue",
  "Sorcerer",
  "Warlock",
  "Wizard",
]);

export const StartingGoldShopPurchaseSchema = z.object({
  itemName: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const PathAEquipmentSelectionsSchema = z.object({
  classArmorChoice: z.enum(["a", "b"]).optional(),
  classWeaponChoice: z.enum(["a", "b"]).optional(),
  classPackChoice: z.enum(["a", "b"]).optional(),
});

// ==========================================
// 2. MASTER CHARACTER CREATION PAYLOAD SCHEMA
// ==========================================

export const CharacterCreationPayloadSchema = z
  .object({
    name: z.string().min(1, "Character name cannot be blank or empty."),
    background: z.string().min(1, "Background selection is required."),
    asiAllocations: z.array(ASIAllocationSchema).min(2).max(3),
    species: SpeciesTypeSchema,
    speciesSize: SizeCategorySchema,
    goliathAncestrySelection: GoliathAncestrySchema.optional(),
    dragonbornBreathSelection: z.enum(["Acid", "Cold", "Fire", "Lightning", "Poison"]).optional(),
    speciesBonusFeatSelection: z.string().optional(),
    speciesBonusFeatMagicInitiateDetails: MagicInitiateDetailsSchema.optional(),
    magicInitiateBackgroundDetails: MagicInitiateDetailsSchema.optional(),
    
    // Class selection and granual Level 1 choices
    classSelection: ClassTypeSchema,
    classSkillSelections: z.array(z.string()).min(2).max(4),
    classWeaponMasteriesSelections: z.array(z.string()).min(0).max(3),
    classPreparedSpellsSelections: z.array(z.string()).optional(),
    
    // granual class-specific micro-decisions (Phase 2)
    clericDivineOrder: z.enum(["Protector", "Thaumaturgist"]).optional(),
    druidPrimalOrder: z.enum(["Magician", "Warden"]).optional(),
    fighterFightingStyle: z.enum(["Archery", "Defense", "Dueling", "Great Weapon Fighting", "Interception", "Two-Weapon Fighting"]).optional(),
    paladinFightingStyle: z.enum(["Defense", "Dueling", "Great Weapon Fighting", "Blessed Warrior"]).optional(),
    rogueExpertiseSelections: z.array(z.string()).min(2).max(2).optional(),
    warlockInvocationsSelections: z.array(z.string()).min(2).max(2).optional(),
    warlockLessonsOfTheFirstOnesFeatSelection: z.string().optional(),
    wizardSpellbookSelections: z.array(z.string()).optional(),
    
    // Dynamic Wildcard resolvers for collisions (Phase 4)
    wildcardSkillSelections: z.array(z.string()).optional(),
    wildcardToolSelections: z.array(z.string()).optional(),
    
    pointBuyStats: AbilityScoresSchema,
    chosenLanguages: z.array(z.string()).min(2).max(2),
    
    // Inventory Choices
    takeStartingGold: z.boolean(),
    startingGoldPurchases: z.array(StartingGoldShopPurchaseSchema).optional(),
    pathAEquipmentSelections: PathAEquipmentSelectionsSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const payload = data as any;
    const result = validateCharacterPayload(payload);

    if (!result.isValid) {
      for (const err of result.errors) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: err,
        });
      }
    }
  });

export type CharacterCreationPayloadInput = z.infer<typeof CharacterCreationPayloadSchema>;
