import { create } from 'zustand';
import { HandRecord } from '../types';
import { handRecordsApi } from '../api/api';

interface HandRecordState {
  handRecords: HandRecord[];
  currentHandRecord: HandRecord | null;
  isLoading: boolean;
  error: string | null;
}

interface HandRecordActions {
  fetchHandRecords: () => Promise<void>;
  fetchHandRecord: (id: string) => Promise<void>;
  createHandRecord: (handRecord: Omit<HandRecord, 'id'>) => Promise<void>;
  updateHandRecord: (id: string, handRecord: Partial<HandRecord>) => Promise<void>;
  deleteHandRecord: (id: string) => Promise<void>;
  setCurrentHandRecord: (handRecord: HandRecord | null) => void;
  clearError: () => void;
}

type HandRecordStore = HandRecordState & HandRecordActions;

export const useHandRecordStore = create<HandRecordStore>()((set) => ({
  handRecords: [],
  currentHandRecord: null,
  isLoading: false,
  error: null,
  fetchHandRecords: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await handRecordsApi.getAll();
      if (response.success) {
        set({ handRecords: response.data, isLoading: false });
      } else {
        set({ error: response.message || 'Failed to fetch hand records', isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch hand records',
        isLoading: false,
      });
    }
  },
  fetchHandRecord: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await handRecordsApi.getById(id);
      if (response.success) {
        set({ currentHandRecord: response.data, isLoading: false });
      } else {
        set({ error: response.message || 'Failed to fetch hand record', isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch hand record',
        isLoading: false,
      });
    }
  },
  createHandRecord: async (handRecord) => {
    set({ isLoading: true, error: null });
    try {
      const response = await handRecordsApi.create(handRecord);
      if (response.success) {
        set((state) => ({
          handRecords: [...state.handRecords, response.data],
          currentHandRecord: response.data,
          isLoading: false,
        }));
      } else {
        set({ error: response.message || 'Failed to create hand record', isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create hand record',
        isLoading: false,
      });
    }
  },
  updateHandRecord: async (id, handRecord) => {
    set({ isLoading: true, error: null });
    try {
      const response = await handRecordsApi.update(id, handRecord);
      if (response.success) {
        set((state) => ({
          handRecords: state.handRecords.map((record) =>
            record.id === id ? response.data : record
          ),
          currentHandRecord: response.data,
          isLoading: false,
        }));
      } else {
        set({ error: response.message || 'Failed to update hand record', isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update hand record',
        isLoading: false,
      });
    }
  },
  deleteHandRecord: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await handRecordsApi.delete(id);
      if (response.success) {
        set((state) => ({
          handRecords: state.handRecords.filter((record) => record.id !== id),
          currentHandRecord: state.currentHandRecord?.id === id ? null : state.currentHandRecord,
          isLoading: false,
        }));
      } else {
        set({ error: response.message || 'Failed to delete hand record', isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete hand record',
        isLoading: false,
      });
    }
  },
  setCurrentHandRecord: (handRecord) => {
    set({ currentHandRecord: handRecord });
  },
  clearError: () => {
    set({ error: null });
  },
}));
