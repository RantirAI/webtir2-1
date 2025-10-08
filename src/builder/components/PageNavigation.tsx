import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, Monitor, Tablet, Smartphone } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface PageNavigationProps {
  currentPage: string;
  pages: string[];
  onPageChange: (page: string) => void;
  onAddPage: () => void;
  currentBreakpoint: string;
  onBreakpointChange: (breakpoint: string) => void;
}

const breakpoints = [
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: '960px' },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: '768px' },
  { id: 'mobile-landscape', label: 'Mobile L', icon: Smartphone, width: '640px' },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: '375px' },
];

export const PageNavigation: React.FC<PageNavigationProps> = ({
  currentPage,
  pages,
  onPageChange,
  onAddPage,
  currentBreakpoint,
  onBreakpointChange,
}) => {
  return (
    <div 
      className="backdrop-blur-md border border-border rounded-lg shadow-lg px-3 py-2 flex items-center gap-3 bg-white/70 dark:bg-zinc-900/70"
    >
      {/* Pages Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-3 gap-2">
            {currentPage}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {pages.map((page) => (
            <DropdownMenuItem key={page} onClick={() => onPageChange(page)}>
              {page}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Page Button */}
      <Button variant="ghost" size="sm" className="h-8 px-3 gap-2" onClick={onAddPage}>
        <Plus className="w-4 h-4" />
        Add Page
      </Button>

      <div className="h-6 w-px bg-border" />

      {/* Breakpoint Selector */}
      <div className="flex gap-1">
        {breakpoints.map((bp) => {
          const Icon = bp.icon;
          return (
            <Button
              key={bp.id}
              variant="ghost"
              size="sm"
              className={`h-8 px-3 gap-2 ${
                currentBreakpoint === bp.id ? 'bg-[#F5F5F5] dark:bg-zinc-800' : ''
              }`}
              onClick={() => onBreakpointChange(bp.id)}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs">{bp.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
