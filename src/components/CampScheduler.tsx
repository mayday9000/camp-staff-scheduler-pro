
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useScheduleData } from "@/hooks/useScheduleData";
import WeeklyCalendar from "./WeeklyCalendar";
import StaffPool from "./StaffPool";

const CampScheduler = () => {
  const {
    scheduleData,
    isLoading,
    error,
    saveData,
    setScheduleData
  } = useScheduleData();

  const [activeTab, setActiveTab] = useState<"elementary" | "middle">("elementary");
  const [isSaving, setIsSaving] = useState(false);

  // Get current week (Monday to Friday)
  const getCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    const weekDates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }
    return weekDates;
  };

  const [currentWeekDates, setCurrentWeekDates] = useState<string[]>(getCurrentWeek());

  const handleStaffAssignment = (
    staffName: string,
    date: string,
    startTime: string,
    endTime: string,
    campType: "elementary" | "middle"
  ) => {
    if (!scheduleData) return;
    
    setScheduleData(prev => {
      const newSchedule = { ...prev! };
      newSchedule[campType] = newSchedule[campType].filter(
        a => !(a.Date === date && a.StartTime === startTime && a.AssignedStaff === staffName)
      );
      newSchedule[campType].push({ Date: date, StartTime: startTime, EndTime: endTime, AssignedStaff: staffName });
      return newSchedule;
    });
  };

  const handleStaffRemoval = (
    date: string,
    startTime: string,
    staffName: string,
    campType: "elementary" | "middle"
  ) => {
    if (!scheduleData) return;
    
    setScheduleData(prev => {
      const newSchedule = { ...prev! };
      newSchedule[campType] = newSchedule[campType].filter(
        a => !(a.Date === date && a.StartTime === startTime && a.AssignedStaff === staffName)
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
    if (!scheduleData) return;
    
    setScheduleData(prev => {
      const newSchedule = { ...prev! };
      const idxA = newSchedule[campType].findIndex(a =>
        a.Date === fromDate && a.StartTime === fromTime && a.AssignedStaff === fromStaff
      );
      const idxB = newSchedule[campType].findIndex(a =>
        a.Date === toDate   && a.StartTime === toTime   && a.AssignedStaff === toStaff
      );
      if (idxA !== -1 && idxB !== -1) {
        const t = newSchedule[campType][idxA].AssignedStaff;
        newSchedule[campType][idxA].AssignedStaff = newSchedule[campType][idxB].AssignedStaff;
        newSchedule[campType][idxB].AssignedStaff = t;
      }
      return newSchedule;
    });
  };

  const calculateStaffHoursForWeek = (staffName: string) => {
    if (!scheduleData) return 0;
    
    // Filter assignments for current week only
    const weekAssignments = [
      ...scheduleData.elementary.filter(a => currentWeekDates.includes(a.Date) && a.AssignedStaff === staffName),
      ...scheduleData.middle.filter(a => currentWeekDates.includes(a.Date) && a.AssignedStaff === staffName)
    ];
    
    return weekAssignments.length;
  };

  const getQualifiedStaff = () => {
    if (!scheduleData) return [];
    return scheduleData.staff.filter(staff =>
      staff.qualifications.includes(activeTab === "elementary" ? "Elementary" : "Middle")
    );
  };

  const handleWeekChange = (weekDates: string[]) => {
    setCurrentWeekDates(weekDates);
  };

  const handleSaveSchedule = async () => {
    if (!scheduleData) return;
    setIsSaving(true);
    
    // Filter data for current week only
    const currentWeekData = {
      elementary: scheduleData.elementary.filter(a => currentWeekDates.includes(a.Date)),
      middle: scheduleData.middle.filter(a => currentWeekDates.includes(a.Date))
    };
    
    console.log('Saving current week data:', currentWeekData);
    await saveData(currentWeekData);
    setIsSaving(false);
  };

  if (isLoading || !scheduleData) {
    return <div className="p-6 text-center">Loading schedule…</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-600">Error loading schedule: {error}</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as "elementary" | "middle")}>
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
              onWeekChange={handleWeekChange}
            />
          </div>

          <div className="lg:col-span-1">
            <StaffPool
              staff={getQualifiedStaff()}
              campType={activeTab}
              calculateStaffHours={calculateStaffHoursForWeek}
              currentWeekDates={currentWeekDates}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CampScheduler;
