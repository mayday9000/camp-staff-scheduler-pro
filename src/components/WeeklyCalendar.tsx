
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Assignment {
  Date: string;
  StartTime: string;
  EndTime: string;
  AssignedStaff: string;
}

interface WeeklyCalendarProps {
  assignments: Assignment[];
  campType: "elementary" | "middle";
  onStaffAssignment: (staffName: string, date: string, startTime: string, endTime: string, campType: "elementary" | "middle") => void;
  onStaffRemoval: (date: string, startTime: string, staffName: string, campType: "elementary" | "middle") => void;
}

const WeeklyCalendar = ({ assignments, campType, onStaffAssignment, onStaffRemoval }: WeeklyCalendarProps) => {
  const [draggedStaff, setDraggedStaff] = useState<string | null>(null);

  // Generate week dates (Monday to Friday)
  const getWeekDates = () => {
    const dates = [];
    const startDate = new Date('2025-07-01'); // Starting Monday
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Generate time slots (8 AM to 6 PM)
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push({ startTime, endTime });
    }
    return slots;
  };

  const weekDates = getWeekDates();
  const timeSlots = getTimeSlots();
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const getAssignmentsForSlot = (date: string, startTime: string) => {
    return assignments.filter(
      assignment => assignment.Date === date && assignment.StartTime === startTime
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, date: string, startTime: string, endTime: string) => {
    e.preventDefault();
    if (draggedStaff) {
      // Check if staff is already assigned to this slot
      const existingAssignment = getAssignmentsForSlot(date, startTime).find(
        assignment => assignment.AssignedStaff === draggedStaff
      );
      
      if (!existingAssignment) {
        onStaffAssignment(draggedStaff, date, startTime, endTime, campType);
      }
      setDraggedStaff(null);
    }
  };

  const formatTime = (time: string) => {
    const [hour] = time.split(':');
    const hourNum = parseInt(hour);
    return hourNum > 12 ? `${hourNum - 12}:00 PM` : `${hourNum}:00 AM`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 capitalize">
        {campType} Camp Schedule - Week of July 1, 2025
      </h3>
      
      <div className="border rounded-lg overflow-hidden">
        {/* Header with days */}
        <div className="grid grid-cols-6 bg-gray-50">
          <div className="p-3 border-r font-medium text-sm text-center">Time</div>
          {weekDates.map((date, index) => (
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
            
            {weekDates.map(date => {
              const slotAssignments = getAssignmentsForSlot(date, startTime);
              
              return (
                <div
                  key={`${date}-${startTime}`}
                  className="p-2 border-r last:border-r-0 min-h-16 bg-white hover:bg-gray-50 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, date, startTime, endTime)}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    if (draggedStaff) {
                      e.currentTarget.classList.add('bg-blue-50', 'border-blue-200');
                    }
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-200');
                  }}
                >
                  <div className="space-y-1">
                    {slotAssignments.map((assignment, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs flex items-center justify-between gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        <span className="truncate">{assignment.AssignedStaff}</span>
                        <button
                          onClick={() => onStaffRemoval(date, startTime, assignment.AssignedStaff, campType)}
                          className="ml-1 hover:bg-blue-300 rounded-full p-0.5"
                        >
                          <X size={10} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom hook to handle staff dragging from external component
export const useStaffDrag = (setDraggedStaff: (staff: string) => void) => {
  const handleDragStart = (staffName: string) => {
    setDraggedStaff(staffName);
  };

  const handleDragEnd = () => {
    setDraggedStaff(null);
  };

  return { handleDragStart, handleDragEnd };
};

export default WeeklyCalendar;
