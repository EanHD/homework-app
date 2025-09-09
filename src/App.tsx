import { Container, Title, Tabs, Stack, Text } from '@mantine/core';

export default function App() {
  return (
    <Container size="sm" pt="xl">
      <a href="#main" className="skip-link">Skip to content</a>
      <main id="main" role="main">
        <Stack>
          <Title order={2}>Homework Buddy</Title>
          <Tabs defaultValue="today">
            <Tabs.List aria-label="Navigate between Today and Upcoming views">
              <Tabs.Tab value="today">Today</Tabs.Tab>
              <Tabs.Tab value="upcoming">Upcoming</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="today" pt="md" aria-label="Today assignments list">
              <Text c="dimmed">Assignments due today will appear here.</Text>
            </Tabs.Panel>
            <Tabs.Panel value="upcoming" pt="md" aria-label="Upcoming assignments list">
              <Text c="dimmed">Upcoming assignments will appear here.</Text>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </main>
    </Container>
  );
}
