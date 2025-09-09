import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/ui/AppShell';
import TodayPage from '@/pages/Today';
import UpcomingPage from '@/pages/Upcoming';
import ClassesPage from '@/pages/Classes';
import { createStore } from '@/store/store';
import type { NavKey } from '@/ui/AppShell';
import type { State } from '@/store/types';
import AssignmentForm from '@/ui/AssignmentForm';
import { useAppStore } from '@/store/app';
import { Button } from '@mantine/core';
import dayjs from 'dayjs';

export default function App() {
  const store = useMemo(() => createStore(), []);
  const [state, setState] = useState<State>(store.getState());
  const [active, setActive] = useState<NavKey>('today');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitKey, setSubmitKey] = useState(0);
  const classesFromStore = useAppStore((s) => s.classes);

  useEffect(() => store.subscribe(setState), [store]);
  // Hydrate app store for new pages
  useEffect(() => {
    void useAppStore.getState().loadAll();
  }, []);

  // Keyboard shortcuts: 'a' or '/' open add, Esc close, Enter submit when form open
  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName.toLowerCase();
      const editable = el.isContentEditable;
      return editable || tag === 'input' || tag === 'textarea' || tag === 'select';
    };
    const onKey = (e: KeyboardEvent) => {
      // 'a' or '/' opens add form when not typing
      if ((e.key === '/' || e.key.toLowerCase() === 'a') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (!isTypingTarget(e.target)) {
          e.preventDefault();
          setEditingId(null);
          setFormOpen(true);
          return;
        }
      }
      // Esc closes form
      if (e.key === 'Escape' && formOpen) {
        e.preventDefault();
        setFormOpen(false);
        setEditingId(null);
        return;
      }
      // Enter submits when form open and not typing in textarea
      if (e.key === 'Enter' && formOpen && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName.toLowerCase() === 'textarea')) return;
        // trigger submit
        setSubmitKey((k) => k + 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [formOpen]);

  const renderPage = () => {
    switch (active) {
      case 'today':
        return (
          <TodayPage
            onAdd={() => setFormOpen(true)}
            onEdit={(id) => {
              setEditingId(id);
              setFormOpen(true);
            }}
          />
        );
      case 'upcoming':
        return (
          <UpcomingPage
            onEdit={(id) => {
              setEditingId(id);
              setFormOpen(true);
            }}
          />
        );
      case 'classes':
        return <ClassesPage />;
      default:
        return null;
    }
  };

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <AppShell
        active={active}
        onNavigate={setActive}
        onAdd={() => setFormOpen(true)}
        title={undefined}
      >
        <div id="main" role="main">
          {renderPage()}
        </div>
      </AppShell>
      <AssignmentForm
        opened={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingId(null);
        }}
        classes={classesFromStore}
        editing={editingId ? state.assignments.find((x) => x.id === editingId) ?? undefined : undefined}
        onSubmitted={() => {
          setFormOpen(false);
          setEditingId(null);
        }}
        submitKey={submitKey}
      />

      {/* Mobile FAB */}
      <Button
        onClick={() => setFormOpen(true)}
        hiddenFrom="md"
        aria-label="Add assignment"
        style={{ position: 'fixed', right: 16, bottom: 16, borderRadius: 9999, boxShadow: '0 6px 16px rgba(0,0,0,0.18)' }}
      >
        Add
      </Button>
    </>
  );
}
