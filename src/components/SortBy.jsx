import { useId } from "react";
import { useSearchParams } from "react-router";

import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

export function SortBy({ options = [], placeholder, type = "default" }) {
  const id = useId();
  const [searchParams, setSearchParams] = useSearchParams();

  function handleChange(value) {
    searchParams.set("sortBy", value);
    setSearchParams(searchParams);
  }

  return (
    <div className="bg-grey-0 w-[340px] rounded-sm shadow-sm">
      <Select onValueChange={handleChange}>
        <SelectTrigger
          id={id}
          className={
            "rounded-sm px-2 py-[1.7rem] text-[1.2rem] font-medium " +
            (type === "white"
              ? "border-grey-100 border"
              : "border-grey-300 border") +
            " whitespace-nowrap"
          }
        >
          <SelectValue placeholder={placeholder || "Select option"} />
        </SelectTrigger>

        <SelectContent>
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="px-4 py-2 text-[1.2rem]"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
