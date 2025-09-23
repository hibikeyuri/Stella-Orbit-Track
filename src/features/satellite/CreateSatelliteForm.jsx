import { useForm } from "react-hook-form";

import { useCreateSatellite } from "./useCreateSatellite";
import { useEditSatellite } from "./useEditSatellite";

import Form from "@/components/Form";
import FormRow from "@/components/FormRow";
import ToastModal from "@/components/ToastModal";
import { formatDateTimeLocalUTC } from "@/lib/utils";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

function CreateSatelliteForm({ satelliteToEdit = {}, onCloseModal }) {
  const { id: editId, date: sourceDate, ...editValues } = satelliteToEdit;
  // console.log(sourceDate);
  // console.log(formatDateTimeLocalUTC(sourceDate));
  const isEditSession = Boolean(editId);

  const { isCreating, createSatellite } = useCreateSatellite();
  const { isEditing, editSatellite } = useEditSatellite();

  const isWorking = isCreating || isEditing;

  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues: isEditSession
      ? { ...editValues, id: editId, date: formatDateTimeLocalUTC(sourceDate) }
      : {},
  });

  const { errors } = formState;

  console.log(errors);

  function onSubmit(data) {
    // 只在有圖片的情況下才處理 img
    const img = data.img
      ? typeof data.img === "string"
        ? data.img
        : data.img[0]
      : undefined;

    // 根據圖片與否計算酬載
    const payload = img ? { ...data, img } : { ...data };

    if (isEditSession) {
      editSatellite(
        { satelliteData: payload, id: editId },
        {
          onSuccess: () => {
            reset();
            onCloseModal?.();
          },
        },
      );
    } else {
      createSatellite(payload, {
        onSuccess: () => {
          reset();
          onCloseModal?.();
        },
      });
    }

    console.log(data);
    console.log(data.img);
  }

  function onError(err) {
    console.log(err);
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      type={onCloseModal ? "modal" : "regular"}
    >
      <FormRow>
        <Label htmlFor="id" className="text-1xl">
          Satellite id<span className="text-destructive">*</span>
        </Label>
        <Input
          id="id"
          type="number"
          {...register("id", { required: "This field is required" })}
          aria-invalid={!!errors?.id?.message}
        ></Input>
        {errors?.id?.message && (
          <p
            className="text-destructive mt-2 text-xs"
            role="alert"
            aria-live="polite"
          >
            Satellite id is invaid
          </p>
        )}
      </FormRow>

      <FormRow>
        <Label htmlFor="norad_id" className="text-1xl">
          Satellite norad id<span className="text-destructive">*</span>
        </Label>
        <Input
          id="norad_id"
          type="number"
          {...register("norad_id", { required: "This field is required" })}
          aria-invalid={!!errors?.norad_id?.message}
        ></Input>
        {errors?.norad_id?.message && (
          <p
            className="text-destructive mt-2 text-xs"
            role="alert"
            aria-live="polite"
          >
            Satellite id is invaid
          </p>
        )}
      </FormRow>

      <FormRow>
        <Label htmlFor="name" className="text-1xl">
          Satellite name
        </Label>
        <Input id="name" type="text" {...register("name")}></Input>
      </FormRow>

      <FormRow>
        <Label htmlFor="date" className="text-1xl">
          TLE Data Time
        </Label>
        <Input
          id="date"
          type="datetime-local"
          step="1"
          {...register("date")}
        ></Input>
      </FormRow>

      <FormRow>
        <Label htmlFor="category" className="text-1xl">
          Satellite category
        </Label>
        <Input id="category" type="text" {...register("category")}></Input>
      </FormRow>

      <FormRow>
        <Label htmlFor="line1" className="text-1xl">
          Satellite TLE line1
        </Label>
        <Input id="line1" type="text" {...register("line1")}></Input>
      </FormRow>

      <FormRow>
        <Label htmlFor="line2" className="text-1xl">
          Satellite TLE line2
        </Label>
        <Input id="line2" type="text" {...register("line2")}></Input>
      </FormRow>

      <FormRow>
        <Label htmlFor="is_active" className="text-1xl">
          Satellite avtive status
        </Label>
        <Input
          id="is_active"
          type="checkbox"
          {...register("is_active")}
        ></Input>
      </FormRow>

      <FormRow>
        <Label htmlFor="img" className="text-1xl">
          Satellite Image
        </Label>
        <Input
          id="img"
          accept="image/*"
          type="file"
          {...register("img")}
        ></Input>
      </FormRow>

      <FormRow>
        <Button
          type="reset"
          variant="secondary"
          size="lg"
          onClick={() => onCloseModal?.()}
        >
          Cancel
        </Button>
        <Button size="lg" type="submit" disabled={isWorking}>
          {isEditSession ? "Edit Satellite" : "Create New Satellite"}
        </Button>
      </FormRow>
    </Form>
  );
}

export default CreateSatelliteForm;
