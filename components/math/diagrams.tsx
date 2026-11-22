import type { DiagramKind } from "@/lib/math/catalog";
import { cn } from "@/lib/utils";

export function TrickDiagram({ kind }: { kind: DiagramKind }) {
  switch (kind) {
    case "fingers":
      return <FingerCycle />;
    case "digits":
      return <DigitCycle />;
    case "doubling":
      return <DoublingRow />;
    case "halves":
      return <HalfBars />;
    case "double-three":
      return <DoubleThree />;
    case "seven":
      return <SevenSplit />;
    case "make-ten":
      return <MakeTen />;
    case "count-up":
      return <CountUp />;
    case "split":
      return <SplitProduct />;
    case "carry":
      return <CarryProduct />;
    case "times-eleven":
      return <TimesEleven />;
    case "end-in-five":
      return <EndInFive />;
  }
}

function DiagramFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-6 dark:border-amber-900 dark:bg-amber-950/30">
      <figcaption className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.16em] text-amber-800 dark:text-amber-200">
        {label}
      </figcaption>
      {children}
    </figure>
  );
}

function FingerCycle() {
  return (
    <DiagramFrame label="Fold one finger">
      <div className="relative h-56" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => {
          const folded = index + 1;
          return (
            <div
              key={folded}
              className={cn(
                "math-frame-10 absolute inset-0 flex items-center justify-center",
                folded === 7 && "math-frame-still",
              )}
              style={{ animationDelay: `${index * 2}s` }}
            >
              <FingerRow folded={folded} />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-600 dark:text-zinc-300">
        <Legend swatch="bg-amber-500" text="Left of the fold: tens" />
        <Legend swatch="bg-emerald-500" text="Right of the fold: ones" />
        <Legend swatch="bg-zinc-300 dark:bg-zinc-600" text="Folded finger" />
      </div>
    </DiagramFrame>
  );
}

function FingerRow({ folded }: { folded: number }) {
  const tens = folded - 1;
  const ones = 10 - folded;
  return (
    <div>
      <div className="flex items-end justify-center gap-6">
        <Hand from={1} folded={folded} />
        <Hand from={6} folded={folded} />
      </div>
      <p className="mt-4 text-center text-2xl font-semibold tabular-nums text-zinc-950 dark:text-white">
        9 × {folded} = {tens * 10 + ones}
      </p>
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-300">
        {tens} on the left, {ones} on the right
      </p>
    </div>
  );
}

function Hand({ from, folded }: { from: number; folded: number }) {
  return (
    <div className="w-[8.5rem]">
      <div className="flex items-end justify-between px-1">
        {Array.from({ length: 5 }, (_, offset) => {
          const n = from + offset;
          const foldedFinger = n === folded;
          const tone = n < folded ? "bg-amber-500" : "bg-emerald-500";
          return (
            <div key={n} className="flex w-6 flex-col items-center">
              <div
                className={cn(
                  "w-5 rounded-t-full",
                  foldedFinger ? "h-6 bg-zinc-300 dark:bg-zinc-600" : cn("h-14", tone),
                )}
              />
              <span className="mt-1 text-[11px] font-semibold tabular-nums text-zinc-600 dark:text-zinc-300">{n}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-1 h-7 rounded-b-2xl bg-zinc-200 dark:bg-zinc-700" />
    </div>
  );
}

function Legend({ swatch, text }: { swatch: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("h-3 w-3 rounded-full", swatch)} />
      {text}
    </span>
  );
}

function DigitCycle() {
  const frames = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <DiagramFrame label="One less, then the pair that adds to 9">
      <div className="relative h-48" aria-hidden="true">
        {frames.map((n, index) => {
          const tens = n - 1;
          const ones = 9 - tens;
          return (
            <div
              key={n}
              className={cn(
                "math-frame-9 absolute inset-0 flex flex-col items-center justify-center",
                n === 7 && "math-frame-still",
              )}
              style={{ animationDelay: `${index * 2}s` }}
            >
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">9 × {n}</p>
              <div className="mt-3 flex items-end gap-4">
                <Digit value={tens} hint="n − 1" tone="amber" />
                <Digit value={ones} hint="makes 9" tone="emerald" />
              </div>
              <p className="mt-3 text-3xl font-semibold tabular-nums text-zinc-950 dark:text-white">
                {tens}
                {ones}
              </p>
            </div>
          );
        })}
      </div>
    </DiagramFrame>
  );
}

function Digit({ value, hint, tone }: { value: number; hint: string; tone: "amber" | "emerald" }) {
  return (
    <div className="text-center">
      <div
        className={cn(
          "flex h-16 w-14 items-center justify-center rounded-2xl text-3xl font-semibold tabular-nums text-white",
          tone === "amber" ? "bg-amber-500" : "bg-emerald-500",
        )}
      >
        {value}
      </div>
      <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">{hint}</p>
    </div>
  );
}

function DoublingRow() {
  const steps = [
    { label: "start", value: "7", note: "the number" },
    { label: "× 2", value: "14", note: "double once" },
    { label: "× 4", value: "28", note: "double again" },
    { label: "× 8", value: "56", note: "one more double" },
  ];
  return (
    <DiagramFrame label="Double, double, double">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center gap-2">
            {index > 0 && (
              <span className="math-nudge text-amber-700 dark:text-amber-300" aria-hidden>
                →
              </span>
            )}
            <div className="w-24 rounded-2xl border border-amber-200 bg-white px-3 py-3 text-center dark:border-amber-800 dark:bg-zinc-900">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                {step.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-950 dark:text-white">{step.value}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{step.note}</p>
            </div>
          </div>
        ))}
      </div>
    </DiagramFrame>
  );
}

function HalfBars() {
  return (
    <DiagramFrame label="Half of the ten">
      <div className="mx-auto max-w-md space-y-4">
        <Bar label="6 × 10 = 60" width="100%" fill="bg-amber-400" />
        <div className="w-1/2">
          <div className="mb-1 flex items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <span>6 × 5 = 30</span>
            <span>half</span>
          </div>
          <div className="h-8 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div className="math-grow h-full rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>
    </DiagramFrame>
  );
}

function Bar({ label, width, fill }: { label: string; width: string; fill: string }) {
  return (
    <div style={{ width }}>
      <p className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">{label}</p>
      <div className={cn("h-8 rounded-full", fill)} />
    </div>
  );
}

function DoubleThree() {
  return (
    <DiagramFrame label="A six is a doubled three">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <FactCard kicker="8 × 3" value="24" note="the three" />
        <span className="math-nudge text-lg font-semibold text-amber-700 dark:text-amber-300">double →</span>
        <FactCard kicker="8 × 6" value="48" note="the six" />
      </div>
    </DiagramFrame>
  );
}

function SevenSplit() {
  return (
    <DiagramFrame label="Five plus two">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <FactCard kicker="6 × 5" value="30" note="half of 60" />
        <span className="text-2xl font-semibold text-zinc-400">+</span>
        <FactCard kicker="6 × 2" value="12" note="a double" />
        <span className="text-2xl font-semibold text-zinc-400">=</span>
        <FactCard kicker="6 × 7" value="42" note="the seven" />
      </div>
    </DiagramFrame>
  );
}

function FactCard({ kicker, value, note }: { kicker: string; value: string; note: string }) {
  return (
    <div className="min-w-28 rounded-2xl border border-amber-200 bg-white px-3 py-3 text-center dark:border-amber-800 dark:bg-zinc-900">
      <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">{kicker}</p>
      <p className={cn("mt-1 font-semibold tabular-nums text-zinc-950 dark:text-white", value.length > 3 ? "text-2xl" : "text-3xl")}>{value}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{note}</p>
    </div>
  );
}

function MakeTen() {
  return (
    <DiagramFrame label="Fill up to ten">
      <div className="mx-auto max-w-md space-y-5">
        <div>
          <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">8 needs 2 more to make 10</p>
          <TenFrame filled={8} borrowed={2} />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">7 gives those 2 and keeps 5</p>
          <div className="flex items-center gap-3">
            <TenFrame filled={8} borrowed={2} />
            <span className="text-lg font-semibold text-zinc-500">+ 5</span>
            <span className="text-lg font-semibold text-zinc-950 dark:text-white">= 15</span>
          </div>
        </div>
      </div>
    </DiagramFrame>
  );
}

function TenFrame({ filled, borrowed }: { filled: number; borrowed: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 10 }, (_, index) => {
        const borrowedCell = index >= filled && index < filled + borrowed;
        const solid = index < filled;
        return (
          <span
            key={index}
            className={cn(
              "h-8 w-5 rounded-md sm:w-6",
              solid && "bg-amber-500",
              borrowedCell && "bg-emerald-500",
              !solid && !borrowedCell && "bg-zinc-200 dark:bg-zinc-800",
            )}
          />
        );
      })}
    </div>
  );
}

function CountUp() {
  const ticks = [0, 5, 9, 10, 15];
  return (
    <DiagramFrame label="Hop from 9 up to 15">
      <div className="relative mx-auto w-full max-w-lg">
      <svg viewBox="0 0 360 140" className="w-full text-zinc-700 dark:text-zinc-200" role="img" aria-label="Number line from 0 to 15. A hop of 1 from 9 to 10, then a hop of 5 from 10 to 15.">
        <line x1="20" y1="72" x2="340" y2="72" stroke="currentColor" strokeWidth="2" />
        {ticks.map((tick) => {
          const x = 20 + tick * 20;
          return (
            <g key={tick}>
              <line x1={x} y1="66" x2={x} y2="78" stroke="currentColor" strokeWidth="2" />
              <text x={x} y={tick === 10 ? 116 : 98} textAnchor="middle" className="fill-current text-[12px]">
                {tick}
              </text>
            </g>
          );
        })}
        <text x="210" y="28" textAnchor="middle" className="fill-amber-700 text-[13px] font-semibold dark:fill-amber-300">
          +1
        </text>
        <text x="270" y="28" textAnchor="middle" className="fill-emerald-700 text-[13px] font-semibold dark:fill-emerald-300">
          +5
        </text>
        <path d="M200 48 H220" stroke="currentColor" fill="none" strokeWidth="1.5" />
        <path d="M220 48 H320" stroke="currentColor" fill="none" strokeWidth="1.5" />
      </svg>
      <span className="math-hop absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500" />
      </div>
      <p className="text-center text-lg font-semibold tabular-nums text-zinc-950 dark:text-white">15 − 9 = 6</p>
    </DiagramFrame>
  );
}

function SplitProduct() {
  return (
    <DiagramFrame label="83 is 80 plus 3">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <FactCard kicker="80 × 7" value="560" note="the tens" />
        <span className="text-2xl font-semibold text-zinc-400">+</span>
        <FactCard kicker="3 × 7" value="21" note="the ones" />
        <span className="math-nudge text-2xl font-semibold text-amber-700 dark:text-amber-300">=</span>
        <FactCard kicker="83 × 7" value="581" note="the product" />
      </div>
    </DiagramFrame>
  );
}

function CarryProduct() {
  return (
    <DiagramFrame label="Write the ones, carry the rest">
      <div className="mx-auto grid max-w-sm gap-3">
        <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-white px-4 py-3 dark:border-amber-800 dark:bg-zinc-900">
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">3 × 7 = 21</span>
          <span className="text-sm text-zinc-600 dark:text-zinc-300">write 1, carry 2</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-white px-4 py-3 dark:border-amber-800 dark:bg-zinc-900">
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">8 × 7 = 56</span>
          <span className="text-sm text-zinc-600 dark:text-zinc-300">56 + 2 = 58</span>
        </div>
        <p className="text-center text-3xl font-semibold tabular-nums text-zinc-950 dark:text-white">581</p>
      </div>
    </DiagramFrame>
  );
}

function TimesEleven() {
  const places = [
    { value: "8", hint: "stays", tone: "bg-amber-500" },
    { value: "11", hint: "8 + 3", tone: "bg-emerald-500" },
    { value: "3", hint: "stays", tone: "bg-amber-500" },
  ];
  return (
    <DiagramFrame label="Ends stay, middle is the sum">
      <div className="flex flex-wrap items-end justify-center gap-3">
        {places.map((place) => (
          <div key={place.hint + place.value} className="text-center">
            <div className={cn("flex h-16 min-w-14 items-center justify-center rounded-2xl px-3 text-3xl font-semibold tabular-nums text-white", place.tone)}>
              {place.value}
            </div>
            <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">{place.hint}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-300">Carry 1 from the 11 onto the 8</p>
      <p className="mt-1 text-center text-3xl font-semibold tabular-nums text-zinc-950 dark:text-white">913</p>
    </DiagramFrame>
  );
}

function EndInFive() {
  return (
    <DiagramFrame label="One more than the front digit">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <FactCard kicker="3 × 4" value="12" note="one more than 3" />
        <span className="math-nudge text-lg font-semibold text-amber-700 dark:text-amber-300">then</span>
        <FactCard kicker="ending" value="25" note="always" />
        <span className="text-2xl font-semibold text-zinc-400">=</span>
        <FactCard kicker="35 × 35" value="1225" note="the square" />
      </div>
    </DiagramFrame>
  );
}
