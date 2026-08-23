import { Check } from "lucide-react";

export interface StepperStep {
  label: string;
}

export function Stepper({ steps, current }: { steps: StepperStep[]; current: number }) {
  return (
    <ol className="grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const isLast = i === steps.length - 1;
        return (
          <li
            key={step.label}
            className={`relative flex flex-col items-center ${
              isLast
                ? ""
                : `after:absolute after:left-1/2 after:top-[20px] after:h-[3px] after:w-full after:-translate-y-1/2 after:rounded-full after:content-[''] ${
                    done ? "after:bg-emerald" : "after:bg-pine/15"
                  }`
            }`}
          >
            <span
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-fast ${
                done
                  ? "border-emerald bg-emerald text-white shadow-[0_4px_10px_rgba(0,133,111,0.3)]"
                  : active
                    ? "border-pine bg-pine text-white shadow-[0_4px_10px_rgba(0,69,58,0.35)] ring-4 ring-gold/25"
                    : "border-pine/20 bg-white text-ink/40"
              }`}
            >
              {done ? <Check size={17} /> : i + 1}
            </span>
            <span
              className={`mt-2.5 max-w-[7rem] text-center text-xs font-semibold sm:text-sm ${
                active ? "text-pine" : done ? "text-emerald" : "text-ink/45"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
