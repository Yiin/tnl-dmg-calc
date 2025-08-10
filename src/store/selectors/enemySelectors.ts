import { useStore, defaultEnemy } from '../useStore';
import { useShallow } from 'zustand/react/shallow';

export const useEnemies = () => useStore((state) => state.enemies);

export const useActiveEnemy = () => {
  const enemies = useStore((state) => state.enemies);
  const activeEnemyTab = useStore((state) => state.activeEnemyTab);
  return enemies[parseInt(activeEnemyTab)] || defaultEnemy;
};

export const useEnemyTabState = () => useStore(
  useShallow((state) => ({
    enemies: state.enemies,
    activeEnemyTab: state.activeEnemyTab,
    addEnemy: state.addEnemy,
    updateEnemy: state.updateEnemy,
    updateEnemyProperty: state.updateEnemyProperty,
    removeEnemy: state.removeEnemy,
    importEnemy: state.importEnemy,
    setActiveEnemyTab: state.setActiveEnemyTab,
  }))
);

// Export individual action hooks for better performance
export const useUpdateEnemyProperty = () => useStore((state) => state.updateEnemyProperty);

export const getCurrentEnemy = () => {
  const { enemies, activeEnemyTab } = useStore.getState();
  return enemies[parseInt(activeEnemyTab)] || defaultEnemy;
};