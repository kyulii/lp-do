"use client";

type Props = { message: string; visible: boolean };

export default function Toast({ message, visible }: Props) {
  return <div className={`lpb-toast ${visible ? "is-visible" : ""}`}>{message}</div>;
}
