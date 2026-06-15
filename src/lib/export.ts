import html2canvas from 'html2canvas';
import { createId } from './factories';
import type { PdfPageImage } from './types';

export type ExportCanvasColors = { text: string; background: string; rule: string };

export const downloadBlob = (blob: Blob, fileName: string) => {
  const downloadUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');

  downloadLink.href = downloadUrl;
  downloadLink.download = fileName;
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(downloadUrl);
};

export const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Could not render the menu export.'));
        }
      },
      type,
      quality,
    );
  });

export const blobToBytes = async (blob: Blob) => new Uint8Array(await blob.arrayBuffer());

export const sanitizeCanvasUnsupportedColors = (value: string) =>
  value.replace(/\b(?:oklch|oklab|lch|lab)\([^)]*\)/g, '#64748b');

export const collectExportStyles = () =>
  sanitizeCanvasUnsupportedColors(
    Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
        } catch {
          return '';
        }
      })
      .filter(Boolean)
      .join('\n'),
  );

export const renderElementToCanvas = async (element: HTMLElement, colors: ExportCanvasColors) => {
  const rect = element.getBoundingClientRect();
  const width = Math.ceil(Math.max(rect.width, element.scrollWidth));
  const height = Math.ceil(Math.max(rect.height, element.scrollHeight));

  if (width <= 0 || height <= 0) {
    throw new Error('Open the menu preview before exporting.');
  }

  const exportTargetId = createId();
  const exportStyles = collectExportStyles();
  element.dataset.exportTarget = exportTargetId;

  try {
    return await html2canvas(element, {
      backgroundColor: '#ffffff',
      height,
      logging: false,
      scale: 2,
      useCORS: true,
      width,
      windowHeight: Math.max(document.documentElement.scrollHeight, height),
      windowWidth: Math.max(document.documentElement.scrollWidth, width),
      onclone: (clonedDocument) => {
        const clonedElement = clonedDocument.querySelector<HTMLElement>(`[data-export-target="${exportTargetId}"]`);
        const sanitizedStyle = clonedDocument.createElement('style');
        const overrideStyle = clonedDocument.createElement('style');

        clonedDocument.querySelectorAll('style, link[rel="stylesheet"]').forEach((styleNode) => styleNode.remove());
        sanitizedStyle.textContent = exportStyles;
        clonedDocument.head.append(sanitizedStyle);

        overrideStyle.textContent = `
          html,
          body {
            background: #ffffff !important;
            color: ${colors.text} !important;
          }
          [data-export-target="${exportTargetId}"] {
            background-color: ${colors.background} !important;
            color: ${colors.text} !important;
          }
          [data-export-target="${exportTargetId}"],
          [data-export-target="${exportTargetId}"] * {
            border-color: ${colors.rule} !important;
            outline-color: ${colors.rule} !important;
            text-decoration-color: currentColor !important;
          }
        `;
        clonedDocument.head.append(overrideStyle);

        if (!clonedElement) return;

        clonedElement.style.margin = '0';
        clonedElement.style.transform = 'none';
        clonedElement.style.boxShadow = 'none';
        clonedElement.querySelectorAll<HTMLElement>('.menu-print-preview').forEach((pageElement) => {
          pageElement.style.boxShadow = 'none';
        });
      },
    });
  } finally {
    delete element.dataset.exportTarget;
  }
};

export const createPdfBlob = (pages: PdfPageImage[]) => {
  const encoder = new TextEncoder();
  const chunks: BlobPart[] = [];
  const offsets = new Map<number, number>();
  let byteOffset = 0;

  const append = (chunk: string | Uint8Array) => {
    const bytes = typeof chunk === 'string' ? encoder.encode(chunk) : chunk;
    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);

    chunks.push(buffer);
    byteOffset += bytes.length;
  };

  const appendObject = (objectId: number, objectChunks: Array<string | Uint8Array>) => {
    offsets.set(objectId, byteOffset);
    append(`${objectId} 0 obj\n`);
    objectChunks.forEach((chunk) => append(chunk));
    append('\nendobj\n');
  };

  const pageObjectIds = pages.map((_, index) => 3 + index * 3);
  const maxObjectId = 2 + pages.length * 3;

  append('%PDF-1.4\n');
  appendObject(1, ['<< /Type /Catalog /Pages 2 0 R >>']);
  appendObject(2, [`<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`]);

  pages.forEach((page, index) => {
    const pageObjectId = 3 + index * 3;
    const contentObjectId = pageObjectId + 1;
    const imageObjectId = pageObjectId + 2;
    const imageName = `Im${index + 1}`;
    const content = `q\n${page.pageWidth.toFixed(2)} 0 0 ${page.pageHeight.toFixed(2)} 0 0 cm\n/${imageName} Do\nQ`;

    appendObject(pageObjectId, [
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.pageWidth.toFixed(2)} ${page.pageHeight.toFixed(
        2,
      )}] /Resources << /XObject << /${imageName} ${imageObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`,
    ]);
    appendObject(contentObjectId, [`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`]);
    appendObject(imageObjectId, [
      `<< /Type /XObject /Subtype /Image /Width ${page.imageWidth} /Height ${page.imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.imageBytes.length} >>\nstream\n`,
      page.imageBytes,
      '\nendstream',
    ]);
  });

  const xrefOffset = byteOffset;
  append(`xref\n0 ${maxObjectId + 1}\n`);
  append('0000000000 65535 f \n');

  for (let objectId = 1; objectId <= maxObjectId; objectId += 1) {
    append(`${String(offsets.get(objectId) ?? 0).padStart(10, '0')} 00000 n \n`);
  }

  append(`trailer\n<< /Size ${maxObjectId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return new Blob(chunks, { type: 'application/pdf' });
};
