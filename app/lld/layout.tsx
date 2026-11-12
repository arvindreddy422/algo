import { LldLanguageProvider } from "@/components/lld/LldLanguageProvider";
import { LldTopicNav } from "@/components/lld/LldTopicNav";

export default function LldLayout({ children }: { children: React.ReactNode }) {
  return (
    <LldLanguageProvider>
      <div className="py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <LldTopicNav />
        {children}
      </div>
    </LldLanguageProvider>
  );
}
