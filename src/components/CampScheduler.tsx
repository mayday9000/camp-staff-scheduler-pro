
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useScheduleData } from "@/hooks/useScheduleData";
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
    id?: string;
    name: string;
    qualifications: string[];
    weeklyHourLimit?: number;
    maxHours?: number;
    notes: string;
    role?: string;
    availability?: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
  }>;
}

interface CampSchedulerProps {
  initialData: ScheduleData;
}

const CampScheduler = ({ initialData }: CampSchedulerProps) => {
  const [scheduleData, setScheduleData] = useState<ScheduleData>(initialData);
  const [activeTab, setActiveTab] = useState<"elementary" | "middle">("elementary");
  const [isSaving, setIsSaving] = useState(false);
  const { saveData } = useScheduleData();

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

  const handleStaffSwap = (
    fromDate: string,
    fromTime: string,
    fromStaff: string,
    toDate: string,
    toTime: string,
    toStaff: string,
    campType: "elementary" | "middle"
  ) => {
    setScheduleData(prev => {
      const newSchedule = { ...prev };
      
      // Find the assignments to swap
      const fromAssignmentIndex = newSchedule[campType].findIndex(
        assignment => assignment.Date === fromDate && 
                     assignment.StartTime === fromTime && 
                     assignment.AssignedStaff === fromStaff
      );
      
      const toAssignmentIndex = newSchedule[campType].findIndex(
        assignment => assignment.Date === toDate && 
                     assignment.StartTime === toTime && 
                     assignment.AssignedStaff === toStaff
      );
      
      if (fromAssignmentIndex !== -1 && toAssignmentIndex !== -1) {
        // Swap the staff assignments
        const temp = newSchedule[campType][fromAssignmentIndex].AssignedStaff;
        newSchedule[campType][fromAssignmentIndex].AssignedStaff = newSchedule[campType][toAssignmentIndex].AssignedStaff;
        newSchedule[campType][toAssignmentIndex].AssignedStaff = temp;
      }
      
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

  const handleSaveSchedule = async () => {
    setIsSaving(true);
    
    const payload = {
      elementary: scheduleData.elementary,
      middle: scheduleData.middle
    };
    
    await saveData(payload);
    setIsSaving(false);
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
            onClick={handleSaveSchedule} 
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
              staff={scheduleData.staff}
              onStaffAssignment={handleStaffAssignment}
              onStaffRemoval={handleStaffRemoval}
              onStaffSwap={handleStaffSwap}
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
