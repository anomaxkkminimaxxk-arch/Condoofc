import { GameForm } from "./game-form";
import { ServerForm } from "./server-form";
import { FaqForm } from "./faq-form";
import { useDeleteGame, useDeleteServer, useDeleteFaq } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Game, PrivateServer, Faq } from "@/lib/api-client";

export function AdminGameActions({ game }: { game: Game }) {
  const deleteGame = useDeleteGame();
  const { toast } = useToast();
  const handleDelete = () => {
    if (window.confirm("Delete this game?")) {
      deleteGame.mutate({ id: game.id }, { onSuccess: () => toast({ title: "Game deleted" }) });
    }
  };
  return (
    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-primary/20">
      <GameForm game={game} />
      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20" onClick={handleDelete} disabled={deleteGame.isPending}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function AdminServerActions({ server }: { server: PrivateServer }) {
  const deleteServer = useDeleteServer();
  const { toast } = useToast();
  const handleDelete = () => {
    if (window.confirm("Delete this server?")) {
      deleteServer.mutate({ id: server.id }, { onSuccess: () => toast({ title: "Server deleted" }) });
    }
  };
  return (
    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-primary/20">
      <ServerForm server={server} />
      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20" onClick={handleDelete} disabled={deleteServer.isPending}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function AdminFaqActions({ faq }: { faq: Faq }) {
  const deleteFaq = useDeleteFaq();
  const { toast } = useToast();
  const handleDelete = () => {
    if (window.confirm("Delete this FAQ?")) {
      deleteFaq.mutate({ id: faq.id }, { onSuccess: () => toast({ title: "FAQ deleted" }) });
    }
  };
  return (
    <div className="flex items-center gap-2">
      <FaqForm faq={faq} />
      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20" onClick={handleDelete} disabled={deleteFaq.isPending}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
