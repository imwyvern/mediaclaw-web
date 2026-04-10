import React from "react";
import Link from "next/link";
import { Check, X, ArrowRight, Video, Flame, Star, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const TIERS = [
  {
    name: "个人体验",
    price: "¥199",
    period: "/ 10条",
    description: "适合个人创作者单次测试爆款效果",
    popular: false,
    cta: "立即体验",
    features: [
      { name: "视频生成", included: true, detail: "10条" },
      { name: "爆款基因提取", included: true },
      { name: "基础文案生成", included: true },
      { name: "智能体接入", included: false },
      { name: "多账号分发", included: false },
      { name: "品牌知识库", included: false },
      { name: "专属客户成功", included: false },
    ],
  },
  {
    name: "企业团队",
    price: "¥980",
    period: "/ 月",
    description: "适合小型团队开始建立品牌流量矩阵",
    popular: false,
    cta: "开始免费试用",
    features: [
      { name: "视频生成", included: true, detail: "100条/月" },
      { name: "爆款基因提取", included: true },
      { name: "高级文案生成", included: true },
      { name: "智能体接入", included: true },
      { name: "多账号分发", included: true, detail: "最多 5 个账号" },
      { name: "品牌知识库", included: true, detail: "1 个品牌" },
      { name: "专属客户成功", included: false },
    ],
  },
  {
    name: "企业专业",
    price: "¥2,980",
    period: "/ 月",
    description: "适合成长型企业规模化抢占行业 AI 入口",
    popular: true,
    cta: "免费体验专业版",
    features: [
      { name: "视频生成", included: true, detail: "500条/月" },
      { name: "爆款基因提取", included: true },
      { name: "高级文案生成", included: true },
      { name: "智能体接入", included: true },
      { name: "多账号分发", included: true, detail: "最多 20 个账号" },
      { name: "品牌知识库", included: true, detail: "多品牌支持" },
      { name: "专属客户成功", included: true },
    ],
  },
  {
    name: "企业旗舰",
    price: "¥28,800",
    period: "/ 年",
    description: "适合行业头部品牌全矩阵流量拦截与 GEO 占位",
    popular: false,
    cta: "联系销售",
    features: [
      { name: "视频生成", included: true, detail: "不限额" },
      { name: "爆款基因提取", included: true },
      { name: "高级文案生成", included: true },
      { name: "智能体接入", included: true, detail: "专属私有化" },
      { name: "多账号分发", included: true, detail: "不限制账号数" },
      { name: "品牌知识库", included: true, detail: "无限制" },
      { name: "专属客户成功", included: true, detail: "7x24小时 + 定制培训" },
    ],
  },
];

const ALL_FEATURES = [
  { category: "核心能力", items: ["爆款发现池", "混剪分镜匹配", "文案智能改写", "智能体交互"] },
  { category: "账号与分发", items: ["支持平台数", "绑定账号上限", "发布状态追踪", "评论监控"] },
  { category: "数据分析", items: ["基础数据报表", "多维度 ROI 分析", "竞品热点追踪", "数据导出 API"] },
  { category: "服务支持", items: ["帮助文档", "邮件工单支持", "专属微信群", "定制部署支持"] },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0b0f1a] text-[#f0f0f0] selection:bg-[#00e8b8] selection:text-[#0b0f1a] flex flex-col">
      <header className="px-6 h-20 flex items-center justify-between sticky top-0 bg-[#0b0f1a]/80 backdrop-blur-md z-50 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 font-black text-xl tracking-tight text-white">
          <div className="w-8 h-8 rounded-lg bg-[#00e8b8] flex items-center justify-center text-[#0b0f1a]">
            <Video className="w-5 h-5" />
          </div>
          MediaClaw
        </Link>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-white/70">
          <Link href="/#capabilities" className="hover:text-[#00e8b8] transition-colors">核心能力</Link>
          <Link href="/pricing" className="text-white">价格方案</Link>
          <Link href="/auth/login" className="hover:text-[#00e8b8] transition-colors">控制台</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="hidden sm:block text-sm font-medium text-white/70 hover:text-white transition-colors">登录</Link>
          <Link href="/auth/register">
            <Button className="bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 font-bold rounded-full px-6 transition-transform hover:scale-105">开始使用</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 pb-32">
        {/* Hero */}
        <section className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00e8b8] rounded-full blur-[150px] opacity-10 pointer-events-none" />
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-white relative z-10">
            按效果付费，<br />
            <span className="text-[#00e8b8]">为爆款概率买单。</span>
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed relative z-10">
            无论您是个人测试跑通模式，还是企业全矩阵全品类霸屏，都能找到最适合的方案。
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto relative z-10 mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            {TIERS.map((tier, idx) => (
              <div 
                key={idx} 
                className={`relative flex flex-col bg-white/[0.02] border rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2
                  ${tier.popular 
                    ? "border-[#00e8b8] shadow-[0_0_40px_-10px_rgba(0,232,184,0.3)] bg-gradient-to-b from-[#00e8b8]/10 to-transparent scale-100 lg:scale-105 z-10" 
                    : "border-white/10 hover:border-white/20"}
                `}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00e8b8] text-[#0b0f1a] px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3 fill-current" /> 最受欢迎
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-white/50 text-sm h-10">{tier.description}</p>
                </div>
                
                <div className="mb-8 flex items-baseline gap-1">
                  <span className={`text-4xl font-black ${tier.popular ? "text-[#00e8b8]" : "text-white"}`}>{tier.price}</span>
                  <span className="text-white/40 text-sm font-medium">{tier.period}</span>
                </div>
                
                <Link href={tier.cta === "联系销售" ? "mailto:contact@mediaclaw.com" : "/auth/register"} className="w-full mb-8">
                  <Button 
                    className={`w-full h-12 rounded-xl font-bold text-base transition-all
                      ${tier.popular 
                        ? "bg-[#00e8b8] text-[#0b0f1a] hover:bg-[#00e8b8]/90 hover:scale-105" 
                        : "bg-white/10 text-white hover:bg-white/20"}
                    `}
                  >
                    {tier.cta}
                  </Button>
                </Link>

                <div className="space-y-4 flex-1">
                  {tier.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      {f.included ? (
                        <Check className="w-4 h-4 text-[#00e8b8] shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
                      )}
                      <span className={f.included ? "text-white/80" : "text-white/30"}>
                        {f.name}
                        {f.detail && <span className="block text-xs text-white/40 mt-0.5">{f.detail}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="px-6 md:px-12 max-w-6xl mx-auto mb-32 hidden md:block">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white">方案全功能对比</h2>
            <p className="text-white/50 mt-4">了解每个版本的详细功能差异</p>
          </div>
          
          <div className="bg-[#0b0f1a] border border-white/10 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/[0.02] border-b border-white/10">
                  <tr>
                    <th className="px-6 py-5 font-bold text-white/50 w-1/3">核心功能</th>
                    <th className="px-6 py-5 font-bold text-white/90 text-center w-1/6">个人体验</th>
                    <th className="px-6 py-5 font-bold text-white/90 text-center w-1/6">企业团队</th>
                    <th className="px-6 py-5 font-bold text-[#00e8b8] text-center w-1/6">企业专业</th>
                    <th className="px-6 py-5 font-bold text-white/90 text-center w-1/6">企业旗舰</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ALL_FEATURES.map((cat, i) => (
                    <React.Fragment key={i}>
                      <tr className="bg-white/[0.01]">
                        <td colSpan={5} className="px-6 py-3 font-bold text-white/70 text-xs tracking-wider uppercase">{cat.category}</td>
                      </tr>
                      {cat.items.map((item, j) => (
                        <tr key={j} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 text-white/80">{item}</td>
                          <td className="px-6 py-4 text-center">
                            {j % 4 === 0 || j % 3 === 0 ? <Check className="w-4 h-4 text-[#00e8b8] mx-auto" /> : <X className="w-4 h-4 text-white/20 mx-auto" />}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {j % 4 !== 3 ? <Check className="w-4 h-4 text-[#00e8b8] mx-auto" /> : <X className="w-4 h-4 text-white/20 mx-auto" />}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Check className="w-4 h-4 text-[#00e8b8] mx-auto" />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Check className="w-4 h-4 text-[#00e8b8] mx-auto" />
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 md:px-12 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white">常见问题 FAQ</h2>
          </div>
          
          <Accordion className="w-full space-y-4">
            <AccordionItem value="item-1" className="border-white/10 bg-white/[0.02] rounded-xl px-6 data-[state=open]:bg-white/5 transition-colors">
              <AccordionTrigger className="text-white hover:text-[#00e8b8] text-base font-bold py-5 hover:no-underline">一条视频的生成是如何计费的？</AccordionTrigger>
              <AccordionContent className="text-white/60 leading-relaxed pb-5">
                无论是通过控制台创建，还是通过龙虾智能体生成，只要最终生成了一条可供下载或发布的完整视频，即计为消耗 1 条额度。生成过程中的文案修改、重抽图片、音乐切换等中间操作均不单独计费。
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border-white/10 bg-white/[0.02] rounded-xl px-6 data-[state=open]:bg-white/5 transition-colors">
              <AccordionTrigger className="text-white hover:text-[#00e8b8] text-base font-bold py-5 hover:no-underline">如果当月额度用完怎么办？</AccordionTrigger>
              <AccordionContent className="text-white/60 leading-relaxed pb-5">
                当您的订阅额度耗尽时，系统会暂停新的视频生成任务。您可以选择升级到更高档位的套餐，或者购买额外的"加油包"（按量付费，随时生效）。团队版及以上客户支持配置超额自动续费。
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-white/10 bg-white/[0.02] rounded-xl px-6 data-[state=open]:bg-white/5 transition-colors">
              <AccordionTrigger className="text-white hover:text-[#00e8b8] text-base font-bold py-5 hover:no-underline">可以支持多少个社交媒体账号绑定？</AccordionTrigger>
              <AccordionContent className="text-white/60 leading-relaxed pb-5">
                企业团队版支持绑定最多 5 个社交平台账号（不限平台），企业专业版支持 20 个。如果您是 MCN 机构或有几百个账号的矩阵需求，请联系我们升级到企业旗舰版，支持无限制的账号绑定与自动化分发管线。
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-white/10 bg-white/[0.02] rounded-xl px-6 data-[state=open]:bg-white/5 transition-colors">
              <AccordionTrigger className="text-white hover:text-[#00e8b8] text-base font-bold py-5 hover:no-underline">是否支持退款？</AccordionTrigger>
              <AccordionContent className="text-white/60 leading-relaxed pb-5">
                我们提供个人体验版供您低成本测试。对于企业年度订阅计划，在订阅生效的 7 天内，如果您发现产品无法满足业务需求，我们支持按比例退回未消耗的金额。
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 bg-black text-white/50 font-light mt-auto">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-white">
            <Video className="w-4 h-4 text-[#00e8b8]" /> MediaClaw 媒爪智能
          </div>
          <p>© 2026 深圳市有微为网络科技有限公司</p>
          <p><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener" className="hover:text-[#00e8b8] transition-colors">粤ICP备2023102599号-5</a></p>
        </div>
      </footer>
    </div>
  );
}
