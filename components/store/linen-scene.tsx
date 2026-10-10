"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, useGLTF } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Group } from "three";

gsap.registerPlugin(ScrollTrigger);

function Towels() {
  const layers = [
    { y: 0.09, rot: 0.04, color: "#f7f3ee" },
    { y: 0.28, rot: -0.05, color: "#f3eee6" },
    { y: 0.47, rot: 0.03, color: "#efe8dc" },
    { y: 0.66, rot: -0.02, color: "#f6f1ea" },
  ];
  return (
    <group>
      {layers.map((layer) => (
        <mesh key={layer.y} position={[0, layer.y, 0]} rotation={[0, layer.rot, 0]} castShadow>
          <boxGeometry args={[1.7, 0.16, 1.15]} />
          <meshStandardMaterial color={layer.color} roughness={0.86} metalness={0.02} />
        </mesh>
      ))}
      <mesh position={[0, 0.74, 0.42]} rotation={[0.4, 0, 0]}>
        <torusGeometry args={[0.12, 0.015, 16, 40]} />
        <meshStandardMaterial color="#8d6b3e" roughness={0.35} metalness={0.7} />
      </mesh>
    </group>
  );
}

function UploadedModel({ url }: { url: string }) {
  const gltf = useGLTF(url);
  return (
    <Center>
      <primitive object={gltf.scene} />
    </Center>
  );
}

class ModelBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Turntable({ trigger, yaw, url }: { trigger: HTMLElement; yaw: number; url: string }) {
  const spin = useRef<Group>(null);
  useEffect(() => {
    const node = spin.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tween = gsap.fromTo(
      node.rotation,
      { y: -0.35 },
      {
        y: 0.85,
        ease: "none",
        scrollTrigger: { trigger, start: "top 75%", end: "bottom 25%", scrub: 0.8 },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [trigger]);
  useFrame((_, delta) => {
    if (!spin.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) spin.current.rotation.y += delta * 0.04;
  });
  return (
    <group ref={spin}>
      <group rotation={[0, (yaw * Math.PI) / 180, 0]}>
        {url ? (
          <ModelBoundary fallback={<Towels />}>
            <UploadedModel url={url} />
          </ModelBoundary>
        ) : (
          <Towels />
        )}
      </group>
    </group>
  );
}

function Sculpture({ yaw, url }: { yaw: number; url: string }) {
  const [trigger, setTrigger] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setTrigger} className="h-[78vh] w-full">
      {trigger ? (
        <Canvas camera={{ position: [0, 1.15, 3.7], fov: 35 }} dpr={[1, 1.5]}>
          <color attach="background" args={["#f3eee7"]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[2.5, 4, 3]} intensity={1.35} />
          <directionalLight position={[-3, 2, -2]} intensity={0.35} />
          <Turntable trigger={trigger} yaw={yaw} url={url} />
        </Canvas>
      ) : null}
    </div>
  );
}

export function LinenScene({ yaw, url }: { yaw: number; url: string }) {
  return <Sculpture yaw={yaw} url={url} />;
}
