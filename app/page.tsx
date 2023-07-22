import Header from "@/components/header";
import TOP from "@/components/top/page";

export default function Home() {
  return (
    <main className="min-h-screen p-0 m-0">
      <Header />

      <div className="w-full my-20 flex items-center">
        <TOP />
      </div>
    </main>
  );
}
