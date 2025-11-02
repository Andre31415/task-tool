import { supabase } from '../lib/supabase';
import type { Task, TimerState, Attachment } from '../types';
import { format, addMinutes } from 'date-fns';

export const taskService = {
  // Get all tasks for a user
  async getTasks(userId: string, includeDeleted = false, includeCompleted = false): Promise<Task[]> {
    try {
      let query = supabase
        .from('tm_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('order', { ascending: true });

      if (!includeDeleted) {
        query = query.eq('deleted', false);
      }
      if (!includeCompleted) {
        query = query.eq('completed', false);
      }

      const { data, error} = await query;

      if (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTasks:', error);
      return [];
    }
  },

  // Get tasks for a specific date
  async getTasksByDate(userId: string, date: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tm_tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks by date:', error);
      return [];
    }
  },

  // Create a new task
  async createTask(userId: string, task: Partial<Task>): Promise<Task | null> {
    try {
      // Get the highest order number
      const { data: maxOrderTask } = await supabase
        .from('tm_tasks')
        .select('order')
        .eq('user_id', userId)
        .order('order', { ascending: false })
        .limit(1)
        .single();

      const newOrder = (maxOrderTask?.order ?? -1) + 1;

      const { data, error } = await supabase
        .from('tm_tasks')
        .insert({
          user_id: userId,
          title: task.title || 'Untitled Task',
          description: task.description || '',
          notes: task.notes || '{}',
          duration: task.duration || 0,
          date: task.date || null,
          tags: task.tags || [],
          order: newOrder,
          parent_id: task.parent_id || null,
          timer_state: task.timer_state || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Calculate timestamps for all tasks
      await this.recalculateTimestamps(userId);

      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  },

  // Update a task
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tm_tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      // If duration or order changed, recalculate timestamps
      if (updates.duration !== undefined || updates.order !== undefined) {
        const task = await this.getTaskById(taskId);
        if (task) {
          await this.recalculateTimestamps(task.user_id);
        }
      }

      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      return null;
    }
  },

  // Get a single task by ID
  async getTaskById(taskId: string): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tm_tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching task:', error);
      return null;
    }
  },

  // Delete a task (soft delete)
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tm_tasks')
        .update({
          deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;

      const task = await this.getTaskById(taskId);
      if (task) {
        await this.recalculateTimestamps(task.user_id);
      }

      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  },

  // Complete a task
  async completeTask(taskId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tm_tasks')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;

      const task = await this.getTaskById(taskId);
      if (task) {
        await this.recalculateTimestamps(task.user_id);
      }

      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      return false;
    }
  },

  // Restore a deleted or completed task
  async restoreTask(taskId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tm_tasks')
        .update({
          completed: false,
          deleted: false,
          completed_at: null,
          deleted_at: null,
        })
        .eq('id', taskId);

      if (error) throw error;

      const task = await this.getTaskById(taskId);
      if (task) {
        await this.recalculateTimestamps(task.user_id);
      }

      return true;
    } catch (error) {
      console.error('Error restoring task:', error);
      return false;
    }
  },

  // Reorder tasks
  async reorderTasks(userId: string, taskIds: string[]): Promise<boolean> {
    try {
      // Update order for each task
      const updates = taskIds.map((id, index) =>
        supabase.from('tasks').update({ order: index }).eq('id', id)
      );

      await Promise.all(updates);

      // Recalculate timestamps
      await this.recalculateTimestamps(userId);

      return true;
    } catch (error) {
      console.error('Error reordering tasks:', error);
      return false;
    }
  },

  // Calculate timestamps for tasks based on their order and duration
  async recalculateTimestamps(userId: string): Promise<void> {
    try {
      const tasks = await this.getTasks(userId, false, false);
      
      // Group tasks by date
      const tasksByDate = tasks.reduce((acc, task) => {
        const date = task.date || 'no-date';
        if (!acc[date]) acc[date] = [];
        acc[date].push(task);
        return acc;
      }, {} as Record<string, Task[]>);

      // Calculate timestamps for each date group
      for (const [date, dateTasks] of Object.entries(tasksByDate)) {
        if (date === 'no-date') continue;

        // Start from current time or 9 AM
        const now = new Date();
        let currentTime = new Date();
        currentTime.setHours(9, 0, 0, 0);

        // If we're past 9 AM today, start from now
        if (now.getHours() >= 9) {
          currentTime = now;
        }

        // Sort by order
        dateTasks.sort((a, b) => a.order - b.order);

        // Calculate start and end times
        for (const task of dateTasks) {
          if (!task.parent_id) { // Only for parent tasks
            const startTime = format(currentTime, 'HH:mm:ss');
            const endTime = format(addMinutes(currentTime, task.duration || 0), 'HH:mm:ss');

            await supabase
              .from('tm_tasks')
              .update({
                start_time: startTime,
                end_time: endTime,
              })
              .eq('id', task.id);

            // Move to next task
            currentTime = addMinutes(currentTime, task.duration || 0);
          }
        }
      }
    } catch (error) {
      console.error('Error recalculating timestamps:', error);
    }
  },

  // Timer management
  async startTimer(taskId: string): Promise<boolean> {
    try {
      const task = await this.getTaskById(taskId);
      if (!task) return false;

      const timerState: TimerState = {
        is_running: true,
        started_at: new Date().toISOString(),
        remaining_minutes: task.duration || 0,
        original_duration: task.duration || 0,
      };

      const { error } = await supabase
        .from('tm_tasks')
        .update({ timer_state: timerState })
        .eq('id', taskId);

      return !error;
    } catch (error) {
      console.error('Error starting timer:', error);
      return false;
    }
  },

  async pauseTimer(taskId: string): Promise<boolean> {
    try {
      const task = await this.getTaskById(taskId);
      if (!task || !task.timer_state) return false;

      const timerState = task.timer_state as TimerState;
      if (!timerState.is_running) return true;

      // Calculate remaining time
      const elapsed = Date.now() - new Date(timerState.started_at!).getTime();
      const elapsedMinutes = Math.floor(elapsed / 60000);
      const remaining = Math.max(0, timerState.remaining_minutes - elapsedMinutes);

      const updatedTimerState: TimerState = {
        ...timerState,
        is_running: false,
        remaining_minutes: remaining,
        started_at: null,
      };

      const { error } = await supabase
        .from('tm_tasks')
        .update({ timer_state: updatedTimerState })
        .eq('id', taskId);

      return !error;
    } catch (error) {
      console.error('Error pausing timer:', error);
      return false;
    }
  },

  async resumeTimer(taskId: string): Promise<boolean> {
    try {
      const task = await this.getTaskById(taskId);
      if (!task || !task.timer_state) return false;

      const timerState = task.timer_state as TimerState;
      if (timerState.is_running) return true;

      const updatedTimerState: TimerState = {
        ...timerState,
        is_running: true,
        started_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('tm_tasks')
        .update({ timer_state: updatedTimerState })
        .eq('id', taskId);

      return !error;
    } catch (error) {
      console.error('Error resuming timer:', error);
      return false;
    }
  },

  // Attachments
  async uploadAttachment(taskId: string, file: File): Promise<Attachment | null> {
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `attachments/${taskId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(filePath);

      // Create attachment record
      const { data, error } = await supabase
        .from('tm_attachments')
        .insert({
          task_id: taskId,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      return null;
    }
  },

  async getAttachments(taskId: string): Promise<Attachment[]> {
    try {
      const { data, error } = await supabase
        .from('tm_attachments')
        .select('*')
        .eq('task_id', taskId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
  },

  async deleteAttachment(attachmentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tm_attachments')
        .delete()
        .eq('id', attachmentId);

      return !error;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      return false;
    }
  },

  // Search tasks
  async searchTasks(userId: string, query: string): Promise<Task[]> {
    try {
      const allTasks = await this.getTasks(userId, false, false);
      const lowerQuery = query.toLowerCase();

      return allTasks.filter(task => {
        const titleMatch = task.title.toLowerCase().includes(lowerQuery);
        const descMatch = task.description.toLowerCase().includes(lowerQuery);
        const tagsMatch = task.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
        return titleMatch || descMatch || tagsMatch;
      });
    } catch (error) {
      console.error('Error searching tasks:', error);
      return [];
    }
  },

  // Bulk operations
  async bulkUpdateTasks(taskIds: string[], updates: Partial<Task>): Promise<boolean> {
    try {
      const updatePromises = taskIds.map(id =>
        supabase
          .from('tm_tasks')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
      );

      await Promise.all(updatePromises);

      // Recalculate timestamps if needed
      if (updates.duration !== undefined || updates.date !== undefined) {
        const task = await this.getTaskById(taskIds[0]);
        if (task) {
          await this.recalculateTimestamps(task.user_id);
        }
      }

      return true;
    } catch (error) {
      console.error('Error in bulk update:', error);
      return false;
    }
  },

  async bulkDeleteTasks(taskIds: string[]): Promise<boolean> {
    try {
      const deletePromises = taskIds.map(id =>
        supabase
          .from('tm_tasks')
          .update({
            deleted: true,
            deleted_at: new Date().toISOString(),
          })
          .eq('id', id)
      );

      await Promise.all(deletePromises);

      if (taskIds.length > 0) {
        const task = await this.getTaskById(taskIds[0]);
        if (task) {
          await this.recalculateTimestamps(task.user_id);
        }
      }

      return true;
    } catch (error) {
      console.error('Error in bulk delete:', error);
      return false;
    }
  },

  // Subscribe to real-time changes
  subscribeToTasks(userId: string, callback: (payload: any) => void) {
    const subscription = supabase
      .channel('tm_tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tm_tasks',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return subscription;
  },
};

