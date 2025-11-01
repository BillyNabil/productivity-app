import { create } from 'zustand';
import { Task, CreateTaskInput, UpdateTaskInput, TasksByQuadrant } from '@/types/task';
import { createClient } from '@/lib/supabase/client';
import { syncService } from '@/lib/services/sync-service';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<Task | null>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  getTasksByQuadrant: () => TasksByQuadrant;
  
  // Realtime subscription
  subscribeToTasks: () => () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ tasks: data || [], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createTask: async (input: CreateTaskInput) => {
    set({ error: null });
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...input, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({ tasks: [data, ...state.tasks] }));

      // Auto-sync ke time block jika ada estimated_duration (due_date optional)
      if (data.estimated_duration) {
        const syncResult = await syncService.syncTaskToTimeBlock(data);
        console.log('✅ Task to TimeBlock sync result:', syncResult);
        if (!syncResult.success) {
          console.warn('⚠️ Sync warning:', syncResult.message);
        }
      } else {
        console.log('⏭️ Skipping sync: estimated_duration not set');
      }

      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },

  updateTask: async (id: string, input: UpdateTaskInput) => {
    set({ error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tasks')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? data : task)),
      }));
      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },

  deleteTask: async (id: string) => {
    set({ error: null });
    try {
      const supabase = createClient();
      const { error } = await supabase.from('tasks').delete().eq('id', id);

      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }));
      return true;
    } catch (error) {
      set({ error: (error as Error).message });
      return false;
    }
  },

  getTasksByQuadrant: () => {
    const tasks = get().tasks;
    return {
      'urgent-important': tasks.filter((t) => t.is_urgent && t.is_important && t.status !== 'completed'),
      'not-urgent-important': tasks.filter((t) => !t.is_urgent && t.is_important && t.status !== 'completed'),
      'urgent-not-important': tasks.filter((t) => t.is_urgent && !t.is_important && t.status !== 'completed'),
      'neither': tasks.filter((t) => !t.is_urgent && !t.is_important && t.status !== 'completed'),
    };
  },

  subscribeToTasks: () => {
    const supabase = createClient();
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            set((state) => ({ tasks: [payload.new as Task, ...state.tasks] }));
          } else if (payload.eventType === 'UPDATE') {
            set((state) => ({
              tasks: state.tasks.map((task) =>
                task.id === payload.new.id ? (payload.new as Task) : task
              ),
            }));
          } else if (payload.eventType === 'DELETE') {
            set((state) => ({
              tasks: state.tasks.filter((task) => task.id !== payload.old.id),
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
