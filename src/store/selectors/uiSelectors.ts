import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  showImportDialog: boolean;
  showEnemyImportDialog: boolean;
  showClearConfirm: boolean;
  showShareNotification: boolean;
  setShowImportDialog: (show: boolean) => void;
  setShowEnemyImportDialog: (show: boolean) => void;
  setShowClearConfirm: (show: boolean) => void;
  setShowShareNotification: (show: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      showImportDialog: false,
      showEnemyImportDialog: false,
      showClearConfirm: false,
      showShareNotification: false,
      setShowImportDialog: (show) => set({ showImportDialog: show }, false, 'setShowImportDialog'),
      setShowEnemyImportDialog: (show) => set({ showEnemyImportDialog: show }, false, 'setShowEnemyImportDialog'),
      setShowClearConfirm: (show) => set({ showClearConfirm: show }, false, 'setShowClearConfirm'),
      setShowShareNotification: (show) => set({ showShareNotification: show }, false, 'setShowShareNotification'),
    }),
    { name: 'ui-store' }
  )
);