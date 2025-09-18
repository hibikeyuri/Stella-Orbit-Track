import { useRef, useState } from "react";

import { useSettings } from "./useSettings";
import { useUpdateSetting } from "./useUpdateSetting";

import Form from "@/components/Form";
import FormRow from "@/components/FormRow";
import Spinner from "@/components/Spinner";
import ToastModal from "@/components/ToastModal";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

export function UpdateSettingsForm() {
  const {
    isLoading,
    settings: { minLength, maxLength, minPayload, maxPayload, Price } = {},
  } = useSettings();
  const toastRef = useRef();
  const { isUpdating, updateSetting } = useUpdateSetting(toastRef);
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

    // 清掉錯誤
    setErrors((prev) => ({ ...prev, [field]: null }));

    updateSetting({ [field]: Number(value) });
  }

  if (isLoading) return <Spinner />;

  return (
    <ToastModal ref={toastRef}>
      <Form>
        {/* minLength */}
        <FormRow>
          <Label htmlFor="minLength" className="text-1xl">
            minLength<span className="text-destructive">*</span>
          </Label>
          <Input
            id="minLength"
            type="number"
            defaultValue={minLength}
            disabled={isUpdating}
            aria-invalid={!!errors.minLength}
            onChange={(e) => handleUpdate(e, "minLength")}
          />
          {errors.minLength && (
            <p className="text-destructive text-sm">{errors.minLength}</p>
          )}
        </FormRow>

        {/* maxLength */}
        <FormRow>
          <Label htmlFor="maxLength" className="text-1xl">
            maxLength<span className="text-destructive">*</span>
          </Label>
          <Input
            id="maxLength"
            type="number"
            defaultValue={maxLength}
            disabled={isUpdating}
            aria-invalid={!!errors.maxLength}
            onChange={(e) => handleUpdate(e, "maxLength")}
          />
          {errors.maxLength && (
            <p className="text-destructive text-sm">{errors.maxLength}</p>
          )}
        </FormRow>

        {/* minPayload */}
        <FormRow>
          <Label htmlFor="minPayload" className="text-1xl">
            minPayload<span className="text-destructive">*</span>
          </Label>
          <Input
            id="minPayload"
            type="number"
            defaultValue={minPayload}
            disabled={isUpdating}
            aria-invalid={!!errors.minPayload}
            onChange={(e) => handleUpdate(e, "minPayload")}
          />
          {errors.minPayload && (
            <p className="text-destructive text-sm">{errors.minPayload}</p>
          )}
        </FormRow>

        {/* maxPayload */}
        <FormRow>
          <Label htmlFor="maxPayload" className="text-1xl">
            maxPayload<span className="text-destructive">*</span>
          </Label>
          <Input
            id="maxPayload"
            type="number"
            defaultValue={maxPayload}
            disabled={isUpdating}
            aria-invalid={!!errors.maxPayload}
            onChange={(e) => handleUpdate(e, "maxPayload")}
          />
          {errors.maxPayload && (
            <p className="text-destructive text-sm">{errors.maxPayload}</p>
          )}
        </FormRow>

        {/* Price */}
        <FormRow>
          <Label htmlFor="Price" className="text-1xl">
            Price<span className="text-destructive">*</span>
          </Label>
          <Input
            id="Price"
            type="number"
            defaultValue={Price}
            disabled={isUpdating}
            aria-invalid={!!errors.Price}
            onChange={(e) => handleUpdate(e, "Price")}
          />
          {errors.Price && (
            <p className="text-destructive text-sm">{errors.Price}</p>
          )}
        </FormRow>
      </Form>
    </ToastModal>
  );
}
