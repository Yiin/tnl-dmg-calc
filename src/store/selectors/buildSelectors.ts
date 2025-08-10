import { useStore } from '../useStore';
import { useShallow } from 'zustand/react/shallow';

export const useBuilds = () => useStore((state) => state.builds);

export const useActiveBuild = () => {
  const builds = useStore((state) => state.builds);
  const activeBuildTab = useStore((state) => state.activeBuildTab);
  return builds[parseInt(activeBuildTab)] || null;
};

export const useBuildTabState = () => useStore(
  useShallow((state) => ({
    builds: state.builds,
    activeBuildTab: state.activeBuildTab,
    addBuild: state.addBuild,
    updateBuild: state.updateBuild,
    updateBuildProperty: state.updateBuildProperty,
    removeBuild: state.removeBuild,
    importBuild: state.importBuild,
    setActiveBuildTab: state.setActiveBuildTab,
  }))
);

// Export individual action hooks for better performance
export const useUpdateBuildProperty = () => useStore((state) => state.updateBuildProperty);

export const getCurrentBuild = () => {
  const { builds, activeBuildTab } = useStore.getState();
  return builds[parseInt(activeBuildTab)] || null;
};