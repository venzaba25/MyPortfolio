import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "outline";
}

export function Badge({ 
  children, 
  className,
  variant = "default" 
}: BadgeProps) {
  const variants = {
    default: "bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900",
    secondary: "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50",
    outline: "border border-neutral-200 bg-white text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50"
  };

  return (
    <div className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors",
      variants[variant],
      className
    )}>
      {children}
    </div>
  );
}