import React from "react";
import { useBuilderStore } from "../../store/useBuilderStore";
import { ComponentInstance } from "../../store/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface InputFieldDataEditorProps {
  instance: ComponentInstance;
}

export const InputFieldDataEditor: React.FC<InputFieldDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  // Child structure:
  // [0] InputLabel
  // [1] TextInput

  const labelChild = instance.children?.[0];
  const inputChild = instance.children?.[1];

  const updateChildText = (childId: string, text: string) => {
    updateInstance(childId, { props: { children: text } });
  };

  const updateInputProp = (childId: string, propName: string, value: string | boolean) => {
    updateInstance(childId, { props: { [propName]: value } });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Input Field Settings</span>
      </div>

      {/* Label Section */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Label Text</Label>
        <Input
          value={String(labelChild?.props?.children || "")}
          onChange={(e) => labelChild && updateChildText(labelChild.id, e.target.value)}
          className="h-7 text-[10px] text-foreground bg-background"
          placeholder="Email"
        />
      </div>

      {/* Input Placeholder */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Placeholder</Label>
        <Input
          value={String(inputChild?.props?.placeholder || "")}
          onChange={(e) => inputChild && updateInputProp(inputChild.id, "placeholder", e.target.value)}
          className="h-7 text-[10px] text-foreground bg-background"
          placeholder="Enter your email"
        />
      </div>

      {/* Input Type */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Input Type</Label>
        <Select
          value={String(inputChild?.props?.type || "text")}
          onValueChange={(value) => inputChild && updateInputProp(inputChild.id, "type", value)}
        >
          <SelectTrigger className="h-7 text-[10px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="password">Password</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="tel">Phone</SelectItem>
            <SelectItem value="url">URL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Required Checkbox */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="input-required"
          checked={Boolean(inputChild?.props?.required)}
          onCheckedChange={(checked) => inputChild && updateInputProp(inputChild.id, "required", !!checked)}
          className="h-3 w-3"
        />
        <Label htmlFor="input-required" className="text-[10px] font-normal text-foreground">
          Required field
        </Label>
      </div>

      {/* Disabled Checkbox */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="input-disabled"
          checked={Boolean(inputChild?.props?.disabled)}
          onCheckedChange={(checked) => inputChild && updateInputProp(inputChild.id, "disabled", !!checked)}
          className="h-3 w-3"
        />
        <Label htmlFor="input-disabled" className="text-[10px] font-normal text-foreground">
          Disabled
        </Label>
      </div>
    </div>
  );
};
