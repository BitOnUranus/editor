import React, { useEffect, useRef } from "react";
import JustGage from "justgage";
import "raphael";

interface AccelerometerGaugeProps {
  id?: string;
  min: number;
  max: number;
  value: number; // Added prop for gauge value
  title?: string;
  label?: string;
}

const AccelerometerGauge: React.FC<AccelerometerGaugeProps> = ({
  id = "accelerometer",
  min = -10,
  max = 10,
  value,
  title = "Acceleration (m/s²)",
  label = "X-axis",
}) => {
  const gaugeRef = useRef<JustGage | null>(null);

  useEffect(() => {
    if (!gaugeRef.current) {
      gaugeRef.current = new JustGage({
        id,
        value,
        min,
        max,
        title,
        label,
        gaugeColor: "#FFFFFF", // Optional: change gauge background color
        levelColors: ["#FF0000", "#F9C802", "#A9D70B"],
        pointer: true, // Enables needle (pointer)
        pointerOptions: {
          color: "#FF0000", // Red needle color
          stroke: "#FF00330",
          stroke_width: 1,
        },
      });
    } else {
      gaugeRef.current.refresh(value); // Updates gauge value
    }
  }, [value, min, max]); // Effect runs when these props change

  return (
    <div id={id} style={{ width: "300px", height: "200px", margin: "auto" }} />
  );
};

export default AccelerometerGauge;
