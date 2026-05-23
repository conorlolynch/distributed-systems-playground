/**
 * NetworkLayer class represents the network layer in a distributed system simulation.
 *
 * Flow:
 * 1. Request arrives → Incoming Buffer (waiting room)
 * 2. Assign latency → Latency Map (timer per request)
 * 3. Time passes → Request becomes "ready"
 * 4. Move to Egress Queue → System can consume it
 *
 * Emulates receiving packets, ingress, latency at a high level.
 *
 * Request structure: {id, source, destination, payload, timestamp}
 *
 * Payload structure:
 * {
 *   method: "GET" | "POST" | "PUT" | "DELETE",
 *   path: "/users",
 *   params: {...},   // query params
 *   body: {...},     // request body
 *   headers: {...}   // optional
 * }
 */
export class NetworkLayer {
  constructor() {
    this.incomingBuffer = [];
    this.latencyMap = new Map();
    this.listeners = new Set();

    // Network tick counter used to generate requests every N game loop ticks.
    this.tickCount = 0;
    this.requestIntervalTicks = 75; // hardcoded rate: one new request every 75 ticks
  }

  /**
   * Generates a random request object with a unique ID, source, destination, payload, and timestamp.
   * @returns {Object} A new request object.
   */
  createRequestObject() {
    return {
      id: Math.random().toString(36).slice(2, 8),
      source: "client",
      destination: "server",
      payload: null,
      timestamp: Date.now(),
    };
  }

  /**
   * Simulates the arrival of a new request to the network layer.
   * Generates a request object, assigns it a random latency, and adds it to the incoming buffer.
   * Emits an event to notify listeners that a new request has arrived.
   * @returns {void}
   */
  receiveRequest() {
    const latency = Math.random() * 200; // Simulate network latency between 0 and 200 ms

    setTimeout(() => {
      const newRequestObject = this.createRequestObject();
      this.incomingBuffer.push(newRequestObject);
      this.latencyMap.set(newRequestObject.id, latency);
      this.emit();
    }, latency);
  }

  /**
   * Called from the main game loop to advance network behavior.
   * `dt` is available for future time-based rate control, but right now the request rate
   * is hardcoded to fire once every `requestIntervalTicks` ticks.
   * @param {number} dt - Milliseconds elapsed since the last game loop tick.
   * @returns {void}
   */
  update(dt) {
    this.tickCount += 1;

    if (this.tickCount >= this.requestIntervalTicks) {
      this.tickCount = 0;
      this.receiveRequest();
    }
  }

  /**
   * Adds a listener function thats called whenever the network layer emits and event.
   * Returns an unsubscribe functio to remove then listener when its no longer needed.
   *
   * @param {Function} listener The listener function to be called when the network layer emits an event.
   * @returns {Function} An unsubscribe function that removes the listener when called.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emits an event to all subscribed listeners.
   * @returns {void}
   */
  emit() {
    this.listeners.forEach((listener) => listener());
  }
}
