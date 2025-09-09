import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import {
  Drawer,
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
} from '@mantine/core';
import type { Assignment, Class, ID, StoreActions } from '@/store/types';

export type AssignmentFormValues = {
  title: string;
  classMode: 'existing' | 'new';
  classId: ID | '';
  newClassName: string;
  newClassEmoji: string;
  newClassColor: string;
  dueLocal: string; // yyyy-MM-ddTHH:mm
  notes: string;
  remindAtMinutes: number | '';
};

export type AssignmentFormDrawerProps = {
  opened: boolean;
  onClose: () => void;
  actions: StoreActions;
  classes: Class[];
  editing?: Assignment; // if provided, edit mode
  onSubmitted?: (id: ID) => void;
};

function isoToLocalInputValue(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
}

function localInputValueToISO(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

const initialValues: AssignmentFormValues = {
  title: '',
  classMode: 'existing',
  classId: '',
  newClassName: '',
  newClassEmoji: '📚',
  newClassColor: '#1E88E5',
  dueLocal: '',
  notes: '',
  remindAtMinutes: '',
};

export default function AssignmentFormDrawer({ opened, onClose, actions, classes, editing, onSubmitted }: AssignmentFormDrawerProps) {
  const [values, setValues] = useState<AssignmentFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (opened) {
      if (editing) {
        setValues({
          title: editing.title,
          classMode: 'existing',
          classId: editing.classId,
          newClassName: '',
          newClassEmoji: '📚',
          newClassColor: '#1E88E5',
          dueLocal: isoToLocalInputValue(editing.dueAt),
          notes: editing.notes ?? '',
          remindAtMinutes: editing.remindAtMinutes ?? '',
        });
      } else {
        setValues(initialValues);
      }
      setErrors({});
    }
  }, [opened, editing]);

  const classOptions = useMemo(
    () => classes.map((c) => ({ value: c.id, label: `${c.emoji} ${c.name}` })),
    [classes]
  );

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
    if (!values.dueLocal) e.dueLocal = 'Due date/time is required';
    const iso = localInputValueToISO(values.dueLocal);
    if (!iso) e.dueLocal = 'Enter a valid date/time';
    if (values.remindAtMinutes !== '' && (values.remindAtMinutes as number) < 0) e.remindAtMinutes = 'Must be ≥ 0';
    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const iso = localInputValueToISO(values.dueLocal)!;
    let classId: ID = values.classId as ID;
    if (values.classMode === 'new') {
      const created = actions.addClass({
        name: values.newClassName.trim(),
        emoji: values.newClassEmoji.trim(),
        color: values.newClassColor.startsWith('#') ? values.newClassColor : `#${values.newClassColor}`,
      });
      classId = created.id;
    }
    const payload = {
      title: values.title.trim(),
      classId,
      dueAt: iso,
      notes: values.notes.trim() || null,
      remindAtMinutes: values.remindAtMinutes === '' ? null : Number(values.remindAtMinutes),
    };
    if (editing) {
      actions.updateAssignment({ id: editing.id, ...payload });
      onSubmitted?.(editing.id);
    } else {
      const a = actions.addAssignment(payload);
      onSubmitted?.(a.id);
    }
    onClose();
  };

  return (
    <Drawer opened={opened} onClose={onClose} position="bottom" size="auto" padding="md" withCloseButton title={editing ? 'Edit assignment' : 'Add assignment'}>
      <Stack gap="md">
        <TextInput
          label="Title"
          placeholder="e.g., Essay draft"
          value={values.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, title: e.currentTarget.value }))}
          error={errors.title}
          required
        />

        <Select
          label="Class"
          placeholder="Select a class"
          data={[{ value: '__new__', label: '➕ Create new class…' }, ...classOptions]}
          value={values.classMode === 'new' ? '__new__' : values.classId}
          onChange={(val: string | null) =>
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, newClassName: e.currentTarget.value }))}
                error={errors.newClassName}
              />
              <TextInput
                label="Emoji"
                placeholder="e.g., 📚"
                maxLength={2}
                value={values.newClassEmoji}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, newClassEmoji: e.currentTarget.value }))}
                error={errors.newClassEmoji}
              />
            </Group>
            <ColorInput
              label="Color"
              format="hex"
              value={values.newClassColor}
              onChange={(val: string) => setValues((v) => ({ ...v, newClassColor: val }))}
              error={errors.newClassColor}
            />
          </Stack>
        )}

        <TextInput
          label="Due date/time"
          type="datetime-local"
          value={values.dueLocal}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, dueLocal: e.currentTarget.value }))}
          error={errors.dueLocal}
          required
        />

        <Textarea
          label="Notes"
          placeholder="Optional notes"
          autosize
          minRows={2}
          value={values.notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValues((v) => ({ ...v, notes: e.currentTarget.value }))}
        />

        <NumberInput
          label="Remind before (minutes)"
          placeholder="e.g., 30"
          value={values.remindAtMinutes}
          onChange={(val: string | number | undefined) => setValues((v) => ({ ...v, remindAtMinutes: (val as number) ?? '' }))}
          min={0}
          error={errors.remindAtMinutes}
        />

        <Divider />
        <Group justify="space-between">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{editing ? 'Save changes' : 'Add assignment'}</Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
