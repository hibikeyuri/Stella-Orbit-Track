import { useState } from "react";

import { useSettings } from "./useSettings";
import { useUpdateSetting } from "./useUpdateSetting";

import Form from "@/components/Form";
import FormRow from "@/components/FormRow";
import Spinner from "@/components/Spinner";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

const FIELDS = [
  {
    key: "default_propagation_minutes",
    label: "Default Propagation (min)",
    type: "number",
    min: 1,
    max: 1440,
  },
  {
    key: "default_ground_track_minutes",
    label: "Ground Track Duration (min)",
    type: "number",
    min: 1,
    max: 1440,
  },
  {
    key: "conjunction_threshold_km",
    label: "Conjunction Threshold (km)",
    type: "number",
    min: 0.1,
    step: 0.1,
  },
  {
    key: "flyover_min_elevation",
    label: "Flyover Min Elevation (°)",
    type: "number",
    min: 0,
    max: 90,
  },
  {
    key: "celestrak_sync_interval",
    label: "Celestrak Sync Interval (sec)",
    type: "number",
    min: 60,
  },
  {
    key: "tle_refresh_interval",
    label: "TLE Refresh Interval (sec)",
    type: "number",
    min: 60,
  },
  {
    key: "map_default_zoom",
    label: "Map Default Zoom",
    type: "number",
    min: 1,
    max: 18,
  },
];

export function UpdateSettingsForm() {
  const {
    isLoading,
    settings = {},
  } = useSettings();
  const { isUpdating, updateSetting } = useUpdateSetting();
  const [errors, setErrors] = useState({});

  function handleUpdate(e, field) {
    const { value } = e.target;

    if (!value || isNaN(Number(value))) {
      setErrors((prev) => ({
        ...prev,
        [field]: "This field must be a number",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, [field]: null }));
    updateSetting({ [field]: Number(value) });
  }

  if (isLoading) return <Spinner />;

  return (
    <Form>
      {FIELDS.map(({ key, label, type, min, max, step }) => (
        <FormRow key={key}>
          <Label htmlFor={key} className="text-sm font-medium">
            {label}<span className="text-destructive"> *</span>
          </Label>
          <Input
            id={key}
            type={type}
            min={min}
            max={max}
            step={step}
            defaultValue={settings[key]}
            disabled={isUpdating}
            aria-invalid={!!errors[key]}
            onChange={(e) => handleUpdate(e, key)}
          />
          {errors[key] && (
            <p className="text-destructive text-sm">{errors[key]}</p>
          )}
        </FormRow>
      ))}
    </Form>
  );
}
