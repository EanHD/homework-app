import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import ColorField from '@/ui/ColorField';
import { WithMantine } from '@/../tests/utils/providers';

describe('ColorField', () => {
  it('updates value when clicking swatch', async () => {
    const user = userEvent.setup();
    let value = '#1e88e5';
    const onChange = (hex: string) => {
      value = hex;
    };
    render(
      <WithMantine>
        <ColorField value={value} onChange={onChange} label="Color" withInput />
      </WithMantine>
    );
    const swatch = screen.getByLabelText(/Select color #10B981/i);
    await user.click(swatch);
    expect(value.toLowerCase()).toBe('#10b981');
  });
});
