import { create } from 'zustand';
import { TimeBlock, CreateTimeBlockInput, UpdateTimeBlockInput } from '@/types/time-block';
import { createClient } from '@/lib/supabase/client';
import { syncService } from '@/lib/services/sync-service';

interface CalendarStore {
  timeBlocks: TimeBlock[];
  loading: boolean;
  error: string | null;
  selectedDate: Date;
  viewMode: 'day' | 'week' | 'month';
  
  // Actions
  fetchTimeBlocks: (startDate?: Date, endDate?: Date) => Promise<void>;
  createTimeBlock: (input: CreateTimeBlockInput) => Promise<TimeBlock | null>;
  updateTimeBlock: (id: string, input: UpdateTimeBlockInput) => Promise<TimeBlock | null>;
  deleteTimeBlock: (id: string) => Promise<boolean>;
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: 'day' | 'week' | 'month') => void;
  
  // Realtime subscription
  subscribeToTimeBlocks: () => () => void;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  timeBlocks: [],
  loading: false,
  error: null,
  selectedDate: new Date(),
  viewMode: 'week',

  fetchTimeBlocks: async (startDate?: Date, endDate?: Date) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      let query = supabase.from('time_blocks').select('*');

      if (startDate) {
        query = query.gte('start_time', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('end_time', endDate.toISOString());
      }

      const { data, error } = await query.order('start_time', { ascending: true });

      if (error) throw error;
      set({ timeBlocks: data || [], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createTimeBlock: async (input: CreateTimeBlockInput) => {
    set({ error: null });
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('time_blocks')
        .insert([{ ...input, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({ timeBlocks: [...state.timeBlocks, data] }));

      // Auto-sync ke task jika ada task_id, OR update task jika created dari task
      if (data.task_id) {
        const syncResult = await syncService.syncTimeBlockToTask(data);
        console.log('✅ TimeBlock to Task sync result:', syncResult);
        if (!syncResult.success) {
          console.warn('⚠️ Sync warning:', syncResult.message);
        }
      } else {
        console.log('ℹ️ Time block created standalone (no task linked)');
      }

      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },

  updateTimeBlock: async (id: string, input: UpdateTimeBlockInput) => {
    set({ error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('time_blocks')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        timeBlocks: state.timeBlocks.map((block) => 
          block.id === id ? data : block
        ),
      }));

      // Sinkronisasi jika ada perubahan is_completed
      if (input.is_completed !== undefined && data.task_id) {
        const syncResult = await syncService.syncTimeBlockCompletion(data);
        console.log('TimeBlock completion sync result:', syncResult);
      }

      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },

  deleteTimeBlock: async (id: string) => {
    set({ error: null });
    try {
      const supabase = createClient();
      
      // Get time block info sebelum delete untuk sinkronisasi
      const { data: timeBlock } = await supabase
        .from('time_blocks')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase.from('time_blocks').delete().eq('id', id);

      if (error) throw error;

      set((state) => ({
        timeBlocks: state.timeBlocks.filter((block) => block.id !== id),
      }));

      // Sinkronisasi jika time block di-link ke task
      if (timeBlock && timeBlock.task_id) {
        const syncResult = await syncService.syncTimeBlockDeletion(id, timeBlock.task_id);
        console.log('TimeBlock deletion sync result:', syncResult);
      }

      return true;
    } catch (error) {
      set({ error: (error as Error).message });
      return false;
    }
  },

  setSelectedDate: (date: Date) => {
    set({ selectedDate: date });
  },

  setViewMode: (mode: 'day' | 'week' | 'month') => {
    set({ viewMode: mode });
  },

  subscribeToTimeBlocks: () => {
    const supabase = createClient();
    const channel = supabase
      .channel('time-blocks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_blocks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            set((state) => ({ 
              timeBlocks: [...state.timeBlocks, payload.new as TimeBlock] 
            }));
          } else if (payload.eventType === 'UPDATE') {
            set((state) => ({
              timeBlocks: state.timeBlocks.map((block) =>
                block.id === payload.new.id ? (payload.new as TimeBlock) : block
              ),
            }));
          } else if (payload.eventType === 'DELETE') {
            set((state) => ({
              timeBlocks: state.timeBlocks.filter((block) => block.id !== payload.old.id),
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
