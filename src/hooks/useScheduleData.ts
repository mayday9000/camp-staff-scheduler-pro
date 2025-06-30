
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
      
      // Transform the data to match our expected format
      const transformedData: ScheduleData = {
        elementary: rawData.elementary || [],
        middle: rawData.middle || [],
        staff: (rawData.staff || []).map((staff: any) => ({
          id: staff.id,
          name: staff.name,
          role: staff.role,
          qualifications: Array.isArray(staff.qualifications) ? staff.qualifications : [],
          maxHours: staff.maxHours,
          weeklyHourLimit: staff.maxHours || staff.weeklyHourLimit || 40,
          notes: staff.notes || '',
          availability: staff.availability || []
        }))
      };
      
      console.log('Transformed data:', transformedData);
      console.log('Elementary assignments count:', transformedData.elementary.length);
      console.log('Middle assignments count:', transformedData.middle.length);
      console.log('Staff count:', transformedData.staff.length);
      
      setScheduleData(transformedData);
      
      toast({
        title: "Data Loaded",
        description: "Schedule data has been loaded successfully.",
      });
    } catch (error) {
      console.error('Error loading schedule data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      toast({
        title: "Load Failed",
        description: "Could not load from webhook. Please check the connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (data: Pick<ScheduleData, 'elementary' | 'middle'>) => {
    try {
      console.log('Sending POST request with data:', data);
      
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

      console.log('POST request successful, performing GET request to verify...');
      
      toast({
        title: "Schedule Saved",
        description: "The camp schedule has been successfully saved.",
      });
      
      // Perform GET request to verify the save worked
      await loadData();
      
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
