"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("@/components/store/linen-scene").then((mod) => mod.LinenScene), {
  ssr: false,
  loading: () => <div className="house-loader mx-auto my-24" aria-label="Loading the sculpture" />,
});

export function LinenStage({ yaw, url }: { yaw: number; url: string }) {
  return <Scene yaw={yaw} url={url} />;
}
