
interface StaffMember {
  name: string;
  availability?: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
}

export const isStaffAvailable = (
  staff: StaffMember,
  date: string,
  startTime: string
): boolean => {
  if (!staff.availability) return true; // If no availability data, assume available
  
  const dayOfWeek = getDayOfWeek(date);
  const staffAvailability = staff.availability.find(
    avail => avail.day.toLowerCase() === dayOfWeek.toLowerCase()
  );
  
  if (!staffAvailability) return false; // Not available on this day
  
  const requestedTime = parseTime(startTime);
  const availableStart = parseTime(staffAvailability.startTime);
  const availableEnd = parseTime(staffAvailability.endTime);
  
  return requestedTime >= availableStart && requestedTime < availableEnd;
};

const getDayOfWeek = (dateString: string): string => {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

const parseTime = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

export const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00"
];
