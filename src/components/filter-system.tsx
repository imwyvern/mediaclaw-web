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

interface FilterSystemProps {
  onFilterChange: (filters: any) => void;
  brands: string[];
  statuses: string[];
}

export function FilterSystem({ onFilterChange, brands, statuses }: FilterSystemProps) {
  const [date, setDate] = useState<{ from: Date; to: Date } | undefined>();
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sort, setSort] = useState("newest");

  const clearFilters = () => {
    setDate(undefined);
    setSelectedBrands([]);
    setSelectedStatuses([]);
    onFilterChange({});
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger render={<Button variant="outline" size="sm" className="h-9 gap-2" />}>
          <CalendarIcon className="w-4 h-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd")} - {format(date.to, "LLL dd")}
              </>
            ) : (
              format(date.from, "LLL dd")
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
            selected={date as any}
            onSelect={(d: any) => setDate(d)}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-9 gap-2" />}>
          品牌
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
              onCheckedChange={(checked) => {
                setSelectedBrands(checked 
                  ? [...selectedBrands, brand] 
                  : selectedBrands.filter(b => b !== brand)
                );
              }}
            >
              {brand}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-9 gap-2" />}>
          状态
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
              onCheckedChange={(checked) => {
                setSelectedStatuses(checked 
                  ? [...selectedStatuses, status] 
                  : selectedStatuses.filter(s => s !== status)
                );
              }}
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
          <DropdownMenuItem onClick={() => setSort("newest")}>
            最新创建 {sort === "newest" && <Check className="ml-auto w-4 h-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSort("oldest")}>
            最早创建 {sort === "oldest" && <Check className="ml-auto w-4 h-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSort("views")}>
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
