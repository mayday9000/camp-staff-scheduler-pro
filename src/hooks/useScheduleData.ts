import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface ScheduleData {
  elementary: Array<{
    Date: string;
    StartTime: string;
    EndTime: string;
    AssignedStaff: string;
    CampType?: string;
  }>;
  middle: Array<{
    Date: string;
    StartTime: string;
    EndTime: string;
    AssignedStaff: string;
    CampType?: string;
  }>;
  staff: Array<{
    id?: string;
    name: string;
    role?: string;
    qualifications: string[];
    maxHours?: number;
    weeklyHourLimit?: number;
    notes: string;
    availability?: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
  }>;
}

const WEBHOOK_URL = 'https://mayday.app.n8n.cloud/webhook/78e1f0c2-ea99-4e09-b79f-eb55d1c1cec3';

export const useScheduleData = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status}`);
      }

      const rawData = await response.json();
      console.log('Raw webhook data:', rawData);
      
      // Handle the array wrapper format from the webhook
      const data = Array.isArray(rawData) ? rawData[0] : rawData;
      
      // Transform the data to match our expected format
      const transformedData: ScheduleData = {
        elementary: data.elementary || [],
        middle: data.middle || [],
        staff: (data.staff || []).map((staff: any) => ({
          id: staff.id,
          name: staff.name,
          role: staff.role,
          qualifications: staff.qualifications || [],
          maxHours: staff.maxHours,
          weeklyHourLimit: staff.maxHours || staff.weeklyHourLimit || 40,
          notes: staff.notes || '',
          availability: staff.availability
        }))
      };
      
      setScheduleData(transformedData);
      
      toast({
        title: "Data Loaded",
        description: "Schedule data has been loaded successfully.",
      });
    } catch (error) {
      console.error('Error loading schedule data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      // Fallback to sample data
      setScheduleData({
        elementary: [
          {
            Date: "2025-07-01",
            StartTime: "08:00",
            EndTime: "09:00",
            AssignedStaff: "Alice Smith"
          },
          {
            Date: "2025-07-01",
            StartTime: "09:00",
            EndTime: "10:00",
            AssignedStaff: "Bob Johnson"
          }
        ],
        middle: [
          {
            Date: "2025-07-02",
            StartTime: "10:00",
            EndTime: "11:00",
            AssignedStaff: "Carol Lee"
          }
        ],
        staff: [
          {
            name: "Alice Smith",
            qualifications: ["Elementary"],
            weeklyHourLimit: 40,
            notes: "Head counselor, CPR certified",
            role: "Head Counselor"
          },
          {
            name: "Bob Johnson",
            qualifications: ["Elementary", "Middle"],
            weeklyHourLimit: 35,
            notes: "Sports specialist",
            role: "Sports Coordinator"
          },
          {
            name: "Carol Lee",
            qualifications: ["Middle"],
            weeklyHourLimit: 30,
            notes: "Art therapy background",
            role: "Arts & Crafts"
          },
          {
            name: "David Martinez",
            qualifications: ["Elementary"],
            weeklyHourLimit: 25,
            notes: "Part-time, mornings preferred",
            role: "Assistant"
          },
          {
            name: "Emma Wilson",
            qualifications: ["Elementary", "Middle"],
            weeklyHourLimit: 40,
            notes: "First aid certified, swimming instructor",
            role: "Lifeguard"
          }
        ]
      });
      
      toast({
        title: "Using Sample Data",
        description: "Could not load from webhook, using sample data instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (data: Pick<ScheduleData, 'elementary' | 'middle'>) => {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to save data: ${response.status}`);
      }

      toast({
        title: "Schedule Saved",
        description: "The camp schedule has been successfully saved.",
      });
      
      return true;
    } catch (error) {
      console.error('Error saving schedule data:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving the schedule. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    scheduleData,
    setScheduleData,
    isLoading,
    error,
    loadData,
    saveData
  };
};
