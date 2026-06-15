import type { PreparedImageUpload } from './types';
import { largeImageUploadThreshold, maxImageUploadDimension } from './constants';

export const sanitizeFileName = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);

export const estimateDataUrlBytes = (dataUrl: string) => Math.round((dataUrl.length * 3) / 4);

export const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Could not read that image.'));
        }
      });
      reader.addEventListener('error', () => reject(new Error('Could not read that image.')));
      reader.readAsDataURL(file);
    });

export const loadImageForUpload = (dataUrl: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();

      image.addEventListener('load', () => resolve(image), { once: true });
      image.addEventListener('error', () => reject(new Error('Could not load that image.')), { once: true });
      image.src = dataUrl;
    });

export const prepareImageUpload = async (file: File): Promise<PreparedImageUpload> => {
    const dataUrl = await readFileAsDataUrl(file);
    const image = await loadImageForUpload(dataUrl);
    const largestSide = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = largestSide > maxImageUploadDimension ? maxImageUploadDimension / largestSide : 1;
    const shouldOptimize = scale < 1 || file.size > largeImageUploadThreshold;

    if (!shouldOptimize) {
      return {
        dataUrl,
        fileName: file.name,
        finalBytes: file.size,
        originalBytes: file.size,
        resized: false,
      };
    }

    const canvas = document.createElement('canvas');
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');

    if (!context) {
      return {
        dataUrl,
        fileName: file.name,
        finalBytes: file.size,
        originalBytes: file.size,
        resized: false,
      };
    }

    canvas.width = width;
    canvas.height = height;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.86);

    return {
      dataUrl: optimizedDataUrl,
      fileName: file.name,
      finalBytes: estimateDataUrlBytes(optimizedDataUrl),
      originalBytes: file.size,
      resized: true,
    };
  };

export const imageUploadStatusMessage = (image: PreparedImageUpload) =>
    image.resized
      ? `Optimized ${image.fileName} so the draft stays lightweight.`
      : `Uploaded ${image.fileName}.`;
