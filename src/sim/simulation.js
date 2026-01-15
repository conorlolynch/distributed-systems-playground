import { Queue } from "../sim/queue.js";
import { Worker } from "../sim/worker.js";
import {
  clearQueue,
  drawQueueOutline,
  drawQueueItems,
  drawWorker,
} from "../sim/draw.js";

// Spawn traffic (Just )

let requestCounter = 0;
export let queue = [];

// Create a Queue instance
export const queueInstance = new Queue(10, 10, 200, 100);

// Spawn a worker
new Worker("w1", 300, 10, 50, 50);

/** Generates a random request */
export function generateRequest() {
  const params = ["name", "age"];

  // todo:
  // Generate a random data request which is a random collection of parameters and values

  return {
    id: requestCounter++,
    data: {
      name: "Conor",
      minAge: 12,
      maxAge: 50,
    },
  };
}

function draw(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  clearQueue(ctx, queueInstance);
  drawQueueOutline(ctx, queueInstance);
  drawQueueItems(ctx, queueInstance);

  Worker.workers.forEach((workerInstance) => {
    drawWorker(ctx, workerInstance);
  });

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

export function gameLoop(ctx, dt) {
  // 1. Spawn new requests and add to queue
  //   if (Math.random() < 0.1) {
  //     const newReq = generateRequest();
  //     appendQueue(newReq);
  //   }
  // 2. Extract existing requests from the queue and assign them to an idle worker
  //   workers.forEach((workerObj, workerId) => {
  //     if (workerObj.state === "idle" && workerObj.job === null) {
  //       const job = popQueue();
  //       if (job) {
  //         giveWorkerJob(workerId, job);
  //       }
  //     }
  //   });

  // Processing
  Worker.workers.forEach((workerInstance) => {
    if (workerInstance.idle) {
      const requestObject = queueInstance.pop();
      if (!requestObject) return; // No requests in the queue
      workerInstance.processRequest(requestObject);
      return;
    } else {
      const currentTime = performance.now();
      if (currentTime >= workerInstance.requestEndTime) {
        // Finished processing
        workerInstance.stopProcessing();
      }
    }
  });

  // Drawing
  draw(ctx);
}
