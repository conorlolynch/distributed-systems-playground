export class Queue {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.items = [];
  }

  /** Adds a request to the queue */
  add(requestObject) {
    if (requestObject === undefined || !requestObject) return;
    this.items.push(requestObject);
  }

  /**
   * Removes the oldest request from the queue
   * @return {object} The removed request object
   */
  pop() {
    return this.items.shift();
  }

  /** Empties the queue */
  clear() {
    this.items = [];
  }

  /** Returns the current size of the queue */
  size() {
    return this.items.length;
  }
}
