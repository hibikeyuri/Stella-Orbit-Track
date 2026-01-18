import { useState } from "react";

import Form from "@/components/Form";
import FormRow from "@/components/FormRow";
import { useUpdateUser } from "@/features/authentication/useUpdateUser";
import { useUser } from "@/features/authentication/useUser";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

export default function UpdateUserDataForm() {
  const { user } = useUser();
  const { updateUser, isUpdating } = useUpdateUser();

  const { email, fullName: currentFullName, avatar: currentAvatar } = user;

  const [fullName, setFullName] = useState(currentFullName);
  const [avatar, setAvatar] = useState(null);

  if (!user) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fullName) return;

    const formData = new FormData();
    formData.append("fullName", fullName);
    if (avatar) formData.append("avatar", avatar);

    updateUser(formData, {
      onSuccess: () => {
        setAvatar(null);
        e.target.reset();
      },
    });
  }

  function handleCancel() {
    setFullName(currentFullName);
    setAvatar(null);
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormRow label="Email address">
        <Input value={email} disabled />
      </FormRow>

      <FormRow label="Full name">
        <Input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          id="fullName"
          disabled={isUpdating}
        />
      </FormRow>

      <FormRow label="Avatar image">
        <Input
          id="avatar"
          accept="image/*"
          type="file"
          onChange={(e) => setAvatar(e.target.files[0])}
          disabled={isUpdating}
        />
      </FormRow>

      {currentAvatar && !avatar && (
        <div className="mb-3">
          <img
            src={currentAvatar}
            alt="Current avatar"
            className="h-16 w-16 rounded-full object-cover"
          />
        </div>
      )}

      <FormRow>
        <Button
          type="reset"
          variation="secondary"
          disabled={isUpdating}
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button disabled={isUpdating}>Update account</Button>
      </FormRow>
    </Form>
  );
}
