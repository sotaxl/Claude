import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export function StarRating({ rating, maxRating = 5, size = "md", showValue = false, className }: StarRatingProps) {
  const sizes = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };
  const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;
          return (
            <Star
              key={i}
              className={cn(
                sizes[size],
                filled ? "fill-amber-400 text-amber-400" : partial ? "fill-amber-200 text-amber-400" : "fill-slate-100 text-slate-300"
              )}
            />
          );
        })}
      </div>
      {showValue && (
        <span className={cn("font-semibold text-slate-700", textSizes[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
