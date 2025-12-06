import { ArrowRight, Sparkles, Mail, BrainCircuit, ShieldCheck, Zap } from "lucide-react";
import Button from "../../components/ui/button";
import api from "../../lib/axios";

/* GOOGLE LOGIN HANDLER */
const startGoogleLogin = async () => {
  try {
    const res = await api.get("/auth/google/url");
    window.location.href = res.data.url;
  } catch (err) {
    console.error("Google login failed", err);
  }
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">

      {/* NAVBAR */}
      <nav className="px-6 py-5 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-extrabold">IndieCRM</div>

          <div className="flex items-center gap-6">
            <button
              onClick={startGoogleLogin}
              className="text-slate-300 hover:text-white transition"
            >
              Login
            </button>

            <Button
              onClick={startGoogleLogin}
              className="bg-blue-600 hover:bg-blue-700 px-5"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>


      {/* HERO SECTION */}
      <section className="pt-24 pb-20 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            The AI CRM that reads your{" "}
            <span className="text-blue-400">Emails, Creates Leads</span>,
            and Grows Your Business.
          </h1>

          <p className="mt-8 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            IndieCRM automatically syncs Gmail → analyzes emails → extracts leads →
            scores them using AI → schedules follow-ups —
            <span className="text-white font-semibold"> all in one place.</span>
          </p>

          <div className="mt-10 flex justify-center">
            <Button
              onClick={startGoogleLogin}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4 flex items-center gap-2"
            >
              Start For Free <ArrowRight size={20} />
            </Button>
          </div>

          <p className="text-slate-400 text-sm mt-4">No credit card required.</p>
        </div>
      </section>


      {/* FEATURE BADGES */}
      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-4 text-center">
          {[
            { icon: Mail, text: "Auto Gmail Sync" },
            { icon: BrainCircuit, text: "AI Lead Scoring" },
            { icon: Zap, text: "Instant Lead Extraction" },
            { icon: ShieldCheck, text: "Enterprise Security" },
          ].map(({ icon: Icon, text }, i) => (
            <div
              key={i}
              className="bg-slate-800/40 border border-slate-700 p-5 rounded-xl flex flex-col items-center gap-3"
            >
              <Icon size={28} className="text-blue-400" />
              <p className="text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </section>


      {/* WHY SECTION */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">

          {/* LEFT */}
          <div>
            <h2 className="text-4xl font-bold leading-tight">
              Stop copy-pasting leads from email.
              <span className="text-blue-400 block">IndieCRM does it automatically.</span>
            </h2>

            <p className="text-slate-400 mt-6 text-lg">
              Every incoming email is scanned. If it looks like a project inquiry,
              hire request, or quotation email — IndieCRM generates a ready-to-use lead instantly.
            </p>

            <ul className="mt-8 space-y-4 text-slate-300">
              <li>✔ AI detects client intent & urgency</li>
              <li>✔ Extracts name, email, project details</li>
              <li>✔ Scores leads 0–100 based on intent</li>
              <li>✔ Auto follow-up reminders</li>
            </ul>

            <Button
              onClick={startGoogleLogin}
              className="mt-10 bg-blue-600 px-7 py-3 hover:bg-blue-700"
            >
              Try It Now
            </Button>
          </div>

          {/* RIGHT */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-6 shadow-xl">
            <div className="text-slate-400">Example extracted from Gmail:</div>

            <div className="mt-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
              <p className="text-blue-400 font-semibold">New Lead Detected</p>
              <p className="mt-2 text-slate-300">
                "Hey, I need a website redesign. Budget around $1200."
              </p>
              <p className="text-green-400 font-semibold mt-3">
                Score: 92 (High Intent)
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* FAQ */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

        <div className="space-y-8">
          {[
            {
              q: "How does IndieCRM get leads from Gmail?",
              a: "We use secure OAuth permissions to analyze your inbox and detect client emails using AI.",
            },
            {
              q: "Do you store my emails?",
              a: "No. We only store structured lead data. Raw emails never leave your Gmail account.",
            },
            {
              q: "Can I connect multiple Gmail accounts?",
              a: "Not right now — but multi-account support is coming soon.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-slate-900 p-6 rounded-xl border border-slate-800"
            >
              <p className="font-semibold text-white">{item.q}</p>
              <p className="mt-2 text-slate-400">{item.a}</p>
            </div>
          ))}
        </div>
        </div>
      </section>


      {/* FOOTER */}
      <footer className="text-center text-slate-500 py-10 text-sm">
        IndieCRM © {new Date().getFullYear()} — All rights reserved
      </footer>

    </div>
  );
}
