// Combat type variants for T&L stat system
export interface CombatStats {
  melee?: number;
  ranged?: number;
  magic?: number;
}

export interface Build {
  name: string;

  // Weapon damage
  minDMG: number;
  maxDMG: number;
  offhandMinDMG?: number;
  offhandMaxDMG?: number;
  offhandChance?: number; // percentage as decimal (0.5 = 50%)

  bonusDamage?: number;

  // Critical stats (melee/ranged/magic variants)
  meleeCritical?: number;
  rangedCritical?: number;
  magicCritical?: number;
  criticalDamage?: number; // percentage

  // Heavy Attack stats
  meleeHeavyAttack?: number;
  rangedHeavyAttack?: number;
  magicHeavyAttack?: number;

  // Hit stats
  meleeHit?: number;
  rangedHit?: number;
  magicHit?: number;

  // Skill stats
  skillDamageBoost?: number;

  // Attack Speed
  attackSpeedPercent?: number; // percentage increase (e.g., 63 for 63%)
  attackSpeedTime?: number; // actual attack interval in seconds (e.g., 0.36)

  // Cooldown Speed
  cooldownSpeed?: number; // cooldown speed stat (e.g., 40.9)
  cooldownSpeedPercent?: number; // actual cooldown reduction percentage (e.g., 29.0)

  // PvE
  speciesDamageBoost?: number;
  pveDamageMultiplier?: number;

  // Block stats
  shieldBlockChance?: number;
  shieldBlockPenetrationChance?: number;

  // Positional stats
  frontEvasion?: number;
  sideHeavyAttackEvasion?: number;
  backHitChance?: number;
  sideHitChance?: number;
  backHeavyAttackChance?: number;
  sideHeavyAttackChance?: number;
  backCriticalHit?: number;
  sideCriticalHit?: number;

  // Defense stats (for importing from text that contains enemy stats)
  meleeDefense?: number;
  rangedDefense?: number;
  magicDefense?: number;

  // Endurance stats
  meleeEndurance?: number;
  rangedEndurance?: number;
  magicEndurance?: number;

  // Evasion stats
  meleeEvasion?: number;
  rangedEvasion?: number;
  magicEvasion?: number;

  // Heavy Attack Evasion stats
  meleeHeavyAttackEvasion?: number;
  rangedHeavyAttackEvasion?: number;
  magicHeavyAttackEvasion?: number;

  // Resistance stats
  damageReduction?: number;
  skillDamageResistance?: number;

  // Status effect chances
  weakenChance?: number;
}

export interface Enemy {
  name: string;

  // Damage Reduction
  damageReduction?: number;
  bossDamageReduction?: number;

  // Defense (melee/ranged/magic)
  meleeDefense?: number;
  rangedDefense?: number;
  magicDefense?: number;

  // Evasion (melee/ranged/magic)
  meleeEvasion?: number;
  rangedEvasion?: number;
  magicEvasion?: number;

  // Endurance (melee/ranged/magic)
  meleeEndurance?: number;
  rangedEndurance?: number;
  magicEndurance?: number;

  // Heavy Attack Evasion (melee/ranged/magic)
  meleeHeavyAttackEvasion?: number;
  rangedHeavyAttackEvasion?: number;
  magicHeavyAttackEvasion?: number;

  // PvP variants
  pvpMeleeEndurance?: number;
  pvpRangedEndurance?: number;
  pvpMagicEndurance?: number;
  pvpMeleeEvasion?: number;
  pvpRangedEvasion?: number;
  pvpMagicEvasion?: number;
  pvpMeleeHeavyAttackEvasion?: number;
  pvpRangedHeavyAttackEvasion?: number;
  pvpMagicHeavyAttackEvasion?: number;

  // Boss variants
  bossMeleeEndurance?: number;
  bossRangedEndurance?: number;
  bossMagicEndurance?: number;
  bossMeleeEvasion?: number;
  bossRangedEvasion?: number;
  bossMagicEvasion?: number;
  bossMeleeHeavyAttackEvasion?: number;
  bossRangedHeavyAttackEvasion?: number;
  bossMagicHeavyAttackEvasion?: number;

  // Resistances
  skillDamageResistance?: number;
  criticalDamageResistance?: number; // percentage
  shieldBlockChance?: number;
  weakenResistance?: number;
  stunResistance?: number;
  petrificationResistance?: number;
  sleepResistance?: number;
  silenceResistance?: number;
  fearResistance?: number;
  bindResistance?: number;
  collisionResistance?: number;

  // Crowd Control Chances
  stunChance?: number;
  fearChance?: number;
  bindChance?: number;
  petrificationChance?: number;
  sleepChance?: number;
  collisionChance?: number;
  silenceChance?: number;
  weakenChance?: number;
}

export interface DamageBreakdown {
  baseDamage: number;
  critChance: number;
  glanceChance: number;
  normalChance: number;
  hitChance: number;
  heavyChance: number;
  weakenChance: number;
  skillMultiplier: number;
  defenseReduction: number;
  finalDamage: number;
  expectedDamage: number;
}

export type StatKey = keyof (Build & Enemy);

export interface ChartPoint {
  x: number;
  [key: string]: number; // For multiple build lines
}
