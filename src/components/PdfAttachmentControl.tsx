import React, { useRef, useState } from "react";
import { Download, Eye, FileText, Trash2, Upload } from "lucide-react";
import { StoredPdf } from "../types";

const MAX_PDF_BYTES = 4 * 1024 * 1024;

export const readPdfFile = (file: File): Promise<StoredPdf> =>
  new Promise((resolve, reject) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      reject(new Error("Kies een PDF-bestand."));
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      reject(new Error("De PDF is groter dan 4 MB. Verklein het bestand eerst."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("De PDF kon niet worden gelezen."));
        return;
      }
      resolve({
        name: file.name,
        size: file.size,
        type: "application/pdf",
        dataUrl: reader.result,
        uploadedAt: new Date().toISOString(),
      });
    };
    reader.onerror = () => reject(new Error("De PDF kon niet worden gelezen."));
    reader.readAsDataURL(file);
  });

const formatSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

interface PdfAttachmentControlProps {
  attachment?: StoredPdf;
  onChange: (attachment?: StoredPdf) => void;
  label?: string;
  compact?: boolean;
}

export const PdfAttachmentControl: React.FC<PdfAttachmentControlProps> = ({
  attachment,
  onChange,
  label = "PDF toevoegen",
  compact = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await readPdfFile(file));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Uploaden is mislukt.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={compact ? "space-y-2" : "rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60"}>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {attachment ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-rose-500" />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-800 dark:text-white">{attachment.name}</p>
              <p className="text-[10px] text-slate-400">{formatSize(attachment.size)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <a href={attachment.dataUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-200">
              <Eye className="h-3.5 w-3.5" /> Open
            </a>
            <a href={attachment.dataUrl} download={attachment.name} className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-200">
              <Download className="h-3.5 w-3.5" /> Download
            </a>
            <button type="button" onClick={() => onChange(undefined)} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-600 dark:bg-rose-950/30 dark:text-rose-300">
              <Trash2 className="h-3.5 w-3.5" /> Verwijder
            </button>
          </div>
        </div>
      ) : (
        <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-[#174A7E] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
          <Upload className="h-4 w-4 text-[#39B8C8]" /> {busy ? "PDF lezen..." : label}
        </button>
      )}
      {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}
    </div>
  );
};
