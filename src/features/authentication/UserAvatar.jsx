import { useUser } from "@/features/authentication/useUser";

export default function UserAvatar() {
  const { user } = useUser();

  if (!user) return null;

  const { fullName, avatar } = user;

  return (
    <div className="flex items-center gap-3 text-[1.4rem] font-medium text-gray-600">
      <img
        src={avatar || "default-user.jpg"}
        alt={`Avatar of ${fullName}`}
        className="block aspect-square w-9 rounded-full object-cover object-center outline outline-2 outline-gray-100"
      />
      <span>{fullName}</span>
    </div>
  );
}
