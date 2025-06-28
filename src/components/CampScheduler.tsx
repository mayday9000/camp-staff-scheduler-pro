
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import WeeklyCalendar from "./WeeklyCalendar";
import StaffPool from "./StaffPool";

interface ScheduleData {
  elementary: Array<{
    Date: string;
    StartTime: string;
    EndTime: string;
    AssignedStaff: string;
  }>;
  middle: Array<{
    Date: string;
    StartTime: string;
    EndTime: string;
    AssignedStaff: string;
  }>;
  staff: Array<{
    name: string;
    qualifications: string[];
    weeklyHourLimit: number;
    notes: string;
  }>;
}

interface CampSchedulerProps {
  initialData: ScheduleData;
}

const CampScheduler = ({ initialData }: CampSchedulerProps) => {
  const [scheduleData, setScheduleData] = useState<ScheduleData>(initialData);
  const [activeTab, setActiveTab] = useState<"elementary" | "middle">("elementary");
  const [isSaving, setIsSaving] = useState(false);

  const handleStaffAssignment = (
    staffName: string,
    date: string,
    startTime: string,
    endTime: string,
    campType: "elementary" | "middle"
  ) => {
    setScheduleData(prev => {
      const newSchedule = { ...prev };
      
      // Remove any existing assignment for this staff member at this time slot
      newSchedule[campType] = newSchedule[campType].filter(
        assignment => !(assignment.Date === date && 
                      assignment.StartTime === startTime && 
                      assignment.AssignedStaff === staffName)
      );
      
      // Add new assignment
      newSchedule[campType].push({
        Date: date,
        StartTime: startTime,
        EndTime: endTime,
        AssignedStaff: staffName
      });
      
      return newSchedule;
    });
  };

  const handleStaffRemoval = (
    date: string,
    startTime: string,
    staffName: string,
    campType: "elementary" | "middle"
  ) => {
    setScheduleData(prev => {
      const newSchedule = { ...prev };
      newSchedule[campType] = newSchedule[campType].filter(
        assignment => !(assignment.Date === date && 
                      assignment.StartTime === startTime && 
                      assignment.AssignedStaff === staffName)
      );
      return newSchedule;
    });
  };

  const calculateStaffHours = (staffName: string) => {
    const elementaryHours = scheduleData.elementary.filter(
      assignment => assignment.AssignedStaff === staffName
    ).length;
    
    const middleHours = scheduleData.middle.filter(
      assignment => assignment.AssignedStaff === staffName
    ).length;
    
    return elementaryHours + middleHours;
  };

  const getQualifiedStaff = () => {
    return scheduleData.staff.filter(staff => 
      staff.qualifications.includes(activeTab === "elementary" ? "Elementary" : "Middle")
    );
  };

  const saveSchedule = async () => {
    setIsSaving(true);
    
    try {
      const payload = {
        elementary: scheduleData.elementary,
        middle: scheduleData.middle
      };
      
      // Simulate API call - replace with actual webhook URL
      console.log("Saving schedule:", payload);
      
      // Uncomment and replace with actual webhook URL when ready
      // const response = await fetch('YOUR_WEBHOOK_URL', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(payload),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to save schedule');
      // }
      
      toast({
        title: "Schedule Saved",
        description: "The camp schedule has been successfully saved.",
      });
      
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast({
        title: "Save Failed",
        description: "There was an error saving the schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "elementary" | "middle")}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="elementary" className="text-sm font-medium">
                Elementary Camp
              </TabsTrigger>
              <TabsTrigger value="middle" className="text-sm font-medium">
                Middle Camp
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            onClick={saveSchedule} 
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? "Saving..." : "Save Schedule"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <WeeklyCalendar
              assignments={scheduleData[activeTab]}
              campType={activeTab}
              onStaffAssignment={handleStaffAssignment}
              onStaffRemoval={handleStaffRemoval}
            />
          </div>
          
          <div className="lg:col-span-1">
            <StaffPool
              staff={getQualifiedStaff()}
              campType={activeTab}
              calculateStaffHours={calculateStaffHours}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CampScheduler;
