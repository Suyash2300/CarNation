import { useEffect, useRef, useState } from "react";

const ConnectionsSVG = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [connections, setConnections] = useState<
    Array<{
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
      id: string;
    }>
  >([]);

  useEffect(() => {
    const updateConnections = () => {
      if (!containerRef.current) return;

      const container = containerRef.current.parentElement;
      if (!container) return;

      const centralElement = container.querySelector("#central-feature");
      const featureElements = [
        container.querySelector("#feature-0"),
        container.querySelector("#feature-1"),
        container.querySelector("#feature-2"),
        container.querySelector("#feature-3"),
      ];

      if (!centralElement) return;

      const containerRect = container.getBoundingClientRect();
      const centralRect = centralElement.getBoundingClientRect();

      const centralX =
        centralRect.left + centralRect.width / 2 - containerRect.left;
      const centralY =
        centralRect.top + centralRect.height / 2 - containerRect.top;

      const newConnections = featureElements
        .filter((el) => el !== null)
        .map((el, index) => {
          const rect = el!.getBoundingClientRect();
          return {
            fromX: rect.left + rect.width / 2 - containerRect.left,
            fromY: rect.top + rect.height / 2 - containerRect.top,
            toX: centralX,
            toY: centralY,
            id: `conn-${index}`,
          };
        });

      setConnections(newConnections);
    };

    updateConnections();
    window.addEventListener("resize", updateConnections);

    // Wait for layout to settle
    setTimeout(updateConnections, 100);
    setTimeout(updateConnections, 500);

    return () => window.removeEventListener("resize", updateConnections);
  }, []);

  if (connections.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none hidden md:block z-0"
    >
      <svg className="absolute inset-0 w-full h-full overflow-visible">
        <defs>
          <linearGradient
            id="connectionGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {connections.map((conn) => (
          <g key={conn.id}>
            {/* Light dotted connection lines */}
            <line
              x1={conn.fromX}
              y1={conn.fromY}
              x2={conn.toX}
              y2={conn.toY}
              stroke="url(#connectionGradient)"
              strokeWidth="2"
              strokeDasharray="8,6"
              strokeOpacity="0.4"
              className="transition-all"
            />
            {/* Subtle node at feature box */}
            <circle
              cx={conn.fromX}
              cy={conn.fromY}
              r="6"
              fill="#2563eb"
              opacity="0.6"
              className="drop-shadow-sm"
            />
            <circle
              cx={conn.fromX}
              cy={conn.fromY}
              r="3"
              fill="white"
              opacity="0.8"
            />
          </g>
        ))}

        {connections.length > 0 && (
          <>
            {/* Subtle central hub marker */}
            <circle
              cx={connections[0].toX}
              cy={connections[0].toY}
              r="10"
              fill="#2563eb"
              opacity="0.6"
              className="drop-shadow-md"
            />
            <circle
              cx={connections[0].toX}
              cy={connections[0].toY}
              r="5"
              fill="white"
              opacity="0.9"
            />
          </>
        )}
      </svg>
    </div>
  );
};

export default ConnectionsSVG;
