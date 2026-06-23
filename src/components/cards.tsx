import { useAdmin } from "@/hooks/use-admin";
import { AdminGameActions, AdminServerActions } from "./admin/admin-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import type { Game, PrivateServer } from "@/lib/api-client";

export function GameCard({ game }: { game: Game }) {
  const { isAdmin } = useAdmin();
  return (
    <Card className="bg-card border-primary/20 overflow-hidden group hover:neon-border transition-all duration-300">
      {game.image_url ? (
        <div className="w-full h-48 overflow-hidden relative">
          <img src={game.image_url} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70 group-hover:opacity-100" />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        </div>
      ) : (
        <div className="w-full h-48 bg-secondary/50 flex items-center justify-center border-b border-primary/20">
          <span className="font-display text-muted-foreground/50 text-2xl uppercase tracking-widest">{game.category}</span>
        </div>
      )}
      <CardContent className="p-6 relative">
        {game.is_featured && (
          <Badge className="absolute -top-3 right-6 bg-primary text-primary-foreground neon-glow uppercase font-display tracking-widest border-none">Featured</Badge>
        )}
        <div className="mb-2">
          <Badge variant="outline" className="text-primary border-primary/30 uppercase tracking-widest text-xs">{game.category}</Badge>
        </div>
        <h3 className="text-xl font-display font-bold text-foreground mb-2 neon-text">{game.name}</h3>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-6">{game.description}</p>
        <a href={game.link} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/50 hover:border-primary font-display py-2 px-4 rounded transition-all hover:neon-glow">
          PLAY NOW <ExternalLink className="w-4 h-4 ml-2" />
        </a>
        {isAdmin && <AdminGameActions game={game} />}
      </CardContent>
    </Card>
  );
}

export function ServerCard({ server }: { server: PrivateServer }) {
  const { isAdmin } = useAdmin();
  return (
    <Card className="bg-card border-primary/20 overflow-hidden group hover:neon-border transition-all duration-300 relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Badge variant="outline" className="mb-2 text-primary border-primary/30 uppercase tracking-widest text-xs">{server.game}</Badge>
            <h3 className="text-xl font-display font-bold text-foreground neon-text">{server.name}</h3>
          </div>
          <div className={`w-3 h-3 rounded-full ${server.is_active ? "bg-primary neon-glow" : "bg-muted"}`} />
        </div>
        <p className="text-muted-foreground text-sm mb-6 min-h-[40px]">{server.description}</p>
        <a href={server.link} target="_blank" rel="noopener noreferrer"
          className={`inline-flex items-center justify-center w-full font-display py-2 px-4 rounded transition-all ${server.is_active ? "bg-primary hover:bg-primary/80 text-primary-foreground neon-glow" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
          onClick={(e) => !server.is_active && e.preventDefault()}>
          {server.is_active ? (<>JOIN SERVER <ExternalLink className="w-4 h-4 ml-2" /></>) : "OFFLINE"}
        </a>
        {isAdmin && <AdminServerActions server={server} />}
      </CardContent>
    </Card>
  );
}
