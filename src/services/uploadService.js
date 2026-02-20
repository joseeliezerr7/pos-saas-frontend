import api from "./api";

/**
 * Compress an image file using Canvas before uploading.
 * Resizes to maxWidth/maxHeight maintaining aspect ratio and converts to JPEG.
 *
 * @param {File} file - Original image file
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Max width (default 1200)
 * @param {number} options.maxHeight - Max height (default 1200)
 * @param {number} options.quality - JPEG quality 0-1 (default 0.8)
 * @returns {Promise<File>} Compressed image file
 */
function compressImage(
  file,
  { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = {},
) {
  return new Promise((resolve) => {
    // Skip compression for GIFs (animation) or very small files (< 100KB)
    if (file.type === "image/gif" || file.size < 100 * 1024) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Don't upscale small images
      if (width <= maxWidth && height <= maxHeight) {
        // Still re-encode to reduce quality/size
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // If compression made it bigger, use original
              resolve(file);
              return;
            }
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          },
          "image/jpeg",
          quality,
        );
        return;
      }

      // Calculate new dimensions maintaining aspect ratio
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      const newWidth = Math.round(width * ratio);
      const newHeight = Math.round(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext("2d");

      // Use high-quality downscaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      // On error, just use the original file
      resolve(file);
    };

    img.src = url;
  });
}

export const uploadService = {
  /**
   * Upload an image with automatic client-side compression.
   * Compresses before sending to reduce upload time and bandwidth.
   */
  async uploadImage(file) {
    // Compress before uploading
    const compressed = await compressImage(file);

    const formData = new FormData();
    formData.append("image", compressed);

    const response = await api.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async deleteImage(path) {
    const response = await api.post("/upload/delete-image", { path });
    return response.data;
  },
};
