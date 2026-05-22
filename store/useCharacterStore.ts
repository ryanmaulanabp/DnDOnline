import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ToastConfig {
  message: string;
  type: 'error' | 'success' | 'info';
}

export interface CharacterState {
  // Dasar
  name: string; charClass: string; subclass: string;
  race: string; subrace: string; background: string;
  avatarUrl: string; level: number;
  
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
  spells: string[]; // Unified spell storage
  gold: number; useStartingWealth: boolean;

  // GLOBAL UI STATE
  toast: ToastConfig | null;

  // FUNGSI
  updateField: (field: keyof CharacterState, value: any) => void;
  updateBaseStat: (stat: string, value: number) => void;
  showToast: (message: string, type?: 'error' | 'success' | 'info') => void;
  hideToast: () => void;
  reset: () => void;
}

const initialState = {
  name: "", charClass: "", subclass: "", race: "", subrace: "", background: "",
  avatarUrl: "", level: 1,
  
  baseStats: { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 },
  asiChoice: "standard" as const, customBonus1: "STR", customBonus2: "DEX", customBonus3: "CON",
  
  alignment: "True Neutral", faith: "", lifestyle: "Modest",
  hair: "", skin: "", eyes: "", height: "", weight: "", age: "", gender: "",
  traits: "", ideals: "", bonds: "", flaws: "",
  organizations: "", allies: "", enemies: "", backstory: "", otherNotes: "",

  selectedClassSkills: [], equipmentSelections: {}, selectedCantrips: [], selectedSpells: [],
  spells: [],
  gold: 0, useStartingWealth: false,
  
  toast: null,
};

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set) => ({
      ...initialState,
      updateField: (field, value) => set({ [field]: value }),
      updateBaseStat: (stat, value) => set((state) => ({ baseStats: { ...state.baseStats, [stat]: value } })),
      
      // FUNGSI TOAST NOTIFICATION
      showToast: (message, type = 'error') => {
        set({ toast: { message, type } });
        // Auto-hide setelah 4 detik
        setTimeout(() => {
          set((state) => (state.toast?.message === message ? { toast: null } : state));
        }, 4000);
      },
      hideToast: () => set({ toast: null }),
      
      reset: () => set(initialState)
    }),
    {
      name: 'dndonline-character-storage',
      // Cegah state UI (seperti toast) ikut tersimpan ke local storage
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => !['toast'].includes(key))
      ) as CharacterState,
    }
  )
);