import LZString from "lz-string";
import { Build, Enemy } from "../types";

interface AppState {
  builds: Build[];
  enemies: Enemy[];
  xAxisStat: string;
  xAxisRange: { min: number; max: number; step: number };
  yMetric: string;
  combatType: string;
  attackDirection: string;
  isPvP: boolean;
  skillConfig: {
    skillPotency: number;
    skillFlatAdd: number;
    hitsPerCast: number;
    weakenSkillPotency: number;
    weakenSkillFlatAdd: number;
  };
  activeBuildTab: string;
  activeEnemyTab?: string;
}

// Remove default values and undefined properties to minimize size
function minifyBuild(build: Build): any {
  const minified: any = { n: build.name };

  // Weapon damage
  if (build.minDMG !== 100) minified.mi = build.minDMG;
  if (build.maxDMG !== 200) minified.ma = build.maxDMG;
  if (build.offhandMinDMG) minified.omi = build.offhandMinDMG;
  if (build.offhandMaxDMG) minified.oma = build.offhandMaxDMG;
  if (build.offhandChance) minified.oc = build.offhandChance;

  // Critical stats
  if (build.meleeCritical && build.meleeCritical !== 1000)
    minified.mc = build.meleeCritical;
  if (build.rangedCritical && build.rangedCritical !== 1000)
    minified.rc = build.rangedCritical;
  if (build.magicCritical && build.magicCritical !== 1000)
    minified.mgc = build.magicCritical;
  if (build.criticalDamage && build.criticalDamage !== 50)
    minified.cd = build.criticalDamage;

  // Heavy attack
  if (build.meleeHeavyAttack && build.meleeHeavyAttack !== 500)
    minified.mh = build.meleeHeavyAttack;
  if (build.rangedHeavyAttack && build.rangedHeavyAttack !== 500)
    minified.rh = build.rangedHeavyAttack;
  if (build.magicHeavyAttack && build.magicHeavyAttack !== 500)
    minified.mgh = build.magicHeavyAttack;

  // Hit stats
  if (build.meleeHit && build.meleeHit !== 2000) minified.mhi = build.meleeHit;
  if (build.rangedHit && build.rangedHit !== 2000)
    minified.rhi = build.rangedHit;
  if (build.magicHit && build.magicHit !== 2000) minified.mghi = build.magicHit;

  // Other stats
  if (build.bonusDamage) minified.bd = build.bonusDamage;
  if (build.skillDamageBoost) minified.sdb = build.skillDamageBoost;
  if (build.weakenChance) minified.wc = build.weakenChance;
  if (build.speciesDamageBoost) minified.spdb = build.speciesDamageBoost;
  if (build.pveDamageMultiplier) minified.pve = build.pveDamageMultiplier;
  if (build.shieldBlockPenetrationChance)
    minified.sbp = build.shieldBlockPenetrationChance;

  // Attack Speed
  if (build.attackSpeedPercent) minified.asp = build.attackSpeedPercent;
  if (build.attackSpeedTime) minified.ast = build.attackSpeedTime;
  
  // Cooldown Speed
  if (build.cooldownSpeed) minified.cs = build.cooldownSpeed;
  if (build.cooldownSpeedPercent) minified.csp = build.cooldownSpeedPercent;

  // Positional stats
  if (build.backHitChance) minified.bhc = build.backHitChance;
  if (build.sideHitChance) minified.shc = build.sideHitChance;
  if (build.backHeavyAttackChance) minified.bhac = build.backHeavyAttackChance;
  if (build.sideHeavyAttackChance) minified.shac = build.sideHeavyAttackChance;
  if (build.backCriticalHit) minified.bch = build.backCriticalHit;
  if (build.sideCriticalHit) minified.sch = build.sideCriticalHit;

  return minified;
}

function expandBuild(minified: any): Build {
  return {
    name: minified.n || "Build",
    minDMG: minified.mi || 100,
    maxDMG: minified.ma || 200,
    offhandMinDMG: minified.omi,
    offhandMaxDMG: minified.oma,
    offhandChance: minified.oc,
    meleeCritical: minified.mc || 1000,
    rangedCritical: minified.rc || 1000,
    magicCritical: minified.mgc || 1000,
    criticalDamage: minified.cd || 50,
    meleeHeavyAttack: minified.mh || 500,
    rangedHeavyAttack: minified.rh || 500,
    magicHeavyAttack: minified.mgh || 500,
    meleeHit: minified.mhi || 2000,
    rangedHit: minified.rhi || 2000,
    magicHit: minified.mghi || 2000,
    bonusDamage: minified.bd || 0,
    skillDamageBoost: minified.sdb || 0,
    weakenChance: minified.wc || 0,
    speciesDamageBoost: minified.spdb,
    pveDamageMultiplier: minified.pve,
    shieldBlockPenetrationChance: minified.sbp,
    attackSpeedPercent: minified.asp,
    attackSpeedTime: minified.ast,
    cooldownSpeed: minified.cs,
    cooldownSpeedPercent: minified.csp,
    backHitChance: minified.bhc,
    sideHitChance: minified.shc,
    backHeavyAttackChance: minified.bhac,
    sideHeavyAttackChance: minified.shac,
    backCriticalHit: minified.bch,
    sideCriticalHit: minified.sch,
  };
}

function minifyEnemy(enemy: Enemy): any {
  const minified: any = { n: enemy.name };

  // Only include non-default values
  if (enemy.damageReduction) minified.dr = enemy.damageReduction;
  if (enemy.meleeDefense && enemy.meleeDefense !== 500)
    minified.md = enemy.meleeDefense;
  if (enemy.rangedDefense && enemy.rangedDefense !== 500)
    minified.rd = enemy.rangedDefense;
  if (enemy.magicDefense && enemy.magicDefense !== 500)
    minified.mgd = enemy.magicDefense;
  if (enemy.meleeEndurance && enemy.meleeEndurance !== 1000)
    minified.me = enemy.meleeEndurance;
  if (enemy.rangedEndurance && enemy.rangedEndurance !== 1000)
    minified.re = enemy.rangedEndurance;
  if (enemy.magicEndurance && enemy.magicEndurance !== 1000)
    minified.mge = enemy.magicEndurance;
  if (enemy.meleeEvasion) minified.mev = enemy.meleeEvasion;
  if (enemy.rangedEvasion) minified.rev = enemy.rangedEvasion;
  if (enemy.magicEvasion) minified.mgev = enemy.magicEvasion;
  if (enemy.meleeHeavyAttackEvasion)
    minified.mhae = enemy.meleeHeavyAttackEvasion;
  if (enemy.rangedHeavyAttackEvasion)
    minified.rhae = enemy.rangedHeavyAttackEvasion;
  if (enemy.magicHeavyAttackEvasion)
    minified.mghae = enemy.magicHeavyAttackEvasion;
  if (enemy.skillDamageResistance) minified.sdr = enemy.skillDamageResistance;
  if (enemy.weakenResistance) minified.wr = enemy.weakenResistance;
  if (enemy.shieldBlockChance) minified.sbc = enemy.shieldBlockChance;
  if (enemy.criticalDamageResistance)
    minified.cdr = enemy.criticalDamageResistance;

  return minified;
}

function expandEnemy(minified: any): Enemy {
  return {
    name: minified.n || "Enemy",
    damageReduction: minified.dr || 0,
    meleeDefense: minified.md || 500,
    rangedDefense: minified.rd || 500,
    magicDefense: minified.mgd || 500,
    meleeEndurance: minified.me || 1000,
    rangedEndurance: minified.re || 1000,
    magicEndurance: minified.mge || 1000,
    meleeEvasion: minified.mev || 0,
    rangedEvasion: minified.rev || 0,
    magicEvasion: minified.mgev || 0,
    meleeHeavyAttackEvasion: minified.mhae || 0,
    rangedHeavyAttackEvasion: minified.rhae || 0,
    magicHeavyAttackEvasion: minified.mghae || 0,
    skillDamageResistance: minified.sdr || 0,
    weakenResistance: minified.wr || 0,
    shieldBlockChance: minified.sbc,
    criticalDamageResistance: minified.cdr,
  };
}

export function serializeState(state: Partial<AppState>): string {
  const minified: any = {};

  // Minify builds array
  if (state.builds && state.builds.length > 0) {
    minified.b = state.builds.map(minifyBuild);
  }

  // Minify enemies array
  if (state.enemies && state.enemies.length > 0) {
    minified.es = state.enemies.map(minifyEnemy);
  }

  // Chart settings (only non-defaults)
  if (state.xAxisStat && state.xAxisStat !== "meleeEndurance")
    minified.x = state.xAxisStat;
  if (
    state.xAxisRange &&
    (state.xAxisRange.min !== 0 ||
      state.xAxisRange.max !== 3000 ||
      state.xAxisRange.step !== 100)
  ) {
    minified.xr = [
      state.xAxisRange.min,
      state.xAxisRange.max,
      state.xAxisRange.step,
    ];
  }
  if (state.yMetric && state.yMetric !== "expectedDamage")
    minified.y = state.yMetric;
  if (state.combatType && state.combatType !== "melee")
    minified.c = state.combatType;
  if (state.attackDirection && state.attackDirection !== "front")
    minified.ad = state.attackDirection;
  if (state.isPvP === false) minified.p = 0; // Default is true, so only store if false

  // Skill config (only non-defaults)
  if (state.skillConfig) {
    const sc: any = {};
    if (state.skillConfig.skillPotency !== 1.0)
      sc.p = state.skillConfig.skillPotency;
    if (state.skillConfig.skillFlatAdd !== 0)
      sc.f = state.skillConfig.skillFlatAdd;
    if (state.skillConfig.hitsPerCast !== 1)
      sc.h = state.skillConfig.hitsPerCast;
    if (state.skillConfig.weakenSkillPotency !== 0)
      sc.wp = state.skillConfig.weakenSkillPotency;
    if (state.skillConfig.weakenSkillFlatAdd !== 0)
      sc.wf = state.skillConfig.weakenSkillFlatAdd;
    if (Object.keys(sc).length > 0) minified.s = sc;
  }

  if (state.activeBuildTab && state.activeBuildTab !== "0")
    minified.t = state.activeBuildTab;
  if (state.activeEnemyTab && state.activeEnemyTab !== "0")
    minified.et = state.activeEnemyTab;

  // Compress and encode
  const json = JSON.stringify(minified);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return compressed;
}

export function deserializeState(hash: string): Partial<AppState> | null {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(hash);
    if (!decompressed) return null;

    const minified = JSON.parse(decompressed);
    const state: Partial<AppState> = {};

    // Expand builds
    if (minified.b && Array.isArray(minified.b)) {
      state.builds = minified.b.map(expandBuild);
    }

    // Expand enemies
    if (minified.es && Array.isArray(minified.es)) {
      state.enemies = minified.es.map(expandEnemy);
    }

    // Chart settings
    if (minified.x) state.xAxisStat = minified.x;
    if (minified.xr && Array.isArray(minified.xr) && minified.xr.length === 3) {
      state.xAxisRange = {
        min: minified.xr[0],
        max: minified.xr[1],
        step: minified.xr[2],
      };
    }
    if (minified.y) state.yMetric = minified.y;
    if (minified.c) state.combatType = minified.c;
    if (minified.ad) state.attackDirection = minified.ad;
    state.isPvP = minified.p !== 0; // If p is 0, it's false. Otherwise true (default)

    // Skill config
    if (minified.s) {
      state.skillConfig = {
        skillPotency: minified.s.p || 1.0,
        skillFlatAdd: minified.s.f || 0,
        hitsPerCast: minified.s.h || 1,
        weakenSkillPotency: minified.s.wp || 0,
        weakenSkillFlatAdd: minified.s.wf || 0,
      };
    }

    if (minified.t) state.activeBuildTab = minified.t;
    if (minified.et) state.activeEnemyTab = minified.et;

    return state;
  } catch (error) {
    console.error("Failed to deserialize state:", error);
    return null;
  }
}
