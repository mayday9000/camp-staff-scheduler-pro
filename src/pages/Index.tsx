
import { useState } from "react";
import CampScheduler from "@/components/CampScheduler";

// Sample data for demonstration
const sampleData = {
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
      notes: "Head counselor, CPR certified"
    },
    {
      name: "Bob Johnson",
      qualifications: ["Elementary", "Middle"],
      weeklyHourLimit: 35,
      notes: "Sports specialist"
    },
    {
      name: "Carol Lee",
      qualifications: ["Middle"],
      weeklyHourLimit: 30,
      notes: "Art therapy background"
    },
    {
      name: "David Martinez",
      qualifications: ["Elementary"],
      weeklyHourLimit: 25,
      notes: "Part-time, mornings preferred"
    },
    {
      name: "Emma Wilson",
      qualifications: ["Elementary", "Middle"],
      weeklyHourLimit: 40,
      notes: "First aid certified, swimming instructor"
    }
  ]
};

const Index = () => {
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
        </div>
        <CampScheduler initialData={sampleData} />
      </div>
    </div>
  );
};

export default Index;
