import { useEffect, useState } from 'react';
import { Modal, Stack, TextInput, ColorInput, Group, Button, Box, Text } from '@mantine/core';
import type { Class } from '@/store/types';
import EmojiButton from '@/ui/EmojiButton';

export type ClassFormProps = {
  opened: boolean;
  onClose: () => void;
  initial?: Class;
  onSubmit: (values: { name: string; emoji: string; color: string }) => void | Promise<void>;
};

export default function ClassForm({ opened, onClose, initial, onSubmit }: ClassFormProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📚');
  const [color, setColor] = useState('#1E88E5');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (opened) {
      setName(initial?.name ?? '');
      setEmoji(initial?.emoji ?? '📚');
      setColor(initial?.color ?? '#1E88E5');
      setError(null);
    }
  }, [opened, initial]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    await onSubmit({ name: name.trim(), emoji: emoji.trim(), color });
  };

  return (
    <Modal opened={opened} onClose={onClose} title={initial ? 'Edit class' : 'Add class'} withinPortal>
      <Stack>
        <Group align="flex-end" grow>
          <TextInput 
            label="Name" 
            value={name} 
            onChange={(e) => setName(e.currentTarget.value)} 
            error={error} 
            required 
          />

          <Box>
            <Text component="label" size="sm" fw={500} mb={4}>
              Emoji
            </Text>
            <Group gap="sm" align="center" wrap="nowrap">
              {/* Preview container: fixed square, centered, no clipping */}
              <Box
                aria-label="Emoji preview"
                style={{
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'visible',
                  lineHeight: 1,
                  borderRadius: 8,
                }}
              >
                <Text component="span" style={{ fontSize: 30, lineHeight: 1 }}>{emoji}</Text>
              </Box>

              {/* Control to change emoji */}
              <EmojiButton
                value={emoji}
                onChange={setEmoji}
                size="lg"
                ariaLabel="Select class emoji"
                withLabel
              />

              <Text size="sm" c="dimmed">
                Choose an emoji for this class
              </Text>
            </Group>
          </Box>
        </Group>
        
        <ColorInput label="Color" value={color} onChange={setColor} format="hex" />
        
        <Group justify="space-between">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{initial ? 'Save changes' : 'Add class'}</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
