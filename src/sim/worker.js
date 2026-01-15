export class Worker {
  static workers = new Map();

  static getWorker(id) {
    return Worker.workers.get(id);
  }

  constructor(id, x, y, width, height) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    // Worker processing state
    this.idle = true;
    this.request = null;
    this.requestStartTime = null;
    this.requestEndTime = null;

    // Add this worker instance to the static map
    Worker.workers.set(id, this);
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
    this.idle = true;
    this.request = null;
    this.requestStartTime = null;
    this.requestEndTime = null;
  }

  destroy() {
    // Remove this worker instance from the static map
    Worker.workers.delete(this.id);
  }
}
