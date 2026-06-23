import { useState, useEffect } from "react";
  import { Switch, Route, Router as WouterRouter } from "wouter";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
  import { Toaster } from "@/components/ui/toaster";
  import { TooltipProvider } from "@/components/ui/tooltip";
  import NotFound from "@/pages/not-found";
  import Home from "@/pages/home";
  import { VerificationGate } from "@/components/verification-gate";

  const queryClient = new QueryClient();

  function Router() {
    return (
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  function App() {
    const [verified, setVerified] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
      const already = sessionStorage.getItem("cu_verified");
      if (already === "1") setVerified(true);
      setChecking(false);
    }, []);

    if (checking) return null;

    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {!verified && <VerificationGate onVerified={() => setVerified(true)} />}
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  export default App;
  