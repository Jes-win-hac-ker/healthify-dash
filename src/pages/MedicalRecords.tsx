import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, FileText, Upload, Download, Trash2 } from "lucide-react";
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

interface MedicalRecord {
  id: string;
  title: string;
  record_type: string;
  description?: string;
  file_url?: string;
  file_name?: string;
  record_date?: string;
  created_at: string;
}

export default function MedicalRecords() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [recordType, setRecordType] = useState("");
  const [description, setDescription] = useState("");
  const [recordDate, setRecordDate] = useState("");

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !recordType) {
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
          description: "Please sign in to add medical records",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("medical_records")
        .insert({
          user_id: user.id,
          title,
          record_type: recordType,
          description: description || null,
          record_date: recordDate || null,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Medical record added successfully",
      });

      // Reset form
      setTitle("");
      setRecordType("");
      setDescription("");
      setRecordDate("");
      setIsDialogOpen(false);
      
      // Refresh records
      fetchRecords();
    } catch (error: any) {
      console.error("Error saving record:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save record",
        variant: "destructive",
      });
    }
  };

  const getRecordTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      prescription: "bg-purple-100 text-purple-700",
      lab_result: "bg-blue-100 text-blue-700",
      imaging: "bg-green-100 text-green-700",
      medical_report: "bg-orange-100 text-orange-700",
      other: "bg-gray-100 text-gray-700",
    };
    return colors[type] || colors.other;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const recordTypeLabels: Record<string, string> = {
    prescription: "Prescription",
    lab_result: "Lab Result",
    imaging: "Imaging",
    medical_report: "Medical Report",
    other: "Other",
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Medical Records</h1>
            <p className="text-muted-foreground">Store and manage your medical documents</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-health-blue hover:bg-health-blue/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Medical Record</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Blood Test Results"
                  />
                </div>

                <div>
                  <Label htmlFor="recordType">Record Type *</Label>
                  <Select value={recordType} onValueChange={setRecordType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="lab_result">Lab Result</SelectItem>
                      <SelectItem value="imaging">Imaging (X-ray, MRI, etc.)</SelectItem>
                      <SelectItem value="medical_report">Medical Report</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="recordDate">Date (Optional)</Label>
                  <Input
                    id="recordDate"
                    type="date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Any additional details..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full bg-health-blue hover:bg-health-blue/90">
                  Add Record
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading records...</div>
        ) : records.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Records Yet</h3>
              <p className="text-muted-foreground mb-4">Start storing your medical documents</p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-health-blue hover:bg-health-blue/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Record
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="p-2 rounded-lg bg-health-blue/10">
                        <FileText className="w-5 h-5 text-health-blue" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold text-lg text-foreground">
                            {record.title}
                          </h3>
                          <Badge className={getRecordTypeBadge(record.record_type)}>
                            {recordTypeLabels[record.record_type]}
                          </Badge>
                        </div>
                        {record.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {record.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {record.record_date && (
                            <span>Date: {formatDate(record.record_date)}</span>
                          )}
                          <span>Added: {formatDate(record.created_at)}</span>
                        </div>
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
