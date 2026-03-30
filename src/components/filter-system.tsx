"use client";

import { useState } from "react";
import { 
  Filter, 
  Calendar as CalendarIcon, 
  Check, 
  ChevronDown, 
  X,
  SortAsc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

import { DateRange } from "react-day-picker";

export interface FilterState {
  date?: DateRange;
  brands?: string[];
  statuses?: string[];
  sort?: string;
}

interface FilterSystemProps {
  onFilterChange: (filters: FilterState) => void;
  brands: string[];
  statuses: string[];
}

export function FilterSystem({ onFilterChange, brands, statuses }: FilterSystemProps) {
  const [date, setDate] = useState<DateRange | undefined>();
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sort, setSort] = useState("newest");

  const clearFilters = () => {
    setDate(undefined);
    setSelectedBrands([]);
    setSelectedStatuses([]);
    onFilterChange({});
  };

  const handleDateSelect = (d: DateRange | undefined) => {
    setDate(d);
    onFilterChange({ date: d, brands: selectedBrands, statuses: selectedStatuses, sort });
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const next = checked 
      ? [...selectedBrands, brand] 
      : selectedBrands.filter(b => b !== brand);
    setSelectedBrands(next);
    onFilterChange({ date, brands: next, statuses: selectedStatuses, sort });
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    const next = checked 
      ? [...selectedStatuses, status] 
      : selectedStatuses.filter(s => s !== status);
    setSelectedStatuses(next);
    onFilterChange({ date, brands: selectedBrands, statuses: next, sort });
  };

  const handleSortChange = (s: string) => {
    setSort(s);
    onFilterChange({ date, brands: selectedBrands, statuses: selectedStatuses, sort: s });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger render={<Button variant="outline" size="sm" className="h-9 gap-2 text-muted-foreground" />}>
          <CalendarIcon className="w-4 h-4" />
          {date?.from ? (
            date.to ? (
              <span className="text-foreground">
                {format(date.from, "LLL dd")} - {format(date.to, "LLL dd")}
              </span>
            ) : (
              <span className="text-foreground">{format(date.from, "LLL dd")}</span>
            )
          ) : (
            <span>选择日期</span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-9 gap-2 text-muted-foreground" />}>
          <span className={selectedBrands.length > 0 ? "text-foreground" : ""}>品牌</span>
          {selectedBrands.length > 0 && (
            <Badge variant="secondary" className="ml-1 px-1 font-normal rounded-sm">
              {selectedBrands.length}
            </Badge>
          )}
          <ChevronDown className="w-4 h-4 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {brands.map((brand) => (
            <DropdownMenuCheckboxItem
              key={brand}
              checked={selectedBrands.includes(brand)}
              onCheckedChange={(checked) => handleBrandChange(brand, checked)}
            >
              {brand}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-9 gap-2 text-muted-foreground" />}>
          <span className={selectedStatuses.length > 0 ? "text-foreground" : ""}>状态</span>
          {selectedStatuses.length > 0 && (
            <Badge variant="secondary" className="ml-1 px-1 font-normal rounded-sm">
              {selectedStatuses.length}
            </Badge>
          )}
          <ChevronDown className="w-4 h-4 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {statuses.map((status) => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={selectedStatuses.includes(status)}
              onCheckedChange={(checked) => handleStatusChange(status, checked)}
            >
              {status}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-9 gap-2" />}>
          <SortAsc className="w-4 h-4" />
          排序
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => handleSortChange("newest")}>
            最新创建 {sort === "newest" && <Check className="ml-auto w-4 h-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange("oldest")}>
            最早创建 {sort === "oldest" && <Check className="ml-auto w-4 h-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange("views")}>
            播放量最高 {sort === "views" && <Check className="ml-auto w-4 h-4" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {(date || selectedBrands.length > 0 || selectedStatuses.length > 0) && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 px-2 text-muted-foreground hover:text-foreground">
          重置 <X className="ml-1 w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
