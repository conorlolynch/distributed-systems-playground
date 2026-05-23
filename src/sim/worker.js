import { cpu } from "./simulation";

/**
 * Represents a worker in the distributed system.
 */
export class TaskWorker {
  static workers = new Map();

  constructor() {
    this.id = Math.random().toString(36).slice(2, 8);

    // Worker processing state
    this.idle = false;
    this.request = { title: "Startup" };

    this.currentTask = null;
    this.taskQueue = [];
    this.maxQueueSize = 100; // Max number of tasks this worker can queue before rejecting new tasks

    // Add this new worker instance to the static map
    TaskWorker.workers.set(this.id, this);
  }

  /**
   * Gets a worker instance by its ID.
   * @param {int} id The ID of the worker to retrieve.
   * @returns {TaskWorker | null} The worker instance, or null if not found.
   */
  static getWorker(id) {
    return TaskWorker.workers.get(id);
  }

  /**
   * Adds the provided task to the worker's task queue for processing.
   * If the queue has reached its maximum size, a warning is logged to the console and the task is rejected.
   *
   * @param {Object} task - The task object to be added to the queue.
   * @returns {boolean} Whether the task was successfully added to the queue.
   *
   * @note
   * Consider implementing cross-validation of tasks at all instance levels
   * by extracting validateTask as a global function in the CPU module.
   */
  addTask(task) {
    if (this.taskQueue.length > this.maxQueueSize) {
      console.warn(
        `Worker ${this.id} task queue is full. Task rejected:`,
        task,
      );
      return false;
    }

    this.taskQueue.push(task);
    return true;
  }

  /**
   * Returns the first task in the worker's task queue. Sets this task as the worker's current task.
   * @returns {Object | null} The dispatched task, or null if the queue is empty.
   */
  getNextTask() {
    if (this.taskQueue.length === 0) {
      return null;
    }

    const task = this.taskQueue.shift();
    this.currentTask = task;
    return task;
  }

  /**
   * Destroys this worker instance by removing it reference from the static map.
   * Will only destroy if the worker is idle. Otherwise, it returns false.
   * @returns {boolean} Whether this worker instance was successfully removed from the static map.
   */
  destroy() {
    if (!this.idle) return false;
    return TaskWorker.workers.delete(this.id);
  }
}
