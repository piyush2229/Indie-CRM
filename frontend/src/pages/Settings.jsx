import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-xl p-6 bg-slate-900/50 rounded-xl border border-white/10 shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-4">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
      </div>

      <Button className="mt-6" variant="destructive" onClick={logout}>
        Logout
      </Button>
    </div>
  );
}
