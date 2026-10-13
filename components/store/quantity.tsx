"use client";

import { Minus, Plus } from "lucide-react";
import { MAX_LINE_QUANTITY } from "@/lib/catalog";

export function QuantityStepper({ value, onChange, label }: { value: number; onChange: (value: number) => void; label: string }) {
  return (
    <div className="inline-flex items-center border border-line bg-white" role="group" aria-label={`Quantity for ${label}`}>
      <button type="button" className="grid h-10 w-10 place-items-center text-navy hover:bg-ivory disabled:opacity-30" aria-label="One fewer" disabled={value <= 1} onClick={() => onChange(value - 1)}>
        <Minus size={14} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_LINE_QUANTITY}
        value={value}
        aria-label="Quantity"
        onChange={(event) => {
          const next = Math.floor(Number(event.target.value));
          if (Number.isFinite(next) && next >= 1) onChange(Math.min(next, MAX_LINE_QUANTITY));
        }}
        className="tabular h-10 w-12 border-x border-line bg-transparent text-center text-sm text-navy outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button type="button" className="grid h-10 w-10 place-items-center text-navy hover:bg-ivory disabled:opacity-30" aria-label="One more" disabled={value >= MAX_LINE_QUANTITY} onClick={() => onChange(value + 1)}>
        <Plus size={14} />
      </button>
    </div>
  );
}
