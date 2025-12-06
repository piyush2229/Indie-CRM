import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  Mail,
  Menu,
  LogOut,
  Folder,
  X
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  const items = [
    { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Leads", to: "/leads", icon: <Mail size={18} /> },
    { label: "Clients", to: "/clients", icon: <Users size={18} /> },
    { label: "Projects", to: "/projects", icon: <Folder size={18} /> },
    { label: "Settings", to: "/settings", icon: <Settings size={18} /> },
  ];

  return (
    <>
      {/* MOBILE NAVBAR (prevents collision) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900 border-b border-slate-800 z-40 flex items-center px-4 justify-between">
        <button
          onClick={() => setOpen(true)}
          className="p-2 bg-slate-800 rounded-lg text-white"
        >
          <Menu size={22} />
        </button>

        <span className="text-white font-semibold text-lg">Indie CRM</span>

        <div className="w-[32px]"></div>
      </div>

      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed md:static top-0 left-0 h-full
          bg-slate-900 text-white border-r border-white/10 shadow-lg
          z-50 transition-all duration-300
          overflow-hidden
          ${open ? "w-64" : "w-0 md:w-64"}
        `}
      >
        {/* HEADER */}
        <div className="py-5 px-6 font-bold text-xl border-b border-white/10 flex justify-between items-center">
          <span>Indie CRM</span>

          {/* Close button for mobile */}
          <button
            onClick={() => setOpen(false)}
            className="md:hidden text-white"
          >
            <X size={22} />
          </button>
        </div>

        {/* MENU */}
        <nav className="mt-6 space-y-1 px-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)} // close on mobile
              className={({ isActive }) =>
                `
                flex items-center gap-3 p-3 rounded-md text-sm transition
                ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400"
                    : "hover:bg-slate-800"
                }
              `
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="m-3 mt-auto w-[90%] flex items-center gap-3 p-3 
                     rounded-md text-red-300 hover:bg-red-900/20 transition"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* MAIN CONTENT SPACER (prevent overlapping) */}
      <div className="h-14 md:hidden"></div>
    </>
  );
}
