import { useState } from "react";
import { useAdminLogin } from "@/lib/api-client";
import { useAdmin } from "@/hooks/use-admin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

export function AdminLoginModal() {
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const adminLogin = useAdminLogin();
  const { login } = useAdmin();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adminLogin.mutate(
      { data: { password } },
      {
        onSuccess: (data) => {
          if (data.success) {
            login(data.token);
            setOpen(false);
            setPassword("");
            toast({ title: "Access Granted", description: "Welcome to the mainframe." });
          } else {
            toast({ title: "Access Denied", description: "Invalid password.", variant: "destructive" });
          }
        },
        onError: () => {
          toast({ title: "Access Denied", description: "Invalid password.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary neon-text">
          <Lock className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-primary/30 bg-card shadow-[0_0_20px_rgba(227,18,33,0.15)]">
        <DialogHeader>
          <DialogTitle className="font-display text-primary text-2xl neon-text">ADMIN ACCESS</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <Input
            type="password"
            placeholder="Enter password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-background border-primary/30 focus-visible:ring-primary focus-visible:border-primary font-mono text-lg"
          />
          <Button type="submit" className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-display tracking-wider neon-glow" disabled={adminLogin.isPending}>
            {adminLogin.isPending ? "AUTHENTICATING..." : "INITIALIZE"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
