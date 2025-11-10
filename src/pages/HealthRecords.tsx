import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, FileText, Pill, Activity, Stethoscope, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export default function HealthRecords() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("metrics");

  const menuItems = [
    {
      id: "metrics",
      title: "Health Metrics",
      description: "Track your vitals and measurements",
      icon: Activity,
      route: "/health/metrics",
      color: "text-health-purple",
    },
    {
      id: "medications",
      title: "Medications",
      description: "Manage medications and set reminders",
      icon: Pill,
      route: "/health/medications",
      color: "text-health-pink",
    },
    {
      id: "records",
      title: "Medical Records",
      description: "Store and view medical documents",
      icon: FileText,
      route: "/health/records",
      color: "text-health-blue",
    },
    {
      id: "symptoms",
      title: "Symptoms Journal",
      description: "Track symptoms and patterns",
      icon: Stethoscope,
      route: "/health/symptoms",
      color: "text-health-green",
    },
    {
      id: "reports",
      title: "Charts & Reports",
      description: "Visualize trends and export data",
      icon: TrendingUp,
      route: "/health/reports",
      color: "text-health-yellow",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-health-purple/5 to-white p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Health Records & Tracking</h1>
          <p className="text-muted-foreground">Manage your health data in one place</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2"
                onClick={() => navigate(item.route)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg bg-gray-100 ${item.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
