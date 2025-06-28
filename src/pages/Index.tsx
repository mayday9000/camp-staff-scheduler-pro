
import CampScheduler from "@/components/CampScheduler";
import { useScheduleData } from "@/hooks/useScheduleData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";

const Index = () => {
  const { scheduleData, isLoading, error, loadData } = useScheduleData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading Schedule Data</h2>
          <p className="text-gray-600">Fetching the latest camp schedule...</p>
        </Card>
      </div>
    );
  }

  if (error && !scheduleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Failed to Load Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadData} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry Loading
          </Button>
        </Card>
      </div>
    );
  }

  if (!scheduleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600">No schedule data available</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            YMCA Summer Camp Scheduler
          </h1>
          <p className="text-lg text-gray-600">
            Drag and drop staff scheduling for Elementary and Middle camp programs
          </p>
          <Button 
            onClick={loadData} 
            variant="outline" 
            size="sm" 
            className="mt-4 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
        <CampScheduler />
      </div>
    </div>
  );
};

export default Index;
