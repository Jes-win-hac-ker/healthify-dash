import { Calendar, MapPin, User, ChevronRight } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { format } from "date-fns";

interface EventCardProps {
  title: string;
  description?: string;
  eventDate?: string;
  location?: string;
  trainerName?: string;
  colorTheme: "yellow" | "blue" | "green" | "pink";
}

const EventCard = ({
  title,
  description,
  eventDate,
  location,
  trainerName,
  colorTheme,
}: EventCardProps) => {
  const colorClasses = {
    yellow: "bg-health-yellowLight border-health-yellow/20",
    blue: "bg-health-blueLight border-health-blue/20",
    green: "bg-health-greenLight border-health-green/20",
    pink: "bg-health-pinkLight border-health-pink/20",
  };

  const iconColorClasses = {
    yellow: "text-health-yellow",
    blue: "text-health-blue",
    green: "text-health-green",
    pink: "text-health-pink",
  };

  return (
    <Card
      className={`${colorClasses[colorTheme]} border shadow-md hover:shadow-lg transition-all duration-200`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-card-foreground">{title}</h3>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
        )}
        <div className="space-y-2">
          {eventDate && (
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className={`w-4 h-4 ${iconColorClasses[colorTheme]}`} />
              <span className="text-card-foreground">
                {format(new Date(eventDate), "MMM dd, yyyy 'at' h:mm a")}
              </span>
            </div>
          )}
          {location && (
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className={`w-4 h-4 ${iconColorClasses[colorTheme]}`} />
              <span className="text-card-foreground">{location}</span>
            </div>
          )}
          {trainerName && (
            <div className="flex items-center space-x-2 text-sm">
              <User className={`w-4 h-4 ${iconColorClasses[colorTheme]}`} />
              <span className="text-card-foreground">{trainerName}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
