import clsx from "clsx";
import { stockLabel, type StockStatus } from "@/lib/products";

const tone: Record<StockStatus, string> = {
  in: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/25",
  low: "bg-forge-500/10 text-forge-300 ring-forge-400/25",
  request: "bg-mist-400/10 text-mist-200 ring-white/15",
};

export function StockBadge({
  status,
  stockLeft,
  className,
}: {
  status: StockStatus;
  stockLeft?: number;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        tone[status],
        className,
      )}
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          status === "in" && "bg-emerald-400",
          status === "low" && "bg-forge-400 pulse-ring",
          status === "request" && "bg-mist-400",
        )}
      />
      {stockLabel[status]}
      {status === "low" && typeof stockLeft === "number" && (
        <span className="font-medium opacity-80">· {stockLeft} left</span>
      )}
    </span>
  );
}
