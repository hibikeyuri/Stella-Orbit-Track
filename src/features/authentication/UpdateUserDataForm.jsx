import { useState } from "react";

import Form from "@/components/Form";
import FormRow from "@/components/FormRow";
import { useUpdateUser } from "@/features/authentication/useUpdateUser";
import { useUser } from "@/features/authentication/useUser";
import { useToast } from "@/hooks/useToast";
import { uploadAvatar } from "@/services/apiAuth";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

export default function UpdateUserDataForm() {
  const { user } = useUser();
  const { updateUser, isUpdating } = useUpdateUser();
  const toast = useToast();

  const { email, fullName: currentFullName, avatar_url: currentAvatar } = user;

  const [fullName, setFullName] = useState(currentFullName);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  if (!user) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fullName) return;

    // Upload avatar first if selected
    if (avatarFile) {
      setUploading(true);
      try {
        await uploadAvatar(avatarFile);
        toast.success("Avatar updated", "Your profile picture has been saved.");
      } catch {
        toast.error("Avatar upload failed", "Please try again.");
      } finally {
        setUploading(false);
      }
    }

    // Update name
    updateUser(
      { fullName },
      {
        onSuccess: () => {
          setAvatarFile(null);
          e.target.reset();
        },
      },
    );
  }

  function handleCancel() {
    setFullName(currentFullName);
    setAvatarFile(null);
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
          disabled={isUpdating || uploading}
        />
      </FormRow>

      <FormRow label="Avatar image">
        <div className="flex items-center gap-4">
          {(currentAvatar || avatarFile) && (
            <img
              src={
                avatarFile ? URL.createObjectURL(avatarFile) : currentAvatar
              }
              alt="Avatar preview"
              className="h-14 w-14 rounded-full border-2 border-brand-200 object-cover dark:border-brand-700"
            />
          )}
          <Input
            id="avatar"
            accept="image/jpeg,image/png,image/webp,image/gif"
            type="file"
            onChange={(e) => setAvatarFile(e.target.files[0])}
            disabled={isUpdating || uploading}
          />
        </div>
      </FormRow>

      <FormRow>
        <Button
          type="reset"
          variant="secondary"
          disabled={isUpdating || uploading}
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button disabled={isUpdating || uploading}>
          {uploading ? "Uploading…" : "Update account"}
        </Button>
      </FormRow>
    </Form>
  );
}
