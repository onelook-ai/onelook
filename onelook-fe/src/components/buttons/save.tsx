import { ActionIcon, Button, ButtonProps } from '@mantine/core';
import { useSaveButton } from '@refinedev/core';
import {
  RefineButtonClassNames,
  RefineSaveButtonProps,
} from '@refinedev/ui-types';
import { IconDeviceFloppy, IconProps } from '@tabler/icons-react';
import React from 'react';

type SaveButtonProps = RefineSaveButtonProps<
  ButtonProps,
  {
    svgIconProps?: Omit<IconProps, 'ref'>;
  }
>;

/**
 * `<SaveButton>` uses Mantine {@link https://mantine.dev/core/button `<Button> `}.
 * It uses it for presantation purposes only. Some of the hooks that refine has adds features to this button.
 *
 * @see {@link https://refine.dev/docs/api-reference/mantine/components/buttons/save-button} for more details.
 */
export const SaveButton: React.FC<
  SaveButtonProps & { type: HTMLButtonElement['type'] }
> = ({ hideText = false, svgIconProps, children, ...rest }) => {
  const { label } = useSaveButton();

  const { variant, styles, ...commonProps } = rest;

  return hideText ? (
    <ActionIcon
      {...(variant
        ? {
            variant,
          }
        : { variant: 'filled', color: 'primary' })}
      aria-label={label}
      className={RefineButtonClassNames.SaveButton}
      // {...commonProps}
    >
      <IconDeviceFloppy size={18} {...svgIconProps} />
    </ActionIcon>
  ) : (
    <Button
      variant="filled"
      leftSection={<IconDeviceFloppy size={18} {...svgIconProps} />}
      className={RefineButtonClassNames.SaveButton}
      {...rest}
    >
      {children ?? label}
    </Button>
  );
};
