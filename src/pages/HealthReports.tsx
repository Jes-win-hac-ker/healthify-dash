import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, TrendingUp, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface MetricData {
  date: string;
  value: number;
  systolic?: number;
  diastolic?: number;
}

export default function HealthReports() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("blood_pressure");
  const [timeRange, setTimeRange] = useState("30");
  const [chartData, setChartData] = useState<MetricData[]>([]);

  useEffect(() => {
    checkAndAddMockData();
  }, []);

  useEffect(() => {
    fetchMetricData();
  }, [selectedMetric, timeRange]);

  const checkAndAddMockData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user already has health data
      const { data: existingMetrics } = await supabase
        .from("health_metrics")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      // If no data exists, add mock data
      if (!existingMetrics || existingMetrics.length === 0) {
        await addMockHealthData(user.id);
      }
    } catch (error) {
      console.error("Error checking/adding mock data:", error);
    }
  };

  const addMockHealthData = async (userId: string) => {
    try {
      const mockMetrics = [];
      const mockMedications = [];
      const mockSymptoms = [];
      
      // Generate 30 days of mock health metrics
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Blood Pressure (varies around 120/80)
        mockMetrics.push({
          user_id: userId,
          metric_type: "blood_pressure",
          value: {
            systolic: 115 + Math.floor(Math.random() * 15),
            diastolic: 75 + Math.floor(Math.random() * 10),
          },
          unit: "mmHg",
          recorded_at: date.toISOString(),
        });

        // Heart Rate (varies around 70-80)
        mockMetrics.push({
          user_id: userId,
          metric_type: "heart_rate",
          value: { value: 70 + Math.floor(Math.random() * 15) },
          unit: "bpm",
          recorded_at: date.toISOString(),
        });

        // Blood Glucose (varies around 90-100)
        if (i % 2 === 0) {
          mockMetrics.push({
            user_id: userId,
            metric_type: "blood_glucose",
            value: { value: 85 + Math.floor(Math.random() * 20) },
            unit: "mg/dL",
            recorded_at: date.toISOString(),
          });
        }

        // Weight (varies around 70kg with slight trend)
        if (i % 3 === 0) {
          mockMetrics.push({
            user_id: userId,
            metric_type: "weight",
            value: { value: 70 - (i * 0.1) + Math.random() * 2 },
            unit: "kg",
            recorded_at: date.toISOString(),
          });
        }

        // Temperature (normal around 98.6°F)
        if (i % 5 === 0) {
          mockMetrics.push({
            user_id: userId,
            metric_type: "temperature",
            value: { value: 97.5 + Math.random() * 1.5 },
            unit: "°F",
            recorded_at: date.toISOString(),
          });
        }

        // Oxygen Saturation (normal around 98%)
        if (i % 2 === 0) {
          mockMetrics.push({
            user_id: userId,
            metric_type: "oxygen_saturation",
            value: { value: 96 + Math.floor(Math.random() * 4) },
            unit: "%",
            recorded_at: date.toISOString(),
          });
        }
      }

      // Insert mock health metrics
      const { error: metricsError } = await supabase
        .from("health_metrics")
        .insert(mockMetrics);

      if (metricsError) throw metricsError;

      // Add sample medications
      const { data: meds, error: medsError } = await supabase
        .from("medications")
        .insert([
          {
            user_id: userId,
            name: "Vitamin D",
            dosage: "1000 IU",
            frequency: "Once daily",
            start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            active: true,
            notes: "Take with breakfast",
          },
          {
            user_id: userId,
            name: "Omega-3",
            dosage: "1200 mg",
            frequency: "Twice daily",
            start_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            active: true,
            notes: "Take with meals",
          },
        ])
        .select();

      if (medsError) throw medsError;

      // Add medication logs
      if (meds && meds.length > 0) {
        const logs = [];
        for (let i = 7; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          meds.forEach(med => {
            logs.push({
              medication_id: med.id,
              logged_at: date.toISOString(),
              status: Math.random() > 0.1 ? "taken" : "missed",
              notes: Math.random() > 0.7 ? "Taken on time" : null,
            });
          });
        }

        await supabase.from("medication_logs").insert(logs);
      }

      // Add sample symptoms
      const symptoms = [
        { name: "Headache", severity: 3, notes: "Mild headache after work" },
        { name: "Fatigue", severity: 5, notes: "Feeling tired lately" },
        { name: "Good Energy", severity: 2, notes: "Feeling great today!" },
      ];

      for (let i = 0; i < symptoms.length; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 3));
        
        mockSymptoms.push({
          user_id: userId,
          symptom: symptoms[i].name,
          severity: symptoms[i].severity,
          notes: symptoms[i].notes,
          logged_at: date.toISOString(),
        });
      }

      await supabase.from("symptoms_journal").insert(mockSymptoms);

      toast({
        title: "Demo Data Added",
        description: "Sample health data has been added to demonstrate the charts and reports feature.",
      });

    } catch (error) {
      console.error("Error adding mock data:", error);
    }
  };

  const fetchMetricData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

      const { data, error } = await supabase
        .from("health_metrics")
        .select("*")
        .eq("user_id", user.id)
        .eq("metric_type", selectedMetric)
        .gte("recorded_at", daysAgo.toISOString())
        .order("recorded_at", { ascending: true });

      if (error) throw error;

      // Transform data for chart
      const transformed = (data || []).map((item: any) => {
        const date = new Date(item.recorded_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        if (selectedMetric === "blood_pressure") {
          return {
            date,
            systolic: item.value.systolic,
            diastolic: item.value.diastolic,
          };
        } else {
          return {
            date,
            value: item.value.value,
          };
        }
      });

      setChartData(transformed);
    } catch (error: any) {
      console.error("Error fetching metric data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all health data
      const { data: metrics } = await supabase
        .from("health_metrics")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false });

      const { data: medications } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", user.id);

      const { data: symptoms } = await supabase
        .from("symptoms_journal")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false });

      // Create CSV content
      let csv = "Health Data Export\n\n";
      
      // Metrics
      csv += "HEALTH METRICS\n";
      csv += "Date,Type,Value,Unit,Notes\n";
      metrics?.forEach((m: any) => {
        const date = new Date(m.recorded_at).toLocaleString();
        const value = m.metric_type === "blood_pressure" 
          ? `${m.value.systolic}/${m.value.diastolic}`
          : m.value.value;
        csv += `${date},${m.metric_type},${value},${m.unit},"${m.notes || ""}"\n`;
      });

      csv += "\nMEDICATIONS\n";
      csv += "Name,Dosage,Frequency,Start Date,End Date,Doctor,Active\n";
      medications?.forEach((m: any) => {
        csv += `${m.medication_name},${m.dosage},${m.frequency},${m.start_date},${m.end_date || ""},${m.prescribing_doctor || ""},${m.active}\n`;
      });

      csv += "\nSYMPTOMS\n";
      csv += "Date,Symptom,Severity,Description,Triggers\n";
      symptoms?.forEach((s: any) => {
        const date = new Date(s.recorded_at).toLocaleString();
        csv += `${date},${s.symptom_name},${s.severity},"${s.description || ""}","${s.triggers || ""}"\n`;
      });

      // Download CSV
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `health-data-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Health data exported to CSV",
      });
    } catch (error: any) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportToPDF = async () => {
    try {
      // Dynamic import of jsPDF to avoid build issues
      const { default: jsPDF } = await import("jspdf");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const doc = new jsPDF();
      let yPos = 20;

      // Header
      doc.setFontSize(20);
      doc.text("Health Summary Report", 20, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.text(`Patient: ${profile?.full_name || "N/A"}`, 20, yPos);
      yPos += 7;
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPos);
      yPos += 15;

      // Recent Metrics
      doc.setFontSize(16);
      doc.text("Recent Health Metrics", 20, yPos);
      yPos += 10;

      const { data: recentMetrics } = await supabase
        .from("health_metrics")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false })
        .limit(10);

      doc.setFontSize(10);
      recentMetrics?.forEach((m: any) => {
        const date = new Date(m.recorded_at).toLocaleDateString();
        const value = m.metric_type === "blood_pressure"
          ? `${m.value.systolic}/${m.value.diastolic} ${m.unit}`
          : `${m.value.value} ${m.unit}`;
        
        doc.text(`${date} - ${m.metric_type}: ${value}`, 20, yPos);
        yPos += 6;
        
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });

      // Active Medications
      yPos += 10;
      doc.setFontSize(16);
      doc.text("Active Medications", 20, yPos);
      yPos += 10;

      const { data: activeMeds } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true);

      doc.setFontSize(10);
      activeMeds?.forEach((m: any) => {
        doc.text(`${m.medication_name} - ${m.dosage} (${m.frequency})`, 20, yPos);
        yPos += 6;
        
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });

      // Save PDF
      doc.save(`health-report-${new Date().toISOString().split("T")[0]}.pdf`);

      toast({
        title: "PDF Generated",
        description: "Health report downloaded successfully",
      });
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const metricLabels: Record<string, string> = {
    blood_pressure: "Blood Pressure (mmHg)",
    heart_rate: "Heart Rate (bpm)",
    glucose: "Blood Glucose (mg/dL)",
    weight: "Weight (kg)",
    temperature: "Temperature (°F)",
    oxygen_saturation: "Oxygen Saturation (%)",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-health-purple/5 to-white p-6 pb-24">
      <div className="max-w-6xl mx-auto">
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Health Charts & Reports</h1>
            <p className="text-muted-foreground">Visualize trends and export your health data</p>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={exportToPDF} className="bg-health-purple hover:bg-health-purple/90">
              <FileText className="w-4 h-4 mr-2" />
              Generate PDF
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-health-purple" />
                <span>Metric Trends</span>
              </CardTitle>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                    <SelectItem value="heart_rate">Heart Rate</SelectItem>
                    <SelectItem value="glucose">Blood Glucose</SelectItem>
                    <SelectItem value="weight">Weight</SelectItem>
                    <SelectItem value="temperature">Temperature</SelectItem>
                    <SelectItem value="oxygen_saturation">Oxygen Saturation</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 3 months</SelectItem>
                    <SelectItem value="180">Last 6 months</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[400px] flex items-center justify-center">
                Loading chart data...
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-[400px] flex flex-col items-center justify-center text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                <p className="text-muted-foreground">
                  Start tracking {metricLabels[selectedMetric].toLowerCase()} to see trends
                </p>
                <Button 
                  onClick={() => navigate("/health/metrics")}
                  className="mt-4 bg-health-purple hover:bg-health-purple/90"
                >
                  Add Metric
                </Button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                {selectedMetric === "blood_pressure" ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="systolic" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name="Systolic"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="diastolic" 
                      stroke="#ec4899" 
                      strokeWidth={2}
                      name="Diastolic"
                    />
                  </LineChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name={metricLabels[selectedMetric]}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Download className="w-5 h-5 text-health-blue mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">CSV Export</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Download all your health data in CSV format for spreadsheet analysis
                    </p>
                    <Button onClick={exportToCSV} variant="outline" size="sm">
                      Download CSV
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-health-purple mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">PDF Report</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Generate a formatted health summary report for doctor visits
                    </p>
                    <Button 
                      onClick={exportToPDF} 
                      size="sm"
                      className="bg-health-purple hover:bg-health-purple/90"
                    >
                      Generate PDF
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Total Metrics Logged</span>
                  <span className="text-lg font-bold text-health-purple">
                    {chartData.length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Time Range</span>
                  <span className="text-lg font-bold text-health-blue">
                    {timeRange} days
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Current Metric</span>
                  <span className="text-sm font-bold text-health-green">
                    {selectedMetric.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
