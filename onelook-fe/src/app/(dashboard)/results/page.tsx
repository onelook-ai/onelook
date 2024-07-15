'use client';

import { Button, Card, Container, Group } from '@mantine/core';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

export default function DemoVideo() {
  return (
    <Suspense>
      <Body />
    </Suspense>
  );
}

function Body() {
  const searchParams = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const ts = searchParams.get('ts');

  useEffect(() => {
    if (ts && videoRef.current) {
      const tsInt = parseInt(ts, 10);
      videoRef.current.currentTime = tsInt;
    }
  }, [ts]);

  return (
    <Container>
      <Card maw="800" mx="auto" p={0}>
        {/* <video width="100%" src={videoUrl} controls /> */}
        <video
          ref={videoRef}
          controls
          src="https://storage.googleapis.com/muxdemofiles/mux.mp4"
        />
      </Card>

      <Group mt="lg" justify="center">
        {[2, 4, 6, 8, 10].map((val) => (
          <Button component={Link} href={{ search: `ts=${val}` }} key={val}>
            Go to {val}
          </Button>
        ))}
      </Group>
    </Container>
  );
}
