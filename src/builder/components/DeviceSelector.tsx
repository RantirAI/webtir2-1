import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

interface DeviceSelectorProps {
  currentBreakpoint: string;
  onBreakpointChange: (breakpoint: string) => void;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  currentBreakpoint,
  onBreakpointChange,
}) => {
  const getIcon = () => {
    switch (currentBreakpoint) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (currentBreakpoint) {
      case 'mobile':
        return 'Mobile';
      case 'tablet':
        return 'Tablet';
      default:
        return 'Desktop';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {getIcon()}
          <span>{getLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover">
        <DropdownMenuItem onClick={() => onBreakpointChange('desktop')} className="gap-2 cursor-pointer">
          <Monitor className="h-4 w-4" />
          <span>Desktop</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onBreakpointChange('tablet')} className="gap-2 cursor-pointer">
          <Tablet className="h-4 w-4" />
          <span>Tablet</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onBreakpointChange('mobile')} className="gap-2 cursor-pointer">
          <Smartphone className="h-4 w-4" />
          <span>Mobile</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
