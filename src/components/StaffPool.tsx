
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Staff {
  name: string;
  qualifications: string[];
  weeklyHourLimit: number;
  notes: string;
}

interface StaffPoolProps {
  staff: Staff[];
  campType: "elementary" | "middle";
  calculateStaffHours: (staffName: string) => number;
}

const StaffPool = ({ staff, campType, calculateStaffHours }: StaffPoolProps) => {
  const handleDragStart = (e: React.DragEvent, staffName: string) => {
    e.dataTransfer.setData("text/plain", staffName);
    e.dataTransfer.effectAllowed = "move";
    
    // Add visual feedback
    const target = e.target as HTMLElement;
    target.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.classList.remove('opacity-50');
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg capitalize">
          Available Staff - {campType} Camp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {staff.map((member) => {
          const currentHours = calculateStaffHours(member.name);
          const hoursPercentage = (currentHours / member.weeklyHourLimit) * 100;
          const remainingHours = member.weeklyHourLimit - currentHours;
          
          return (
            <div
              key={member.name}
              draggable
              onDragStart={(e) => handleDragStart(e, member.name)}
              onDragEnd={handleDragEnd}
              className="p-3 border rounded-lg cursor-move hover:shadow-md transition-shadow bg-white hover:bg-gray-50"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">{member.name}</h4>
                  <Badge 
                    variant={remainingHours > 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {remainingHours}h left
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{currentHours}h / {member.weeklyHourLimit}h</span>
                    <span>{Math.round(hoursPercentage)}%</span>
                  </div>
                  <Progress 
                    value={hoursPercentage} 
                    className="h-1"
                  />
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {member.qualifications.map((qual) => (
                    <Badge key={qual} variant="outline" className="text-xs">
                      {qual}
                    </Badge>
                  ))}
                </div>
                
                {member.notes && (
                  <p className="text-xs text-gray-500 italic">
                    {member.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        
        {staff.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No qualified staff available for {campType} camp</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StaffPool;
