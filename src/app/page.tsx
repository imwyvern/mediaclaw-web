import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ComingSoonLink } from "@/components/coming-soon-link";
import { ArrowRight, CheckCircle2, MessageSquare, TrendingUp, Copy, Eye, Search, Sparkles, Video } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MediaClaw - 从社交媒体爆款，到 AI 品牌占位",
  description: "通过龙虾智能体，把 AI 内容能力直接送到品牌手中。MediaClaw 不只是帮你做内容，而是帮你提高爆款概率。",
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0b0f1a] text-[#f0f0f0] selection:bg-[#00e8b8] selection:text-[#0b0f1a] scroll-smooth">
      <header className="px-6 h-20 flex items-center justify-between sticky top-0 bg-[#0b0f1a]/80 backdrop-blur-md z-50 border-b border-white/5">
        <div className="flex items-center gap-3 font-black text-xl tracking-tight text-white">
          <div className="w-8 h-8 rounded-lg bg-[#00e8b8] flex items-center justify-center text-[#0b0f1a]">
            {/* Lobster shape / Logo placeholder */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
          </div>
          MediaClaw
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-white/70">
          <Link href="#capabilities" className="hover:text-[#00e8b8] transition-colors">核心能力</Link>
          <Link href="/pricing" className="hover:text-[#00e8b8] transition-colors">价格方案</Link>
          <ComingSoonLink className="hover:text-[#00e8b8] transition-colors cursor-pointer">控制台</ComingSoonLink>
        </nav>
        <div className="flex items-center gap-4">
          <ComingSoonLink className="hidden sm:block text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer">
            登录
          </ComingSoonLink>
          <ComingSoonLink className="cursor-pointer">
            <Button className="bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold rounded-full px-6 h-10 transition-all hover:scale-105">
              开始使用
            </Button>
          </ComingSoonLink>
        </div>
      </header>

      <main className="flex-1">
        {/* 1. Hero */}
        <section className="relative pt-32 pb-40 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto flex flex-col items-start overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00e8b8] rounded-full blur-[150px] opacity-10 pointer-events-none" />
          
          <div className="inline-flex items-center rounded-full border border-[#00e8b8]/30 bg-[#00e8b8]/10 px-4 py-1.5 text-sm text-[#00e8b8] font-medium mb-8">
            <Sparkles className="w-4 h-4 mr-2" />
            全新龙虾智能体已上线
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1] max-w-5xl text-white">
            从社交媒体爆款，<br className="hidden md:block" />
            到 <span className="text-[#00e8b8]">AI 品牌占位</span>。
          </h1>
          
          <p className="text-xl md:text-2xl text-white/60 max-w-2xl mb-12 leading-relaxed font-light">
            通过龙虾智能体，把 AI 内容能力直接送到品牌手中。不需要登录新系统，在企微/飞书群里说话就能用。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
            <ComingSoonLink className="w-full sm:w-auto cursor-pointer">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold rounded-full group">
                立即安装龙虾智能体
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </ComingSoonLink>
            <Link href="#capabilities">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-white/20 text-white hover:bg-white/5 hover:text-white rounded-full transition-colors">
                了解核心能力
              </Button>
            </Link>
          </div>
        </section>

        {/* 2. Pain point (Large Typography Asymmetric) */}
        <section className="py-32 bg-white/[0.02] border-y border-white/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-6xl font-black leading-tight text-white mb-6">
                  老板想要的，<br />
                  不是更多内容。<br />
                  <span className="text-white/40">而是更多爆款。</span>
                </h2>
                <div className="w-20 h-1 bg-[#00e8b8] mb-8" />
                <p className="text-xl text-white/60 leading-relaxed">
                  问题不在于不会做内容。<br />
                  而在于爆款很难持续复制。爆款常常靠运气，热点窗口太短，测试不充分，多平台扩展太慢，人工铺不动......
                </p>
              </div>
              
              <div className="bg-[#0b0f1a] border border-white/10 rounded-3xl p-8 md:p-12 relative shadow-2xl">
                <div className="absolute -left-4 -top-4 text-8xl text-[#00e8b8] opacity-20 font-serif">"</div>
                <p className="text-2xl font-medium leading-relaxed text-white relative z-10">
                  一条爆款内容，往往同时兼顾品牌宣传价值和获客价值。
                </p>
                <div className="mt-8 space-y-4 text-white/70">
                  <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#00e8b8]" /> 爆款带来曝光</div>
                  <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#00e8b8]" /> 爆款带来声量</div>
                  <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#00e8b8]" /> 爆款带来引流</div>
                  <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[#00e8b8]" /> 爆款带来客户机会</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Value Prop */}
        <section className="py-40 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight">
            MediaClaw 不只是帮你做内容。<br />
            而是帮你<span className="text-[#00e8b8] border-b-4 border-[#00e8b8]/40 pb-2">提高爆款概率</span>。
          </h2>
          <p className="text-xl md:text-2xl text-white/50 max-w-3xl mx-auto leading-relaxed mt-12">
            更快生产内容，更多版本测试，更快放大有效内容。<br />从单条内容走向持续增长。<br className="hidden md:block" />
            <span className="text-white/80 font-medium mt-4 block">MediaClaw 的价值，不是替品牌“多发几条内容”，而是系统地提高成功率。</span>
          </p>
        </section>

        {/* 4. Core Capabilities (Asymmetric / Staggered Layout) */}
        <section id="capabilities" className="py-32 border-t border-white/5 bg-[#0b0f1a]">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
            <div className="mb-24">
              <h2 className="text-4xl md:text-5xl font-black text-white">六大核心能力</h2>
              <p className="text-xl text-white/50 mt-4">覆盖从选题到占位的全链路增长</p>
            </div>
            
            <div className="space-y-32">
              {/* Capability 1 */}
              <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-center group">
                <div className="md:w-1/2 space-y-6 order-2 md:order-1">
                  <div className="text-[#00e8b8] font-bold tracking-wider uppercase text-sm">能力 01</div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white group-hover:text-[#00e8b8] transition-colors">AI 爆款内容生产</h3>
                  <p className="text-2xl text-white/80 font-medium">一个卖点，快速变成多条可发布的短视频</p>
                  <ul className="space-y-4 text-lg text-white/60 mt-8">
                    <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00e8b8] shrink-0" /> 输入品牌素材和卖点，AI 自动生成视频</li>
                    <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00e8b8] shrink-0" /> 每条视频配套完整文案、标签和字幕</li>
                    <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00e8b8] shrink-0" /> 从选题到可发布，分钟级完成</li>
                  </ul>
                  <div className="pt-4 text-[#00e8b8] font-medium">不再等创意团队排期。有卖点就有内容。</div>
                </div>
                <div className="md:w-1/2 order-1 md:order-2 bg-gradient-to-br from-[#00e8b8]/10 to-transparent rounded-3xl p-1 border border-[#00e8b8]/20 aspect-square flex items-center justify-center relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                  <Video className="w-32 h-32 text-[#00e8b8]/40 group-hover:text-[#00e8b8] transition-colors duration-500" strokeWidth={1} />
                </div>
              </div>

              {/* Capability 2 */}
              <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-center group">
                <div className="md:w-1/2 bg-gradient-to-bl from-[#00e8b8]/10 to-transparent rounded-3xl p-1 border border-[#00e8b8]/20 aspect-square flex items-center justify-center relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                  <Search className="w-32 h-32 text-[#00e8b8]/40 group-hover:text-[#00e8b8] transition-colors duration-500" strokeWidth={1} />
                </div>
                <div className="md:w-1/2 space-y-6">
                  <div className="text-[#00e8b8] font-bold tracking-wider uppercase text-sm">能力 02</div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white group-hover:text-[#00e8b8] transition-colors">爆款发现与选题推荐</h3>
                  <p className="text-2xl text-white/80 font-medium">用数据找选题，不靠感觉猜</p>
                  <ul className="space-y-4 text-lg text-white/60 mt-8">
                    <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00e8b8] shrink-0" /> 自动追踪行业内正在爆的内容方向</li>
                    <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00e8b8] shrink-0" /> 按热度和爆款潜力排序推荐</li>
                    <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00e8b8] shrink-0" /> 竞品爆款实时监控</li>
                  </ul>
                  <div className="pt-4 text-[#00e8b8] font-medium">选题对了，内容就成功了一半。</div>
                </div>
              </div>

              {/* Capability 3 */}
              <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-center group">
                <div className="md:w-1/2 space-y-6 order-2 md:order-1">
                  <div className="text-[#00e8b8] font-bold tracking-wider uppercase text-sm">能力 03</div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white group-hover:text-[#00e8b8] transition-colors">内容去重与矩阵放大</h3>
                  <p className="text-2xl text-white/80 font-medium">一条内容变成多条，每条都不重复</p>
                  <ul className="space-y-4 text-lg text-white/60 mt-8">
                    <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00e8b8] shrink-0" /> 同一卖点自动生成多种表达和风格</li>
                    <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00e8b8] shrink-0" /> 6 层去重机制，平台查重不怕</li>
                    <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00e8b8] shrink-0" /> 多账号、多平台、多地区各自适配</li>
                  </ul>
                  <div className="pt-4 text-[#00e8b8] font-medium">爆款不只是一条视频，而是一批流量。</div>
                </div>
                <div className="md:w-1/2 order-1 md:order-2 bg-gradient-to-br from-[#00e8b8]/10 to-transparent rounded-3xl p-1 border border-[#00e8b8]/20 aspect-square flex items-center justify-center relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                  <Copy className="w-32 h-32 text-[#00e8b8]/40 group-hover:text-[#00e8b8] transition-colors duration-500" strokeWidth={1} />
                </div>
              </div>

              {/* Capability 4 */}
              <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-center group">
                <div className="md:w-1/2 bg-gradient-to-bl from-[#00e8b8]/10 to-transparent rounded-3xl p-1 border border-[#00e8b8]/20 aspect-square flex items-center justify-center relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                  <TrendingUp className="w-32 h-32 text-[#00e8b8]/40 group-hover:text-[#00e8b8] transition-colors duration-500" strokeWidth={1} />
                </div>
                <div className="md:w-1/2 space-y-6">
                  <div className="text-[#00e8b8] font-bold tracking-wider uppercase text-sm">能力 04</div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white group-hover:text-[#00e8b8] transition-colors">数据追踪与优化建议</h3>
                  <p className="text-2xl text-white/80 font-medium">发出去之后，AI 帮你盯着</p>
                  <ul className="space-y-4 text-lg text-white/60 mt-8">
                    <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00e8b8] shrink-0" /> 自动采集播放、互动、完播数据</li>
                    <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00e8b8] shrink-0" /> AI 分析哪条更好、为什么好</li>
                    <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00e8b8] shrink-0" /> 下一批内容自动优化方向</li>
                  </ul>
                  <div className="pt-4 text-[#00e8b8] font-medium">不是发完就完了，而是越发越准。</div>
                </div>
              </div>

              {/* Capability 5 */}
              <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-center group">
                <div className="md:w-1/2 space-y-6 order-2 md:order-1">
                  <div className="text-[#00e8b8] font-bold tracking-wider uppercase text-sm">能力 05</div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white group-hover:text-[#00e8b8] transition-colors">龙虾智能体交付</h3>
                  <p className="text-2xl text-white/80 font-medium">不需要登录新系统，对着龙虾说话就行</p>
                  <ul className="space-y-4 text-lg text-white/60 mt-8">
                    <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00e8b8] shrink-0" /> 安装"龙虾智能体"，即刻接入全部能力</li>
                    <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00e8b8] shrink-0" /> 在企微、飞书群里用自然语言下达指令</li>
                    <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00e8b8] shrink-0" /> 查视频、改文案、看数据，说一句话就完成</li>
                  </ul>
                  <div className="pt-4 text-[#00e8b8] font-medium">AI 智能体不是 PPT 里的故事，是你今天就能用的工具。</div>
                </div>
                <div className="md:w-1/2 order-1 md:order-2 bg-gradient-to-br from-[#00e8b8]/10 to-transparent rounded-3xl p-1 border border-[#00e8b8]/20 aspect-square flex items-center justify-center relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                  <MessageSquare className="w-32 h-32 text-[#00e8b8]/40 group-hover:text-[#00e8b8] transition-colors duration-500" strokeWidth={1} />
                </div>
              </div>

              {/* Capability 6 */}
              <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-center group">
                <div className="md:w-1/2 bg-gradient-to-bl from-[#00e8b8]/10 to-transparent rounded-3xl p-1 border border-[#00e8b8]/20 aspect-square flex items-center justify-center relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                  <Eye className="w-32 h-32 text-[#00e8b8]/40 group-hover:text-[#00e8b8] transition-colors duration-500" strokeWidth={1} />
                </div>
                <div className="md:w-1/2 space-y-6">
                  <div className="text-[#00e8b8] font-bold tracking-wider uppercase text-sm">能力 06</div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white group-hover:text-[#00e8b8] transition-colors">AI 品牌占位（GEO）</h3>
                  <p className="text-2xl text-white/80 font-medium">让品牌被 AI 搜索和 AI 推荐提到</p>
                  <ul className="space-y-4 text-lg text-white/60 mt-8">
                    <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00e8b8] shrink-0" /> 优化内容资产，让品牌更容易被 AI 理解</li>
                    <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00e8b8] shrink-0" /> 提高品牌在 DeepSeek、豆包、ChatGPT 回答中的出现概率</li>
                    <li className="flex items-start gap-3"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00e8b8] shrink-0" /> 提前抢占 AI 时代的品牌入口</li>
                  </ul>
                  <div className="pt-4 text-[#00e8b8] font-medium">未来用户找品牌，不只是搜索和刷短视频，也会问 AI。</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 5. Competitive Differentiation */}
        <section className="py-32 bg-white/[0.02] border-y border-white/5">
          <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-16 text-white">MediaClaw 不只是一个内容工具</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-left">
              <div className="p-8 rounded-3xl bg-black/40 border border-white/5 flex items-center gap-4 text-white/60 hover:border-white/20 transition-colors">
                <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">✕</div>
                <span className="text-xl">不是只解决制作效率</span>
              </div>
              <div className="p-8 rounded-3xl bg-black/40 border border-white/5 flex items-center gap-4 text-white/60 hover:border-white/20 transition-colors">
                <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">✕</div>
                <span className="text-xl">不是只提供热点数据</span>
              </div>
              <div className="p-8 rounded-3xl bg-black/40 border border-white/5 flex items-center gap-4 text-white/60 hover:border-white/20 transition-colors">
                <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">✕</div>
                <span className="text-xl">不是只靠人工代运营</span>
              </div>
              <div className="p-8 rounded-3xl bg-black/40 border border-white/5 flex items-center gap-4 text-white/60 hover:border-white/20 transition-colors">
                <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">✕</div>
                <span className="text-xl">不是只做 GEO 咨询</span>
              </div>
            </div>
            
            <div className="mt-16 p-10 md:p-12 rounded-3xl bg-gradient-to-r from-[#00e8b8]/20 to-[#00e8b8]/5 border border-[#00e8b8]/30 text-left relative overflow-hidden group">
              <div className="absolute right-0 top-0 text-9xl text-[#00e8b8]/20 translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-700">🦞</div>
              <p className="text-3xl font-bold text-white leading-relaxed relative z-10">
                MediaClaw 通过龙虾智能体，<br />
                把爆款内容能力直接送到你已经在用的工具里。
              </p>
              <p className="mt-4 text-xl text-[#00e8b8] relative z-10 font-medium">不是又一个需要你登录学习的新后台。</p>
            </div>
          </div>
        </section>

        {/* 6. Final CTA */}
        <section className="py-40 px-6 md:px-12 lg:px-24 max-w-5xl mx-auto text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00e8b8] rounded-full blur-[120px] opacity-10 pointer-events-none" />
          
          <h2 className="text-5xl md:text-7xl font-black mb-12 leading-tight text-white relative z-10">
            让品牌内容从“碰运气”<br />
            走向“可持续增长”
          </h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-16 text-xl text-white/80 relative z-10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔥</span> <strong>今天</strong>，做出更容易爆的内容
            </div>
            <div className="hidden md:block text-white/20">|</div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🦞</span> <strong>现在</strong>，用龙虾智能体上手
            </div>
            <div className="hidden md:block text-white/20">|</div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span> <strong>明天</strong>，占住 AI 推荐入口
            </div>
          </div>

          <ComingSoonLink className="relative z-10 inline-block cursor-pointer">
            <Button size="lg" className="text-xl h-16 px-12 bg-[#00e8b8] text-[#0b0f1a] hover:bg-white hover:text-[#0b0f1a] font-black rounded-full transition-all hover:scale-105 shadow-[0_0_40px_rgba(0,232,184,0.2)] hover:shadow-[0_0_60px_rgba(0,232,184,0.4)]">
              开始使用 MediaClaw
            </Button>
          </ComingSoonLink>
          <p className="mt-8 text-white/50 relative z-10 text-lg">不需要迁移数据，不需要培训团队。安装智能体，说话就能用。</p>
        </section>
      </main>

      <footer className="border-t border-white/5 py-16 bg-black text-white/50 font-light">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div>
              <div className="flex items-center gap-3 font-bold text-white mb-6 text-xl">
                <div className="w-8 h-8 rounded-lg bg-[#00e8b8] flex items-center justify-center text-[#0b0f1a]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                </div>
                MediaClaw 媒爪智能
              </div>
              <p className="max-w-sm leading-relaxed text-base">
                从社交媒体爆款，到 AI 品牌占位。<br />通过龙虾智能体，把 AI 内容能力直接送到品牌手中。
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:flex gap-12 md:gap-24 text-sm">
              <div>
                <h4 className="text-white font-medium mb-6 uppercase tracking-wider">联系与支持</h4>
                <ul className="space-y-4">
                  <li><a href="mailto:contact@mediaclawbot.com" className="hover:text-[#00e8b8] transition-colors">contact@mediaclawbot.com</a></li>
                  <li><a href="https://mediaclawbot.com" className="hover:text-[#00e8b8] transition-colors">mediaclawbot.com</a></li>
                  <li>📍 深圳市福田区北环大道7037号3层</li>
                  <li>📱 13510869785</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-6 uppercase tracking-wider">合规信息</h4>
                <div className="flex flex-col gap-4">
                  <ComingSoonLink className="hover:text-[#00e8b8] transition-colors cursor-pointer">用户协议</ComingSoonLink>
                  <ComingSoonLink className="hover:text-[#00e8b8] transition-colors cursor-pointer">隐私政策</ComingSoonLink>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 text-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <p>© 2026 媒爪智能 MediaClaw · 深圳市有微为网络科技有限公司</p>
            <p>
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener" className="hover:text-[#00e8b8] transition-colors">
                粤ICP备2023102599号-5
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
