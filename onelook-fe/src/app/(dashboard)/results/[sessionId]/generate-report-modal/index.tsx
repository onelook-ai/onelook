'use client';

import { BE_API_URL, examplePentestResults, storagePrefix } from '@/constants';
import { GeneratePentestReportReq } from '@/types';
import { Box, Button, Group, Loader, Stack, Text } from '@mantine/core';
import {
  readLocalStorageValue,
  useDebouncedCallback,
  useLocalStorage,
} from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useCompletion } from 'ai/react';
import { saveAs } from 'file-saver';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import docx from 'remark-docx';
import remarkGfm from 'remark-gfm';
import markdown from 'remark-parse';
import pdf from 'remark-pdf';
import { unified } from 'unified';
import CookingAnimation from '../cooking-animation';
import { demoReport } from './demo-report';

const Editor = dynamic(() => import('./editor'), {
  ssr: false,
});

type ReportCache = {
  value: string;
  timeRange: string;
};

const reportName = 'pentest-report';

interface Props extends GeneratePentestReportReq {
  timeRange: [number, number];
}

export default function GenerateReportModal({
  timeRange,
  screenshots,
  ...restProps
}: Props) {
  const cacheKey = `${storagePrefix}-pentest-report-${restProps.id}`;

  const [_reportCache, setReportCache] = useLocalStorage<
    ReportCache | undefined
  >({
    key: cacheKey,
  });

  const [report, setReport] = useState('');
  const {
    completion,
    complete,
    isLoading: isLoadingCompletion,
    setCompletion,
  } = useCompletion({
    api: `${BE_API_URL}/reports/pentest/generate`,
    body: {
      ...restProps,
      screenshots: timeRange
        ? screenshots.filter(
            (ss) =>
              ss.timestampSecs >= timeRange[0] &&
              ss.timestampSecs <= timeRange[1],
          )
        : screenshots,
    },
  });

  const isDemo = restProps.id === examplePentestResults;
  const isLoading = !isDemo && isLoadingCompletion;

  const saveReportLocally = useDebouncedCallback((newValue) => {
    setReportCache({
      value: newValue,
      timeRange: serializeTimeRange(timeRange),
    });
  }, 1000);

  useEffect(() => {
    const cachedReport = readLocalStorageValue<ReportCache>({ key: cacheKey });

    if (
      cachedReport?.value &&
      serializeTimeRange(timeRange) === cachedReport?.timeRange
    ) {
      setCompletion(cachedReport.value);
      return;
    }

    if (isDemo) {
      setCompletion(demoReport);
      return;
    }

    complete('generate-report'); // It doesn't matter what we put here
  }, []);

  useEffect(() => {
    if (completion) {
      handleUpdateReport(completion);
    }
  }, [completion]);

  const handleUpdateReport = (value: string) => {
    setReport(value);
    saveReportLocally(value);
  };

  function saveAsPDF() {
    const processor = unified().use(markdown).use(pdf, { output: 'blob' });

    (async () => {
      const doc = await processor.process(report);
      const blob = (await doc.result) as Blob;
      saveAs(blob, `${reportName}.pdf`);
    })();
  }

  function saveAsDocx() {
    const processor = unified().use(markdown).use(docx, { output: 'blob' });

    (async () => {
      const doc = await processor.process(report);
      const blob = (await doc.result) as Blob;
      saveAs(blob, `${reportName}.docx`);
    })();
  }

  return (
    <Stack>
      {isLoading && !!report && (
        <div>
          <Markdown remarkPlugins={[remarkGfm]}>{report}</Markdown>
        </div>
      )}

      {!isLoading && !!report && (
        <Editor
          editorRef={null}
          markdown={report}
          onChange={handleUpdateReport}
          readOnly={isLoading}
        />
      )}

      <Box hidden={!isLoading || !!report} mt="-10vh">
        <Text fz="xl" fw="bold" pos="absolute" top="20vh" ta="center" w="100%">
          We&apos;re cooking your report up, please hold...
        </Text>
        <CookingAnimation />
      </Box>

      <Group
        justify="center"
        pos="sticky"
        bottom={0}
        py="md"
        bg="linear-gradient(0deg, rgba(255,255,255,1) 10%, rgba(255,255,255,0) 100%)"
      >
        {isLoading ? (
          <Loader type="dots" />
        ) : (
          <>
            <Button onClick={saveAsPDF}>Save as PDF</Button>
            <Button onClick={saveAsDocx}>Save as Docx</Button>
          </>
        )}
      </Group>
    </Stack>
  );
}

GenerateReportModal.open = function openGenerateReportModal(props: Props) {
  modals.open({
    title: 'Generate Report',
    centered: true,
    children: <GenerateReportModal {...props} />,
    closeOnEscape: false,
    closeOnClickOutside: false,
    size: '100%',
    h: '100%',
  });
};

function serializeTimeRange(timeRange: [number, number]) {
  return `${timeRange[0]}-${timeRange[1]}`;
}
