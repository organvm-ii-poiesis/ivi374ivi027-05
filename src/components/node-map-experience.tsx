"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";

import type { CanonicalDoc, NarrativeNode } from "@/types/content";
import { ArtifactOverlay } from "./artifact-overlay";
import { ChronoHelix } from "./sensorium/chrono-helix";
import { NodeMap2D } from "./node-map-2d";
import { useGlitchSynth } from "@/hooks/use-glitch-synth";
import { useNodeNavigation } from "@/hooks/use-node-navigation";

interface Props {
  nodes: NarrativeNode[];
  docs: CanonicalDoc[];
}

function buildDocLookup(docs: CanonicalDoc[]): Record<string, CanonicalDoc> {
  return docs.reduce<Record<string, CanonicalDoc>>((acc, doc) => {
    acc[doc.slug] = doc;
    return acc;
  }, {});
}

/**
 * Main container for the multi-mode Node Map experience.
 * Orchestrates 2D, 3D, and Audio layers.
 */
export function NodeMapExperience({ nodes, docs }: Props) {
  const docsBySlug = useMemo(() => buildDocLookup(docs), [docs]);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");
  
  const { 
    activeNode, 
    viewBox, 
    zoom, 
    setActive, 
    setZoom, 
    resetViewport 
  } = useNodeNavigation(nodes);

  const { init: initAudio, trigger: triggerGlitch, setMode: setAudioMode } = useGlitchSynth();

  useEffect(() => {
    if (activeNode) {
      setAudioMode(activeNode.theme);
    }
  }, [activeNode, setAudioMode]);

  return (
    <section 
      className="node-map-shell" 
      aria-label="Mythic Node Map"
      onClick={() => initAudio()}
    >
      {/* Mobile view fallback */}
      <div className="mobile-node-list" role="listbox" aria-label="Select a character or motif">
        {nodes.map((node, index) => (
          <button
            key={`mobile-${node.id}`}
            className={activeNode?.id === node.id ? "mobile-node-item active" : "mobile-node-item"}
            onClick={() => {
              setActive(index);
              triggerGlitch(40);
            }}
            aria-selected={activeNode?.id === node.id}
            role="option"
          >
            {node.label} {node.isTrending && "🔥"}
          </button>
        ))}
      </div>

      <div className="node-map-canvas-wrap">
        <nav className="view-toggle">
          <button 
            className={viewMode === "2d" ? "active" : ""} 
            onClick={() => setViewMode("2d")}
          >
            2D Map
          </button>
          <button 
            className={viewMode === "3d" ? "active" : ""} 
            onClick={() => setViewMode("3d")}
          >
            3D Helix
          </button>
        </nav>

        {viewMode === "2d" ? (
          <>
            <div className="constellation-controls">
              <span className="zoom-level">Scale: {zoom.toFixed(1)}x</span>
              <button onClick={() => setZoom((z) => z + 0.5)} aria-label="Zoom in">+</button>
              <button onClick={() => setZoom((z) => z - 0.5)} aria-label="Zoom out">-</button>
              <button onClick={resetViewport} aria-label="Reset view">Reset</button>
            </div>
            <NodeMap2D 
              nodes={nodes} 
              activeNodeId={activeNode?.id} 
              viewBox={viewBox} 
              onNodeSelect={(idx) => {
                setActive(idx);
                triggerGlitch(60);
              }}
            />
          </>
        ) : (
          <ChronoHelix 
            nodes={nodes} 
            activeNodeId={activeNode?.id} 
            onNodeSelect={(id) => {
              const idx = nodes.findIndex(n => n.id === id);
              if (idx !== -1) setActive(idx);
            }} 
          />
        )}
      </div>

      <aside id="active-node-details" className="node-map-panel" aria-live="polite">
        {activeNode ? (
          <>
            <div className="panel-header">
              <h2>{activeNode.label}</h2>
              {activeNode.isTrending && (
                <span className="badge-trending" title={`${activeNode.viewCount} views`}>
                  🔥 Trending Motif
                </span>
              )}
            </div>
            <p className="eyebrow">Theme: {activeNode.theme}</p>

            <h3>Linked Documents</h3>
            <ul>
              {activeNode.linkedDocSlugs.map((slug) => {
                const doc = docsBySlug[slug];
                if (!doc) return null;
                return (
                  <li key={slug}>
                    <Link href={`/read/${slug}`}>{doc.title}</Link>
                  </li>
                );
              })}
            </ul>

            <h3>Section Crossings</h3>
            <ul>
              {activeNode.linkedSections.slice(0, 8).map((sectionRef) => {
                const [docSlug, anchor] = sectionRef.split("#");
                return (
                  <li key={sectionRef}>
                    <Link href={`/read/${docSlug}#${anchor}`}>{sectionRef}</Link>
                  </li>
                );
              })}
            </ul>

            <ArtifactOverlay nodeId={activeNode.id} />
          </>
        ) : (
          <p>No nodes found yet.</p>
        )}
      </aside>
    </section>
  );
}
