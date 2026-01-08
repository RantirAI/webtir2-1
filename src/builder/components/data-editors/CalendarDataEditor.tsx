import React from "react";
import { useBuilderStore } from "../../store/useBuilderStore";
import { ComponentInstance } from "../../store/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface CalendarDataEditorProps {
  instance: ComponentInstance;
}

export const CalendarDataEditor: React.FC<CalendarDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  // Child structure:
  // [0] Div (header) > [0] Div (nav) > [0] Button (prev), [1] Text (month), [2] Button (next)
  // [1] Div (grid)

  const headerDiv = instance.children?.[0];
  const navDiv = headerDiv?.children?.[0];
  const prevButton = navDiv?.children?.[0];
  const monthText = navDiv?.children?.[1];
  const nextButton = navDiv?.children?.[2];

  const updateChildText = (childId: string, text: string) => {
    updateInstance(childId, { props: { children: text } });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Calendar Settings</span>
      </div>

      {/* Month Display */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Month/Year Text</Label>
        <Input
          value={String(monthText?.props?.children || "")}
          onChange={(e) => monthText && updateChildText(monthText.id, e.target.value)}
          className="h-7 text-[10px] text-foreground bg-background"
          placeholder="December 2024"
        />
      </div>

      <Separator className="my-2" />

      {/* Navigation Buttons */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-muted-foreground">Navigation</span>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Previous Button</Label>
          <Input
            value={String(prevButton?.props?.children || "")}
            onChange={(e) => prevButton && updateChildText(prevButton.id, e.target.value)}
            className="h-7 text-[10px] text-foreground bg-background"
            placeholder="‹"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Next Button</Label>
          <Input
            value={String(nextButton?.props?.children || "")}
            onChange={(e) => nextButton && updateChildText(nextButton.id, e.target.value)}
            className="h-7 text-[10px] text-foreground bg-background"
            placeholder="›"
          />
        </div>
      </div>
    </div>
  );
};
