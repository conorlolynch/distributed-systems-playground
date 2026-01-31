class CPU {
  constructor() {
    // Maps CPU tokens (cores) to the task being processed
    this.freeIndexes = [0, 1, 2, 3, 4, 5, 6, 7]; // 8-core CPU
    this.tokens = [null, null, null, null, null, null, null, null]; // 8-core CPU
    this.queue = [];
  }

  /**
   * Adds a new task to the CPU's processing queue.
   */
  addTaskToQueue(task) {
    this.queue.push(task);
  }

  /**
   * Loads the next task from the top of the queue for processing.
   */
  loadNextTask() {
    const nextTask = this.queue.shift();
    if (!nextTask) return null;

    // todo: this task should be assigned a token for processing, when its done the token should be released back to the cpu
    // todo: 1) Find a free token to assign the task to, 2) Assign the task to that token. 3) When done, release the token and take on more work from the queue

    // 1) Find a free token
    const freeIndex = this.freeIndexes.shift();
    if (freeIndex === undefined) {
      // No free tokens available, re-add the task to the front of the queue
      this.queue.unshift(nextTask);
      return null;
    }

    // 2) Assign the task to that token and core
    this.tokens[freeIndex] = nextTask;

    return nextTask;
  }

  /**
   * Releases a CPU token.
   * @param {number} tokenIndex - The index of the token to release.
   */
  releaseTask(tokenIndex) {
    if (tokenIndex < 0 || tokenIndex >= this.tokens.length) {
      throw new Error("Invalid token index");
    }
    this.tokens[tokenIndex] = null;
    this.freeIndexes.push(tokenIndex);
    return true;
  }
}

/* 

There is a difference between Worker Pool and CPU (cpu core = workers, tokens etc)
Worker Pool is an abstraction of cpu and memory, preventing the cpu and memory from being overloaded with request data, deciding how to control the flow of requests to cpu and memory.

CPU has a cpu queue of tasks to process from many instances e.g. cache, db etc
CPU cores (tokens) are the actual processing units that execute tasks.

*/
