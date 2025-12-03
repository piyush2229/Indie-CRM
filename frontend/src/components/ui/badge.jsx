// src/components/ui/badge.jsx
import React from "react";

export default function Badge({
  children,
  variant = "default",
  className = "",
}) {
  const variants = {
    default:
      "bg-muted text-muted-foreground border border-border/40",
    primary:
      "bg-primary text-primary-foreground border border-primary/40",
    success:
      "bg-green-500/20 text-green-400 border border-green-500/40",
    warning:
      "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40",
    danger:
      "bg-red-600/20 text-red-400 border border-red-600/40",
    info:
      "bg-blue-600/20 text-blue-400 border border-blue-600/40",
    outline:
      "border border-border text-foreground bg-transparent",
  };

  return (
    <span
      className={`
        inline-flex items-center px-2 py-1
        text-xs font-medium rounded-md select-none
        transition-all duration-200
        ${variants[variant] || variants.default}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
