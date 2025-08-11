'use client';
import { useCallback } from 'react';

type Props = { onFiles: (files: File[]) => void };

export default function Dropzone({ onFiles }: Props) {
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    onFiles(Array.from(e.target.files));
    e.currentTarget.value = '';
  }, [onFiles]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.name.endsWith('.xlsx'));
    if (files.length) onFiles(files as File[]);
  }, [onFiles]);

  return (
    <div
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
      className="flex h-40 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed --card0 text-center text-sm text-gray-500"
      onClick={() => document.getElementById('file')?.click()}
    >
      <input id="file" type="file" accept=".xlsx" multiple className="hidden" onChange={onChange} />
      <div>
        <p className="font-medium">Drag & drop .xlsx files here</p>
        <p className="text-xs">or click to choose files</p>
      </div>
    </div>
  );
}