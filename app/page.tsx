import Header from "@/components/header";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-0">
      <Header />

      <div className="mx-auto">
        <div className="w-[500px] h-[420px] bg-white"></div>
      </div>
      <div className=""></div>
    </main>
  );
}
