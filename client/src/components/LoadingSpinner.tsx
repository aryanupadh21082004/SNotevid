import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3", 
    lg: "w-12 h-12 border-4"
  };

  return (
    <div 
      className={cn(
        "border-muted border-t-primary rounded-full animate-spin",
        sizeClasses[size],
        className
      )}
      data-testid="loading-spinner"
    />
  );
}
