'use client';

import { useState } from 'react';

export default function AnalyzeResultPage() {
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 data-testid="results-header" className="mb-6 text-3xl font-bold">
        Image Analyzer Results
      </h1>

      <article data-testid="style-result" className="mb-6 rounded border p-4">
        <div className="mb-2 text-lg font-semibold">Photorealistic</div>
        <span data-testid="confidence-badge" className="inline-block rounded bg-green-100 px-2 py-1 text-sm text-green-700">
          94%
        </span>
      </article>

      <button
        data-testid="save-template-btn"
        onClick={() => setShowTemplateModal(true)}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Save as Template
      </button>

      {showTemplateModal && (
        <div data-testid="template-modal" className="mt-4 rounded border bg-white p-4 shadow">
          Template Modal
        </div>
      )}
    </div>
  );
}
