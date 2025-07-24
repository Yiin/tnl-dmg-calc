import { useState, useEffect, useCallback } from "react";
import { Build, Enemy, StatKey } from "./types";
import { BuildForm } from "./components/BuildForm";
import { EnemyForm } from "./components/EnemyForm";
import { DamageChart } from "./components/DamageChart";
import { ChartControls } from "./components/ChartControls";
import { serializeState, deserializeState } from "./utils/urlState";
import { ImportDialog } from "./components/ImportDialog";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { DamageFormula } from "./components/DamageFormula";
import { SkillConfigForm } from "./components/SkillConfigForm";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Trash2, Share2 } from "lucide-react";

interface SkillConfig {
  skillPotency: number;
  skillFlatAdd: number;
  hitsPerCast: number;
  weakenSkillPotency: number;
  weakenSkillFlatAdd: number;
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
  weakenSkillPotency: 0,
  weakenSkillFlatAdd: 0,
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
  enemies: "tnl-damage-calc-enemies",
  xAxisStat: "tnl-damage-calc-x-axis-stat",
  xAxisRange: "tnl-damage-calc-x-axis-range",
  yMetric: "tnl-damage-calc-y-metric",
  combatType: "tnl-damage-calc-combat-type",
  attackDirection: "tnl-damage-calc-attack-direction",
  activeBuildTab: "tnl-damage-calc-active-build-tab",
  activeEnemyTab: "tnl-damage-calc-active-enemy-tab",
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
  // Check if we have a hash in the URL
  const hasUrlHash = window.location.hash.length > 1;

  // Initialize state from URL hash if present, otherwise from localStorage
  const getInitialState = useCallback(
    function () {
      if (hasUrlHash) {
        const hash = window.location.hash.substring(1);
        const urlState = deserializeState(hash);
        if (urlState) {
          return {
            builds: urlState.builds || [],
            enemies: urlState.enemies || [],
            xAxisStat: (urlState.xAxisStat || "meleeEndurance") as StatKey,
            xAxisRange: urlState.xAxisRange || { min: 0, max: 3000, step: 100 },
            yMetric: (urlState.yMetric || "expectedDamage") as
              | "expectedDamage"
              | "finalDamage"
              | "critChance"
              | "hitChance",
            combatType: (urlState.combatType || "melee") as
              | "melee"
              | "ranged"
              | "magic",
            attackDirection: (urlState.attackDirection || "front") as
              | "front"
              | "side"
              | "back",
            isPvP: urlState.isPvP !== undefined ? urlState.isPvP : true,
            skillConfig: urlState.skillConfig || defaultSkillConfig,
            activeBuildTab: urlState.activeBuildTab || "0",
            activeEnemyTab: urlState.activeEnemyTab || "0",
          };
        }
      }

      // Fall back to localStorage
      return {
        builds: loadFromStorage(STORAGE_KEYS.builds, []),
        enemies: loadFromStorage(STORAGE_KEYS.enemies, []),
        xAxisStat: loadFromStorage(
          STORAGE_KEYS.xAxisStat,
          "meleeEndurance"
        ) as StatKey,
        xAxisRange: loadFromStorage(STORAGE_KEYS.xAxisRange, {
          min: 0,
          max: 3000,
          step: 100,
        }),
        yMetric: loadFromStorage(STORAGE_KEYS.yMetric, "expectedDamage") as
          | "expectedDamage"
          | "finalDamage"
          | "critChance"
          | "hitChance",
        combatType: loadFromStorage(STORAGE_KEYS.combatType, "melee") as
          | "melee"
          | "ranged"
          | "magic",
        attackDirection: loadFromStorage(
          STORAGE_KEYS.attackDirection,
          "front"
        ) as "front" | "side" | "back",
        isPvP: loadFromStorage(STORAGE_KEYS.isPvP, true),
        skillConfig: loadFromStorage(
          STORAGE_KEYS.skillConfig,
          defaultSkillConfig
        ),
        activeBuildTab: loadFromStorage(STORAGE_KEYS.activeBuildTab, "0"),
        activeEnemyTab: loadFromStorage(STORAGE_KEYS.activeEnemyTab, "0"),
      };
    },
    [hasUrlHash]
  );

  const initialState = getInitialState();

  const [builds, setBuilds] = useState<Build[]>(initialState.builds);
  const [enemies, setEnemies] = useState<Enemy[]>(initialState.enemies);
  const [xAxisStat, setXAxisStat] = useState<StatKey>(initialState.xAxisStat);
  const [xAxisRange, setXAxisRange] = useState(initialState.xAxisRange);
  const [yMetric, setYMetric] = useState<
    "expectedDamage" | "finalDamage" | "critChance" | "hitChance"
  >(initialState.yMetric);
  const [combatType, setCombatType] = useState<"melee" | "ranged" | "magic">(
    initialState.combatType
  );
  const [attackDirection, setAttackDirection] = useState<
    "front" | "side" | "back"
  >(initialState.attackDirection);
  const [isPvP, setIsPvP] = useState<boolean>(initialState.isPvP);
  const [skillConfig, setSkillConfig] = useState<SkillConfig>(
    initialState.skillConfig
  );
  const [activeBuildTab, setActiveBuildTab] = useState<string>(
    initialState.activeBuildTab
  );
  const [activeEnemyTab, setActiveEnemyTab] = useState<string>(
    initialState.activeEnemyTab
  );

  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showEnemyImportDialog, setShowEnemyImportDialog] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showShareNotification, setShowShareNotification] = useState(false);

  function addBuild() {
    const newBuild: Build = {
      ...defaultBuild,
      name: `Build ${builds.length + 1}`,
    };
    setBuilds([...builds, newBuild]);
    setActiveBuildTab(builds.length.toString()); // Switch to the new tab
  }

  function updateBuild(index: number, build: Build) {
    const newBuilds = [...builds];
    newBuilds[index] = build;
    setBuilds(newBuilds);
  }

  function removeBuild(index: number) {
    if (builds.length > 0) {
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
  }

  function importBuild(build: Build) {
    setBuilds([...builds, build]);
    setActiveBuildTab(builds.length.toString()); // Switch to the imported build tab
  }

  function addEnemy() {
    const newEnemy: Enemy = {
      ...defaultEnemy,
      name: `Enemy ${enemies.length + 1}`,
    };
    setEnemies([...enemies, newEnemy]);
    setActiveEnemyTab(enemies.length.toString()); // Switch to the new tab
  }

  function updateEnemy(index: number, enemy: Enemy) {
    const newEnemies = [...enemies];
    newEnemies[index] = enemy;
    setEnemies(newEnemies);
  }

  function removeEnemy(index: number) {
    if (enemies.length > 0) {
      const newEnemies = enemies.filter((_, i) => i !== index);
      setEnemies(newEnemies);

      // Adjust active tab if necessary
      const currentTab = parseInt(activeEnemyTab);
      if (currentTab >= newEnemies.length) {
        setActiveEnemyTab((newEnemies.length - 1).toString());
      } else if (currentTab > index) {
        setActiveEnemyTab((currentTab - 1).toString());
      }
    }
  }

  function importEnemy(enemy: Enemy) {
    setEnemies([...enemies, enemy]);
    setActiveEnemyTab(enemies.length.toString()); // Switch to the imported enemy tab
  }

  function clearAll() {
    setBuilds([]);
    setEnemies([]);
    setXAxisStat("meleeEndurance");
    setXAxisRange({ min: 0, max: 3000, step: 100 });
    setYMetric("expectedDamage");
    setCombatType("melee");
    setAttackDirection("front");

    // Clear localStorage
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  function shareState() {
    const currentState = {
      builds,
      enemies,
      xAxisStat,
      xAxisRange,
      yMetric,
      combatType,
      attackDirection,
      isPvP,
      skillConfig,
      activeBuildTab,
      activeEnemyTab,
    };

    const hash = serializeState(currentState);
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;

    // Copy to clipboard
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setShowShareNotification(true);
        setTimeout(() => setShowShareNotification(false), 3000);
      })
      .catch((err) => {
        console.error("Failed to copy URL:", err);
      });
  }

  // Update URL hash or localStorage based on current mode
  const updatePersistence = useCallback(
    function () {
      const currentState = {
        builds,
        enemies,
        xAxisStat,
        xAxisRange,
        yMetric,
        combatType,
        attackDirection,
        isPvP,
        skillConfig,
        activeBuildTab,
        activeEnemyTab,
      };

      if (window.location.hash.length > 1) {
        // Update URL hash
        const hash = serializeState(currentState);
        window.history.replaceState(null, "", `#${hash}`);
      } else {
        // Update localStorage
        saveToStorage(STORAGE_KEYS.builds, builds);
        saveToStorage(STORAGE_KEYS.enemies, enemies);
        saveToStorage(STORAGE_KEYS.xAxisStat, xAxisStat);
        saveToStorage(STORAGE_KEYS.xAxisRange, xAxisRange);
        saveToStorage(STORAGE_KEYS.yMetric, yMetric);
        saveToStorage(STORAGE_KEYS.combatType, combatType);
        saveToStorage(STORAGE_KEYS.attackDirection, attackDirection);
        saveToStorage(STORAGE_KEYS.isPvP, isPvP);
        saveToStorage(STORAGE_KEYS.skillConfig, skillConfig);
        saveToStorage(STORAGE_KEYS.activeBuildTab, activeBuildTab);
        saveToStorage(STORAGE_KEYS.activeEnemyTab, activeEnemyTab);
      }
    },
    [
      builds,
      enemies,
      xAxisStat,
      xAxisRange,
      yMetric,
      combatType,
      attackDirection,
      isPvP,
      skillConfig,
      activeBuildTab,
      activeEnemyTab,
    ]
  );

  // Persist state changes
  useEffect(() => {
    updatePersistence();
  }, [updatePersistence]);

  // Ensure active tab is valid
  useEffect(() => {
    const currentTab = parseInt(activeBuildTab);
    if (
      builds.length === 0 ||
      currentTab >= builds.length ||
      isNaN(currentTab)
    ) {
      setActiveBuildTab("0");
    }
  }, [builds, activeBuildTab]);

  // Auto-detect combat type when active build changes
  useEffect(() => {
    const currentTabIndex = parseInt(activeBuildTab);
    if (!isNaN(currentTabIndex) && builds[currentTabIndex]) {
      const dominantType = detectDominantCombatType(builds[currentTabIndex]);
      setCombatType(dominantType);
    }
  }, [activeBuildTab, builds]);

  // Ensure active enemy tab is valid
  useEffect(() => {
    const currentTab = parseInt(activeEnemyTab);
    if (
      enemies.length === 0 ||
      currentTab >= enemies.length ||
      isNaN(currentTab)
    ) {
      setActiveEnemyTab("0");
    }
  }, [enemies, activeEnemyTab]);

  // Auto-select X-axis stat based on enemy stats and combat type
  useEffect(() => {
    const currentTabIndex = parseInt(activeEnemyTab);
    if (!isNaN(currentTabIndex) && enemies[currentTabIndex]) {
      const smartStat = selectSmartXAxisStat(
        enemies[currentTabIndex],
        combatType
      );
      setXAxisStat(smartStat);
    }
  }, [enemies, activeEnemyTab, combatType]);

  // Get current enemy
  const currentEnemy = enemies[parseInt(activeEnemyTab)] || defaultEnemy;

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
                <Button
                  onClick={shareState}
                  variant="outline"
                  size="sm"
                  className="h-8"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowImportDialog(true)}
                  size="sm"
                  className="flex-1 py-6"
                >
                  Import Build
                </Button>
                <Button
                  onClick={addBuild}
                  size="sm"
                  className="flex-1 py-6"
                  variant="outline"
                >
                  Add Build
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
                      onRemove={() => removeBuild(index)}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
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
              enemy={currentEnemy}
              xAxisStat={xAxisStat}
              xAxisRange={xAxisRange}
              yMetric={yMetric}
              combatType={combatType}
              attackDirection={attackDirection}
              isPvP={isPvP}
              skillPotency={skillConfig.skillPotency}
              skillFlatAdd={skillConfig.skillFlatAdd}
              hitsPerCast={skillConfig.hitsPerCast}
              weakenSkillPotency={skillConfig.weakenSkillPotency}
              weakenSkillFlatAdd={skillConfig.weakenSkillFlatAdd}
            />
          </div>

          {builds.length > 0 && builds[parseInt(activeBuildTab)] && (
            <DamageFormula
              build={builds[parseInt(activeBuildTab)]}
              enemy={currentEnemy}
              combatType={combatType}
              attackDirection={attackDirection}
              isPvP={isPvP}
              skillPotency={skillConfig.skillPotency}
              skillFlatAdd={skillConfig.skillFlatAdd}
              hitsPerCast={skillConfig.hitsPerCast}
              weakenSkillPotency={skillConfig.weakenSkillPotency}
              weakenSkillFlatAdd={skillConfig.weakenSkillFlatAdd}
            />
          )}
        </div>

        {/* Right sidebar with enemy configuration */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Enemy Configuration</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowEnemyImportDialog(true)}
                size="sm"
                className="flex-1 py-6"
              >
                Import Enemy
              </Button>
              <Button
                onClick={addEnemy}
                size="sm"
                className="flex-1 py-6"
                variant="outline"
              >
                Add Enemy
              </Button>
            </div>

            {enemies.length > 0 && (
              <Tabs
                value={activeEnemyTab}
                onValueChange={setActiveEnemyTab}
                className="w-full"
              >
                <TabsList
                  className="grid w-full"
                  style={{
                    gridTemplateColumns: `repeat(${enemies.length}, 1fr)`,
                  }}
                >
                  {enemies.map((enemy, index) => (
                    <TabsTrigger
                      key={index}
                      value={index.toString()}
                      className="text-xs"
                    >
                      {enemy.name || `Enemy ${index + 1}`}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {enemies.map((enemy, index) => (
                  <TabsContent
                    key={index}
                    value={index.toString()}
                    className="mt-4"
                  >
                    <EnemyForm
                      enemy={enemy}
                      onChange={(updatedEnemy) =>
                        updateEnemy(index, updatedEnemy)
                      }
                      onRemove={() => removeEnemy(index)}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            )}
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

      {showShareNotification && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg animate-in slide-in-from-bottom-2 duration-300">
          URL copied to clipboard!
        </div>
      )}
    </div>
  );
}

export default App;
