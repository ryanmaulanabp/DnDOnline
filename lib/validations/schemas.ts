import { z } from "zod";

// Helper Schema untuk Mongoose ObjectId format
export const ObjectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Format ID tidak valid (harus 24 karakter heksadesimal)");

// --- USER PROFILE SCHEMAS ---
export const UpdateUserPayloadSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore")
    .optional(),
  email: z.string().email("Format email salah").optional(),
  password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
  image: z.string().url("Format URL avatar tidak valid").optional().or(z.literal("")),
});

// --- CHARACTER SCHEMAS ---
export const WeaponSchema = z.object({
  name: z.string().min(1, "Nama senjata wajib diisi"),
  damage: z.string().min(1, "Damage formula wajib diisi (misal: 1d6)"),
  isFinesse: z.boolean().default(false),
  isRanged: z.boolean().default(false),
});

export const CharacterPayloadSchema = z.object({
  userEmail: z.string().email("Format email pahlawan tidak valid"),
  name: z.string().min(1, "Nama pahlawan wajib diisi").max(50, "Nama terlalu panjang"),
  race: z.string().min(1, "Ras pahlawan wajib dipilih"),
  class: z.string().min(1, "Kelas pahlawan wajib dipilih"),
  alignment: z.string().default("True Neutral"),
  background: z.string().min(1, "Latar belakang wajib dipilih"),
  avatarUrl: z.string().optional().or(z.literal("")),
  level: z.number().int().min(1).max(20).default(1),
  hpMax: z.number().int().min(1, "HP Maksimal minimal 1"),
  currentHp: z.number().int().min(0, "HP saat ini tidak boleh negatif"),
  armorClass: z.number().int().min(0, "Armor Class tidak boleh negatif"),
  speed: z.number().int().min(0).default(30),
  initiative: z.number().int().default(0),
  stats: z.object({
    STR: z.number().int().min(1).max(30),
    DEX: z.number().int().min(1).max(30),
    CON: z.number().int().min(1).max(30),
    INT: z.number().int().min(1).max(30),
    WIS: z.number().int().min(1).max(30),
    CHA: z.number().int().min(1).max(30),
  }),
  proficientSkills: z.array(z.string()).default([]),
  equipment: z.array(z.string()).default([]),
  spells: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  spellCastingStat: z.string().default("NONE"),
  weapons: z.array(WeaponSchema).default([]),
  roleplay: z.object({
    traits: z.string().default(""),
    ideals: z.string().default(""),
    bonds: z.string().default(""),
    flaws: z.string().default(""),
  }),
  currency: z.object({
    cp: z.number().int().min(0).default(0),
    sp: z.number().int().min(0).default(0),
    ep: z.number().int().min(0).default(0),
    gp: z.number().int().min(0).default(0),
    pp: z.number().int().min(0).default(0),
  }),
  conditions: z.array(z.string()).default([]),
});

// --- CAMPAIGN SCHEMAS ---
export const CreateCampaignSchema = z.object({
  name: z.string().min(3, "Nama kampanye minimal 3 karakter").max(100),
  description: z.string().default(""),
});

export const SendMessageSchema = z.object({
  campaignId: ObjectIdSchema,
  senderName: z.string().min(1, "Nama pengirim wajib diisi"),
  text: z.string().min(1, "Pesan tidak boleh kosong"),
  isRoll: z.boolean().default(false),
});

export const ClaimLootSchema = z.object({
  characterId: ObjectIdSchema,
  itemName: z.string().min(1, "Nama barang wajib diisi"),
});

export const ParticipantSchema = z.object({
  id: z.string(),
  name: z.string(),
  initiative: z.number().int(),
  hp: z.number().int(),
  maxHp: z.number().int(),
  ac: z.number().int(),
  action: z.number().int().min(0).default(1),
  bonusAction: z.number().int().min(0).default(1),
  reaction: z.number().int().min(0).default(1),
  speed: z.number().int().min(0).default(30),
  isMonster: z.boolean().default(false),
});

export const UpdateCombatStateSchema = z.object({
  campaignId: ObjectIdSchema,
  combatState: z.object({
    isActive: z.boolean().default(false),
    round: z.number().int().min(1).default(1),
    turnIndex: z.number().int().min(0).default(0),
    participants: z.array(ParticipantSchema).default([]),
  }),
});

export const UpdateSharedGoldSchema = z.object({
  campaignId: ObjectIdSchema,
  goldAmount: z.number().int(),
});

export const AddSharedItemSchema = z.object({
  campaignId: ObjectIdSchema,
  item: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    quantity: z.number().int().min(1),
  }),
});

export const TokenSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  img: z.string(),
  name: z.string(),
  isMonster: z.boolean().default(false),
});

export const UpdateGridStateSchema = z.object({
  campaignId: ObjectIdSchema,
  gridState: z.object({
    bgUrl: z.string().optional().or(z.literal("")),
    weather: z.string().default("none"),
    tokens: z.array(TokenSchema).default([]),
  }),
});

export const JoinCampaignSchema = z.object({
  inviteCode: z.string().min(1, "Kode invite wajib diisi"),
  characterId: ObjectIdSchema,
});

// --- COMMUNITY SCHEMAS ---
export const CreateCommunityPostSchema = z.object({
  authorName: z.string().min(1),
  authorEmail: z.string().email(),
  title: z.string().min(3, "Judul postingan minimal 3 karakter").max(100),
  content: z.string().min(10, "Isi postingan minimal 10 karakter"),
});

// --- POLL SCHEMAS ---
export const CreatePollSchema = z.object({
  campaignId: ObjectIdSchema,
  question: z.string().min(3, "Pertanyaan polling minimal 3 karakter").max(200),
  options: z
    .array(
      z.object({
        text: z.string().min(1, "Opsi tidak boleh kosong"),
      })
    )
    .min(2, "Polling membutuhkan minimal 2 opsi pilihan"),
});

export const VotePollSchema = z.object({
  pollId: ObjectIdSchema,
  optionIds: z.array(z.string()).min(1, "Pilih minimal 1 opsi untuk memilih"),
  userEmail: z.string().email(),
  campaignId: ObjectIdSchema,
});
