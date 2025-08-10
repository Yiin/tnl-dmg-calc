import { useStore } from '../useStore';
import { useShallow } from 'zustand/react/shallow';

// Use useShallow to prevent infinite loops with object selectors
export const useChartConfig = () => {
  return useStore(
    useShallow((state) => ({
      xAxisStat: state.xAxisStat,
      xAxisRange: state.xAxisRange,
      yMetric: state.yMetric,
      combatType: state.combatType,
      attackDirection: state.attackDirection,
      isPvP: state.isPvP,
      skillConfig: state.skillConfig,
      useCDR: state.useCDR,
      useAttackSpeed: state.useAttackSpeed,
    }))
  );
};