import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, MapPin, ChevronRight, Loader2 } from "lucide-react";

interface HealthEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  location: string;
  trainer_name: string | null;
  color_theme: string | null;
}

export default function HealthEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("health_events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getColorClass = (colorTheme: string | null) => {
    switch (colorTheme) {
      case "red":
        return "bg-gradient-to-br from-red-50 to-red-100 border-red-200";
      case "blue":
        return "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200";
      case "green":
        return "bg-gradient-to-br from-green-50 to-green-100 border-green-200";
      case "purple":
        return "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200";
      default:
        return "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200";
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
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Health Events & Campaigns</h1>
          <p className="text-muted-foreground">Upcoming health events, blood drives, and community health campaigns</p>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Events Available</h3>
              <p className="text-muted-foreground">Check back later for upcoming health events and campaigns.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Card 
                key={event.id}
                className={`${getColorClass(event.color_theme)} border-2 hover:shadow-lg transition-all duration-200 cursor-pointer`}
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {event.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {event.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-foreground">
                          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                          <span>{formatDate(event.event_date)}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-foreground">
                          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                          <span>{event.location}</span>
                        </div>

                        {event.trainer_name && (
                          <div className="flex items-center text-sm text-muted-foreground mt-2">
                            <span className="font-medium">Organizer: </span>
                            <span className="ml-1">{event.trainer_name}</span>
                          </div>
                        )}
                      </div>

                      {event.event_type && (
                        <div className="mt-3">
                          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/50 text-foreground">
                            {event.event_type}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <ChevronRight className="w-6 h-6 text-muted-foreground ml-4 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
