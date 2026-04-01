"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Loader2, FileText, Table as TableIcon, Code } from "lucide-react";
import { toast } from "sonner";

interface ExportDialogProps {
  title: string;
  description: string;
  onExport: (config: ExportConfig) => Promise<void>;
  trigger?: React.ReactNode;
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

export function ExportDialog({ title, description, onExport }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportConfig["format"]>("csv");
  const [dateRange, setDateRange] = useState("30d");
  const [selectedFields, setSelectedFields] = useState<string[]>(["id", "title", "status", "date"]);
  const [loading, setLoading] = useState(false);

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) ? prev.filter(f => f !== fieldId) : [...prev, fieldId]
    );
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast.error("Please select at least one field to export.");
      return;
    }
    setLoading(true);
    try {
      await onExport({ format, dateRange, fields: selectedFields });
      toast.success("Export started. Your file will be ready shortly.");
      setOpen(false);
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
        <Download className="w-4 h-4 mr-2" /> Export
      </DialogTrigger>
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
            ].map((f) => (
              <div 
                key={f.id}
                onClick={() => setFormat(f.id as ExportConfig["format"])}
                className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                  format === f.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted"
                }`}
              >
                <f.icon className={`w-5 h-5 mb-1 ${format === f.id ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-xs font-medium">{f.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select value={dateRange} onValueChange={(v) => v && setDateRange(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Fields to include</Label>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_FIELDS.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`field-${field.id}`} 
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => toggleField(field.id)}
                  />
                  <label htmlFor={`field-${field.id}`} className="text-sm font-medium leading-none cursor-pointer">
                    {field.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleExport} disabled={loading} className="px-8">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
