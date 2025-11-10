import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

// Match existing `public.vaccinations` table types in Supabase
interface VaccineForm {
  vaccine_name: string;
  age_group: string; // e.g., Infant/Child/Adult/Senior
  due_date: string; // ISO date string
  description: string;
  completed: boolean;
}

const initialForm: VaccineForm = {
  vaccine_name: "",
  age_group: "Adult",
  due_date: "",
  description: "",
  completed: false,
};

const REQUIRED_FIELDS: (keyof VaccineForm)[] = ["vaccine_name", "age_group", "due_date"];

export default function VaccineRegistration() {
  const [form, setForm] = useState<VaccineForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const updateField = (field: keyof VaccineForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): string[] => {
    const errors: string[] = [];
    for (const field of REQUIRED_FIELDS) {
      const value = form[field];
      if (typeof value === "string" && !value.trim()) {
        errors.push(`${field.replace(/_/g, " ")} is required`);
      }
    }
    // date not in the past by too much? Keep simple: allow past/future dates
    if (form.due_date) {
      const today = new Date();
      const inputDate = new Date(form.due_date);
      const old = new Date(today);
      old.setFullYear(today.getFullYear() - 100);
      if (inputDate < old) errors.push("Date is too far in the past");
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length) {
      toast({
        variant: "destructive",
        title: "Validation errors",
        description: errors.join("; "),
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("vaccinations").insert({
        vaccine_name: form.vaccine_name.trim(),
        age_group: form.age_group,
        description: form.description.trim() || null,
        due_date: form.due_date || null,
        completed: form.completed,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast({ title: "Saved", description: "Vaccination record added." });
      setForm(initialForm);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Register Vaccination</CardTitle>
          <CardDescription>Log a new vaccine dose you received.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vaccine Name *</label>
              <Input
                value={form.vaccine_name}
                onChange={(e) => updateField("vaccine_name", e.target.value)}
                placeholder="e.g. Influenza, COVID-19"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Age Group *</label>
              <Input
                value={form.age_group}
                onChange={(e) => updateField("age_group", e.target.value)}
                placeholder="e.g. Infant / Child / Adult / Senior"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date *</label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => updateField("due_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description / Notes</label>
              <Textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Any side effects or details"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="completed" checked={form.completed} onCheckedChange={(v) => updateField("completed", v === true)} />
              <Label htmlFor="completed">Completed</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Saving..." : "Save Record"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
