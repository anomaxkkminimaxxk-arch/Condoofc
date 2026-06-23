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

export default app;
