import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Info } from "lucide-react";

interface SkillConfig {
  skillPotency: number;
  skillFlatAdd: number;
  hitsPerCast: number;
  weakenSkillPotency: number;
  weakenSkillFlatAdd: number;
  cooldownTime: number;
  castTime: number;
  skillCooldownSpecialization: number;
}

interface SkillConfigFormProps {
  config: SkillConfig;
  onChange: (config: SkillConfig) => void;
}

export function SkillConfigForm({ config, onChange }: SkillConfigFormProps) {
  function handleInputChange(field: keyof SkillConfig, value: string) {
    const numValue = parseFloat(value) || 0;
    onChange({ ...config, [field]: numValue });
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Skill Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Label htmlFor="skillPotency" className="text-xs">
                  Skill Potency
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Skill damage multiplier as a decimal.
                      <br />
                      Examples:
                      <br />
                      • 120% base damage = 1.2
                      <br />
                      • 85% base damage = 0.85
                      <br />
                      • 250% base damage = 2.5
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="skillPotency"
                type="number"
                step="0.1"
                value={config.skillPotency}
                onChange={(e) =>
                  handleInputChange("skillPotency", e.target.value)
                }
                className="h-8 text-xs"
                placeholder="1.0"
              />
            </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Label htmlFor="skillFlatAdd" className="text-xs">
                Skill Flat Add
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Flat damage bonus added after skill potency.
                    <br />
                    Formula: (Base DMG × Potency) + Flat Add
                    <br />
                    <br />
                    Example with 1000 base damage:
                    <br />
                    • 1.2 potency + 500 flat = 1700 total
                    <br />
                    • (1000 × 1.2) + 500 = 1700
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="skillFlatAdd"
              type="number"
              value={config.skillFlatAdd}
              onChange={(e) =>
                handleInputChange("skillFlatAdd", e.target.value)
              }
              className="h-8 text-xs"
              placeholder="0"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="hitsPerCast" className="text-xs">
              Hits Per Cast
            </Label>
            <Input
              id="hitsPerCast"
              type="number"
              min="1"
              value={config.hitsPerCast}
              onChange={(e) => handleInputChange("hitsPerCast", e.target.value)}
              className="h-8 text-xs"
              placeholder="1"
            />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Weaken Bonus (Applied when target is weakened)</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="weakenSkillPotency" className="text-xs">
                Weaken Skill Potency
              </Label>
              <Input
                id="weakenSkillPotency"
                type="number"
                step="0.1"
                value={config.weakenSkillPotency}
                onChange={(e) =>
                  handleInputChange("weakenSkillPotency", e.target.value)
                }
                className="h-8 text-xs"
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="weakenSkillFlatAdd" className="text-xs">
                Weaken Skill Flat Add
              </Label>
              <Input
                id="weakenSkillFlatAdd"
                type="number"
                value={config.weakenSkillFlatAdd}
                onChange={(e) =>
                  handleInputChange("weakenSkillFlatAdd", e.target.value)
                }
                className="h-8 text-xs"
                placeholder="0"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Skill Timing</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="cooldownTime" className="text-xs">
                Cooldown Time (s)
              </Label>
              <Input
                id="cooldownTime"
                type="number"
                step="0.1"
                value={config.cooldownTime}
                onChange={(e) =>
                  handleInputChange("cooldownTime", e.target.value)
                }
                className="h-8 text-xs"
                placeholder="10"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="castTime" className="text-xs">
                Cast Time (s)
              </Label>
              <Input
                id="castTime"
                type="number"
                step="0.1"
                value={config.castTime}
                onChange={(e) =>
                  handleInputChange("castTime", e.target.value)
                }
                className="h-8 text-xs"
                placeholder="1"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="skillCooldownSpecialization" className="text-xs">
                CD Specialization (s)
              </Label>
              <Input
                id="skillCooldownSpecialization"
                type="number"
                step="0.1"
                value={config.skillCooldownSpecialization}
                onChange={(e) =>
                  handleInputChange("skillCooldownSpecialization", e.target.value)
                }
                className="h-8 text-xs"
                placeholder="0"
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          These settings apply globally to all builds
        </p>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}
