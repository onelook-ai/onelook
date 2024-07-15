'use client';

import { AnalysisResultsServiceDto } from '@/types';
import {
  ActionIcon,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useOne, useResourceParams } from '@refinedev/core';
import { IconArrowNarrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import ResultsBody from './results-body';

interface Props {
  params: { sessionId: string };
}

export default function AnalysisResults({ params }: Props) {
  const { sessionId } = params;

  const { resource, id } = useResourceParams();
  const { data, isLoading, refetch, isRefetching } =
    useOne<AnalysisResultsServiceDto>({
      resource: resource?.name,
      id,
    });

  if (isLoading) {
    return <LoadingOverlay visible loaderProps={{ type: 'bars' }} />;
  }

  if (!data?.data) {
    return (
      <Stack h="100vh" justify="center" align="center">
        <Text ta="center" size="lg" c="dimmed" fw="bold">
          Session does not exist
        </Text>
        <Button
          component={Link}
          href="/"
          leftSection={<IconArrowNarrowLeft size="1em" />}
        >
          Back
        </Button>
      </Stack>
    );
  }

  // const results = (await response.json()) as AnalysisResultsServiceDto;
  // const { status } = results;
  // console.log({ results });

  function handleRefresh() {
    refetch().then(() => {
      notifications.show({
        message: 'Refreshed results',
        color: 'green',
      });
    });
  }

  return (
    <Container fluid h="100vh" p="md">
      <Stack h="100%">
        <Group gap="xs">
          <ActionIcon component={Link} href="/" variant="transparent" size="xl">
            <IconArrowNarrowLeft />
          </ActionIcon>
          <Title>Results</Title>
        </Group>

        <ResultsBody
          results={data.data}
          isRefetching={isRefetching}
          onRefresh={handleRefresh}
        />
      </Stack>
    </Container>
  );
}
