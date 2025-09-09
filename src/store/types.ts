export type ID = string;

export type Class = {
  id: ID;
  name: string;
  color: string; // hex
  emoji: string; // single emoji for label
};

export type Assignment = {
  id: ID;
  title: string;
  classId: ID;
  dueAt: string; // ISO string
  completed: boolean;
  notes: string | null;
  remindAtMinutes: number | null; // minutes before dueAt
};

export type Preferences = Record<string, unknown>;

export type State = {
  classes: Class[];
  assignments: Assignment[];
  preferences: Preferences;
};

export type StoreActions = {
  addClass(input: Omit<Class, 'id'>): Class;
  updateClass(input: Partial<Omit<Class, 'id'>> & { id: ID }): void;
  removeClass(id: ID): void;

  addAssignment(input: Omit<Assignment, 'id' | 'completed'> & { completed?: boolean }): Assignment;
  updateAssignment(input: Partial<Omit<Assignment, 'id'>> & { id: ID }): void;
  toggleComplete(id: ID, value?: boolean): void;
  removeAssignment(id: ID): void;
};

export type Selectors = {
  // Implemented in T009; placeholder shape for now
  getAssignmentsForToday(state: State): Assignment[];
  getIncompleteAssignmentIds(state: State): ID[];
  byDueDateAscending(list: Assignment[]): Assignment[];
  progressPercent(state: State): number; // 0..100
  streakDays(state: State): number;
  getClassMap(state: State): Record<ID, Class>;
};

export type Store = {
  getState(): State;
  subscribe(fn: (state: State) => void): () => void;
  actions: StoreActions;
  getSelectors(): Selectors;
};
