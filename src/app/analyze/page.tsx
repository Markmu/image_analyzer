'use client';

import { useState } from 'react';
import { useRequireAuth } from '@/features/auth/hooks/useRequireAuth';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function AnalyzePage() {
  const { isLoading, isAuthenticated } = useRequireAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleFile = async (file: File | null) => {
    setError('');
    setShowAnalysis(false);

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Invalid file type');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File too large');
      return;
    }

    setUploading(true);
    try {
      await fetch('/api/upload', { method: 'POST' });
      await new Promise((resolve) => setTimeout(resolve, 200));
      setShowAnalysis(true);
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-6 py-10">正在检查登录状态...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded border border-blue-200 bg-blue-50 p-3 text-blue-700">
          请先登录后再上传图片，正在跳转到登录页面...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold">Image Analyzer</h1>

      <div className="mb-4">
        <label htmlFor="file-input" className="mb-2 block text-sm font-medium">
          Upload image
        </label>
        <input
          id="file-input"
          data-testid="image-upload-input"
          type="file"
          accept="image/*"
          onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="drop-input" className="mb-2 block text-sm font-medium">
          Drag and drop
        </label>
        <input
          id="drop-input"
          data-testid="drop-zone"
          type="file"
          accept="image/*"
          onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
        />
      </div>

      {uploading && (
        <div data-testid="upload-progress" className="mb-4 rounded bg-blue-100 p-3 text-blue-700">
          Uploading...
        </div>
      )}

      {error && (
        <div data-testid="upload-error" className="mb-4 rounded bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      {showAnalysis && (
        <section data-testid="analysis-section" className="rounded border p-4">
          Analysis started
        </section>
      )}
    </div>
  );
}
