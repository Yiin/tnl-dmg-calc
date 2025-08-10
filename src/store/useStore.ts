import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Build, Enemy, StatKey } from '../types';
import { serializeState, deserializeState } from '../utils/urlState';
import { devtools } from 'zustand/middleware';

interface SkillConfig {
  skillPotency: number;
  skillFlatAdd: number;
  hitsPerCast: number;
  weakenSkillPotency: number;
  weakenSkillFlatAdd: number;
  cooldownTime: number;
  castTime: number;
  skillCooldownSpecialization: number;
}

interface AppState {
  // State
  builds: Build[];
  enemies: Enemy[];
  xAxisStat: StatKey;
  xAxisRange: { min: number; max: number; step: number };
  yMetric: "expectedDamage" | "finalDamage" | "critChance" | "hitChance" | "dps";
  combatType: "melee" | "ranged" | "magic";
  attackDirection: "front" | "side" | "back";
  isPvP: boolean;
  skillConfig: SkillConfig;
  activeBuildTab: string;
  activeEnemyTab: string;
  speedLimiter: 'cooldown' | 'castTime';
  
  // Actions - Builds
  addBuild: () => void;
  updateBuild: (index: number, build: Partial<Build>) => void;
  updateBuildProperty: <K extends keyof Build>(index: number, key: K, value: Build[K]) => void;
  removeBuild: (index: number) => void;
  importBuild: (build: Build) => void;
  setActiveBuildTab: (tab: string) => void;
  
  // Actions - Enemies
  addEnemy: () => void;
  updateEnemy: (index: number, enemy: Partial<Enemy>) => void;
  updateEnemyProperty: <K extends keyof Enemy>(index: number, key: K, value: Enemy[K]) => void;
  removeEnemy: (index: number) => void;
  importEnemy: (enemy: Enemy) => void;
  setActiveEnemyTab: (tab: string) => void;
  
  // Actions - Chart Settings
  setXAxisStat: (stat: StatKey) => void;
  setXAxisRange: (range: { min: number; max: number; step: number }) => void;
  setYMetric: (metric: "expectedDamage" | "finalDamage" | "critChance" | "hitChance" | "dps") => void;
  setCombatType: (type: "melee" | "ranged" | "magic") => void;
  setAttackDirection: (direction: "front" | "side" | "back") => void;
  setIsPvP: (isPvP: boolean) => void;
  setSkillConfig: (config: SkillConfig) => void;
  setSpeedLimiter: (limiter: 'cooldown' | 'castTime') => void;
  
  // Actions - General
  clearAll: () => void;
  shareState: () => string;
  loadFromUrl: (hash: string) => void;
  detectDominantCombatType: (build: Build) => "melee" | "ranged" | "magic";
  selectSmartXAxisStat: (enemy: Enemy, combatType: "melee" | "ranged" | "magic") => StatKey;
}

export const defaultBuild: Build = {
  name: "Build 1",
  minDMG: 100,
  maxDMG: 200,
  meleeCritical: 1000,
  rangedCritical: 1000,
  magicCritical: 1000,
  criticalDamage: 50,
  meleeHeavyAttack: 500,
  rangedHeavyAttack: 500,
  magicHeavyAttack: 500,
  meleeHit: 2000,
  rangedHit: 2000,
  magicHit: 2000,
  skillDamageBoost: 0,
  bonusDamage: 0,
  attackSpeedTime: 1
};

export const defaultSkillConfig: SkillConfig = {
  skillPotency: 1.0,
  skillFlatAdd: 0,
  hitsPerCast: 1,
  weakenSkillPotency: 0,
  weakenSkillFlatAdd: 0,
  cooldownTime: 10,
  castTime: 1,
  skillCooldownSpecialization: 0,
};

export const defaultEnemy: Enemy = {
  name: "Target Dummy",
  meleeEndurance: 1000,
  rangedEndurance: 1000,
  magicEndurance: 1000,
  meleeEvasion: 0,
  rangedEvasion: 0,
  magicEvasion: 0,
  meleeHeavyAttackEvasion: 0,
  rangedHeavyAttackEvasion: 0,
  magicHeavyAttackEvasion: 0,
  meleeDefense: 500,
  rangedDefense: 500,
  magicDefense: 500,
  damageReduction: 0,
  skillDamageResistance: 0,
};

// Check if we should use URL state or localStorage
const hasUrlHash = window.location.hash.length > 1;
const getInitialState = () => {
  if (hasUrlHash) {
    const hash = window.location.hash.substring(1);
    const urlState = deserializeState(hash);
    if (urlState) {
      return {
        builds: urlState.builds || [],
        enemies: urlState.enemies || [],
        xAxisStat: (urlState.xAxisStat || "meleeEndurance") as StatKey,
        xAxisRange: urlState.xAxisRange || { min: 0, max: 3000, step: 100 },
        yMetric: (urlState.yMetric || "expectedDamage") as any,
        combatType: (urlState.combatType || "melee") as any,
        attackDirection: (urlState.attackDirection || "front") as any,
        isPvP: urlState.isPvP !== undefined ? urlState.isPvP : true,
        skillConfig: urlState.skillConfig ? { ...defaultSkillConfig, ...urlState.skillConfig } : defaultSkillConfig,
        activeBuildTab: urlState.activeBuildTab || "0",
        activeEnemyTab: urlState.activeEnemyTab || "0",
        speedLimiter: urlState.speedLimiter || 'cooldown',
      };
    }
  }
  return null;
};

const initialUrlState = getInitialState();

// UI Store moved to selectors/uiSelectors.ts
import { useUIStore } from './selectors/uiSelectors';

// Debounce function for persistence
let persistTimeout: NodeJS.Timeout;
const debouncedPersist = (fn: () => void, delay = 500) => {
  clearTimeout(persistTimeout);
  persistTimeout = setTimeout(fn, delay);
};

export const useStore = create<AppState>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set, get) => ({
      // Initial state - from URL if available, otherwise defaults
      builds: initialUrlState?.builds || [],
      enemies: initialUrlState?.enemies || [],
      xAxisStat: initialUrlState?.xAxisStat || "meleeEndurance",
      xAxisRange: initialUrlState?.xAxisRange || { min: 0, max: 3000, step: 100 },
      yMetric: initialUrlState?.yMetric || "expectedDamage",
      combatType: initialUrlState?.combatType || "melee",
      attackDirection: initialUrlState?.attackDirection || "front",
      isPvP: initialUrlState?.isPvP ?? true,
      skillConfig: initialUrlState?.skillConfig || defaultSkillConfig,
      activeBuildTab: initialUrlState?.activeBuildTab || "0",
      activeEnemyTab: initialUrlState?.activeEnemyTab || "0",
      speedLimiter: initialUrlState?.speedLimiter || 'cooldown',
      
      // Build Actions
      addBuild: () => {
        set((state) => {
          const newBuild: Build = {
            ...defaultBuild,
            name: `Build ${state.builds.length + 1}`,
          };
          state.builds.push(newBuild);
          state.activeBuildTab = (state.builds.length - 1).toString();
        });
      },
      
      updateBuild: (index, buildUpdate) => {
        set((state) => {
          if (state.builds[index]) {
            Object.assign(state.builds[index], buildUpdate);
          }
        });
      },
      
      updateBuildProperty: (index, key, value) => {
        set((state) => {
          if (state.builds[index]) {
            state.builds[index][key] = value;
          }
        });
      },
      
      removeBuild: (index) => {
        set((state) => {
          if (state.builds.length > 0) {
            state.builds.splice(index, 1);
            
            // If all builds are removed, reset the active tab to "0"
            if (state.builds.length === 0) {
              state.activeBuildTab = "0";
            } else {
              const currentTab = parseInt(state.activeBuildTab);
              
              if (currentTab >= state.builds.length) {
                state.activeBuildTab = (state.builds.length - 1).toString();
              } else if (currentTab > index) {
                state.activeBuildTab = (currentTab - 1).toString();
              }
            }
          }
        });
      },
      
      importBuild: (build) => {
        set((state) => {
          state.builds.push(build);
          state.activeBuildTab = (state.builds.length - 1).toString();
        });
      },
      
      setActiveBuildTab: (tab) => set({ activeBuildTab: tab }),
      
      // Enemy Actions
      addEnemy: () => {
        set((state) => {
          const newEnemy: Enemy = {
            ...defaultEnemy,
            name: `Enemy ${state.enemies.length + 1}`,
          };
          state.enemies.push(newEnemy);
          state.activeEnemyTab = (state.enemies.length - 1).toString();
        });
      },
      
      updateEnemy: (index, enemyUpdate) => {
        set((state) => {
          if (state.enemies[index]) {
            Object.assign(state.enemies[index], enemyUpdate);
          }
        });
      },
      
      updateEnemyProperty: (index, key, value) => {
        set((state) => {
          if (state.enemies[index]) {
            state.enemies[index][key] = value;
          }
        });
      },
      
      removeEnemy: (index) => {
        set((state) => {
          if (state.enemies.length > 0) {
            state.enemies.splice(index, 1);
            const currentTab = parseInt(state.activeEnemyTab);
            
            if (currentTab >= state.enemies.length) {
              state.activeEnemyTab = (state.enemies.length - 1).toString();
            } else if (currentTab > index) {
              state.activeEnemyTab = (currentTab - 1).toString();
            }
          }
        });
      },
      
      importEnemy: (enemy) => {
        set((state) => {
          state.enemies.push(enemy);
          state.activeEnemyTab = (state.enemies.length - 1).toString();
        });
      },
      
      setActiveEnemyTab: (tab) => set({ activeEnemyTab: tab }),
      
      // Chart Settings Actions
      setXAxisStat: (stat) => set({ xAxisStat: stat }),
      setXAxisRange: (range) => set({ xAxisRange: range }),
      setYMetric: (metric) => set({ yMetric: metric }),
      setCombatType: (type) => set({ combatType: type }),
      setAttackDirection: (direction) => set({ attackDirection: direction }),
      setIsPvP: (isPvP) => set({ isPvP }),
      setSkillConfig: (config) => set({ skillConfig: config }),
      setSpeedLimiter: (limiter) => set({ speedLimiter: limiter }),
      
      // General Actions
      clearAll: () => {
        set({
          builds: [],
          enemies: [],
          xAxisStat: "meleeEndurance",
          xAxisRange: { min: 0, max: 3000, step: 100 },
          yMetric: "expectedDamage",
          combatType: "melee",
          attackDirection: "front",
          activeBuildTab: "0",
          activeEnemyTab: "0",
        });
      },
      
      shareState: () => {
        const state = get();
        const currentState = {
          builds: state.builds,
          enemies: state.enemies,
          xAxisStat: state.xAxisStat,
          xAxisRange: state.xAxisRange,
          yMetric: state.yMetric,
          combatType: state.combatType,
          attackDirection: state.attackDirection,
          isPvP: state.isPvP,
          skillConfig: state.skillConfig,
          activeBuildTab: state.activeBuildTab,
          activeEnemyTab: state.activeEnemyTab,
          speedLimiter: state.speedLimiter,
        };
        
        const hash = serializeState(currentState);
        const url = `${window.location.origin}${window.location.pathname}#${hash}`;
        
        navigator.clipboard.writeText(url).then(() => {
          useUIStore.getState().setShowShareNotification(true);
          setTimeout(() => useUIStore.getState().setShowShareNotification(false), 3000);
        }).catch((err) => {
          console.error("Failed to copy URL:", err);
        });
        
        return url;
      },
      
      loadFromUrl: (hash) => {
        const urlState = deserializeState(hash);
        if (urlState) {
          set({
            builds: urlState.builds || [],
            enemies: urlState.enemies || [],
            xAxisStat: (urlState.xAxisStat || "meleeEndurance") as StatKey,
            xAxisRange: urlState.xAxisRange || { min: 0, max: 3000, step: 100 },
            yMetric: (urlState.yMetric || "expectedDamage") as any,
            combatType: (urlState.combatType || "melee") as any,
            attackDirection: (urlState.attackDirection || "front") as any,
            isPvP: urlState.isPvP !== undefined ? urlState.isPvP : true,
            skillConfig: urlState.skillConfig ? { ...defaultSkillConfig, ...urlState.skillConfig } : defaultSkillConfig,
            activeBuildTab: urlState.activeBuildTab || "0",
            activeEnemyTab: urlState.activeEnemyTab || "0",
            speedLimiter: urlState.speedLimiter || 'cooldown',
          });
        }
      },
      
      detectDominantCombatType: (build) => {
        const meleeScore = (build.meleeCritical || 0) + (build.meleeHit || 0) + (build.meleeHeavyAttack || 0);
        const rangedScore = (build.rangedCritical || 0) + (build.rangedHit || 0) + (build.rangedHeavyAttack || 0);
        const magicScore = (build.magicCritical || 0) + (build.magicHit || 0) + (build.magicHeavyAttack || 0);
        
        if (magicScore >= meleeScore && magicScore >= rangedScore) {
          return "magic";
        } else if (rangedScore >= meleeScore) {
          return "ranged";
        } else {
          return "melee";
        }
      },
      
      selectSmartXAxisStat: (enemy, combatType) => {
        const evasionStat = combatType === "melee"
          ? enemy.meleeEvasion
          : combatType === "ranged"
          ? enemy.rangedEvasion
          : enemy.magicEvasion;
        
        if ((evasionStat || 0) > 500) {
          return combatType === "melee"
            ? "meleeEvasion"
            : combatType === "ranged"
            ? "rangedEvasion"
            : "magicEvasion";
        } else {
          return combatType === "melee"
            ? "meleeEndurance"
            : combatType === "ranged"
            ? "rangedEndurance"
            : "magicEndurance";
        }
      },
    })),
    {
      name: 'tnl-damage-calc-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          
          const data = JSON.parse(str);
          
          // Migration: Convert old useCDR/useAttackSpeed to new speedLimiter
          if (data?.state && ('useCDR' in data.state || 'useAttackSpeed' in data.state)) {
            // If old format exists, convert it
            if (!data.state.speedLimiter) {
              // Default to 'cooldown' mode if not set
              data.state.speedLimiter = 'cooldown';
            }
            // Clean up old fields
            delete data.state.useCDR;
            delete data.state.useAttackSpeed;
          }
          
          return data;
        },
        setItem: (name, value) => {
          // Debounce localStorage writes
          debouncedPersist(() => {
            localStorage.setItem(name, JSON.stringify(value));
          });
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      partialize: (state: AppState) => ({
        builds: state.builds,
        enemies: state.enemies,
        xAxisStat: state.xAxisStat,
        xAxisRange: state.xAxisRange,
        yMetric: state.yMetric,
        combatType: state.combatType,
        attackDirection: state.attackDirection,
        isPvP: state.isPvP,
        skillConfig: state.skillConfig,
        activeBuildTab: state.activeBuildTab,
        activeEnemyTab: state.activeEnemyTab,
        speedLimiter: state.speedLimiter,
      }),
      skipHydration: hasUrlHash, // Skip localStorage if we have URL state
    }
  )
    ),
    { name: 'app-store' }
  )
);