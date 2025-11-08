import { User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ProfileHeaderProps {
  fullName: string;
  age?: number;
}

const ProfileHeader = ({ fullName, age }: ProfileHeaderProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out",
      });
    } else {
      toast({
        title: "Logged out",
        description: "See you soon!",
      });
      navigate("/auth");
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary to-health-purple p-6 rounded-3xl shadow-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16 border-4 border-white/20">
            <AvatarFallback className="bg-primary-foreground text-primary text-xl font-bold">
              {fullName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="text-white">
            <h2 className="text-2xl font-bold">{fullName || "User"}</h2>
            {age && <p className="text-white/80 text-sm">Age: {age}</p>}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-white hover:bg-white/10"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ProfileHeader;
