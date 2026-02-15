/**
 * Represents a simulated CPU with multiple cores (tokens) for processing tasks.
 * Manages a queue of tasks and assigns them to available CPU cores for concurrent processing.
 * Each core can process one task at a time, and completed tasks release their token back to the pool.
 *
 * @class CPU
 * @property {Set<number>} freeIndexes - Set of available core indices ready to process new tasks
 * @property {Array<Object|null>} tokens - Array representing CPU cores, each holding a task or null if idle
 * @property {Array<Object>} queue - FIFO queue of tasks waiting to be processed
 */
export class CPU {
  constructor() {
    // Maps CPU tokens (cores) to the task being processed
    this.freeIndexes = new Set([0, 1, 2, 3, 4, 5, 6, 7]); // 8-core CPU
    this.tokens = [null, null, null, null, null, null, null, null]; // 8-core CPU
    this.queue = [];

    // The maximum number of tasks that can be queued at once. Simulates the CPU's ability to buffer incoming tasks before it becomes overwhelmed.
    this.maxQueueSize = 100;
  }

  /**
   * Adds a new task to the CPU's processing queue.
   * @param {Object} task - The task to be added to the queue.
   * @param {string} task.id - Unique identifier for the task.
   * @param {string} task.name - A descriptive name for the task.
   * @param {number} task.duration - Time in milliseconds that the task takes to complete.
   * @param {function} task.execute - A function that simulates the execution of the task.
   */
  addTask(task) {
    this.queue.push(task);
    console.log(`Added task. Queue:`, this.queue);
  }

  /**
   * Checks if there are any free CPU Tokens (cores) available to process new tasks.
   * @returns {boolean} True if there is at least one free core, false otherwise.
   */
  hasFreeCore() {
    return this.freeIndexes.size > 0;
  }

  /**
   * Checks for completed tasks and releases their tokens back to the pool of available CPU cores.
   * This should be called periodically (e.g., in a game loop) to ensure that completed tasks free up resources for new tasks.
   */
  clearFinishedTasks() {
    this.tokens.forEach((task, index) => {
      if (task && performance.now() >= task.endTime) {
        this.releaseTask(index);
      }
    });
  }

  /**
   * Loads the next task from the top of the queue for processing.
   * @returns {Object|null} The task that is now being processed by a CPU core, or null if no task was loaded (e.g., no free cores or empty queue).
   */
  loadNextTask() {
    // Check if there are any free cores available.
    if (this.freeIndexes.size === 0) return null;

    // Get the next task from the queue.
    const nextTask = this.queue.shift();
    if (!nextTask) return null;

    // Get an available token (core) to give this task to
    const freeIndex = this.freeIndexes.values().next().value;
    if (freeIndex === undefined) {
      // For some reason there are no free tokens, handle this edge case and put the task back in the queue
      this.queue.unshift(nextTask);
      return null;
    }

    nextTask.startTime = performance.now();

    // 2) Assign this task to the free token and core. Remove the token from the free set so it's not assigned again.
    this.tokens[freeIndex] = nextTask;
    this.freeIndexes.delete(freeIndex);

    // Finally return the task that is now being processed by the CPU core
    return nextTask;
  }

  /**
   * Releases a CPU token.
   * @param {number} tokenIndex - The index of the token to release.
   * @return {boolean} - Returns true if the token was successfully released, false otherwise.
   */
  releaseTask(tokenIndex) {
    if (tokenIndex < 0 || tokenIndex >= this.tokens.length) {
      throw new Error("Invalid token index");
    }
    this.tokens[tokenIndex] = null;
    this.freeIndexes.add(tokenIndex);
    return true;
  }
}

/* 

There is a difference between Worker Pool and CPU (cpu core = workers, tokens etc)
Worker Pool is an abstraction of cpu and memory, preventing the cpu and memory from being overloaded with request data, deciding how to control the flow of requests to cpu and memory.

CPU has a cpu queue of tasks to process from many instances e.g. cache, db etc
CPU cores (tokens) are the actual processing units that execute tasks.

*/
