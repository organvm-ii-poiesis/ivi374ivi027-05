"use client";

import { useState, useCallback, useMemo } from "react";
import type { NarrativeNode } from "@/types/content";
import { trackEvent } from "@/lib/analytics";

interface ViewportState {
  zoom: number;
  pan: { x: number; y: number };
}

/**
 * Hook to manage node selection, navigation state, and viewport transformations.
 */
export function useNodeNavigation(nodes: NarrativeNode[]) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewport, setViewport] = useState<ViewportState>({ zoom: 1, pan: { x: 0, y: 0 } });

  const activeNode = useMemo(() => {
    if (nodes.length === 0) return null;
    return nodes[activeIndex % nodes.length];
  }, [nodes, activeIndex]);

  const setActive = useCallback((index: number) => {
    if (nodes.length === 0) return;

    const wrapped = (index + nodes.length) % nodes.length;
    const node = nodes[wrapped];

    setActiveIndex(wrapped);
    void trackEvent({ eventName: "node_opened", mode: "node-map", nodeId: node.id });

    // Center viewport on the active node
    setViewport(prev => ({
      ...prev,
      pan: {
        x: node.position.x - 50,
        y: node.position.y - 50,
      }
    }));
  }, [nodes]);

  const setZoom = useCallback((updater: (z: number) => number) => {
    setViewport(prev => ({
      ...prev,
      zoom: Math.max(1, Math.min(updater(prev.zoom), 4))
    }));
  }, []);

  const resetViewport = useCallback(() => {
    setViewport({ zoom: 1, pan: { x: 0, y: 0 } });
  }, []);

  const viewBox = useMemo(() => {
    const size = 100 / viewport.zoom;
    const x = 50 - size / 2 + viewport.pan.x;
    const y = 50 - size / 2 + viewport.pan.y;
    return `${x} ${y} ${size} ${size}`;
  }, [viewport]);

  return {
    activeNode,
    activeIndex,
    viewBox,
    zoom: viewport.zoom,
    setActive,
    setZoom,
    resetViewport
  };
}
