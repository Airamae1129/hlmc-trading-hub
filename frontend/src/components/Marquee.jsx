import React from "react";

export default function Marquee({ children, reverse = false, duration = 42, className = "", pauseOnHover = false }) {
  return (
    <div className={`overflow-hidden ${pauseOnHover ? "marquee-hover" : ""} ${className}`}>
      <div
        className={`marquee-track ${reverse ? "reverse" : ""}`}
        style={{ "--marquee-duration": `${duration}s` }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
