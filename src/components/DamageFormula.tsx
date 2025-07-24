import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Build, Enemy } from "../types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark as theme } from "react-syntax-highlighter/dist/esm/styles/prism";

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

  const hitChance = totalHit / (totalHit + stats.evasion + 1000);
  const heavyChanceVal = totalHeavy / (totalHeavy + stats.heavyEvasion + 1000);
  const defenseReduction = 1 - stats.defense / (stats.defense + 2500);
  const skillDamageBoost = 1 + (build.skillDamageBoost || 0) / 100;

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
  const expectedBaseDamage =
    critChance * build.maxDMG * (1 + critDamageBonus) +
    glanceChance * build.minDMG +
    (1 - critChance - glanceChance) * parseFloat(avgWeaponDmg);

  // Calculate final damage values
  const expectedHeavyMultiplier = heavyChanceVal * 2 + (1 - heavyChanceVal) * 1;
  const pvpMultiplier = isPvP ? 0.9 : 1.0;
  
  // Core skill damage with weaken
  const coreSkillDamage = effectiveSkillPotency * expectedBaseDamage + effectiveSkillFlatAdd;
  
  // All multipliers combined
  const allMultipliers = defenseReduction * skillDamageBoost * pvpMultiplier;
  
  // Final damage before bonus/reduction
  const damageBeforeBonus = coreSkillDamage * allMultipliers * expectedHeavyMultiplier;
  
  // Final damage
  const damage = damageBeforeBonus + (build.bonusDamage || 0) - (enemy.damageReduction || 0);
  
  // Expected damage per cast
  const expectedDamage = damage * hitChance * hitsPerCast;
  
  // Off-hand calculations
  const offhandAvgDamage = build.offhandChance && build.offhandChance > 0
    ? ((build.offhandMinDMG || 0) + (build.offhandMaxDMG || 0)) / 2 * build.offhandChance
    : 0;
  const offhandFinalDamage = offhandAvgDamage * allMultipliers * expectedHeavyMultiplier;
  const totalExpectedDamage = expectedDamage + offhandFinalDamage * hitChance * hitsPerCast;

  const formula = `// Throne & Liberty Damage Formula
// ${combatType} combat, ${attackDirection} attack, ${isPvP ? "PvP" : "PvE"}

//========================================
// SUMMARY
//========================================
Damage per Hit: ${damage.toFixed(1)}
Expected Damage per Cast: ${expectedDamage.toFixed(1)}${build.offhandChance && build.offhandChance > 0 ? `
Total with Off-hand: ${totalExpectedDamage.toFixed(1)}` : ''}

Key Chances:
- Hit Chance: ${(hitChance * 100).toFixed(1)}%
- Crit Chance: ${(critChance * 100).toFixed(1)}%
- Heavy Attack: ${(heavyChanceVal * 100).toFixed(1)}%${(build.weakenChance || 0) > 0 ? `
- Weaken Chance: ${(weakenChance * 100).toFixed(1)}%` : ''}

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
ExpectedBaseDamage = (CritChance × MaxDamage × CritMultiplier) +
                    (GlanceChance × MinDamage) + 
                    (NormalChance × AvgDamage)
                  = (${critChance.toFixed(3)} × ${build.maxDMG} × ${(1 + critDamageBonus).toFixed(2)}) +
                    (${glanceChance.toFixed(3)} × ${build.minDMG}) + 
                    (${(1 - critChance - glanceChance).toFixed(3)} × ${avgWeaponDmg})
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
HitChance = Hit / (Hit + Evasion + 1000)
          = ${totalHit}${hitMod > 0 ? ` [base:${stats.hit} + ${attackDirection}:${hitMod}]` : ""} / (${totalHit} + ${stats.evasion} + 1000)
          = ${totalHit} / ${totalHit + stats.evasion + 1000} = ${hitChance.toFixed(3)}

// Heavy Attack vs Heavy Evasion  
HeavyChance = HeavyAttack / (HeavyAttack + HeavyEvasion + 1000)
            = ${totalHeavy}${heavyMod > 0 ? ` [base:${stats.heavyAttack} + ${attackDirection}:${heavyMod}]` : ""} / (${totalHeavy} + ${stats.heavyEvasion} + 1000)
            = ${totalHeavy} / ${totalHeavy + stats.heavyEvasion + 1000} = ${heavyChanceVal.toFixed(3)}

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

// Skill damage boost increases all skill damage
SkillDamageMultiplier = 1 + (SkillDamageBoost / 100)
                      = 1 + (${build.skillDamageBoost || 0} / 100) = ${skillDamageBoost.toFixed(3)}

// PvP/PvE damage modifier
${isPvP ? `PvPMultiplier = 1 - 0.1 = ${pvpMultiplier.toFixed(1)} (10% damage reduction in PvP)` : `PvEMultiplier = ${pvpMultiplier.toFixed(1)} (no reduction in PvE)`}

// Combined multipliers for efficiency
AllMultipliers = DefenseMultiplier × SkillDamageMultiplier × ${isPvP ? 'PvPMultiplier' : 'PvEMultiplier'}
               = ${defenseReduction.toFixed(3)} × ${skillDamageBoost.toFixed(3)} × ${pvpMultiplier.toFixed(1)}
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
${build.offhandChance && build.offhandChance > 0 ? `
//========================================
// OFF-HAND DAMAGE
//========================================
OffhandAvgDamage = (${build.offhandMinDMG} + ${build.offhandMaxDMG}) / 2 × ${build.offhandChance}
                 = ${((build.offhandMinDMG || 0) + (build.offhandMaxDMG || 0)) / 2} × ${build.offhandChance}
                 = ${offhandAvgDamage.toFixed(1)}

OffhandFinalDamage = OffhandAvgDamage × AllMultipliers × ExpectedHeavyMultiplier
                   = ${offhandAvgDamage.toFixed(1)} × ${allMultipliers.toFixed(3)} × ${expectedHeavyMultiplier.toFixed(3)}
                   = ${offhandFinalDamage.toFixed(1)}

// Total damage including off-hand
TotalExpectedDamage = ExpectedDamage + (OffhandFinalDamage × HitChance × HitsPerCast)
                    = ${expectedDamage.toFixed(1)} + (${offhandFinalDamage.toFixed(1)} × ${hitChance.toFixed(3)} × ${hitsPerCast})
                    = ${totalExpectedDamage.toFixed(1)}` : ""}`;

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
