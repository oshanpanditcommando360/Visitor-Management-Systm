import Ocrad from "ocrad.js";

export async function parsePlate(imageDataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const text = Ocrad(img);
        resolve(text);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (err) => reject(err);
    img.src = imageDataUrl;
  });
}
