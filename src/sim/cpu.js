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
    this.tasksComplete = 0;

    this.cachedState = null; // Cache for the CPU state to optimize React re-renders

    // The maximum number of tasks that can be queued at once. Simulates the CPU's ability to buffer incoming tasks before it becomes overwhelmed.
    this.maxQueueSize = 4;

    // Listeners for external subscribers (e.g. React components)
    this.listeners = new Set();
  }

  getState = () => {
    const newState = {
      freeIndexes: this.freeIndexes,
      tokens: this.tokens,
      queue: this.queue,
      tasksComplete: this.tasksComplete,
    };

    if (!this.cachedState) {
      this.cachedState = newState;
    }

    return this.cachedState;
  };

  /**
   * Adds a new task to the CPU's processing queue.
   * @param {Object} task - The task object to be added to the queue.
   */
  addTask(task) {
    if (this.queue.length >= this.maxQueueSize) {
      console.warn("CPU queue is full. Task rejected:", task);
      return;
    }

    this.queue.push(task);
    console.log(
      `CPU: Added task (${task.id}) to queue - Queue length: ${this.queue.length}`,
    );
  }

  /**
   * Checks if there are any free CPU Tokens (cores) available to process new tasks.
   * @returns {boolean} True if there is at least one free core, false otherwise.
   */
  hasFreeCore() {
    return this.freeIndexes.size > 0;
  }

  canJoinQueue() {
    return this.queue.length < this.maxQueueSize;
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
   * Loads the next task into a free core, sets the tasks start, and end time if duration of task is provided.
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

    // Calulate the estimated end time for this task based on its estimated duration.
    // This simulates the processing of the task by the CPU core.
    // Instead of the CPU actually doing this work, we just delay the completion of the task to give the sense that work is being done.
    nextTask.startTime = performance.now();
    nextTask.endTime = nextTask.startTime + (nextTask.duration || 10);

    // 2) Assign this task to the free token and core. Remove the token from the free set so it's not assigned again.
    this.tokens[freeIndex] = nextTask;
    this.freeIndexes.delete(freeIndex);

    // Finally return the task that is now being processed by the CPU core
    return nextTask;
  }

  /**
   * Executes a task by invoking its execute callback function.
   * Logs the task execution with a timestamp, task ID, task name, and the simulated delay duration.
   *
   * @param {Object} task - The task object to execute
   * @param {string} task.id - Unique identifier for the task
   * @param {string} task.name - Human-readable name of the task
   * @param {number} [task.duration] - Simulated delay in milliseconds before task execution (optional)
   * @param {Function} [task.execute] - Callback function to execute. Only runs if this property exists
   */
  runTask(task) {
    if (task.execute) {
      const waited = task.duration ?? 0;
      console.log(
        `[${new Date().toISOString()}] [Task ${task.id}] Executing "${task.name}" after ${waited}ms simulated delay`,
      );
      task.execute();
    }
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
    this.tasksComplete += 1;
    console.log(
      `CPU: Task complete. Total tasks complete: ${this.tasksComplete}.`,
    );
    // Notify subscribers that the CPU state changed
    this.emit();
    return true;
  }

  tick(dt = 16) {
    // TODO: move away from performance.now and use the dt paramter to track task progress

    // Fill free cores from queue
    while (this.hasFreeCore() && this.queue.length > 0) {
      this.loadNextTask();
    }

    // Running tasks, and release any that are finished
    this.tokens.forEach((task, index) => {
      if (task && !this.freeIndexes.has(index)) {
        if (performance.now() >= task.endTime) {
          // If the task has exceeded its estimated duration, try execute any executable code it has
          this.runTask(task);

          // Finally, release the token back to the pool.
          this.releaseTask(index);
        }
      }
    });

    // todo: check if this breaks anything
    this.emit();
  }

  // Subscribe to CPU state changes. Returns an unsubscribe function.
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  // Emit state change to all listeners
  emit = () => {
    this.listeners.forEach((l) => l());
  };
}
