import clsx from "clsx";

import Heading from "./Heading";

function Logo({ className }) {
  return (
    <div
      className={clsx("flex flex-col items-center justify-center", className)}
    >
      <div className="relative h-24 w-24">
        {/* 背景圖形 */}
        <svg
          viewBox="0 0 100 100"
          className="absolute top-0 left-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 中心行星 */}
          <circle
            cx="50"
            cy="50"
            r="10"
            className="fill-current text-gray-800 dark:text-gray-100"
          />
          {/* 傾斜軌道 */}
          <ellipse
            cx="50"
            cy="50"
            rx="30"
            ry="20"
            transform="rotate(-30 50 50)"
            className="stroke-current text-gray-400 dark:text-gray-600"
            fill="none"
            strokeWidth="2"
          />
        </svg>

        {/* 衛星（繞行動畫） */}
        <div
          className="animate-spin-orbit absolute top-0 left-0 h-full w-full"
          style={{ transformOrigin: "center" }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle
              cx="80"
              cy="50"
              r="3"
              className="fill-current text-blue-600 dark:text-blue-400"
            />
          </svg>
        </div>
      </div>

      {/* 底部標題 */}
      <Heading>Stella Orbit Track</Heading>
    </div>
  );
}

export default Logo;
