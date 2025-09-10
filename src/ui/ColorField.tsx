import { useMemo, useState } from 'react';
import { Stack, Group, ColorSwatch, ColorPicker, TextInput, Text, Button, Collapse } from '@mantine/core';

export type ColorFieldProps = {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
  withInput?: boolean;
};

const PRESETS = ['#1E88E5','#10B981','#EF4444','#F59E0B','#8B5CF6','#06B6D4','#F43F5E','#64748B','#22C55E','#EAB308','#3B82F6','#A855F7'];

function normalizeHex(input: string): string {
  let v = input.trim().toLowerCase();
  if (!v.startsWith('#')) v = `#${v}`;
  if (/^#([0-9a-f]{6})$/.test(v)) return v;
  return v; // leave as-is; caller can decide invalid styling
}

function isValidHex(v: string): boolean {
  return /^#([0-9a-f]{6})$/.test(v.trim().toLowerCase().startsWith('#') ? v.trim().toLowerCase() : `#${v.trim().toLowerCase()}`);
}

export default function ColorField({ value, onChange, label, withInput = true }: ColorFieldProps) {
  const [open, setOpen] = useState(false);
  const normalized = useMemo(() => normalizeHex(value), [value]);
  const valid = isValidHex(value);

  return (
    <Stack gap="xs">
      {label && <Text fw={500}>{label}</Text>}
      <Group wrap="wrap" gap="xs">
        {PRESETS.map((hex) => (
          <ColorSwatch
            key={hex}
            color={hex}
            radius="sm"
            onClick={() => onChange(hex.toLowerCase())}
            aria-label={`Select color ${hex}`}
            withShadow
            style={{ cursor: 'pointer' }}
            data-testid={`swatch-${hex.toLowerCase()}`}
          />
        ))}
        <Button variant="subtle" size="xs" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="colorfield-more">
          {open ? 'Hide' : 'More colors'}
        </Button>
      </Group>
      <Collapse in={open} id="colorfield-more">
        <ColorPicker
          value={normalized}
          onChange={(hex) => onChange(hex.toLowerCase())}
          format="hex"
          size="xs"
          withPicker
          style={{ maxWidth: 260 }}
        />
      </Collapse>
      {withInput && (
        <TextInput
          value={normalized}
          onChange={(e) => onChange(normalizeHex(e.currentTarget.value))}
          leftSection={<ColorSwatch color={valid ? normalized : '#ffffff'} size={14} onClick={() => setOpen(true)} aria-label="Open more colors" style={{ cursor: 'pointer' }} />}
          placeholder="#1e88e5"
          error={!valid ? 'Enter a valid hex like #1e88e5' : undefined}
        />
      )}
      <Text c="dimmed" size="xs">Pick a color or enter a hex.</Text>
    </Stack>
  );
}
