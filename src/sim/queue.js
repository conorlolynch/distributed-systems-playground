/**
 * A queue data structure with pub/sub capability for reactive updates.
 * Manages a FIFO (First-In-First-Out) collection of items and notifies
 * subscribers when the queue state changes.
 *
 * @class Queue
 * @example
 * const queue = new Queue();
 *
 * // Subscribe to queue changes
 * const unsubscribe = queue.subscribe(() => {
 *   console.log('Queue updated! New size:', queue.size());
 * });
 *
 * // Add items to the queue
 * queue.add({ id: 1, task: 'process' });
 * queue.emit(); // Notifies all listeners
 *
 * // Remove items from the queue
 * const item = queue.pop();
 * queue.emit(); // Notifies all listeners
 *
 * // Unsubscribe when done
 * unsubscribe();
 *
 * // Clear the queue
 * queue.clear();
 * queue.emit(); // Notifies all listeners
 */
export class Queue {
  constructor() {
    this.id = Math.random().toString(36).slice(2, 8);
    this.items = [];
    this.cachedState = null;
    this.lastItemCount = 0;
    this.timestampLastItemAdded = 0;
    this.listeners = new Set();
  }

  /**
   * Adds a new request object to the end of the queue.
   * Creates a new array with the existing items and the new request to ensure immutability, which is important for React state updates.
   * @param {Object} requestObject - The request object to be added to the queue. If undefined or falsy, the operation is ignored.
   * @returns {void}
   * @example
   * queue.add({ id: 1, task: 'process' });
   */
  add(requestObject) {
    if (requestObject === undefined || !requestObject) {
      console.warn(
        "Attempted to add an undefined or falsy request to the queue. Operation ignored.",
      );
      return;
    }

    this.items = [...this.items, requestObject];
    this.emit();
  }

  /**
   * Removes the oldest request from the queue
   * @return {object} The removed request object
   */
  pop() {
    const item = this.items.shift();
    this.emit();
    return item;
  }

  /** Empties the queue */
  clear() {
    this.items = [];
    this.emit();
  }

  /** Returns the current size of the queue */
  size() {
    return this.items.length;
  }

  getState = () => {
    const newState = {
      id: this.id,
      items: this.items,
    };

    // Invalidate cache only if items actually changed
    if (!this.cachedState || this.cachedState.items !== this.items) {
      this.cachedState = newState;
    }

    return this.cachedState;
  };

  /**
   * Subscribes a listener function to be called whenever the queue state changes.
   * @param {Function} listener - The listener function to be called whenever the queue state changes. This function should trigger a re-render in React components that depend on the queue state.
   * @returns {Function} Unsubscribe function to remove the listener
   */
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /**
   * Notifies all subscribed listeners of a state change. This should be called whenever the queue is modified (e.g., when items are added or removed) to ensure that React components stay in sync with the queue state.
   * @return {void}
   */
  emit = () => {
    this.listeners.forEach((listener) => listener());
  };
}
