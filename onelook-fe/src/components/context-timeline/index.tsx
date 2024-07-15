'use client';

import { RecordingContext } from '@/types';
import { formatElapsedSecs } from '@/utils/formatter';
import {
  Box,
  Group,
  Text,
  ThemeIcon,
  Timeline,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { IconArrowNarrowRight, IconSparkles } from '@tabler/icons-react';
import { clsx } from 'clsx';
import classes from './context-timeline.module.css';

export default function ContextTimeline({
  contexts,
  progressTsSeconds = -1,
  onContextClick,
}: {
  contexts: RecordingContext[];
  progressTsSeconds?: number;
  onContextClick?: (context: RecordingContext) => void;
}) {
  if (!contexts.length) {
    return (
      <Text ta="center" fz="sm" c="dimmed">
        No contexts added yet.
      </Text>
    );
  }

  const showClickButton = !!onContextClick;

  let latestActiveContextIndex = -1;

  const timelineItems = contexts.map((context, i) => {
    const { content, timestampSecs, contextType } = context;

    const title = (
      <Group gap="xs">
        <Box>{`${formatElapsedSecs(timestampSecs)}`}</Box>
        {contextType === 'USER' ? null : (
          <Tooltip label="Automatically added by AI">
            <IconSparkles size="1em" color="var(--mantine-color-violet-4)" />
          </Tooltip>
        )}
        {showClickButton && (
          <ThemeIcon variant="transparent" color="gray" size="sm">
            <IconArrowNarrowRight size="1em" />
          </ThemeIcon>
        )}
      </Group>
    );

    if (timestampSecs <= progressTsSeconds) {
      latestActiveContextIndex = i;
    }

    return (
      <Timeline.Item
        key={i}
        title={
          <Box pos="relative">
            <UnstyledButton
              disabled={!showClickButton}
              onClick={() => onContextClick?.(context)}
              classNames={{
                root: clsx({
                  [classes.itemTitleButton]: true,
                  [classes.active]: showClickButton,
                }),
              }}
            >
              {title}
            </UnstyledButton>
          </Box>
        }
      >
        <Text c="dimmed" size="sm">
          {content}
        </Text>
      </Timeline.Item>
    );
  });

  return (
    <Timeline mt="lg" active={latestActiveContextIndex}>
      {timelineItems}
    </Timeline>
  );
}
