import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Build, Enemy } from "../types";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import { oneDark as theme } from "react-syntax-highlighter/dist/esm/styles/prism";

// Register only the language we need
SyntaxHighlighter.registerLanguage("javascript", javascript);

interface DamageFormulaProps {
  build: Build;
  enemy: Enemy;
  combatType: "melee" | "ranged" | "magic";
  attackDirection: "front" | "side" | "back";
  isPvP?: boolean;
  skillPotency?: number;
  skillFlatAdd?: number;
  hitsPerCast?: number;
  weakenSkillPotency?: number;
  weakenSkillFlatAdd?: number;
  cooldownTime?: number;
  castTime?: number;
  skillCooldownSpecialization?: number;
}

export function DamageFormula({
  build,
  enemy,
  combatType,
  attackDirection,
  isPvP = true,
  skillPotency = 1.0,
  skillFlatAdd = 0,
  hitsPerCast = 1,
  weakenSkillPotency = 0,
  weakenSkillFlatAdd = 0,
  cooldownTime = 10,
  castTime = 1,
  skillCooldownSpecialization = 0,
}: DamageFormulaProps) {
  // Get the relevant stats based on combat type
  function getCombatStats() {
    const prefix = combatType;
    return {
      critical: (build[`${prefix}Critical` as keyof Build] as number) || 0,
      endurance: (enemy[`${prefix}Endurance` as keyof Enemy] as number) || 0,
      hit: (build[`${prefix}Hit` as keyof Build] as number) || 0,
      evasion: (enemy[`${prefix}Evasion` as keyof Enemy] as number) || 0,
      heavyAttack:
        (build[`${prefix}HeavyAttack` as keyof Build] as number) || 0,
      heavyEvasion:
        (enemy[`${prefix}HeavyAttackEvasion` as keyof Enemy] as number) || 0,
      defense: (enemy[`${prefix}Defense` as keyof Enemy] as number) || 0,
    };
  }

  const stats = getCombatStats();

  // Apply positional modifiers
  let criticalMod = 0;
  let hitMod = 0;
  let heavyMod = 0;

  if (attackDirection === "back") {
    criticalMod = build.backCriticalHit || 0;
    hitMod = build.backHitChance || 0;
    heavyMod = build.backHeavyAttackChance || 0;
  } else if (attackDirection === "side") {
    criticalMod = build.sideCriticalHit || 0;
    hitMod = build.sideHitChance || 0;
    heavyMod = build.sideHeavyAttackChance || 0;
  }

  const totalCrit = stats.critical + criticalMod;
  const totalHit = stats.hit + hitMod;
  const totalHeavy = stats.heavyAttack + heavyMod;

  // Calculate key values
  const avgWeaponDmg = ((build.minDMG + build.maxDMG) / 2).toFixed(1);

  // Calculate crit/glance based on conditional formula
  let critChance = 0;
  let glanceChance = 0;

  if (totalCrit > stats.endurance) {
    const diff = totalCrit - stats.endurance;
    critChance = diff / (diff + 1000);
  } else {
    const diff = stats.endurance - totalCrit;
    glanceChance = diff / (diff + 1000);
  }

  const hitDiff = Math.max(0, stats.evasion - totalHit);
  const hitChance = 1 - hitDiff / (hitDiff + 1000);
  const heavyDiff = Math.max(0, totalHeavy - stats.heavyEvasion);
  const heavyChanceVal = heavyDiff / (heavyDiff + 1000);
  const defenseReduction = 1 - stats.defense / (stats.defense + 2500);
  // Calculate skill damage boost using the standard formula
  const skillBoostDiff = (build.skillDamageBoost || 0) - (enemy.skillDamageResistance || 0);
  const skillDamageBoost = skillBoostDiff > 0 
    ? 1 + skillBoostDiff / (skillBoostDiff + 1000)
    : 1 - Math.abs(skillBoostDiff) / (Math.abs(skillBoostDiff) + 1000);

  // Calculate weaken chance
  const weakenDiff = Math.max(
    0,
    (build.weakenChance || 0) - (enemy.weakenResistance || 0)
  );
  const weakenChance = weakenDiff / (weakenDiff + 250);

  // Calculate effective skill values
  const effectiveSkillPotency =
    skillPotency + weakenChance * weakenSkillPotency;
  const effectiveSkillFlatAdd =
    skillFlatAdd + weakenChance * weakenSkillFlatAdd;

  // Calculate expected base damage with crit damage
  const critDamageBonus =
    ((build.criticalDamage || 0) - (enemy.criticalDamageResistance || 0)) / 100;
  const mainHandBaseDamage =
    critChance * build.maxDMG * (1 + critDamageBonus) +
    glanceChance * build.minDMG +
    (1 - critChance - glanceChance) * parseFloat(avgWeaponDmg);
  
  // Off-hand damage (included in base damage before multipliers)
  const offhandBaseDamage = build.offhandChance && build.offhandChance > 0
    ? (critChance * (build.offhandMaxDMG || 0) * (1 + critDamageBonus) +
       glanceChance * (build.offhandMinDMG || 0) +
       (1 - critChance - glanceChance) * ((build.offhandMinDMG || 0) + (build.offhandMaxDMG || 0)) / 2) * build.offhandChance
    : 0;
  
  const expectedBaseDamage = mainHandBaseDamage + offhandBaseDamage;

  // Calculate final damage values
  const expectedHeavyMultiplier = heavyChanceVal * 2 + (1 - heavyChanceVal) * 1;
  const pvpMultiplier = isPvP ? 0.9 : 1.0;
  
  // Core skill damage with weaken
  const coreSkillDamage = effectiveSkillPotency * expectedBaseDamage + effectiveSkillFlatAdd;
  
  // Calculate block reduction
  const blockChance = Math.max(0, (enemy.shieldBlockChance || 0) - (build.shieldBlockPenetrationChance || 0));
  const blockMultiplier = 1 - (blockChance * 0.4); // 40% damage reduction on block
  
  // Calculate species damage boost (PvE only)
  const speciesMultiplier = isPvP ? 1 : 1 + (build.speciesDamageBoost || 0) / ((build.speciesDamageBoost || 0) + 1000);
  
  // All multipliers combined
  const allMultipliers = defenseReduction * blockMultiplier * skillDamageBoost * speciesMultiplier * pvpMultiplier;
  
  // Final damage before bonus/reduction
  const damageBeforeBonus = coreSkillDamage * allMultipliers * expectedHeavyMultiplier;
  
  // Final damage
  const damage = damageBeforeBonus + (build.bonusDamage || 0) - (enemy.damageReduction || 0);
  
  // Expected damage per cast
  const expectedDamage = damage * hitChance * hitsPerCast;

  // Calculate actual cast time with attack speed
  let actualCastTime = castTime;
  if (build.attackSpeedTime && build.attackSpeedTime > 0) {
    actualCastTime = castTime * build.attackSpeedTime;
  }
  
  // Calculate actual cooldown with cooldown speed
  const adjustedCooldown = cooldownTime - skillCooldownSpecialization;
  const cooldownReduction = build.cooldownSpeed 
    ? build.cooldownSpeed / (build.cooldownSpeed + 100)
    : 0;
  const actualCooldown = adjustedCooldown * (1 - cooldownReduction);
  
  // Calculate DPS based on skill type
  // For skills with cooldowns: cast time + cooldown (cooldown starts AFTER cast)
  // For spammable abilities: just cast time
  const effectiveCooldown = cooldownTime > 0 
    ? actualCastTime + actualCooldown  // Cooldown starts after cast completes
    : actualCastTime;                   // No cooldown, can cast immediately after
  const dps = expectedDamage / effectiveCooldown;

  const formula = `// Throne & Liberty Damage Formula
// ${combatType} combat, ${attackDirection} attack, ${isPvP ? "PvP" : "PvE"}

//========================================
// SUMMARY
//========================================
Damage per Hit: ${damage.toFixed(1)}
Expected Damage per Cast: ${expectedDamage.toFixed(1)}
DPS: ${dps.toFixed(1)}

Key Chances:
- Hit Chance: ${(hitChance * 100).toFixed(1)}%
- Crit Chance: ${(critChance * 100).toFixed(1)}%
- Heavy Attack: ${(heavyChanceVal * 100).toFixed(1)}%${(build.weakenChance || 0) > 0 ? `
- Weaken Chance: ${(weakenChance * 100).toFixed(1)}%` : ''}

Timing:
- Base Cast Time: ${castTime}s${build.attackSpeedTime ? ` → ${actualCastTime.toFixed(2)}s (with attack speed)` : ''}
- Base Cooldown: ${cooldownTime}s${build.cooldownSpeed ? ` → ${actualCooldown.toFixed(2)}s (with cooldown speed)` : ''}
- Effective Cooldown: ${effectiveCooldown.toFixed(2)}s

//========================================
// BASE DAMAGE CALCULATION
//========================================
// Weapon damage range
MinDamage = ${build.minDMG}
MaxDamage = ${build.maxDMG}
AvgWeaponDamage = (MinDamage + MaxDamage) / 2 = (${build.minDMG} + ${build.maxDMG}) / 2 = ${avgWeaponDmg}

// Critical damage modifier
CritDamageBonus = PlayerCritDamage - EnemyCritResistance
                = ${build.criticalDamage || 0}% - ${enemy.criticalDamageResistance || 0}% = ${(build.criticalDamage || 0) - (enemy.criticalDamageResistance || 0)}%

// Expected damage accounting for crit/glance/normal hits
MainHandBaseDamage = (CritChance × MaxDamage × CritMultiplier) +
                    (GlanceChance × MinDamage) + 
                    (NormalChance × AvgDamage)
                   = (${critChance.toFixed(3)} × ${build.maxDMG} × ${(1 + critDamageBonus).toFixed(2)}) +
                     (${glanceChance.toFixed(3)} × ${build.minDMG}) + 
                     (${(1 - critChance - glanceChance).toFixed(3)} × ${avgWeaponDmg})
                   = ${mainHandBaseDamage.toFixed(1)}${build.offhandChance && build.offhandChance > 0 ? `

// Off-hand damage calculation (uses same crit/glance logic)
OffhandBaseDamage = [(CritChance × OffhandMaxDamage × CritMultiplier) +
                     (GlanceChance × OffhandMinDamage) + 
                     (NormalChance × OffhandAvgDamage)] × OffhandChance
                  = [(${critChance.toFixed(3)} × ${build.offhandMaxDMG || 0} × ${(1 + critDamageBonus).toFixed(2)}) +
                     (${glanceChance.toFixed(3)} × ${build.offhandMinDMG || 0}) + 
                     (${(1 - critChance - glanceChance).toFixed(3)} × ${((build.offhandMinDMG || 0) + (build.offhandMaxDMG || 0)) / 2})] × ${build.offhandChance}
                  = ${offhandBaseDamage.toFixed(1)}` : ''}

// Total expected base damage (main hand + off-hand)
ExpectedBaseDamage = MainHandBaseDamage${build.offhandChance && build.offhandChance > 0 ? ' + OffhandBaseDamage' : ''}
                   = ${mainHandBaseDamage.toFixed(1)}${build.offhandChance && build.offhandChance > 0 ? ` + ${offhandBaseDamage.toFixed(1)}` : ''}
                   = ${expectedBaseDamage.toFixed(1)}

//========================================
// COMBAT CHANCES
//========================================
${
  totalCrit > stats.endurance
    ? `// Critical > Endurance: Critical hits possible
CritChance = (Crit - Endurance) / ((Crit - Endurance) + 1000)
           = (${totalCrit} - ${stats.endurance}) / ((${totalCrit} - ${stats.endurance}) + 1000)
           = ${totalCrit - stats.endurance} / ${totalCrit - stats.endurance + 1000} = ${critChance.toFixed(3)}
GlanceChance = 0.000 (no glancing when crit > endurance)`
    : `// Critical ≤ Endurance: Glancing blows possible
CritChance = 0.000 (no crits when crit ≤ endurance)
GlanceChance = (Endurance - Crit) / ((Endurance - Crit) + 1000)
             = (${stats.endurance} - ${totalCrit}) / ((${stats.endurance} - ${totalCrit}) + 1000)
             = ${stats.endurance - totalCrit} / ${stats.endurance - totalCrit + 1000} = ${glanceChance.toFixed(3)}`
}

// Hit vs Evasion
// Formula: HitChance = 1 - ((Evasion - Hit) / ((Evasion - Hit) + 1000))
HitChance = 1 - (max(0, Evasion - Hit) / (max(0, Evasion - Hit) + 1000))
          = 1 - (max(0, ${stats.evasion} - ${totalHit}${hitMod > 0 ? ` [base:${stats.hit} + ${attackDirection}:${hitMod}]` : ""}) / (max(0, ${stats.evasion} - ${totalHit}) + 1000))
          = 1 - (${hitDiff} / ${hitDiff + 1000}) = ${hitChance.toFixed(3)}

// Heavy Attack vs Heavy Evasion  
// Formula: HeavyChance = max(0, HeavyAttack - HeavyEvasion) / (max(0, HeavyAttack - HeavyEvasion) + 1000)
HeavyChance = (HeavyAttack - HeavyEvasion) / ((HeavyAttack - HeavyEvasion) + 1000)
            = (${totalHeavy}${heavyMod > 0 ? ` [base:${stats.heavyAttack} + ${attackDirection}:${heavyMod}]` : ""} - ${stats.heavyEvasion}) / ((${totalHeavy} - ${stats.heavyEvasion}) + 1000)
            = ${heavyDiff} / ${heavyDiff + 1000} = ${heavyChanceVal.toFixed(3)}

// Heavy attacks deal 2x damage
ExpectedHeavyMultiplier = (HeavyChance × 2) + ((1 - HeavyChance) × 1)
                        = (${heavyChanceVal.toFixed(3)} × 2) + (${(1 - heavyChanceVal).toFixed(3)} × 1) = ${expectedHeavyMultiplier.toFixed(3)}

//========================================
// SKILL CALCULATION
//========================================
SkillPotency = ${skillPotency}
SkillFlatAdd = ${skillFlatAdd}
${(build.weakenChance || 0) > 0 ? `
//--- Weaken Effect ---
// Weaken uses 250 divisor (4x more effective than crit/hit formulas)
WeakenChance = (PlayerWeaken - EnemyWeakenResist) / ((PlayerWeaken - EnemyWeakenResist) + 250)
             = (${build.weakenChance || 0} - ${enemy.weakenResistance || 0}) / ((${build.weakenChance || 0} - ${enemy.weakenResistance || 0}) + 250)
             = ${weakenDiff} / ${weakenDiff + 250} = ${weakenChance.toFixed(3)}

// Bonus damage when target is weakened
WeakenSkillPotency = ${weakenSkillPotency} (extra skill potency)
WeakenSkillFlatAdd = ${weakenSkillFlatAdd} (extra flat damage)

// Applied as expected values (probability × bonus)
EffectiveSkillPotency = BaseSkillPotency + (WeakenChance × WeakenSkillPotency)
                      = ${skillPotency} + (${weakenChance.toFixed(3)} × ${weakenSkillPotency}) = ${effectiveSkillPotency.toFixed(3)}
EffectiveSkillFlatAdd = BaseSkillFlatAdd + (WeakenChance × WeakenSkillFlatAdd)
                      = ${skillFlatAdd} + (${weakenChance.toFixed(3)} × ${weakenSkillFlatAdd}) = ${effectiveSkillFlatAdd.toFixed(1)}
` : ""}

// Core Skill Damage
CoreSkillDamage = (${(build.weakenChance || 0) > 0 ? 'EffectiveSkillPotency' : 'SkillPotency'} × ExpectedBaseDamage) + ${(build.weakenChance || 0) > 0 ? 'EffectiveSkillFlatAdd' : 'SkillFlatAdd'}
                = (${effectiveSkillPotency.toFixed(3)} × ${expectedBaseDamage.toFixed(1)}) + ${effectiveSkillFlatAdd.toFixed(1)}
                = ${coreSkillDamage.toFixed(1)}
//========================================
// MULTIPLIERS
//========================================
// Defense reduces damage based on defense rating
DefenseMultiplier = 1 - (EnemyDefense / (EnemyDefense + 2500))
                  = 1 - (${stats.defense} / (${stats.defense} + 2500))
                  = 1 - ${(stats.defense / (stats.defense + 2500)).toFixed(3)} = ${defenseReduction.toFixed(3)}

// Skill damage boost vs skill damage resistance
${skillBoostDiff > 0 
  ? `// Skill Boost > Skill Resist: Damage increase
SkillDamageMultiplier = 1 + ((SkillBoost - SkillResist) / ((SkillBoost - SkillResist) + 1000))
                      = 1 + ((${build.skillDamageBoost || 0} - ${enemy.skillDamageResistance || 0}) / ((${build.skillDamageBoost || 0} - ${enemy.skillDamageResistance || 0}) + 1000))
                      = 1 + (${skillBoostDiff} / ${skillBoostDiff + 1000}) = ${skillDamageBoost.toFixed(3)}`
  : `// Skill Boost ≤ Skill Resist: Damage decrease
SkillDamageMultiplier = 1 - ((SkillResist - SkillBoost) / ((SkillResist - SkillBoost) + 1000))
                      = 1 - ((${enemy.skillDamageResistance || 0} - ${build.skillDamageBoost || 0}) / ((${enemy.skillDamageResistance || 0} - ${build.skillDamageBoost || 0}) + 1000))
                      = 1 - (${Math.abs(skillBoostDiff)} / ${Math.abs(skillBoostDiff) + 1000}) = ${skillDamageBoost.toFixed(3)}`}

// Shield Block Chance (reduces damage by 40% when blocked)
BlockChance = max(0, EnemyBlockChance - PlayerBlockPenetration)
            = max(0, ${enemy.shieldBlockChance || 0} - ${build.shieldBlockPenetrationChance || 0}) = ${blockChance.toFixed(3)}
BlockMultiplier = 1 - (BlockChance × 0.4)
                = 1 - (${blockChance.toFixed(3)} × 0.4) = ${blockMultiplier.toFixed(3)}

${!isPvP ? `// Species Damage Boost (PvE only)
SpeciesMultiplier = 1 + (SpeciesDamageBoost / (SpeciesDamageBoost + 1000))
                  = 1 + (${build.speciesDamageBoost || 0} / (${build.speciesDamageBoost || 0} + 1000))
                  = 1 + ${((build.speciesDamageBoost || 0) / ((build.speciesDamageBoost || 0) + 1000)).toFixed(3)} = ${speciesMultiplier.toFixed(3)}

` : ''}// PvP/PvE damage modifier
${isPvP ? `PvPMultiplier = 1 - 0.1 = ${pvpMultiplier.toFixed(1)} (10% damage reduction in PvP)` : `PvEMultiplier = 1 + (PvEDamageBoost / 100)
              = 1 + (${build.pveDamageMultiplier || 0} / 100) = ${(1 + (build.pveDamageMultiplier || 0) / 100).toFixed(3)}`}

// Combined multipliers for efficiency
AllMultipliers = DefenseMultiplier × BlockMultiplier × SkillDamageMultiplier${!isPvP ? ' × SpeciesMultiplier' : ''} × ${isPvP ? 'PvPMultiplier' : 'PvEMultiplier'}
               = ${defenseReduction.toFixed(3)} × ${blockMultiplier.toFixed(3)} × ${skillDamageBoost.toFixed(3)}${!isPvP ? ` × ${speciesMultiplier.toFixed(3)}` : ''} × ${pvpMultiplier.toFixed(1)}
               = ${allMultipliers.toFixed(3)}

// Flat modifiers (applied after multipliers)
BonusDamage = ${build.bonusDamage || 0} (added after all multipliers)
DamageReduction = ${enemy.damageReduction || 0} (subtracted at the end)

//========================================
// FINAL DAMAGE FORMULA
//========================================
// Step 1: Apply multipliers and heavy attack
DamageBeforeBonus = CoreSkillDamage × AllMultipliers × ExpectedHeavyMultiplier
                  = ${coreSkillDamage.toFixed(1)} × ${allMultipliers.toFixed(3)} × ${expectedHeavyMultiplier.toFixed(3)}
                  = ${damageBeforeBonus.toFixed(1)}

// Step 2: Add bonus damage and subtract damage reduction
Damage = DamageBeforeBonus + BonusDamage - DamageReduction
       = ${damageBeforeBonus.toFixed(1)} + ${build.bonusDamage || 0} - ${enemy.damageReduction || 0}
       = ${damage.toFixed(1)}

// Step 3: Apply hit chance and hits per cast
ExpectedDamage = Damage × HitChance × HitsPerCast
               = ${damage.toFixed(1)} × ${hitChance.toFixed(3)} × ${hitsPerCast}
               = ${expectedDamage.toFixed(1)}

//========================================
// ATTACK SPEED & COOLDOWN CALCULATIONS
//========================================
${build.attackSpeedTime ? `// Attack Speed modifies cast time
// Attack speed time represents the actual attack interval
PlayerAttackSpeed = ${build.attackSpeedTime}s (time between attacks)

// Cast time scales proportionally with attack speed
ActualCastTime = BaseCastTime × AttackSpeedTime
               = ${castTime}s × ${build.attackSpeedTime}
               = ${actualCastTime.toFixed(2)}s
` : '// No attack speed modifier - using base cast time\n'}
${build.cooldownSpeed ? `// Cooldown Speed reduces cooldown with diminishing returns
// Formula: (BaseCooldown - Specialization) × (1 - (CooldownSpeed / (CooldownSpeed + 100)))
AdjustedCooldown = BaseCooldown - Specialization
                 = ${cooldownTime}s - ${skillCooldownSpecialization}s = ${adjustedCooldown}s

CooldownReduction = CooldownSpeed / (CooldownSpeed + 100)
                  = ${build.cooldownSpeed} / (${build.cooldownSpeed} + 100)
                  = ${build.cooldownSpeed} / ${build.cooldownSpeed + 100} = ${cooldownReduction.toFixed(3)}

ActualCooldown = AdjustedCooldown × (1 - CooldownReduction)
               = ${adjustedCooldown}s × (1 - ${cooldownReduction.toFixed(3)})
               = ${adjustedCooldown}s × ${(1 - cooldownReduction).toFixed(3)}
               = ${actualCooldown.toFixed(2)}s
` : '// No cooldown speed modifier - using base cooldown\n'}
//========================================
// DPS CALCULATION
//========================================
${cooldownTime > 0 ? `// Skill with cooldown: cooldown starts AFTER cast completes
EffectiveCooldown = ActualCastTime + ActualCooldown
                  = ${actualCastTime.toFixed(2)}s + ${actualCooldown.toFixed(2)}s
                  = ${effectiveCooldown.toFixed(2)}s` : `// Spammable ability: no cooldown
EffectiveCooldown = ActualCastTime
                  = ${actualCastTime.toFixed(2)}s`}

DPS = ExpectedDamage / EffectiveCooldown
    = ${expectedDamage.toFixed(1)} / ${effectiveCooldown.toFixed(2)}
    = ${dps.toFixed(1)} damage per second`;

  // Custom theme based on the original colors
  const customStyle = {
    ...theme,
    'code[class*="language-"]': {
      ...theme['code[class*="language-"]'],
      fontSize: "0.75rem",
      fontFamily:
        'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
      background: "transparent",
    },
    'pre[class*="language-"]': {
      ...theme['pre[class*="language-"]'],
      fontSize: "0.75rem",
      fontFamily:
        'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
      background: "transparent",
      margin: 0,
      padding: 0,
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Damage Calculation Formula</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            language="javascript"
            style={customStyle}
            showLineNumbers={false}
            wrapLines={true}
            customStyle={{
              background: "transparent",
              padding: 0,
            }}
          >
            {formula}
          </SyntaxHighlighter>
        </div>
      </CardContent>
    </Card>
  );
}
