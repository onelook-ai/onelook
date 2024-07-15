'use client';

import { examplePentestResults } from '@/constants';
import {
  Anchor,
  Box,
  Card,
  Flex,
  SimpleGrid,
  Stack,
  Text,
  Title,
  rem,
} from '@mantine/core';
import { IconAnalyze, IconReport, IconVideo } from '@tabler/icons-react';
import Link from 'next/link';

const steps: {
  title: string;
  description: JSX.Element;
  icon: JSX.Element;
}[] = [
  {
    title: 'Record & Upload',
    description: (
      <Text size="sm">
        Upload a video or start a screen recording of your pentesting session.
        At any point, add contexts to the video using the Add Context Form.
      </Text>
    ),
    icon: (
      <IconVideo style={{ width: rem(50), height: rem(50) }} stroke={1.5} />
    ),
  },
  {
    title: 'Analyze',
    description: (
      <Text size="sm">
        Our AI will analyze the recording, add AI-generated contexts, and return
        you the results. Optionally, add your email to receive a notification
        when the analysis is completed.
      </Text>
    ),
    icon: (
      <IconAnalyze style={{ width: rem(50), height: rem(50) }} stroke={1.5} />
    ),
  },
  {
    title: 'Generate Report',
    description: (
      <>
        <Text size="sm">
          In the results page, our AI will generate a pentesting report for you.
          You can also edit the report in Markdown format.
        </Text>
        <Text size="sm" c="gray" ta="center">
          View an{' '}
          <Anchor
            component={Link}
            target="_blank"
            href={`/results/${examplePentestResults}`}
          >
            example
          </Anchor>
          .
        </Text>
      </>
    ),
    icon: (
      <IconReport style={{ width: rem(50), height: rem(50) }} stroke={1.5} />
    ),
  },
];

export default function HowToUse() {
  return (
    <>
      <Title order={2}>
        <Flex justify="center">How to use?</Flex>
      </Title>

      <SimpleGrid cols={{ base: 1, md: 3 }}>
        {steps.map((step, i) => (
          <Card
            key={i}
            p="md"
            withBorder
            style={{ textAlign: 'center' }}
            shadow="xs"
          >
            <Stack gap="sm">
              <Box>{step.icon}</Box>
              <Title order={4}>
                {i + 1}. {step.title} &nbsp;
              </Title>
              {step.description}
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}
