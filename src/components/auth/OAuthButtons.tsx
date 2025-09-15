import React from 'react';
import { Group, Button, Stack, Alert } from '@mantine/core';
import { IconBrandGoogle, IconBrandApple } from '@tabler/icons-react';
import { 
  useAuthProviders,
  useAuthLoading,
  useAuthError,
  useAuthStore 
} from '../../store/auth';

export interface OAuthButtonsProps {
  variant?: 'default' | 'compact';
  onStarted?: (provider: string) => void;
  onError?: (provider: string, error: string) => void;
  onRedirect?: (provider: string) => void; // fired when we expect navigation
  showErrors?: boolean;
}

const providerIcon: Record<string, React.ReactNode> = {
  google: <IconBrandGoogle size={18} />,
  apple: <IconBrandApple size={18} />,
};

const providerLabel: Record<string, string> = {
  google: 'Continue with Google',
  apple: 'Continue with Apple',
};

export const OAuthButtons: React.FC<OAuthButtonsProps> = ({
  variant = 'default',
  onStarted,
  onError,
  onRedirect,
  showErrors = true,
}) => {
  const providers = useAuthProviders();
  const isLoading = useAuthLoading();
  const error = useAuthError();
  const signInWithProvider = useAuthStore((s) => s.signInWithProvider);

  const handleClick = async (p: string) => {
    if (onStarted) onStarted(p);
    const { success, error: e, redirectTo } = await signInWithProvider(p as any);
    if (!success && e) {
      if (onError) onError(p, e);
      return;
    }
    if (redirectTo && onRedirect) onRedirect(p);
  };

  if (!providers.length) return null; // nothing to show if no providers configured

  const buttons = providers.map((p) => (
    <Button
      key={p}
      fullWidth={variant !== 'compact'}
      variant={variant === 'compact' ? 'default' : 'filled'}
      leftSection={providerIcon[p]}
      onClick={() => handleClick(p)}
      loading={isLoading}
      aria-label={providerLabel[p]}
      data-testid={`oauth-btn-${p}`}
      disabled={isLoading}
    >
      {variant === 'compact' ? providerIcon[p] : providerLabel[p]}
    </Button>
  ));

  return (
    <Stack gap="xs" data-testid="oauth-buttons">
      {showErrors && error && (
        <Alert color="red" title="Authentication Error" data-testid="oauth-error" radius="sm">
          {error}
        </Alert>
      )}
      {variant === 'compact' ? (
        <Group gap="xs" wrap="nowrap" justify="flex-start">
          {buttons}
        </Group>
      ) : (
        <Stack gap="xs">{buttons}</Stack>
      )}
    </Stack>
  );
};

export default OAuthButtons;
