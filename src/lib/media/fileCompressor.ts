/**
 * Utilitário de Otimização e Compressão de Arquivos no Cliente
 * Reduz imagens (PNG/JPG) antes do upload usando Canvas -> WebP,
 * economizando até 90% de espaço sem inchar o banco nem o storage.
 */

export interface CompressionResult {
  file: File | Blob;
  name: string;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
  dataUrl: string;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): 'pdf' | 'doc' | 'docx' | 'zip' | 'png' | 'jpg' {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'doc') return 'doc';
  if (ext === 'docx') return 'docx';
  if (ext === 'zip' || ext === 'rar' || ext === '7z') return 'zip';
  if (ext === 'png') return 'png';
  return 'jpg';
}

/**
 * Comprime uma imagem JPG/PNG client-side antes de salvar
 */
export async function compressImageFile(file: File, maxWidth = 1920, quality = 0.82): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          file,
          name: file.name,
          originalSize: file.size,
          compressedSize: file.size,
          reductionPercentage: 0,
          dataUrl: e.target?.result as string,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/webp', quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Blob conversion failed'));
              return;
            }
            const originalSize = file.size;
            const compressedSize = blob.size;
            const reduction = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

            resolve({
              file: blob,
              name: file.name.replace(/\.[^/.]+$/, '') + '.webp',
              originalSize,
              compressedSize,
              reductionPercentage: reduction,
              dataUrl,
            });
          },
          'image/webp',
          quality
        );
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
