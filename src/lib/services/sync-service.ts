import { createClient } from '@/lib/supabase/client';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task';
import { TimeBlock, CreateTimeBlockInput, UpdateTimeBlockInput } from '@/types/time-block';
import { addMinutes, parseISO } from 'date-fns';

export interface SyncResult {
  success: boolean;
  message: string;
  syncedId?: string;
}

/**
 * Service untuk mengelola sinkronisasi dua arah antara Task dan Time Block
 */
export class SyncService {
  private supabase = createClient();

  /**
   * Saat membuat task baru dengan durasi dan due_date,
   * otomatis buat time block sesuai waktu task tersebut
   */
  async syncTaskToTimeBlock(task: Task): Promise<SyncResult> {
    try {
      // Hanya sync jika task memiliki estimated_duration (due_date optional)
      if (!task.estimated_duration) {
        return {
          success: false,
          message: 'Task harus memiliki estimated_duration untuk di-sync ke time block',
        };
      }

      // Cari jika sudah ada time block untuk task ini
      const { data: existingBlock } = await this.supabase
        .from('time_blocks')
        .select('id')
        .eq('task_id', task.id)
        .single();

      if (existingBlock) {
        return {
          success: false,
          message: 'Time block untuk task ini sudah ada',
          syncedId: existingBlock.id,
        };
      }

      // Buat start_time: gunakan due_date jika ada, atau hari ini pukul 09:00
      let startTime = new Date();
      if (task.due_date) {
        const dueDate = parseISO(task.due_date);
        startTime = new Date(dueDate);
      }
      startTime.setHours(9, 0, 0, 0);

      // Hitung end_time berdasarkan estimated_duration
      const endTime = addMinutes(startTime, task.estimated_duration);

      // Tentukan tipe time block berdasarkan urgency/importance task
      let timeBlockType: 'work' | 'break' | 'buffer' | 'meeting' = 'work';
      if (task.is_urgent && task.is_important) {
        timeBlockType = 'work';
      } else if (task.is_important) {
        timeBlockType = 'work';
      }

      const timeBlockData: CreateTimeBlockInput = {
        task_id: task.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        type: timeBlockType,
        notes: `Auto-synced from task: ${task.title}`,
      };

      const { data, error } = await this.supabase
        .from('time_blocks')
        .insert([{ ...timeBlockData, user_id: task.user_id }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Time block created:', data.id, 'for task:', task.id);

      return {
        success: true,
        message: 'Task berhasil di-sync ke time block',
        syncedId: data.id,
      };
    } catch (error) {
      console.error('❌ Error syncing task to time block:', error);
      return {
        success: false,
        message: `Gagal sinkronisasi: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Saat membuat time block baru dengan task_id,
   * update task status dan tambahkan informasi time block
   */
  async syncTimeBlockToTask(timeBlock: TimeBlock): Promise<SyncResult> {
    try {
      // Hanya sync jika time block linked ke task
      if (!timeBlock.task_id) {
        console.log('⏭️ Time block not linked to task, skipping sync');
        return {
          success: false,
          message: 'Time block harus di-link ke task untuk di-sync',
        };
      }

      console.log('🔄 Syncing time block:', timeBlock.id, '-> task:', timeBlock.task_id);

      // Fetch task
      const { data: task, error: fetchError } = await this.supabase
        .from('tasks')
        .select('*')
        .eq('id', timeBlock.task_id)
        .single();

      if (fetchError) throw fetchError;

      console.log('📋 Found task:', task.title, 'current status:', task.status);

      // Update task status menjadi in_progress jika belum
      if (task.status === 'pending') {
        console.log('📝 Updating task status to in_progress...');
        const { error: updateError } = await this.supabase
          .from('tasks')
          .update({ status: 'in_progress' })
          .eq('id', timeBlock.task_id);

        if (updateError) throw updateError;
        console.log('✅ Task status updated to in_progress');
      } else {
        console.log('ℹ️ Task status already:', task.status, '(not updating)');
      }

      return {
        success: true,
        message: 'Time block berhasil di-sync ke task',
        syncedId: timeBlock.task_id,
      };
    } catch (error) {
      console.error('❌ Error syncing time block to task:', error);
      return {
        success: false,
        message: `Gagal sinkronisasi: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Sinkronisasi status ketika time block di-complete
   */
  async syncTimeBlockCompletion(timeBlock: TimeBlock): Promise<SyncResult> {
    try {
      if (!timeBlock.task_id || !timeBlock.is_completed) {
        return {
          success: false,
          message: 'Invalid time block data',
        };
      }

      // Check apakah semua time blocks untuk task ini sudah completed
      const { data: allBlocks } = await this.supabase
        .from('time_blocks')
        .select('id, is_completed')
        .eq('task_id', timeBlock.task_id);

      const allCompleted = allBlocks?.every(block => block.is_completed) ?? false;

      if (allCompleted) {
        // Update task status menjadi completed
        const { error } = await this.supabase
          .from('tasks')
          .update({ status: 'completed' })
          .eq('id', timeBlock.task_id);

        if (error) throw error;

        return {
          success: true,
          message: 'Task status updated to completed',
          syncedId: timeBlock.task_id,
        };
      }

      return {
        success: true,
        message: 'Time block marked as completed',
        syncedId: timeBlock.id,
      };
    } catch (error) {
      console.error('Error syncing time block completion:', error);
      return {
        success: false,
        message: `Gagal sinkronisasi: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Sinkronisasi penghapusan time block ke task
   */
  async syncTimeBlockDeletion(timeBlockId: string, taskId: string): Promise<SyncResult> {
    try {
      // Check apakah ada time blocks lain untuk task ini
      const { data: otherBlocks } = await this.supabase
        .from('time_blocks')
        .select('id')
        .eq('task_id', taskId)
        .neq('id', timeBlockId);

      // Jika tidak ada time blocks lain, update task status kembali ke pending
      if (!otherBlocks || otherBlocks.length === 0) {
        const { error } = await this.supabase
          .from('tasks')
          .update({ status: 'pending' })
          .eq('id', taskId);

        if (error) throw error;

        return {
          success: true,
          message: 'Task status updated back to pending',
          syncedId: taskId,
        };
      }

      return {
        success: true,
        message: 'Time block deleted',
        syncedId: timeBlockId,
      };
    } catch (error) {
      console.error('Error syncing time block deletion:', error);
      return {
        success: false,
        message: `Gagal sinkronisasi: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Dapatkan semua time blocks untuk task tertentu
   */
  async getTaskTimeBlocks(taskId: string): Promise<TimeBlock[]> {
    try {
      const { data, error } = await this.supabase
        .from('time_blocks')
        .select('*')
        .eq('task_id', taskId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching task time blocks:', error);
      return [];
    }
  }

  /**
   * Dapatkan task yang di-link ke time block
   */
  async getTimeBlockTask(taskId: string): Promise<Task | null> {
    try {
      const { data, error } = await this.supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching time block task:', error);
      return null;
    }
  }

  /**
   * Update estimated_duration task berdasarkan total durasi time blocks
   */
  async updateTaskDurationFromTimeBlocks(taskId: string): Promise<SyncResult> {
    try {
      const timeBlocks = await this.getTaskTimeBlocks(taskId);
      
      if (timeBlocks.length === 0) {
        return {
          success: false,
          message: 'Tidak ada time blocks untuk task ini',
        };
      }

      // Hitung total durasi
      const totalDuration = timeBlocks.reduce((sum, block) => {
        const start = new Date(block.start_time);
        const end = new Date(block.end_time);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60); // dalam menit
        return sum + duration;
      }, 0);

      // Update task
      const { error } = await this.supabase
        .from('tasks')
        .update({ estimated_duration: Math.round(totalDuration) })
        .eq('id', taskId);

      if (error) throw error;

      return {
        success: true,
        message: `Task duration updated to ${Math.round(totalDuration)} minutes`,
        syncedId: taskId,
      };
    } catch (error) {
      console.error('Error updating task duration:', error);
      return {
        success: false,
        message: `Gagal update durasi: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

export const syncService = new SyncService();
