import { useRef, useState } from "react";
import { useSyncExternalStore } from "react";

function drawCores(tokens, onClick) {
  const width = 120;
  const height = 15;
  return tokens.map((token, i) => {
    const x = 20;
    const y = 30 + i * 20;
    return (
      <g key={i}>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={token ? "red" : "lightgray"}
          onPointerDown={() => onClick(i, token)}
          style={{ cursor: "pointer", pointerEvents: "auto" }}
        />
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={token ? "white" : "black"}
          style={{ fontSize: 12, pointerEvents: "none" }}
        >
          {token ? token.id : "free"}
        </text>
      </g>
    );
  });
}

export function CPU({ cpu }) {
  const state = useSyncExternalStore(cpu.subscribe, cpu.getState);
  const [pos, setPos] = useState({ x: 100, y: 200 });
  const width = 160;
  const height = 120;

  return (
    <svg
      width="100%"
      height="100%"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <g
        transform={`translate(${pos.x} ${pos.y})`}
        onPointerDown={null}
        onPointerUp={null}
        onPointerMove={null}
        style={{ cursor: "grab", pointerEvents: "auto" }}
      >
        <rect width={width} height={height} rx="10" fill="green" />
        <text
          x={width / 2}
          y="20"
          textAnchor="middle"
          fill="white"
          style={{ fontSize: 14 }}
        >
          CPU
        </text>
        {drawCores(state.tokens)}
      </g>
    </svg>
  );
}
