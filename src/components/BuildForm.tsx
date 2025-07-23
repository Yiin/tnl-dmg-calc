import React from "react";
import { Build } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface BuildFormProps {
  build: Build;
  onChange: (build: Build) => void;
  onRemove?: () => void;
}

export const BuildForm: React.FC<BuildFormProps> = ({
  build,
  onChange,
  onRemove,
}) => {
  const handleInputChange = (field: keyof Build, value: string) => {
    const numValue = parseFloat(value) || 0;
    onChange({ ...build, [field]: numValue });
  };

  const handleNameChange = (value: string) => {
    onChange({ ...build, name: value });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">
          <Input
            type="text"
            value={build.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Build Name"
            className="font-semibold border-none bg-transparent p-0 text-lg focus:ring-0"
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
        <div className="space-y-4">
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

        <div className="space-y-4">
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

        <div className="space-y-4">
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

        <div className="space-y-4">
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

        <div className="space-y-4">
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
          </div>
        </div>

        <div className="space-y-4">
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
  );
};
