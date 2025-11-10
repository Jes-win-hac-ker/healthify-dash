import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, TrendingUp, Activity, Heart, Droplet, Weight, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface HealthMetric {
  id: string;
  metric_type: string;
  value: any;
  unit: string;
  notes?: string;
  recorded_at: string;
}

export default function HealthMetrics() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [metricType, setMetricType] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("health_metrics")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setMetrics(data || []);
    } catch (error: any) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to track health metrics",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      let metricValue: any;
      let unit: string;

      if (metricType === "blood_pressure") {
        if (!systolic || !diastolic) {
          toast({
            title: "Invalid Input",
            description: "Please enter both systolic and diastolic values",
            variant: "destructive",
          });
          return;
        }
        metricValue = { systolic: parseInt(systolic), diastolic: parseInt(diastolic) };
        unit = "mmHg";
      } else {
        if (!value) {
          toast({
            title: "Invalid Input",
            description: "Please enter a value",
            variant: "destructive",
          });
          return;
        }
        metricValue = { value: parseFloat(value) };
        
        switch (metricType) {
          case "heart_rate":
            unit = "bpm";
            break;
          case "glucose":
            unit = "mg/dL";
            break;
          case "weight":
            unit = "kg";
            break;
          case "temperature":
            unit = "°F";
            break;
          case "oxygen_saturation":
            unit = "%";
            break;
          default:
            unit = "";
        }
      }

      const { error } = await supabase
        .from("health_metrics")
        .insert({
          user_id: user.id,
          metric_type: metricType,
          value: metricValue,
          unit: unit,
          notes: notes || null,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Health metric recorded successfully",
      });

      // Reset form
      setMetricType("");
      setSystolic("");
      setDiastolic("");
      setValue("");
      setNotes("");
      setIsDialogOpen(false);
      
      // Refresh metrics
      fetchMetrics();
    } catch (error: any) {
      console.error("Error saving metric:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save metric",
        variant: "destructive",
      });
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case "blood_pressure":
      case "heart_rate":
        return Heart;
      case "glucose":
        return Droplet;
      case "weight":
        return Weight;
      case "temperature":
        return Thermometer;
      case "oxygen_saturation":
        return Activity;
      default:
        return Activity;
    }
  };

  const formatMetricValue = (metric: HealthMetric) => {
    if (metric.metric_type === "blood_pressure") {
      return `${metric.value.systolic}/${metric.value.diastolic} ${metric.unit}`;
    }
    return `${metric.value.value} ${metric.unit}`;
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

  const metricTypeLabels: Record<string, string> = {
    blood_pressure: "Blood Pressure",
    heart_rate: "Heart Rate",
    glucose: "Blood Glucose",
    weight: "Weight",
    temperature: "Body Temperature",
    oxygen_saturation: "Oxygen Saturation",
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Health Metrics</h1>
            <p className="text-muted-foreground">Track your vital signs and measurements</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-health-purple hover:bg-health-purple/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Metric
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record Health Metric</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="metricType">Metric Type</Label>
                  <Select value={metricType} onValueChange={setMetricType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select metric type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                      <SelectItem value="heart_rate">Heart Rate</SelectItem>
                      <SelectItem value="glucose">Blood Glucose</SelectItem>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="temperature">Body Temperature</SelectItem>
                      <SelectItem value="oxygen_saturation">Oxygen Saturation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {metricType === "blood_pressure" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="systolic">Systolic</Label>
                      <Input
                        id="systolic"
                        type="number"
                        value={systolic}
                        onChange={(e) => setSystolic(e.target.value)}
                        placeholder="120"
                      />
                    </div>
                    <div>
                      <Label htmlFor="diastolic">Diastolic</Label>
                      <Input
                        id="diastolic"
                        type="number"
                        value={diastolic}
                        onChange={(e) => setDiastolic(e.target.value)}
                        placeholder="80"
                      />
                    </div>
                  </div>
                ) : metricType ? (
                  <div>
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.1"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Enter value"
                    />
                  </div>
                ) : null}

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full bg-health-purple hover:bg-health-purple/90">
                  Save Metric
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading metrics...</div>
        ) : metrics.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Metrics Yet</h3>
              <p className="text-muted-foreground mb-4">Start tracking your health metrics</p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-health-purple hover:bg-health-purple/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Metric
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {metrics.map((metric) => {
              const Icon = getMetricIcon(metric.metric_type);
              return (
                <Card key={metric.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="p-2 rounded-lg bg-health-purple/10">
                          <Icon className="w-5 h-5 text-health-purple" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">
                            {metricTypeLabels[metric.metric_type]}
                          </h3>
                          <p className="text-2xl font-bold text-health-purple mt-1">
                            {formatMetricValue(metric)}
                          </p>
                          {metric.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{metric.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {formatDate(metric.recorded_at)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
