import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface SkillConfig {
  skillPotency: number;
  skillFlatAdd: number;
  hitsPerCast: number;
  weakenSkillPotency: number;
  weakenSkillFlatAdd: number;
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Skill Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="skillPotency" className="text-xs">
              Skill Potency
            </Label>
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
            <Label htmlFor="skillFlatAdd" className="text-xs">
              Skill Flat Add
            </Label>
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
        <p className="text-xs text-muted-foreground">
          These settings apply globally to all builds
        </p>
      </CardContent>
    </Card>
  );
}
