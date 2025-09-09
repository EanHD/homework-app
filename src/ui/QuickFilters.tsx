import { SegmentedControl } from '@mantine/core';

export type FilterValue = 'all' | 'overdue' | 'today' | 'done';

export type QuickFiltersProps = {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
};

export default function QuickFilters({ value, onChange }: QuickFiltersProps) {
  return (
    <SegmentedControl
      value={value}
      onChange={(v) => onChange(v as FilterValue)}
      data={[
        { label: 'All', value: 'all' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'Due today', value: 'today' },
        { label: 'Done', value: 'done' },
      ]}
    />
  );
}

