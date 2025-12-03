// src/components/ui/table.jsx
import React from "react";

export function Table({ children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">{children}</table>
    </div>
  );
}

export function THead({ children }) {
  return (
    <thead className="bg-slate-900 text-slate-300 border-b border-slate-700">
      {children}
    </thead>
  );
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-slate-800">{children}</tbody>;
}

export function TR({ children, className = "" }) {
  return (
    <tr
      className={`
        bg-slate-900
        hover:bg-slate-800
        transition
        ${className}
      `}
    >
      {children}
    </tr>
  );
}

export function TH({ children }) {
  return (
    <th className="text-left text-sm font-semibold p-3 text-slate-300">
      {children}
    </th>
  );
}

export function TD({ children }) {
  return (
    <td className="p-3 text-sm text-slate-200">
      {children}
    </td>
  );
}
