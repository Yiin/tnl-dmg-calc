import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Build, Enemy } from "../types";

interface DamageFormulaProps {
  build: Build;
  enemy: Enemy;
  combatType: "melee" | "ranged" | "magic";
  attackDirection: "front" | "side" | "back";
  isPvP?: boolean;
  skillPotency?: number;
  skillFlatAdd?: number;
  hitsPerCast?: number;
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

  // Correctly calculate crit/glance based on conditional formula
  let critChance = "0.000";
  let glanceChance = "0.000";

  if (totalCrit > stats.endurance) {
    const diff = totalCrit - stats.endurance;
    critChance = (diff / (diff + 1000)).toFixed(3);
  } else {
    const diff = stats.endurance - totalCrit;
    glanceChance = (diff / (diff + 1000)).toFixed(3);
  }
  const hitChance = (totalHit / (totalHit + stats.evasion + 1000)).toFixed(3);
  const heavyChance = (
    totalHeavy /
    (totalHeavy + stats.heavyEvasion + 1000)
  ).toFixed(3);
  const defenseReduction = (1 - stats.defense / (stats.defense + 2500)).toFixed(
    3
  );
  const damageReduction = (1 - (enemy.damageReduction || 0) / 100).toFixed(3);
  const skillResist = (1 - (enemy.skillDamageResistance || 0) / 100).toFixed(3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Damage Calculation Formula</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-xs font-mono space-y-2 overflow-x-auto">
          <div className="whitespace-pre">
            <span className="text-muted-foreground">
              // Base Damage Calculation
            </span>
            <br />
            AvgWeaponDamage = ({build.minDMG} + {build.maxDMG}) / 2 ={" "}
            <span className="text-primary">{avgWeaponDmg}</span>
            <br />
            <span className="text-muted-foreground">
              // Base Damage includes crit damage bonus on critical hits
            </span>
            <br />
            CritDamageBonus = {build.criticalDamage || 0}% -{" "}
            {enemy.criticalDamageResistance || 0}% ={" "}
            <span className="text-primary">
              {(build.criticalDamage || 0) -
                (enemy.criticalDamageResistance || 0)}
              %
            </span>
            <br />
            ExpectedBaseDamage = ({critChance} × {build.maxDMG} ×{" "}
            {(
              1 +
              ((build.criticalDamage || 0) -
                (enemy.criticalDamageResistance || 0)) /
                100
            ).toFixed(2)}
            ) +
            <br />
            <span className="ml-20">
              ({glanceChance} × {build.minDMG}) + (
              {(1 - parseFloat(critChance) - parseFloat(glanceChance)).toFixed(
                3
              )}{" "}
              × {avgWeaponDmg})
            </span>{" "}
            ={" "}
            <span className="text-primary">
              {(
                parseFloat(critChance) *
                  build.maxDMG *
                  (1 +
                    ((build.criticalDamage || 0) -
                      (enemy.criticalDamageResistance || 0)) /
                      100) +
                parseFloat(glanceChance) * build.minDMG +
                (1 - parseFloat(critChance) - parseFloat(glanceChance)) *
                  parseFloat(avgWeaponDmg)
              ).toFixed(1)}
            </span>
          </div>

          <div className="whitespace-pre">
            <span className="text-muted-foreground">
              // Combat Chances ({combatType}, {attackDirection} attack)
            </span>
            <br />
            {totalCrit > stats.endurance ? (
              <>
                CritChance = ({totalCrit - stats.endurance}) / (
                {totalCrit - stats.endurance} + 1000) ={" "}
                <span className="text-green-500">{critChance}</span>
                <br />
                GlanceChance = <span className="text-orange-500">
                  0.000
                </span>{" "}
                <span className="text-muted-foreground">
                  (crit &gt; endurance)
                </span>
              </>
            ) : (
              <>
                CritChance = <span className="text-green-500">0.000</span>{" "}
                <span className="text-muted-foreground">
                  (crit ≤ endurance)
                </span>
                <br />
                GlanceChance = ({stats.endurance - totalCrit}) / (
                {stats.endurance - totalCrit} + 1000) ={" "}
                <span className="text-orange-500">{glanceChance}</span>
              </>
            )}
            <br />
            HitChance = ({totalHit}
            {hitMod > 0 ? ` [${stats.hit}+${hitMod}]` : ""}) / ({totalHit} +{" "}
            {stats.evasion} + 1000) ={" "}
            <span className="text-blue-500">{hitChance}</span>
            <br />
            HeavyChance = ({totalHeavy}
            {heavyMod > 0 ? ` [${stats.heavyAttack}+${heavyMod}]` : ""}) / (
            {totalHeavy} + {stats.heavyEvasion} + 1000) ={" "}
            <span className="text-purple-500">{heavyChance}</span>
            <br />
            ExpectedHeavyMultiplier = (HeavyChance × 2) + ((1 - HeavyChance) ×
            1) ={" "}
            <span className="text-purple-500">
              {(
                parseFloat(heavyChance) * 2 +
                (1 - parseFloat(heavyChance)) * 1
              ).toFixed(3)}
            </span>
          </div>

          <div className="whitespace-pre">
            <span className="text-muted-foreground">
              // Skill Damage Calculation
            </span>
            <br />
            SkillPotency = <span className="text-primary">{skillPotency}</span>
            <br />
            SkillFlatAdd = <span className="text-primary">{skillFlatAdd}</span>
            <br />
            SkillDamage = (SkillPotency × ExpectedBaseDamage) + SkillFlatAdd
          </div>

          <div className="whitespace-pre">
            <span className="text-muted-foreground">// Defense Reductions</span>
            <br />
            DefenseReduction = 1 - {stats.defense} / ({stats.defense} + 2500) ={" "}
            <span className="text-primary">{defenseReduction}</span>
            <br />
            DamageReduction = 1 - {enemy.damageReduction || 0}/100 ={" "}
            <span className="text-primary">{damageReduction}</span>
            <br />
            SkillDamageReduction = 1 - {enemy.skillDamageResistance || 0}/100 ={" "}
            <span className="text-primary">{skillResist}</span>
          </div>

          <div className="whitespace-pre">
            <span className="text-muted-foreground">// Skill Damage Boost</span>
            <br />
            SkillDamageBoost = {build.skillDamageBoost || 0} / 100 ={" "}
            <span className="text-primary">
              {((build.skillDamageBoost || 0) / 100).toFixed(3)}
            </span>
          </div>

          <div className="whitespace-pre">
            <span className="text-muted-foreground">
              // Bonus Damage & Damage Reduction (applied at end)
            </span>
            <br />
            BonusDamage ={" "}
            <span className="text-primary">{build.bonusDamage || 0}</span>
            <br />
            DamageReduction ={" "}
            <span className="text-primary">{enemy.damageReduction || 0}</span>
          </div>

          <div className="whitespace-pre">
            <span className="text-muted-foreground">
              // {isPvP ? "PvP" : "PvE"} Damage Multiplier
            </span>
            <br />
            {isPvP ? "PvPMultiplier" : "PvEMultiplier"} ={" "}
            {isPvP ? "1 - 0.1 = 0.9" : "1.0"}{" "}
            <span className="text-muted-foreground">
              ({isPvP ? "10% damage reduction in PvP" : "No reduction in PvE"})
            </span>
          </div>

          <div className="whitespace-pre border-t pt-2">
            <span className="text-muted-foreground">
              // Final Damage Formula (per source)
            </span>
            <br />
            <span className="text-yellow-500">Damage</span> = ((((SkillPotency ×
            BaseDamage) + SkillFlatAdd) ×
            <br />
            <span className="ml-4">[DefenseReduction × SkillDamageBoost ×</span>
            <br />
            <span className="ml-4">
              {isPvP ? "PvPMultiplier" : "PvEMultiplier"}]) ×
              ExpectedHeavyMultiplier) +
            </span>
            <br />
            <span className="ml-4">BonusDamage - DamageReduction</span>
            <br />
            <br />
            <span className="text-muted-foreground">
              // Note: BaseDamage already includes critical damage bonus on
              crits
            </span>
            <br />
            <span className="text-muted-foreground">
              // Expected Damage Per Cast (accounting for hit chance)
            </span>
            <br />
            <span className="text-yellow-500">ExpectedDamage</span> = Damage ×
            HitChance × HitsPerCast({hitsPerCast})
          </div>

          {build.offhandChance && build.offhandChance > 0 && (
            <div className="whitespace-pre border-t pt-2">
              <span className="text-muted-foreground">// Off-hand Damage</span>
              <br />
              OffhandDamage = ({build.offhandMinDMG} + {build.offhandMaxDMG}) /
              2 × {build.offhandChance} ={" "}
              <span className="text-primary">
                {(((build.offhandMinDMG || 0) + (build.offhandMaxDMG || 0)) /
                  2) *
                  build.offhandChance}
              </span>
              <br />
              <span className="text-yellow-500">TotalExpectedDamage</span> =
              ExpectedDamage + (OffhandDamage × AllMultipliers)
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
