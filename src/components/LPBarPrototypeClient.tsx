"use client";

import dynamic from "next/dynamic";

const LPBarPrototype = dynamic(() => import("./LPBarPrototype"), {
  ssr: false,
});

export default function LPBarPrototypeClient() {
  return <LPBarPrototype />;
}
