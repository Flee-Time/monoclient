export default async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<Blob> {
    const image = new Image();
    image.src = imageSrc;
  
    return new Promise((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
  
        if (!ctx) {
          return reject(new Error("Failed to get 2D context"));
        }
  
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
  
        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );
  
        // Convert the canvas to a Blob and resolve the promise
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob); // Return the Blob
          } else {
            reject(new Error("Canvas is empty"));
          }
        }, "image/jpeg"); // Specify JPEG format
      };
  
      image.onerror = reject;
    });
  }