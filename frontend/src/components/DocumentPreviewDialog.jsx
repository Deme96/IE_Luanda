import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Eye, Printer } from "lucide-react";

function getPreviewType(fileUrl) {
  const value = String(fileUrl || "");
  const dataMime = value.match(/^data:([^;,]+)/i)?.[1]?.toLowerCase();
  if (dataMime === "application/pdf" || dataMime?.endsWith("+pdf")) return "pdf";
  if (dataMime?.startsWith("image/")) return "image";

  const path = value.split(/[?#]/, 1)[0].toLowerCase();
  if (path.endsWith(".pdf")) return "pdf";
  if (/\.(?:avif|bmp|gif|jpe?g|png|svg|webp)$/.test(path)) return "image";
  return null;
}

function getFileExtension(fileUrl) {
  const value = String(fileUrl || "");
  const dataMime = value.match(/^data:([^;,]+)/i)?.[1]?.toLowerCase();
  const mimeExtensions = {
    "application/pdf": ".pdf",
    "image/avif": ".avif",
    "image/bmp": ".bmp",
    "image/gif": ".gif",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/svg+xml": ".svg",
    "image/webp": ".webp"
  };
  if (mimeExtensions[dataMime]) return mimeExtensions[dataMime];

  const path = value.split(/[?#]/, 1)[0].toLowerCase();
  const extension = path.match(/\.([a-z0-9]{1,8})$/)?.[1];
  return extension ? `.${extension}` : "";
}

function getDownloadName(fileName, title, fileUrl) {
  const rawName = String(fileName || title || "documento").replace(/[<>:"/\\|?*]/g, "_");
  const name = Array.from(rawName, (character) =>
    character.charCodeAt(0) < 32 ? "_" : character
  ).join("").trim() || "documento";
  const extension = getFileExtension(fileUrl);
  if (!extension || /\.[a-z0-9]{1,8}$/i.test(name)) return name;
  return `${name}${extension}`;
}

export function DocumentPreviewContent({ fileUrl, title }) {
  const previewType = getPreviewType(fileUrl);

  if (previewType === "pdf") {
    return (
      <iframe
        src={fileUrl}
        title={title || "Pré-visualização do documento PDF"}
        className="h-[68vh] min-h-[320px] w-full rounded-xl border border-gray-200 bg-gray-50"
      />
    );
  }

  if (previewType === "image") {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
        <img
          src={fileUrl}
          alt={title || "Documento"}
          className="max-h-[68vh] max-w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
      <p className="font-medium text-gray-800">Este formato não pode ser pré-visualizado no sistema.</p>
      <p className="text-sm text-gray-500">Pode baixar o ficheiro para o abrir no dispositivo.</p>
    </div>
  );
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  fileUrl = "",
  title = "Visualizar documento",
  description = "",
  fileName,
  onPrint,
  children
}) {
  const downloadName = getDownloadName(fileName, title, fileUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[88vh] w-[96vw] max-w-5xl flex-col gap-4 overflow-hidden p-5 sm:p-6">
        <DialogHeader className="shrink-0 border-b pb-3 pr-7 text-left">
          <DialogTitle className="truncate">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto py-1">
          {children || (
            <DocumentPreviewContent fileUrl={fileUrl} title={title} />
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t pt-3">
          <div className="flex flex-wrap items-center gap-2">
            {onPrint && (
              <Button type="button" variant="outline" size="sm" onClick={onPrint}>
                <Printer size={14} /> Imprimir
              </Button>
            )}
            {fileUrl && (
              <a
                href={fileUrl}
                download={downloadName}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent"
              >
                <Download size={14} /> Baixar ficheiro
              </a>
            )}
          </div>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DocumentPreviewButton({
  fileUrl,
  title,
  description,
  fileName,
  label = "Visualizar",
  className = "",
  variant = "outline",
  size = "sm"
}) {
  const [open, setOpen] = useState(false);
  if (!fileUrl) return null;

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Eye size={14} /> {label}
      </Button>
      <DocumentPreviewDialog
        open={open}
        onOpenChange={setOpen}
        fileUrl={fileUrl}
        title={title}
        description={description}
        fileName={fileName}
      />
    </>
  );
}
