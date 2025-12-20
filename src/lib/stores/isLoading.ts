import { writable, derived } from 'svelte/store';

const taskCount = writable(0);

export const isLoading = derived(taskCount, $count => $count > 0);

/**
 * Add a task with a description
 * @param _desc 
 */
export function addTask(_desc: string) {
  _addTask();
}

/**
 * Complete a task with a description
 * @param _desc of task being completed
 */
export function completeTask(_desc: string) {
  _removeTask();
}

/**
 * Reset all tasks
 */
export function resetTasks() {
  taskCount.set(0);
}

// Intenral
/**
 * Add a task to the taskCount
 */
function _addTask() {
  taskCount.update((n: number) => n + 1);
}

/**
 * Remove a task from the taskCount
 */
function _removeTask() {
  taskCount.update((n: number) => Math.max(0, n - 1));
}