import { Satellite, Eye, Clock, Check, X, Zap } from "lucide-react";

import SatelliteView from "./SatelliteView";

import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";

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
    <div className="flex w-full max-w-lg flex-col gap-4 rounded-xl bg-white p-4 shadow-md">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-200">
          <Satellite size={32} />
        </div>
        <div>
          <p className="text-sm text-gray-500">Satellite</p>
          <p className="text-lg font-medium">{satellite.name}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative flex items-center space-x-4 rounded-xl bg-gray-100 p-4">
        <div className="absolute top-0 bottom-0 left-[80px] w-0.5 bg-gray-300" />
        <div
          data-line
          className={`absolute top-[24px] bottom-0 left-[80px] w-0.5 ${statusColor}`}
        />
        <div className="relative flex flex-col space-y-6">
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
      <p className="text-muted-foreground w-[40px] text-xs">
        {event.start
          ? new Date(event.start).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "--:--"}
      </p>
      <div
        className={`h-[40px] w-[40px] ${bgColor} flex items-center justify-center rounded-full text-white`}
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
