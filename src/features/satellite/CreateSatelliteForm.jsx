import Form from "@/components/Form";
import FormRow from "@/components/FormRow";
import { createSatellites } from "@/services/apiSatellites";
import { Button } from "@/ui/button";

import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useForm } from "react-hook-form";

import ToastModal from "@/components/ToastModal";

function CreateSatelliteForm() {
  const queryClient = useQueryClient();

  const toastRef = useRef();

  const showSuccess = () => {
    console.log(toastRef.current);
    toastRef.current?.openToast({
      title: "Satellite successfully created!",
      description: "request is completed",
      type: "success",
    });
  };

  const showError = (err) => {
    toastRef.current?.openToast({
      title: err.message,
      description: "error",
      type: "error",
    });
  };

  const { mutate, isLoading: isCreating } = useMutation({
    mutationFn: createSatellites,
    onSuccess: () => {
      showSuccess();
      queryClient.invalidateQueries({ queryKey: ["satellites"] });
      reset();
    },
    onError: (err) => {
      showError(err);
    },
  });

  const { register, handleSubmit, reset, formState } = useForm();
  const { errors } = formState;
  console.log(errors);
  function onSubmit(data) {
    mutate(data);
    // console.log(data);
  }

  function onError(err) {
    console.log(err);
  }
  return (
    <ToastModal ref={toastRef}>
      <Form onSubmit={handleSubmit(onSubmit, onError)}>
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
          <Button type="reset" variant="secondary" size="lg">
            Cancel
          </Button>
          <Button size="lg" type="submit" disabled={isCreating}>
            Add Satellite
          </Button>
        </FormRow>
      </Form>
    </ToastModal>
  );
}

export default CreateSatelliteForm;
