import React from "react";
import { StatKey } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "./ui/select";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface ChartControlsProps {
  xAxisStat: StatKey;
  onXAxisChange: (stat: StatKey) => void;
  xAxisRange: { min: number; max: number; step: number };
  onXAxisRangeChange: (range: {
    min: number;
    max: number;
    step: number;
  }) => void;
  yMetric: "expectedDamage" | "finalDamage" | "critChance" | "hitChance";
  onYMetricChange: (
    metric: "expectedDamage" | "finalDamage" | "critChance" | "hitChance"
  ) => void;
  combatType: "melee" | "ranged" | "magic";
  onCombatTypeChange: (type: "melee" | "ranged" | "magic") => void;
  attackDirection: "front" | "side" | "back";
  onAttackDirectionChange: (direction: "front" | "side" | "back") => void;
}

const ATTACKER_STATS: { value: StatKey; label: string }[] = [
  // Weapon Damage
  { value: "minDMG", label: "Min DMG" },
  { value: "maxDMG", label: "Max DMG" },
  { value: "bonusDamage", label: "Bonus Damage" },

  // Critical Stats
  { value: "meleeCritical", label: "Melee Critical" },
  { value: "rangedCritical", label: "Ranged Critical" },
  { value: "magicCritical", label: "Magic Critical" },
  { value: "criticalDamage", label: "Critical Damage %" },

  // Hit Stats
  { value: "meleeHit", label: "Melee Hit" },
  { value: "rangedHit", label: "Ranged Hit" },
  { value: "magicHit", label: "Magic Hit" },

  // Heavy Attack Stats
  { value: "meleeHeavyAttack", label: "Melee Heavy Attack" },
  { value: "rangedHeavyAttack", label: "Ranged Heavy Attack" },
  { value: "magicHeavyAttack", label: "Magic Heavy Attack" },

  // Skill Stats
  { value: "skillDamageBoost", label: "Skill Damage Boost" },
  { value: "skillPotency", label: "Skill Potency" },
];

const ENEMY_STATS: { value: StatKey; label: string }[] = [
  // Endurance
  { value: "meleeEndurance", label: "Melee Endurance" },
  { value: "rangedEndurance", label: "Ranged Endurance" },
  { value: "magicEndurance", label: "Magic Endurance" },

  // Evasion
  { value: "meleeEvasion", label: "Melee Evasion" },
  { value: "rangedEvasion", label: "Ranged Evasion" },
  { value: "magicEvasion", label: "Magic Evasion" },

  // Heavy Attack Evasion
  { value: "meleeHeavyAttackEvasion", label: "Melee Heavy Evasion" },
  { value: "rangedHeavyAttackEvasion", label: "Ranged Heavy Evasion" },
  { value: "magicHeavyAttackEvasion", label: "Magic Heavy Evasion" },

  // Defense
  { value: "meleeDefense", label: "Melee Defense" },
  { value: "rangedDefense", label: "Ranged Defense" },
  { value: "magicDefense", label: "Magic Defense" },

  // Resistances
  { value: "skillDamageResistance", label: "Skill Damage Resistance" },
  { value: "damageReduction", label: "Damage Reduction" },
];

const Y_METRIC_OPTIONS = [
  { value: "expectedDamage" as const, label: "Expected Final Damage" },
  { value: "finalDamage" as const, label: "Single Hit Damage" },
  { value: "critChance" as const, label: "Crit Chance" },
  { value: "hitChance" as const, label: "Hit Chance" },
];

export const ChartControls: React.FC<ChartControlsProps> = ({
  xAxisStat,
  onXAxisChange,
  xAxisRange,
  onXAxisRangeChange,
  yMetric,
  onYMetricChange,
  combatType,
  onCombatTypeChange,
  attackDirection,
  onAttackDirectionChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chart Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Combat Type</Label>
            <div className="flex gap-2">
              <Button
                variant={combatType === "melee" ? "default" : "outline"}
                size="sm"
                onClick={() => onCombatTypeChange("melee")}
                className={cn(
                  "flex-1 py-6",
                  combatType === "melee" &&
                    "bg-red-600 hover:bg-red-700 text-white"
                )}
              >
                Melee
              </Button>
              <Button
                variant={combatType === "ranged" ? "default" : "outline"}
                size="sm"
                onClick={() => onCombatTypeChange("ranged")}
                className={cn(
                  "flex-1 py-6",
                  combatType === "ranged" &&
                    "bg-green-600 hover:bg-green-700 text-white"
                )}
              >
                Ranged
              </Button>
              <Button
                variant={combatType === "magic" ? "default" : "outline"}
                size="sm"
                onClick={() => onCombatTypeChange("magic")}
                className={cn(
                  "flex-1 py-6",
                  combatType === "magic" &&
                    "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                Magic
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attack Direction</Label>
            <div className="flex gap-2">
              <Button
                variant={attackDirection === "front" ? "default" : "outline"}
                size="sm"
                onClick={() => onAttackDirectionChange("front")}
                className={cn(
                  "flex-1",
                  attackDirection === "front" &&
                    "bg-purple-600 hover:bg-purple-700 text-white"
                )}
              >
                Front
              </Button>
              <Button
                variant={attackDirection === "side" ? "default" : "outline"}
                size="sm"
                onClick={() => onAttackDirectionChange("side")}
                className={cn(
                  "flex-1",
                  attackDirection === "side" &&
                    "bg-orange-600 hover:bg-orange-700 text-white"
                )}
              >
                Side
              </Button>
              <Button
                variant={attackDirection === "back" ? "default" : "outline"}
                size="sm"
                onClick={() => onAttackDirectionChange("back")}
                className={cn(
                  "flex-1",
                  attackDirection === "back" &&
                    "bg-pink-600 hover:bg-pink-700 text-white"
                )}
              >
                Back
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>X-Axis Variable</Label>
            <Select
              value={xAxisStat}
              onValueChange={(value) => onXAxisChange(value as StatKey)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>⚔️ Attacker</SelectLabel>
                  {ATTACKER_STATS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>🛡️ Enemy</SelectLabel>
                  {ENEMY_STATS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Y-Axis Metric</Label>
            <Select
              value={yMetric}
              onValueChange={(value) => onYMetricChange(value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Y_METRIC_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            X-Axis Range
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="x-min">Min Value</Label>
              <Input
                id="x-min"
                type="number"
                value={xAxisRange.min}
                onChange={(e) =>
                  onXAxisRangeChange({
                    ...xAxisRange,
                    min: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="x-max">Max Value</Label>
              <Input
                id="x-max"
                type="number"
                value={xAxisRange.max}
                onChange={(e) =>
                  onXAxisRangeChange({
                    ...xAxisRange,
                    max: parseInt(e.target.value) || 1000,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="x-step">Step Size</Label>
              <Input
                id="x-step"
                type="number"
                value={xAxisRange.step}
                onChange={(e) =>
                  onXAxisRangeChange({
                    ...xAxisRange,
                    step: parseInt(e.target.value) || 50,
                  })
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
