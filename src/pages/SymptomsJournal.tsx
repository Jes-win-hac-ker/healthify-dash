import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Symptom {
  id: string;
  symptom_name: string;
  severity: number;
  description?: string;
  triggers?: string;
  recorded_at: string;
}

export default function SymptomsJournal() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [symptomName, setSymptomName] = useState("");
  const [severity, setSeverity] = useState([5]);
  const [description, setDescription] = useState("");
  const [triggers, setTriggers] = useState("");

  useEffect(() => {
    fetchSymptoms();
  }, []);

  const fetchSymptoms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("symptoms_journal")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setSymptoms(data || []);
    } catch (error: any) {
      console.error("Error fetching symptoms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptomName) {
      toast({
        title: "Invalid Input",
        description: "Please enter a symptom name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to log symptoms",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("symptoms_journal")
        .insert({
          user_id: user.id,
          symptom_name: symptomName,
          severity: severity[0],
          description: description || null,
          triggers: triggers || null,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Symptom logged successfully",
      });

      // Reset form
      setSymptomName("");
      setSeverity([5]);
      setDescription("");
      setTriggers("");
      setIsDialogOpen(false);
      
      // Refresh symptoms
      fetchSymptoms();
    } catch (error: any) {
      console.error("Error saving symptom:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save symptom",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return "text-green-600";
    if (severity <= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getSeverityBg = (severity: number) => {
    if (severity <= 3) return "bg-green-100";
    if (severity <= 6) return "bg-yellow-100";
    return "bg-red-100";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-health-purple/5 to-white p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/health")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Health Records
        </Button>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Symptoms Journal</h1>
            <p className="text-muted-foreground">Track symptoms and identify patterns</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-health-green hover:bg-health-green/90">
                <Plus className="w-4 h-4 mr-2" />
                Log Symptom
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Log a Symptom</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="symptomName">Symptom Name *</Label>
                  <Input
                    id="symptomName"
                    value={symptomName}
                    onChange={(e) => setSymptomName(e.target.value)}
                    placeholder="e.g., Headache, Fatigue, etc."
                  />
                </div>

                <div>
                  <Label>Severity (1-10)</Label>
                  <div className="pt-4 pb-2">
                    <Slider
                      value={severity}
                      onValueChange={setSeverity}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>Mild (1)</span>
                      <span className={`font-bold ${getSeverityColor(severity[0])}`}>
                        {severity[0]}
                      </span>
                      <span>Severe (10)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the symptom..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="triggers">Possible Triggers (Optional)</Label>
                  <Input
                    id="triggers"
                    value={triggers}
                    onChange={(e) => setTriggers(e.target.value)}
                    placeholder="e.g., Stress, certain foods, etc."
                  />
                </div>

                <Button type="submit" className="w-full bg-health-green hover:bg-health-green/90">
                  Save Symptom
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading symptoms...</div>
        ) : symptoms.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Stethoscope className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Symptoms Logged</h3>
              <p className="text-muted-foreground mb-4">Start tracking your symptoms</p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-health-green hover:bg-health-green/90">
                <Plus className="w-4 h-4 mr-2" />
                Log Your First Symptom
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {symptoms.map((symptom) => (
              <Card key={symptom.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="p-2 rounded-lg bg-health-green/10">
                        <Stethoscope className="w-5 h-5 text-health-green" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold text-lg text-foreground">
                            {symptom.symptom_name}
                          </h3>
                          <div className={`px-3 py-1 rounded-full ${getSeverityBg(symptom.severity)}`}>
                            <span className={`text-sm font-semibold ${getSeverityColor(symptom.severity)}`}>
                              Severity: {symptom.severity}/10
                            </span>
                          </div>
                        </div>
                        {symptom.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {symptom.description}
                          </p>
                        )}
                        {symptom.triggers && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Triggers:</span> {symptom.triggers}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(symptom.recorded_at)}
                        </p>
                      </div>
                    </div>
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
