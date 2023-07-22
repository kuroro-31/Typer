// components/header.tsx
import Link from "next/link";

import Logo from "./atoms/Logo";

const Header = () => {
  return (
    <header className="w-full bg-white py-2">
      <div className="container mx-auto py-2 px-4 lg:px-0 flex justify-between items-center">
        <Link href={"/"}>
          <Logo />
        </Link>
      </div>
    </header>
  );
};

export default Header;
