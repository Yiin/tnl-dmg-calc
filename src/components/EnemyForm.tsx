import { Enemy } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface EnemyFormProps {
  enemy: Enemy;
  onChange: (enemy: Enemy) => void;
  onRemove?: () => void;
}

export function EnemyForm({ enemy, onChange, onRemove }: EnemyFormProps) {
  function handleInputChange(field: keyof Enemy, value: string) {
    const numValue = parseFloat(value) || 0;
    onChange({ ...enemy, [field]: numValue });
  }

  function handleNameChange(value: string) {
    onChange({ ...enemy, name: value });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-lg flex-1">
          <Input
            type="text"
            value={enemy.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enemy Name"
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
            Damage Reduction
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="damageReduction" className="text-xs">
                Damage Reduction
              </Label>
              <Input
                id="damageReduction"
                type="number"
                value={enemy.damageReduction || 0}
                onChange={(e) =>
                  handleInputChange("damageReduction", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bossDamageReduction" className="text-xs">
                Boss Damage Reduction
              </Label>
              <Input
                id="bossDamageReduction"
                type="number"
                value={enemy.bossDamageReduction || 0}
                onChange={(e) =>
                  handleInputChange("bossDamageReduction", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Defense (Melee/Ranged/Magic)
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="meleeDefense" className="text-xs">
                Melee Defense
              </Label>
              <Input
                id="meleeDefense"
                type="number"
                value={enemy.meleeDefense || 0}
                onChange={(e) =>
                  handleInputChange("meleeDefense", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rangedDefense" className="text-xs">
                Ranged Defense
              </Label>
              <Input
                id="rangedDefense"
                type="number"
                value={enemy.rangedDefense || 0}
                onChange={(e) =>
                  handleInputChange("rangedDefense", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="magicDefense" className="text-xs">
                Magic Defense
              </Label>
              <Input
                id="magicDefense"
                type="number"
                value={enemy.magicDefense || 0}
                onChange={(e) =>
                  handleInputChange("magicDefense", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Evasion (Melee/Ranged/Magic)
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="meleeEvasion" className="text-xs">
                Melee Evasion
              </Label>
              <Input
                id="meleeEvasion"
                type="number"
                value={enemy.meleeEvasion || 0}
                onChange={(e) =>
                  handleInputChange("meleeEvasion", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rangedEvasion" className="text-xs">
                Ranged Evasion
              </Label>
              <Input
                id="rangedEvasion"
                type="number"
                value={enemy.rangedEvasion || 0}
                onChange={(e) =>
                  handleInputChange("rangedEvasion", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="magicEvasion" className="text-xs">
                Magic Evasion
              </Label>
              <Input
                id="magicEvasion"
                type="number"
                value={enemy.magicEvasion || 0}
                onChange={(e) =>
                  handleInputChange("magicEvasion", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Endurance (Melee/Ranged/Magic)
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="meleeEndurance" className="text-xs">
                Melee Endurance
              </Label>
              <Input
                id="meleeEndurance"
                type="number"
                value={enemy.meleeEndurance || 0}
                onChange={(e) =>
                  handleInputChange("meleeEndurance", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rangedEndurance" className="text-xs">
                Ranged Endurance
              </Label>
              <Input
                id="rangedEndurance"
                type="number"
                value={enemy.rangedEndurance || 0}
                onChange={(e) =>
                  handleInputChange("rangedEndurance", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="magicEndurance" className="text-xs">
                Magic Endurance
              </Label>
              <Input
                id="magicEndurance"
                type="number"
                value={enemy.magicEndurance || 0}
                onChange={(e) =>
                  handleInputChange("magicEndurance", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Heavy Attack Evasion
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="meleeHeavyAttackEvasion" className="text-xs">
                Melee Heavy Evasion
              </Label>
              <Input
                id="meleeHeavyAttackEvasion"
                type="number"
                value={enemy.meleeHeavyAttackEvasion || 0}
                onChange={(e) =>
                  handleInputChange("meleeHeavyAttackEvasion", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rangedHeavyAttackEvasion" className="text-xs">
                Ranged Heavy Evasion
              </Label>
              <Input
                id="rangedHeavyAttackEvasion"
                type="number"
                value={enemy.rangedHeavyAttackEvasion || 0}
                onChange={(e) =>
                  handleInputChange("rangedHeavyAttackEvasion", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="magicHeavyAttackEvasion" className="text-xs">
                Magic Heavy Evasion
              </Label>
              <Input
                id="magicHeavyAttackEvasion"
                type="number"
                value={enemy.magicHeavyAttackEvasion || 0}
                onChange={(e) =>
                  handleInputChange("magicHeavyAttackEvasion", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Skill Resistance
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="skillDamageResistance" className="text-xs">
                Skill Damage Resistance
              </Label>
              <Input
                id="skillDamageResistance"
                type="number"
                value={enemy.skillDamageResistance || 0}
                onChange={(e) =>
                  handleInputChange("skillDamageResistance", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="weakenResistance" className="text-xs">
                Weaken Resistance
              </Label>
              <Input
                id="weakenResistance"
                type="number"
                value={enemy.weakenResistance || 0}
                onChange={(e) =>
                  handleInputChange("weakenResistance", e.target.value)
                }
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
