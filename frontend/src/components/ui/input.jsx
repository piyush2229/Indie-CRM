import React from "react";

export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 rounded-md bg-input border border-border placeholder:text-muted-foreground text-foreground focus:ring-2 focus:ring-ring outline-none transition ${className}`}
      {...props}
    />
  );
}
