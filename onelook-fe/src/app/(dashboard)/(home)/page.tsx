'use client';

import ContextTimeline from '@/components/context-timeline';
import { email } from '@/constants';
import { RecordingContext } from '@/types';
import { formatElapsedSecs } from '@/utils/formatter';
import {
  ActionIcon,
  Anchor,
  Box,
  Button,
  Card,
  Collapse,
  Container,
  Divider,
  Flex,
  Group,
  Kbd,
  Popover,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  useHotkeys,
  useThrottledCallback,
  useWindowEvent,
} from '@mantine/hooks';
import {
  IconPlayerStopFilled,
  IconPlus,
  IconTrash,
  IconVideo,
} from '@tabler/icons-react';
import fixWebmDuration from 'fix-webm-duration';
import { useRouter } from 'next/navigation';
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import VideoDropzone from './VideoDropzone';
import HowToUse from './how-to-use';
import UploadModal from './upload-modal';

export default function ScreenRecorder() {
  const [recorder, setRecorder] = useState<MediaRecorder>();
  const recordedChunks = useRef<Blob[]>([]);
  const startTsRef = useRef(0);
  const [focusTs, setFocusTs] = useState(0);
  const [videoData, setVideoData] = useState<
    { url: string; blob: Blob } | undefined
  >();
  const [videoTime, setVideoTime] = useState(0);
  const [contextInput, setContextInput] = useState<string>('');
  const [contexts, setContexts] = useState<RecordingContext[]>([]);
  const contextViewport = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const videoNodeRef = useRef<HTMLVideoElement | null>(null);

  const throttledAutoScrollContext = useThrottledCallback(() => {
    contextViewport.current?.scrollTo({ top: 99999, behavior: 'smooth' });
  }, 200);

  const router = useRouter();

  // Ignore audio for now.
  const displayMediaStreamOptions: DisplayMediaStreamOptions = {
    video: true,
  };

  const isRecording = !!recorder;

  useHotkeys([['ctrl+k', focusTextArea]]);

  useWindowEvent('focus', () => {
    focusTextArea();
    if (!contextInput.length && isRecording) {
      resetFocusTs(-1000);
    }
  });

  useEffect(() => {
    if (contexts.length && contextViewport.current) {
      throttledAutoScrollContext();
    }
  }, [contexts.length]);

  const videoCBRef = useCallback((node: HTMLVideoElement | null) => {
    if (videoNodeRef.current) videoNodeRef.current.ontimeupdate = null;

    console.log('videoCBRef', node);
    // videoRef.current = node;

    videoNodeRef.current = node;

    if (videoNodeRef.current) {
      // To make video preview render frame at ts when context is clicked on
      videoNodeRef.current.play();

      window.setTimeout(() => {
        videoNodeRef.current?.pause();
      }, 0);

      startTsRef.current = 0;

      videoNodeRef.current.ontimeupdate = () => {
        const currentTime = videoNodeRef.current?.currentTime || 0;
        setFocusTs(currentTime * 1000);
        setVideoTime(currentTime);
      };
    }
  }, []);

  function resetFocusTs(offset: number = 0) {
    const focusTs = Date.now() + offset; // We deduct 1s to account for the time taken to switch back to browser window
    setFocusTs(Math.max(focusTs, startTsRef.current || 0));
  }

  function focusTextArea() {
    textareaRef.current?.focus();
  }

  const startRecording = async () => {
    try {
      recordedChunks.current = [];
      setVideoData(undefined);
      setContexts([]);

      const stream = await navigator.mediaDevices.getDisplayMedia(
        displayMediaStreamOptions,
      );
      const recorderInstance = new MediaRecorder(stream, {
        videoBitsPerSecond: 3000000, // 3Mbps
      });

      recorderInstance.addEventListener(
        'start',
        () => {
          startTsRef.current = Date.now();
          resetContextInput(); // Reset here so that we have the latest startTs
        },
        { once: true },
      );

      // this is so that we can detect when a user clicks on "stop sharing" in the browser toolbar instead of our button

      const recorderOnDataAvailableHandler = async (event: BlobEvent) => {
        !!event.data.size && recordedChunks.current.push(event.data);
      };

      recorderInstance.start();
      recorderInstance.ondataavailable = recorderOnDataAvailableHandler;

      recorderInstance.addEventListener(
        'stop',
        () => {
          setRecorder(undefined);
          const duration = Date.now() - startTsRef.current;

          let totalSizeInBytes = 0;
          recordedChunks.current.forEach((chunk) => {
            totalSizeInBytes += chunk.size;
          });

          const totalSizeInMB = totalSizeInBytes / (1024 * 1024); // Convert bytes to MB
          console.log(`Total recorded size: ${totalSizeInMB.toFixed(2)} MB`); // Log the size in MB

          if (recordedChunks.current.length > 0) {
            fixWebmDuration(
              new Blob(recordedChunks.current),
              duration,
              (fixedBlob) => {
                setVideoData({
                  url: URL.createObjectURL(fixedBlob),
                  blob: fixedBlob,
                });
              },
            );
          } else {
            setVideoData(undefined);
          }

          recorderInstance.ondataavailable = null;
        },
        { once: true },
      );

      setRecorder(recorderInstance);
    } catch (error) {
      console.error('Error setting up stream: ', error);
    }
  };

  const stopRecording = () => {
    const stream = recorder?.stream;
    stream?.getTracks().forEach((track) => track.stop());
    recorder?.stop();
  };

  const uploadVideo = async () => {
    const blob = videoData?.blob;

    if (!blob) {
      return;
    }

    const formData = new FormData();

    formData.append('video-file', blob);

    contexts.forEach((context, i) => {
      const prefix = `videoContexts[${i}]`;
      formData.append(`${prefix}[contextType]`, 'USER');
      formData.append(
        `${prefix}[timestampSecs]`,
        Math.round(context.timestampSecs).toString(),
      );
      formData.append(`${prefix}[content]`, context.content);
    });

    UploadModal.start({ formData });

    // try {
    //   const response = await fetch(`${BE_API_URL}/sessions`, {
    //     method: 'POST',
    //     body: formData,
    //   });

    //   if (!response.ok) {
    //     const text = await response.text();

    //     notifications.show({
    //       color: 'red',
    //       message: 'Error uploading recording: ' + text,
    //     });
    //     return;
    //   }

    //   const { id } = (await response.json()) as SessionResp;

    //   notifications.show({
    //     color: 'green',
    //     message: 'Recording uploaded successfully',
    //   });

    //   router.push(`/results/${id}`);
    // } catch (error) {
    //   console.error('Error uploading recording:', error);
    // }
  };

  function addContext() {
    if (!contextInput.trim().length) return;

    setContexts([
      ...contexts,
      {
        contextType: 'USER',
        timestampSecs: (focusTs - startTsRef.current) / 1000,
        content: contextInput,
      },
    ]);
    resetContextInput();
  }

  function resetContextInput() {
    setContextInput('');
    resetFocusTs();
  }

  function onEnterPress(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addContext();
    }
  }

  function onVideoDragNDrop(file: File) {
    const reader = new FileReader();

    reader.readAsArrayBuffer(file);

    reader.onload = () => {
      const arrayBuffer = reader.result;

      if (!arrayBuffer) return;

      const blob = new Blob([arrayBuffer], { type: file.type });

      setVideoData({
        url: URL.createObjectURL(blob),
        blob,
      });
    };
  }

  function discardVideo() {
    videoData?.blob && URL.revokeObjectURL(videoData.url);
    setVideoData(undefined);

    setContexts([]);
  }

  const canShowVideo = !!videoData && !isRecording;
  const canAddContext = isRecording || canShowVideo;

  return (
    <Container fluid p="lg" h="100vh">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" h="0" mih="100%">
        <Stack>
          <Title order={1}>
            <Flex justify="center">Onelook - Pentesting Report Automation</Flex>
          </Title>

          {canShowVideo && (
            <Card w="100%" maw="800" mx="auto" p={0}>
              <video ref={videoCBRef} src={videoData.url} controls muted />
            </Card>
          )}

          <Flex justify="center" gap="md">
            {!isRecording ? (
              <>
                {!canShowVideo && (
                  <Stack>
                    <VideoDropzone onDrop={onVideoDragNDrop} />
                    <Divider label="or" />
                    <Button
                      onClick={startRecording}
                      rightSection={<IconVideo />}
                    >
                      Start screen recording
                    </Button>
                  </Stack>
                )}
                {canShowVideo && (
                  <>
                    <DiscardVideoButton onConfirm={discardVideo} />

                    <Button onClick={uploadVideo}>Save & analyze</Button>
                  </>
                )}
              </>
            ) : (
              <Button
                variant="outline"
                rightSection={
                  <ThemeIcon variant="transparent">
                    <IconPlayerStopFilled />
                  </ThemeIcon>
                }
                onClick={stopRecording}
              >
                Stop recording
              </Button>
            )}
          </Flex>

          <Box mt="md" />

          <HowToUse />

          <ContactUs />
        </Stack>

        <Stack h="0" mih="100%">
          <Collapse in={canAddContext}>
            <Flex justify="center">
              <Textarea
                ref={textareaRef}
                minRows={2}
                maxRows={5}
                autosize
                w="100%"
                placeholder="e.g. Found exposed username and password in plaintext"
                descriptionProps={{ component: 'div' }}
                inputWrapperOrder={['label', 'input', 'description']}
                description={
                  <div>
                    <Box ta="center">
                      Add context at timestamp{' '}
                      {formatElapsedSecs(
                        (focusTs - (startTsRef.current || 0)) / 1000,
                      )}
                    </Box>
                    <Group justify="center" gap="xs">
                      <Kbd>Ctrl</Kbd> + <Kbd>k</Kbd> to focus
                    </Group>
                  </div>
                }
                value={contextInput}
                onChange={(e) => {
                  const newInput = e.target.value;

                  if (!newInput.trim().length) {
                    resetFocusTs();
                  }

                  setContextInput(e.target.value);
                }}
                onKeyDown={onEnterPress}
                rightSection={
                  <ActionIcon size="sm" onClick={addContext}>
                    <IconPlus size="1em" />
                  </ActionIcon>
                }
              />
            </Flex>
          </Collapse>

          <Box style={{ flexGrow: 1 }} mih="0">
            <Card h="100%" withBorder>
              <Stack h="0" mih="100%">
                <Title order={4}>Added Contexts</Title>

                <Box style={{ flexGrow: 1 }} mih="0">
                  <ScrollArea h="0" mih="100%" viewportRef={contextViewport}>
                    <ContextTimeline
                      contexts={contexts}
                      progressTsSeconds={canShowVideo ? videoTime : undefined}
                      onContextClick={
                        !!canShowVideo
                          ? (context) => {
                              videoNodeRef.current &&
                                (videoNodeRef.current.currentTime =
                                  context.timestampSecs);
                            }
                          : undefined
                      }
                    />
                  </ScrollArea>
                </Box>
              </Stack>
            </Card>
          </Box>
        </Stack>
      </SimpleGrid>
    </Container>
  );
}

function DiscardVideoButton({ onConfirm }: { onConfirm: () => void }) {
  const [opened, setOpened] = useState(false);

  return (
    <Popover opened={opened} onChange={setOpened} withArrow withinPortal>
      <Popover.Target>
        <Button
          color="red"
          variant="outline"
          onClick={() => setOpened((o) => !o)}
          leftSection={<IconTrash size={18} />}
        >
          Discard Video
        </Button>
      </Popover.Target>
      <Popover.Dropdown py="xs">
        <Text size="sm" fw="bold">
          Are you sure you want to discard this video?
        </Text>
        <Text size="sm" fw="bold" c="red">
          This will also discard all added contexts.
        </Text>
        <Group justify="right" wrap="nowrap" gap="xs" mt="xs">
          <Button onClick={() => setOpened(false)} variant="default" size="xs">
            Back
          </Button>
          <Button
            color="red"
            onClick={() => {
              onConfirm();
              setOpened(false);
            }}
            autoFocus
            size="xs"
          >
            Discard
          </Button>
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
}

function ContactUs() {
  return (
    <Text ta="center" size="sm" c="dimmed">
      Got a question? <Anchor href={`mailto:${email}`}>Contact Us</Anchor>!
    </Text>
  );
}
