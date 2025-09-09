export async function renderImageToDataURL(
  file: File,
  options: { maxDimension?: number; mimeType?: 'image/jpeg' | 'image/png'; quality?: number } = {}
): Promise<string> {
  const { maxDimension = 2000, mimeType = 'image/jpeg', quality = 0.92 } = options;

  return new Promise((resolve, reject) => {
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          const w = (img as HTMLImageElement).naturalWidth || img.width;
          const h = (img as HTMLImageElement).naturalHeight || img.height;
          const ratio = Math.min(1, maxDimension / Math.max(w, h));
          const targetW = Math.max(1, Math.round(w * ratio));
          const targetH = Math.max(1, Math.round(h * ratio));

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas 初始化失败');

          ctx.drawImage(img, 0, 0, targetW, targetH);
          const dataUrl = canvas.toDataURL(mimeType, quality);
          URL.revokeObjectURL(url);
          resolve(dataUrl);
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('图片加载失败'));
      };
      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
}

