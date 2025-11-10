import { Calendar, Shield } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const DailyCard = () => {
  const navigate = useNavigate();
  return (
    <Card className="bg-gradient-to-br from-health-purple to-primary border-0 shadow-xl mb-6 overflow-hidden">
      <CardContent className="p-6 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Daily</h3>
        </div>
        <Button
          variant="secondary"
          className="w-full bg-white hover:bg-white/90 text-primary font-semibold shadow-lg"
          onClick={() => navigate("/vaccines/register")}
        >
          <Shield className="w-5 h-5 mr-2" />
          Vaccination Registration
        </Button>
      </CardContent>
    </Card>
  );
};

export default DailyCard;
