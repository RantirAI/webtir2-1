import React from "react";
import { useBuilderStore } from "../../store/useBuilderStore";
import { ComponentInstance } from "../../store/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarDataEditorProps {
  instance: ComponentInstance;
}

export const CalendarDataEditor: React.FC<CalendarDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  const settings = instance.props?.calendarSettings || {};
  const mode = settings.mode || 'single';
  const weekStartsOn = settings.weekStartsOn ?? 0;
  const showOutsideDays = settings.showOutsideDays !== false;
  const showWeekNumber = settings.showWeekNumber || false;
  const numberOfMonths = settings.numberOfMonths || 1;
  const defaultMonth = settings.defaultMonth || '';
  const fromDate = settings.fromDate || '';
  const toDate = settings.toDate || '';

  const updateSettings = (key: string, value: any) => {
    updateInstance(instance.id, {
      props: {
        ...instance.props,
        calendarSettings: {
          ...settings,
          [key]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
          Calendar Settings
        </span>
      </div>

      {/* Selection Mode */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Selection Mode</Label>
        <Select value={mode} onValueChange={(v) => updateSettings('mode', v)}>
          <SelectTrigger className="h-7 text-[10px]">
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single Date</SelectItem>
            <SelectItem value="range">Date Range</SelectItem>
            <SelectItem value="multiple">Multiple Dates</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Week Starts On */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Week Starts On</Label>
        <Select 
          value={String(weekStartsOn)} 
          onValueChange={(v) => updateSettings('weekStartsOn', Number(v))}
        >
          <SelectTrigger className="h-7 text-[10px]">
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Sunday</SelectItem>
            <SelectItem value="1">Monday</SelectItem>
            <SelectItem value="2">Tuesday</SelectItem>
            <SelectItem value="3">Wednesday</SelectItem>
            <SelectItem value="4">Thursday</SelectItem>
            <SelectItem value="5">Friday</SelectItem>
            <SelectItem value="6">Saturday</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Number of Months */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Number of Months</Label>
        <Select 
          value={String(numberOfMonths)} 
          onValueChange={(v) => updateSettings('numberOfMonths', Number(v))}
        >
          <SelectTrigger className="h-7 text-[10px]">
            <SelectValue placeholder="Select count" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Month</SelectItem>
            <SelectItem value="2">2 Months</SelectItem>
            <SelectItem value="3">3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-2" />

      {/* Toggle Options */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-muted-foreground">Display Options</span>
        
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-medium text-foreground">Show Outside Days</Label>
          <Switch
            checked={showOutsideDays}
            onCheckedChange={(checked) => updateSettings('showOutsideDays', checked)}
            className="scale-75"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-medium text-foreground">Show Week Numbers</Label>
          <Switch
            checked={showWeekNumber}
            onCheckedChange={(checked) => updateSettings('showWeekNumber', checked)}
            className="scale-75"
          />
        </div>
      </div>

      <Separator className="my-2" />

      {/* Date Bounds */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-muted-foreground">Date Constraints</span>
        
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Default Month</Label>
          <Input
            type="month"
            value={defaultMonth}
            onChange={(e) => updateSettings('defaultMonth', e.target.value)}
            className="h-7 text-[10px] text-foreground bg-background"
            placeholder="YYYY-MM"
          />
          <p className="text-[9px] text-muted-foreground">Leave empty for current month</p>
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Min Date</Label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => updateSettings('fromDate', e.target.value)}
            className="h-7 text-[10px] text-foreground bg-background"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Max Date</Label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => updateSettings('toDate', e.target.value)}
            className="h-7 text-[10px] text-foreground bg-background"
          />
        </div>
      </div>
    </div>
  );
};
