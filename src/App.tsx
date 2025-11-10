import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import VaccineRegistration from "./pages/VaccineRegistration";
import VaccinationSchedule from "./pages/VaccinationSchedule";
import HealthEvents from "./pages/HealthEvents";
import EventDetail from "./pages/EventDetail";
import HealthRecords from "./pages/HealthRecords";
import HealthMetrics from "./pages/HealthMetrics";
import Medications from "./pages/Medications";
import MedicalRecords from "./pages/MedicalRecords";
import SymptomsJournal from "./pages/SymptomsJournal";
import HealthReports from "./pages/HealthReports";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/vaccines/register" element={<VaccineRegistration />} />
          <Route path="/vaccines/schedule" element={<VaccinationSchedule />} />
          <Route path="/events" element={<HealthEvents />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/health" element={<HealthRecords />} />
          <Route path="/health/metrics" element={<HealthMetrics />} />
          <Route path="/health/medications" element={<Medications />} />
          <Route path="/health/records" element={<MedicalRecords />} />
          <Route path="/health/symptoms" element={<SymptomsJournal />} />
          <Route path="/health/reports" element={<HealthReports />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
