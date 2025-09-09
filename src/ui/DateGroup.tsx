import { Box, Text } from '@mantine/core';

export type DateGroupProps = {
  label: string; // e.g., "Wed, Sep 10"
};

export default function DateGroup({ label }: DateGroupProps) {
  return (
    <Box style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--mantine-color-body)', padding: '6px 8px' }}>
      <Text size="sm" c="dimmed">{label}</Text>
    </Box>
  );
}

