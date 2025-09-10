import { useState, useEffect } from 'react';
import { ActionIcon, Popover, Text, Group, Box } from '@mantine/core';
import { IconMoodSmile } from '@tabler/icons-react';
import { useReducedMotion } from '@mantine/hooks';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

export interface EmojiButtonProps {
  value?: string;
  onChange?: (emoji: string) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ariaLabel?: string;
  withLabel?: boolean;
  disabled?: boolean;
}

interface EmojiData {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords: string[];
  shortcodes: string;
}

const STORAGE_KEY = 'homework-app-emoji-prefs';

interface EmojiPrefs {
  skinTone: number;
  frequentlyUsed: string[];
}

function loadEmojiPrefs(): EmojiPrefs {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load emoji preferences:', error);
  }
  return {
    skinTone: 1,
    frequentlyUsed: [],
  };
}

function saveEmojiPrefs(prefs: EmojiPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.warn('Failed to save emoji preferences:', error);
  }
}

export default function EmojiButton({ 
  value, 
  onChange, 
  size = 'md', 
  ariaLabel = 'Select emoji', 
  withLabel = false,
  disabled = false
}: EmojiButtonProps) {
  const [opened, setOpened] = useState(false);
  const [prefs, setPrefs] = useState<EmojiPrefs>(() => loadEmojiPrefs());
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    saveEmojiPrefs(prefs);
  }, [prefs]);

  const handleEmojiSelect = (emojiData: EmojiData) => {
    const emoji = emojiData.native;
    onChange?.(emoji);
    
    // Update frequently used
    setPrefs(prev => {
      const newFrequentlyUsed = [emoji, ...prev.frequentlyUsed.filter(e => e !== emoji)].slice(0, 24);
      return {
        ...prev,
        frequentlyUsed: newFrequentlyUsed,
      };
    });
    
    setOpened(false);
  };

  const handleSkinToneChange = (skinTone: number) => {
    setPrefs(prev => ({ ...prev, skinTone }));
  };

  const current = value ?? '📚';
  const buttonContent = current ? (
    <Group gap={4} align="center">
      <Text component="span" style={{ fontSize: size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 20 : size === 'xl' ? 24 : 16 }}>
        {current}
      </Text>
      {withLabel && <Text size="sm">Change</Text>}
    </Group>
  ) : (
    <Group gap={4} align="center">
      <IconMoodSmile size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 20 : size === 'xl' ? 24 : 16} />
      {withLabel && <Text size="sm">Add emoji</Text>}
    </Group>
  );

  return (
    <Popover
      width={350}
      position="bottom"
      withArrow={!reducedMotion}
      shadow="md"
      zIndex={400}
      withinPortal={false}
      opened={opened}
      onChange={setOpened}
      transitionProps={{ duration: reducedMotion ? 0 : 200 }}
    >
      <Popover.Target>
        <ActionIcon
          variant={value ? 'light' : 'subtle'}
          color={value ? 'blue' : 'gray'}
          size={size}
          onClick={() => !disabled && setOpened(!opened)}
          disabled={disabled}
          aria-label={value ? `${ariaLabel} (current: ${value})` : ariaLabel}
          aria-expanded={opened}
          aria-haspopup="true"
          data-focus-ring
          className={reducedMotion ? 'reducedMotion' : undefined}
          onKeyDown={(e) => {
            if ((e.key === 'e' || e.key === 'E') && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              setOpened((o) => !o);
            }
            if (e.key === 'Escape') setOpened(false);
          }}
        >
          {buttonContent}
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Box data-testid="emoji-picker" style={{ 
          '& .EmojiMart': { 
            border: 'none',
            backgroundColor: 'var(--mantine-color-body)',
          }
        }}>
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            skin={prefs.skinTone}
            onSkinChange={handleSkinToneChange}
            frequent={prefs.frequentlyUsed}
            theme="light"
            previewPosition="none"
            skinTonePosition="search"
            maxFrequentRows={2}
            perLine={8}
          />
        </Box>
      </Popover.Dropdown>
    </Popover>
  );
}
