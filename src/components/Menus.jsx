import { EllipsisVertical } from "lucide-react";

import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

export default function Menus() {
  return (
    <DropdownMenu >
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full shadow-none"
          aria-label="Open edit menu"
        >
          <EllipsisVertical size={16} aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem><Button variant="destructive">OKOK</Button></DropdownMenuItem>
        <DropdownMenuItem><Button variant="outline">OKOK</Button></DropdownMenuItem>
        <DropdownMenuItem><Button variant="secondary">OKOK</Button></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
