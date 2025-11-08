import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/BottomNavigation";
import ProfileHeader from "@/components/ProfileHeader";
import DailyCard from "@/components/DailyCard";
import VaccinationAgeCard from "@/components/VaccinationAgeCard";
import EventCard from "@/components/EventCard";
import AICard from "@/components/AICard";
import AIChat from "@/components/AIChat";
import { Loader2 } from "lucide-react";

interface Profile {
  full_name: string;
  age?: number;
}

interface HealthEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  location: string;
  trainer_name: string;
  color_theme: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch health events
      const { data: eventsData, error: eventsError } = await supabase
        .from("health_events")
        .select("*")
        .order("event_date", { ascending: true });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-screen-md mx-auto p-4 md:p-6">
        {profile && (
          <ProfileHeader fullName={profile.full_name} age={profile.age} />
        )}
        
        <DailyCard />
        <VaccinationAgeCard />
        
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Your Plan</h2>
          <div className="space-y-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                title={event.title}
                description={event.description}
                eventDate={event.event_date}
                location={event.location}
                trainerName={event.trainer_name}
                colorTheme={event.color_theme as any}
              />
            ))}
            <AICard onOpenChat={() => setIsChatOpen(true)} />
          </div>
        </div>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default Index;
