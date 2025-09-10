import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Button,
  TextInput,
  Textarea,
  Select,
  Group,
  Stack,
  Divider,
  NumberInput,
  ColorInput,
  Text,
  Modal,
  Drawer,
  Switch,
  Box,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import type { Assignment, Class, ID, StoreActions } from '@/store/types';
import { useAppStore } from '@/store/app';
import EmojiButton from '@/ui/EmojiButton';

export type AssignmentFormValues = {
  title: string;
  classMode: 'existing' | 'new';
  classId: ID | '';
  newClassName: string;
  newClassEmoji: string;
  newClassColor: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  notes: string;
  remindEnabled: boolean;
  remindAtMinutes: number | '';
};

export type AssignmentFormProps = {
  opened: boolean;
  onClose: () => void;
  actions?: StoreActions;
  classes?: Class[];
  editing?: Assignment;
  onSubmitted?: (id: ID) => void;
  onToast?: (message: string) => void; // optional toast hook
  submitKey?: number; // when changes while opened, attempts submit
};

const initialValues: AssignmentFormValues = {
  title: '',
  classMode: 'existing',
  classId: '',
  newClassName: '',
  newClassEmoji: '📚',
  newClassColor: '#1E88E5',
  date: '',
  time: '',
  notes: '',
  remindEnabled: false,
  remindAtMinutes: '',
};

function isoToDateTime(iso?: string): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function dateTimeToIso(date: string, time: string): string | null {
  if (!date || !time) return null;
  const iso = new Date(`${date}T${time}`);
  if (Number.isNaN(iso.getTime())) return null;
  return iso.toISOString();
}

export default function AssignmentForm({ opened, onClose, actions, classes, editing, onSubmitted, onToast, submitKey }: AssignmentFormProps) {
  const isDesktop = useMediaQuery('(min-width: 64em)'); // ~1024px
  const [values, setValues] = useState<AssignmentFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const addClassStore = useAppStore((s) => s.addClass);
  const addAssignmentStore = useAppStore((s) => s.addAssignment);
  const updateAssignmentStore = useAppStore((s) => s.updateAssignment);
  const classesFromStore = useAppStore((s) => s.classes);

  useEffect(() => {
    if (opened) {
      if (editing) {
        const dt = isoToDateTime(editing.dueAt);
        setValues({
          title: editing.title,
          classMode: 'existing',
          classId: editing.classId,
          newClassName: '',
          newClassEmoji: '📚',
          newClassColor: '#1E88E5',
          date: dt.date,
          time: dt.time,
          notes: editing.notes ?? '',
          remindEnabled: (editing.remindAtMinutes ?? null) !== null,
          remindAtMinutes: editing.remindAtMinutes ?? '',
        });
      } else {
        setValues(initialValues);
      }
      setErrors({});
    }
  }, [opened, editing]);

  const classOptions = useMemo(() => {
    const list = classes ?? classesFromStore;
    return list.map((c) => ({ value: c.id, label: `${c.emoji} ${c.name}` }));
  }, [classes, classesFromStore]);

  const validate = (): boolean => {
    const e: Record<string, string | null> = {};
    if (!values.title.trim()) e.title = 'Title is required';
    if (values.classMode === 'existing') {
      if (!values.classId) e.classId = 'Select a class';
    } else {
      if (!values.newClassName.trim()) e.newClassName = 'Class name is required';
      if (!values.newClassEmoji.trim()) e.newClassEmoji = 'Emoji is required';
      if (!/^#?[0-9a-fA-F]{6}$/.test(values.newClassColor)) e.newClassColor = 'Enter a valid hex color';
    }
    if (!values.date) e.date = 'Date is required';
    if (!values.time) e.time = 'Time is required';
    const iso = dateTimeToIso(values.date, values.time);
    if (!iso) e.time = 'Enter a valid date/time';
    if (values.remindEnabled) {
      if (values.remindAtMinutes === '' || (values.remindAtMinutes as number) < 0) {
        e.remindAtMinutes = 'Reminder must be ≥ 0 minutes';
      }
    }
    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const iso = dateTimeToIso(values.date, values.time)!;
    let classId: ID = values.classId as ID;
    if (values.classMode === 'new') {
      const created = await (actions?.addClass ?? addClassStore)({
        name: values.newClassName.trim(),
        emoji: values.newClassEmoji.trim(),
        color: values.newClassColor.startsWith('#') ? values.newClassColor : `#${values.newClassColor}`,
      });
      classId = (created as any).id as ID;
    }
    const payload = {
      title: values.title.trim(),
      classId,
      dueAt: iso,
      notes: values.notes.trim() || null,
      remindAtMinutes: values.remindEnabled ? Number(values.remindAtMinutes) : null,
    };
    if (editing) {
      await (actions?.updateAssignment ?? updateAssignmentStore)({ id: editing.id, ...payload } as any);
      onSubmitted?.(editing.id);
    } else {
      const a = await (actions?.addAssignment ?? addAssignmentStore)(payload as any);
      onSubmitted?.((a as any).id);
    }
    onToast?.('Saved');
    onClose();
  };

  // Allow parent to request submission via submitKey changes
  useEffect(() => {
    if (!opened) return;
    if (submitKey === undefined) return;
    // Attempt to submit when triggered
    handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitKey]);

  const body = (
    <Stack gap="md">
      <TextInput
        label="Title"
        placeholder="e.g., Essay draft"
        value={values.title}
        onChange={(e) => setValues((v) => ({ ...v, title: e.currentTarget.value }))}
        error={errors.title}
        required
      />

      <Select
        label="Class"
        placeholder="Select a class"
        data={[{ value: '__new__', label: '➕ Create new class…' }, ...classOptions]}
        value={values.classMode === 'new' ? '__new__' : values.classId}
        onChange={(val) =>
          setValues((v) =>
            val === '__new__'
              ? { ...v, classMode: 'new', classId: '' }
              : { ...v, classMode: 'existing', classId: (val as ID) ?? '' }
          )
        }
        error={values.classMode === 'existing' ? errors.classId : null}
      />

      {values.classMode === 'new' && (
        <Stack gap="sm">
          <Group align="flex-end" grow>
            <TextInput
              label="Name"
              placeholder="e.g., History"
              value={values.newClassName}
              onChange={(e) => setValues((v) => ({ ...v, newClassName: e.currentTarget.value }))}
              error={errors.newClassName}
            />
            <TextInput
              label="Emoji"
              placeholder="e.g., 📚"
              maxLength={2}
              value={values.newClassEmoji}
              onChange={(e) => setValues((v) => ({ ...v, newClassEmoji: e.currentTarget.value }))}
              error={errors.newClassEmoji}
            />
          </Group>
          <ColorInput
            label="Color"
            format="hex"
            value={values.newClassColor}
            onChange={(val) => setValues((v) => ({ ...v, newClassColor: val }))}
            error={errors.newClassColor}
          />
        </Stack>
      )}

      <Group grow>
        <TextInput
          label="Date"
          type="date"
          value={values.date}
          onChange={(e) => setValues((v) => ({ ...v, date: e.currentTarget.value }))}
          error={errors.date}
          required
        />
        <TextInput
          label="Time"
          type="time"
          value={values.time}
          onChange={(e) => setValues((v) => ({ ...v, time: e.currentTarget.value }))}
          error={errors.time}
          required
        />
      </Group>

      <Box>
        <Group justify="space-between" mb="xs">
          <Text component="label" size="sm" fw={500}>
            Notes
          </Text>
          <EmojiButton
            size="sm"
            ariaLabel="Add emoji to notes"
            onChange={(emoji) => {
              const textarea = notesRef.current;
              if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const currentValue = values.notes;
                const newValue = currentValue.slice(0, start) + emoji + currentValue.slice(end);
                setValues((v) => ({ ...v, notes: newValue }));
                
                // Restore cursor position after the emoji
                setTimeout(() => {
                  textarea.focus();
                  textarea.setSelectionRange(start + emoji.length, start + emoji.length);
                }, 0);
              } else {
                // Fallback: append to end
                setValues((v) => ({ ...v, notes: v.notes + emoji }));
              }
            }}
          />
        </Group>
        <Textarea
          ref={notesRef}
          placeholder="Optional notes"
          autosize
          minRows={2}
          value={values.notes}
          onChange={(e) => setValues((v) => ({ ...v, notes: e.currentTarget.value }))}
        />
      </Box>

      <Group align="flex-end" gap="md">
        <Switch
          label="Reminder"
          checked={values.remindEnabled}
          onChange={(e) => setValues((v) => ({ ...v, remindEnabled: e.currentTarget.checked }))}
        />
        <NumberInput
          label="Minutes before due"
          placeholder="e.g., 30"
          value={values.remindAtMinutes}
          onChange={(val) => setValues((v) => ({ ...v, remindAtMinutes: (val as number) ?? '' }))}
          min={0}
          disabled={!values.remindEnabled}
          error={errors.remindAtMinutes}
        />
      </Group>

      <Divider />
      <Group justify="space-between">
        <Button variant="default" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>{editing ? 'Save changes' : 'Add assignment'}</Button>
      </Group>
    </Stack>
  );

  if (isDesktop) {
    return (
      <Modal opened={opened} onClose={onClose} title={editing ? 'Edit assignment' : 'Add assignment'} size="lg" withinPortal>
        {body}
      </Modal>
    );
  }

  return (
    <Drawer opened={opened} onClose={onClose} position="bottom" size="auto" padding="md" withCloseButton title={editing ? 'Edit assignment' : 'Add assignment'}>
      {body}
    </Drawer>
  );
}
