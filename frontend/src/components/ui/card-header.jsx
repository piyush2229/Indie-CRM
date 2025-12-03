export default function CardHeader({ className = "", children }) {
  return (
    <div className={`p-4 border-b border-border ${className}`}>
      {children}
    </div>
  );
}
