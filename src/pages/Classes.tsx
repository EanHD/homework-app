import type { State } from '@/store/types';
import ClassesView from '@/components/ClassesView';

export type ClassesPageProps = {
  state: State;
};

export default function ClassesPage({ state }: ClassesPageProps) {
  return <ClassesView state={state} />;
}

