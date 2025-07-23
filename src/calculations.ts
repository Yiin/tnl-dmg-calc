import { Build, Enemy, DamageBreakdown } from "./types";

/**
 * Throne & Liberty Damage Calculation Implementation
 *
 * Based on the comprehensive formula guide from Reddit:
 * https://www.reddit.com/r/throneandliberty/comments/1k2cgcp/how_does_our_stats_impact_our_skills_a_very_long/
 *
 * Key Formulas:
 * - Hit vs Evasion: Hit% = 1 – (max(0, EVA–HIT) / (max(0,EVA–HIT)+1000))
 * - Crit vs Endurance: if crit > end: pCrit = Δ/(Δ+1000) else pGlance = Δ/(Δ+1000)
 * - Base-DMG: Crit ⇒ maxDMG; Glance ⇒ minDMG; Normal ⇒ U[min,max] uniform roll
 * - Heavy vs Heavy Evade: pHeavy = max(0,heavy – hevade) / (max(0,heavy – hevade)+1000)
 * - Skill Boost vs Resist: if boost > resist: 1 + Δ/(Δ+1000) ; else 1 – Δ/(Δ+1000)
 * - Defense: reduct = DEF/(DEF+2500)
 * - Final hit: (((skillPotency × BaseDMG) + skillFlatAdd) × multipliers × heavyFlag) + bonusDMG – dmgReduction
 */

export function ratingToPercent(rating: number): number {
  return rating / (rating + 1000);
}

export function hitChance(hit: number = 0, evasion: number = 0): number {
  const diff = Math.max(0, evasion - hit);
  return 1 - diff / (diff + 1000);
}

export function critGlanceChances(
  crit: number,
  endurance: number
): { critChance: number; glanceChance: number } {
  if (crit > endurance) {
    const diff = crit - endurance;
    return {
      critChance: diff / (diff + 1000),
      glanceChance: 0,
    };
  } else {
    const diff = endurance - crit;
    return {
      critChance: 0,
      glanceChance: diff / (diff + 1000),
    };
  }
}

// Helper function to get combat type stats based on attack type
export function getCombatTypeStats(
  build: Build,
  enemy: Enemy,
  combatType: "melee" | "ranged" | "magic",
  attackDirection: "front" | "side" | "back" = "front"
) {
  let buildStats = {
    critical:
      combatType === "melee"
        ? build.meleeCritical || 0
        : combatType === "ranged"
        ? build.rangedCritical || 0
        : build.magicCritical || 0,
    hit:
      combatType === "melee"
        ? build.meleeHit || 0
        : combatType === "ranged"
        ? build.rangedHit || 0
        : build.magicHit || 0,
    heavyAttack:
      combatType === "melee"
        ? build.meleeHeavyAttack || 0
        : combatType === "ranged"
        ? build.rangedHeavyAttack || 0
        : build.magicHeavyAttack || 0,
  };

  // Apply positional modifiers based on attack direction
  if (attackDirection === "back") {
    buildStats.critical += build.backCriticalHit || 0;
    buildStats.hit += build.backHitChance || 0;
    buildStats.heavyAttack += build.backHeavyAttackChance || 0;
  } else if (attackDirection === "side") {
    buildStats.critical += build.sideCriticalHit || 0;
    buildStats.hit += build.sideHitChance || 0;
    buildStats.heavyAttack += build.sideHeavyAttackChance || 0;
  }

  const enemyStats = {
    endurance:
      combatType === "melee"
        ? enemy.meleeEndurance || 0
        : combatType === "ranged"
        ? enemy.rangedEndurance || 0
        : enemy.magicEndurance || 0,
    evasion:
      combatType === "melee"
        ? enemy.meleeEvasion || 0
        : combatType === "ranged"
        ? enemy.rangedEvasion || 0
        : enemy.magicEvasion || 0,
    heavyAttackEvasion:
      combatType === "melee"
        ? enemy.meleeHeavyAttackEvasion || 0
        : combatType === "ranged"
        ? enemy.rangedHeavyAttackEvasion || 0
        : enemy.magicHeavyAttackEvasion || 0,
    defense:
      combatType === "melee"
        ? enemy.meleeDefense || 0
        : combatType === "ranged"
        ? enemy.rangedDefense || 0
        : enemy.magicDefense || 0,
  };

  return { buildStats, enemyStats };
}

export function expectedBaseDamage(
  crit: number,
  endurance: number,
  minDMG: number,
  maxDMG: number
): number {
  const { critChance, glanceChance } = critGlanceChances(crit, endurance);
  const normalChance = 1 - critChance - glanceChance;

  // According to the formula table:
  // Crit ⇒ maxDMG; Glance ⇒ minDMG; Normal ⇒ U[min,max] uniform roll (average)
  // Critical damage bonus is applied separately in the final calculation
  const avgDamage = (minDMG + maxDMG) / 2;

  return critChance * maxDMG + glanceChance * minDMG + normalChance * avgDamage;
}

export function expectedOffhandDamage(
  crit: number,
  endurance: number,
  offhandMinDMG: number,
  offhandMaxDMG: number,
  offhandChance: number
): number {
  const { critChance, glanceChance } = critGlanceChances(crit, endurance);
  const normalChance = 1 - critChance - glanceChance;

  // Same base damage logic as main hand - crit bonus applied in final calculation
  const avgDamage = (offhandMinDMG + offhandMaxDMG) / 2;

  const offhandBaseDamage =
    critChance * offhandMaxDMG +
    glanceChance * offhandMinDMG +
    normalChance * avgDamage;

  return offhandBaseDamage * offhandChance;
}

export function heavyChance(
  heavy: number = 0,
  heavyEvasion: number = 0
): number {
  const diff = Math.max(0, heavy - heavyEvasion);
  return diff / (diff + 1000);
}

export function skillMultiplier(
  skillBoost: number = 0,
  skillResist: number = 0
): number {
  const diff = skillBoost - skillResist;
  if (diff > 0) {
    return 1 + diff / (diff + 1000);
  } else {
    return 1 - Math.abs(diff) / (Math.abs(diff) + 1000);
  }
}

export function defenseReduction(defense: number = 0): number {
  return defense / (defense + 2500);
}

export function blockReduction(
  blockChance: number = 0,
  blockPen: number = 0
): number {
  const effectiveBlock = Math.max(0, blockChance - blockPen);
  return effectiveBlock * 0.4; // 40% damage reduction on block
}

export function speciesDamageMultiplier(speciesBoost: number = 0): number {
  // Species Damage Boost / (Species Damage Boost + 1000)
  return speciesBoost / (speciesBoost + 1000);
}

export function criticalDamageMultiplier(
  critDamage: number = 0,
  critResist: number = 0
): number {
  // Critical Damage - Critical Damage Resistance, minimum 0
  const netCritDamage = Math.max(0, critDamage - critResist);
  return netCritDamage / 100; // Convert percentage to decimal
}

export function pveDamageMultiplier(pveBonus: number = 0): number {
  return pveBonus / 100; // Convert percentage to decimal
}

export function pvpDamageMultiplier(): number {
  return -0.1; // 10% damage reduction in PVP
}

export function calculateDamage(
  build: Build,
  enemy: Enemy,
  combatType: "melee" | "ranged" | "magic" = "melee",
  attackDirection: "front" | "side" | "back" = "front",
  isPVP: boolean = true
): DamageBreakdown {
  const { buildStats, enemyStats } = getCombatTypeStats(
    build,
    enemy,
    combatType,
    attackDirection
  );

  // Step 1: Calculate base damage (crit/glance/normal expected value)
  const mainHandBaseDamage = expectedBaseDamage(
    buildStats.critical,
    enemyStats.endurance,
    build.minDMG,
    build.maxDMG
  );

  // Off-hand damage (if dual-wielding) - calculated separately and multiplied by proc chance
  const offhandDamage =
    build.offhandMinDMG && build.offhandMaxDMG && build.offhandChance
      ? expectedOffhandDamage(
          buildStats.critical,
          enemyStats.endurance,
          build.offhandMinDMG,
          build.offhandMaxDMG,
          build.offhandChance
        )
      : 0;

  // Total base damage
  const baseDamageRaw = mainHandBaseDamage + offhandDamage;

  // Step 2: Apply Reddit Formula Structure
  // ((((Skill Potency * Base Damage) + Skill Damage) * [Multipliers]) * Heavy Attack) + Bonus Damage - Damage Reduction

  // 2a: (Skill Potency * Base Damage) + Skill Damage
  const skillPotencyMult = build.skillPotency || 1.0;
  const coreSkillDamage =
    skillPotencyMult * baseDamageRaw + (build.skillFlatAdd || 0);

  // 2b: Calculate all multipliers according to Reddit post
  const defReduction = defenseReduction(enemyStats.defense);
  const defenseMultiplier = 1 - defReduction;

  // Block multiplier (Shield Block Chance)
  const blockMult =
    1 -
    blockReduction(
      enemy.shieldBlockChance || 0,
      build.shieldBlockPenetrationChance || 0
    );

  // Critical Damage multiplier (expected value)
  const { critChance, glanceChance } = critGlanceChances(
    buildStats.critical,
    enemyStats.endurance
  );
  const critDamageMult = criticalDamageMultiplier(
    build.criticalDamage || 0,
    enemy.criticalDamageResistance || 0
  );
  const expectedCritMultiplier = 1 + critChance * critDamageMult;

  // Skill Damage Boost multiplier
  const skillBoostMult = skillMultiplier(
    build.skillDamageBoost || 0,
    enemy.skillDamageResistance || 0
  );

  // Species Damage Boost multiplier (PVE only)
  const speciesBoostMult = isPVP
    ? 1
    : 1 + speciesDamageMultiplier(build.speciesDamageBoost || 0);

  // PVE/PVP multiplier
  const pvpPveMultiplier = isPVP
    ? 1 + pvpDamageMultiplier()
    : 1 + pveDamageMultiplier(build.pveDamageMultiplier || 0);

  // 2c: Apply all multipliers: Defense% * Block% * Critical Damage% * Skill Damage Boost% * Species Damage Boost% * PVE% (or PVP%)
  const allMultipliers =
    defenseMultiplier *
    blockMult *
    expectedCritMultiplier *
    skillBoostMult *
    speciesBoostMult *
    pvpPveMultiplier;
  const afterMultipliers = coreSkillDamage * allMultipliers;

  // 2d: Apply Heavy Attack multiplier (heavyFlag = 2 if heavy triggers, 1 otherwise)
  const heavyProb = heavyChance(
    buildStats.heavyAttack,
    enemyStats.heavyAttackEvasion
  );
  const expectedHeavyMultiplier = heavyProb * 2 + (1 - heavyProb) * 1;
  const afterHeavyMult = afterMultipliers * expectedHeavyMultiplier;

  // 2e: Add Bonus Damage
  const afterBonusDamage = afterHeavyMult + (build.bonusDamage || 0);

  // 2f: Subtract Damage Reduction
  const finalDamage = Math.max(
    0,
    afterBonusDamage - (enemy.damageReduction || 0)
  );

  // Step 3: Apply hit chance to get expected damage
  const hitProb = hitChance(buildStats.hit, enemyStats.evasion);

  // Step 4: Multiply by hits per cast
  const expectedDamage = hitProb * (build.hitsPerCast || 1) * finalDamage;

  const normalChance = 1 - critChance - glanceChance;

  return {
    baseDamage: baseDamageRaw,
    critChance,
    glanceChance,
    normalChance,
    hitChance: hitProb,
    heavyChance: heavyProb,
    skillMultiplier: skillBoostMult,
    defenseReduction: defReduction,
    finalDamage,
    expectedDamage,
  };
}

export function calculateDPS(
  build: Build,
  enemy: Enemy,
  combatType: "melee" | "ranged" | "magic" = "melee",
  attackDirection: "front" | "side" | "back" = "front",
  cooldownTime: number = 1,
  castTime: number = 1,
  isPVP: boolean = true
): number {
  const damage = calculateDamage(build, enemy, combatType, attackDirection, isPVP);
  const effectiveCooldown = Math.max(cooldownTime, castTime);
  return damage.expectedDamage / effectiveCooldown;
}
