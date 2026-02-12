"use client";

import { useMemo } from "react";
import artifactsData from "@/data/artifacts.json";

type Artifact = {
  id: string;
  path: string;
  filename: string;
  type: string;
  associatedNode?: string;
};

type Props = {
  nodeId: string;
};

export function ArtifactOverlay({ nodeId }: Props) {
  const artifacts = useMemo(() => {
    return (artifactsData as Artifact[]).filter(a => a.associatedNode === nodeId);
  }, [nodeId]);

  if (artifacts.length === 0) return null;

  return (
    <div className="artifact-overlay">
      <h3>Design Artifacts</h3>
      <div className="artifact-grid">
        {artifacts.map(artifact => (
          <a key={artifact.id} href={artifact.path} target="_blank" rel="noreferrer" className="artifact-card">
            <span className="artifact-icon">{artifact.type === "image" ? "🖼️" : "📄"}</span>
            <span className="artifact-name">{artifact.filename}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
