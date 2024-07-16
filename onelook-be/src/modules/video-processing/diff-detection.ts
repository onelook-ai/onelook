import * as jimp from 'jimp';

// Ref: https://medium.com/hackernoon/motion-detection-in-javascript-2614adea9325
export async function diffDetection(
  imageFilePath: string,
  previousFrame: number[],
): Promise<{
  frameData: number[];
  hasDiff: boolean;
}> {
  const image = await jimp.read(imageFilePath);
  image.scale(0.025);
  const w = image.bitmap.width;
  const h = image.bitmap.height;

  const threshold = 50;
  let hasDiff = false;
  const currentFrame: number[] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const color = image.getPixelColor(x, y);
      const { r, g, b } = jimp.intToRGBA(color);
      const total = r + g + b;

      const pos = x + y * w;

      if (Math.abs((previousFrame[pos] || 10000) - total) > threshold) {
        hasDiff = true;
      }
      // store these colour values to compare to the next frame
      currentFrame[pos] = total;
    }
  }

  return {
    frameData: currentFrame,
    hasDiff,
  };
}
