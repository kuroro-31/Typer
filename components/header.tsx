/*
|--------------------------------------------------------------------------
| ヘッダー
|--------------------------------------------------------------------------
*/
import Link from "next/link";

const Header = () => {
  return (
    <header className="w-full py-2 bg-white border-b">
      <div className="container mx-auto py-2 px-4 lg:px-0 flex justify-between items-center">
        <Link href={"/"} className="w-full">
          <h1 className="text-2xl font-semibold">転タイ</h1>
        </Link>
      </div>
    </header>
  );
};

export default Header;
