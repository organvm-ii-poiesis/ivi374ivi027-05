"use client";

import React, { useRef } from "react";
import type { KeyboardEvent } from "react";
import type { NarrativeNode } from "@/types/content";

interface Props {
  nodes: NarrativeNode[];
  activeNodeId?: string;
  viewBox: string;
  onNodeSelect: (index: number, shouldFocus?: boolean) => void;
}

/**
 * Renders the 2D SVG constellation map.
 */
export function NodeMap2D({ nodes, activeNodeId, viewBox, onNodeSelect }: Props) {
  const nodeRefs = useRef<Array<SVGCircleElement | null>>([]);

  const onNodeKeyDown = (event: KeyboardEvent<SVGCircleElement>, index: number) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        onNodeSelect(index + 1, true);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        onNodeSelect(index - 1, true);
        break;
      case "Home":
        event.preventDefault();
        onNodeSelect(0, true);
        break;
      case "End":
        event.preventDefault();
        onNodeSelect(nodes.length - 1, true);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        onNodeSelect(index, false);
        break;
    }
  };

  return (
    <svg
      aria-label="Narrative constellation"
      className="node-map-canvas"
      role="listbox"
      viewBox={viewBox}
    >
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.1)" />
        </radialGradient>
      </defs>

      {nodes.map((node) => (
        <line
          key={`edge-${node.id}`}
          x1="50"
          y1="50"
          x2={node.position.x}
          y2={node.position.y}
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="0.25"
        />
      ))}

      {nodes.map((node, index) => {
        const isActive = activeNodeId === node.id;
        const descriptionId = `node-desc-${node.id}`;

        return (
          <g key={node.id} transform={`translate(${node.position.x}, ${node.position.y})`}>
            <circle
              aria-label={`${node.label} node ${node.isTrending ? "(Trending)" : ""}`}
              aria-selected={isActive}
              aria-describedby={descriptionId}
              className={isActive ? "node active" : node.isTrending ? "node trending" : "node"}
              cx="0"
              cy="0"
              fill="url(#nodeGlow)"
              r={isActive ? 2.8 : node.isTrending ? 2.4 : 2.1}
              ref={(element) => {
                nodeRefs.current[index] = element;
              }}
              role="option"
              tabIndex={isActive ? 0 : -1}
              onClick={() => onNodeSelect(index, false)}
              onFocus={() => {
                if (!isActive) onNodeSelect(index, false);
              }}
              onKeyDown={(event) => onNodeKeyDown(event, index)}
            />
            <text className="node-label" x="0" y="-3.8" textAnchor="middle" aria-hidden="true">
              {node.label}
            </text>
            <desc id={descriptionId} className="sr-only">
              Theme: {node.theme}. Links to {node.linkedDocSlugs.length} documents.{" "}
              {node.isTrending && `Popular motif with ${node.viewCount} views.`}
            </desc>
          </g>
        );
      })}
    </svg>
  );
}
