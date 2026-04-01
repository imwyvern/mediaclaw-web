"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetadataUpdater } from "@/components/metadata-updater";

export default function PricingPage() {
  const [tier, setTier] = useState<"individual" | "enterprise">("individual");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MetadataUpdater title="价格方案" description="选择最适合您的 MediaClaw 订阅方案。" />
      <header className="px-6 h-16 flex items-center border-b justify-between sticky top-0 bg-background/80 backdrop-blur z-50">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            <Video size={18} />
          </div>
          MediaClaw
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/auth">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/auth">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 px-6 text-center max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8">
            为每一条爆款视频，<span className="text-primary">赋予品牌灵魂</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            选择最适合您的方案，开启自动化视频内容创作之旅。
          </p>

          <Tabs defaultValue="individual" className="w-fit mx-auto" onValueChange={(v) => setTier(v as "individual" | "enterprise")}>
            <TabsList className="h-12 p-1">
              <TabsTrigger value="individual" className="px-8 py-2">个人版</TabsTrigger>
              <TabsTrigger value="enterprise" className="px-8 py-2">企业版</TabsTrigger>
            </TabsList>
          </Tabs>
        </section>

        <section className="pb-24 px-6 max-w-7xl mx-auto">
          {tier === "individual" ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { name: "体验版", price: "0", sub: "1条免费", features: ["高清渲染", "基础模版", "标准算力"] },
                { name: "单条", price: "29", sub: "单次购买", features: ["高清渲染", "自选模版", "优先算力"] },
                { name: "10条包", price: "199", sub: "¥19.9/条", features: ["全量模版", "素材库访问", "批量处理"] },
                { name: "30条包", price: "499", sub: "¥16.6/条", features: ["专属客服", "自定义品牌", "高级算力"] },
                { name: "100条包", price: "1,299", sub: "¥12.9/条", features: ["全功能解锁", "API访问", "极致算力"] },
              ].map((p, i) => (
                <Card key={i} className={i === 2 ? "border-primary shadow-lg scale-105" : ""}>
                  <CardHeader>
                    <CardTitle>{p.name}</CardTitle>
                    <CardDescription>{p.sub}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-6">¥{p.price}</div>
                    <ul className="space-y-3 text-sm">
                      {p.features.map(f => (
                        <li key={f} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary" /> {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant={i === 2 ? "default" : "outline"}>立即购买</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "团队", price: "980", fee: "25", desc: "适合初创团队", features: ["5个成员席位", "多品牌空间", "标准工作流", "每月结算"] },
                { name: "专业", price: "2,980", fee: "20", desc: "适合专业代理商", features: ["20个成员席位", "无限品牌空间", "定制工作流", "优先技术支持"] },
                { name: "旗舰", price: "定制", fee: "15", desc: "适合头部企业", features: ["无限席位", "私有化部署", "定制化模版", "SLA保障"] },
              ].map((p, i) => (
                <Card key={i} className={i === 1 ? "border-primary shadow-lg" : ""}>
                  <CardHeader>
                    <CardTitle className="text-2xl">{p.name}</CardTitle>
                    <CardDescription>{p.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">¥{p.price}</span>
                      {p.price !== "定制" && <span className="text-muted-foreground">/月</span>}
                    </div>
                    <div className="text-sm font-medium text-primary mb-6">+ ¥{p.fee}/条视频算力费</div>
                    <ul className="space-y-4">
                      {p.features.map(f => (
                        <li key={f} className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-primary" /> {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full h-12 text-lg" variant={i === 1 ? "default" : "outline"}>联系咨询</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="py-24 bg-muted/30 border-y px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">功能对比</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">核心功能</TableHead>
                  <TableHead className="text-center">个人版</TableHead>
                  <TableHead className="text-center">企业版</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { f: "视频渲染质量", i: "4K / 60FPS", e: "4K / 60FPS" },
                  { f: "渲染节点优先权", i: "标准", e: "极速响应" },
                  { f: "自定义品牌配置", i: "1个", e: "无限" },
                  { f: "团队协作席位", i: "1个", e: "无限" },
                  { f: "API/Webhook 接入", i: "限高级包", e: "全部支持" },
                  { f: "私有化算力池", i: "❌", e: "✅ (旗舰版)" },
                ].map((row) => (
                  <TableRow key={row.f}>
                    <TableCell className="font-medium">{row.f}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{row.i}</TableCell>
                    <TableCell className="text-center">{row.e}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="py-24 px-6 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">常见问题</h2>
          <Accordion className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>什么是视频算力点数？</AccordionTrigger>
              <AccordionContent>
                视频算力点数是 MediaClaw 的计费单位。每生成一段视频将扣除相应的点数，具体扣除数量取决于视频的分辨率、时长和使用的 AI 特效。
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>点数会过期吗？</AccordionTrigger>
              <AccordionContent>
                个人版购买的点数永久有效；企业版订阅包含的点数按月重置，额外购买的点数永久有效。
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>可以随时升级或降级方案吗？</AccordionTrigger>
              <AccordionContent>
                是的，您可以随时在后台进行方案变更。升级将立即生效并补齐差价；降级将在下一个账期生效。
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section className="py-24 px-6 text-center bg-primary text-primary-foreground">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">准备好提升您的品牌表现了吗？</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" variant="secondary" className="px-12 text-lg h-14">免费开始使用</Button>
            </Link>
            <Button size="lg" variant="outline" className="px-12 text-lg h-14 bg-transparent border-primary-foreground text-primary-foreground hover:bg-white/10">咨询大客户方案</Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-background text-sm text-muted-foreground px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-foreground mb-4 md:mb-0">
            <Video size={16} /> MediaClaw
          </div>
          <p>© 2026 MediaClaw. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
