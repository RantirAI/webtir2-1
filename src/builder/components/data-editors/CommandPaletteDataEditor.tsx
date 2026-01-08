import React from "react";
import { useBuilderStore } from "../../store/useBuilderStore";
import { ComponentInstance } from "../../store/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface CommandPaletteDataEditorProps {
  instance: ComponentInstance;
}

export const CommandPaletteDataEditor: React.FC<CommandPaletteDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  // Child structure:
  // [0] TextInput (search input)
  // [1] Div (list) > [0] Div (item 1), [1] Div (item 2), [2] Div (item 3)

  const searchInput = instance.children?.[0];
  const listDiv = instance.children?.[1];
  const items = listDiv?.children || [];

  const updateInputPlaceholder = (childId: string, placeholder: string) => {
    updateInstance(childId, { props: { placeholder } });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Command Palette Settings</span>
      </div>

      {/* Search Input */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Search Placeholder</Label>
        <Input
          value={String(searchInput?.props?.placeholder || "")}
          onChange={(e) => searchInput && updateInputPlaceholder(searchInput.id, e.target.value)}
          className="h-7 text-[10px] text-foreground bg-background"
          placeholder="Type a command or search..."
        />
      </div>

      <Separator className="my-2" />

      {/* Command Items Info */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-muted-foreground">Command Items</span>
        <p className="text-[10px] text-muted-foreground">
          {items.length} command item{items.length !== 1 ? 's' : ''} configured. 
          Select individual items in the Navigator to customize them.
        </p>
      </div>
    </div>
  );
};
