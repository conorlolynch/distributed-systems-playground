export function NumberStepper({ value, minValue, maxValue, onChange }) {
  return (
    <div>
      <button
        disabled={value <= minValue}
        onClick={() => {
          onChange(value - 1);
        }}
      >
        -
      </button>
      <span>{value}</span>
      <button disabled={value >= maxValue} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
