import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Activity, ChevronRight } from "lucide-react";

const HealthRecordsCard = () => {
  const navigate = useNavigate();

  return (
    <Card 
      onClick={() => navigate("/health")}
      className="bg-gradient-to-br from-health-purple/10 to-health-blue/10 border-health-purple/20 shadow-md hover:shadow-lg transition-all duration-200 mb-6 cursor-pointer"
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-health-purple/20">
              <Activity className="w-6 h-6 text-health-purple" />
            </div>
            <h2 className="text-xl font-bold text-card-foreground">Health Records & Tracking</h2>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Track vitals, manage medications, store medical records, and log symptoms
        </p>
      </CardContent>
    </Card>
  );
};

export default HealthRecordsCard;
