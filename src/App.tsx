import { useEffect, lazy, Suspense, memo } from "react";
import { useStore } from "./store/useStore";
import { 
  useUIStore,
  useBuilds,
  useActiveEnemy,
  useChartConfig,
  useBuildTabState,
  useEnemyTabState
} from "./store/selectors";
import { shallow } from "zustand/shallow";
import { BuildForm } from "./components/BuildForm";
import { EnemyForm } from "./components/EnemyForm";
import { ChartControls } from "./components/ChartControls";
import { ImportDialog } from "./components/ImportDialog";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { SkillConfigForm } from "./components/SkillConfigForm";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Trash2, Share2 } from "lucide-react";
import { serializeState } from "./utils/urlState";

// Lazy load heavy components
const DamageChart = lazy(() => import("./components/DamageChart").then(m => ({ default: m.DamageChart })));
const DamageFormula = lazy(() => import("./components/DamageFormula").then(m => ({ default: m.DamageFormula })));

// Memoized BuildTabs component
const BuildTabs = memo(() => {
  const { 
    builds, 
    activeBuildTab, 
    addBuild, 
    updateBuild,
    updateBuildProperty, 
    removeBuild,
    setActiveBuildTab 
  } = useBuildTabState() as any;
  
  const setShowImportDialog = useUIStore((state) => state.setShowImportDialog);
  const setShowClearConfirm = useUIStore((state) => state.setShowClearConfirm);
  
  const shareState = useStore((state) => state.shareState);
  const speedLimiter = useStore((state) => state.speedLimiter);
  const setSpeedLimiter = useStore((state) => state.setSpeedLimiter);

  return (
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
              className="flex w-full overflow-x-auto overflow-y-hidden tabs-scrollable"
              style={{
                flexWrap: "nowrap",
              }}
            >
              {builds.map((build: any, index: number) => (
                <TabsTrigger
                  key={index}
                  value={index.toString()}
                  className="text-xs flex-shrink-0 min-w-[100px]"
                >
                  {build.name || `Build ${index + 1}`}
                </TabsTrigger>
              ))}
            </TabsList>
            {builds.map((build: any, index: number) => (
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
                  onPropertyChange={(key, value) =>
                    updateBuildProperty(index, key, value)
                  }
                  onRemove={() => removeBuild(index)}
                  speedLimiter={speedLimiter}
                  onSpeedLimiterChange={setSpeedLimiter}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
});

// Memoized EnemyTabs component
const EnemyTabs = memo(() => {
  const { 
    enemies, 
    activeEnemyTab, 
    addEnemy, 
    updateEnemy,
    updateEnemyProperty, 
    removeEnemy, 
    setActiveEnemyTab 
  } = useEnemyTabState() as any;
  
  const setShowEnemyImportDialog = useUIStore((state) => state.setShowEnemyImportDialog);

  return (
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
              className="flex w-full overflow-x-auto overflow-y-hidden tabs-scrollable"
              style={{
                flexWrap: "nowrap",
              }}
            >
              {enemies.map((enemy: any, index: number) => (
                <TabsTrigger
                  key={index}
                  value={index.toString()}
                  className="text-xs flex-shrink-0 min-w-[100px]"
                >
                  {enemy.name || `Enemy ${index + 1}`}
                </TabsTrigger>
              ))}
            </TabsList>
            {enemies.map((enemy: any, index: number) => (
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
                  onPropertyChange={(key, value) =>
                    updateEnemyProperty(index, key, value)
                  }
                  onRemove={() => removeEnemy(index)}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
});

function App() {
  // UI state from separate store
  const uiState = useUIStore();
  
  // Only subscribe to essential state for URL management
  const loadFromUrl = useStore((state) => state.loadFromUrl);
  const clearAll = useStore((state) => state.clearAll);
  
  // Use specific selectors for data needed in App
  const builds = useBuilds();
  const currentEnemy = useActiveEnemy();
  const chartConfig = useChartConfig() as any;
  const activeBuildTab = useStore((state) => state.activeBuildTab);
  
  // Chart control actions
  const setXAxisStat = useStore((state) => state.setXAxisStat);
  const setXAxisRange = useStore((state) => state.setXAxisRange);
  const setYMetric = useStore((state) => state.setYMetric);
  const setCombatType = useStore((state) => state.setCombatType);
  const setAttackDirection = useStore((state) => state.setAttackDirection);
  const setIsPvP = useStore((state) => state.setIsPvP);
  const setSkillConfig = useStore((state) => state.setSkillConfig);
  
  // Build/Enemy actions for dialogs
  const importBuild = useStore((state) => state.importBuild);
  const importEnemy = useStore((state) => state.importEnemy);

  // Load from URL hash on mount if present
  useEffect(() => {
    if (window.location.hash.length > 1) {
      const hash = window.location.hash.substring(1);
      loadFromUrl(hash);
    }
  }, []); // Remove loadFromUrl dependency since it's stable

  // Update URL hash when in sharing mode - subscribe to specific state
  useEffect(() => {
    if (window.location.hash.length > 1) {
      // Subscribe to state changes
      const unsubscribe = useStore.subscribe(
        (state) => ({
          builds: state.builds,
          enemies: state.enemies,
          xAxisStat: state.xAxisStat,
          xAxisRange: state.xAxisRange,
          yMetric: state.yMetric,
          combatType: state.combatType,
          attackDirection: state.attackDirection,
          isPvP: state.isPvP,
          skillConfig: state.skillConfig,
          activeBuildTab: state.activeBuildTab,
          activeEnemyTab: state.activeEnemyTab,
        }),
        (currentState) => {
          const hash = serializeState(currentState);
          window.history.replaceState(null, "", `#${hash}`);
        },
        { equalityFn: shallow }
      );
      
      return () => unsubscribe();
    }
  }, []); // Only run once on mount

  // Subscribe to tab validation and auto-detection logic
  useEffect(() => {
    // This will only run when specific state changes
    const unsubscribe = useStore.subscribe(
      (state) => ({
        builds: state.builds,
        enemies: state.enemies,
        activeBuildTab: state.activeBuildTab,
        activeEnemyTab: state.activeEnemyTab,
        combatType: state.combatType,
      }),
      (current, previous) => {
        const { 
          setActiveBuildTab, 
          setActiveEnemyTab, 
          setCombatType, 
          setXAxisStat,
          detectDominantCombatType,
          selectSmartXAxisStat 
        } = useStore.getState();
        
        // Validate build tab
        const currentBuildTab = parseInt(current.activeBuildTab);
        if (
          current.builds.length === 0 ||
          currentBuildTab >= current.builds.length ||
          isNaN(currentBuildTab)
        ) {
          setActiveBuildTab("0");
        }
        
        // Auto-detect combat type when active build changes
        if (current.activeBuildTab !== previous.activeBuildTab || 
            current.builds !== previous.builds) {
          const tabIndex = parseInt(current.activeBuildTab);
          if (!isNaN(tabIndex) && current.builds[tabIndex]) {
            const dominantType = detectDominantCombatType(current.builds[tabIndex]);
            setCombatType(dominantType);
          }
        }
        
        // Validate enemy tab
        const currentEnemyTab = parseInt(current.activeEnemyTab);
        if (
          current.enemies.length === 0 ||
          currentEnemyTab >= current.enemies.length ||
          isNaN(currentEnemyTab)
        ) {
          setActiveEnemyTab("0");
        }
        
        // Auto-select X-axis stat
        if (current.activeEnemyTab !== previous.activeEnemyTab || 
            current.enemies !== previous.enemies ||
            current.combatType !== previous.combatType) {
          const enemyTabIndex = parseInt(current.activeEnemyTab);
          if (!isNaN(enemyTabIndex) && current.enemies[enemyTabIndex]) {
            const smartStat = selectSmartXAxisStat(
              current.enemies[enemyTabIndex],
              current.combatType
            );
            setXAxisStat(smartStat);
          }
        }
      },
      { equalityFn: shallow, fireImmediately: true }
    );
    
    return () => unsubscribe();
  }, []);


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
        <BuildTabs />

        {/* Main chart area */}
        <div className="lg:col-span-2 space-y-6">
          <SkillConfigForm config={chartConfig.skillConfig} onChange={setSkillConfig} />

          <ChartControls
            xAxisStat={chartConfig.xAxisStat}
            onXAxisChange={setXAxisStat}
            xAxisRange={chartConfig.xAxisRange}
            onXAxisRangeChange={setXAxisRange}
            yMetric={chartConfig.yMetric}
            onYMetricChange={setYMetric}
            combatType={chartConfig.combatType}
            onCombatTypeChange={setCombatType}
            attackDirection={chartConfig.attackDirection}
            onAttackDirectionChange={setAttackDirection}
            isPvP={chartConfig.isPvP}
            onIsPvPChange={setIsPvP}
          />

          <div className="min-h-[500px]">
            <Suspense fallback={<div className="flex items-center justify-center h-[400px]">Loading chart...</div>}>
              <DamageChart
                builds={builds}
                enemy={currentEnemy}
                xAxisStat={chartConfig.xAxisStat}
                xAxisRange={chartConfig.xAxisRange}
                yMetric={chartConfig.yMetric}
                combatType={chartConfig.combatType}
                attackDirection={chartConfig.attackDirection}
                isPvP={chartConfig.isPvP}
                skillPotency={chartConfig.skillConfig.skillPotency}
                skillFlatAdd={chartConfig.skillConfig.skillFlatAdd}
                hitsPerCast={chartConfig.skillConfig.hitsPerCast}
                weakenSkillPotency={chartConfig.skillConfig.weakenSkillPotency}
                weakenSkillFlatAdd={chartConfig.skillConfig.weakenSkillFlatAdd}
                cooldownTime={chartConfig.skillConfig.cooldownTime}
                castTime={chartConfig.skillConfig.castTime}
                skillCooldownSpecialization={chartConfig.skillConfig.skillCooldownSpecialization}
                speedLimiter={chartConfig.speedLimiter}
              />
            </Suspense>
          </div>

          {builds.length > 0 && builds[parseInt(activeBuildTab)] && (
            <Suspense fallback={<div className="flex items-center justify-center h-[200px]">Loading formula...</div>}>
              <DamageFormula
                build={builds[parseInt(activeBuildTab)]}
                enemy={currentEnemy}
                combatType={chartConfig.combatType}
                attackDirection={chartConfig.attackDirection}
                isPvP={chartConfig.isPvP}
                skillPotency={chartConfig.skillConfig.skillPotency}
                skillFlatAdd={chartConfig.skillConfig.skillFlatAdd}
                hitsPerCast={chartConfig.skillConfig.hitsPerCast}
                weakenSkillPotency={chartConfig.skillConfig.weakenSkillPotency}
                weakenSkillFlatAdd={chartConfig.skillConfig.weakenSkillFlatAdd}
                cooldownTime={chartConfig.skillConfig.cooldownTime}
                castTime={chartConfig.skillConfig.castTime}
                skillCooldownSpecialization={chartConfig.skillConfig.skillCooldownSpecialization}
              />
            </Suspense>
          )}
        </div>

        {/* Right sidebar with enemy configuration */}
        <EnemyTabs />
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
        isOpen={uiState.showImportDialog}
        onClose={() => uiState.setShowImportDialog(false)}
        onImportBuild={importBuild}
        onImportEnemy={importEnemy}
        mode="build"
      />

      <ImportDialog
        isOpen={uiState.showEnemyImportDialog}
        onClose={() => uiState.setShowEnemyImportDialog(false)}
        onImportBuild={importBuild}
        onImportEnemy={importEnemy}
        mode="enemy"
      />

      <ConfirmDialog
        isOpen={uiState.showClearConfirm}
        onClose={() => uiState.setShowClearConfirm(false)}
        onConfirm={clearAll}
        title="Clear All Data"
        description="This will remove all builds, reset the enemy configuration, and clear all chart settings. This action cannot be undone."
        confirmText="Clear All"
        confirmVariant="destructive"
      />

      {uiState.showShareNotification && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg animate-in slide-in-from-bottom-2 duration-300">
          URL copied to clipboard!
        </div>
      )}
    </div>
  );
}

export default App;