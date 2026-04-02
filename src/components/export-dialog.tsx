"use client";

import { type ReactElement, useState } from "react";
import { Code, Download, FileText, Loader2, Table as TableIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExportDialogProps {
  title: string;
  description: string;
  onExport: (config: ExportConfig) => Promise<void>;
  trigger?: ReactElement;
}

export interface ExportConfig {
  format: "csv" | "xlsx" | "json";
  dateRange: string;
  fields: string[];
}

const AVAILABLE_FIELDS = [
  { id: "id", label: "Task ID" },
  { id: "title", label: "Video Title" },
  { id: "brand", label: "Brand Name" },
  { id: "status", label: "Current Status" },
  { id: "date", label: "Creation Date" },
  { id: "credits", label: "Credits Used" },
  { id: "url", label: "Download URL" },
];

export function ExportDialog({ title, description, onExport, trigger }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportConfig["format"]>("csv");
  const [dateRange, setDateRange] = useState("30d");
  const [selectedFields, setSelectedFields] = useState<string[]>(["id", "title", "status", "date"]);
  const [loading, setLoading] = useState(false);

  const toggleField = (fieldId: string) => {
    setSelectedFields((previous) => (
      previous.includes(fieldId)
        ? previous.filter((field) => field !== fieldId)
        : [...previous, fieldId]
    ));
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast.error("请至少选择一个导出字段");
      return;
    }

    setLoading(true);
    try {
      await onExport({ format, dateRange, fields: selectedFields });
      toast.success("导出任务已开始，文件准备好后会自动下载或提示。");
      setOpen(false);
    } catch {
      toast.error("导出失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={trigger || (
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
        )}
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "csv", label: "CSV", icon: FileText },
              { id: "xlsx", label: "Excel", icon: TableIcon },
              { id: "json", label: "JSON", icon: Code },
            ].map((option) => (
              <div
                key={option.id}
                onClick={() => setFormat(option.id as ExportConfig["format"])}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border p-3 transition-all ${
                  format === option.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:bg-muted"
                }`}
              >
                <option.icon className={`mb-1 h-5 w-5 ${format === option.id ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-xs font-medium">{option.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>时间范围</Label>
            <Select value={dateRange} onValueChange={(value) => value && setDateRange(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">最近 7 天</SelectItem>
                <SelectItem value="30d">最近 30 天</SelectItem>
                <SelectItem value="90d">最近 90 天</SelectItem>
                <SelectItem value="all">全部时间</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>导出字段</Label>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_FIELDS.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`field-${field.id}`}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => toggleField(field.id)}
                  />
                  <label htmlFor={`field-${field.id}`} className="cursor-pointer text-sm font-medium leading-none">
                    {field.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleExport} disabled={loading} className="px-8">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            导出
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
