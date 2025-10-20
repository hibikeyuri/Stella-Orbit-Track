import UserAvatar from "../features/authentication/UserAvatar";

import HeaderMenu from "./HeaderMenu";

function Header() {
  return (
    <header className="bg-gray-0 flex items-center justify-end gap-6 border-b border-gray-100 px-12 py-3">
      <UserAvatar />
      <HeaderMenu />
    </header>
  );
}

export default Header;
