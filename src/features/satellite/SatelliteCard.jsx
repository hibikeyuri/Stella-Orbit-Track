import { Satellite, Eye, Clock, Check, X, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
import { Button } from "@/ui/button";

import SatelliteView from "./SatelliteView";

const statusColors = {
  never: "bg-gray-400",
  upcoming: "bg-blue-500",
  visible: "bg-yellow-400",
  peak: "bg-orange-500",
  completed: "bg-green-500",
  eclipsed: "bg-purple-500",
};

const statusIcons = {
  never: <X className="size-5 text-white" />,
  upcoming: <Clock className="size-5 text-white" />,
  visible: <Eye className="size-5 text-white" />,
  peak: <Zap className="size-5 text-white" />,
  completed: <Check className="size-5 text-white" />,
  eclipsed: <Satellite className="size-5 text-white" />,
};

export default function SatelliteCard({ satellite }) {
  const latestFlyover = satellite.status[satellite.status.length - 1];
  const latestStatus = latestFlyover.status;
  const statusColor = statusColors[latestStatus];

  return (
    <div className="bg-white shadow-md rounded-xl p-4 flex flex-col gap-4 w-full max-w-lg">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="bg-gray-200 flex h-16 w-16 items-center justify-center rounded-xl">
          <Satellite size={32} />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Satellite</p>
          <p className="font-medium text-lg">{satellite.name}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center space-x-4 rounded-xl p-4 bg-gray-100 relative">
        <div className="absolute left-[80px] top-0 bottom-0 w-0.5 bg-gray-300" />
        <div
          data-line
          className={`absolute left-[80px] top-[24px] bottom-0 w-0.5 ${statusColor}`}
        />
        <div className="flex flex-col space-y-6 relative">
          {satellite.status.map((flyover, idx) => (
            <TimelineEvent
              key={idx}
              event={flyover}
              bgColor={statusColors[flyover.status]}
            />
          ))}
        </div>
      </div>

      {/* Footer Dialog */}
      <Dialog>
        <DialogTrigger className="w-full">
          <Button className="w-full">View Details</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{satellite.name}</DialogTitle>
            <DialogDescription>
              <SatelliteView satellite={satellite} />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TimelineEvent({ event, bgColor }) {
  return (
    <div className="flex items-center gap-x-[15px]">
      <p className="text-xs text-muted-foreground w-[40px]">
        {event.start
          ? new Date(event.start).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "--:--"}
      </p>
      <div
        className={`w-[40px] h-[40px] ${bgColor} text-white flex items-center justify-center rounded-full`}
      >
        {statusIcons[event.status]}
      </div>
      <p className="text-sm text-gray-800">
        {event.maxElevation
          ? `Max Elevation: ${event.maxElevation.toFixed(1)}°`
          : event.status}
      </p>
    </div>
  );
}
