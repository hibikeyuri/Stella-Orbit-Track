import { Satellite } from "lucide-react";

function SpinnerMini(size = 24, className = "") {
  return (
    <Satellite
      className={`animate-spin text-blue-400 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export default SpinnerMini;
