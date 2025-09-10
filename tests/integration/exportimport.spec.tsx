import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SettingsPage from '@/pages/Settings.tsx';
import { WithMantine } from '@/../tests/utils/providers';
import { useAppStore } from '@/store/app';

describe('Settings: Export/Import flows', () => {
  beforeEach(() => {
    // Reset store state and stub IO methods
    useAppStore.setState({
      exportData: (async () => ({ version: '1.0', exportedAt: new Date().toISOString(), classes: [], assignments: [] })) as any,
      importData: (async (_: string) => ({ success: true, classesAdded: 0, assignmentsAdded: 0, errors: [] })) as any,
    } as any, true);
  });

  it('clicking Export triggers download flow', async () => {
    const user = userEvent.setup();
    const createSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob://test');
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    render(
      <WithMantine>
        <SettingsPage />
      </WithMantine>
    );

    const btn = await screen.findByRole('button', { name: /export json/i });
    await user.click(btn);
    expect(createSpy).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalled();

    createSpy.mockRestore();
    revokeSpy.mockRestore();
  });

  it('importing JSON calls importData', async () => {
    const user = userEvent.setup();
    const importSpy = vi.fn(async () => ({ success: true, classesAdded: 1, assignmentsAdded: 1, errors: [] }));
    useAppStore.setState({ importData: importSpy } as any);

    render(
      <WithMantine>
        <SettingsPage />
      </WithMantine>
    );

    const importBtn = await screen.findByRole('button', { name: /import json/i });
    await user.click(importBtn);

    // The file input is hidden; select it and dispatch change
    const input = document.querySelector('input[type="file"][accept="application/json"]') as HTMLInputElement;
    const file = new File([JSON.stringify({ version: '1.0', classes: [], assignments: [] })], 'backup.json', { type: 'application/json' });
    await user.upload(input, file);

    expect(importSpy).toHaveBeenCalled();
  });
});

