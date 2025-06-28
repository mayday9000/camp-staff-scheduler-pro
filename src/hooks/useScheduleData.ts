// src/components/CampScheduler.tsx
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useScheduleData } from "@/hooks/useScheduleData";
import WeeklyCalendar from "./WeeklyCalendar";
import StaffPool from "./StaffPool";

const CampScheduler = () => {
  // 1) hook is now the single source of truth
  const {
    scheduleData,
    isLoading,
    error,
    saveData
  } = useScheduleData();

  // 2) tabs & saving state
  const [activeTab, setActiveTab] = useState<"elementary" | "middle">("elementary");
  const [isSaving, setIsSaving] = useState(false);

  // 3) handlers unchanged
  const handleStaffAssignment = (
    staffName: string,
    date: string,
    startTime: string,
    endTime: string,
    campType: "elementary" | "middle"
  ) => {
    saveData; /* your existing assignment logic */
  };
  // …your other handlers here (removal, swap, etc)…

  const calculateStaffHours = (staffName: string) => {
    if (!scheduleData) return 0;
    return (
      scheduleData.elementary.filter(a => a.AssignedStaff === staffName).length +
      scheduleData.middle.filter(a => a.AssignedStaff === staffName).length
    );
  };

  const getQualifiedStaff = () => {
    if (!scheduleData) return [];
    return scheduleData.staff.filter(s =>
      s.qualifications.includes(activeTab === "elementary" ? "Elementary" : "Middle")
    );
  };

  const handleSaveSchedule = async () => {
    if (!scheduleData) return;
    setIsSaving(true);
    await saveData({
      elementary: scheduleData.elementary,
      middle: scheduleData.middle
    });
    setIsSaving(false);
  };

  // 4) loading / error
  if (isLoading || !scheduleData) {
    return <div className="p-6 text-center">Loading schedule…</div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  // 5) render using scheduleData directly
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)}>
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
              onStaffRemoval={/* your removal handler */}
              onStaffSwap={/* your swap handler */}
            />
          </div>
          <StaffPool
            staff={getQualifiedStaff()}
            campType={activeTab}
            calculateStaffHours={calculateStaffHours}
          />
        </div>
      </Card>
    </div>
  );
};

export default CampScheduler;
