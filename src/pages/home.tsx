import {
  useListGames,
  useListServers,
  useListFaqs,
  useGetSiteSettings,
  useAdminLogout,
} from "@/lib/api-client";
import { AdminLoginModal } from "@/components/admin-login-modal";
import { useAdmin } from "@/hooks/use-admin";
import { GameCard, ServerCard } from "@/components/cards";
import { GameForm } from "@/components/admin/game-form";
import { ServerForm } from "@/components/admin/server-form";
import { FaqForm } from "@/components/admin/faq-form";
import { SettingsForm } from "@/components/admin/settings-form";
import { AdminFaqActions } from "@/components/admin/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Server, Gamepad2, HelpCircle, LogOut } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { data: games, isLoading: gamesLoading } = useListGames();
  const { data: servers, isLoading: serversLoading } = useListServers();
  const { data: faqs, isLoading: faqsLoading } = useListFaqs();
  const { data: settings } = useGetSiteSettings();

  const { isAdmin, logout } = useAdmin();
  const { toast } = useToast();
  const logoutMutation = useAdminLogout();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        logout();
        toast({ title: "Logged out successfully" });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-primary w-6 h-6 neon-glow" />
            <span className="font-display font-bold text-xl tracking-wider text-primary neon-text hidden sm:inline-block">
              CONDO UNIVERSE
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary neon-border hidden sm:flex">
                ADMIN MODE ACTIVE
              </Badge>
            )}
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <>
                  <SettingsForm settings={settings} />
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                <AdminLoginModal />
              )}
            </div>
          </div>
        </div>
        {settings?.announcement && (
          <div className="bg-primary/20 text-primary text-sm py-1 px-4 text-center font-display tracking-widest border-b border-primary/30 uppercase">
            <span className="neon-text">{settings.announcement}</span>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 min-h-[80vh] flex flex-col items-center justify-center border-b border-primary/20 overflow-hidden bg-scanline">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" style={{ animation: "hero-gradient 10s ease infinite" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        </div>
        <div className="container relative z-10 px-4 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-primary neon-text mb-6 tracking-tighter uppercase">
            {settings?.hero_title || "CONDO UNIVERSE"}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 font-display tracking-widest uppercase">
            {settings?.hero_subtitle || "Exclusive Roblox Condo Games & Private Servers"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {[
              { id: "games", icon: Gamepad2, label: "CONDO GAMES" },
              { id: "servers", icon: Server, label: "PRIVATE SERVERS" },
              { id: "faq", icon: HelpCircle, label: "HELP & SUPPORT" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="bg-card border border-primary/30 p-6 rounded-lg hover:neon-border group transition-all text-center flex flex-col items-center gap-4 hover:-translate-y-1"
              >
                <Icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-display text-lg tracking-wider text-foreground group-hover:text-primary transition-colors">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Games */}
      <section id="games" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary flex items-center gap-4 neon-text">
              <Gamepad2 className="w-8 h-8" /> CONDO GAMES
            </h2>
            {isAdmin && <GameForm />}
          </div>
          {gamesLoading ? (
            <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : games && games.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => <GameCard key={game.id} game={game} />)}
            </div>
          ) : (
            <div className="text-center p-12 bg-card border border-dashed border-primary/20 rounded-lg">
              <p className="text-muted-foreground font-display tracking-widest uppercase">No games currently available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Servers */}
      <section id="servers" className="py-20 bg-card/50 relative border-y border-primary/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary flex items-center gap-4 neon-text">
              <Server className="w-8 h-8" /> PRIVATE SERVERS
            </h2>
            {isAdmin && <ServerForm />}
          </div>
          {serversLoading ? (
            <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : servers && servers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {servers.map((server) => <ServerCard key={server.id} server={server} />)}
            </div>
          ) : (
            <div className="text-center p-12 bg-background border border-dashed border-primary/20 rounded-lg">
              <p className="text-muted-foreground font-display tracking-widest uppercase">No private servers currently active.</p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 relative">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary flex items-center gap-4 neon-text">
              <HelpCircle className="w-8 h-8" /> FAQ
            </h2>
            {isAdmin && <FaqForm />}
          </div>
          {faqsLoading ? (
            <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : faqs && faqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="relative group">
                  <AccordionItem value={faq.id} className="bg-card border border-primary/20 rounded-lg px-6 data-[state=open]:neon-border transition-all">
                    <AccordionTrigger className="font-display text-lg hover:no-underline hover:text-primary transition-colors text-left py-6">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                  {isAdmin && (
                    <div className="absolute right-0 top-0 h-full flex items-center pr-12 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="pointer-events-auto bg-card border border-primary/30 p-1 rounded-md shadow-lg">
                        <AdminFaqActions faq={faq} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </Accordion>
          ) : (
            <div className="text-center p-12 bg-card border border-dashed border-primary/20 rounded-lg">
              <p className="text-muted-foreground font-display tracking-widest uppercase">No FAQs available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-primary/20 bg-card py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-scanline opacity-50" />
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-primary w-5 h-5" />
            <span className="font-display font-bold text-xl tracking-wider text-muted-foreground">CONDO UNIVERSE</span>
          </div>
          <div className="flex items-center gap-6">
            {settings?.tiktok_url && (
              <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <SiTiktok className="w-5 h-5" />
                <span className="font-display tracking-wider">TikTok</span>
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
