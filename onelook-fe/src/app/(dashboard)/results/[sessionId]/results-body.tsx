'use client';

import ContextTimeline from '@/components/context-timeline';
import { BE_API_HOST, email } from '@/constants';
import { AnalysisResultsServiceDto, SessionVideoContext } from '@/types';
import { formatElapsedSecs } from '@/utils/formatter';
import {
  Alert,
  Anchor,
  Box,
  Button,
  Card,
  Group,
  Loader,
  RangeSlider,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconExclamationCircle, IconFileCheck } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GenerateReportModal from './generate-report-modal';
import NotifyAnalysisCompleteModal from './notify-analysis-complete-modal';

export default function ResultsBody({
  results,
  isRefetching,
  onRefresh,
}: {
  results: AnalysisResultsServiceDto;
  isRefetching: boolean;
  onRefresh: () => void;
}) {
  const {
    sessionId,
    status,
    videoUrl,
    analysisResults,
    screenshots,
    videoContexts,
  } = results;

  const [videoTime, setVideoTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const form = useForm<{ timeRange: [number, number] }>({
    initialValues: {
      timeRange: [0, 0],
    },
  });

  const filteredVideoContexts = useFilteredVideoContexts(videoContexts);

  const videoNodeRef = useRef<HTMLVideoElement | null>(null);

  const correctVidCurrentTime = () => {
    const { timeRange } = form.getValues();
    const currentTime = videoNodeRef.current?.currentTime || 0;

    if (videoNodeRef.current) {
      if (currentTime < timeRange[0]) {
        videoNodeRef.current.currentTime = timeRange[0];
      } else if (currentTime > timeRange[1]) {
        videoNodeRef.current.currentTime = timeRange[1];
        videoNodeRef.current.pause();
      }
    }
  };

  useEffect(() => {
    correctVidCurrentTime();
  }, [form.values.timeRange]);

  const videoCBRef = useCallback((node: HTMLVideoElement | null) => {
    if (videoNodeRef.current) {
      videoNodeRef.current.ontimeupdate = null;
      videoNodeRef.current.onloadedmetadata = null;
    }

    videoNodeRef.current = node;

    if (videoNodeRef.current) {
      // To make video preview render frame at ts when context is clicked on
      videoNodeRef.current?.play();
      window.setTimeout(() => {
        videoNodeRef.current?.pause();
      }, 0);

      videoNodeRef.current.onloadedmetadata = () => {
        const vidDuration = Math.ceil(videoNodeRef.current?.duration || 0);

        if (vidDuration) {
          setDuration(vidDuration);
          form.setFieldValue('timeRange', [0, vidDuration]);
        }
      };

      videoNodeRef.current.ontimeupdate = () => {
        const currentTime = videoNodeRef.current?.currentTime || 0;

        correctVidCurrentTime();

        setVideoTime(currentTime);
      };
    }
  }, []);

  function handleGenerateReport() {
    const { timeRange } = form.getValues();
    GenerateReportModal.open({
      id: sessionId,
      screenshots: screenshots,
      contexts: videoContexts,
      timeRange,
    });
  }

  return (
    <SimpleGrid cols={2} spacing="lg" style={{ flexGrow: 1 }}>
      <Stack>
        <Card maw="100%" mx="auto" p={0}>
          <video
            src={`${BE_API_HOST}${videoUrl}`}
            controls
            ref={videoCBRef}
            muted
          />
        </Card>

        {status === 'PROCESSING' && (
          <Alert color="yellow" icon={<Loader size="xs" />} title="Analyzing">
            <Stack>
              <div>Your analysis is currently being processed.</div>

              <Group gap="xs">
                <Button onClick={onRefresh} loading={isRefetching}>
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  onClick={() => NotifyAnalysisCompleteModal.open()}
                >
                  Notify me
                </Button>
              </Group>
            </Stack>
          </Alert>
        )}

        {status === 'ERROR' && (
          <Alert color="orange" icon={<IconExclamationCircle />}>
            <>
              Analysis could not be completed due to an error, please{' '}
              <Anchor href={`mailto:${email}&subject=Analysis Error`}>
                contact us
              </Anchor>{' '}
              about it.
            </>
          </Alert>
        )}

        {status === 'COMPLETED' && (
          <>
            <div>
              <Text size="sm" c="dimmed" ta="center">
                Time range to base report generation on
              </Text>
              <RangeSlider
                min={0}
                max={duration}
                step={1}
                minRange={5}
                label={(value) => {
                  return formatElapsedSecs(value);
                }}
                {...form.getInputProps('timeRange')}
              />
            </div>
            <Button
              onClick={handleGenerateReport}
              rightSection={<IconFileCheck size="1em" />}
            >
              Generate Report
            </Button>
          </>
        )}

        {/* {analysisResults && !!Object.keys(analysisResults).length && (
            <Code block>{JSON.stringify(analysisResults, null, 2)}</Code>
          )} */}
      </Stack>

      <Stack h="0" mih="100%">
        <Box style={{ flexGrow: 1 }} mih="0">
          <Card h="100%" withBorder>
            <Stack h="0" mih="100%">
              <Title order={4}>Added Contexts</Title>

              <Box style={{ flexGrow: 1 }} mih="0">
                <ScrollArea h="0" mih="100%">
                  <ContextTimeline
                    progressTsSeconds={videoTime}
                    contexts={filteredVideoContexts}
                    onContextClick={(context) => {
                      videoNodeRef.current &&
                        (videoNodeRef.current.currentTime =
                          context.timestampSecs);
                    }}
                  />
                </ScrollArea>
              </Box>
            </Stack>
          </Card>
        </Box>
      </Stack>
    </SimpleGrid>
  );
}

const ctxTsThreshold = 1; // any ai-added ctx x secs from user-added ctx will be filtered out

function useFilteredVideoContexts(videoContexts: SessionVideoContext[]) {
  return useMemo(() => {
    let prevCtx: SessionVideoContext;

    const dedupedVideoContexts = videoContexts.filter((ctx) => {
      let passesFilter = true;

      // Filter out duplicate contexts
      if (
        ctx.contextType !== 'USER' &&
        prevCtx &&
        prevCtx.content.trim() === ctx.content.trim()
      ) {
        passesFilter = false;
      }

      prevCtx = ctx;

      return passesFilter;
    });

    // const userCtxTsSecs = dedupedVideoContexts
    //   .filter((ctx) => ctx.contextType === 'USER')
    //   .map((ctx) => ctx.timestampSecs);

    return dedupedVideoContexts;
    // .filter((ctx) => {
    //   if (ctx.contextType === 'USER') {
    //     return true;
    //   }

    //   while (
    //     userCtxTsSecs.length &&
    //     ctx.timestampSecs - userCtxTsSecs[0] > ctxTsThreshold
    //   ) {
    //     userCtxTsSecs.shift();
    //   }

    //   // If AI-added context is too close to user context, it's probably noise and should be filtered out
    //   if (Math.abs(ctx.timestampSecs - userCtxTsSecs[0]) <= ctxTsThreshold) {
    //     return false;
    //   }

    //   return true;
    // });
  }, [videoContexts]);
}
