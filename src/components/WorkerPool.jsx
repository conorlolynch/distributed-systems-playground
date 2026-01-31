import { useRef, useState } from "react";
import { useSyncExternalStore } from "react";

export function WorkerPool({ pool, setOffcanvasFunction }) {
  const state = useSyncExternalStore(pool.subscribe, pool.getState);

  const width = 160;
  const height = 120;

  const [pos, setPos] = useState({ x: 200, y: 150 });
  const distanceMoved = useRef({ x: 0, y: 0 });
  const dragRef = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const THRESHOLD = 5; // pixels

  /**
   * Handles what happens when the user presses down on the worker pool.
   * @param {PointerEvent} e The pointer event
   * @returns {void}
   */
  const onPointerDown = (e) => {
    dragRef.current = true;
    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  };

  /**
   * Handles what happens when the user releases the pointer from the worker pool.
   * If the pointer hasn't moved much, it's considered a click and opens the editor.
   * @param {PointerEvent} e The pointer event
   * @returns {void}
   */
  const onPointerUp = (e) => {
    // Detect if it was just a click (not a drag)
    if (
      Math.sqrt(
        distanceMoved.current.x * distanceMoved.current.x +
          distanceMoved.current.y * distanceMoved.current.y,
      ) < THRESHOLD
    ) {
      setOffcanvasFunction({
        open: true,
        type: "workerPool",
        title: "Worker Pool",
        payload: {
          id: pool.id,
          workers: pool.workers,
          minWorkers: pool.minNumWorkers,
          maxWorkers: pool.maxNumWorkers,
          averageWorkerStartupTime: pool.averageWorkerStartupTime,
        },
      });
    }

    dragRef.current = false;
    offset.current = { x: 0, y: 0 };
    distanceMoved.current = { x: 0, y: 0 };
  };

  /**
   * Handles what happens when the user moves the pointer while pressing down on the worker pool.
   * Tracks the distance moved to differentiate between a drag and a click.
   * @param {PointerEvent} e The pointer event
   * @returns {void}
   */
  const onPointerMove = (e) => {
    if (!dragRef.current) return;

    distanceMoved.current = {
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    };

    setPos({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const drawWorkers = (workers) => {
    return workers.map((worker, i) => {
      const cols = Math.ceil(Math.sqrt(workers.length));
      const col = i % cols;
      const row = Math.floor(i / cols);
      const spacing = 25;

      return (
        <circle
          key={i}
          cx={30 + col * spacing}
          cy={50 + row * spacing}
          r="8"
          fill="lime"
        />
      );
    });
  };

  return (
    <svg
      width="100%"
      height="100%"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
      }}
    >
      <g
        transform={`translate(${pos.x} ${pos.y})`}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
        style={{ cursor: "grab" }}
      >
        <rect width={width} height={height} rx="10" fill="red" />
        <text
          x={width / 2}
          y="20"
          textAnchor="middle"
          fill="white"
          style={{ fontSize: 14 }}
        >
          Worker Pool
        </text>
        {drawWorkers(state.workers)}
        {/* {state.workers.map((worker, index) => (
          <circle
            key={worker.id}
            cx={40 + index * 40}
            cy="60"
            r="8"
            fill="lime"
          />
        ))} */}
        {/* <circle cx="40" cy="60" r="8" fill="lime" />
        <circle cx="80" cy="60" r="8" fill="lime" />
        <circle cx="120" cy="60" r="8" fill="lime" /> */}
      </g>
    </svg>
  );
}
