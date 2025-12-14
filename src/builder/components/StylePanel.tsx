import React, { useState, useEffect } from "react";
import { useBuilderStore } from "../store/useBuilderStore";
import { useStyleStore } from "../store/useStyleStore";
import { PseudoState, ComponentType } from "../store/types";
import { componentSupportsPropertyGroup, showBackgroundImageControl } from "../utils/componentPropertyMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Paintbrush,
  Plus,
  Square,
  Type,
  Heading as HeadingIcon,
  MousePointerClick,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  ChevronDown,
  ChevronRight,
  Settings as SettingsIcon,
  Zap,
  Database,
  RotateCcw,
  Info,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Box,
  LayoutList,
  LayoutGrid,
  Minus,
  EyeOff,
  FileText,
  Home,
  Copy,
  Trash2,
  Pencil,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { componentRegistry } from "../primitives/registry";
import { UnitInput } from "./UnitInput";
import { ColorPicker } from "./ColorPicker";
import { SpacingControl } from "./SpacingControl";
import { FontPicker } from "./FontPicker";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ClassSelector } from "./ClassSelector";
import { ImageUpload } from "./ImageUpload";
import { VideoUpload } from "./VideoUpload";
import { ShadowManager } from "./ShadowManager";
import { ShadowItem } from "../store/types";
import { compileMetadataToCSS } from "../utils/cssCompiler";
import { applyHeadingTypography } from "../utils/headingTypography";
import { AttributeRow } from "./AttributeRow";
import { ComponentInstance } from "../store/types";
import { AccordionDataEditor } from "./data-editors/AccordionDataEditor";
import { CarouselDataEditor } from "./data-editors/CarouselDataEditor";
import { TabsDataEditor } from "./data-editors/TabsDataEditor";
import { TableDataEditor } from "./data-editors/TableDataEditor";
import { SliderDataEditor } from "./data-editors/SliderDataEditor";
import { AlertDialogDataEditor } from "./data-editors/AlertDialogDataEditor";
import { AvatarDataEditor } from "./data-editors/AvatarDataEditor";
import { BadgeDataEditor } from "./data-editors/BadgeDataEditor";
import { BreadcrumbDataEditor } from "./data-editors/BreadcrumbDataEditor";
import { ProgressDataEditor } from "./data-editors/ProgressDataEditor";
import { TooltipDataEditor } from "./data-editors/TooltipDataEditor";
import { PopoverDataEditor } from "./data-editors/PopoverDataEditor";
import { DrawerDataEditor } from "./data-editors/DrawerDataEditor";
import { SheetDataEditor } from "./data-editors/SheetDataEditor";
import { SwitchDataEditor } from "./data-editors/SwitchDataEditor";
import { ToggleDataEditor } from "./data-editors/ToggleDataEditor";
import { ToggleGroupDataEditor } from "./data-editors/ToggleGroupDataEditor";
import { AlertDataEditor } from "./data-editors/AlertDataEditor";
import { PaginationDataEditor } from "./data-editors/PaginationDataEditor";
import { OTPInputDataEditor } from "./data-editors/OTPInputDataEditor";
import { AccordionStyleEditor } from "./style-editors/AccordionStyleEditor";
import { BadgeStyleEditor } from "./style-editors/BadgeStyleEditor";
import "../styles/style-panel.css";
import "../styles/tokens.css";
// Helper to find path from root to an instance
const findPathToInstance = (
  root: ComponentInstance | null,
  targetId: string,
  path: ComponentInstance[] = [],
): ComponentInstance[] | null => {
  if (!root) return null;
  if (root.id === targetId) return [...path, root];

  for (const child of root.children || []) {
    const result = findPathToInstance(child, targetId, [...path, root]);
    if (result) return result;
  }
  return null;
};

// Component to show "Relative to" indicator for positioned elements
const PositionRelativeToIndicator: React.FC<{ instanceId: string; positionType: string }> = ({
  instanceId,
  positionType,
}) => {
  const { rootInstance } = useBuilderStore();
  const { styleSources, getComputedStyles } = useStyleStore();

  // Find the path from root to this instance
  const path = findPathToInstance(rootInstance, instanceId) || [];

  // Find the nearest positioned ancestor (not static)
  let relativeTo: { name: string; className: string } | null = null;

  if (positionType === "fixed") {
    relativeTo = { name: "Viewport", className: "" };
  } else if (positionType === "absolute") {
    // Walk up the path (excluding the current element) to find nearest positioned ancestor
    for (let i = path.length - 2; i >= 0; i--) {
      const ancestor = path[i];
      const ancestorStyles = getComputedStyles(ancestor.styleSourceIds || []);
      const ancestorPosition = ancestorStyles.position;

      if (ancestorPosition && ancestorPosition !== "static") {
        const className = ancestor.styleSourceIds?.[0] ? styleSources[ancestor.styleSourceIds[0]]?.name || "" : "";
        relativeTo = {
          name: ancestor.label || ancestor.type,
          className,
        };
        break;
      }
    }

    // If no positioned ancestor found, it's relative to body/page
    if (!relativeTo) {
      relativeTo = { name: "Body", className: "" };
    }
  }

  if (!relativeTo) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 8px",
        background: "hsl(var(--muted) / 0.5)",
        borderRadius: "4px",
        fontSize: "10px",
      }}
    >
      <span style={{ color: "hsl(var(--muted-foreground))" }}>Relative to:</span>
      <span
        style={{
          fontWeight: 500,
          color: relativeTo.className ? "hsl(217, 91%, 60%)" : "hsl(var(--foreground))",
        }}
      >
        {relativeTo.className ? `.${relativeTo.className}` : relativeTo.name}
      </span>
    </div>
  );
};

interface StylePanelProps {
  pages: string[];
  currentPage: string;
  pageNames: Record<string, string>;
  onPageChange: (page: string) => void;
  onPageNameChange: (pageId: string, newName: string) => void;
  onDeletePage: (pageId: string) => void;
  onDuplicatePage: (pageId: string) => void;
  onSetHomePage: (pageId: string) => void;
  homePage: string;
  isRulersView?: boolean;
}

export const StylePanel: React.FC<StylePanelProps> = ({
  pages,
  currentPage,
  pageNames,
  onPageChange,
  onPageNameChange,
  onDeletePage,
  onDuplicatePage,
  onSetHomePage,
  homePage,
  isRulersView = false,
}) => {
  const { getSelectedInstance, updateInstance } = useBuilderStore();
  const {
    setStyle,
    getComputedStyles,
    styleSources,
    createStyleSource,
    nextLocalClassName,
    renameStyleSource,
    deleteStyleSource,
    currentPseudoState,
    setCurrentPseudoState,
    resetStyles,
    setStyleMetadata,
    getStyleMetadata,
    getPropertyState,
  } = useStyleStore();
  const selectedInstance = getSelectedInstance();

  // ALL useState hooks MUST be at the top, before any conditional logic
  const [classNameInput, setClassNameInput] = useState("");
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const [activeTab, setActiveTab] = useState("style");
  const [activeClassIndex, setActiveClassIndex] = useState<number | null>(null);
  const [isMarginLinked, setIsMarginLinked] = useState(false);
  const [isPaddingLinked, setIsPaddingLinked] = useState(false);
  const [pageSettingsOpen, setPageSettingsOpen] = useState(false);
  const [selectedPageForSettings, setSelectedPageForSettings] = useState<string>("");
  const [pageMetaTitle, setPageMetaTitle] = useState("");
  const [pageMetaDescription, setPageMetaDescription] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [statusCode, setStatusCode] = useState("200");
  const [redirect, setRedirect] = useState("");
  const [language, setLanguage] = useState("en-US");

  // Initialize label input and active class when selectedInstance changes
  useEffect(() => {
    if (selectedInstance) {
      setLabelInput(selectedInstance.label || selectedInstance.type);
      setActiveTab("style"); // Reset to style tab when component is selected
      // Set active class to primary (index 0) when switching to a different component
      setActiveClassIndex(selectedInstance.styleSourceIds && selectedInstance.styleSourceIds.length > 0 ? 0 : null);
    }
  }, [selectedInstance?.id]);

  const [openSections, setOpenSections] = useState({
    layout: true,
    accordionStyles: true,
    badgeStyles: true,
    space: true,
    size: true,
    position: false,
    typography: false,
    backgrounds: false,
    borders: false,
    effects: false,
    visibility: true,
    dropdownSettings: true,
    customAttributes: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Get the active style source ID based on activeClassIndex
  const activeStyleSourceId =
    selectedInstance && selectedInstance.styleSourceIds && activeClassIndex !== null
      ? selectedInstance.styleSourceIds[activeClassIndex]
      : selectedInstance?.styleSourceIds?.[0];

  // Get computed styles - always show the full cascade (all classes combined)
  const computedStyles = selectedInstance ? getComputedStyles(selectedInstance.styleSourceIds || []) : {};

  // Helper to check if a property is inherited from a parent class
  const getPropertySource = (property: string): "active" | "inherited" | "none" => {
    if (!selectedInstance || !activeStyleSourceId) return "none";

    // Check if defined on the active class - only return active if value is non-empty
    const activeValue = getPropertyState(activeStyleSourceId, property);
    if (activeValue !== undefined && activeValue !== "" && activeValue !== "auto" && activeValue !== "none")
      return "active";

    // Check if it exists in computed (inherited from parent classes)
    const computedValue = (computedStyles as any)[property];
    if (computedValue !== undefined && computedValue !== "" && computedValue !== "auto" && computedValue !== "none")
      return "inherited";

    return "none";
  };

  // Helper to get text color class based on property source
  const getPropertyColorClass = (property: string): string => {
    const source = getPropertySource(property);
    if (source === "active") return "text-blue-600 dark:text-blue-400";
    if (source === "inherited") return "text-yellow-600 dark:text-yellow-400";
    return ""; // grey/default - no color for empty/reset values
  };

  // Helper component to render property indicator dot
  const PropertyIndicator: React.FC<{ property: string }> = ({ property }) => {
    const source = getPropertySource(property);
    // Don't show indicator for empty/reset/default values
    if (source === "none") return null;

    const color = source === "active" ? "hsl(217, 91%, 60%)" : "hsl(45, 93%, 47%)";

    return (
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: color,
          display: "inline-block",
          marginLeft: "4px",
        }}
      />
    );
  };

  // Sync label input to selected instance (unconditional hook placement)
  useEffect(() => {
    if (selectedInstance) {
      setLabelInput(selectedInstance.label || selectedInstance.type);
    }
  }, [selectedInstance?.id, selectedInstance?.label, selectedInstance?.type]);

  const handlePageClick = (page: string) => {
    setSelectedPageForSettings(page);
    setPageSettingsOpen(true);
  };

  const safePages = Array.isArray(pages) ? pages : [];

  if (!selectedInstance) {
    return (
      <div
        className={`w-64 h-full bg-background border border-border shadow-xl flex flex-col overflow-hidden backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 ${isRulersView ? "rounded-none p-2" : "rounded-lg"}`}
      >
        <Tabs defaultValue="styles" className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-transparent h-10 p-1 gap-1">
            <TabsTrigger
              value="styles"
              className="gap-1 text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none"
            >
              <Paintbrush className="w-3 h-3" />
              Styles
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="gap-1 text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none"
            >
              <Database className="w-3 h-3" />
              Data
            </TabsTrigger>
            <TabsTrigger
              value="pages"
              className="gap-1 text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none"
            >
              <FileText className="w-3 h-3" />
              Pages
            </TabsTrigger>
          </TabsList>
          <TabsContent value="styles" className="flex-1 m-0 p-3 overflow-y-auto">
            <div className="text-xs text-muted-foreground text-center">Select an element to edit its style</div>
          </TabsContent>
          <TabsContent value="data" className="flex-1 m-0 p-3 overflow-y-auto">
            <div className="text-xs text-muted-foreground text-center">
              Select an element to configure data settings
            </div>
          </TabsContent>
          <TabsContent value="pages" className="flex-1 m-0 p-0 overflow-y-auto">
            <div className="p-1.5">
              {safePages.map((page) => (
                <div
                  key={page}
                  className={`flex items-center justify-between p-1.5 rounded cursor-pointer hover:bg-accent ${
                    currentPage === page ? "bg-accent" : ""
                  }`}
                  onClick={() => handlePageClick(page)}
                >
                  <div className="flex items-center gap-2">
                    {homePage === page ? <Home className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4" />}
                    <span className="text-xs">{pageNames[page] || page}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Page Settings Drawer - also available when no element selected */}
        <Sheet open={pageSettingsOpen} onOpenChange={setPageSettingsOpen}>
          <SheetContent side="right" className="w-[340px] overflow-y-auto p-4">
            <SheetHeader className="pb-3 space-y-1">
              <SheetTitle className="text-sm">Page Settings</SheetTitle>
              <SheetDescription className="text-xs">Configure settings for this page</SheetDescription>
            </SheetHeader>
            <div className="mt-3 space-y-3">
              {/* Page Name */}
              <div className="space-y-1.5">
                <Label htmlFor="page-name-no-sel" className="text-xs">
                  Page Name
                </Label>
                <Input
                  id="page-name-no-sel"
                  value={pageNames[selectedPageForSettings] || ""}
                  onChange={(e) => onPageNameChange(selectedPageForSettings, e.target.value)}
                  className="h-7 text-xs"
                />
                <div className="flex items-center gap-2 mt-1.5">
                  <Checkbox
                    id="home-page-no-sel"
                    checked={homePage === selectedPageForSettings}
                    onCheckedChange={(checked) => {
                      if (checked) onSetHomePage(selectedPageForSettings);
                    }}
                    className="h-3 w-3"
                  />
                  <Label htmlFor="home-page-no-sel" className="text-xs font-normal">
                    Make "{pageNames[selectedPageForSettings]}" the home page
                  </Label>
                </div>
              </div>

              {/* Path */}
              <div className="space-y-1.5">
                <Label htmlFor="page-path-no-sel" className="text-xs">
                  Path
                </Label>
                <Input
                  id="page-path-no-sel"
                  value={`/${pageNames[selectedPageForSettings]?.toLowerCase().replace(/\s+/g, "-") || ""}`}
                  disabled
                  className="bg-muted h-7 text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-1.5 h-7 text-xs"
                  onClick={() => {
                    onDuplicatePage(selectedPageForSettings);
                    setPageSettingsOpen(false);
                  }}
                >
                  <Copy className="w-3 h-3" />
                  Duplicate
                </Button>
                <Button
                  variant="destructive"
                  className="flex items-center gap-1.5 h-7 text-xs"
                  onClick={() => {
                    onDeletePage(selectedPageForSettings);
                    setPageSettingsOpen(false);
                  }}
                  disabled={safePages.length === 1}
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  const ensurePrimaryClass = () => {
    if (!selectedInstance.styleSourceIds || selectedInstance.styleSourceIds.length === 0) {
      // Auto-create class on first style edit (Webflow pattern)
      const name = nextLocalClassName(selectedInstance.type);
      const id = createStyleSource("local", name);

      // Apply default styles from registry on first class creation
      const meta = componentRegistry[selectedInstance.type];
      if (meta?.defaultStyles) {
        Object.entries(meta.defaultStyles).forEach(([property, value]) => {
          setStyle(id, property, value);
        });
      }

      updateInstance(selectedInstance.id, { styleSourceIds: [id] });
      return id;
    }
    return selectedInstance.styleSourceIds[0];
  };

  const updateStyle = (property: string, value: string) => {
    // Strict inheritance rules: Only allow editing the LAST class in the chain
    if (!selectedInstance.styleSourceIds || selectedInstance.styleSourceIds.length === 0) {
      // No classes exist, create primary class
      const targetClassId = ensurePrimaryClass();
      setStyle(targetClassId, property, value);
      return;
    }

    // Get the last class in the chain (the only editable one)
    const lastClassIndex = selectedInstance.styleSourceIds.length - 1;
    const lastClassId = selectedInstance.styleSourceIds[lastClassIndex];

    // Check if trying to edit a class that's not the last one
    if (activeClassIndex !== null && activeClassIndex !== lastClassIndex) {
      const { isClassEditable } = useStyleStore.getState();
      if (!isClassEditable(selectedInstance.styleSourceIds[activeClassIndex])) {
        console.warn(
          `Cannot modify Class ${activeClassIndex + 1} - it has dependent classes. Only Class ${lastClassIndex + 1} can be edited.`,
        );
        // Automatically switch to the last class
        setActiveClassIndex(lastClassIndex);
      }
    }

    // Always target the last class in the chain
    setStyle(lastClassId, property, value);

    // Ensure we're viewing the last class
    if (activeClassIndex !== lastClassIndex) {
      setActiveClassIndex(lastClassIndex);
    }
  };

  const handleAddClass = (className: string) => {
    const safeName = className
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-");
    if (!safeName) return;

    // Check if class already exists in the style store
    const existingClassId = Object.entries(styleSources).find(
      ([_, source]) => source.name === safeName && source.type === "local",
    )?.[0];

    let classIdToAdd: string;

    if (existingClassId) {
      // Reuse existing class
      classIdToAdd = existingClassId;
    } else {
      // Create new class
      classIdToAdd = createStyleSource("local", safeName);
    }

    // Add to instance's styleSourceIds if not already present
    const currentIds = selectedInstance.styleSourceIds || [];
    if (!currentIds.includes(classIdToAdd)) {
      const newStyleSourceIds = [...currentIds, classIdToAdd];
      updateInstance(selectedInstance.id, { styleSourceIds: newStyleSourceIds });
      // Set this as the active class
      setActiveClassIndex(newStyleSourceIds.length - 1);
    }
  };

  const handleRemoveClass = (classId: string) => {
    const newStyleSourceIds = selectedInstance.styleSourceIds?.filter((id) => id !== classId) || [];
    updateInstance(selectedInstance.id, { styleSourceIds: newStyleSourceIds });

    // Reset active class index if needed
    if (activeClassIndex !== null && activeClassIndex >= newStyleSourceIds.length) {
      setActiveClassIndex(newStyleSourceIds.length > 0 ? 0 : null);
    }
  };

  const handleClassClick = (classId: string, index: number) => {
    setActiveClassIndex(index);
  };

  const handleResetStyles = () => {
    const primaryClassId = selectedInstance.styleSourceIds?.[0];
    if (primaryClassId) {
      resetStyles(primaryClassId);
    }
  };

  const classes =
    selectedInstance.styleSourceIds
      ?.map((id, index) => ({
        id,
        name: styleSources[id]?.name || id,
        isPrimary: index === 0,
      }))
      .filter(Boolean) || [];

  const isFlexDisplay = computedStyles.display === "flex";
  const isGridDisplay = computedStyles.display === "grid";

  // Calculate dimensions
  const width = computedStyles.width || "auto";
  const height = computedStyles.height || "auto";
  const dimensionText = `${width} × ${height}`;

  // Count children components
  const childrenCount = selectedInstance?.children?.length || 0;

  const handleLabelSave = () => {
    if (labelInput.trim()) {
      updateInstance(selectedInstance.id, { label: labelInput.trim() });
    }
    setIsEditingLabel(false);
  };

  const getComponentIcon = (type: string) => {
    const iconName = componentRegistry[type]?.icon;
    const iconMap: Record<string, React.ReactNode> = {
      Square: <Square className="w-4 h-4" />,
      Type: <Type className="w-4 h-4" />,
      Heading: <HeadingIcon className="w-4 h-4" />,
      MousePointerClick: <MousePointerClick className="w-4 h-4" />,
      Image: <ImageIcon className="w-4 h-4" />,
      Link: <LinkIcon className="w-4 h-4" />,
    };
    return iconMap[iconName || ""] || <Square className="w-4 h-4" />;
  };

  const hasStylesInSection = (properties: string[]) => {
    // Check the active class or primary class
    const targetClassId =
      activeClassIndex !== null && activeClassIndex >= 0 && selectedInstance.styleSourceIds
        ? selectedInstance.styleSourceIds[activeClassIndex]
        : selectedInstance.styleSourceIds?.[0];

    if (!targetClassId) return false;
    const { styles, currentBreakpointId, currentPseudoState, styleSources } = useStyleStore.getState();
    const name = styleSources[targetClassId]?.name?.trim();
    if (!name) return false;

    // Check if any property has an explicit value set for this class at this breakpoint and state
    return properties.some((prop) => {
      const key = `${targetClassId}:${currentBreakpointId}:${currentPseudoState}:${prop}`;
      const val = styles[key];
      return (
        val !== undefined &&
        val !== "" &&
        val !== "initial" &&
        val !== "inherit" &&
        val !== "normal" &&
        val !== "auto" &&
        val !== "none"
      );
    });
  };

  const clearSectionStyles = (properties: string[]) => {
    const targetClassId =
      activeClassIndex !== null && activeClassIndex >= 0 && selectedInstance.styleSourceIds
        ? selectedInstance.styleSourceIds[activeClassIndex]
        : selectedInstance.styleSourceIds?.[0];

    if (!targetClassId) return;
    properties.forEach((prop) => {
      setStyle(targetClassId, prop, "");
    });
  };

  const AccordionSection: React.FC<{
    title: string;
    section: keyof typeof openSections;
    children?: React.ReactNode;
    hasAddButton?: boolean;
    indicator?: boolean;
    properties?: string[];
  }> = ({ title, section, children, hasAddButton, indicator, properties }) => {
    const hasStyles = properties ? hasStylesInSection(properties) : indicator;
    const isPrimary = activeClassIndex === null || activeClassIndex === 0;
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div className="Section">
        <div
          className="SectionHeader group"
          onClick={() => toggleSection(section)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <span className="SectionTitle">{title}</span>
            {hasStyles && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "hsl(217, 91%, 60%)",
                  }}
                />
                {isHovered && properties && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearSectionStyles(properties);
                          }}
                          className="w-4 h-4 flex items-center justify-center rounded hover:bg-accent transition-colors"
                          style={{ padding: "2px" }}
                        >
                          <RotateCcw className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-popover border border-border">
                        <span className="text-xs">Reset {title} styles</span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>
          {hasAddButton && <Plus className={`SectionIcon ${openSections[section] ? "open" : ""}`} size={18} />}
        </div>
        {openSections[section] && children && <div className="SectionContent">{children}</div>}
      </div>
    );
  };

  return (
    <div
      className={`w-64 h-full bg-background border border-border shadow-xl flex flex-col overflow-hidden backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 ${isRulersView ? "rounded-none p-2" : "rounded-lg"}`}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-transparent h-10 p-1 gap-1 flex-shrink-0">
          <TabsTrigger
            value="style"
            className="text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none flex items-center gap-1"
          >
            <Paintbrush className="w-3 h-3" />
            Style
          </TabsTrigger>
          <TabsTrigger
            value="data"
            className="text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none flex items-center gap-1"
          >
            <Database className="w-3 h-3" />
            Data
          </TabsTrigger>
          <TabsTrigger
            value="pages"
            className="text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            Pages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="flex-1 min-h-0 m-0 overflow-y-auto overflow-x-hidden">
          <div className="StylePanel">
            <div
              style={{
                padding: "var(--space-1) var(--space-2)",
                borderBottom: "1px solid hsl(var(--border))",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <span className="text-foreground">{getComponentIcon(selectedInstance.type)}</span>
                {isEditingLabel ? (
                  <input
                    type="text"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onBlur={handleLabelSave}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleLabelSave();
                      if (e.key === "Escape") {
                        setLabelInput(selectedInstance.label || selectedInstance.type);
                        setIsEditingLabel(false);
                      }
                    }}
                    autoFocus
                    className="Input"
                    style={{ fontSize: "11px", fontWeight: 600, padding: "2px 4px", flex: 1 }}
                  />
                ) : (
                  <span
                    style={{ fontSize: "11px", fontWeight: 600, cursor: "pointer", flex: 1 }}
                    className="text-foreground hover:text-primary"
                    onClick={() => setIsEditingLabel(true)}
                  >
                    {selectedInstance.label || selectedInstance.type}
                  </span>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    fontSize: "9px",
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  <span>{dimensionText}</span>
                  {childrenCount > 0 && (
                    <>
                      <span>•</span>
                      <span>
                        {childrenCount} {childrenCount === 1 ? "child" : "children"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Class Selector - Multi-class support */}
            <div style={{ padding: "var(--space-3)", borderBottom: "1px solid hsl(var(--border))" }}>
              {/* Row 1: Auto-class preview and Reset button */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "var(--space-2)",
                }}
              >
                <ClassSelector
                  selectedClasses={[]}
                  onAddClass={() => {}}
                  onRemoveClass={() => {}}
                  onClassClick={() => {}}
                  activeClassIndex={null}
                  componentType={selectedInstance.type}
                  showAutoClassPreview={true}
                  previewOnly={true}
                />
                {classes.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 text-foreground hover:text-primary flex-shrink-0"
                          onClick={handleResetStyles}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reset styles to default</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* Row 2: Class input with dropdown */}
              <div style={{ display: "flex", gap: "4px", alignItems: "stretch" }}>
                <div style={{ flex: 1 }}>
                  <ClassSelector
                    selectedClasses={classes}
                    onAddClass={handleAddClass}
                    onRemoveClass={handleRemoveClass}
                    onClassClick={handleClassClick}
                    activeClassIndex={activeClassIndex}
                    componentType={selectedInstance.type}
                    showAutoClassPreview={false}
                  />
                </div>

                {/* State dropdown next to input, same height */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-[36px] w-[28px] p-0 justify-center border border-border flex-shrink-0 ${currentPseudoState !== "default" ? "bg-green-500/10 border-green-500/50" : ""}`}
                      title={`State: ${currentPseudoState}`}
                    >
                      <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="bottom"
                    className="w-28 bg-popover border border-border z-[10000]"
                  >
                    {(["default", "hover", "focus", "active", "visited"] as const).map((state) => {
                      // Check if this state has any styles
                      const hasStyles = selectedInstance.styleSourceIds?.some((classId) => {
                        const { styles, currentBreakpointId } = useStyleStore.getState();
                        return Object.keys(styles).some((key) => {
                          const [keyClassId, keyBreakpoint, keyState] = key.split(":");
                          return keyClassId === classId && keyBreakpoint === currentBreakpointId && keyState === state;
                        });
                      });

                      return (
                        <DropdownMenuItem
                          key={state}
                          onClick={() => setCurrentPseudoState(state as PseudoState)}
                          className="flex items-center justify-between text-xs py-1"
                        >
                          <span className="capitalize">{state}</span>
                          {hasStyles && state !== "default" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {classes.length === 0 && (
                <div style={{ fontSize: "10px", color: "hsl(var(--muted-foreground))", marginTop: "var(--space-1)" }}>
                  No classes assigned
                </div>
              )}
            </div>

            {/* Layout */}
            {componentSupportsPropertyGroup(selectedInstance.type as ComponentType, "layout") && (
              <AccordionSection
                title="Layout"
                section="layout"
                properties={[
                  "display",
                  "flexDirection",
                  "justifyContent",
                  "alignItems",
                  "flexWrap",
                  "gap",
                  "gridTemplateColumns",
                  "gridTemplateRows",
                  "gridAutoFlow",
                  "placeItems",
                  "placeContent",
                ]}
              >
                <div className="Col" style={{ gap: "var(--space-2)" }}>
                  {/* Display Type with Icon Buttons */}
                  <div className="Col" style={{ gap: "var(--space-1)" }}>
                    <label className="Label" style={{ fontWeight: 600, fontSize: "10px" }}>
                      Display
                    </label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(6, 32px)",
                        gap: "2px",
                        justifyContent: "start",
                      }}
                    >
                      <button
                        className={`w-8 h-8 flex items-center justify-center rounded ${computedStyles.display === "block" ? "bg-accent border-2 border-primary" : "border border-input bg-[#F5F5F5] dark:bg-[#09090b] hover:bg-accent"}`}
                        onClick={() => updateStyle("display", "block")}
                        title="Block"
                      >
                        <Box className="w-3.5 h-3.5 text-foreground" />
                      </button>
                      <button
                        className={`w-8 h-8 flex items-center justify-center rounded ${computedStyles.display === "flex" ? "bg-accent border-2 border-primary" : "border border-input bg-[#F5F5F5] dark:bg-[#09090b] hover:bg-accent"}`}
                        onClick={() => updateStyle("display", "flex")}
                        title="Flex"
                      >
                        <LayoutList className="w-3.5 h-3.5 text-foreground" />
                      </button>
                      <button
                        className={`w-8 h-8 flex items-center justify-center rounded ${computedStyles.display === "grid" ? "bg-accent border-2 border-primary" : "border border-input bg-[#F5F5F5] dark:bg-[#09090b] hover:bg-accent"}`}
                        onClick={() => updateStyle("display", "grid")}
                        title="Grid"
                      >
                        <LayoutGrid className="w-3.5 h-3.5 text-foreground" />
                      </button>
                      <button
                        className={`w-8 h-8 flex items-center justify-center rounded ${computedStyles.display === "inline" ? "bg-accent border-2 border-primary" : "border border-input bg-[#F5F5F5] dark:bg-[#09090b] hover:bg-accent"}`}
                        onClick={() => updateStyle("display", "inline")}
                        title="Inline"
                      >
                        <Minus className="w-3.5 h-3.5 text-foreground" />
                      </button>
                      <button
                        className={`w-8 h-8 flex items-center justify-center rounded ${computedStyles.display === "inline-block" ? "bg-accent border-2 border-primary" : "border border-input bg-[#F5F5F5] dark:bg-[#09090b] hover:bg-accent"}`}
                        onClick={() => updateStyle("display", "inline-block")}
                        title="Inline Block"
                      >
                        <Square className="w-3.5 h-3.5 text-foreground" />
                      </button>
                      <button
                        className={`w-8 h-8 flex items-center justify-center rounded ${computedStyles.display === "none" ? "bg-accent border-2 border-primary" : "border border-input bg-[#F5F5F5] dark:bg-[#09090b] hover:bg-accent"}`}
                        onClick={() => updateStyle("display", "none")}
                        title="None"
                      >
                        <EyeOff className="w-3.5 h-3.5 text-foreground" />
                      </button>
                    </div>
                  </div>

                  {isFlexDisplay && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--space-2)",
                        marginTop: "var(--space-1)",
                      }}
                    >
                      {/* Direction Icons */}
                      <div className="Col" style={{ gap: "var(--space-1)" }}>
                        <label className="Label" style={{ fontSize: "10px" }}>
                          Direction
                        </label>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 32px)",
                            gap: "2px",
                            justifyContent: "start",
                          }}
                        >
                          <button
                            className={`w-8 h-8 flex items-center justify-center rounded border ${computedStyles.flexDirection === "row" || !computedStyles.flexDirection ? "bg-accent border-2 border-primary" : "bg-[#F5F5F5] dark:bg-[#09090b] border-input hover:bg-accent"}`}
                            onClick={() => updateStyle("flexDirection", "row")}
                            title="Row"
                          >
                            <ArrowRight className="w-3.5 h-3.5 text-foreground" />
                          </button>
                          <button
                            className={`w-8 h-8 flex items-center justify-center rounded border ${computedStyles.flexDirection === "column" ? "bg-accent border-2 border-primary" : "bg-[#F5F5F5] dark:bg-[#09090b] border-input hover:bg-accent"}`}
                            onClick={() => updateStyle("flexDirection", "column")}
                            title="Column"
                          >
                            <ArrowDown className="w-3.5 h-3.5 text-foreground" />
                          </button>
                          <button
                            className={`w-8 h-8 flex items-center justify-center rounded border ${computedStyles.flexDirection === "row-reverse" ? "bg-accent border-2 border-primary" : "bg-[#F5F5F5] dark:bg-[#09090b] border-input hover:bg-accent"}`}
                            onClick={() => updateStyle("flexDirection", "row-reverse")}
                            title="Row Reverse"
                          >
                            <ArrowLeft className="w-3.5 h-3.5 text-foreground" />
                          </button>
                          <button
                            className={`w-8 h-8 flex items-center justify-center rounded border ${computedStyles.flexDirection === "column-reverse" ? "bg-accent border-2 border-primary" : "bg-[#F5F5F5] dark:bg-[#09090b] border-input hover:bg-accent"}`}
                            onClick={() => updateStyle("flexDirection", "column-reverse")}
                            title="Column Reverse"
                          >
                            <ArrowUp className="w-3.5 h-3.5 text-foreground" />
                          </button>
                        </div>
                      </div>

                      {/* Alignment Section - 50/50 Grid Layout */}
                      <div className="Col" style={{ gap: "var(--space-1)" }}>
                        <label className="Label" style={{ fontSize: "10px" }}>
                          Align
                        </label>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "100px 1fr",
                            gap: "var(--space-2)",
                            alignItems: "start",
                          }}
                        >
                          {/* Left: Alignment Grid - 100px x 100px */}
                          <div
                            className="AlignGrid"
                            style={{
                              width: "100px",
                              height: "100px",
                            }}
                          >
                            {Array.from({ length: 9 }).map((_, i) => {
                              const row = Math.floor(i / 3);
                              const col = i % 3;

                              // Determine alignment states
                              const justifyMap = ["flex-start", "center", "flex-end"];
                              const alignMap = ["flex-start", "center", "flex-end"];

                              const isJustifyActive =
                                computedStyles.justifyContent === justifyMap[col] ||
                                (col === 0 && !computedStyles.justifyContent);
                              const isAlignActive =
                                computedStyles.alignItems === alignMap[row] ||
                                (row === 0 && !computedStyles.alignItems);

                              const isActive = isJustifyActive && isAlignActive;

                              return (
                                <button
                                  key={i}
                                  className="AlignBtn"
                                  data-state={isActive ? "on" : "off"}
                                  onClick={() => {
                                    updateStyle("justifyContent", justifyMap[col]);
                                    updateStyle("alignItems", alignMap[row]);
                                  }}
                                  onDoubleClick={() => {
                                    // Double click center button cycles through space options
                                    if (col === 1 && row === 1) {
                                      const current = computedStyles.justifyContent;
                                      if (current === "center") {
                                        updateStyle("justifyContent", "space-between");
                                        // Activate all three in row
                                        updateStyle("alignItems", alignMap[row]);
                                      } else if (current === "space-between")
                                        updateStyle("justifyContent", "space-around");
                                      else if (current === "space-around")
                                        updateStyle("justifyContent", "space-evenly");
                                      else updateStyle("justifyContent", "center");
                                    }
                                  }}
                                />
                              );
                            })}
                          </div>

                          {/* Right: Stacked Controls with X/Y labels and icons */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                            <div className="Col" style={{ gap: "2px" }}>
                              <label className="Label" style={{ fontSize: "9px", fontWeight: 600 }}>
                                x
                              </label>
                              <select
                                className="Select"
                                value={computedStyles.justifyContent || "flex-start"}
                                onChange={(e) => updateStyle("justifyContent", e.target.value)}
                                style={{ fontSize: "9px", padding: "2px 4px", height: "24px", maxWidth: "90px" }}
                              >
                                <option value="flex-start">← Left</option>
                                <option value="center">+ Center</option>
                                <option value="flex-end">→ Right</option>
                                <option value="space-between">↔ Space between</option>
                                <option value="space-around">⟷ Space around</option>
                                <option value="space-evenly">⟷ Evenly</option>
                              </select>
                            </div>

                            <div className="Col" style={{ gap: "2px" }}>
                              <label className="Label" style={{ fontSize: "9px", fontWeight: 600 }}>
                                y
                              </label>
                              <select
                                className="Select"
                                value={computedStyles.alignItems || "stretch"}
                                onChange={(e) => updateStyle("alignItems", e.target.value)}
                                style={{ fontSize: "9px", padding: "2px 4px", height: "24px", maxWidth: "90px" }}
                              >
                                <option value="flex-start">↑ Top</option>
                                <option value="center">+ Center</option>
                                <option value="flex-end">↓ Bottom</option>
                                <option value="space-between">↕ Space between</option>
                                <option value="space-around">⟷ Space around</option>
                                <option value="stretch">⇕ Stretch</option>
                                <option value="baseline">─ Baseline</option>
                              </select>
                            </div>

                            <div className="Col" style={{ gap: "2px" }}>
                              <label className="Label" style={{ fontSize: "9px" }}>
                                Gap
                              </label>
                              <UnitInput
                                value={computedStyles.gap || ""}
                                onChange={(val) => updateStyle("gap", val)}
                                placeholder="0px"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isGridDisplay && (
                    <div
                      style={{
                        marginTop: "var(--space-3)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--space-3)",
                      }}
                    >
                      {/* First 2x2 Grid: Cols, Rows, Template Cols, Template Rows */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                        <div className="Col" style={{ gap: "2px" }}>
                          <label className="Label" style={{ fontSize: "9px" }}>
                            Cols
                          </label>
                          <input
                            className="Input"
                            type="number"
                            min="1"
                            value={(() => {
                              const val = computedStyles.gridTemplateColumns || "";
                              const match = val.match(/repeat\((\d+),/);
                              return match ? parseInt(match[1]) : val.split(" ").filter(Boolean).length || 2;
                            })()}
                            onChange={(e) => {
                              const count = Math.max(1, parseInt(e.target.value) || 1);
                              updateStyle("gridTemplateColumns", `repeat(${count}, 1fr)`);
                            }}
                            style={{ textAlign: "center", height: "22px" }}
                          />
                        </div>

                        <div className="Col" style={{ gap: "2px" }}>
                          <label className="Label" style={{ fontSize: "9px" }}>
                            Rows
                          </label>
                          <input
                            className="Input"
                            type="number"
                            min="1"
                            value={(() => {
                              const val = computedStyles.gridTemplateRows || "";
                              const match = val.match(/repeat\((\d+),/);
                              return match ? parseInt(match[1]) : val.split(" ").filter(Boolean).length || 2;
                            })()}
                            onChange={(e) => {
                              const count = Math.max(1, parseInt(e.target.value) || 1);
                              updateStyle("gridTemplateRows", `repeat(${count}, auto)`);
                            }}
                            style={{ textAlign: "center", height: "22px" }}
                          />
                        </div>

                        <div className="Col" style={{ gap: "2px" }}>
                          <label className="Label" style={{ fontSize: "9px" }}>
                            Template Cols
                          </label>
                          <input
                            className="Input"
                            type="text"
                            placeholder="repeat(3, 1fr)"
                            value={computedStyles.gridTemplateColumns || ""}
                            onChange={(e) => updateStyle("gridTemplateColumns", e.target.value)}
                            style={{ height: "22px", fontSize: "9px" }}
                          />
                        </div>

                        <div className="Col" style={{ gap: "2px" }}>
                          <label className="Label" style={{ fontSize: "9px" }}>
                            Template Rows
                          </label>
                          <input
                            className="Input"
                            type="text"
                            placeholder="repeat(2, auto)"
                            value={computedStyles.gridTemplateRows || ""}
                            onChange={(e) => updateStyle("gridTemplateRows", e.target.value)}
                            style={{ height: "22px", fontSize: "9px" }}
                          />
                        </div>
                      </div>

                      {/* Second 2x2 Grid: Direction, Align, Gap, Place */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                        <div className="Col" style={{ gap: "2px" }}>
                          <label className="Label" style={{ fontSize: "9px" }}>
                            Direction
                          </label>
                          <select
                            className="Select"
                            value={computedStyles.gridAutoFlow || "row"}
                            onChange={(e) => updateStyle("gridAutoFlow", e.target.value)}
                            style={{ fontSize: "9px", padding: "2px 4px", height: "22px", maxWidth: "90px" }}
                          >
                            <option value="row">Row</option>
                            <option value="column">Column</option>
                            <option value="dense">Dense</option>
                            <option value="row dense">Row Dense</option>
                            <option value="column dense">Col Dense</option>
                          </select>
                        </div>

                        <div className="Col" style={{ gap: "2px" }}>
                          <label className="Label" style={{ fontSize: "9px" }}>
                            Align
                          </label>
                          <select
                            className="Select"
                            value={computedStyles.alignItems || "stretch"}
                            onChange={(e) => updateStyle("alignItems", e.target.value)}
                            style={{ fontSize: "9px", padding: "2px 4px", height: "22px", maxWidth: "90px" }}
                          >
                            <option value="stretch">Stretch</option>
                            <option value="start">Start</option>
                            <option value="center">Center</option>
                            <option value="end">End</option>
                          </select>
                        </div>

                        <div className="Col" style={{ gap: "2px" }}>
                          <label className="Label" style={{ fontSize: "9px" }}>
                            Gap
                          </label>
                          <UnitInput
                            value={computedStyles.gap || ""}
                            onChange={(val) => updateStyle("gap", val)}
                            placeholder="0px"
                          />
                        </div>

                        <div className="Col" style={{ gap: "2px" }}>
                          <label className="Label" style={{ fontSize: "9px" }}>
                            Place
                          </label>
                          <select
                            className="Select"
                            value={computedStyles.placeContent || "normal"}
                            onChange={(e) => updateStyle("placeContent", e.target.value)}
                            style={{ fontSize: "9px", padding: "2px 4px", height: "22px", maxWidth: "90px" }}
                          >
                            <option value="normal">Normal</option>
                            <option value="start">Start</option>
                            <option value="center">Center</option>
                            <option value="end">End</option>
                            <option value="space-between">Between</option>
                            <option value="space-around">Around</option>
                            <option value="space-evenly">Evenly</option>
                            <option value="stretch">Stretch</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionSection>
            )}

            {/* Accordion-specific Style Controls */}
            {selectedInstance.type === "Accordion" && (
              <AccordionSection title="Accordion Styles" section="accordionStyles" properties={[]}>
                <AccordionStyleEditor instance={selectedInstance} />
              </AccordionSection>
            )}

            {/* Badge-specific Style Controls */}
            {selectedInstance.type === "Badge" && (
              <AccordionSection title="Badge Styles" section="badgeStyles" properties={[]}>
                <BadgeStyleEditor instance={selectedInstance} />
              </AccordionSection>
            )}

            {/* Space */}
            {componentSupportsPropertyGroup(selectedInstance.type as ComponentType, "space") && (
              <AccordionSection
                title="Space"
                section="space"
                properties={[
                  "marginTop",
                  "marginRight",
                  "marginBottom",
                  "marginLeft",
                  "paddingTop",
                  "paddingRight",
                  "paddingBottom",
                  "paddingLeft",
                ]}
              >
                <SpacingControl
                  marginTop={computedStyles.marginTop}
                  marginRight={computedStyles.marginRight}
                  marginBottom={computedStyles.marginBottom}
                  marginLeft={computedStyles.marginLeft}
                  paddingTop={computedStyles.paddingTop}
                  paddingRight={computedStyles.paddingRight}
                  paddingBottom={computedStyles.paddingBottom}
                  paddingLeft={computedStyles.paddingLeft}
                  onUpdate={updateStyle}
                  styleSourceIds={selectedInstance.styleSourceIds}
                  activeClassIndex={activeClassIndex}
                  isMarginLinked={isMarginLinked}
                  isPaddingLinked={isPaddingLinked}
                  onMarginLinkChange={setIsMarginLinked}
                  onPaddingLinkChange={setIsPaddingLinked}
                />
              </AccordionSection>
            )}

            {/* Size */}
            {componentSupportsPropertyGroup(selectedInstance.type as ComponentType, "size") && (
              <AccordionSection
                title="Size"
                section="size"
                properties={["width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight"]}
              >
                <div className="Col" style={{ gap: "4px" }}>
                  {/* Width and Height */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "26px 1fr 26px 1fr",
                      gap: "2px",
                      alignItems: "center",
                    }}
                  >
                    <label className={`Label ${getPropertyColorClass("width")}`}>
                      Width
                      <PropertyIndicator property="width" />
                    </label>
                    <UnitInput
                      value={computedStyles.width || ""}
                      onChange={(val) => updateStyle("width", val)}
                      placeholder="Auto"
                    />
                    <label className={`Label ${getPropertyColorClass("height")}`}>
                      Height
                      <PropertyIndicator property="height" />
                    </label>
                    <UnitInput
                      value={computedStyles.height || ""}
                      onChange={(val) => updateStyle("height", val)}
                      placeholder="Auto"
                    />
                  </div>

                  {/* Min Width and Min Height */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "26px 1fr 26px 1fr",
                      gap: "2px",
                      alignItems: "center",
                    }}
                  >
                    <label className={`Label ${getPropertyColorClass("minWidth")}`}>
                      Min W<PropertyIndicator property="minWidth" />
                    </label>
                    <UnitInput
                      value={computedStyles.minWidth || ""}
                      onChange={(val) => updateStyle("minWidth", val)}
                      placeholder="auto"
                    />
                    <label className={`Label ${getPropertyColorClass("minHeight")}`}>
                      Min H<PropertyIndicator property="minHeight" />
                    </label>
                    <UnitInput
                      value={computedStyles.minHeight || ""}
                      onChange={(val) => updateStyle("minHeight", val)}
                      placeholder="auto"
                    />
                  </div>

                  {/* Max Width and Max Height */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "26px 1fr 26px 1fr",
                      gap: "2px",
                      alignItems: "center",
                    }}
                  >
                    <label className={`Label ${getPropertyColorClass("maxWidth")}`}>
                      Max W<PropertyIndicator property="maxWidth" />
                    </label>
                    <UnitInput
                      value={computedStyles.maxWidth || ""}
                      onChange={(val) => updateStyle("maxWidth", val)}
                      placeholder="none"
                    />
                    <label className={`Label ${getPropertyColorClass("maxHeight")}`}>
                      Max H<PropertyIndicator property="maxHeight" />
                    </label>
                    <UnitInput
                      value={computedStyles.maxHeight || ""}
                      onChange={(val) => updateStyle("maxHeight", val)}
                      placeholder="none"
                    />
                  </div>

                  {/* Overflow */}
                  <div style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: "2px", alignItems: "center" }}>
                    <label className={`Label ${getPropertyColorClass("overflow")}`}>
                      Over
                      <PropertyIndicator property="overflow" />
                    </label>
                    <select
                      className="Select"
                      value={computedStyles.overflow || "visible"}
                      onChange={(e) => updateStyle("overflow", e.target.value)}
                      style={{ maxWidth: "90px" }}
                    >
                      <option value="visible">Visible</option>
                      <option value="hidden">Hidden</option>
                      <option value="scroll">Scroll</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>
              </AccordionSection>
            )}

            {/* Position */}
            {componentSupportsPropertyGroup(selectedInstance.type as ComponentType, "position") && (
              <AccordionSection
                title="Position"
                section="position"
                properties={["position", "top", "right", "bottom", "left", "zIndex", "transform"]}
              >
                <div className="Col" style={{ gap: "6px" }}>
                  {/* Position Type */}
                  <div style={{ display: "grid", gridTemplateColumns: "50px 1fr", gap: "4px", alignItems: "center" }}>
                    <label className={`Label ${getPropertyColorClass("position")}`}>
                      Position
                      <PropertyIndicator property="position" />
                    </label>
                    <select
                      className="Select"
                      value={computedStyles.position || "static"}
                      onChange={(e) => updateStyle("position", e.target.value)}
                    >
                      <option value="static">Static</option>
                      <option value="relative">Relative</option>
                      <option value="absolute">Absolute</option>
                      <option value="fixed">Fixed</option>
                      <option value="sticky">Sticky</option>
                    </select>
                  </div>

                  {(computedStyles.position === "absolute" ||
                    computedStyles.position === "relative" ||
                    computedStyles.position === "fixed" ||
                    computedStyles.position === "sticky") && (
                    <>
                      {/* Position Preset Buttons - Webflow-style horizontal row for absolute/fixed */}
                      {(computedStyles.position === "absolute" || computedStyles.position === "fixed") && (
                        <>
                          {/* 9 Preset Icons in a Single Horizontal Row */}
                          <div
                            style={{
                              display: "flex",
                              gap: "2px",
                            }}
                          >
                            {/* Top-Left */}
                            <button
                              onClick={() => {
                                updateStyle("top", "0");
                                updateStyle("left", "0");
                                updateStyle("right", "auto");
                                updateStyle("bottom", "auto");
                                updateStyle("transform", "none");
                              }}
                              className={`h-6 w-6 flex items-center justify-center rounded border text-[9px] transition-colors ${
                                computedStyles.top === "0" &&
                                computedStyles.left === "0" &&
                                (computedStyles.right === "auto" || !computedStyles.right) &&
                                (computedStyles.bottom === "auto" || !computedStyles.bottom)
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`}
                              title="Top Left"
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                                <rect x="0" y="0" width="4" height="4" />
                              </svg>
                            </button>
                            {/* Top-Center */}
                            <button
                              onClick={() => {
                                updateStyle("top", "0");
                                updateStyle("left", "50%");
                                updateStyle("right", "auto");
                                updateStyle("bottom", "auto");
                                updateStyle("transform", "translateX(-50%)");
                              }}
                              className={`h-6 w-6 flex items-center justify-center rounded border text-[9px] transition-colors ${
                                computedStyles.top === "0" &&
                                computedStyles.left === "50%" &&
                                computedStyles.transform?.includes("translateX(-50%)")
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`}
                              title="Top Center"
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                                <rect x="3" y="0" width="4" height="4" />
                              </svg>
                            </button>
                            {/* Top-Right */}
                            <button
                              onClick={() => {
                                updateStyle("top", "0");
                                updateStyle("right", "0");
                                updateStyle("left", "auto");
                                updateStyle("bottom", "auto");
                                updateStyle("transform", "none");
                              }}
                              className={`h-6 w-6 flex items-center justify-center rounded border text-[9px] transition-colors ${
                                computedStyles.top === "0" &&
                                computedStyles.right === "0" &&
                                (computedStyles.left === "auto" || !computedStyles.left) &&
                                (computedStyles.bottom === "auto" || !computedStyles.bottom)
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`}
                              title="Top Right"
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                                <rect x="6" y="0" width="4" height="4" />
                              </svg>
                            </button>
                            {/* Center-Left */}
                            <button
                              onClick={() => {
                                updateStyle("top", "50%");
                                updateStyle("left", "0");
                                updateStyle("right", "auto");
                                updateStyle("bottom", "auto");
                                updateStyle("transform", "translateY(-50%)");
                              }}
                              className={`h-6 w-6 flex items-center justify-center rounded border text-[9px] transition-colors ${
                                computedStyles.top === "50%" &&
                                computedStyles.left === "0" &&
                                computedStyles.transform?.includes("translateY(-50%)")
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`}
                              title="Center Left"
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                                <rect x="0" y="3" width="4" height="4" />
                              </svg>
                            </button>
                            {/* Center */}
                            <button
                              onClick={() => {
                                updateStyle("top", "50%");
                                updateStyle("left", "50%");
                                updateStyle("right", "auto");
                                updateStyle("bottom", "auto");
                                updateStyle("transform", "translate(-50%, -50%)");
                              }}
                              className={`h-6 w-6 flex items-center justify-center rounded border text-[9px] transition-colors ${
                                computedStyles.top === "50%" &&
                                computedStyles.left === "50%" &&
                                computedStyles.transform?.includes("translate(-50%, -50%)")
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`}
                              title="Center"
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                                <rect x="3" y="3" width="4" height="4" />
                              </svg>
                            </button>
                            {/* Center-Right */}
                            <button
                              onClick={() => {
                                updateStyle("top", "50%");
                                updateStyle("right", "0");
                                updateStyle("left", "auto");
                                updateStyle("bottom", "auto");
                                updateStyle("transform", "translateY(-50%)");
                              }}
                              className={`h-6 w-6 flex items-center justify-center rounded border text-[9px] transition-colors ${
                                computedStyles.top === "50%" &&
                                computedStyles.right === "0" &&
                                computedStyles.transform?.includes("translateY(-50%)")
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`}
                              title="Center Right"
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                                <rect x="6" y="3" width="4" height="4" />
                              </svg>
                            </button>
                            {/* Bottom-Left */}
                            <button
                              onClick={() => {
                                updateStyle("bottom", "0");
                                updateStyle("left", "0");
                                updateStyle("right", "auto");
                                updateStyle("top", "auto");
                                updateStyle("transform", "none");
                              }}
                              className={`h-6 w-6 flex items-center justify-center rounded border text-[9px] transition-colors ${
                                computedStyles.bottom === "0" &&
                                computedStyles.left === "0" &&
                                (computedStyles.right === "auto" || !computedStyles.right) &&
                                (computedStyles.top === "auto" || !computedStyles.top)
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`}
                              title="Bottom Left"
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                                <rect x="0" y="6" width="4" height="4" />
                              </svg>
                            </button>
                            {/* Bottom-Center */}
                            <button
                              onClick={() => {
                                updateStyle("bottom", "0");
                                updateStyle("left", "50%");
                                updateStyle("right", "auto");
                                updateStyle("top", "auto");
                                updateStyle("transform", "translateX(-50%)");
                              }}
                              className={`h-6 w-6 flex items-center justify-center rounded border text-[9px] transition-colors ${
                                computedStyles.bottom === "0" &&
                                computedStyles.left === "50%" &&
                                computedStyles.transform?.includes("translateX(-50%)")
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`}
                              title="Bottom Center"
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                                <rect x="3" y="6" width="4" height="4" />
                              </svg>
                            </button>
                            {/* Bottom-Right */}
                            <button
                              onClick={() => {
                                updateStyle("bottom", "0");
                                updateStyle("right", "0");
                                updateStyle("left", "auto");
                                updateStyle("top", "auto");
                                updateStyle("transform", "none");
                              }}
                              className={`h-6 w-6 flex items-center justify-center rounded border text-[9px] transition-colors ${
                                computedStyles.bottom === "0" &&
                                computedStyles.right === "0" &&
                                (computedStyles.left === "auto" || !computedStyles.left) &&
                                (computedStyles.top === "auto" || !computedStyles.top)
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`}
                              title="Bottom Right"
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                                <rect x="6" y="6" width="4" height="4" />
                              </svg>
                            </button>
                          </div>

                          {/* Stretch Presets Row */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(5, 1fr)",
                              gap: "2px",
                            }}
                          >
                            {/* Full Width Top */}
                            <button
                              onClick={() => {
                                updateStyle("top", "0");
                                updateStyle("left", "0");
                                updateStyle("right", "0");
                                updateStyle("bottom", "auto");
                                updateStyle("transform", "none");
                              }}
                              className={`h-6 flex items-center justify-center rounded border text-[8px] transition-colors ${
                                computedStyles.top === "0" &&
                                computedStyles.left === "0" &&
                                computedStyles.right === "0" &&
                                (computedStyles.bottom === "auto" || !computedStyles.bottom)
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`}
                              title="Full Width Top"
                            >
                              <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
                                <rect x="1" y="1" width="12" height="3" />
                              </svg>
                            </button>
                            {/* Full Width Bottom */}
                            <button
                              onClick={() => {
                                updateStyle("bottom", "0");
                                updateStyle("left", "0");
                                updateStyle("right", "0");
                                updateStyle("top", "auto");
                                updateStyle("transform", "none");
                              }}
                              className={`h-6 flex items-center justify-center rounded border text-[8px] transition-colors ${
                                computedStyles.bottom === "0" &&
                                computedStyles.left === "0" &&
                                computedStyles.right === "0" &&
                                (computedStyles.top === "auto" || !computedStyles.top)
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`}
                              title="Full Width Bottom"
                            >
                              <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
                                <rect x="1" y="6" width="12" height="3" />
                              </svg>
                            </button>
                            {/* Full Height Left */}
                            <button
                              onClick={() => {
                                updateStyle("top", "0");
                                updateStyle("bottom", "0");
                                updateStyle("left", "0");
                                updateStyle("right", "auto");
                                updateStyle("transform", "none");
                              }}
                              className={`h-6 flex items-center justify-center rounded border text-[8px] transition-colors ${
                                computedStyles.top === "0" &&
                                computedStyles.bottom === "0" &&
                                computedStyles.left === "0" &&
                                (computedStyles.right === "auto" || !computedStyles.right)
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`}
                              title="Full Height Left"
                            >
                              <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                                <rect x="1" y="1" width="3" height="12" />
                              </svg>
                            </button>
                            {/* Full Height Right */}
                            <button
                              onClick={() => {
                                updateStyle("top", "0");
                                updateStyle("bottom", "0");
                                updateStyle("right", "0");
                                updateStyle("left", "auto");
                                updateStyle("transform", "none");
                              }}
                              className={`h-6 flex items-center justify-center rounded border text-[8px] transition-colors ${
                                computedStyles.top === "0" &&
                                computedStyles.bottom === "0" &&
                                computedStyles.right === "0" &&
                                (computedStyles.left === "auto" || !computedStyles.left)
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`}
                              title="Full Height Right"
                            >
                              <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                                <rect x="6" y="1" width="3" height="12" />
                              </svg>
                            </button>
                            {/* Full Overlay */}
                            <button
                              onClick={() => {
                                updateStyle("top", "0");
                                updateStyle("left", "0");
                                updateStyle("right", "0");
                                updateStyle("bottom", "0");
                                updateStyle("transform", "none");
                              }}
                              className={`h-6 flex items-center justify-center rounded border text-[8px] transition-colors ${
                                computedStyles.top === "0" &&
                                computedStyles.left === "0" &&
                                computedStyles.right === "0" &&
                                computedStyles.bottom === "0"
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`}
                              title="Full Overlay (inset: 0)"
                            >
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                                <rect x="1" y="1" width="10" height="10" fillOpacity="0.6" />
                                <rect
                                  x="1"
                                  y="1"
                                  width="10"
                                  height="10"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                />
                              </svg>
                            </button>
                          </div>
                        </>
                      )}

                      {/* Position Numeric Inputs - Top/Right/Bottom/Left */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 60px 1fr",
                          gridTemplateRows: "auto auto auto",
                          gap: "2px",
                          padding: "8px",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                          background: "hsl(var(--muted) / 0.3)",
                        }}
                      >
                        {/* Top */}
                        <div
                          style={{
                            gridColumn: "2",
                            gridRow: "1",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "2px",
                          }}
                        >
                          <span className="Label" style={{ fontSize: "8px", color: "hsl(var(--muted-foreground))" }}>
                            Top
                          </span>
                          <UnitInput
                            value={computedStyles.top || ""}
                            onChange={(val) => updateStyle("top", val)}
                            placeholder="Auto"
                            className="SpaceInputSmall"
                            style={{ textAlign: "center", width: "56px" }}
                          />
                        </div>
                        {/* Left */}
                        <div
                          style={{
                            gridColumn: "1",
                            gridRow: "2",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "2px",
                          }}
                        >
                          <span className="Label" style={{ fontSize: "8px", color: "hsl(var(--muted-foreground))" }}>
                            Left
                          </span>
                          <UnitInput
                            value={computedStyles.left || ""}
                            onChange={(val) => updateStyle("left", val)}
                            placeholder="Auto"
                            className="SpaceInputSmall"
                            style={{ textAlign: "center", width: "56px" }}
                          />
                        </div>
                        {/* Center visual indicator */}
                        <div
                          style={{
                            gridColumn: "2",
                            gridRow: "2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: "32px",
                          }}
                        >
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              border: "2px dashed hsl(var(--border))",
                              borderRadius: "4px",
                              background: "hsl(var(--background))",
                            }}
                          />
                        </div>
                        {/* Right */}
                        <div
                          style={{
                            gridColumn: "3",
                            gridRow: "2",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "2px",
                          }}
                        >
                          <span className="Label" style={{ fontSize: "8px", color: "hsl(var(--muted-foreground))" }}>
                            Right
                          </span>
                          <UnitInput
                            value={computedStyles.right || ""}
                            onChange={(val) => updateStyle("right", val)}
                            placeholder="Auto"
                            className="SpaceInputSmall"
                            style={{ textAlign: "center", width: "56px" }}
                          />
                        </div>
                        {/* Bottom */}
                        <div
                          style={{
                            gridColumn: "2",
                            gridRow: "3",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "2px",
                          }}
                        >
                          <UnitInput
                            value={computedStyles.bottom || ""}
                            onChange={(val) => updateStyle("bottom", val)}
                            placeholder="Auto"
                            className="SpaceInputSmall"
                            style={{ textAlign: "center", width: "56px" }}
                          />
                          <span className="Label" style={{ fontSize: "8px", color: "hsl(var(--muted-foreground))" }}>
                            Bottom
                          </span>
                        </div>
                      </div>

                      {/* Relative To Indicator - for absolute/fixed positioning */}
                      {(computedStyles.position === "absolute" || computedStyles.position === "fixed") && (
                        <PositionRelativeToIndicator
                          instanceId={selectedInstance.id}
                          positionType={computedStyles.position}
                        />
                      )}

                      {/* Z-Index */}
                      <div
                        style={{ display: "grid", gridTemplateColumns: "50px 1fr", gap: "4px", alignItems: "center" }}
                      >
                        <label className={`Label ${getPropertyColorClass("zIndex")}`}>
                          z-index
                          <PropertyIndicator property="zIndex" />
                        </label>
                        <input
                          className="Input"
                          type="number"
                          value={computedStyles.zIndex?.toString() || ""}
                          onChange={(e) => updateStyle("zIndex", e.target.value)}
                          placeholder="Auto"
                          style={{ maxWidth: "60px" }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </AccordionSection>
            )}

            {/* Typography */}
            {componentSupportsPropertyGroup(selectedInstance.type as ComponentType, "typography") && (
              <AccordionSection
                title="Typography"
                section="typography"
                properties={[
                  "fontFamily",
                  "fontSize",
                  "fontWeight",
                  "lineHeight",
                  "letterSpacing",
                  "textAlign",
                  "textDecoration",
                  "textTransform",
                  "color",
                  "textIndent",
                  "wordBreak",
                  "whiteSpace",
                  "textOverflow",
                ]}
              >
                <div className="Col" style={{ gap: "8px" }}>
                  {/* Heading Tag Selector - Only for Heading components */}
                  {selectedInstance.type === "Heading" && (
                    <div>
                      <label className="Label" style={{ fontSize: "10px", marginBottom: "4px", display: "block" }}>
                        Tag
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "2px" }}>
                        {["1", "2", "3", "4", "5", "6"].map((num) => {
                          const tag = `h${num}`;
                          const isActive = (selectedInstance.props.level || "h1") === tag;
                          return (
                            <button
                              key={num}
                              onClick={() => {
                                // Update the heading tag
                                updateInstance(selectedInstance.id, {
                                  props: { ...selectedInstance.props, level: tag },
                                });

                                // Apply default typography for the selected heading level
                                if (selectedInstance.styleSourceIds && selectedInstance.styleSourceIds.length > 0) {
                                  const styleSourceId = selectedInstance.styleSourceIds[0];
                                  applyHeadingTypography(styleSourceId, tag, setStyle);
                                }
                              }}
                              className={`h-7 flex items-center justify-center rounded border text-xs font-medium transition-colors ${
                                isActive
                                  ? "bg-accent border-primary text-foreground"
                                  : "bg-[#F5F5F5] dark:bg-[#09090b] border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`}
                            >
                              H{num}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="Label" style={{ fontSize: "10px", marginBottom: "4px", display: "block" }}>
                      Font
                    </label>
                    <FontPicker
                      value={computedStyles.fontFamily || ""}
                      weight={computedStyles.fontWeight || "400"}
                      onChange={(val) => updateStyle("fontFamily", val)}
                      onWeightChange={(val) => updateStyle("fontWeight", val)}
                    />
                  </div>

                  {/* Font Size and Line Height */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "26px 1fr 26px 1fr",
                      gap: "2px",
                      alignItems: "center",
                    }}
                  >
                    <label className={`Label ${getPropertyColorClass("fontSize")}`}>
                      Size
                      <PropertyIndicator property="fontSize" />
                    </label>
                    <UnitInput
                      value={computedStyles.fontSize || ""}
                      onChange={(val) => updateStyle("fontSize", val)}
                      placeholder="16px"
                    />
                    <label className={`Label ${getPropertyColorClass("lineHeight")}`}>
                      Height
                      <PropertyIndicator property="lineHeight" />
                    </label>
                    <UnitInput
                      value={computedStyles.lineHeight || ""}
                      onChange={(val) => updateStyle("lineHeight", val)}
                      placeholder="1.5"
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "50px 1fr", gap: "4px", alignItems: "center" }}>
                    <label className={`Label ${getPropertyColorClass("color")}`}>
                      Text Color
                      <PropertyIndicator property="color" />
                    </label>
                    <div className="flex items-center gap-2">
                      <ColorPicker
                        value={computedStyles.color || "inherit"}
                        onChange={(val) => updateStyle("color", val)}
                      />
                      <span className="text-[9px] text-muted-foreground truncate">
                        {computedStyles.color || "inherit"}
                      </span>
                    </div>
                  </div>

                  {/* Text Align with Icons */}
                  <div style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: "2px", alignItems: "center" }}>
                    <label className="Label">Align</label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 32px)",
                        gap: "2px",
                        justifyContent: "start",
                      }}
                    >
                      <button
                        className={`w-8 h-8 flex items-center justify-center rounded border ${computedStyles.textAlign === "left" || !computedStyles.textAlign ? "bg-accent border-2 border-primary" : "bg-[#F5F5F5] dark:bg-[#09090b] border-input hover:bg-accent"}`}
                        onClick={() => updateStyle("textAlign", "left")}
                      >
                        <AlignLeft className="w-3.5 h-3.5 text-foreground" />
                      </button>
                      <button
                        className={`w-8 h-8 flex items-center justify-center rounded border ${computedStyles.textAlign === "center" ? "bg-accent border-2 border-primary" : "bg-[#F5F5F5] dark:bg-[#09090b] border-input hover:bg-accent"}`}
                        onClick={() => updateStyle("textAlign", "center")}
                      >
                        <AlignCenter className="w-3.5 h-3.5 text-foreground" />
                      </button>
                      <button
                        className={`w-8 h-8 flex items-center justify-center rounded border ${computedStyles.textAlign === "right" ? "bg-accent border-2 border-primary" : "bg-[#F5F5F5] dark:bg-[#09090b] border-input hover:bg-accent"}`}
                        onClick={() => updateStyle("textAlign", "right")}
                      >
                        <AlignRight className="w-3.5 h-3.5 text-foreground" />
                      </button>
                      <button
                        className={`w-8 h-8 flex items-center justify-center rounded border ${computedStyles.textAlign === "justify" ? "bg-accent border-2 border-primary" : "bg-[#F5F5F5] dark:bg-[#09090b] border-input hover:bg-accent"}`}
                        onClick={() => updateStyle("textAlign", "justify")}
                      >
                        <AlignJustify className="w-3.5 h-3.5 text-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Decor and Transform side by side */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "26px 1fr 26px 1fr",
                      gap: "2px",
                      alignItems: "center",
                    }}
                  >
                    <label className={`Label ${getPropertyColorClass("textDecoration")}`}>
                      Decor
                      <PropertyIndicator property="textDecoration" />
                    </label>
                    <select
                      className="Select"
                      value={computedStyles.textDecoration || "none"}
                      onChange={(e) => updateStyle("textDecoration", e.target.value)}
                      style={{ maxWidth: "90px" }}
                    >
                      <option value="none">None</option>
                      <option value="underline">Under</option>
                      <option value="overline">Over</option>
                      <option value="line-through">Strike</option>
                    </select>
                    <label className={`Label ${getPropertyColorClass("textTransform")}`}>
                      Trans
                      <PropertyIndicator property="textTransform" />
                    </label>
                    <select
                      className="Select"
                      value={computedStyles.textTransform || "none"}
                      onChange={(e) => updateStyle("textTransform", e.target.value)}
                      style={{ maxWidth: "90px" }}
                    >
                      <option value="none">None</option>
                      <option value="uppercase">Upper</option>
                      <option value="lowercase">Lower</option>
                      <option value="capitalize">Caps</option>
                    </select>
                  </div>

                  {/* Letter Spacing and Text Indent */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "26px 1fr 26px 1fr",
                      gap: "2px",
                      alignItems: "center",
                    }}
                  >
                    <label className={`Label ${getPropertyColorClass("letterSpacing")}`}>
                      Letter
                      <PropertyIndicator property="letterSpacing" />
                    </label>
                    <UnitInput
                      value={computedStyles.letterSpacing || ""}
                      onChange={(val) => updateStyle("letterSpacing", val)}
                      placeholder="0"
                    />
                    <label className={`Label ${getPropertyColorClass("textIndent")}`}>
                      Indent
                      <PropertyIndicator property="textIndent" />
                    </label>
                    <UnitInput
                      value={computedStyles.textIndent || ""}
                      onChange={(val) => updateStyle("textIndent", val)}
                      placeholder="0"
                    />
                  </div>

                  {/* Break, Wrap, Overflow side by side */}
                  <div style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: "2px", alignItems: "center" }}>
                    <label className="Label">Break</label>
                    <select
                      className="Select"
                      value={computedStyles.wordBreak || "normal"}
                      onChange={(e) => updateStyle("wordBreak", e.target.value)}
                      style={{ maxWidth: "90px" }}
                    >
                      <option value="normal">Normal</option>
                      <option value="break-all">All</option>
                      <option value="keep-all">Keep</option>
                      <option value="break-word">Word</option>
                    </select>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "26px 1fr 26px 1fr",
                      gap: "2px",
                      alignItems: "center",
                    }}
                  >
                    <label className="Label">Wrap</label>
                    <select
                      className="Select"
                      value={computedStyles.whiteSpace || "normal"}
                      onChange={(e) => updateStyle("whiteSpace", e.target.value)}
                      style={{ maxWidth: "90px" }}
                    >
                      <option value="normal">Normal</option>
                      <option value="nowrap">None</option>
                      <option value="pre">Pre</option>
                      <option value="pre-wrap">Wrap</option>
                    </select>
                    <label className="Label">Over</label>
                    <select
                      className="Select"
                      value={computedStyles.textOverflow || "clip"}
                      onChange={(e) => updateStyle("textOverflow", e.target.value)}
                      style={{ maxWidth: "90px" }}
                    >
                      <option value="clip">Clip</option>
                      <option value="ellipsis">...</option>
                    </select>
                  </div>
                </div>
              </AccordionSection>
            )}

            {/* Backgrounds */}
            {componentSupportsPropertyGroup(selectedInstance.type as ComponentType, "backgrounds") && (
              <AccordionSection
                title="Backgrounds"
                section="backgrounds"
                properties={[
                  "backgroundColor",
                  "backgroundGradient",
                  "backgroundImage",
                  "backgroundSize",
                  "backgroundPosition",
                  "backgroundRepeat",
                  "backgroundClip",
                ]}
              >
                <div className="Col" style={{ gap: "8px" }}>
                  {/* Background Color */}
                  <div style={{ display: "grid", gridTemplateColumns: "50px 1fr", gap: "4px", alignItems: "center" }}>
                    <label className={`Label ${getPropertyColorClass("backgroundColor")}`}>
                      Fill Color
                      <PropertyIndicator property="backgroundColor" />
                    </label>
                    <div className="flex items-center gap-2">
                      <ColorPicker
                        value={computedStyles.backgroundColor || "transparent"}
                        onChange={(val) => updateStyle("backgroundColor", val)}
                      />
                      <span className="text-[9px] text-muted-foreground truncate">
                        {computedStyles.backgroundColor || "transparent"}
                      </span>
                    </div>
                  </div>

                  {/* Gradient - only for layout components like Section */}
                  {showBackgroundImageControl(selectedInstance.type as ComponentType) && (
                    <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: "4px", alignItems: "center" }}>
                      <label className={`Label ${getPropertyColorClass("backgroundGradient")}`}>
                        Gradient
                        <PropertyIndicator property="backgroundGradient" />
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          className="Input flex-1"
                          type="text"
                          value={computedStyles.backgroundGradient || ""}
                          onChange={(e) => updateStyle("backgroundGradient", e.target.value)}
                          placeholder="linear-gradient(90deg, #000, #fff)"
                          style={{ fontSize: "10px" }}
                        />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="p-1 rounded hover:bg-accent"
                                onClick={() => {
                                  if (!computedStyles.backgroundGradient) {
                                    updateStyle(
                                      "backgroundGradient",
                                      "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.5))",
                                    );
                                  }
                                }}
                              >
                                <Zap className="w-3 h-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p className="text-xs">Add default gradient</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  )}

                  {/* Background Image - only for components that support it */}
                  {showBackgroundImageControl(selectedInstance.type as ComponentType) && (
                    <>
                      <div
                        style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: "4px", alignItems: "center" }}
                      >
                        <label className={`Label ${getPropertyColorClass("backgroundImage")}`}>
                          Image
                          <PropertyIndicator property="backgroundImage" />
                        </label>
                        <div className="flex items-center gap-1">
                          <ImageUpload
                            currentValue={computedStyles.backgroundImage?.match(/url\(['"]?(.+?)['"]?\)/)?.[1] || ""}
                            onImageChange={(url) => {
                              if (url) {
                                updateStyle("backgroundImage", `url(${url})`);
                                // Set defaults if not already set
                                if (!computedStyles.backgroundSize) updateStyle("backgroundSize", "cover");
                                if (!computedStyles.backgroundPosition) updateStyle("backgroundPosition", "center");
                                if (!computedStyles.backgroundRepeat) updateStyle("backgroundRepeat", "no-repeat");
                              } else {
                                updateStyle("backgroundImage", "");
                              }
                            }}
                            mode="background"
                            compact
                          />
                        </div>
                      </div>

                      {/* Show additional background settings when image is set */}
                      {computedStyles.backgroundImage && (
                        <>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "40px 1fr 40px 1fr",
                              gap: "4px",
                              alignItems: "center",
                            }}
                          >
                            <label className={`Label ${getPropertyColorClass("backgroundSize")}`}>
                              Size
                              <PropertyIndicator property="backgroundSize" />
                            </label>
                            <select
                              className="Select"
                              value={computedStyles.backgroundSize || "cover"}
                              onChange={(e) => updateStyle("backgroundSize", e.target.value)}
                              style={{ maxWidth: "80px" }}
                            >
                              <option value="cover">Cover</option>
                              <option value="contain">Contain</option>
                              <option value="auto">Auto</option>
                            </select>
                            <label className={`Label ${getPropertyColorClass("backgroundPosition")}`}>
                              Pos
                              <PropertyIndicator property="backgroundPosition" />
                            </label>
                            <select
                              className="Select"
                              value={computedStyles.backgroundPosition || "center"}
                              onChange={(e) => updateStyle("backgroundPosition", e.target.value)}
                              style={{ maxWidth: "80px" }}
                            >
                              <option value="center">Center</option>
                              <option value="top">Top</option>
                              <option value="bottom">Bottom</option>
                              <option value="left">Left</option>
                              <option value="right">Right</option>
                              <option value="top left">Top Left</option>
                              <option value="top right">Top Right</option>
                              <option value="bottom left">Bottom Left</option>
                              <option value="bottom right">Bottom Right</option>
                            </select>
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "40px 1fr",
                              gap: "4px",
                              alignItems: "center",
                            }}
                          >
                            <label className={`Label ${getPropertyColorClass("backgroundRepeat")}`}>
                              Repeat
                              <PropertyIndicator property="backgroundRepeat" />
                            </label>
                            <select
                              className="Select"
                              value={computedStyles.backgroundRepeat || "no-repeat"}
                              onChange={(e) => updateStyle("backgroundRepeat", e.target.value)}
                              style={{ maxWidth: "90px" }}
                            >
                              <option value="no-repeat">No Repeat</option>
                              <option value="repeat">Repeat</option>
                              <option value="repeat-x">Repeat X</option>
                              <option value="repeat-y">Repeat Y</option>
                            </select>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: "4px", alignItems: "center" }}>
                    <label className={`Label ${getPropertyColorClass("backgroundClip")}`}>
                      Clip
                      <PropertyIndicator property="backgroundClip" />
                    </label>
                    <select
                      className="Select"
                      value={computedStyles.backgroundClip || "border-box"}
                      onChange={(e) => updateStyle("backgroundClip", e.target.value)}
                      style={{ maxWidth: "90px" }}
                    >
                      <option value="border-box">Border</option>
                      <option value="padding-box">Padding</option>
                      <option value="content-box">Content</option>
                      <option value="text">Text</option>
                    </select>
                  </div>
                </div>
              </AccordionSection>
            )}

            {/* Borders */}
            {componentSupportsPropertyGroup(selectedInstance.type as ComponentType, "borders") && (
              <AccordionSection
                title="Borders"
                section="borders"
                properties={[
                  "borderWidth",
                  "borderStyle",
                  "borderColor",
                  "borderRadius",
                  "borderTopLeftRadius",
                  "borderTopRightRadius",
                  "borderBottomRightRadius",
                  "borderBottomLeftRadius",
                ]}
              >
                <div className="Col" style={{ gap: "4px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: "2px", alignItems: "center" }}>
                    <label className={`Label ${getPropertyColorClass("borderRadius")}`}>
                      Radius
                      <PropertyIndicator property="borderRadius" />
                    </label>
                    <UnitInput
                      value={computedStyles.borderRadius || ""}
                      onChange={(val) => updateStyle("borderRadius", val)}
                      placeholder="0"
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "26px 1fr 26px 1fr",
                      gap: "2px",
                      alignItems: "center",
                    }}
                  >
                    <label className={`Label ${getPropertyColorClass("borderStyle")}`}>
                      Style
                      <PropertyIndicator property="borderStyle" />
                    </label>
                    <select
                      className="Select"
                      value={computedStyles.borderStyle || "none"}
                      onChange={(e) => updateStyle("borderStyle", e.target.value)}
                      style={{ maxWidth: "90px" }}
                    >
                      <option value="none">None</option>
                      <option value="solid">Solid</option>
                      <option value="dashed">Dash</option>
                      <option value="dotted">Dot</option>
                      <option value="double">Double</option>
                    </select>
                    <label className={`Label ${getPropertyColorClass("borderWidth")}`}>
                      Width
                      <PropertyIndicator property="borderWidth" />
                    </label>
                    <UnitInput
                      value={computedStyles.borderWidth || ""}
                      onChange={(val) => updateStyle("borderWidth", val)}
                      placeholder="0"
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "50px 1fr", gap: "4px", alignItems: "center" }}>
                    <label className={`Label ${getPropertyColorClass("borderColor")}`}>
                      Border Color
                      <PropertyIndicator property="borderColor" />
                    </label>
                    <div className="flex items-center gap-2">
                      <ColorPicker
                        value={computedStyles.borderColor || "hsl(var(--border))"}
                        onChange={(val) => updateStyle("borderColor", val)}
                      />
                      <span className="text-[9px] text-muted-foreground truncate">
                        {computedStyles.borderColor || "inherit"}
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionSection>
            )}

            {/* Effects */}
            {componentSupportsPropertyGroup(selectedInstance.type as ComponentType, "effects") && (
              <AccordionSection
                title="Effects"
                section="effects"
                properties={[
                  "opacity",
                  "mixBlendMode",
                  "boxShadow",
                  "filter",
                  "backdropFilter",
                  "transform",
                  "transition",
                  "cursor",
                  "outline",
                  "outlineWidth",
                  "outlineStyle",
                  "outlineColor",
                ]}
              >
                <div className="Col" style={{ gap: "4px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: "2px", alignItems: "center" }}>
                    <label className={`Label ${getPropertyColorClass("mixBlendMode")}`}>
                      Blend
                      <PropertyIndicator property="mixBlendMode" />
                    </label>
                    <select
                      className="Select"
                      value={computedStyles.mixBlendMode || "normal"}
                      onChange={(e) => updateStyle("mixBlendMode", e.target.value)}
                      style={{ maxWidth: "90px" }}
                    >
                      <option value="normal">Normal</option>
                      <option value="multiply">Multiply</option>
                      <option value="screen">Screen</option>
                      <option value="overlay">Overlay</option>
                      <option value="darken">Darken</option>
                      <option value="lighten">Lighten</option>
                    </select>
                  </div>
                  <div
                    style={{ display: "grid", gridTemplateColumns: "40px 1fr 40px", gap: "4px", alignItems: "center" }}
                  >
                    <label className={`Label ${getPropertyColorClass("opacity")}`}>
                      Opacity
                      <PropertyIndicator property="opacity" />
                    </label>
                    <input
                      className="Input"
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={computedStyles.opacity || "1"}
                      onChange={(e) => updateStyle("opacity", e.target.value)}
                    />
                    <span className="text-[10px] text-muted-foreground text-right">
                      {Math.round(parseFloat(computedStyles.opacity || "1") * 100)}%
                    </span>
                  </div>
                  <div className="text-[9px] text-muted-foreground px-1 -mt-1">
                    Controls element visibility. For color transparency, use alpha in color picker.
                  </div>

                  {/* Shadow Manager */}
                  <div className="pt-2">
                    <ShadowManager
                      shadows={(() => {
                        if (!selectedInstance.styleSourceIds || selectedInstance.styleSourceIds.length === 0) return [];
                        const activeClassId = selectedInstance.styleSourceIds[activeClassIndex ?? 0];
                        if (!activeClassId) return [];
                        const metadata = getStyleMetadata(activeClassId);
                        return metadata?.shadows || [];
                      })()}
                      onChange={(shadows) => {
                        if (!selectedInstance.styleSourceIds || selectedInstance.styleSourceIds.length === 0) return;
                        const activeClassId = selectedInstance.styleSourceIds[activeClassIndex ?? 0];
                        if (!activeClassId) return;
                        const metadata = getStyleMetadata(activeClassId) || {};
                        setStyleMetadata(activeClassId, { ...metadata, shadows });
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: "2px", alignItems: "center" }}>
                    <label className={`Label ${getPropertyColorClass("filter")}`}>
                      Filter
                      <PropertyIndicator property="filter" />
                    </label>
                    <input
                      className="Input"
                      type="text"
                      placeholder="blur(4px)"
                      value={computedStyles.filter || ""}
                      onChange={(e) => updateStyle("filter", e.target.value)}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: "2px", alignItems: "center" }}>
                    <label className={`Label ${getPropertyColorClass("transform")}`}>
                      Trans
                      <PropertyIndicator property="transform" />
                    </label>
                    <input
                      className="Input"
                      type="text"
                      placeholder="rotate(10deg)"
                      value={computedStyles.transform || ""}
                      onChange={(e) => updateStyle("transform", e.target.value)}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: "2px", alignItems: "center" }}>
                    <label className={`Label ${getPropertyColorClass("cursor")}`}>
                      Cursor
                      <PropertyIndicator property="cursor" />
                    </label>
                    <select
                      className="Select"
                      value={computedStyles.cursor || "auto"}
                      onChange={(e) => updateStyle("cursor", e.target.value)}
                      style={{ maxWidth: "90px" }}
                    >
                      <option value="auto">Auto</option>
                      <option value="pointer">Pointer</option>
                      <option value="text">Text</option>
                      <option value="move">Move</option>
                      <option value="grab">Grab</option>
                      <option value="not-allowed">Not Allow</option>
                    </select>
                  </div>
                </div>
              </AccordionSection>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 min-h-0 m-0 p-2 overflow-y-auto overflow-x-hidden">
          {/* Navigation Template - unique to Settings tab */}
          {selectedInstance.label === "Navigation" && (
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-foreground">Navigation Template</label>
              <Select
                value={selectedInstance.props?.template || "logo-left-menu-right"}
                onValueChange={(value) => {
                  const { applyTemplateToStyles } = require("../utils/navigationTemplates");
                  const { setStyle } = useStyleStore.getState();
                  updateInstance(selectedInstance.id, {
                    props: { ...selectedInstance.props, template: value },
                  });
                  const logoBox = selectedInstance.children?.find((c) => c.children?.some((ch) => ch.type === "Image"));
                  const linksBox = selectedInstance.children?.find((c) => c.children?.some((ch) => ch.type === "Link"));
                  const buttonBox = selectedInstance.children?.find((c) =>
                    c.children?.some((ch) => ch.type === "Button"),
                  );
                  if (logoBox && linksBox) {
                    applyTemplateToStyles(
                      value,
                      selectedInstance.styleSourceIds?.[0],
                      logoBox.styleSourceIds?.[0],
                      linksBox.styleSourceIds?.[0],
                      buttonBox?.styleSourceIds?.[0],
                      setStyle,
                    );
                  }
                }}
              >
                <SelectTrigger className="h-6 text-[10px]">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="logo-left-menu-right">Logo Left + Menu Right</SelectItem>
                  <SelectItem value="logo-right-menu-left">Logo Right + Menu Left</SelectItem>
                  <SelectItem value="logo-center-split">Logo Center + Split Menu</SelectItem>
                  <SelectItem value="stacked-center">Stacked</SelectItem>
                  <SelectItem value="center-hamburger">Center Logo + Hamburger</SelectItem>
                  <SelectItem value="logo-left-menu-center">Logo Left + Menu Center</SelectItem>
                  <SelectItem value="minimal-logo">Minimal (Logo Only)</SelectItem>
                  <SelectItem value="mega-menu">Mega Menu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {selectedInstance.label !== "Navigation" && (
            <div className="text-[10px] text-muted-foreground text-center py-4">
              Component settings are in the Data tab
            </div>
          )}
        </TabsContent>

        <TabsContent value="pages" className="flex-1 min-h-0 m-0 p-0 overflow-y-auto overflow-x-hidden">
          <div className="p-1.5">
            {safePages.map((page) => (
              <div
                key={page}
                className={`flex items-center justify-between p-1.5 rounded cursor-pointer hover:bg-accent ${
                  currentPage === page ? "bg-accent" : ""
                }`}
                onClick={() => handlePageClick(page)}
              >
                <div className="flex items-center gap-2">
                  {homePage === page ? <Home className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4" />}
                  <span className="text-xs">{pageNames[page] || page}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="flex-1 min-h-0 m-0 p-4 overflow-y-auto overflow-x-hidden">
          <div className="text-sm text-muted-foreground text-center">Actions panel coming soon</div>
        </TabsContent>

        <TabsContent value="data" className="flex-1 min-h-0 m-0 p-2 overflow-y-auto overflow-x-hidden">
          <div className="space-y-2">
            {/* ID Section - Global for all components */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-foreground">ID</label>
              <Input
                type="text"
                placeholder="For in-page linking"
                value={selectedInstance.idAttribute || ""}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^a-zA-Z0-9_-]/g, "");
                  updateInstance(selectedInstance.id, { idAttribute: sanitized });
                }}
                className="h-6 text-[10px]"
              />
            </div>

            {/* Visibility Section - Global for all components */}
            <div className="space-y-1">
              <div
                className="flex items-center justify-between cursor-pointer py-0.5"
                onClick={() => setOpenSections((prev) => ({ ...prev, visibility: !prev.visibility }))}
              >
                <label className="text-[10px] font-semibold text-foreground">Visibility</label>
                {openSections.visibility ? (
                  <ChevronDown className="w-2.5 h-2.5" />
                ) : (
                  <ChevronRight className="w-2.5 h-2.5" />
                )}
              </div>
              {openSections.visibility && (
                <div className="flex items-center gap-1">
                  <ToggleGroup
                    type="single"
                    value={selectedInstance.visibility || "visible"}
                    onValueChange={(value) => {
                      if (value) {
                        updateInstance(selectedInstance.id, { visibility: value as "visible" | "hidden" });
                      }
                    }}
                    className="h-6"
                  >
                    <ToggleGroupItem value="visible" className="text-[10px] h-6 px-2">
                      Visible
                    </ToggleGroupItem>
                    <ToggleGroupItem value="hidden" className="text-[10px] h-6 px-2">
                      Hidden
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              )}
            </div>

            {/* Custom Attributes Section - Per-component unique */}
            <div className="space-y-0.5">
              <div
                className="flex items-center justify-between cursor-pointer py-0.5"
                onClick={() => setOpenSections((prev) => ({ ...prev, customAttributes: !prev.customAttributes }))}
              >
                <div className="flex items-center gap-1">
                  <label className="text-[10px] font-semibold text-foreground">Custom Attributes</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Get THIS instance's current attributes only
                      const thisInstanceAttrs = selectedInstance.attributes || {};
                      const newKey = `data-attr-${Object.keys(thisInstanceAttrs).length + 1}`;
                      // Update only THIS specific instance
                      updateInstance(selectedInstance.id, {
                        attributes: { ...thisInstanceAttrs, [newKey]: "" },
                      });
                      setOpenSections((prev) => ({ ...prev, customAttributes: true }));
                    }}
                    className="h-4 w-4 p-0"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </Button>
                </div>
                {openSections.customAttributes ? (
                  <ChevronDown className="w-2.5 h-2.5" />
                ) : (
                  <ChevronRight className="w-2.5 h-2.5" />
                )}
              </div>
              {openSections.customAttributes && (
                <div className="space-y-0.5">
                  {Object.keys(selectedInstance.attributes || {}).length > 0 ? (
                    <div className="space-y-0.5">
                      {Object.entries(selectedInstance.attributes || {}).map(([name, value], index) => (
                        <AttributeRow
                          key={`${selectedInstance.id}-attr-${name}-${index}`}
                          name={name}
                          value={value}
                          instanceId={selectedInstance.id}
                          onSave={(oldName, newName, newValue) => {
                            const currentAttrs = { ...selectedInstance.attributes };
                            delete currentAttrs[oldName];
                            currentAttrs[newName] = newValue;
                            updateInstance(selectedInstance.id, { attributes: currentAttrs });
                          }}
                          onDelete={(attrName) => {
                            const currentAttrs = { ...selectedInstance.attributes };
                            delete currentAttrs[attrName];
                            updateInstance(selectedInstance.id, { attributes: currentAttrs });
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9px] text-muted-foreground pl-1">No custom attributes</p>
                  )}
                </div>
              )}
            </div>

            {/* Content Editing Section - For text-based components */}
            {(selectedInstance.type === "Text" ||
              selectedInstance.type === "Heading" ||
              selectedInstance.type === "Link" ||
              selectedInstance.type === "Blockquote" ||
              selectedInstance.type === "Cell" ||
              selectedInstance.type === "InputLabel" ||
              selectedInstance.type === "CheckboxField" ||
              selectedInstance.type === "FormButton" ||
              selectedInstance.type === "Button" ||
              selectedInstance.type === "OrderedList" ||
              selectedInstance.type === "UnorderedList") && (
              <>
                <Separator className="my-1" />
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Content</label>

                  {/* Text / Heading / Link / Blockquote / Cell - children prop */}
                  {(selectedInstance.type === "Text" ||
                    selectedInstance.type === "Heading" ||
                    selectedInstance.type === "Link" ||
                    selectedInstance.type === "Blockquote" ||
                    selectedInstance.type === "Cell") && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground">Text Content</label>
                      <Textarea
                        value={selectedInstance.props.children || ""}
                        onChange={(e) =>
                          updateInstance(selectedInstance.id, {
                            props: { ...selectedInstance.props, children: e.target.value },
                          })
                        }
                        className="min-h-[60px] text-[11px] resize-y"
                        placeholder="Enter text content..."
                      />
                    </div>
                  )}

                  {/* Button / FormButton - text or children prop */}
                  {(selectedInstance.type === "Button" || selectedInstance.type === "FormButton") && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground">Button Text</label>
                      <Input
                        type="text"
                        value={selectedInstance.props.children || selectedInstance.props.text || ""}
                        onChange={(e) =>
                          updateInstance(selectedInstance.id, {
                            props: { ...selectedInstance.props, children: e.target.value, text: e.target.value },
                          })
                        }
                        className="h-6 text-[10px]"
                        placeholder="Button text..."
                      />
                    </div>
                  )}

                  {/* InputLabel - text prop */}
                  {selectedInstance.type === "InputLabel" && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground">Label Text</label>
                      <Input
                        type="text"
                        value={selectedInstance.props.text || ""}
                        onChange={(e) =>
                          updateInstance(selectedInstance.id, {
                            props: { ...selectedInstance.props, text: e.target.value },
                          })
                        }
                        className="h-6 text-[10px]"
                        placeholder="Label text..."
                      />
                    </div>
                  )}

                  {/* CheckboxField - label prop */}
                  {selectedInstance.type === "CheckboxField" && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground">Label Text</label>
                      <Input
                        type="text"
                        value={selectedInstance.props.label || ""}
                        onChange={(e) =>
                          updateInstance(selectedInstance.id, {
                            props: { ...selectedInstance.props, label: e.target.value },
                          })
                        }
                        className="h-6 text-[10px]"
                        placeholder="Checkbox label..."
                      />
                    </div>
                  )}

                  {/* OrderedList / UnorderedList - items prop */}
                  {(selectedInstance.type === "OrderedList" || selectedInstance.type === "UnorderedList") && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-muted-foreground">List Items</label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const currentItems = selectedInstance.props.items || ["Item 1", "Item 2", "Item 3"];
                            updateInstance(selectedInstance.id, {
                              props: {
                                ...selectedInstance.props,
                                items: [...currentItems, `Item ${currentItems.length + 1}`],
                              },
                            });
                          }}
                          className="h-4 text-[9px] px-1"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </Button>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {(selectedInstance.props.items || ["Item 1", "Item 2", "Item 3"]).map(
                          (item: string, i: number) => (
                            <div key={i} className="flex items-center gap-1">
                              <span className="text-[9px] text-muted-foreground w-4">
                                {selectedInstance.type === "OrderedList" ? `${i + 1}.` : "•"}
                              </span>
                              <Input
                                value={item}
                                onChange={(e) => {
                                  const newItems = [
                                    ...(selectedInstance.props.items || ["Item 1", "Item 2", "Item 3"]),
                                  ];
                                  newItems[i] = e.target.value;
                                  updateInstance(selectedInstance.id, {
                                    props: { ...selectedInstance.props, items: newItems },
                                  });
                                }}
                                className="h-5 text-[10px] flex-1"
                                placeholder={`Item ${i + 1}`}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const newItems = (
                                    selectedInstance.props.items || ["Item 1", "Item 2", "Item 3"]
                                  ).filter((_: string, idx: number) => idx !== i);
                                  if (newItems.length > 0) {
                                    updateInstance(selectedInstance.id, {
                                      props: { ...selectedInstance.props, items: newItems },
                                    });
                                  }
                                }}
                                className="h-4 w-4 p-0"
                                disabled={(selectedInstance.props.items || []).length <= 1}
                              >
                                <X className="w-2 h-2" />
                              </Button>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {/* Link - href prop */}
                  {selectedInstance.type === "Link" && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">URL</label>
                        <Input
                          type="text"
                          value={selectedInstance.props.href || ""}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, href: e.target.value },
                            })
                          }
                          className="h-6 text-[10px]"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedInstance.props.target === "_blank"}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, target: e.target.checked ? "_blank" : "_self" },
                            })
                          }
                          className="w-3 h-3"
                        />
                        <label className="text-[10px] text-muted-foreground">Open in new tab</label>
                      </div>
                    </>
                  )}

                  {/* Heading - tag selection */}
                  {selectedInstance.type === "Heading" && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground">Heading Level</label>
                      <select
                        className="w-full h-6 px-2 text-[10px] rounded border border-border bg-background"
                        value={selectedInstance.props.tag || "h2"}
                        onChange={(e) => {
                          updateInstance(selectedInstance.id, {
                            props: { ...selectedInstance.props, tag: e.target.value },
                          });
                          // Apply heading typography
                          if (activeStyleSourceId) {
                            applyHeadingTypography(
                              e.target.value as "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
                              activeStyleSourceId,
                              setStyle,
                            );
                          }
                        }}
                      >
                        <option value="h1">H1</option>
                        <option value="h2">H2</option>
                        <option value="h3">H3</option>
                        <option value="h4">H4</option>
                        <option value="h5">H5</option>
                        <option value="h6">H6</option>
                      </select>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Component-Specific Settings */}
            {(selectedInstance.type === "Section" ||
              selectedInstance.type === "Image" ||
              selectedInstance.type === "Video" ||
              selectedInstance.type === "Youtube" ||
              selectedInstance.type === "Lottie" ||
              selectedInstance.type === "Navigation" ||
              selectedInstance.type === "Dropdown" ||
              selectedInstance.type === "Link" ||
              selectedInstance.type === "Button" ||
              selectedInstance.type === "Form" ||
              selectedInstance.type === "FormButton" ||
              selectedInstance.type === "InputLabel" ||
              selectedInstance.type === "TextInput" ||
              selectedInstance.type === "TextArea" ||
              selectedInstance.type === "Select" ||
              selectedInstance.type === "RadioGroup" ||
              selectedInstance.type === "CheckboxField" ||
              selectedInstance.type === "Table" ||
              selectedInstance.type === "Accordion" ||
              selectedInstance.type === "Carousel" ||
              selectedInstance.type === "Tabs" ||
              selectedInstance.type === "Slider" ||
              selectedInstance.type === "AlertDialog" ||
              selectedInstance.type === "Avatar" ||
              selectedInstance.type === "Badge" ||
              selectedInstance.type === "Breadcrumb" ||
              selectedInstance.type === "ProgressBar" ||
              selectedInstance.type === "Tooltip" ||
              selectedInstance.type === "Popover" ||
              selectedInstance.type === "Drawer" ||
              selectedInstance.type === "Sheet" ||
              selectedInstance.type === "Switch" ||
              selectedInstance.type === "Toggle" ||
              selectedInstance.type === "ToggleGroup" ||
              selectedInstance.type === "Alert" ||
              selectedInstance.type === "Pagination" ||
              selectedInstance.type === "OTPInput") && (
              <>
                <Separator className="my-1" />
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Settings</label>

                  {/* Section Settings */}
                  {selectedInstance.type === "Section" && (
                    <div className="space-y-3">
                      {/* HTML Tag Selection */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">HTML Tag</label>
                        <select
                          className="w-full h-6 px-2 text-[10px] rounded border border-border bg-background"
                          value={selectedInstance.props.htmlTag || "section"}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, htmlTag: e.target.value },
                            })
                          }
                        >
                          <option value="section">section</option>
                          <option value="div">div</option>
                          <option value="article">article</option>
                          <option value="aside">aside</option>
                          <option value="header">header</option>
                          <option value="footer">footer</option>
                          <option value="main">main</option>
                          <option value="nav">nav</option>
                        </select>
                      </div>

                      {/* Section Width */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Section Width</label>
                        <ToggleGroup
                          type="single"
                          value={selectedInstance.props.sectionWidth || "full"}
                          onValueChange={(value) => {
                            if (value) {
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, sectionWidth: value },
                              });
                              // Auto-apply width style
                              if (activeStyleSourceId) {
                                if (value === "full") {
                                  updateStyle("width", "100%");
                                  updateStyle("maxWidth", "");
                                } else {
                                  updateStyle("width", "100%");
                                  updateStyle("maxWidth", "1200px");
                                  updateStyle("marginLeft", "auto");
                                  updateStyle("marginRight", "auto");
                                }
                              }
                            }
                          }}
                          className="w-full h-6"
                        >
                          <ToggleGroupItem value="full" className="flex-1 text-[10px] h-6 px-2">
                            Full Width
                          </ToggleGroupItem>
                          <ToggleGroupItem value="fixed" className="flex-1 text-[10px] h-6 px-2">
                            Fixed Width
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>

                      {/* Min Height */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Min Height</label>
                        <div className="flex items-center gap-1">
                          <Input
                            type="text"
                            placeholder="auto"
                            value={selectedInstance.props.minHeight || ""}
                            onChange={(e) => {
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, minHeight: e.target.value },
                              });
                              if (activeStyleSourceId && e.target.value) {
                                updateStyle("minHeight", e.target.value);
                              }
                            }}
                            className="h-6 text-[10px] flex-1"
                          />
                          <select
                            className="h-6 px-1 text-[10px] rounded border border-border bg-background w-14"
                            value={selectedInstance.props.minHeightUnit || "px"}
                            onChange={(e) => {
                              const val = selectedInstance.props.minHeight || "";
                              const numVal = parseFloat(val) || "";
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, minHeightUnit: e.target.value },
                              });
                              if (activeStyleSourceId && numVal) {
                                updateStyle("minHeight", `${numVal}${e.target.value}`);
                              }
                            }}
                          >
                            <option value="px">px</option>
                            <option value="vh">vh</option>
                            <option value="%">%</option>
                            <option value="rem">rem</option>
                          </select>
                        </div>
                      </div>

                      {/* Background Type */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Background Type</label>
                        <select
                          className="w-full h-6 px-2 text-[10px] rounded border border-border bg-background"
                          value={selectedInstance.props.backgroundType || "none"}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, backgroundType: e.target.value },
                            })
                          }
                        >
                          <option value="none">None</option>
                          <option value="color">Solid Color</option>
                          <option value="gradient">Gradient</option>
                          <option value="image">Image</option>
                        </select>
                      </div>

                      {/* Background Color (when type is color) */}
                      {selectedInstance.props.backgroundType === "color" && (
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">Background Color</label>
                          <ColorPicker
                            value={selectedInstance.props.bgColor || "transparent"}
                            onChange={(val) => {
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, bgColor: val },
                              });
                              if (activeStyleSourceId) {
                                updateStyle("backgroundColor", val);
                              }
                            }}
                          />
                        </div>
                      )}

                      {/* Gradient (when type is gradient) */}
                      {selectedInstance.props.backgroundType === "gradient" && (
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">Gradient</label>
                          <Input
                            type="text"
                            placeholder="linear-gradient(90deg, #000, #fff)"
                            value={selectedInstance.props.bgGradient || ""}
                            onChange={(e) => {
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, bgGradient: e.target.value },
                              });
                              if (activeStyleSourceId) {
                                updateStyle("backgroundGradient", e.target.value);
                              }
                            }}
                            className="h-6 text-[10px]"
                          />
                          <div className="flex gap-1 flex-wrap">
                            <button
                              className="text-[9px] px-1.5 py-0.5 rounded bg-accent hover:bg-accent/80"
                              onClick={() => {
                                const gradient =
                                  "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.5))";
                                updateInstance(selectedInstance.id, {
                                  props: { ...selectedInstance.props, bgGradient: gradient },
                                });
                                if (activeStyleSourceId) updateStyle("backgroundGradient", gradient);
                              }}
                            >
                              Primary
                            </button>
                            <button
                              className="text-[9px] px-1.5 py-0.5 rounded bg-accent hover:bg-accent/80"
                              onClick={() => {
                                const gradient = "linear-gradient(180deg, #667eea 0%, #764ba2 100%)";
                                updateInstance(selectedInstance.id, {
                                  props: { ...selectedInstance.props, bgGradient: gradient },
                                });
                                if (activeStyleSourceId) updateStyle("backgroundGradient", gradient);
                              }}
                            >
                              Purple
                            </button>
                            <button
                              className="text-[9px] px-1.5 py-0.5 rounded bg-accent hover:bg-accent/80"
                              onClick={() => {
                                const gradient = "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)";
                                updateInstance(selectedInstance.id, {
                                  props: { ...selectedInstance.props, bgGradient: gradient },
                                });
                                if (activeStyleSourceId) updateStyle("backgroundGradient", gradient);
                              }}
                            >
                              Light
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Background Image (when type is image) */}
                      {selectedInstance.props.backgroundType === "image" && (
                        <div className="space-y-2">
                          <ImageUpload
                            currentValue={selectedInstance.props.bgImage || ""}
                            onImageChange={(url) => {
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, bgImage: url },
                              });
                              if (activeStyleSourceId) {
                                if (url) {
                                  updateStyle("backgroundImage", `url(${url})`);
                                  if (!computedStyles.backgroundSize) updateStyle("backgroundSize", "cover");
                                  if (!computedStyles.backgroundPosition) updateStyle("backgroundPosition", "center");
                                  if (!computedStyles.backgroundRepeat) updateStyle("backgroundRepeat", "no-repeat");
                                } else {
                                  updateStyle("backgroundImage", "");
                                }
                              }
                            }}
                            mode="background"
                            label="Background Image"
                            compact
                          />

                          {selectedInstance.props.bgImage && (
                            <>
                              <div className="grid grid-cols-2 gap-1">
                                <div className="space-y-0.5">
                                  <label className="text-[9px] text-muted-foreground">Size</label>
                                  <select
                                    className="w-full h-5 px-1 text-[9px] rounded border border-border bg-background"
                                    value={selectedInstance.props.bgSize || "cover"}
                                    onChange={(e) => {
                                      updateInstance(selectedInstance.id, {
                                        props: { ...selectedInstance.props, bgSize: e.target.value },
                                      });
                                      if (activeStyleSourceId) updateStyle("backgroundSize", e.target.value);
                                    }}
                                  >
                                    <option value="cover">Cover</option>
                                    <option value="contain">Contain</option>
                                    <option value="auto">Auto</option>
                                  </select>
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-[9px] text-muted-foreground">Position</label>
                                  <select
                                    className="w-full h-5 px-1 text-[9px] rounded border border-border bg-background"
                                    value={selectedInstance.props.bgPosition || "center"}
                                    onChange={(e) => {
                                      updateInstance(selectedInstance.id, {
                                        props: { ...selectedInstance.props, bgPosition: e.target.value },
                                      });
                                      if (activeStyleSourceId) updateStyle("backgroundPosition", e.target.value);
                                    }}
                                  >
                                    <option value="center">Center</option>
                                    <option value="top">Top</option>
                                    <option value="bottom">Bottom</option>
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                  </select>
                                </div>
                              </div>
                              <div className="space-y-0.5">
                                <label className="text-[9px] text-muted-foreground">Repeat</label>
                                <select
                                  className="w-full h-5 px-1 text-[9px] rounded border border-border bg-background"
                                  value={selectedInstance.props.bgRepeat || "no-repeat"}
                                  onChange={(e) => {
                                    updateInstance(selectedInstance.id, {
                                      props: { ...selectedInstance.props, bgRepeat: e.target.value },
                                    });
                                    if (activeStyleSourceId) updateStyle("backgroundRepeat", e.target.value);
                                  }}
                                >
                                  <option value="no-repeat">No Repeat</option>
                                  <option value="repeat">Repeat</option>
                                  <option value="repeat-x">Repeat X</option>
                                  <option value="repeat-y">Repeat Y</option>
                                </select>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dropdown Settings */}
                  {selectedInstance.type === "Dropdown" && (
                    <div className="space-y-3">
                      {/* Label Text */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Label Text</label>
                        <Input
                          type="text"
                          value={selectedInstance.props?.triggerText || "Dropdown"}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, triggerText: e.target.value },
                            })
                          }
                          className="h-6 text-[10px]"
                        />
                      </div>

                      {/* Menu Visibility (Builder) */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Menu (Builder)</label>
                        <ToggleGroup
                          type="single"
                          value={selectedInstance.dropdownConfig?.isOpen ? "show" : "hide"}
                          onValueChange={(value) => {
                            updateInstance(selectedInstance.id, {
                              dropdownConfig: { ...selectedInstance.dropdownConfig, isOpen: value === "show" },
                            });
                          }}
                          className="w-full h-6"
                        >
                          <ToggleGroupItem value="show" className="flex-1 text-[10px] h-6 px-2">
                            Show
                          </ToggleGroupItem>
                          <ToggleGroupItem value="hide" className="flex-1 text-[10px] h-6 px-2">
                            Hide
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>

                      {/* Menu Position */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Menu Position</label>
                        <ToggleGroup
                          type="single"
                          value={selectedInstance.dropdownConfig?.menuPosition || "left"}
                          onValueChange={(value) => {
                            if (value) {
                              updateInstance(selectedInstance.id, {
                                dropdownConfig: {
                                  ...selectedInstance.dropdownConfig,
                                  menuPosition: value as "left" | "right",
                                },
                              });
                            }
                          }}
                          className="w-full h-6"
                        >
                          <ToggleGroupItem value="left" className="flex-1 text-[10px] h-6 px-2">
                            Left
                          </ToggleGroupItem>
                          <ToggleGroupItem value="right" className="flex-1 text-[10px] h-6 px-2">
                            Right
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>

                      {/* Behavior */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground">Behavior</label>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Checkbox
                              id="open-on-hover"
                              checked={selectedInstance.dropdownConfig?.openOnHover || false}
                              onCheckedChange={(checked) => {
                                updateInstance(selectedInstance.id, {
                                  dropdownConfig: { ...selectedInstance.dropdownConfig, openOnHover: !!checked },
                                });
                              }}
                              className="h-3 w-3"
                            />
                            <label htmlFor="open-on-hover" className="text-[10px]">
                              Open on hover
                            </label>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Checkbox
                              id="close-on-select"
                              checked={selectedInstance.dropdownConfig?.closeOnSelect !== false}
                              onCheckedChange={(checked) => {
                                updateInstance(selectedInstance.id, {
                                  dropdownConfig: { ...selectedInstance.dropdownConfig, closeOnSelect: !!checked },
                                });
                              }}
                              className="h-3 w-3"
                            />
                            <label htmlFor="close-on-select" className="text-[10px]">
                              Close on select
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Close Delay */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Close Delay</label>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={selectedInstance.dropdownConfig?.closeDelayMs || 0}
                            onChange={(e) => {
                              updateInstance(selectedInstance.id, {
                                dropdownConfig: {
                                  ...selectedInstance.dropdownConfig,
                                  closeDelayMs: parseInt(e.target.value) || 0,
                                },
                              });
                            }}
                            className="h-5 w-16 text-[10px]"
                          />
                          <span className="text-[9px] text-muted-foreground">ms</span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-muted-foreground">Menu Items</label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const currentItems = selectedInstance.props?.menuItems || [];
                              const newItem = {
                                label: `Option ${currentItems.length + 1}`,
                                href: "#",
                                id: String(Date.now()),
                              };
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, menuItems: [...currentItems, newItem] },
                              });
                            }}
                            className="h-5 px-1.5 text-[9px]"
                          >
                            <Plus className="w-3 h-3 mr-0.5" /> Add
                          </Button>
                        </div>
                        <div className="space-y-1 max-h-[150px] overflow-y-auto">
                          {(selectedInstance.props?.menuItems || []).map(
                            (item: { label: string; href: string; id?: string }, index: number) => (
                              <div
                                key={item.id || index}
                                className="flex items-center gap-1 p-1.5 rounded border border-border bg-muted/30"
                              >
                                <div className="flex-1 space-y-1">
                                  <Input
                                    type="text"
                                    placeholder="Label"
                                    value={item.label}
                                    onChange={(e) => {
                                      const items = [...(selectedInstance.props?.menuItems || [])];
                                      items[index] = { ...items[index], label: e.target.value };
                                      updateInstance(selectedInstance.id, {
                                        props: { ...selectedInstance.props, menuItems: items },
                                      });
                                    }}
                                    className="h-5 text-[9px]"
                                  />
                                  <Input
                                    type="text"
                                    placeholder="URL (e.g. /page or https://...)"
                                    value={item.href}
                                    onChange={(e) => {
                                      const items = [...(selectedInstance.props?.menuItems || [])];
                                      items[index] = { ...items[index], href: e.target.value };
                                      updateInstance(selectedInstance.id, {
                                        props: { ...selectedInstance.props, menuItems: items },
                                      });
                                    }}
                                    className="h-5 text-[9px]"
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const items = [...(selectedInstance.props?.menuItems || [])];
                                    items.splice(index, 1);
                                    updateInstance(selectedInstance.id, {
                                      props: { ...selectedInstance.props, menuItems: items },
                                    });
                                  }}
                                  className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      <Separator className="my-2" />

                      {/* Trigger Styling */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-foreground">Trigger Styling</label>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="space-y-0.5">
                            <label className="text-[9px] text-muted-foreground">Background</label>
                            <ColorPicker
                              value={selectedInstance.props?.triggerBgColor || "transparent"}
                              onChange={(val) =>
                                updateInstance(selectedInstance.id, {
                                  props: { ...selectedInstance.props, triggerBgColor: val },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[9px] text-muted-foreground">Text Color</label>
                            <ColorPicker
                              value={selectedInstance.props?.triggerTextColor || ""}
                              onChange={(val) =>
                                updateInstance(selectedInstance.id, {
                                  props: { ...selectedInstance.props, triggerTextColor: val },
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] text-muted-foreground">Border Radius</label>
                          <Input
                            type="text"
                            placeholder="6px"
                            value={selectedInstance.props?.triggerBorderRadius || ""}
                            onChange={(e) =>
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, triggerBorderRadius: e.target.value },
                              })
                            }
                            className="h-5 text-[9px]"
                          />
                        </div>
                      </div>

                      {/* Menu Styling */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-foreground">Menu Styling</label>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="space-y-0.5">
                            <label className="text-[9px] text-muted-foreground">Background</label>
                            <ColorPicker
                              value={selectedInstance.props?.menuBgColor || ""}
                              onChange={(val) =>
                                updateInstance(selectedInstance.id, {
                                  props: { ...selectedInstance.props, menuBgColor: val },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[9px] text-muted-foreground">Hover Color</label>
                            <ColorPicker
                              value={selectedInstance.props?.itemHoverBgColor || ""}
                              onChange={(val) =>
                                updateInstance(selectedInstance.id, {
                                  props: { ...selectedInstance.props, itemHoverBgColor: val },
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="space-y-0.5">
                            <label className="text-[9px] text-muted-foreground">Border Radius</label>
                            <Input
                              type="text"
                              placeholder="6px"
                              value={selectedInstance.props?.menuBorderRadius || ""}
                              onChange={(e) =>
                                updateInstance(selectedInstance.id, {
                                  props: { ...selectedInstance.props, menuBorderRadius: e.target.value },
                                })
                              }
                              className="h-5 text-[9px]"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[9px] text-muted-foreground">Item Padding</label>
                            <Input
                              type="text"
                              placeholder="8px 16px"
                              value={selectedInstance.props?.itemPadding || ""}
                              onChange={(e) =>
                                updateInstance(selectedInstance.id, {
                                  props: { ...selectedInstance.props, itemPadding: e.target.value },
                                })
                              }
                              className="h-5 text-[9px]"
                            />
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] text-muted-foreground">Box Shadow</label>
                          <Input
                            type="text"
                            placeholder="0 4px 12px rgba(0,0,0,0.15)"
                            value={selectedInstance.props?.menuShadow || ""}
                            onChange={(e) =>
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, menuShadow: e.target.value },
                              })
                            }
                            className="h-5 text-[9px]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Image Settings */}
                  {selectedInstance.type === "Image" && (
                    <div className="space-y-2">
                      <ImageUpload
                        currentValue={selectedInstance.props.src || ""}
                        onImageChange={(url) => {
                          updateInstance(selectedInstance.id, {
                            props: { ...selectedInstance.props, src: url },
                          });
                        }}
                        mode="src"
                        label="Image Source"
                        compact
                      />
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Alt Text</label>
                        <Input
                          type="text"
                          placeholder="Image description"
                          value={selectedInstance.props.alt || ""}
                          onChange={(e) => {
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, alt: e.target.value },
                            });
                          }}
                          className="h-5 text-[10px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Video Settings */}
                  {selectedInstance.type === "Video" && (
                    <div className="space-y-2">
                      <VideoUpload
                        currentValue={selectedInstance.props.src || ""}
                        onVideoChange={(url) => {
                          updateInstance(selectedInstance.id, {
                            props: { ...selectedInstance.props, src: url },
                          });
                        }}
                        loop={selectedInstance.props.loop || false}
                        autoplay={selectedInstance.props.autoplay || false}
                        showControls={selectedInstance.props.controls || false}
                        onLoopChange={(loop) => {
                          updateInstance(selectedInstance.id, {
                            props: { ...selectedInstance.props, loop },
                          });
                        }}
                        onAutoplayChange={(autoplay) => {
                          updateInstance(selectedInstance.id, {
                            props: { ...selectedInstance.props, autoplay },
                          });
                        }}
                        onShowControlsChange={(controls) => {
                          updateInstance(selectedInstance.id, {
                            props: { ...selectedInstance.props, controls },
                          });
                        }}
                        label="Video Source"
                      />
                    </div>
                  )}

                  {/* YouTube Settings */}
                  {selectedInstance.type === "Youtube" && (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Video ID</label>
                        <Input
                          type="text"
                          placeholder="dQw4w9WgXcQ"
                          value={selectedInstance.props.videoId || ""}
                          onChange={(e) => {
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, videoId: e.target.value },
                            });
                          }}
                          className="h-5 text-[10px]"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <label className="flex items-center gap-1 text-[10px]">
                          <input
                            type="checkbox"
                            checked={selectedInstance.props.autoplay || false}
                            onChange={(e) =>
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, autoplay: e.target.checked },
                              })
                            }
                            className="w-3 h-3"
                          />
                          Autoplay
                        </label>
                        <label className="flex items-center gap-1 text-[10px]">
                          <input
                            type="checkbox"
                            checked={selectedInstance.props.loop || false}
                            onChange={(e) =>
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, loop: e.target.checked },
                              })
                            }
                            className="w-3 h-3"
                          />
                          Loop
                        </label>
                        <label className="flex items-center gap-1 text-[10px]">
                          <input
                            type="checkbox"
                            checked={selectedInstance.props.muted || false}
                            onChange={(e) =>
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, muted: e.target.checked },
                              })
                            }
                            className="w-3 h-3"
                          />
                          Muted
                        </label>
                        <label className="flex items-center gap-1 text-[10px]">
                          <input
                            type="checkbox"
                            checked={selectedInstance.props.controls !== false}
                            onChange={(e) =>
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, controls: e.target.checked },
                              })
                            }
                            className="w-3 h-3"
                          />
                          Controls
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Lottie Settings */}
                  {selectedInstance.type === "Lottie" && (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">JSON URL</label>
                        <Input
                          type="text"
                          placeholder="https://example.com/animation.json"
                          value={selectedInstance.props.src || ""}
                          onChange={(e) => {
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, src: e.target.value },
                            });
                          }}
                          className="h-5 text-[10px]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-1 text-[10px]">
                          <input
                            type="checkbox"
                            checked={selectedInstance.props.autoplay !== false}
                            onChange={(e) =>
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, autoplay: e.target.checked },
                              })
                            }
                            className="w-3 h-3"
                          />
                          Autoplay
                        </label>
                        <label className="flex items-center gap-1 text-[10px]">
                          <input
                            type="checkbox"
                            checked={selectedInstance.props.loop !== false}
                            onChange={(e) =>
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, loop: e.target.checked },
                              })
                            }
                            className="w-3 h-3"
                          />
                          Loop
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Navigation Settings */}
                  {selectedInstance.type === "Navigation" && (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Layout</label>
                        <select
                          className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
                          value={selectedInstance.props.alignment || "left-right"}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, alignment: e.target.value },
                            })
                          }
                        >
                          <option value="left-right">Logo Left / Menu Right</option>
                          <option value="center">Logo Center</option>
                          <option value="right-left">Logo Right / Menu Left</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Mobile Animation</label>
                        <select
                          className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
                          value={selectedInstance.props.mobileAnimation || "slide"}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, mobileAnimation: e.target.value },
                            })
                          }
                        >
                          <option value="none">None</option>
                          <option value="slide">Slide</option>
                          <option value="fade">Fade</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Hamburger Style</label>
                        <select
                          className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
                          value={selectedInstance.props.hamburgerStyle || "classic"}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, hamburgerStyle: e.target.value },
                            })
                          }
                        >
                          <option value="classic">Classic</option>
                          <option value="minimal">Minimal</option>
                          <option value="dots">Dots</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Link Settings */}
                  {selectedInstance.type === "Link" && (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">URL</label>
                        <Input
                          type="text"
                          placeholder="https://..."
                          value={selectedInstance.props.href || selectedInstance.props.url || ""}
                          onChange={(e) => {
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, href: e.target.value, url: e.target.value },
                            });
                          }}
                          className="h-5 text-[10px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Target</label>
                        <select
                          className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
                          value={selectedInstance.props.target || "_self"}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, target: e.target.value },
                            })
                          }
                        >
                          <option value="_self">Same Window</option>
                          <option value="_blank">New Tab</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Button Settings */}
                  {selectedInstance.type === "Button" && (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Button Text</label>
                        <Input
                          type="text"
                          placeholder="Button"
                          value={selectedInstance.props.children || selectedInstance.props.text || ""}
                          onChange={(e) => {
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, children: e.target.value, text: e.target.value },
                            });
                          }}
                          className="h-5 text-[10px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Button Type</label>
                        <select
                          className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
                          value={selectedInstance.props.variant || "primary"}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, variant: e.target.value },
                            })
                          }
                        >
                          <option value="primary">Primary</option>
                          <option value="secondary">Secondary</option>
                          <option value="outline">Outline</option>
                          <option value="ghost">Ghost</option>
                          <option value="link">Link</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">URL (optional)</label>
                        <Input
                          type="text"
                          placeholder="https://..."
                          value={selectedInstance.props.href || selectedInstance.props.url || ""}
                          onChange={(e) => {
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, href: e.target.value, url: e.target.value },
                            });
                          }}
                          className="h-5 text-[10px]"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="button-new-tab"
                          checked={selectedInstance.props.target === "_blank"}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, target: e.target.checked ? "_blank" : "_self" },
                            })
                          }
                          className="h-3 w-3"
                        />
                        <label htmlFor="button-new-tab" className="text-[10px] text-muted-foreground">
                          Open in new tab
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">Icon Left</label>
                          <select
                            className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
                            value={selectedInstance.props.iconLeft || ""}
                            onChange={(e) =>
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, iconLeft: e.target.value },
                              })
                            }
                          >
                            <option value="">None</option>
                            <option value="chevron-left">Chevron Left</option>
                            <option value="arrow-left">Arrow Left</option>
                            <option value="plus">Plus</option>
                            <option value="check">Check</option>
                            <option value="download">Download</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">Icon Right</label>
                          <select
                            className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
                            value={selectedInstance.props.iconRight || ""}
                            onChange={(e) =>
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, iconRight: e.target.value },
                              })
                            }
                          >
                            <option value="">None</option>
                            <option value="chevron-right">Chevron Right</option>
                            <option value="arrow-right">Arrow Right</option>
                            <option value="external-link">External Link</option>
                            <option value="plus">Plus</option>
                            <option value="x">Close</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Settings */}
                  {selectedInstance.type === "Form" && (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Action</label>
                        <Input
                          type="text"
                          placeholder="Form action URL"
                          value={selectedInstance.props.action || ""}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, action: e.target.value },
                            })
                          }
                          className="h-5 text-[10px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Method</label>
                        <select
                          className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
                          value={selectedInstance.props.method || "POST"}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, method: e.target.value },
                            })
                          }
                        >
                          <option value="POST">POST</option>
                          <option value="GET">GET</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Redirect URL</label>
                        <Input
                          type="text"
                          placeholder="After submit redirect"
                          value={selectedInstance.props.redirectUrl || ""}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, redirectUrl: e.target.value },
                            })
                          }
                          className="h-5 text-[10px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* FormButton Settings */}
                  {selectedInstance.type === "FormButton" && (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Type</label>
                        <select
                          className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
                          value={selectedInstance.props.type || "button"}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, type: e.target.value },
                            })
                          }
                        >
                          <option value="button">Button</option>
                          <option value="submit">Submit</option>
                          <option value="reset">Reset</option>
                        </select>
                      </div>
                      <label className="flex items-center gap-1 text-[10px]">
                        <input
                          type="checkbox"
                          checked={selectedInstance.props.disabled || false}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, disabled: e.target.checked },
                            })
                          }
                          className="w-3 h-3"
                        />
                        Disabled
                      </label>
                    </div>
                  )}

                  {/* InputLabel Settings */}
                  {selectedInstance.type === "InputLabel" && (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">For (Input ID)</label>
                        <Input
                          type="text"
                          placeholder="input-id"
                          value={selectedInstance.props.htmlFor || ""}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, htmlFor: e.target.value },
                            })
                          }
                          className="h-5 text-[10px]"
                        />
                      </div>
                      <label className="flex items-center gap-1 text-[10px]">
                        <input
                          type="checkbox"
                          checked={selectedInstance.props.required || false}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, required: e.target.checked },
                            })
                          }
                          className="w-3 h-3"
                        />
                        Required
                      </label>
                    </div>
                  )}

                  {/* TextInput Settings */}
                  {selectedInstance.type === "TextInput" && (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Placeholder</label>
                        <Input
                          type="text"
                          value={selectedInstance.props.placeholder || ""}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, placeholder: e.target.value },
                            })
                          }
                          className="h-5 text-[10px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Type</label>
                        <select
                          className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
                          value={selectedInstance.props.type || "text"}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, type: e.target.value },
                            })
                          }
                        >
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="password">Password</option>
                          <option value="tel">Phone</option>
                          <option value="url">URL</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-1 text-[10px]">
                          <input
                            type="checkbox"
                            checked={selectedInstance.props.required || false}
                            onChange={(e) =>
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, required: e.target.checked },
                              })
                            }
                            className="w-3 h-3"
                          />
                          Required
                        </label>
                        <label className="flex items-center gap-1 text-[10px]">
                          <input
                            type="checkbox"
                            checked={selectedInstance.props.disabled || false}
                            onChange={(e) =>
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, disabled: e.target.checked },
                              })
                            }
                            className="w-3 h-3"
                          />
                          Disabled
                        </label>
                      </div>
                    </div>
                  )}

                  {/* TextArea Settings */}
                  {selectedInstance.type === "TextArea" && (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Placeholder</label>
                        <Input
                          type="text"
                          value={selectedInstance.props.placeholder || ""}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, placeholder: e.target.value },
                            })
                          }
                          className="h-5 text-[10px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Rows</label>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={selectedInstance.props.rows || 4}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, rows: parseInt(e.target.value) || 4 },
                            })
                          }
                          className="h-5 text-[10px] w-16"
                        />
                      </div>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-1 text-[10px]">
                          <input
                            type="checkbox"
                            checked={selectedInstance.props.required || false}
                            onChange={(e) =>
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, required: e.target.checked },
                              })
                            }
                            className="w-3 h-3"
                          />
                          Required
                        </label>
                        <label className="flex items-center gap-1 text-[10px]">
                          <input
                            type="checkbox"
                            checked={selectedInstance.props.disabled || false}
                            onChange={(e) =>
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, disabled: e.target.checked },
                              })
                            }
                            className="w-3 h-3"
                          />
                          Disabled
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Select Settings */}
                  {selectedInstance.type === "Select" && (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Placeholder</label>
                        <Input
                          type="text"
                          value={selectedInstance.props.placeholder || ""}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, placeholder: e.target.value },
                            })
                          }
                          className="h-5 text-[10px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-muted-foreground">Options</label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const currentOptions = selectedInstance.props.options || [];
                              updateInstance(selectedInstance.id, {
                                props: {
                                  ...selectedInstance.props,
                                  options: [
                                    ...currentOptions,
                                    { id: Date.now().toString(), label: "Option", value: "option" },
                                  ],
                                },
                              });
                            }}
                            className="h-4 text-[9px] px-1"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </Button>
                        </div>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {(selectedInstance.props.options || []).map((opt: any, i: number) => (
                            <div key={opt.id} className="flex items-center gap-1">
                              <Input
                                value={opt.label}
                                onChange={(e) => {
                                  const newOpts = [...selectedInstance.props.options];
                                  newOpts[i] = { ...opt, label: e.target.value };
                                  updateInstance(selectedInstance.id, {
                                    props: { ...selectedInstance.props, options: newOpts },
                                  });
                                }}
                                className="h-4 text-[9px] flex-1"
                                placeholder="label"
                              />
                              <Input
                                value={opt.value}
                                onChange={(e) => {
                                  const newOpts = [...selectedInstance.props.options];
                                  newOpts[i] = { ...opt, value: e.target.value };
                                  updateInstance(selectedInstance.id, {
                                    props: { ...selectedInstance.props, options: newOpts },
                                  });
                                }}
                                className="h-4 text-[9px] flex-1"
                                placeholder="value"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const newOpts = selectedInstance.props.options.filter(
                                    (_: any, idx: number) => idx !== i,
                                  );
                                  updateInstance(selectedInstance.id, {
                                    props: { ...selectedInstance.props, options: newOpts },
                                  });
                                }}
                                className="h-4 w-4 p-0"
                              >
                                <X className="w-2 h-2" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* RadioGroup Settings */}
                  {selectedInstance.type === "RadioGroup" && (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Name</label>
                        <Input
                          type="text"
                          value={selectedInstance.props.name || "radio-group"}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, name: e.target.value },
                            })
                          }
                          className="h-5 text-[10px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Orientation</label>
                        <select
                          className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
                          value={selectedInstance.props.orientation || "vertical"}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, orientation: e.target.value },
                            })
                          }
                        >
                          <option value="horizontal">Horizontal</option>
                          <option value="vertical">Vertical</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-muted-foreground">Options</label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const currentOptions = selectedInstance.props.options || [];
                              updateInstance(selectedInstance.id, {
                                props: {
                                  ...selectedInstance.props,
                                  options: [
                                    ...currentOptions,
                                    { id: Date.now().toString(), label: "Option", value: "option" },
                                  ],
                                },
                              });
                            }}
                            className="h-4 text-[9px] px-1"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </Button>
                        </div>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {(selectedInstance.props.options || []).map((opt: any, i: number) => (
                            <div key={opt.id} className="flex items-center gap-1">
                              <Input
                                value={opt.label}
                                onChange={(e) => {
                                  const newOpts = [...selectedInstance.props.options];
                                  newOpts[i] = { ...opt, label: e.target.value };
                                  updateInstance(selectedInstance.id, {
                                    props: { ...selectedInstance.props, options: newOpts },
                                  });
                                }}
                                className="h-4 text-[9px] flex-1"
                                placeholder="label"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const newOpts = selectedInstance.props.options.filter(
                                    (_: any, idx: number) => idx !== i,
                                  );
                                  updateInstance(selectedInstance.id, {
                                    props: { ...selectedInstance.props, options: newOpts },
                                  });
                                }}
                                className="h-4 w-4 p-0"
                              >
                                <X className="w-2 h-2" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CheckboxField Settings */}
                  {selectedInstance.type === "CheckboxField" && (
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1 text-[10px]">
                        <input
                          type="checkbox"
                          checked={selectedInstance.props.required || false}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, required: e.target.checked },
                            })
                          }
                          className="w-3 h-3"
                        />
                        Required
                      </label>
                      <label className="flex items-center gap-1 text-[10px]">
                        <input
                          type="checkbox"
                          checked={selectedInstance.props.disabled || false}
                          onChange={(e) =>
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, disabled: e.target.checked },
                            })
                          }
                          className="w-3 h-3"
                        />
                        Disabled
                      </label>
                    </div>
                  )}

                  {/* Table Settings */}
                  {selectedInstance.type === "Table" && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="space-y-1 flex-1">
                          <label className="text-[10px] text-muted-foreground">Rows</label>
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            value={selectedInstance.props?.rows || 3}
                            onChange={(e) => {
                              const newRows = parseInt(e.target.value) || 3;
                              const currentRows = selectedInstance.props?.rows || 3;
                              const currentData = selectedInstance.props?.data || [];
                              const columns = selectedInstance.props?.columns || 3;
                              let newData = [...currentData];
                              if (newRows > currentRows) {
                                for (let i = currentRows; i < newRows; i++) {
                                  newData.push(Array(columns).fill(""));
                                }
                              } else {
                                newData = newData.slice(0, newRows);
                              }
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, rows: newRows, data: newData },
                              });
                            }}
                            className="h-5 text-[10px]"
                          />
                        </div>
                        <div className="space-y-1 flex-1">
                          <label className="text-[10px] text-muted-foreground">Columns</label>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            value={selectedInstance.props?.columns || 3}
                            onChange={(e) => {
                              const newColumns = parseInt(e.target.value) || 3;
                              const currentColumns = selectedInstance.props?.columns || 3;
                              const currentHeaders = selectedInstance.props?.headers || [];
                              const currentData = selectedInstance.props?.data || [];
                              let newHeaders = [...currentHeaders];
                              if (newColumns > currentColumns) {
                                for (let i = currentColumns; i < newColumns; i++) {
                                  newHeaders.push(`Col ${i + 1}`);
                                }
                              } else {
                                newHeaders = newHeaders.slice(0, newColumns);
                              }
                              const newData = currentData.map((row: string[]) => {
                                const newRow = [...row];
                                if (newColumns > currentColumns) {
                                  for (let i = currentColumns; i < newColumns; i++) {
                                    newRow.push("");
                                  }
                                } else {
                                  return newRow.slice(0, newColumns);
                                }
                                return newRow;
                              });
                              updateInstance(selectedInstance.id, {
                                props: {
                                  ...selectedInstance.props,
                                  columns: newColumns,
                                  headers: newHeaders,
                                  data: newData,
                                },
                              });
                            }}
                            className="h-5 text-[10px]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Accordion Settings */}
                  {selectedInstance.type === "Accordion" && <AccordionDataEditor instance={selectedInstance} />}

                  {/* Carousel Settings */}
                  {selectedInstance.type === "Carousel" && <CarouselDataEditor instance={selectedInstance} />}

                  {/* Tabs Settings */}
                  {selectedInstance.type === "Tabs" && <TabsDataEditor instance={selectedInstance} />}

                  {/* Slider Settings */}
                  {selectedInstance.type === "Slider" && <SliderDataEditor instance={selectedInstance} />}

                  {/* Alert Dialog Settings */}
                  {selectedInstance.type === "AlertDialog" && <AlertDialogDataEditor instance={selectedInstance} />}

                  {/* Avatar Settings */}
                  {selectedInstance.type === "Avatar" && <AvatarDataEditor instance={selectedInstance} />}

                  {/* Badge Settings */}
                  {selectedInstance.type === "Badge" && <BadgeDataEditor instance={selectedInstance} />}

                  {/* Breadcrumb Settings */}
                  {selectedInstance.type === "Breadcrumb" && <BreadcrumbDataEditor instance={selectedInstance} />}

                  {/* Progress Settings */}
                  {selectedInstance.type === "ProgressBar" && <ProgressDataEditor instance={selectedInstance} />}

                  {/* Tooltip Settings */}
                  {selectedInstance.type === "Tooltip" && <TooltipDataEditor instance={selectedInstance} />}

                  {/* Popover Settings */}
                  {selectedInstance.type === "Popover" && <PopoverDataEditor instance={selectedInstance} />}

                  {/* Drawer Settings */}
                  {selectedInstance.type === "Drawer" && <DrawerDataEditor instance={selectedInstance} />}

                  {/* Sheet Settings */}
                  {selectedInstance.type === "Sheet" && <SheetDataEditor instance={selectedInstance} />}

                  {/* Switch Settings */}
                  {selectedInstance.type === "Switch" && <SwitchDataEditor instance={selectedInstance} />}

                  {/* Toggle Settings */}
                  {selectedInstance.type === "Toggle" && <ToggleDataEditor instance={selectedInstance} />}

                  {/* Toggle Group Settings */}
                  {selectedInstance.type === "ToggleGroup" && <ToggleGroupDataEditor instance={selectedInstance} />}

                  {/* Alert Settings */}
                  {selectedInstance.type === "Alert" && <AlertDataEditor instance={selectedInstance} />}

                  {/* Pagination Settings */}
                  {selectedInstance.type === "Pagination" && <PaginationDataEditor instance={selectedInstance} />}

                  {/* OTP Input Settings */}
                  {selectedInstance.type === "OTPInput" && <OTPInputDataEditor instance={selectedInstance} />}
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Page Settings Drawer */}
      <Sheet open={pageSettingsOpen} onOpenChange={setPageSettingsOpen}>
        <SheetContent side="right" className="w-[340px] overflow-y-auto p-4">
          <SheetHeader className="pb-3 space-y-1">
            <SheetTitle className="text-sm">Page Settings</SheetTitle>
            <SheetDescription className="text-xs">Configure settings for this page</SheetDescription>
          </SheetHeader>
          <div className="mt-3 space-y-3">
            {/* Page Name */}
            <div className="space-y-1.5">
              <Label htmlFor="page-name" className="text-xs">
                Page Name
              </Label>
              <Input
                id="page-name"
                value={pageNames[selectedPageForSettings] || ""}
                onChange={(e) => onPageNameChange(selectedPageForSettings, e.target.value)}
                className="h-7 text-xs"
              />
              <div className="flex items-center gap-2 mt-1.5">
                <Checkbox
                  id="home-page"
                  checked={homePage === selectedPageForSettings}
                  onCheckedChange={(checked) => {
                    if (checked) onSetHomePage(selectedPageForSettings);
                  }}
                  className="h-3 w-3"
                />
                <Label htmlFor="home-page" className="text-xs font-normal">
                  Make "{pageNames[selectedPageForSettings]}" the home page
                </Label>
              </div>
            </div>

            {/* Path */}
            <div className="space-y-1.5">
              <Label htmlFor="page-path" className="text-xs">
                Path
              </Label>
              <Input
                id="page-path"
                value={`/${pageNames[selectedPageForSettings]?.toLowerCase().replace(/\s+/g, "-") || ""}`}
                disabled
                className="bg-muted h-7 text-xs"
              />
            </div>

            {/* Status Code */}
            <div className="space-y-1.5">
              <Label htmlFor="status-code" className="text-xs">
                Status Code
              </Label>
              <Input
                id="status-code"
                value={statusCode}
                onChange={(e) => setStatusCode(e.target.value)}
                placeholder="200"
                className="h-7 text-xs"
              />
            </div>

            {/* Redirect */}
            <div className="space-y-1.5">
              <Label htmlFor="redirect" className="text-xs">
                Redirect
              </Label>
              <Input
                id="redirect"
                value={redirect}
                onChange={(e) => setRedirect(e.target.value)}
                placeholder="/another-path"
                className="h-7 text-xs"
              />
            </div>

            <Separator className="my-3" />

            {/* Search Section */}
            <div className="space-y-2.5">
              <div>
                <h3 className="text-xs font-semibold mb-0.5">Search</h3>
                <p className="text-[10px] text-muted-foreground">
                  Optimize the way this page appears in search results.
                </p>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="meta-title" className="text-xs">
                  Title
                </Label>
                <Input
                  id="meta-title"
                  value={pageMetaTitle}
                  onChange={(e) => setPageMetaTitle(e.target.value)}
                  placeholder="Untitled"
                  className="h-7 text-xs"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="meta-description" className="text-xs">
                  Description
                </Label>
                <Textarea
                  id="meta-description"
                  value={pageMetaDescription}
                  onChange={(e) => setPageMetaDescription(e.target.value)}
                  placeholder="Enter page description"
                  rows={3}
                  className="text-xs resize-none"
                />
              </div>

              {/* Language */}
              <div className="space-y-1.5">
                <Label htmlFor="language" className="text-xs">
                  Language
                </Label>
                <Input
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="en-US"
                  className="h-7 text-xs"
                />
              </div>
            </div>

            <Separator className="my-3" />

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex items-center gap-1.5 h-7 text-xs"
                onClick={() => {
                  onDuplicatePage(selectedPageForSettings);
                  setPageSettingsOpen(false);
                }}
              >
                <Copy className="w-3 h-3" />
                Duplicate
              </Button>
              <Button
                variant="destructive"
                className="flex items-center gap-1.5 h-7 text-xs"
                onClick={() => {
                  onDeletePage(selectedPageForSettings);
                  setPageSettingsOpen(false);
                }}
                disabled={safePages.length === 1}
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
