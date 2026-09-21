"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  value: number; // 1.0 a 5.0
  total?: number; // total de avaliações
  size?: "sm" | "md";
}

export function StarRating({ value, total, size = "sm" }: StarRatingProps) {
  const clamped = Math.max(1, Math.min(5, value));
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <div className="flex items-center gap-1">
      <div className="flex text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSize} ${
              star <= Math.round(clamped) ? "fill-current" : "fill-current opacity-25"
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-gray-700">{clamped.toFixed(1)}</span>
      <span className="text-xs text-gray-500">/5</span>
      {total !== undefined && (
        <span className="text-[10px] text-gray-400 ml-1">
          ({total} avaliaç{total !== 1 ? "ões" : "ão"})
        </span>
      )}
    </div>
  );
}
