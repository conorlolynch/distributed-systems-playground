/**
 * Represents a worker in the distributed system.
 */
export class TaskWorker {
  static workers = new Map();

  constructor(startupTime = 0) {
    this.id = Math.random().toString(36).slice(2, 8);

    const now = performance.now();

    // Worker processing state
    this.idle = false;
    this.request = { title: "Startup" };
    this.requestStartTime = now;
    this.requestEndTime = now + startupTime;

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

  processRequest(requestObject) {
    // TODO: Simulate what would happen if a worker received a request
    this.idle = false;
    this.request = requestObject;
    this.requestStartTime = performance.now();
    this.requestEndTime = this.requestStartTime + Math.random() * 2000; // Simulate 2 seconds processing time
    return;
  }

  stopProcessing() {
    if (this.requestEndTime <= performance.now()) {
      console.info(
        `Worker: ${this.id} finished processing request: ${this.request.title}`,
      );

      this.idle = true;
      this.request = null;
      this.requestStartTime = performance.now();
      this.requestEndTime = null;
    }
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
