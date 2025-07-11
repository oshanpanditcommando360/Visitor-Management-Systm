export async function parsePlate(imageDataUrl) {
  const formData = new FormData();
  formData.append('base64Image', imageDataUrl);
  formData.append('language', 'eng');
  const res = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { apikey: 'helloworld' },
    body: formData,
  });
  if (!res.ok) throw new Error('OCR request failed');
  const data = await res.json();
  return data?.ParsedResults?.[0]?.ParsedText || '';
}
