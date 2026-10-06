import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";

export const Bubbles = memo(function Bubbles() {
  return (
    <div className="soap-bubbles" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${8 + i * 10}%`,
            width: 12 + (i % 4) * 13,
            height: 12 + (i % 4) * 13,
            animationDelay: `${i * -1.8}s`,
            animationDuration: `${9 + (i % 4)}s`,
          }}
        />
      ))}
    </div>
  );
});

export const LaundryVisual = memo(function LaundryVisual({
  kind = "washer",
  className = "",
}: {
  kind?: "washer" | "towels" | "shirt" | "bedding";
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <div className={`laundry-art art-${kind} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 360 400" fill="none">
        <ellipse
          cx="180"
          cy="342"
          rx="118"
          ry="15"
          fill="#173C64"
          opacity=".09"
        />
        {kind === "washer" && (
          <>
            <path
              d="M48 305V142M312 310V126"
              stroke="#B9D4E9"
              strokeWidth="2"
            />
            <path d="M40 159h22M300 148h24" stroke="#B9D4E9" strokeWidth="2" />
            <rect x="79" y="112" width="206" height="224" rx="21" fill="#FFF" />
            <path
              d="M264 112h5a16 16 0 0 1 16 16v191a17 17 0 0 1-17 17h-4V112Z"
              fill="#D7E5EF"
            />
            <path d="M79 161h185" stroke="#E2EAF1" strokeWidth="2" />
            <rect x="99" y="130" width="59" height="12" rx="3" fill="#D9E7F0" />
            <circle cx="237" cy="136" r="12" fill="#B7D2E6" />
            <circle cx="237" cy="136" r="7" fill="#F7FBFF" />
            <circle cx="180" cy="243" r="69" fill="#D7E7F2" />
            <circle cx="180" cy="243" r="57" fill="#245B87" />
            <motion.g
              style={{ transformOrigin: "180px 243px" }}
              animate={reduced ? {} : { rotate: [0, 360] }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            >
              <path
                d="M136 253c5-26 25-50 42-31s42 2 46 24-36 49-58 37-35-17-30-30Z"
                fill="#C3DDF0"
              />
              <path d="M152 211c18-15 32-10 45 6l-18 15-27-21Z" fill="#FFF" />
              <path d="M159 263c13-17 33-8 46-1l-9 16-37-15Z" fill="#6EABD4" />
              <circle cx="150" cy="232" r="5" fill="white" opacity=".65" />
              <circle cx="206" cy="241" r="7" fill="white" opacity=".65" />
            </motion.g>
            <path
              d="M147 208a47 47 0 0 1 42-11"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              opacity=".6"
            />
            <rect x="273" y="228" width="8" height="26" rx="4" fill="#A3BDD0" />
            <rect x="97" y="93" width="142" height="19" rx="8" fill="#82AED0" />
            <rect
              x="103"
              y="75"
              width="128"
              height="18"
              rx="8"
              fill="#BCD5E7"
            />
            <rect
              x="111"
              y="58"
              width="115"
              height="17"
              rx="8"
              fill="#FAFDFF"
            />
          </>
        )}
        {kind === "towels" && (
          <>
            <path d="M80 231h201l-17 96H97L80 231Z" fill="#C4A885" />
            {Array.from({ length: 10 }, (_, i) => (
              <path
                key={i}
                d={`M${96 + i * 17} 238l4 81`}
                stroke="#E5CEAD"
                strokeWidth="4"
              />
            ))}
            <path
              d="M91 267h180M94 289h173M98 311h166"
              stroke="#E5CEAD"
              strokeWidth="4"
            />
            <rect
              x="74"
              y="210"
              width="211"
              height="37"
              rx="15"
              fill="#77A6CC"
            />
            <rect
              x="80"
              y="174"
              width="194"
              height="37"
              rx="15"
              fill="#F7FBFF"
            />
            <rect
              x="90"
              y="138"
              width="178"
              height="37"
              rx="15"
              fill="#A9CAE2"
            />
            <rect
              x="101"
              y="104"
              width="155"
              height="35"
              rx="15"
              fill="#F7FBFF"
            />
            <path
              d="M101 120h142M90 154h164M84 193h177M84 229h187"
              stroke="#47799E"
              opacity=".13"
              strokeWidth="2"
            />
            <path
              d="M281 161c-12-22-3-45 11-55 8 24 4 38-11 55Z"
              fill="#8BAFA5"
            />
            <path
              d="M281 164c-23-8-31-22-29-36 24 4 35 20 29 36Z"
              fill="#ADC6B8"
            />
            <path d="M280 196v-44" stroke="#789C91" strokeWidth="3" />
            <path d="M266 179h30l-5 30h-20l-5-30Z" fill="#FAFDFF" />
          </>
        )}
        {kind === "shirt" && (
          <>
            <path
              d="M58 104h244M72 104v232M287 104v232"
              stroke="#7793A7"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M177 126c-14-17 11-28 14-13 1 7-10 8-10 16l60 33H119l62-33"
              stroke="#C6A178"
              strokeWidth="5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d="m145 155-39 23-26 59 41 16 13-31v107h104V220l13 33 40-16-27-59-39-23-22 11h-33l-25-11Z"
              fill="#F9FCFF"
            />
            <path
              d="m145 155 17 31 23-20 20 20 20-31M185 166v163"
              stroke="#C4D7E5"
              strokeWidth="2"
            />
            <path d="M200 203h24v25h-24z" fill="#E4EFF6" />
            {[197, 224, 251, 278, 305].map((y) => (
              <circle key={y} cx="183" cy={y} r="2" fill="#8BAEC7" />
            ))}
          </>
        )}
        {kind === "bedding" && (
          <>
            <rect
              x="54"
              y="139"
              width="250"
              height="144"
              rx="27"
              fill="#81A9C8"
            />
            <path d="M51 212h256v119H51z" fill="#DCE9F1" />
            <rect
              x="65"
              y="161"
              width="101"
              height="68"
              rx="16"
              fill="#F9FCFF"
            />
            <rect
              x="191"
              y="161"
              width="100"
              height="68"
              rx="16"
              fill="#F9FCFF"
            />
            <path
              d="M45 226h268v88a15 15 0 0 1-15 15H60a15 15 0 0 1-15-15v-88Z"
              fill="#A6C8E0"
            />
            <path d="M46 241h267" stroke="#CFE1EE" strokeWidth="15" />
            <path
              d="M91 251v77M138 251v77M185 251v77M232 251v77M279 251v77"
              stroke="#BCD7E9"
              strokeWidth="2"
            />
            <path
              d="M60 332v12M298 332v12"
              stroke="#7895AA"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </>
        )}
        <path
          d="m49 202 4-12 4 12 12 4-12 4-4 12-4-12-12-4 12-4ZM297 76l3-9 3 9 9 3-9 3-3 9-3-9-9-3 9-3Z"
          fill="white"
        />
      </svg>
    </div>
  );
});
