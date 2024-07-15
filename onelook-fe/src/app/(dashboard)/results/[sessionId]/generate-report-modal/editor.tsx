'use client';
import { Text } from '@mantine/core';
// InitializedMDXEditor.tsx
import {
  BoldItalicUnderlineToggles,
  CodeToggle,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  Separator,
  StrikeThroughSupSubToggles,
  UndoRedo,
  codeBlockPlugin,
  headingsPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  type MDXEditorMethods,
  type MDXEditorProps,
} from '@mdxeditor/editor';
import type { ForwardedRef } from 'react';

// Only import this to the next file
export default function ReportEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
      className="gen_report_editor"
      plugins={[
        // Example Plugin Usage
        toolbarPlugin({ toolbarContents: () => <Toolbar /> }),
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        codeBlockPlugin(),
        tablePlugin(),
      ]}
      {...props}
      ref={editorRef}
    />
  );
}

function Toolbar() {
  return (
    <>
      <UndoRedo />
      <Separator />
      <BoldItalicUnderlineToggles />
      <CodeToggle />
      <Separator />
      <StrikeThroughSupSubToggles />
      <Separator />
      <ListsToggle options={['bullet', 'number']} />
      <Separator />

      <InsertTable />
      <InsertThematicBreak />

      <Separator />
      <Text c="dimmed" inline size="sm" ml="auto">
        Edit in markdown
      </Text>
    </>
  );
}
