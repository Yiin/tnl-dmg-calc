import { memo, useCallback } from "react";
import { Build } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { X, Info } from "lucide-react";

interface BuildFormProps {
  build: Build;
  onChange: (build: Build) => void;
  onPropertyChange?: <K extends keyof Build>(key: K, value: Build[K]) => void;
  onRemove?: () => void;
  speedLimiter?: 'cooldown' | 'castTime';
  onSpeedLimiterChange?: (value: 'cooldown' | 'castTime') => void;
}

export const BuildForm = memo(function BuildForm({ 
  build, 
  onChange,
  onPropertyChange, 
  onRemove,
  speedLimiter = 'cooldown',
  onSpeedLimiterChange
}: BuildFormProps) {
  const handleInputChange = useCallback(
    (field: keyof Build, value: string) => {
      const numValue = parseFloat(value) || 0;
      // Use the more efficient property updater if available
      if (onPropertyChange) {
        onPropertyChange(field, numValue);
      } else {
        onChange({ ...build, [field]: numValue });
      }
    },
    [build, onChange, onPropertyChange]
  );

  const handleNameChange = useCallback(
    (value: string) => {
      // Use the more efficient property updater if available
      if (onPropertyChange) {
        onPropertyChange('name', value);
      } else {
        onChange({ ...build, name: value });
      }
    },
    [build, onChange, onPropertyChange]
  );

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-lg">
          <Input
            type="text"
            value={build.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Build Name"
            className="font-semibold bg-transparent px-2 py-6 md:text-3xl focus:ring-0"
          />
        </CardTitle>
        {onRemove && (
          <Button
            onClick={onRemove}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Weapon Damage
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="minDMG" className="text-xs">
                Min DMG
              </Label>
              <Input
                id="minDMG"
                type="number"
                value={build.minDMG}
                onChange={(e) => handleInputChange("minDMG", e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxDMG" className="text-xs">
                Max DMG
              </Label>
              <Input
                id="maxDMG"
                type="number"
                value={build.maxDMG}
                onChange={(e) => handleInputChange("maxDMG", e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="offhandMinDMG" className="text-xs">
                Offhand Min
              </Label>
              <Input
                id="offhandMinDMG"
                type="number"
                value={build.offhandMinDMG || 0}
                onChange={(e) =>
                  handleInputChange("offhandMinDMG", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="offhandMaxDMG" className="text-xs">
                Offhand Max
              </Label>
              <Input
                id="offhandMaxDMG"
                type="number"
                value={build.offhandMaxDMG || 0}
                onChange={(e) =>
                  handleInputChange("offhandMaxDMG", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="offhandChance" className="text-xs">
                Offhand Chance
              </Label>
              <Input
                id="offhandChance"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={build.offhandChance || 0}
                onChange={(e) =>
                  handleInputChange("offhandChance", e.target.value)
                }
                className="h-8 text-xs"
                placeholder="0.50"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bonusDamage" className="text-xs">
                Bonus Damage
              </Label>
              <Input
                id="bonusDamage"
                type="number"
                value={build.bonusDamage || 0}
                onChange={(e) =>
                  handleInputChange("bonusDamage", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Attack Speed
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Label htmlFor="attackSpeedTime" className="text-xs">
                  Attack Speed (seconds)
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Time between auto attacks in seconds.
                      <br />
                      <br />
                      <strong>⚠️ Important:</strong> Attack speed may inflate DPS 
                      calculations in charts. Most skills are primarily affected by 
                      Cooldown Speed, not Attack Speed.
                      <br />
                      <br />
                      Attack Speed only affects:
                      <br />
                      • Auto attack frequency
                      <br />
                      • Cast animations/spell cast time
                      <br />
                      <br />
                      For accurate skill DPS, focus on Cooldown Speed instead.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="attackSpeedTime"
                type="number"
                step="0.01"
                value={build.attackSpeedTime || 0}
                onChange={(e) =>
                  handleInputChange("attackSpeedTime", e.target.value)
                }
                className="h-8 text-xs"
                placeholder="0.36"
              />
            </div>
          </div>
        </div>

        {onSpeedLimiterChange && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              DPS Calculation Mode
            </h4>
            <div className="flex items-center space-x-4 p-2 rounded-md bg-muted/50">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cooldown-limited"
                  checked={speedLimiter === 'cooldown'}
                  onCheckedChange={(checked) => {
                    if (checked) onSpeedLimiterChange('cooldown');
                  }}
                />
                <Label htmlFor="cooldown-limited" className="text-xs font-normal cursor-pointer">
                  Cooldown Limited (Skills)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cast-time-limited"
                  checked={speedLimiter === 'castTime'}
                  onCheckedChange={(checked) => {
                    if (checked) onSpeedLimiterChange('castTime');
                  }}
                />
                <Label htmlFor="cast-time-limited" className="text-xs font-normal cursor-pointer">
                  Cast Time Limited (Spam)
                </Label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Skills: Use CDR for cooldown-based abilities.
              Spam: Use Attack Speed for spammable/auto attacks.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Cooldown Speed
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="cooldownSpeed" className="text-xs">
                Cooldown Speed
              </Label>
              <Input
                id="cooldownSpeed"
                type="number"
                step="0.1"
                value={build.cooldownSpeed || 0}
                onChange={(e) =>
                  handleInputChange("cooldownSpeed", e.target.value)
                }
                className="h-8 text-xs"
                placeholder="40.9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cooldownSpeedPercent" className="text-xs">
                CDR %
              </Label>
              <Input
                id="cooldownSpeedPercent"
                type="number"
                step="0.1"
                value={build.cooldownSpeed ? ((build.cooldownSpeed / (build.cooldownSpeed + 100)) * 100).toFixed(1) : 0}
                className="h-8 text-xs"
                placeholder="29.0"
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Critical Hit
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="meleeCritical" className="text-xs">
                Melee Critical
              </Label>
              <Input
                id="meleeCritical"
                type="number"
                value={build.meleeCritical || 0}
                onChange={(e) =>
                  handleInputChange("meleeCritical", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rangedCritical" className="text-xs">
                Ranged Critical
              </Label>
              <Input
                id="rangedCritical"
                type="number"
                value={build.rangedCritical || 0}
                onChange={(e) =>
                  handleInputChange("rangedCritical", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="magicCritical" className="text-xs">
                Magic Critical
              </Label>
              <Input
                id="magicCritical"
                type="number"
                value={build.magicCritical || 0}
                onChange={(e) =>
                  handleInputChange("magicCritical", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="criticalDamage" className="text-xs">
                Critical Damage %
              </Label>
              <Input
                id="criticalDamage"
                type="number"
                value={build.criticalDamage || 0}
                onChange={(e) =>
                  handleInputChange("criticalDamage", e.target.value)
                }
                className="h-8 text-xs"
                placeholder="50"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Heavy Attack
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="meleeHeavyAttack" className="text-xs">
                Melee Heavy
              </Label>
              <Input
                id="meleeHeavyAttack"
                type="number"
                value={build.meleeHeavyAttack || 0}
                onChange={(e) =>
                  handleInputChange("meleeHeavyAttack", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rangedHeavyAttack" className="text-xs">
                Ranged Heavy
              </Label>
              <Input
                id="rangedHeavyAttack"
                type="number"
                value={build.rangedHeavyAttack || 0}
                onChange={(e) =>
                  handleInputChange("rangedHeavyAttack", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="magicHeavyAttack" className="text-xs">
                Magic Heavy
              </Label>
              <Input
                id="magicHeavyAttack"
                type="number"
                value={build.magicHeavyAttack || 0}
                onChange={(e) =>
                  handleInputChange("magicHeavyAttack", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Hit Chance
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="meleeHit" className="text-xs">
                Melee Hit
              </Label>
              <Input
                id="meleeHit"
                type="number"
                value={build.meleeHit || 0}
                onChange={(e) => handleInputChange("meleeHit", e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rangedHit" className="text-xs">
                Ranged Hit
              </Label>
              <Input
                id="rangedHit"
                type="number"
                value={build.rangedHit || 0}
                onChange={(e) => handleInputChange("rangedHit", e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="magicHit" className="text-xs">
                Magic Hit
              </Label>
              <Input
                id="magicHit"
                type="number"
                value={build.magicHit || 0}
                onChange={(e) => handleInputChange("magicHit", e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Skill Stats
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="skillDamageBoost" className="text-xs">
                Skill Damage Boost
              </Label>
              <Input
                id="skillDamageBoost"
                type="number"
                value={build.skillDamageBoost || 0}
                onChange={(e) =>
                  handleInputChange("skillDamageBoost", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="weakenChance" className="text-xs">
                Weaken Chance
              </Label>
              <Input
                id="weakenChance"
                type="number"
                value={build.weakenChance || 0}
                onChange={(e) =>
                  handleInputChange("weakenChance", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Positional Stats
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="frontEvasion" className="text-xs">
                Front Evasion
              </Label>
              <Input
                id="frontEvasion"
                type="number"
                value={build.frontEvasion || 0}
                onChange={(e) =>
                  handleInputChange("frontEvasion", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sideHeavyAttackEvasion" className="text-xs">
                Side Heavy Attack Evasion
              </Label>
              <Input
                id="sideHeavyAttackEvasion"
                type="number"
                value={build.sideHeavyAttackEvasion || 0}
                onChange={(e) =>
                  handleInputChange("sideHeavyAttackEvasion", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="backHitChance" className="text-xs">
                Back Hit Chance
              </Label>
              <Input
                id="backHitChance"
                type="number"
                value={build.backHitChance || 0}
                onChange={(e) =>
                  handleInputChange("backHitChance", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sideHitChance" className="text-xs">
                Side Hit Chance
              </Label>
              <Input
                id="sideHitChance"
                type="number"
                value={build.sideHitChance || 0}
                onChange={(e) =>
                  handleInputChange("sideHitChance", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="backHeavyAttackChance" className="text-xs">
                Back Heavy Attack Chance
              </Label>
              <Input
                id="backHeavyAttackChance"
                type="number"
                value={build.backHeavyAttackChance || 0}
                onChange={(e) =>
                  handleInputChange("backHeavyAttackChance", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sideHeavyAttackChance" className="text-xs">
                Side Heavy Attack Chance
              </Label>
              <Input
                id="sideHeavyAttackChance"
                type="number"
                value={build.sideHeavyAttackChance || 0}
                onChange={(e) =>
                  handleInputChange("sideHeavyAttackChance", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="backCriticalHit" className="text-xs">
                Back Critical Hit
              </Label>
              <Input
                id="backCriticalHit"
                type="number"
                value={build.backCriticalHit || 0}
                onChange={(e) =>
                  handleInputChange("backCriticalHit", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sideCriticalHit" className="text-xs">
                Side Critical Hit
              </Label>
              <Input
                id="sideCriticalHit"
                type="number"
                value={build.sideCriticalHit || 0}
                onChange={(e) =>
                  handleInputChange("sideCriticalHit", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
});
