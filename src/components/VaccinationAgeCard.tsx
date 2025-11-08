import { Shield, ChevronRight } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const VaccinationAgeCard = () => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-health-purpleLight rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Common Vaccination Age
              </h3>
              <p className="text-sm text-muted-foreground">View recommended vaccines</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};

export default VaccinationAgeCard;
