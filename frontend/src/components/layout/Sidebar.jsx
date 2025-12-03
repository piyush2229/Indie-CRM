import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  Mail,
  Menu,
  LogOut,
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
    { label: "Settings", to: "/settings", icon: <Settings size={18} /> },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-3 text-white hover:bg-slate-800 fixed top-3 left-3 z-50 rounded-lg bg-slate-900/70 backdrop-blur"
      >
        <Menu size={22} />
      </button>

      {/* Sidebar Container */}
      <div
        className={`
          fixed md:static top-0 left-0 h-full bg-slate-900 text-white 
          border-r border-white/10 shadow-xl
          transition-all duration-300 z-40
          ${open ? "w-64" : "w-0 md:w-64"}
        `}
      >
        {/* Close Icon for Mobile */}
        <div className="md:hidden flex justify-end p-4">
          <button onClick={() => setOpen(false)}>
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Logo */}
        <div className="py-5 px-6 font-bold text-xl">
          Indie CRM
        </div>

        {/* Menu */}
        <nav className="mt-6 space-y-1 px-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-md text-sm transition 
                 ${isActive ? "bg-blue-600/20 text-blue-400" : "hover:bg-slate-800"}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={logout}
          className="m-3 mt-auto w-[90%] flex items-center gap-3 p-3 
                     rounded-md text-red-300 hover:bg-red-900/20 transition"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </>
  );
}
