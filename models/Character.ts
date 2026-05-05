import mongoose, { Schema, Document } from "mongoose";

// --- INTERFACES ---
export interface IWeapon {
  name: string;
  damage: string;
  isFinesse: boolean;
  isRanged: boolean;
}

export interface ICharacter extends Document {
  name: string;
  race: string;
  class: string;
  alignment: string;
  background: string;
  level: number;
  hpMax: number;
  currentHp: number;
  armorClass: number;
  speed: number;
  initiative: number;
  stats: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };
  proficientSkills: string[];
  equipment: string[];
  spells: string[];
  features: string[];
  spellCastingStat: string;
  weapons: IWeapon[];
  
  // Fitur Baru: Roleplay & Uang
  roleplay: {
    traits: string;
    ideals: string;
    bonds: string;
    flaws: string;
  };
  currency: {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// --- SCHEMAS ---
const WeaponSchema = new Schema<IWeapon>({
  name: { type: String, required: true },
  damage: { type: String, required: true },
  isFinesse: { type: Boolean, default: false },
  isRanged: { type: Boolean, default: false },
});

const CharacterSchema = new Schema<ICharacter>(
  {
    name: { type: String, required: true },
    race: { type: String, required: true },
    class: { type: String, required: true },
    alignment: { type: String, default: "True Neutral" },
    background: { type: String, required: true },
    level: { type: Number, default: 1 },
    hpMax: { type: Number, required: true },
    currentHp: { type: Number, required: true },
    armorClass: { type: Number, required: true },
    speed: { type: Number, default: 30 },
    initiative: { type: Number, default: 0 },
    stats: {
      STR: { type: Number, required: true },
      DEX: { type: Number, required: true },
      CON: { type: Number, required: true },
      INT: { type: Number, required: true },
      WIS: { type: Number, required: true },
      CHA: { type: Number, required: true },
    },
    proficientSkills: [{ type: String }],
    equipment: [{ type: String }],
    spells: [{ type: String }],
    features: [{ type: String }],
    spellCastingStat: { type: String, default: "NONE" },
    weapons: [WeaponSchema],
    
    // Schema Baru: Roleplay
    roleplay: {
      traits: { type: String, default: "" },
      ideals: { type: String, default: "" },
      bonds: { type: String, default: "" },
      flaws: { type: String, default: "" },
    },
    
    // Schema Baru: Currency
    currency: {
      cp: { type: Number, default: 0 },
      sp: { type: Number, default: 0 },
      ep: { type: Number, default: 0 },
      gp: { type: Number, default: 0 },
      pp: { type: Number, default: 0 },
    },
  },
  { 
    timestamps: true 
  }
);

// Mencegah error "OverwriteModelError" saat Next.js melakukan hot-reload
const Character = mongoose.models.Character || mongoose.model<ICharacter>("Character", CharacterSchema);

export default Character;