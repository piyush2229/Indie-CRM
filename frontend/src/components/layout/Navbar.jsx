import { useAuth } from "../../context/AuthContext";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="
      w-full h-16 bg-slate-900/60 backdrop-blur 
      border-b border-white/10 
      px-4 md:px-6 
      flex items-center justify-between
    ">
      {/* Left: Title */}
      <h2 className="text-lg md:text-xl font-semibold">
        Welcome back 👋
      </h2>

      {/* Right: User Info + Logout (Desktop Only) */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${user?.name || "User"}`}
            className="h-10 w-10 rounded-full border border-white/10 shadow"
          />
          <div className="text-sm">
            <p className="font-semibold">{user?.name}</p>
            <p className="text-slate-400 text-xs">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
