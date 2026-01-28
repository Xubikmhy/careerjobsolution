import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import Jobs from "./pages/Jobs";
import Properties from "./pages/Properties";
import Tenants from "./pages/Tenants";
import Placements from "./pages/Placements";
import Accounting from "./pages/Accounting";
import Settings from "./pages/Settings";
import CVGenerate from "./pages/CVGenerate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/placements" element={<Placements />} />
          <Route path="/accounting" element={<Accounting />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/cv-generate" element={<CVGenerate />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
