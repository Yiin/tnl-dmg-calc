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
  
  // Attack stats
  attackSpeed?: number;
  attackSpeedPercent?: number;
  range?: number;
  rangePercent?: number;
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
  skillPotency?: number; // percentage as decimal (3.0 = 300%)
  skillFlatAdd?: number;
  hitsPerCast?: number;
  skillDamageBoost?: number;
  cooldownSpeed?: number;
  
  // Attributes
  strength?: number;
  dexterity?: number;
  wisdom?: number;
  perception?: number;
  fortitude?: number;
  
  // Resources
  maxHealth?: number;
  healthRegen?: number;
  maxMana?: number;
  manaRegen?: number;
  manaCostEfficiency?: number;
  
  // Movement
  movementSpeed?: number;
  maxStamina?: number;
  staminaRegen?: number;
  
  // Buffs/Debuffs
  healingReceived?: number;
  buffDuration?: number;
  debuffDuration?: number;
  
  // Species/PvE/PvP bonuses
  speciesDamageBoost?: number;
  pveDamageMultiplier?: number; // percentage
  pvpDamageMultiplier?: number; // percentage
  weaponDamage?: number;
  potionHealing?: number;
  amitoiHealing?: number;
  ccChance?: number;
  
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