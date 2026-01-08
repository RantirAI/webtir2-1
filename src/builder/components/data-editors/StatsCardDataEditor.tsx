import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface StatsCardDataEditorProps {
  instance: ComponentInstance;
}

export const StatsCardDataEditor: React.FC<StatsCardDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  // Structure: Div > [LabelText, ValueText, TrendText]
  const labelChild = instance.children?.[0];
  const valueChild = instance.children?.[1];
  const trendChild = instance.children?.[2];

  // Get current values
  const labelText = labelChild?.props?.children || 'Total Revenue';
  const valueText = valueChild?.props?.children || '$45,231.89';
  const trendText = trendChild?.props?.children || '+20.1% from last month';
  const showTrend = instance.props?.showTrend !== false;
  const trendDirection = instance.props?.trendDirection || 'positive';

  const updateCardProp = (prop: string, value: any) => {
    updateInstance(instance.id, {
      props: { ...instance.props, [prop]: value }
    });
  };

  const updateLabel = (value: string) => {
    if (!labelChild) return;
    updateInstance(labelChild.id, {
      props: { ...labelChild.props, children: value }
    });
  };

  const updateValue = (value: string) => {
    if (!valueChild) return;
    updateInstance(valueChild.id, {
      props: { ...valueChild.props, children: value }
    });
  };

  const updateTrend = (value: string) => {
    if (!trendChild) return;
    updateInstance(trendChild.id, {
      props: { ...trendChild.props, children: value }
    });
  };

  return (
    <div className="space-y-3">
      {/* Content */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Label / Metric Name</Label>
        <Input
          value={labelText}
          onChange={(e) => updateLabel(e.target.value)}
          placeholder="Total Revenue"
          className="h-7 text-[10px] text-foreground bg-background"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Value</Label>
        <Input
          value={valueText}
          onChange={(e) => updateValue(e.target.value)}
          placeholder="$45,231.89"
          className="h-7 text-[10px] text-foreground bg-background"
        />
      </div>

      <Separator />

      {/* Trend Settings */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Trend</Label>
          <label className="flex items-center gap-2 text-[9px] text-muted-foreground">
            <Checkbox
              checked={showTrend}
              onCheckedChange={(checked) => updateCardProp('showTrend', !!checked)}
              className="w-3 h-3"
            />
            Show
          </label>
        </div>

        {showTrend && (
          <>
            <div className="space-y-1.5">
              <Label className="text-[9px] text-muted-foreground">Trend Text</Label>
              <Input
                value={trendText}
                onChange={(e) => updateTrend(e.target.value)}
                placeholder="+20.1% from last month"
                className="h-7 text-[10px] text-foreground bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] text-muted-foreground">Trend Direction</Label>
              <Select value={trendDirection} onValueChange={(val) => updateCardProp('trendDirection', val)}>
                <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive" className="text-[10px]">
                    <span className="flex items-center gap-2">
                      <span className="text-green-600">↑</span> Positive (Green)
                    </span>
                  </SelectItem>
                  <SelectItem value="negative" className="text-[10px]">
                    <span className="flex items-center gap-2">
                      <span className="text-red-600">↓</span> Negative (Red)
                    </span>
                  </SelectItem>
                  <SelectItem value="neutral" className="text-[10px]">
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground">→</span> Neutral (Gray)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
