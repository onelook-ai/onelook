import {
  ActionIcon,
  Button,
  ButtonProps,
  Group,
  Popover,
  Text,
} from '@mantine/core';
import { useDeleteButton } from '@refinedev/core';
import {
  RefineButtonClassNames,
  RefineDeleteButtonProps,
} from '@refinedev/ui-types';
import { IconProps, IconTrash } from '@tabler/icons-react';
import React, { useState } from 'react';

type DeleteButtonProps = RefineDeleteButtonProps<
  ButtonProps,
  {
    svgIconProps?: Omit<IconProps, 'ref'>;
  }
>;

/**
 * `<DeleteButton>` uses Mantine {@link https://mantine.dev/core/button `<Button>`} and {@link https://mantine.dev/core/modal `<Modal>`} components.
 * When you try to delete something, a dialog modal shows up and asks for confirmation. When confirmed it executes the `useDelete` method provided by your `dataProvider`.
 *
 * @see {@link https://refine.dev/docs/api-reference/mantine/components/buttons/delete-button} for more details.
 */
export const DeleteButton: React.FC<DeleteButtonProps> = ({
  resource: resourceNameFromProps,
  resourceNameOrRouteName,
  recordItemId,
  onSuccess,
  mutationMode,
  invalidates,
  children,
  successNotification,
  errorNotification,
  hideText = false,
  accessControl,
  meta,
  metaData,
  dataProviderName,
  confirmTitle,
  confirmOkText,
  confirmCancelText,
  svgIconProps,
  ...rest
}) => {
  const {
    title,
    label,
    hidden,
    disabled,
    loading,
    confirmTitle: defaultConfirmTitle,
    confirmOkLabel: defaultConfirmOkLabel,
    cancelLabel: defaultCancelLabel,
    onConfirm,
  } = useDeleteButton({
    resource: resourceNameFromProps ?? resourceNameOrRouteName,
    id: recordItemId,
    dataProviderName,
    errorNotification,
    successNotification,
    invalidates,
    mutationMode,
    accessControl,
    meta,
    onSuccess,
  });

  const [opened, setOpened] = useState(false);

  const { variant, styles, ...commonProps } = rest;

  if (hidden) return null;

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      withArrow
      withinPortal
      disabled={
        typeof rest?.disabled !== 'undefined' ? rest.disabled : disabled
      }
    >
      <Popover.Target>
        {hideText ? (
          <ActionIcon
            color='red'
            onClick={() => setOpened((o) => !o)}
            disabled={loading || disabled}
            loading={loading}
            className={RefineButtonClassNames.DeleteButton}
            {...(variant
              ? {
                  variant,
                }
              : { variant: 'outline' })}
            // {...commonProps}
          >
            <IconTrash size={18} {...svgIconProps} />
          </ActionIcon>
        ) : (
          <Button
            color='red'
            variant='outline'
            onClick={() => setOpened((o) => !o)}
            disabled={loading || disabled}
            loading={loading}
            title={title}
            leftSection={<IconTrash size={18} {...svgIconProps} />}
            className={RefineButtonClassNames.DeleteButton}
            {...rest}
          >
            {children ?? label}
          </Button>
        )}
      </Popover.Target>
      <Popover.Dropdown py='xs'>
        <Text size='sm' fw='bold'>
          {confirmTitle ?? defaultConfirmTitle}
        </Text>
        <Group justify='center' wrap='nowrap' gap='xs' mt='xs'>
          <Button onClick={() => setOpened(false)} variant='default' size='xs'>
            {confirmCancelText ?? defaultCancelLabel}
          </Button>
          <Button
            color='red'
            onClick={() => {
              onConfirm();
              setOpened(false);
            }}
            autoFocus
            size='xs'
          >
            {confirmOkText ?? defaultConfirmOkLabel}
          </Button>
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
};
