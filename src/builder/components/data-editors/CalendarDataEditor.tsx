import React from "react";
import { useBuilderStore } from "../../store/useBuilderStore";
import { ComponentInstance } from "../../store/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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

const WEEKDAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export const CalendarDataEditor: React.FC<CalendarDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  const settings = instance.props?.calendarSettings || {};
  
  // Selection settings
  const mode = settings.mode || 'single';
  const required = settings.required || false;
  
  // Layout settings
  const numberOfMonths = settings.numberOfMonths || 1;
  const captionLayout = settings.captionLayout || 'buttons';
  const fixedWeeks = settings.fixedWeeks || false;
  const reverseMonths = settings.reverseMonths || false;
  const pagedNavigation = settings.pagedNavigation || false;
  
  // Display settings
  const showOutsideDays = settings.showOutsideDays !== false;
  const showWeekNumber = settings.showWeekNumber || false;
  const ISOWeek = settings.ISOWeek || false;
  const disableNavigation = settings.disableNavigation || false;
  
  // Week settings
  const weekStartsOn = settings.weekStartsOn ?? 0;
  const disabledWeekdays: number[] = settings.disabledWeekdays || [];
  
  // Date constraints
  const defaultMonth = settings.defaultMonth || '';
  const fromDate = settings.fromDate || '';
  const toDate = settings.toDate || '';
  const today = settings.today || '';

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

  const toggleDisabledWeekday = (day: number) => {
    const current = [...disabledWeekdays];
    const index = current.indexOf(day);
    if (index === -1) {
      current.push(day);
    } else {
      current.splice(index, 1);
    }
    updateSettings('disabledWeekdays', current);
  };

  return (
    <div className="space-y-3">
      {/* Slot Architecture Info */}
      <div className="p-2 bg-muted/30 rounded border border-border">
        <p className="text-[10px] text-muted-foreground">
          Calendar has three slots: <strong>Header</strong>, <strong>Day Picker</strong>, and <strong>Footer</strong>. 
          Use the Navigator panel to add/remove content in the Header and Footer slots.
        </p>
      </div>

      {/* SELECTION SECTION */}
      <div className="space-y-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
          Selection
        </span>
        
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Mode</Label>
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
        
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-medium text-foreground">Required</Label>
          <Switch
            checked={required}
            onCheckedChange={(checked) => updateSettings('required', checked)}
            className="scale-75"
          />
        </div>
      </div>

      <Separator className="my-2" />

      {/* LAYOUT SECTION */}
      <div className="space-y-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
          Layout
        </span>
        
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
        
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Caption Layout</Label>
          <Select value={captionLayout} onValueChange={(v) => updateSettings('captionLayout', v)}>
            <SelectTrigger className="h-7 text-[10px]">
              <SelectValue placeholder="Select layout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buttons">Buttons</SelectItem>
              <SelectItem value="dropdown">Dropdown</SelectItem>
              <SelectItem value="dropdown-months">Dropdown Months</SelectItem>
              <SelectItem value="dropdown-years">Dropdown Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-medium text-foreground">Fixed Weeks</Label>
          <Switch
            checked={fixedWeeks}
            onCheckedChange={(checked) => updateSettings('fixedWeeks', checked)}
            className="scale-75"
          />
        </div>
        
        {numberOfMonths > 1 && (
          <>
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-medium text-foreground">Reverse Months</Label>
              <Switch
                checked={reverseMonths}
                onCheckedChange={(checked) => updateSettings('reverseMonths', checked)}
                className="scale-75"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-medium text-foreground">Paged Navigation</Label>
              <Switch
                checked={pagedNavigation}
                onCheckedChange={(checked) => updateSettings('pagedNavigation', checked)}
                className="scale-75"
              />
            </div>
          </>
        )}
      </div>

      <Separator className="my-2" />

      {/* DISPLAY SECTION */}
      <div className="space-y-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
          Display
        </span>
        
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
        
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-medium text-foreground">ISO Week</Label>
          <Switch
            checked={ISOWeek}
            onCheckedChange={(checked) => updateSettings('ISOWeek', checked)}
            className="scale-75"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-medium text-foreground">Show Navigation</Label>
          <Switch
            checked={!disableNavigation}
            onCheckedChange={(checked) => updateSettings('disableNavigation', !checked)}
            className="scale-75"
          />
        </div>
      </div>

      <Separator className="my-2" />

      {/* WEEK SETTINGS SECTION */}
      <div className="space-y-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
          Week Settings
        </span>
        
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
        
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Disabled Weekdays</Label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => (
              <div key={day.value} className="flex items-center gap-1">
                <Checkbox
                  id={`disabled-day-${day.value}`}
                  checked={disabledWeekdays.includes(day.value)}
                  onCheckedChange={() => toggleDisabledWeekday(day.value)}
                  className="h-3 w-3"
                />
                <Label 
                  htmlFor={`disabled-day-${day.value}`} 
                  className="text-[9px] text-muted-foreground cursor-pointer"
                >
                  {day.label}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground">Check days to disable them</p>
        </div>
      </div>

      <Separator className="my-2" />

      {/* DATE CONSTRAINTS SECTION */}
      <div className="space-y-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
          Date Constraints
        </span>
        
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
        
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Today Override</Label>
          <Input
            type="date"
            value={today}
            onChange={(e) => updateSettings('today', e.target.value)}
            className="h-7 text-[10px] text-foreground bg-background"
          />
          <p className="text-[9px] text-muted-foreground">Override which date is considered "today"</p>
        </div>
      </div>
    </div>
  );
};
