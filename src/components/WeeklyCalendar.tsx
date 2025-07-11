
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { X, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { isStaffAvailable, TIME_SLOTS } from "@/utils/staffAvailability";

interface Assignment {
  Date: string;
  StartTime: string;
  EndTime: string;
  AssignedStaff: string;
  CampType?: string;
}

interface Staff {
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
}

interface WeeklyCalendarProps {
  assignments: Assignment[];
  campType: "elementary" | "middle";
  staff: Staff[];
  onStaffAssignment: (staffName: string, date: string, startTime: string, endTime: string, campType: "elementary" | "middle") => void;
  onStaffRemoval: (date: string, startTime: string, staffName: string, campType: "elementary" | "middle") => void;
  onStaffSwap: (fromDate: string, fromTime: string, fromStaff: string, toDate: string, toTime: string, toStaff: string, campType: "elementary" | "middle") => void;
  onWeekChange?: (weekDates: string[]) => void;
}

const WeeklyCalendar = ({ assignments, campType, staff, onStaffAssignment, onStaffRemoval, onStaffSwap, onWeekChange }: WeeklyCalendarProps) => {
  console.log(`WeeklyCalendar - ${campType} received assignments:`, assignments);
  console.log(`WeeklyCalendar - ${campType} assignments count:`, assignments.length);
  
  // Normalize assignments to strip off any "T..." suffix from Date
  const cleanedAssignments = assignments.map(a => ({
    ...a,
    Date: a.Date.includes("T") ? a.Date.split("T")[0] : a.Date
  }));

  console.log(`WeeklyCalendar - ${campType} cleaned assignments:`, cleanedAssignments);

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

  const [draggedStaff, setDraggedStaff] = useState<{
    name: string;
    fromDate: string;
    fromTime: string;
  } | null>(null);

  // Generate time slots using fixed times
  const getTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < TIME_SLOTS.length - 1; i++) {
      slots.push({
        startTime: TIME_SLOTS[i],
        endTime: TIME_SLOTS[i + 1]
      });
    }
    return slots;
  };

  const timeSlots = getTimeSlots();
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekDates = [...currentWeekDates];
    const mondayDate = new Date(newWeekDates[0]);
    
    if (direction === 'prev') {
      mondayDate.setDate(mondayDate.getDate() - 7);
    } else {
      mondayDate.setDate(mondayDate.getDate() + 7);
    }
    
    const weekDates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(mondayDate);
      date.setDate(mondayDate.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }
    
    setCurrentWeekDates(weekDates);
    if (onWeekChange) {
      onWeekChange(weekDates);
    }
  };

  const getAssignmentsForSlot = (date: string, startTime: string) => {
    const slotAssignments = cleanedAssignments.filter(
      assignment => assignment.Date === date && assignment.StartTime === startTime
    );
    if (slotAssignments.length > 0) {
      console.log(`WeeklyCalendar - ${campType} found assignments for ${date} ${startTime}:`, slotAssignments);
    }
    return slotAssignments;
  };

  const getStaffMember = (staffName: string) => {
    return staff.find(s => s.name === staffName);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, date: string, startTime: string, endTime: string) => {
    e.preventDefault();
    
    if (draggedStaff) {
      const existingAssignments = getAssignmentsForSlot(date, startTime);
      const targetStaff = existingAssignments.length > 0 ? existingAssignments[0].AssignedStaff : null;
      
      if (targetStaff && targetStaff !== draggedStaff.name) {
        // Swap staff members
        onStaffSwap(
          draggedStaff.fromDate,
          draggedStaff.fromTime,
          draggedStaff.name,
          date,
          startTime,
          targetStaff,
          campType
        );
      } else if (!targetStaff) {
        // Move staff to empty slot
        onStaffAssignment(draggedStaff.name, date, startTime, endTime, campType);
        onStaffRemoval(draggedStaff.fromDate, draggedStaff.fromTime, draggedStaff.name, campType);
      }
      
      setDraggedStaff(null);
    }
    
    // Handle external staff dragging
    const externalStaffName = e.dataTransfer.getData("text/plain");
    if (externalStaffName && !draggedStaff) {
      const existingAssignment = getAssignmentsForSlot(date, startTime).find(
        assignment => assignment.AssignedStaff === externalStaffName
      );
      
      if (!existingAssignment) {
        onStaffAssignment(externalStaffName, date, startTime, endTime, campType);
      }
    }
  };

  const handleStaffDragStart = (e: React.DragEvent, staffName: string, date: string, startTime: string) => {
    setDraggedStaff({
      name: staffName,
      fromDate: date,
      fromTime: startTime
    });
    
    e.dataTransfer.setData("text/plain", staffName);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleStaffDragEnd = () => {
    setDraggedStaff(null);
  };

  const formatTime = (time: string) => {
    const [hour] = time.split(':');
    const hourNum = parseInt(hour);
    return hourNum > 12 ? `${hourNum - 12}:00 PM` : `${hourNum}:00 AM`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Add one day to correct the display issue
    date.setDate(date.getDate() + 1);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getWeekRange = () => {
    if (currentWeekDates.length === 0) return "Week of July 1, 2025";
    const startDate = new Date(currentWeekDates[0]);
    const endDate = new Date(currentWeekDates[currentWeekDates.length - 1]);
    return `Week of ${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  };

  console.log(`WeeklyCalendar - ${campType} rendering with week dates:`, currentWeekDates);
  console.log(`WeeklyCalendar - ${campType} time slots:`, timeSlots);

  return (
    <TooltipProvider>
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold capitalize">
            {campType} Camp Schedule - {getWeekRange()}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
            >
              Next Week
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden bg-white">
          {/* Header with days */}
          <div className="grid grid-cols-6 bg-gray-50">
            <div className="p-3 border-r font-medium text-sm text-center">Time</div>
            {currentWeekDates.map((date, index) => (
              <div key={date} className="p-3 border-r last:border-r-0 font-medium text-sm text-center">
                <div>{dayNames[index]}</div>
                <div className="text-xs text-gray-500">{formatDate(date)}</div>
              </div>
            ))}
          </div>

          {/* Time slots */}
          {timeSlots.map(({ startTime, endTime }) => (
            <div key={startTime} className="grid grid-cols-6 border-t">
              <div className="p-3 border-r bg-gray-50 text-sm font-medium text-center">
                {formatTime(startTime)}
              </div>
              
              {currentWeekDates.map(date => {
                const slotAssignments = getAssignmentsForSlot(date, startTime);
                
                return (
                  <div
                    key={`${date}-${startTime}`}
                    className="p-2 border-r last:border-r-0 min-h-16 bg-white hover:bg-gray-50 transition-colors relative"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, date, startTime, endTime)}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      if (draggedStaff || e.dataTransfer.types.includes('text/plain')) {
                        e.currentTarget.classList.add('bg-blue-50', 'border-blue-200');
                      }
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('bg-blue-50', 'border-blue-200');
                    }}
                    role="region"
                    aria-label={`Time slot ${formatTime(startTime)} on ${dayNames[currentWeekDates.indexOf(date)]}`}
                  >
                    <div className="space-y-1">
                      {slotAssignments.map((assignment, index) => {
                        const staffMember = getStaffMember(assignment.AssignedStaff);
                        const isAvailable = staffMember ? isStaffAvailable(staffMember, date, startTime) : true;
                        
                        return (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <Badge
                                draggable
                                onDragStart={(e) => handleStaffDragStart(e, assignment.AssignedStaff, date, startTime)}
                                onDragEnd={handleStaffDragEnd}
                                variant="secondary"
                                className={`text-xs flex items-center justify-between gap-1 w-full cursor-move ${
                                  isAvailable 
                                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300'
                                }`}
                              >
                                <div className="flex items-center gap-1 truncate">
                                  {!isAvailable && <AlertTriangle size={10} />}
                                  <span className="truncate">{assignment.AssignedStaff}</span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onStaffRemoval(date, startTime, assignment.AssignedStaff, campType);
                                  }}
                                  className="ml-1 hover:bg-blue-300 rounded-full p-0.5 shrink-0"
                                  aria-label={`Remove ${assignment.AssignedStaff} from this time slot`}
                                >
                                  <X size={10} />
                                </button>
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <p><strong>{assignment.AssignedStaff}</strong></p>
                                <p>{formatTime(startTime)} - {formatTime(endTime)}</p>
                                {staffMember && (
                                  <>
                                    <p><strong>Role:</strong> {staffMember.role || 'Not specified'}</p>
                                    <p><strong>Notes:</strong> {staffMember.notes}</p>
                                    {!isAvailable && (
                                      <p className="text-amber-600 font-medium">
                                        ⚠️ Outside normal availability
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default WeeklyCalendar;
