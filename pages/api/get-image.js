import poems from "../../data/poem.json";
import { createCanvas } from "canvas";

// Function to generate a 4-bit grayscale BMP image with poem text
function generatePoemBMP(poem) {
  const width = 800;
  const height = 480;
  const bitsPerPixel = 4;
  const colorTableSize = 16; // 2^4 colors
  const imageSize = (width * height * bitsPerPixel) / 8;
  const bmpHeaderSize = 54 + colorTableSize * 4;
  const fileSize = bmpHeaderSize + imageSize;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontSize = 24;
  ctx.font = `${fontSize}px sans-serif`; // Use a default sans-serif font

  // Split the poem into lines that fit within the width
  const poemText = poem.Poem;
  const words = poemText.split(" ");
  let line = "";
  const lines = [];
  for (const word of words) {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > width - 20) {
      // Leave some margin
      lines.push(line);
      line = word + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line); // Add the last line
  lines.push("- " + poem.Poet);

  // Draw the text, centered
  const lineHeight = fontSize * 1.2; //  line height
  const startY = height / 2 - (lines.length * lineHeight) / 2;
  lines.forEach((textLine, index) => {
    ctx.fillText(textLine, width / 2, startY + index * lineHeight);
  });

  const buffer = Buffer.alloc(fileSize);

  // BMP Header
  buffer.write("BM", 0);
  buffer.writeUInt32LE(fileSize, 2);
  buffer.writeUInt32LE(0, 6); // Reserved
  buffer.writeUInt32LE(bmpHeaderSize, 10); // Offset to pixel data
  buffer.writeUInt32LE(40, 14); // DIB header size
  buffer.writeUInt32LE(width, 18);
  buffer.writeUInt32LE(height, 22);
  buffer.writeUInt16LE(1, 26); // Planes
  buffer.writeUInt16LE(bitsPerPixel, 28); // Bits per pixel
  buffer.writeUInt32LE(0, 30); // Compression (BI_RGB)
  buffer.writeUInt32LE(imageSize, 34); // Image size (including padding)
  buffer.writeUInt32LE(2835, 38); // X Pixels per meter (72 DPI * 39.37)  Increased DPI
  buffer.writeUInt32LE(2835, 42); // Y Pixels per meter (72 DPI * 39.37)  Increased DPI
  buffer.writeUInt32LE(colorTableSize, 46); // Colors in color table
  buffer.writeUInt32LE(0, 50); // Important colors

  // Color Table (16 grayscale entries)
  for (let i = 0; i < colorTableSize; i++) {
    const gray = Math.floor((i / (colorTableSize - 1)) * 255); // Scale to 0-255
    buffer.writeUInt8(gray, 54 + i * 4); // Blue
    buffer.writeUInt8(gray, 55 + i * 4); // Green
    buffer.writeUInt8(gray, 56 + i * 4); // Red
    buffer.writeUInt8(0, 57 + i * 4); // Alpha
  }
  // Pixel Data
  let pixelIndex = bmpHeaderSize;
  for (let y = height - 1; y >= 0; y--) {
    // BMP is bottom-up
    for (let x = 0; x < width; x++) {
      const color = ctx.getImageData(x, y, 1, 1).data[0]; // Red channel is grayscale
      const paletteIndex = Math.floor((color / 255) * 15); // Scale 0-255 to 0-15
      // Each pixel is 4 bits.  Two pixels per byte.
      if (x % 2 === 0) {
        buffer[pixelIndex] = paletteIndex << 4; // High nibble
      } else {
        buffer[pixelIndex] |= paletteIndex; // Low nibble
        pixelIndex++;
      }
    }
    if (width % 2 !== 0) {
      pixelIndex++; //padding byte
    }
  }
  return buffer;
}
export default async function handler(req, res) {
  //   const { tag } = req.query;

  let tag = "Love";
  let filteredPoems = poems;

  if (tag) {
    const tagArray = tag.split(",");
    filteredPoems = filteredPoems.filter((poem) => {
      if (!poem.Tags) return false;
      return tagArray.every((t) => poem.Tags.includes(t));
    });
  }
  let wordCountLessThan = 100;
  if (wordCountLessThan) {
    const maxWordCount = parseInt(wordCountLessThan);
    if (!isNaN(maxWordCount)) {
      filteredPoems = filteredPoems.filter(
        (poem) => poem.WordCount < maxWordCount
      );
    }
  }
  if (filteredPoems.length === 0) {
    res.status(404).json({ error: "No poems found for the specified tag." });
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredPoems.length);
  const randomPoem = filteredPoems[randomIndex];

  const bmpBuffer = generatePoemBMP(randomPoem);

  res.setHeader("Content-Type", "image/bmp");
  res.setHeader("Content-Disposition", 'inline; filename="poem.bmp"'); //  filename
  res.send(bmpBuffer);
}
