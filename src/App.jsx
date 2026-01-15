import { useState, useEffect, useRef } from "react";
import { Worker } from "./sim/worker.js";
import {
  generateRequest,
  queue,
  gameLoop,
  queueInstance,
} from "./sim/simulation.js";
import "./App.css";

function App() {
  const canvasRef = useRef(null);

  const addRequest = () => {
    const requestObj = generateRequest();
    queueInstance.add(requestObj);

    console.log("Current Queue: ", queueInstance.items);
  };

  // Handles the moving of a request from the queue to a worker
  const giveWorkerRequest = () => {
    Worker.workers.forEach((workerInstance) => {
      // Lets find a worker that is idle
      if (workerInstance.idle) {
        const reqObject = queueInstance.pop();
        if (!reqObject) return; // No requests in the queue
        workerInstance.processRequest(reqObject);
      }
    });
  };

  // Handles adding a new worker to the simulation
  const addWorker = () => {
    const numberOfWorkers = Worker.workers.size;
    new Worker(`w${numberOfWorkers + 1}`, 450, 200, 50, 50);
    console.log("Workers: ", Worker.workers);
  };

  useEffect(() => {
    /**
     * Retrieves the current DOM reference to the canvas element.
     * This allows direct access to the HTMLCanvasElement for canvas operations such as drawing, rendering, or obtaining the 2D context.
     */
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let lastTime = performance.now();

    function loop(time) {
      const dt = time - lastTime;
      lastTime = time;

      gameLoop(ctx, dt);

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }, []);

  return (
    <>
      <div>
        <button onClick={addRequest}>Add Request</button>
        <button onClick={giveWorkerRequest}>Give Worker Request</button>
        <button onClick={addWorker}>Add Worker</button>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        style={{ border: "2px solid black" }}
      />
    </>
  );
}

export default App;
