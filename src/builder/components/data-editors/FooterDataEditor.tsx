import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface FooterDataEditorProps {
  instance: ComponentInstance;
}

export const FooterDataEditor: React.FC<FooterDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  // Structure: Section > Container > [LogoText, LinksDiv > [Link...], CopyrightText]
  const container = instance.children?.[0];
  const logoChild = container?.children?.[0];
  const linksDiv = container?.children?.[1];
  const copyrightChild = container?.children?.[2];

  // Get current values
  const brandText = logoChild?.props?.children || 'Your Brand';
  const copyrightText = copyrightChild?.props?.children || '© 2024 Your Company. All rights reserved.';

  // Get links from children
  const links = linksDiv?.children?.map((child: ComponentInstance) => ({
    id: child.id,
    text: child.props?.children || '',
    href: child.props?.href || '#'
  })) || [];

  const updateBrand = (value: string) => {
    if (!logoChild) return;
    updateInstance(logoChild.id, {
      props: { ...logoChild.props, children: value }
    });
  };

  const updateCopyright = (value: string) => {
    if (!copyrightChild) return;
    updateInstance(copyrightChild.id, {
      props: { ...copyrightChild.props, children: value }
    });
  };

  const updateLink = (linkId: string, field: 'text' | 'href', value: string) => {
    const link = linksDiv?.children?.find((c: ComponentInstance) => c.id === linkId);
    if (!link) return;
    
    if (field === 'text') {
      updateInstance(linkId, {
        props: { ...link.props, children: value }
      });
    } else {
      updateInstance(linkId, {
        props: { ...link.props, href: value }
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Brand */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Brand / Logo Text</Label>
        <Input
          value={brandText}
          onChange={(e) => updateBrand(e.target.value)}
          placeholder="Your Brand"
          className="h-7 text-[10px] text-foreground bg-background"
        />
      </div>

      <Separator />

      {/* Links */}
      <div className="space-y-2 pt-1">
        <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">
          Footer Links ({links.length})
        </Label>

        <div className="space-y-3 max-h-[250px] overflow-y-auto">
          {links.map((link: { id: string; text: string; href: string }, index: number) => (
            <div key={link.id} className="space-y-1.5 p-2 bg-muted/50 rounded-md border border-border">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-medium text-muted-foreground">Link {index + 1}</span>
              </div>
              <Input
                value={link.text}
                onChange={(e) => updateLink(link.id, 'text', e.target.value)}
                placeholder="Link text..."
                className="h-6 text-[10px] text-foreground bg-background"
              />
              <Input
                value={link.href}
                onChange={(e) => updateLink(link.id, 'href', e.target.value)}
                placeholder="https://..."
                className="h-6 text-[10px] text-foreground bg-background"
              />
            </div>
          ))}
        </div>

        <p className="text-[9px] text-muted-foreground italic">
          To add/remove links, edit the Links container in the navigator.
        </p>
      </div>

      <Separator />

      {/* Copyright */}
      <div className="space-y-1.5 pt-1">
        <Label className="text-[10px] font-medium text-foreground">Copyright Text</Label>
        <Input
          value={copyrightText}
          onChange={(e) => updateCopyright(e.target.value)}
          placeholder="© 2024 Your Company. All rights reserved."
          className="h-7 text-[10px] text-foreground bg-background"
        />
        <p className="text-[9px] text-muted-foreground">
          Tip: Use the current year in your copyright notice.
        </p>
      </div>
    </div>
  );
};
