import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
