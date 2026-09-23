import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export const QuantitySelector = ({
  quantity,
  onQuantityChange,
  min = 1,
  max = 10,
  className,
}: QuantitySelectorProps) => {
  const decrease = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };

  const increase = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className={cn("flex items-center gap-0 border border-border", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={decrease}
        disabled={quantity <= min}
        className="h-8 w-8 sm:h-11 sm:w-11 rounded-none hover:bg-accent disabled:opacity-30"
      >
        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
      <span className="w-8 sm:w-12 text-center text-xs sm:text-sm font-medium tabular-nums">
        {quantity}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={increase}
        disabled={quantity >= max}
        className="h-8 w-8 sm:h-11 sm:w-11 rounded-none hover:bg-accent disabled:opacity-30"
      >
        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
      </Button>
    </div>
  );
};
