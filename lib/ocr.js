let ocradPromise;

export async function parsePlate(imageDataUrl) {
  if (!ocradPromise) {
    ocradPromise = import("ocrad.js").then((mod) => mod.default || mod);
  }
  const Ocrad = await ocradPromise;
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
