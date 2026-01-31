import { useState, useEffect, useRef } from "react";
import "./index.css";
import {
  generateRequest,
  queue,
  gameLoop,
  queueInstance,
  firstWorkerPool,
} from "./sim/simulation.js";
import { SideEditor } from "./components/SideEditor.jsx";
import { WorkerPool } from "./components/WorkerPool.jsx";
import { NumberStepper } from "./components/NumberStepper.jsx";
import Button from "react-bootstrap/Button";

function App() {
  const [offcanvas, setOffcanvas] = useState({
    open: false,
    type: null, // What triggered the editor
    payload: null, // Optional data/context
  });
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
      <button
        onClick={() => {
          firstWorkerPool.spawnWorker();
        }}
      >
        Spawn
      </button>
      <button
        onClick={() => {
          firstWorkerPool.despawnWorker();
        }}
      >
        Despawn
      </button>
      {/* Background Layer */}
      <div className="container">
        {/* Main Canvas + SVG Area */}
        <div className="stage">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            style={{ border: "2px solid black" }}
          />
          <WorkerPool
            pool={firstWorkerPool}
            setOffcanvasFunction={setOffcanvas}
          />
        </div>

        {/* Side editor */}
        <SideEditor
          isOpen={offcanvas.open}
          onClose={() =>
            setOffcanvas({ open: false, type: null, payload: null })
          }
          title={offcanvas.title}
        >
          {renderSettings(offcanvas.type, offcanvas.payload)}
        </SideEditor>
      </div>
      {/* <div>
        <button onClick={addRequest}>Add Request</button>
        <button onClick={giveWorkerRequest}>Give Worker Request</button>
        <button onClick={addWorker}>Add Worker</button>
      </div> */}
    </>
  );
}

function renderSettings(type, payload) {
  switch (type) {
    case "workerPool":
      return <WorkerPoolSettings payload={payload} />;

    default:
      return null;
  }
}

export function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);

  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }

  if (minutes > 0) {
    return `${minutes} min ${seconds} sec`;
  }

  return `${seconds} sec`;
}

function WorkerPoolSettings({ payload }) {
  const [now, setNow] = useState(performance.now());
  const [minWorkersValue, setMinWorkersValue] = useState(payload.minWorkers);
  const [maxWorkersValue, setMaxWorkersValue] = useState(payload.maxWorkers);

  // Update every second to show worker times
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(performance.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // TODO: Add buttons to min/max workers to be able to increment and decrement them

  return (
    <>
      <div>Instance ID: {payload.id}</div>
      <br></br>
      <h5>Settings:</h5>
      <div>
        Min Workers:
        <NumberStepper
          value={minWorkersValue}
          minValue={1}
          maxValue={maxWorkersValue}
          onChange={(value) => {
            setMinWorkersValue(value);
            firstWorkerPool.setMinWorkers(value);
          }}
        />
      </div>
      <div>
        Max Workers:
        <NumberStepper
          value={maxWorkersValue}
          minValue={minWorkersValue + 1}
          maxValue={8}
          onChange={(value) => {
            setMaxWorkersValue(value);
            firstWorkerPool.setMaxWorkers(value);
          }}
        />
      </div>
      <div>Average Startup Time: {payload.averageWorkerStartupTime} ms</div>
      <br></br>
      <div>
        <h5>Workers:</h5>
        <button>Add Worker</button>
        <table className="table focus-on-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {payload.workers.map((worker) => (
              <tr key={worker.id}>
                <td>{worker.id}</td>
                <td>
                  {worker.idle ? "Idle" : worker.request?.title || "Processing"}
                </td>
                <td>{formatDuration(now - worker.requestStartTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* <ul>
          {payload.workers.map((worker) => (
            <li key={worker.id}>
              ID: {worker.id}, Status: {worker.status}
            </li>
          ))}
        </ul> */}
      </div>
    </>
  );
}

export default App;
