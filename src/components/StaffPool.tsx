
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { Info } from "lucide-react";

interface Staff {
  name: string;
  qualifications: string[];
  weeklyHourLimit?: number;
  maxHours?: number;
  notes: string;
  role?: string;
}

interface StaffPoolProps {
  staff: Staff[];
  campType: "elementary" | "middle";
  calculateStaffHours: (staffName: string) => number;
  currentWeekDates: string[];
}

const StaffPool = ({ staff, campType, calculateStaffHours, currentWeekDates }: StaffPoolProps) => {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
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

  // Get unique roles
  const roles = Array.from(new Set(staff.map(s => s.role).filter(Boolean)));
  
  // Filter staff by role
  const filteredStaff = roleFilter === "all" 
    ? staff 
    : staff.filter(s => s.role === roleFilter);

  const formatWeekRange = () => {
    if (currentWeekDates.length === 0) return "Current Week";
    const startDate = new Date(currentWeekDates[0]);
    const endDate = new Date(currentWeekDates[currentWeekDates.length - 1]);
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <TooltipProvider>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-lg capitalize">
            Available Staff - {campType} Camp
          </CardTitle>
          <div className="text-sm text-gray-600">
            Hours for {formatWeekRange()}
          </div>
          {roles.length > 0 && (
            <div className="pt-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role!}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredStaff.map((member) => {
            const currentHours = calculateStaffHours(member.name);
            const maxHours = member.maxHours || member.weeklyHourLimit || 40;
            const hoursPercentage = (currentHours / maxHours) * 100;
            const remainingHours = maxHours - currentHours;
            
            return (
              <div
                key={member.name}
                draggable
                onDragStart={(e) => handleDragStart(e, member.name)}
                onDragEnd={handleDragEnd}
                className="p-3 border rounded-lg cursor-move hover:shadow-md transition-shadow bg-white hover:bg-gray-50"
                role="button"
                tabIndex={0}
                aria-label={`Drag ${member.name} to assign to time slot`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{member.name}</h4>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-1">
                            <p><strong>Role:</strong> {member.role || 'Not specified'}</p>
                            <p><strong>Hours this week:</strong> {currentHours}/{maxHours}</p>
                            <p><strong>Notes:</strong> {member.notes}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Badge 
                      variant={remainingHours > 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {remainingHours}h left
                    </Badge>
                  </div>
                  
                  {member.role && (
                    <Badge variant="outline" className="text-xs">
                      {member.role}
                    </Badge>
                  )}
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{currentHours}h / {maxHours}h</span>
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
                    <p className="text-xs text-gray-500 italic truncate">
                      {member.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          
          {filteredStaff.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">
                {roleFilter === "all" 
                  ? `No qualified staff available for ${campType} camp`
                  : `No staff found for role: ${roleFilter}`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default StaffPool;
