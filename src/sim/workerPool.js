export class WorkerPool {
  constructor() {
    this.id = Math.random().toString(36).slice(2, 8);
    this.listeners = new Set();
    this.cachedState = null;

    // Tasks that are awaiting to be passed to the CPU yet.
    this.pendingTasks = [];
  }

  /**
   * Adds a new task to the worker pool's pending tasks queue.
   * @param {Object} request - The request object representing the task to be added.
   * @return {void}
   */
  addTask(request) {
    const minDuration = 4000;
    const maxDuration = 5000;

    const newTask = {
      id: request.id,
      name: null,
      duration: Math.random() * (maxDuration - minDuration) + minDuration,
      execute: null,
    };

    this.pendingTasks.push(newTask);
    this.emit("taskAdded", newTask);
    console.log(
      `Worker Pool (${this.id}): Task added: (${newTask.id}) - Total pending tasks: ${this.pendingTasks.length}`,
    );

    this.emit();
  }

  /**
   * Dispatches pending tasks to the CPU for processing.
   * Checks for available CPU capacity and moves tasks from the worker pool's pending queue to the CPU's processing queue.
   * Called in the main game loop to continuously dispatch tasks as CPU capacity allows.
   * @param {CPU} The CPU instance to dispatch tasks to.
   * @return {void}
   */
  dispatch(cpu) {
    while (this.pendingTasks.length > 0 && cpu.canJoinQueue()) {
      const task = this.pendingTasks.shift();
      cpu.addTask(task);
    }
  }

  /**
   * Get the current state of the worker pool.
   * Prevents unnecessary re-renders by caching the state object.
   * If the workers array hasn't changed, the same object is returned.
   * @returns {Object} The current state of the worker pool.
   */
  getState = () => {
    const newState = {
      id: this.id,
      pendingTasks: this.pendingTasks,
    };

    // Cache if the number of workers hasn't changed
    // This detects mutations to the workers array
    if (!this.cachedState) {
      this.cachedState = newState;
    }

    return this.cachedState;
  };

  /**
   * Subscribes a listener function to worker pool state changes.
   * React will call this listener to update the UI when the worker pool state changes.
   * @param {Function} listener The listener function to be called on state changes.
   * @return {Function} A function to unsubscribe the listener.
   */
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /**
   * Notifies all subscribed listeners of a state change.
   * Does this by calling each listener function.
   * @return {void}
   */
  emit = (event, data) => {
    this.listeners.forEach((listener) => listener(event, data));
  };
}
