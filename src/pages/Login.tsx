import { useState } from 'react'
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  TextInput, 
  Button, 
  Stack, 
  Group, 
  Alert, 
  Divider,
  Center
} from '@mantine/core'
import { IconMail, IconBrandGoogle, IconBrandApple, IconCheck, IconX } from '@tabler/icons-react'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { signInWithMagicLink, signInWithOAuth } = useAuth()

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await signInWithMagicLink(email)
      
      if (error) {
        setMessage({ type: 'error', text: error })
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Magic link sent! Check your email and click the link to sign in.' 
        })
        setEmail('') // Clear email field on success
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await signInWithOAuth(provider)
      
      if (error) {
        setMessage({ type: 'error', text: error })
        setLoading(false)
      }
      // Note: For OAuth, the user will be redirected, so we don't set loading to false here
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred. Please try again.' 
      })
      setLoading(false)
    }
  }

  return (
    <Container size="xs" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} ta="center" mb="md">
          Welcome Back
        </Title>
        
        <Text c="dimmed" size="sm" ta="center" mb="xl">
          Sign in to access your homework reminders and notifications
        </Text>

        {message && (
          <Alert 
            icon={message.type === 'success' ? <IconCheck size="1rem" /> : <IconX size="1rem" />}
            color={message.type === 'success' ? 'green' : 'red'}
            mb="md"
          >
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleMagicLinkSignIn}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              leftSection={<IconMail size="1rem" />}
              required
              type="email"
              disabled={loading}
            />

            <Button 
              type="submit" 
              fullWidth 
              loading={loading}
              disabled={loading}
            >
              Send Magic Link
            </Button>
          </Stack>
        </form>

        <Divider label="Or continue with" labelPosition="center" my="lg" />

        <Stack>
          <Button
            variant="outline"
            fullWidth
            leftSection={<IconBrandGoogle size="1rem" />}
            onClick={() => handleOAuthSignIn('google')}
            disabled={loading}
            loading={loading}
          >
            Continue with Google
          </Button>

          <Button
            variant="outline"
            fullWidth
            leftSection={<IconBrandApple size="1rem" />}
            onClick={() => handleOAuthSignIn('apple')}
            disabled={loading}
            loading={loading}
          >
            Continue with Apple
          </Button>
        </Stack>

        <Text c="dimmed" size="xs" ta="center" mt="xl">
          By signing in, you agree to our Terms of Service and Privacy Policy.
          <br />
          <br />
          Note: Magic link authentication requires you to check your email and click the verification link.
          OAuth providers will redirect you through their authentication flow.
        </Text>
      </Paper>
    </Container>
  )
}

export default Login