"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Float, Stars, Sparkles, Line } from "@react-three/drei";
import { XR, createXRStore } from "@react-three/xr";
import * as THREE from "three";
import type { NarrativeNode } from "@/types/content";
import { useGlitchSynth } from "@/hooks/use-glitch-synth";

const store = typeof window !== "undefined" ? createXRStore() : null;

type NodeStarProps = {
  node: NarrativeNode;
  active: boolean;
  onSelect: () => void;
};

function NodeStar({ node, active, onSelect }: NodeStarProps) {
  const meshRef = useRef<THREE.Group>(null!);
  const { trigger } = useGlitchSynth();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(t + node.position.x) * 0.005;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group 
        ref={meshRef} 
        position={[node.position.x / 10 - 5, node.position.y / 10 - 5, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
          trigger(80);
        }}
      >
        <mesh>
          <sphereGeometry args={[active ? 0.35 : 0.2, 32, 32]} />
          <meshStandardMaterial 
            color={active ? "#ff7b42" : "#42d3b9"} 
            emissive={active ? "#ff7b42" : "#42d3b9"}
            emissiveIntensity={active ? 2 : 1}
          />
        </mesh>
        
        {active && (
          <Text
            position={[0, 0.6, 0]}
            fontSize={0.25}
            color="white"
          >
            {node.label}
          </Text>
        )}
      </group>
    </Float>
  );
}

function ConstellationLines({ nodes }: { nodes: NarrativeNode[] }) {
  const points = useMemo(() => {
    return nodes.map(n => [n.position.x / 10 - 5, n.position.y / 10 - 5, 0] as [number, number, number]);
  }, [nodes]);

  return (
    <group>
      {points.map((p, i) => (
        <Line 
          key={i}
          points={[[0, 0, 0], p]}
          color="white"
          transparent
          opacity={0.05}
          lineWidth={0.5}
        />
      ))}
    </group>
  );
}

type Props = {
  nodes: NarrativeNode[];
  activeNodeId?: string;
  onNodeSelect: (id: string) => void;
};

export function ChronoHelix({ nodes, activeNodeId, onNodeSelect }: Props) {
  return (
    <div className="chrono-helix-wrap">
      <div className="xr-buttons">
        <button onClick={() => store?.enterVR()}>ENTER VR</button>
        <button onClick={() => store?.enterAR()}>ENTER AR</button>
      </div>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        {store && (
          <XR store={store}>
            <color attach="background" args={["#081218"]} />
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Sparkles count={200} scale={15} size={2} speed={0.4} opacity={0.2} />

            <group>
              {nodes.map((node) => (
                <NodeStar
                  key={node.id}
                  node={node}
                  active={activeNodeId === node.id}
                  onSelect={() => onNodeSelect(node.id)}
                />
              ))}
              <ConstellationLines nodes={nodes} />
            </group>

            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              minDistance={5} 
              maxDistance={30} 
              makeDefault 
            />
          </XR>
        )}
      </Canvas>
    </div>
  );
}
