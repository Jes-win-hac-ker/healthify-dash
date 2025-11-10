import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, User, Users, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HealthEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  trainer_name: string;
  event_type: string;
  eligibility_criteria?: string[];
  color_theme: "yellow" | "blue" | "green" | "pink";
}

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<HealthEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchEventDetail();
  }, [id]);

  const fetchEventDetail = async () => {
    try {
      const { data, error } = await supabase
        .from("health_events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setEvent(data as HealthEvent);
    } catch (error) {
      console.error("Error fetching event:", error);
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (registrationType: "participant" | "volunteer") => {
    setRegistering(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to register for this event",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("user_health_events")
        .insert({
          user_id: user.id,
          event_id: id,
          registration_type: registrationType,
          registration_status: "registered",
        });

      if (error) throw error;

      toast({
        title: "Registration Successful!",
        description: `You've been registered as a ${registrationType}`,
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getColorClass = (theme: string) => {
    const colors = {
      yellow: "bg-health-yellow/10 border-health-yellow/30",
      blue: "bg-health-blue/10 border-health-blue/30",
      green: "bg-health-green/10 border-health-green/30",
      pink: "bg-health-pink/10 border-health-pink/30",
    };
    return colors[theme as keyof typeof colors] || colors.blue;
  };

  const getDefaultEligibility = (eventType: string) => {
    if (eventType === "donation") {
      return [
        "Age between 18-65 years",
        "Weight at least 50 kg (110 lbs)",
        "Good general health",
        "No chronic illnesses",
        "Not pregnant or breastfeeding",
        "No recent tattoos or piercings (within 6 months)",
        "No history of hepatitis or HIV",
        "At least 3 months since last blood donation",
      ];
    } else if (eventType === "yoga") {
      return [
        "All ages welcome",
        "No prior yoga experience required",
        "Wear comfortable clothing",
        "Bring your own yoga mat if possible",
      ];
    } else if (eventType === "medical_camp") {
      return [
        "Open to all community members",
        "Bring any existing medical records",
        "Fasting may be required for certain tests",
        "Valid ID required",
      ];
    }
    return ["Open to all interested participants"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-health-purple/5 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/events")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
          <div className="text-center py-12">Loading event details...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-health-purple/5 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/events")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
          <div className="text-center py-12">Event not found</div>
        </div>
      </div>
    );
  }

  const eligibility = event.eligibility_criteria || getDefaultEligibility(event.event_type);

  return (
    <div className="min-h-screen bg-gradient-to-b from-health-purple/5 to-white p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/events")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        <Card className={`${getColorClass(event.color_theme)} border-2 mb-6`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{event.title}</CardTitle>
                <Badge className="mb-4">{event.event_type}</Badge>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">{event.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-health-purple" />
              <span className="text-base">{formatDate(event.event_date)}</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-health-purple" />
              <span className="text-base">{event.location}</span>
            </div>
            {event.trainer_name && (
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-health-purple" />
                <span className="text-base">Organized by {event.trainer_name}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-health-green" />
              <span>Eligibility Criteria</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {eligibility.map((criteria, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-health-purple mt-1">•</span>
                  <span>{criteria}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-health-purple" />
                  <h3 className="font-semibold text-lg">
                    {event.event_type === "donation" ? "Donate Blood" : "Participate"}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {event.event_type === "donation"
                    ? "Register to donate blood and help save lives"
                    : "Register as a participant for this event"}
                </p>
                <Button
                  onClick={() => handleRegister("participant")}
                  disabled={registering}
                  className="w-full bg-health-purple hover:bg-health-purple/90"
                >
                  {registering ? "Registering..." : "Register to Participate"}
                </Button>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-5 h-5 text-health-pink" />
                  <h3 className="font-semibold text-lg">Volunteer</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Help organize and support this event as a volunteer
                </p>
                <Button
                  onClick={() => handleRegister("volunteer")}
                  disabled={registering}
                  variant="outline"
                  className="w-full"
                >
                  {registering ? "Registering..." : "Register as Volunteer"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventDetail;
