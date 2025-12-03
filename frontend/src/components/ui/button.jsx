import React from "react";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90",
    outline:
      "border border-border text-foreground hover:bg-muted",
    ghost:
      "hover:bg-muted text-foreground",
    danger:
      "bg-destructive text-white hover:bg-destructive/90",
  };

  return (
    <button
      className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 transition ${variants[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={18} />}
      {children}
    </button>
  );
}

/* Named export for compatibility */
export { Button as defaultButton };
export { Button };
