import { TaskWorker } from "../sim/worker.js";

export class WorkerPool {
  constructor({ minNumWorkers = 1, maxNumWorkers = 8 } = {}) {
    this.id = Math.random().toString(36).slice(2, 8);
    this.minNumWorkers = minNumWorkers;
    this.maxNumWorkers = maxNumWorkers;
    this.workers = [];
    this.averageWorkerStartupTime = 500; // ms for a worker to become active
    this.workerIdleDespawnTime = 10000; // ms of idleness before a worker is despawned
    this.listeners = new Set();
    this.cachedState = null;
    this.lastWorkerCount = 0;

    // Spawn the initial minimum number of workers
    for (let i = 0; i < this.minNumWorkers; i++) {
      this.spawnWorker();
    }
  }

  /**
   * Spawns a new worker and adds it to the pool, if the maximum number of workers hasn't been reached.
   * Emits a state change to listeners after spawning.
   * @return {Object|null} The newly spawned worker object, or null if the max has been reached.
   */
  spawnWorker() {
    if (this.workers.length >= this.maxNumWorkers) return null;

    // Generate a worker
    const newWorker = new TaskWorker(this.averageWorkerStartupTime);
    if (!newWorker) return null;

    this.workers.push(newWorker);
    console.log("Spawned worker:", newWorker.id);
    this.emit();
    return newWorker;
  }

  /**
   * Removes a inactive worker from the pool, but ensures that the minimum number of workers is maintained.
   * Emits a state change to listeners after despawning.
   * @return {boolean} Whether a worker was successfully removed.
   */
  despawnWorker(id = null) {
    // TODO TODO: We arent actually using Worker instances here yet... need to use them ...

    // Ensure we don't go below the minimum number of workers
    if (this.workers.length <= this.minNumWorkers) {
      console.warn("Cannot despawn worker: minimum number reached.");
      return false;
    }

    if (id !== null) {
      // Find the worker with the specified ID
      for (let i = 0; i < this.workers.length; i++) {
        const worker = this.workers[i];
        if (worker.id === id) {
          if (!worker.idle) {
            console.warn(
              `Cannot despawn worker ${id}: worker is currently busy.`,
            );
            return false;
          }
          // Remove the worker from the Worker class static map
          worker.destroy();

          // Remove the worker from the pool
          this.workers.splice(i, 1);

          console.log("Despawned worker:", worker.id);
          console.log("Current workers:", this.workers);

          // Emit state change
          this.emit();
          return true;
        }
      }
      console.warn(`Worker with ID ${id} not found.`);
      return false;
    }

    // Find an idle worker to remove
    for (let i = 0; i < this.workers.length; i++) {
      const worker = this.workers[i];
      console.log(
        "Checking worker for despawn:",
        worker.id,
        "Status:",
        worker.status,
      );

      if (worker.idle) {
        // Remove the worker from the Worker class static map
        worker.destroy();

        // Remove the worker from the pool
        this.workers.splice(i, 1);

        console.log("Despawned worker:", worker.id);
        console.log("Current workers:", this.workers);

        // Emit state change
        this.emit();
        return true;
      }
    }
  }

  /**
   * Assigns a request to an idle worker in the pool.
   * @param {Object} requestObject The request object to assign to a worker.
   * @return {boolean} Whether the assignment was successful.
   */
  assignWorker(requestObject) {
    for (const worker of this.workers) {
      if (worker.idle) {
        worker.processRequest(requestObject);
        return true;
      }
    }

    return false;
  }

  setMinWorkers = (newMin) => {
    this.minNumWorkers = Math.max(1, newMin);
    console.info("New min workers:", this.minNumWorkers);

    // Spawn or despawn workers to meet the new minimum
    while (this.workers.length < this.minNumWorkers) {
      this.spawnWorker();
    }

    return this.minNumWorkers;
  };

  setMaxWorkers = (newMax) => {
    this.maxNumWorkers = Math.max(this.minNumWorkers, newMax);
    console.info("New max workers:", this.maxNumWorkers);

    // Despawn workers if new max is less than number of current workers
    while (this.workers.length > this.maxNumWorkers) {
      this.despawnWorker();
    }

    return this.maxNumWorkers;
  };

  /**
   * Get the current state of the worker pool.
   * Prevents unnecessary re-renders by caching the state object.
   * If the workers array hasn't changed, the same object is returned.
   * @returns {Object} The current state of the worker pool.
   */
  getState = () => {
    const newState = {
      id: this.id,
      minNumWorkers: this.minNumWorkers,
      maxNumWorkers: this.maxNumWorkers,
      workers: this.workers,
    };

    // Only cache if the number of workers hasn't changed
    // This detects mutations to the workers array
    if (!this.cachedState || this.lastWorkerCount !== this.workers.length) {
      this.cachedState = newState;
      this.lastWorkerCount = this.workers.length;
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
  emit = () => {
    this.listeners.forEach((listener) => listener());
  };
}
