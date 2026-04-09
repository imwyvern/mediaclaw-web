import Link from "next/link";
import { ArrowLeft, Video, Shield } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-[#0b0f1a] text-[#f0f0f0]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-[#0b0f1a]/80 px-6 backdrop-blur">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00e8b8] text-[#0b0f1a]">
              <Video size={18} />
            </div>
            MediaClaw
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2 font-medium text-white/50">
            <Shield className="w-4 h-4" /> 超级后台
          </div>
        </div>
        
        <Link href="/dashboard" className="text-sm font-medium text-white/50 hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回控制台
        </Link>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-6 lg:p-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
