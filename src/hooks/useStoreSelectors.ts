import { useStore } from '../store/useStore';
import { useUIStore } from '../store/selectors';
import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

// Optimized hook for chart data updates
export const useChartDataDependencies = () => {
  return useStore(
    useShallow((state) => ({
      builds: state.builds,
      enemies: state.enemies,
      xAxisStat: state.xAxisStat,
      xAxisRange: state.xAxisRange,
      yMetric: state.yMetric,
      combatType: state.combatType,
      attackDirection: state.attackDirection,
      isPvP: state.isPvP,
      skillConfig: state.skillConfig,
      useCDR: state.useCDR,
      useAttackSpeed: state.useAttackSpeed,
      activeEnemyTab: state.activeEnemyTab,
    }))
  );
};

// Hook for build-specific operations
export const useBuildOperations = (index: number) => {
  const updateBuild = useStore((state) => state.updateBuild);
  const removeBuild = useStore((state) => state.removeBuild);
  
  const handleUpdate = useCallback(
    (build: any) => updateBuild(index, build),
    [index, updateBuild]
  );
  
  const handleRemove = useCallback(
    () => removeBuild(index),
    [index, removeBuild]
  );
  
  return { handleUpdate, handleRemove };
};

// Hook for enemy-specific operations
export const useEnemyOperations = (index: number) => {
  const updateEnemy = useStore((state) => state.updateEnemy);
  const removeEnemy = useStore((state) => state.removeEnemy);
  
  const handleUpdate = useCallback(
    (enemy: any) => updateEnemy(index, enemy),
    [index, updateEnemy]
  );
  
  const handleRemove = useCallback(
    () => removeEnemy(index),
    [index, removeEnemy]
  );
  
  return { handleUpdate, handleRemove };
};

// Hook for dialog state management
export const useDialogState = () => {
  const uiState = useUIStore();
  const { importBuild, importEnemy, clearAll } = useStore(
    useShallow((state) => ({
      importBuild: state.importBuild,
      importEnemy: state.importEnemy,
      clearAll: state.clearAll,
    }))
  ) as any;
  
  return {
    ...uiState,
    importBuild,
    importEnemy,
    clearAll,
  };
};

// Hook for URL state synchronization
export const useUrlSync = () => {
  const loadFromUrl = useStore((state) => state.loadFromUrl);
  
  const handleUrlLoad = useCallback(
    (hash: string) => {
      if (hash.length > 0) {
        loadFromUrl(hash);
      }
    },
    [loadFromUrl]
  );
  
  return { handleUrlLoad };
};