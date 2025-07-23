import { useState, useEffect } from "react";
import { Build, Enemy, StatKey, DamageBreakdown } from "./types";
import { BuildForm } from "./components/BuildForm";
import { EnemyForm } from "./components/EnemyForm";
import { DamageChart } from "./components/DamageChart";
import { ChartControls } from "./components/ChartControls";
import { DamageBreakdownTooltip } from "./components/DamageBreakdownTooltip";
import { ImportDialog } from "./components/ImportDialog";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { DamageFormula } from "./components/DamageFormula";
import { SkillConfigForm } from "./components/SkillConfigForm";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Trash2 } from "lucide-react";

interface SkillConfig {
  skillPotency: number;
  skillFlatAdd: number;
  hitsPerCast: number;
}

const defaultBuild: Build = {
  name: "Build 1",
  minDMG: 100,
  maxDMG: 200,
  meleeCritical: 1000,
  rangedCritical: 1000,
  magicCritical: 1000,
  criticalDamage: 50, // 50%
  meleeHeavyAttack: 500,
  rangedHeavyAttack: 500,
  magicHeavyAttack: 500,
  meleeHit: 2000,
  rangedHit: 2000,
  magicHit: 2000,
  skillDamageBoost: 0,
  bonusDamage: 0,
};

const defaultSkillConfig: SkillConfig = {
  skillPotency: 1.0,
  skillFlatAdd: 0,
  hitsPerCast: 1,
};

const defaultEnemy: Enemy = {
  name: "Target Dummy",
  meleeEndurance: 1000,
  rangedEndurance: 1000,
  magicEndurance: 1000,
  meleeEvasion: 0,
  rangedEvasion: 0,
  magicEvasion: 0,
  meleeHeavyAttackEvasion: 0,
  rangedHeavyAttackEvasion: 0,
  magicHeavyAttackEvasion: 0,
  meleeDefense: 500,
  rangedDefense: 500,
  magicDefense: 500,
  damageReduction: 0,
  skillDamageResistance: 0,
};

// Local storage keys
const STORAGE_KEYS = {
  builds: "tnl-damage-calc-builds",
  enemy: "tnl-damage-calc-enemy",
  xAxisStat: "tnl-damage-calc-x-axis-stat",
  xAxisRange: "tnl-damage-calc-x-axis-range",
  yMetric: "tnl-damage-calc-y-metric",
  combatType: "tnl-damage-calc-combat-type",
  attackDirection: "tnl-damage-calc-attack-direction",
  activeBuildTab: "tnl-damage-calc-active-build-tab",
  isPvP: "tnl-damage-calc-is-pvp",
  skillConfig: "tnl-damage-calc-skill-config",
};

// Load from localStorage with fallback
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    console.log(`Loading from localStorage - Key: ${key}, Stored: ${stored}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log(`Parsed value for ${key}:`, parsed);
      return parsed;
    }
    console.log(`No stored value for ${key}, using fallback:`, fallback);
    return fallback;
  } catch (error) {
    console.error(`Error loading from localStorage for key ${key}:`, error);
    return fallback;
  }
}

// Save to localStorage
function saveToStorage<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    console.log(`Saved to localStorage - Key: ${key}, Value:`, value);
  } catch (error) {
    console.warn("Failed to save to localStorage:", error);
  }
}

// Detect dominant combat type based on build stats
function detectDominantCombatType(build: Build): "melee" | "ranged" | "magic" {
  // Calculate total stats for each combat type
  const meleeScore =
    (build.meleeCritical || 0) +
    (build.meleeHit || 0) +
    (build.meleeHeavyAttack || 0);

  const rangedScore =
    (build.rangedCritical || 0) +
    (build.rangedHit || 0) +
    (build.rangedHeavyAttack || 0);

  const magicScore =
    (build.magicCritical || 0) +
    (build.magicHit || 0) +
    (build.magicHeavyAttack || 0);

  // Return the type with highest score
  if (magicScore >= meleeScore && magicScore >= rangedScore) {
    return "magic";
  } else if (rangedScore >= meleeScore) {
    return "ranged";
  } else {
    return "melee";
  }
}

// Select smart X-axis stat based on enemy stats and combat type
function selectSmartXAxisStat(
  enemy: Enemy,
  combatType: "melee" | "ranged" | "magic"
): StatKey {
  // Get the relevant evasion stat for the combat type
  const evasionStat =
    combatType === "melee"
      ? enemy.meleeEvasion
      : combatType === "ranged"
      ? enemy.rangedEvasion
      : enemy.magicEvasion;

  // If evasion is greater than 500, select evasion, otherwise endurance
  if ((evasionStat || 0) > 500) {
    return combatType === "melee"
      ? "meleeEvasion"
      : combatType === "ranged"
      ? "rangedEvasion"
      : "magicEvasion";
  } else {
    return combatType === "melee"
      ? "meleeEndurance"
      : combatType === "ranged"
      ? "rangedEndurance"
      : "magicEndurance";
  }
}

function App() {
  const [builds, setBuilds] = useState<Build[]>(() =>
    loadFromStorage(STORAGE_KEYS.builds, [])
  );
  const [enemy, setEnemy] = useState<Enemy>(() =>
    loadFromStorage(STORAGE_KEYS.enemy, defaultEnemy)
  );
  const [xAxisStat, setXAxisStat] = useState<StatKey>(() =>
    loadFromStorage(STORAGE_KEYS.xAxisStat, "meleeEndurance")
  );
  const [xAxisRange, setXAxisRange] = useState(() =>
    loadFromStorage(STORAGE_KEYS.xAxisRange, {
      min: 0,
      max: 3000,
      step: 100,
    })
  );
  const [yMetric, setYMetric] = useState<
    "expectedDamage" | "finalDamage" | "critChance" | "hitChance"
  >(() => loadFromStorage(STORAGE_KEYS.yMetric, "expectedDamage"));
  const [combatType, setCombatType] = useState<"melee" | "ranged" | "magic">(
    () => loadFromStorage(STORAGE_KEYS.combatType, "melee")
  );
  const [attackDirection, setAttackDirection] = useState<
    "front" | "side" | "back"
  >(() => loadFromStorage(STORAGE_KEYS.attackDirection, "front"));
  const [isPvP, setIsPvP] = useState<boolean>(() =>
    loadFromStorage(STORAGE_KEYS.isPvP, true)
  );
  const [skillConfig, setSkillConfig] = useState<SkillConfig>(() =>
    loadFromStorage(STORAGE_KEYS.skillConfig, defaultSkillConfig)
  );
  const [hoveredBreakdown, setHoveredBreakdown] =
    useState<DamageBreakdown | null>(null);
  const [hoveredX, setHoveredX] = useState<number>(0);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showEnemyImportDialog, setShowEnemyImportDialog] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeBuildTab, setActiveBuildTab] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.activeBuildTab, "0")
  );

  const addBuild = () => {
    const newBuild: Build = {
      ...defaultBuild,
      name: `Build ${builds.length + 1}`,
    };
    setBuilds([...builds, newBuild]);
    setActiveBuildTab(builds.length.toString()); // Switch to the new tab
  };

  const updateBuild = (index: number, build: Build) => {
    const newBuilds = [...builds];
    newBuilds[index] = build;
    setBuilds(newBuilds);
  };

  const removeBuild = (index: number) => {
    if (builds.length > 1) {
      const newBuilds = builds.filter((_, i) => i !== index);
      setBuilds(newBuilds);

      // Adjust active tab if necessary
      const currentTab = parseInt(activeBuildTab);
      if (currentTab >= newBuilds.length) {
        setActiveBuildTab((newBuilds.length - 1).toString());
      } else if (currentTab > index) {
        setActiveBuildTab((currentTab - 1).toString());
      }
    }
  };

  const importBuild = (build: Build) => {
    setBuilds([...builds, build]);
    setActiveBuildTab(builds.length.toString()); // Switch to the imported build tab
  };

  const importEnemy = (enemy: Enemy) => {
    setEnemy(enemy);
  };

  const clearAll = () => {
    setBuilds([]);
    setEnemy(defaultEnemy);
    setXAxisStat("meleeEndurance");
    setXAxisRange({ min: 0, max: 3000, step: 100 });
    setYMetric("expectedDamage");
    setCombatType("melee");
    setAttackDirection("front");

    // Clear localStorage
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  };

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.builds, builds);

    // Ensure active tab is valid
    const currentTab = parseInt(activeBuildTab);
    if (
      builds.length === 0 ||
      currentTab >= builds.length ||
      isNaN(currentTab)
    ) {
      setActiveBuildTab("0");
    }
  }, [builds, activeBuildTab]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.enemy, enemy);
  }, [enemy]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.xAxisStat, xAxisStat);
  }, [xAxisStat]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.xAxisRange, xAxisRange);
  }, [xAxisRange]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.yMetric, yMetric);
  }, [yMetric]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.combatType, combatType);
  }, [combatType]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.attackDirection, attackDirection);
  }, [attackDirection]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.activeBuildTab, activeBuildTab);
  }, [activeBuildTab]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.isPvP, isPvP);
  }, [isPvP]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.skillConfig, skillConfig);
  }, [skillConfig]);

  // Auto-detect combat type when active build changes
  useEffect(() => {
    const currentTabIndex = parseInt(activeBuildTab);
    if (!isNaN(currentTabIndex) && builds[currentTabIndex]) {
      const dominantType = detectDominantCombatType(builds[currentTabIndex]);
      setCombatType(dominantType);
    }
  }, [activeBuildTab, builds]);

  // Auto-select X-axis stat based on enemy stats and combat type
  useEffect(() => {
    const smartStat = selectSmartXAxisStat(enemy, combatType);
    setXAxisStat(smartStat);
  }, [enemy, combatType]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/20 p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center">
            Throne & Liberty Damage Calculator
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            Interactive damage simulation and build comparison tool
          </p>
        </div>
      </header>

      <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[calc(100vh-140px)]">
        {/* Left sidebar with builds */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Build Configuration</h2>
              </div>
              <div className="flex gap-2">
                <Button onClick={addBuild} size="sm" className="flex-1 py-6">
                  Add Build
                </Button>
                <Button
                  onClick={() => setShowImportDialog(true)}
                  variant="outline"
                  size="sm"
                  className="flex-1 py-6"
                >
                  Import Build
                </Button>
              </div>
              <Button
                onClick={() => setShowClearConfirm(true)}
                variant="destructive"
                size="sm"
                className="w-full py-6"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>

            {builds.length > 0 && (
              <Tabs
                value={activeBuildTab}
                onValueChange={setActiveBuildTab}
                className="w-full"
              >
                <TabsList
                  className="grid w-full"
                  style={{
                    gridTemplateColumns: `repeat(${builds.length}, 1fr)`,
                  }}
                >
                  {builds.map((build, index) => (
                    <TabsTrigger
                      key={index}
                      value={index.toString()}
                      className="text-xs"
                    >
                      {build.name || `Build ${index + 1}`}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {builds.map((build, index) => (
                  <TabsContent
                    key={index}
                    value={index.toString()}
                    className="mt-4"
                  >
                    <BuildForm
                      build={build}
                      onChange={(updatedBuild) =>
                        updateBuild(index, updatedBuild)
                      }
                      onRemove={
                        builds.length > 1 ? () => removeBuild(index) : undefined
                      }
                    />
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>

          {hoveredBreakdown && (
            <DamageBreakdownTooltip
              breakdown={hoveredBreakdown}
              xValue={hoveredX}
              xAxisStat={xAxisStat}
            />
          )}
        </div>

        {/* Main chart area */}
        <div className="lg:col-span-2 space-y-6">
          <SkillConfigForm config={skillConfig} onChange={setSkillConfig} />

          <ChartControls
            xAxisStat={xAxisStat}
            onXAxisChange={setXAxisStat}
            xAxisRange={xAxisRange}
            onXAxisRangeChange={setXAxisRange}
            yMetric={yMetric}
            onYMetricChange={setYMetric}
            combatType={combatType}
            onCombatTypeChange={setCombatType}
            attackDirection={attackDirection}
            onAttackDirectionChange={setAttackDirection}
            isPvP={isPvP}
            onIsPvPChange={setIsPvP}
          />

          <div className="min-h-[500px]">
            <DamageChart
              builds={builds}
              enemy={enemy}
              xAxisStat={xAxisStat}
              xAxisRange={xAxisRange}
              yMetric={yMetric}
              combatType={combatType}
              attackDirection={attackDirection}
              isPvP={isPvP}
              skillPotency={skillConfig.skillPotency}
              skillFlatAdd={skillConfig.skillFlatAdd}
              hitsPerCast={skillConfig.hitsPerCast}
              onPointHover={(breakdown, x) => {
                setHoveredBreakdown(breakdown);
                setHoveredX(x);
              }}
            />
          </div>

          {builds.length > 0 && builds[parseInt(activeBuildTab)] && (
            <DamageFormula
              build={builds[parseInt(activeBuildTab)]}
              enemy={enemy}
              combatType={combatType}
              attackDirection={attackDirection}
              isPvP={isPvP}
              skillPotency={skillConfig.skillPotency}
              skillFlatAdd={skillConfig.skillFlatAdd}
              hitsPerCast={skillConfig.hitsPerCast}
            />
          )}
        </div>

        {/* Right sidebar with enemy configuration */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto">
          <div>
            <h2 className="text-xl font-semibold mb-4">Enemy Configuration</h2>
            <EnemyForm
              enemy={enemy}
              onChange={setEnemy}
              onImport={() => setShowEnemyImportDialog(true)}
            />
          </div>
        </div>
      </div>

      <footer className="border-t border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/20 p-4 mt-8">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>
            Damage formulas based on research by{" "}
            <a
              href="https://www.reddit.com/r/throneandliberty/comments/1k2cgcp/how_does_our_stats_impact_our_skills_a_very_long/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              u/Rabubu29
            </a>{" "}
            •{" "}
            <a
              href="https://github.com/yiin/tnl-dmg-calc"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </footer>

      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImportBuild={importBuild}
        onImportEnemy={importEnemy}
        mode="build"
      />

      <ImportDialog
        isOpen={showEnemyImportDialog}
        onClose={() => setShowEnemyImportDialog(false)}
        onImportBuild={importBuild}
        onImportEnemy={importEnemy}
        mode="enemy"
      />

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={clearAll}
        title="Clear All Data"
        description="This will remove all builds, reset the enemy configuration, and clear all chart settings. This action cannot be undone."
        confirmText="Clear All"
        confirmVariant="destructive"
      />
    </div>
  );
}

export default App;
