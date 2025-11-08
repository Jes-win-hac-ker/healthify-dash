import { Sparkles } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

interface AICardProps {
  onOpenChat: () => void;
}

const AICard = ({ onOpenChat }: AICardProps) => {
  return (
    <Card className="bg-gradient-to-br from-health-pink to-health-pink/80 border-0 shadow-xl">
      <CardContent className="p-5">
        <Button
          onClick={onOpenChat}
          variant="ghost"
          className="w-full h-auto p-0 hover:bg-transparent"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">AI Health Assistant</h3>
                <p className="text-sm text-white/80">Get personalized advice</p>
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-white/70" />
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};

export default AICard;
