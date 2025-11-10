import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pill, Clock, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Medication {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  prescribing_doctor?: string;
  notes?: string;
  active: boolean;
}

export default function Medications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [doctor, setDoctor] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMedications(data || []);
    } catch (error: any) {
      console.error("Error fetching medications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!medicationName || !dosage || !frequency || !startDate) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to add medications",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("medications")
        .insert({
          user_id: user.id,
          medication_name: medicationName,
          dosage,
          frequency,
          start_date: startDate,
          end_date: endDate || null,
          prescribing_doctor: doctor || null,
          notes: notes || null,
          active: true,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Medication added successfully",
      });

      // Reset form
      setMedicationName("");
      setDosage("");
      setFrequency("");
      setStartDate("");
      setEndDate("");
      setDoctor("");
      setNotes("");
      setIsDialogOpen(false);
      
      // Refresh medications
      fetchMedications();
    } catch (error: any) {
      console.error("Error saving medication:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save medication",
        variant: "destructive",
      });
    }
  };

  const handleLogDose = async (medicationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("medication_logs")
        .insert({
          medication_id: medicationId,
          user_id: user.id,
          status: "taken",
        });

      if (error) throw error;

      toast({
        title: "Logged!",
        description: "Medication dose recorded",
      });
    } catch (error: any) {
      console.error("Error logging dose:", error);
      toast({
        title: "Error",
        description: "Failed to log dose",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Medications</h1>
            <p className="text-muted-foreground">Manage your medications and track doses</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-health-pink hover:bg-health-pink/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Medication</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="medicationName">Medication Name *</Label>
                  <Input
                    id="medicationName"
                    value={medicationName}
                    onChange={(e) => setMedicationName(e.target.value)}
                    placeholder="e.g., Aspirin"
                  />
                </div>

                <div>
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g., 100mg"
                  />
                </div>

                <div>
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Once daily">Once daily</SelectItem>
                      <SelectItem value="Twice daily">Twice daily</SelectItem>
                      <SelectItem value="Three times daily">Three times daily</SelectItem>
                      <SelectItem value="Four times daily">Four times daily</SelectItem>
                      <SelectItem value="Every other day">Every other day</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="As needed">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="doctor">Prescribing Doctor (Optional)</Label>
                  <Input
                    id="doctor"
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                    placeholder="Dr. Smith"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional information..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full bg-health-pink hover:bg-health-pink/90">
                  Add Medication
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading medications...</div>
        ) : medications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Pill className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Medications Yet</h3>
              <p className="text-muted-foreground mb-4">Start tracking your medications</p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-health-pink hover:bg-health-pink/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Medication
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {medications.map((medication) => (
              <Card key={medication.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="p-2 rounded-lg bg-health-pink/10">
                        <Pill className="w-5 h-5 text-health-pink" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold text-lg text-foreground">
                            {medication.medication_name}
                          </h3>
                          {medication.active ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {medication.dosage} • {medication.frequency}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="w-3 h-3" />
                            <span>Started: {formatDate(medication.start_date)}</span>
                          </div>
                          {medication.end_date && (
                            <div className="flex items-center space-x-1">
                              <span>Ends: {formatDate(medication.end_date)}</span>
                            </div>
                          )}
                        </div>
                        {medication.prescribing_doctor && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Dr. {medication.prescribing_doctor}
                          </p>
                        )}
                        {medication.notes && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            {medication.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    {medication.active && (
                      <Button
                        size="sm"
                        onClick={() => handleLogDose(medication.id)}
                        className="bg-health-purple hover:bg-health-purple/90"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Log Dose
                      </Button>
                    )}
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
