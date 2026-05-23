import { NetworkLayer } from "../sim/network.js";
import { CPU } from "../sim/cpu.js";
import { Queue } from "../sim/queue.js";
import { WorkerPool } from "../sim/workerPool.js";
import {
  clearQueue,
  drawQueueOutline,
  drawQueueItems,
  drawWorker,
} from "../sim/draw.js";

// Spawn traffic (Just )

export let queue = [];

export let isPaused = false;
let listeners = new Set();

export const network = new NetworkLayer();
export const workerPool = new WorkerPool();

network.subscribe(() => {
  // Move everything from the incoming buffer to the worker pool task queue
  while (network.incomingBuffer.length > 0) {
    const request = network.incomingBuffer.shift();
    workerPool.addTask(request);
  }
});
export const cpu = new CPU();

// Create a Queue instance
export const queueInstance = new Queue(10, 10, 200, 100);

function draw(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  clearQueue(ctx, queueInstance);
  drawQueueOutline(ctx, queueInstance);
  drawQueueItems(ctx, queueInstance);

  // cpu.addTask()

  // Actions on each tick to perform on each worker in the Worker Pool
  // firstWorkerPool.workers.forEach((worker) => {
  //   // Check if any workers have been idle for too long
  //   if (worker.idle) {
  //     const idleTime = performance.now() - worker.requestStartTime;
  //     if (idleTime > firstWorkerPool.idleDespawnTime) {
  //       firstWorkerPool.despawnWorker(worker.id);
  //     }
  //   }

  //   // Check to see if any jobs are complete
  //   if (!worker.idle) {
  //     const currentTime = performance.now();
  //     if (currentTime >= worker.requestEndTime) {
  //       // Finished processing
  //       worker.stopProcessing();
  //     }
  //   }
  // });

  //Worker.workers.forEach((workerInstance) => {
  //  drawWorker(ctx, workerInstance);
  //});

  //drawWorker(ctx, Worker.getWorker("worker-1"));

  // Lets draw the queue (white rectange, empty)
  //ctx.strokeStyle = "white";
  //ctx.lineWidth = 2;
  //ctx.strokeRect(10, 10, 200, 100);

  // For each of our requests, draw this within the queue
  //let x = 20;
  //let width = 20;
  //queue.forEach((requestObj) => {
  //  ctx.beginPath();
  //  ctx.arc(x, 50, width / 2, 0, 2 * Math.PI);
  //  ctx.stroke();

  //x += 30;
  //});
}

export function togglePause() {
  isPaused = !isPaused;
  emit();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  listeners.forEach((listener) => listener(isPaused));
}

export function gameLoop(ctx, dt) {
  if (isPaused) return;

  network.update(dt);

  // Worker Pool, run update
  // todo: need to make sure we are flushing the pending tasks buffer to the CPU's task queue
  workerPool.dispatch(cpu);

  cpu.tick(dt);

  // CPU processing
  // 1) Check to see if any tasks have completed processing, if so release the token back to the cpu
  //cpu.clearFinishedTasks();

  // 2) Load in as many new tasks from the queue as there are free tokens.
  //while (cpu.freeIndexes.size > 0) {
  //  const task = cpu.loadNextTask();
  //  if (!task) break; // No more tasks to load

  // If the task has code that can be executed, execute it (this simulates the processing of the task by the CPU)
  //  if (task.execute) {
  //    task.execute();
  //    task.endTime = performance.now();
  //  }
  //}

  // Drawing
  draw(ctx);
}
