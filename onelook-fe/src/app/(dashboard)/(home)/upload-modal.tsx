import { BE_API_URL } from '@/constants';
import { SessionResp } from '@/types';
import { Progress, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const modalId = 'upload-modal';

interface Props {
  formData: FormData;
}

export default function UploadModal({ formData }: Props) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      const percent = Math.ceil((e.loaded / e.total) * 100);
      setProgress(percent);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        notifications.show({
          color: 'green',
          message: 'Recording uploaded successfully',
        });

        console.log('responsetext', xhr.responseText);

        const { id } = JSON.parse(xhr.responseText) as SessionResp;

        router.push(`/results/${id}`);
      } else {
        notifications.show({
          color: 'red',
          message: 'Error uploading recording: ' + xhr.responseText,
        });
      }
    };

    xhr.onerror = () => {
      notifications.show({
        color: 'red',
        message: 'Error uploading recording: ' + xhr.responseText,
      });
    };

    xhr.onloadend = () => {
      window.setTimeout(() => {
        modals.close(modalId);
      }, 500);
    };

    xhr.open('POST', `${BE_API_URL}/sessions`, true);
    xhr.send(formData);
  }, []);

  return (
    <Stack>
      <Text fw="bold" ta="center">
        Uploading your recording, please do not close this window
      </Text>

      <div>
        <Progress value={progress} animated />
        <Text ta="center" size="sm" c="dimmed">
          {progress}%
        </Text>
      </div>
    </Stack>
  );
}

UploadModal.start = function startUploadModal({ formData }: Props) {
  modals.open({
    modalId,
    children: <UploadModal formData={formData} />,
    withCloseButton: false,
    closeOnEscape: false,
    closeOnClickOutside: false,
  });
};
