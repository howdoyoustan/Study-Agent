"use client";

import { useCallback, useMemo, useState, type SyntheticEvent } from "react";
import { DEFAULT_WAIP_DATASET_ID } from "@/lib/constants";
import { extractDocCompletionContent } from "@/lib/waipResponse";
import {
  stripThermalLineLeadingSpaces,
  thermalColumnWidth,
  wrapThermalText,
} from "@/lib/thermalWrap";

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 ${className}`}
    >
      <h2 className="mb-3 text-lg font-semibold tracking-tight text-zinc-50">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Collapsible({
  title,
  hint,
  defaultOpen = false,
  children,
}: {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const onToggle = (e: SyntheticEvent<HTMLDetailsElement>) => {
    setOpen(e.currentTarget.open);
  };

  return (
    <details
      className="group rounded-xl border border-zinc-800/80 bg-zinc-900/30"
      open={open}
      onToggle={onToggle}
    >
      <summary className="cursor-pointer list-none px-5 py-4 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-zinc-200">{title}</span>
          <span className="text-xs font-medium text-zinc-500 group-open:rotate-180 transition-transform">
            ▼
          </span>
        </div>
        {hint ? (
          <p className="mt-1 text-sm text-zinc-500 pr-8">{hint}</p>
        ) : null}
      </summary>
      <div className="border-t border-zinc-800/80 px-5 pb-5 pt-2">{children}</div>
    </details>
  );
}

export default function Home() {
  const [datasetId, setDatasetId] = useState(DEFAULT_WAIP_DATASET_ID);
  const [createName, setCreateName] = useState("Study PDFs");
  const [createDesc, setCreateDesc] = useState("");
  const [question, setQuestion] = useState("");
  const [log, setLog] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [receiptFormat, setReceiptFormat] = useState(true);
  const [hasQueried, setHasQueried] = useState(false);
  const [lastAnswerText, setLastAnswerText] = useState("");

  const effectiveDatasetId = useMemo(() => {
    const t = datasetId.trim();
    return t || DEFAULT_WAIP_DATASET_ID;
  }, [datasetId]);

  const cols = thermalColumnWidth();
  const wrappedAnswer = useMemo(
    () =>
      wrapThermalText(stripThermalLineLeadingSpaces(lastAnswerText), cols),
    [lastAnswerText, cols],
  );

  const printReceipt = useCallback(() => {
    if (!wrappedAnswer.trim()) return;
    window.print();
  }, [wrappedAnswer]);

  const appendLog = useCallback((label: string, obj: unknown) => {
    setLog(
      (prev) =>
        `${prev}\n--- ${label} ---\n${JSON.stringify(obj, null, 2)}\n`,
    );
  }, []);

  const createDataset = async () => {
    setBusy("create");
    try {
      const res = await fetch("/api/datasets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName, description: createDesc }),
      });
      const data = await res.json();
      appendLog("Create dataset", data);
      const id =
        typeof data === "object" &&
        data !== null &&
        "_id" in data &&
        typeof (data as { _id: unknown })._id === "string"
          ? (data as { _id: string })._id
          : null;
      if (id) setDatasetId(id);
    } finally {
      setBusy(null);
    }
  };

  const prepareDataset = async () => {
    setBusy("prepare");
    try {
      const res = await fetch(
        `/api/datasets/${effectiveDatasetId}/prepare`,
        {
          method: "POST",
        },
      );
      const data = await res.json();
      appendLog("Prepare", data);
    } finally {
      setBusy(null);
    }
  };

  const runQuery = async () => {
    const q = question.trim();
    if (!q) {
      appendLog("Query", { error: "Enter a question." });
      return;
    }
    setBusy("query");
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset_id: effectiveDatasetId,
          question: q,
          return_sources: true,
          receipt_format: receiptFormat,
          top_k: 24,
        }),
      });
      const data = await res.json();
      appendLog("Query", data);
      setHasQueried(true);
      setLastAnswerText(extractDocCompletionContent(data) ?? "");
    } finally {
      setBusy(null);
    }
  };

  const busyAny = busy !== null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12 print:max-w-none print:px-0 print:py-0">
      <div className="print:hidden space-y-8">
        <header className="space-y-3 text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-wider text-sky-400/90">
            PDF study assistant
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Study Agent
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-zinc-400">
            Ask questions in plain English. Answers come from your indexed PDF
            library. Turn on receipt mode for a 57&nbsp;mm thermal layout, then
            print when you are ready.
          </p>
          <ol className="flex flex-col gap-2 text-left text-sm text-zinc-500 sm:flex-row sm:flex-wrap sm:gap-x-6">
            <li className="flex gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300">
                1
              </span>
              <span>Type your question below.</span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300">
                2
              </span>
              <span>Review the answer and receipt preview.</span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300">
                3
              </span>
              <span>Print from your browser if you need a hard copy.</span>
            </li>
          </ol>
        </header>

        <Section
          title="Ask your library"
          className="border-sky-500/25 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 shadow-lg shadow-black/20 ring-1 ring-sky-500/10"
        >
          <label className="mb-3 flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-3 text-sm text-zinc-400 transition hover:border-zinc-700">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-zinc-600"
              checked={receiptFormat}
              onChange={(e) => setReceiptFormat(e.target.checked)}
            />
            <span>
              <span className="font-medium text-zinc-300">
                Thermal receipt layout
              </span>
              <span className="mt-0.5 block text-xs text-zinc-500">
                32-character column, dividers, and print-friendly wrapping.
              </span>
            </span>
          </label>
          <label className="mb-2 block text-sm font-medium text-zinc-400">
            Your question
            <textarea
              className="mt-2 block min-h-[120px] w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-600 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
              placeholder="e.g. What are the main complications of this procedure?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={busyAny}
              aria-busy={busy === "query"}
            />
          </label>
          <button
            type="button"
            disabled={busyAny}
            onClick={runQuery}
            className="w-full rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-sky-950/40 transition hover:bg-sky-500 disabled:opacity-50 sm:w-auto sm:min-w-[140px]"
          >
            {busy === "query" ? "Getting answer…" : "Get answer"}
          </button>
        </Section>

        <Collapsible
          title="Add or replace PDFs"
          hint="Upload new files, then run Prepare and wait for indexing before asking."
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const fd = new FormData(form);
              setBusy("ingest");
              try {
                const res = await fetch(
                  `/api/datasets/${effectiveDatasetId}/ingest`,
                  {
                    method: "POST",
                    body: fd,
                  },
                );
                const data = await res.json();
                appendLog("Ingest", data);
                form.reset();
              } finally {
                setBusy(null);
              }
            }}
          >
            <p className="text-sm text-zinc-500">
              Library ID in use:{" "}
              <code className="rounded bg-zinc-950 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
                {effectiveDatasetId}
              </code>
            </p>
            <input
              type="file"
              name="files"
              accept=".pdf,application/pdf"
              multiple
              required
              disabled={busyAny}
              className="text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-700 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-100 hover:file:bg-zinc-600"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={busyAny}
                className="rounded-lg bg-zinc-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-600 disabled:opacity-50"
              >
                {busy === "ingest" ? "Uploading…" : "Upload PDFs"}
              </button>
              <button
                type="button"
                disabled={busyAny}
                onClick={prepareDataset}
                className="rounded-lg border border-amber-600/50 bg-amber-950/40 px-4 py-2.5 text-sm font-medium text-amber-200 hover:bg-amber-950/60 disabled:opacity-50"
              >
                {busy === "prepare" ? "Preparing…" : "Prepare (re-index)"}
              </button>
            </div>
            <p className="text-xs text-zinc-600">
              Large books can take many minutes to upload and index. If ingest
              returns 500 or times out, try one PDF at a time or a smaller file,
              then run Prepare again—check the technical log for WAIP’s error
              text. After Prepare finishes, wait before querying if you saw
              &quot;collection not found&quot; before.
            </p>
          </form>
        </Collapsible>

        <Collapsible
          title="Advanced"
          hint="Another library ID or creating a brand-new empty dataset."
        >
          <div className="space-y-5">
            <div>
              <label className="text-sm text-zinc-400">
                Dataset / library ID
                <input
                  className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100"
                  value={datasetId}
                  onChange={(e) => setDatasetId(e.target.value)}
                  placeholder={DEFAULT_WAIP_DATASET_ID}
                  spellCheck={false}
                />
              </label>
              <p className="mt-1 text-xs text-zinc-600">
                Default is built into this app. Clear the field to use the
                default again.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
              <p className="mb-3 text-sm text-zinc-500">
                Create a new empty dataset (WAIP). You will still need to upload
                PDFs and Prepare.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Dataset name"
                />
                <input
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="Description (optional)"
                />
              </div>
              <button
                type="button"
                disabled={busyAny}
                onClick={createDataset}
                className="mt-3 rounded-lg bg-emerald-700/80 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                {busy === "create" ? "Creating…" : "Create new dataset"}
              </button>
            </div>
          </div>
        </Collapsible>

        <Collapsible title="Technical log" hint="API responses for troubleshooting.">
          <button
            type="button"
            className="mb-3 text-xs text-zinc-500 underline hover:text-zinc-400"
            onClick={() => setLog("")}
          >
            Clear log
          </button>
          <pre className="max-h-[320px] overflow-auto rounded-lg border border-zinc-800 bg-black/50 p-3 font-mono text-[11px] leading-relaxed text-zinc-400 whitespace-pre-wrap">
            {log || "Nothing logged yet."}
          </pre>
        </Collapsible>

        <p className="text-center text-xs text-zinc-600">
          Answers use Wipro AI Platform (WAIP) document search on your dataset.
        </p>
      </div>

      {hasQueried && (
        <section
          id="receipt-print"
          className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 print:mb-0 print:rounded-none print:border-0 print:bg-white print:p-3 print:shadow-none"
        >
          <h2 className="mb-3 text-lg font-semibold tracking-tight text-zinc-50 print:hidden">
            Answer ({cols}-column receipt, hard-wrapped)
          </h2>
          <p className="mb-2 text-sm text-zinc-500 print:hidden">
            Text below is re-wrapped to exactly {cols} characters per line for
            thermal printing. Use your browser print dialog (Ctrl+P); other UI
            is hidden on print.
          </p>
          <div className="mb-3 flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              disabled={!wrappedAnswer.trim()}
              onClick={printReceipt}
              className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 shadow hover:bg-zinc-200 disabled:opacity-40"
            >
              Print receipt
            </button>
          </div>
          <pre
            className="max-h-[420px] overflow-auto rounded-lg border border-zinc-700 bg-black/60 p-3 font-mono text-[11px] leading-snug text-zinc-200 whitespace-pre-wrap print:max-h-none print:overflow-visible print:border-0 print:bg-white print:p-0 print:font-mono print:text-[10pt] print:leading-tight print:text-black"
            style={{ maxWidth: `${cols}ch` }}
          >
            {lastAnswerText
              ? wrappedAnswer
              : "(No assistant text found in this response — see log.)"}
          </pre>
        </section>
      )}
    </main>
  );
}
