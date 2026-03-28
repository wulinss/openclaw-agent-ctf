const { createWorker } = require('tesseract.js');
const path = require('path');

async function recognizeImage(imagePath) {
  const worker = await createWorker('chi_sim+eng');
  const ret = await worker.recognize(imagePath);
  console.log(ret.data.text);
  await worker.terminate();
}

const imagePath = process.argv[2];
if (!imagePath) {
  console.error('Please provide an image path');
  process.exit(1);
}

recognizeImage(path.resolve(imagePath));
