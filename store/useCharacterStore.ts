import { create } from 'zustand';

export interface CharacterState {
  // Dasar
  name: string; charClass: string; subclass: string;
  race: string; subrace: string; background: string;
  
  // STATS & ASI (Ability Score Increase)
  baseStats: Record<string, number>;
  asiChoice: "standard" | "custom21" | "custom111";
  customBonus1: string; customBonus2: string; customBonus3: string;
  
  // IDENTITY: Character Details
  alignment: string; faith: string; lifestyle: string;
  // IDENTITY: Physical
  hair: string; skin: string; eyes: string; height: string; weight: string; age: string; gender: string;
  // IDENTITY: Personal
  traits: string; ideals: string; bonds: string; flaws: string;
  // IDENTITY: Notes
  organizations: string; allies: string; enemies: string; backstory: string; otherNotes: string;

  // EQUIPMENT & COMBAT
  selectedClassSkills: string[]; equipmentSelections: Record<string, string>;
  selectedCantrips: string[]; selectedSpells: string[];
  gold: number; useStartingWealth: boolean; // Pilihan mau pakai gold atau equipment standar

  // FUNGSI
  updateField: (field: keyof CharacterState, value: any) => void;
  updateBaseStat: (stat: string, value: number) => void;
  reset: () => void;
}

const initialState = {
  name: "", charClass: "", subclass: "", race: "", subrace: "", background: "",
  baseStats: { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 },
  asiChoice: "standard" as const, customBonus1: "STR", customBonus2: "DEX", customBonus3: "CON",
  
  alignment: "True Neutral", faith: "", lifestyle: "Modest",
  hair: "", skin: "", eyes: "", height: "", weight: "", age: "", gender: "",
  traits: "", ideals: "", bonds: "", flaws: "",
  organizations: "", allies: "", enemies: "", backstory: "", otherNotes: "",

  selectedClassSkills: [], equipmentSelections: {}, selectedCantrips: [], selectedSpells: [],
  gold: 0, useStartingWealth: false,
};

export const useCharacterStore = create<CharacterState>((set) => ({
  ...initialState,
  updateField: (field, value) => set({ [field]: value }),
  updateBaseStat: (stat, value) => set((state) => ({ baseStats: { ...state.baseStats, [stat]: value } })),
  reset: () => set({ ...initialState })
}));