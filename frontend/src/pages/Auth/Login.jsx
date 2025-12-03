import Button from "../../components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "../../components/ui/card";
import api from "../../lib/axios";
import { ArrowRight } from "lucide-react";

/* GOOGLE ICON COMPONENT */
function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.61l6.85-6.85C35.9 2.38 30.47 0 24 0 14.32 0 6.06 5.6 2.23 13.72l7.98 6.19C12.43 13 17.74 9.5 24 9.5z"/>
      <path fill="#FBBC05" d="M46.14 24.55c0-1.64-.15-3.24-.42-4.78H24v9.06h12.65c-.55 2.98-2.23 5.51-4.77 7.26l7.32 5.67C43.87 37.19 46.14 31.41 46.14 24.55z"/>
      <path fill="#34A853" d="M10.21 28.1c-.5-1.5-.78-3.09-.78-4.75 0-1.66.28-3.25.78-4.75L2.23 12.47C.78 15.44 0 19.1 0 22.85s.78 7.41 2.23 10.38l7.98-6.19z"/>
      <path fill="#4285F4" d="M24 48c6.48 0 11.93-2.13 15.9-5.79l-7.32-5.67C30.5 38.77 27.39 40 24 40c-6.26 0-11.57-3.5-14.03-8.41l-7.98 6.19C6.06 42.4 14.32 48 24 48z"/>
    </svg>
  );
}

export default function Login() {
  const startGoogleLogin = async () => {
    try {
      const res = await api.get("/auth/google/url");
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Google login failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col">

      {/* HEADER (same as landing) */}
      <header className="px-6 py-4 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight">Indie CRM</span>
            <span className="px-2 py-0.5 text-xs bg-blue-600/20 border border-blue-400/40 rounded">
              Beta
            </span>
          </div>
        </div>
      </header>

      {/* HERO TEXT */}
      <section className="px-6 pt-16 pb-10 md:pt-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Sign in  
            <span className="text-blue-400 block md:inline">with Google</span>
          </h1>

          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
            Continue to IndieCRM — the AI-powered CRM that syncs Gmail, analyzes leads, and automates your workflow.
          </p>
        </div>
      </section>

      {/* LOGIN CARD */}
      <div className="px-6 flex justify-center mb-10">
        <Card className="w-full max-w-lg bg-slate-900/60 border border-white/10 shadow-xl rounded-xl backdrop-blur">
          
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-white">
              Continue with Google
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <Button
              variant="outline"
              onClick={startGoogleLogin}
              className="w-full bg-white text-black hover:bg-gray-200 flex justify-center items-center gap-2 py-3"
            >
              <GoogleIcon size={20} />
              Sign in with Google <ArrowRight size={18} />
            </Button>

            <p className="text-center text-slate-400 text-sm">
              Fast • Secure • One-click login
            </p>
          </CardContent>

        </Card>
      </div>

      <footer className="text-center text-slate-500 text-sm mb-6">
        Indie CRM © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
