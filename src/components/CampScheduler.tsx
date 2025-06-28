// src/components/CampScheduler.tsx
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useScheduleData } from "@/hooks/useScheduleData";
import WeeklyCalendar from "./WeeklyCalendar";
import StaffPool from "./StaffPool";

const CampScheduler = () => {
  // 1) grab everything from your hook
  const {
    scheduleData,
    isLoading,
    error,
    saveData
  } = useScheduleData();

  // 2) local copy for editing
  const [localSchedule, setLocalSchedule] = useState(scheduleData);

  // 3) whenever hook finishes loading, overwrite local state
  useEffect(() => {
    if (scheduleData) {
      setLocalSchedule(scheduleData);
    }
  }, [scheduleData]);

  // 4) track tabs & saving
  const [activeTab, setActiveTab] = useState<"elementary" | "middle">("elementary");
  const [isSaving, setIsSaving] = useState(false);

  // 5) handlers (unchanged)
  const handleStaffAssignment = (
    staffName: string,
    date: string,
    startTime: string,
    endTime: string,
    campType: "elementary" | "middle"
  ) => {
    setLocalSchedule(prev => {
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
    setLocalSchedule(prev => {
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
    setLocalSchedule(prev => {
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

  const calculateStaffHours = (staffName: string) => {
    if (!localSchedule) return 0;
    return (
      localSchedule.elementary.filter(a => a.AssignedStaff === staffName).length +
      localSchedule.middle.filter(a => a.AssignedStaff === staffName).length
    );
  };

  const getQualifiedStaff = () => {
    if (!localSchedule) return [];
    return localSchedule.staff.filter(staff =>
      staff.qualifications.includes(activeTab === "elementary" ? "Elementary" : "Middle")
    );
  };

  const handleSaveSchedule = async () => {
    if (!localSchedule) return;
    setIsSaving(true);
    await saveData({
      elementary: localSchedule.elementary,
      middle: localSchedule.middle
    });
    setIsSaving(false);
  };

  // 6) render loading / error states
  if (isLoading || !localSchedule) {
    return <div className="p-6 text-center">Loading schedule…</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-600">Error loading schedule: {error}</div>;
  }

  // 7) main UI
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
              assignments={localSchedule[activeTab]}
              campType={activeTab}
              staff={localSchedule.staff}
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
