import React from "react";
import { useBuilderStore } from "../../store/useBuilderStore";
import { ComponentInstance } from "../../store/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface LoginFormDataEditorProps {
  instance: ComponentInstance;
}

export const LoginFormDataEditor: React.FC<LoginFormDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  // Child structure:
  // [0] Heading (title)
  // [1] Text (description)
  // [2] Div (email group) > [0] InputLabel, [1] TextInput
  // [3] Div (password group) > [0] InputLabel, [1] TextInput
  // [4] Button (submit)

  const headingChild = instance.children?.[0];
  const descChild = instance.children?.[1];
  const emailGroup = instance.children?.[2];
  const passwordGroup = instance.children?.[3];
  const buttonChild = instance.children?.[4];

  const emailLabel = emailGroup?.children?.[0];
  const emailInput = emailGroup?.children?.[1];
  const passwordLabel = passwordGroup?.children?.[0];
  const passwordInput = passwordGroup?.children?.[1];

  const updateChildText = (childId: string, text: string) => {
    updateInstance(childId, { props: { children: text } });
  };

  const updateInputPlaceholder = (childId: string, placeholder: string) => {
    updateInstance(childId, { props: { placeholder } });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Login Form Settings</span>
      </div>

      {/* Header Section */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Title</Label>
        <Input
          value={String(headingChild?.props?.children || "")}
          onChange={(e) => headingChild && updateChildText(headingChild.id, e.target.value)}
          className="h-7 text-[10px] text-foreground bg-background"
          placeholder="Sign in"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Description</Label>
        <Input
          value={String(descChild?.props?.children || "")}
          onChange={(e) => descChild && updateChildText(descChild.id, e.target.value)}
          className="h-7 text-[10px] text-foreground bg-background"
          placeholder="Enter your credentials..."
        />
      </div>

      <Separator className="my-2" />

      {/* Email Field Section */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-muted-foreground">Email Field</span>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Label</Label>
          <Input
            value={String(emailLabel?.props?.children || "")}
            onChange={(e) => emailLabel && updateChildText(emailLabel.id, e.target.value)}
            className="h-7 text-[10px] text-foreground bg-background"
            placeholder="Email"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Placeholder</Label>
          <Input
            value={String(emailInput?.props?.placeholder || "")}
            onChange={(e) => emailInput && updateInputPlaceholder(emailInput.id, e.target.value)}
            className="h-7 text-[10px] text-foreground bg-background"
            placeholder="name@example.com"
          />
        </div>
      </div>

      <Separator className="my-2" />

      {/* Password Field Section */}
      <div className="space-y-2">
        <span className="text-[10px] font-medium text-muted-foreground">Password Field</span>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Label</Label>
          <Input
            value={String(passwordLabel?.props?.children || "")}
            onChange={(e) => passwordLabel && updateChildText(passwordLabel.id, e.target.value)}
            className="h-7 text-[10px] text-foreground bg-background"
            placeholder="Password"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Placeholder</Label>
          <Input
            value={String(passwordInput?.props?.placeholder || "")}
            onChange={(e) => passwordInput && updateInputPlaceholder(passwordInput.id, e.target.value)}
            className="h-7 text-[10px] text-foreground bg-background"
            placeholder="••••••••"
          />
        </div>
      </div>

      <Separator className="my-2" />

      {/* Button Section */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Button Text</Label>
        <Input
          value={String(buttonChild?.props?.children || "")}
          onChange={(e) => buttonChild && updateChildText(buttonChild.id, e.target.value)}
          className="h-7 text-[10px] text-foreground bg-background"
          placeholder="Sign in"
        />
      </div>
    </div>
  );
};
