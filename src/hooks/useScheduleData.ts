// src/components/CampScheduler.tsx
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useScheduleData } from "@/hooks/useScheduleData";
import WeeklyCalendar from "./WeeklyCalendar";
import StaffPool from "./StaffPool";

type CampType = "elementary" | "middle";

const CampScheduler = () => {
  // 1) Hook is now the single source of truth
  const {
    scheduleData,
    setScheduleData,
    isLoading,
    error,
    saveData
  } = useScheduleData();

  // 2) UI state
  const [activeTab, setActiveTab] = useState<CampType>("elementary");
  const [isSaving, setIsSaving] = useState(false);

  // 3) Assignment handlers directly update hook state
  const handleStaffAssignment = (
    staffName: string,
    date: string,
    startTime: string,
    endTime: string,
    campType: CampType
  ) => {
    setScheduleData(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      next[campType] = next[campType]
        .filter(a => !(a.Date === date && a.StartTime === startTime && a.AssignedStaff === staffName))
        .concat({ Date: date, StartTime: startTime, EndTime: endTime, AssignedStaff: staffName });
      return next;
    });
  };

  const handleStaffRemoval = (
    date: string,
    startTime: string,
    staffName: string,
    campType: CampType
  ) => {
    setScheduleData(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      next[campType] = next[campType].filter(
        a => !(a.Date === date && a.StartTime === startTime && a.AssignedStaff === staffName)
      );
      return next;
    });
  };

  const handleStaffSwap = (
    fromDate: string,
    fromTime: string,
    fromStaff: string,
    toDate: string,
    toTime: string,
    toStaff: string,
    campType: CampType
  ) => {
    setScheduleData(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      const arr = next[campType];
      const iA = arr.findIndex(a =>
        a.Date === fromDate && a.StartTime === fromTime && a.AssignedStaff === fromStaff
      );
      const iB = arr.findIndex(a =>
        a.Date === toDate   && a.StartTime === toTime   && a.AssignedStaff === toStaff
      );
      if (iA !== -1 && iB !== -1) {
        const tmp = arr[iA].AssignedStaff;
        arr[iA].AssignedStaff = arr[iB].AssignedStaff;
        arr[iB].AssignedStaff = tmp;
      }
      next[campType] = arr;
      return next;
    });
  };

  // 4) Helpers
  const calculateStaffHours = (name: string) =>
    !scheduleData
      ? 0
      : scheduleData.elementary.filter(a => a.AssignedStaff === name).length +
        scheduleData.middle.filter(a => a.AssignedStaff === name).length;

  const getQualifiedStaff = () =>
    !scheduleData
      ? []
      : scheduleData.staff.filter(s =>
          s.qualifications.includes(activeTab === "elementary" ? "Elementary" : "Middle")
        );

  // 5) Save
  const handleSaveSchedule = async () => {
    if (!scheduleData) return;
    setIsSaving(true);
    await saveData({
      elementary: scheduleData.elementary,
      middle: scheduleData.middle
    });
    setIsSaving(false);
  };

  // 6) Loading / error
  if (isLoading || !scheduleData) {
    return <div className="p-6 text-center">Loading schedule…</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  // 7) Render
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as CampType)}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="elementary">Elementary Camp</TabsTrigger>
              <TabsTrigger value="middle">Middle Camp</TabsTrigger>
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
