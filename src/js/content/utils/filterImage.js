import '@tensorflow/tfjs-backend-webgl';
import * as bodyPix from '@tensorflow-models/body-pix';

function fetchAndReadImage(url) {
  return fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      return new Promise(resolve => {
        reader.onloadend = () => resolve(reader.result);
      });
    })
    .then(dataUrl => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = dataUrl;
      return new Promise((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = reject;
      });
    });
}

async function getImageData(imgElement) {
  // Make the canvas the same size as the actual image
  const canvas = document.createElement('canvas');
  canvas.width = imgElement.naturalWidth;
  canvas.height = imgElement.naturalWidth;
  const context = canvas.getContext('2d');
  context.drawImage(imgElement, 0, 0);
  context.getImageData(0, 0, canvas.width, canvas.height);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  return { imageData, canvas };
}

// eslint-disable-next-line no-unused-vars
async function filterSkinColor(imgElement) {
  const { imageData, canvas } = await getImageData(imgElement);

  if (!imageData) {
    throw new Error('No image data when filtering skin color');
  }

  const context = canvas.getContext('2d');

  const rgbaArray = imageData.data;

  for (let i = 0; i < rgbaArray.length; i += 4) {
    const rIndex = i;
    const gIndex = i + 1;
    const bIndex = i + 2;
    const aIndex = i + 3;

    const r = rgbaArray[rIndex];
    const g = rgbaArray[gIndex];
    const b = rgbaArray[bIndex];

    if (
      r > 95 &&
      g > 40 &&
      b > 20 &&
      Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
      Math.abs(r - g) > 15 &&
      r > g &&
      r > b
    ) {
      rgbaArray[rIndex] = 127;
      rgbaArray[gIndex] = 127;
      rgbaArray[bIndex] = 127;
      rgbaArray[aIndex] = 255;
    }
  }

  imageData.data.set(rgbaArray);
  context.putImageData(imageData, 0, 0);
  const base64Img = canvas.toDataURL('image/png');

  return base64Img;
}

async function grayoutPeople(model, imgElement, imgElementToGrayout) {
  // Process on the actual image size
  const naturalDimensionsImgElement = new Image();
  naturalDimensionsImgElement.width = imgElement.naturalWidth;
  naturalDimensionsImgElement.height = imgElement.naturalHeight;
  naturalDimensionsImgElement.crossOrigin = 'anonymous';
  naturalDimensionsImgElement.src = imgElement.src;
  await new Promise(resolve => {
    naturalDimensionsImgElement.onload = resolve;
  });

  const person = await model.segmentPerson(naturalDimensionsImgElement);

  if (person.allPoses.length === 0) {
    throw new Error('No person detected');
  }

  const coloredPartImage = bodyPix.toMask(
    person,
    { r: 127, g: 127, b: 127, a: 255 },
    { r: 0, g: 0, b: 0, a: 0 },
    false,
  );

  const canvas = document.createElement('canvas');
  canvas.width = naturalDimensionsImgElement.width;
  canvas.heigh = naturalDimensionsImgElement.height;

  const opacity = 1;
  const flipHorizontal = false;
  const maskBlurAmount = 0;

  const imgToDraw = naturalDimensionsImgElement || imgElementToGrayout;

  bodyPix.drawMask(
    canvas,
    imgToDraw,
    coloredPartImage,
    opacity,
    maskBlurAmount,
    flipHorizontal,
  );

  const originalSizedCanvas = document.createElement('canvas');
  originalSizedCanvas.width = imgElement.width;
  originalSizedCanvas.height = imgElement.height;
  originalSizedCanvas
    .getContext('2d')
    .drawImage(canvas, 0, 0, imgElement.width, imgElement.height);

  return originalSizedCanvas;
}

// eslint-disable-next-line no-unused-vars
async function segmentPeople(imgElement) {
  const originalImgWidth = imgElement.naturalWidth;
  const originalImgHeight = imgElement.naturalHeight;
  if (originalImgWidth === 0 || originalImgHeight === 0) {
    throw new Error('Image width or height is 0');
  }
  const model = await bodyPix.load();

  // Check size of image to perform segmentation
  const originalImgRatio = originalImgWidth / originalImgHeight;
  const originalImgArea = originalImgWidth * originalImgHeight;

  const fasterImgWidth = 512;
  const fasterImgHeight = Math.ceil(fasterImgWidth / originalImgRatio);
  const fasterImgArea = fasterImgWidth * fasterImgHeight;

  // For small enough images, process the original image
  if (originalImgArea < fasterImgArea) {
    try {
      const canvas = await grayoutPeople(model, imgElement);
      return canvas.toDataURL('image/png');
    } catch (error) {
      throw new Error(
        [error, 'Error graying people out in ORIGINAL image'].join(', '),
      );
    }
  }

  // For larger images, resize the image to a smaller size
  // Image where the segmentation is going to be performed
  const newImgElement = new Image();
  newImgElement.width = fasterImgWidth;
  newImgElement.height = fasterImgHeight;
  newImgElement.src = imgElement.src;
  await new Promise(resolve => {
    newImgElement.onload = resolve;
  });

  // Get the image data to draw the segmentation
  const cloneImgElement = newImgElement.cloneNode(false);
  const preCanvas = document.createElement('canvas');
  preCanvas.width = fasterImgWidth;
  preCanvas.height = fasterImgHeight;
  preCanvas
    .getContext('2d')
    .drawImage(cloneImgElement, 0, 0, fasterImgWidth, fasterImgHeight);

  // Image where the segmentation is going to be drawn
  const imgElementToApplyGray = new Image();
  imgElementToApplyGray.width = fasterImgWidth;
  imgElementToApplyGray.height = fasterImgHeight;
  imgElementToApplyGray.src = preCanvas.toDataURL('image/png');
  await new Promise(resolve => {
    imgElementToApplyGray.onload = resolve;
  });

  try {
    const canvas = await grayoutPeople(
      model,
      newImgElement,
      imgElementToApplyGray,
    );
    // Resize the canvas to the original image size
    const originalSizedCanvas = document.createElement('canvas');
    originalSizedCanvas.width = originalImgWidth;
    originalSizedCanvas.height = originalImgHeight;
    originalSizedCanvas
      .getContext('2d')
      .drawImage(canvas, 0, 0, originalImgWidth, originalImgHeight);

    const base64Img = originalSizedCanvas.toDataURL('image/png');
    return base64Img;
  } catch (error) {
    throw new Error('Error graying people out in RESIZED image');
  }
}

export async function processDomImg(imgElement) {
  try {
    const urlData = await segmentPeople(imgElement);
    imgElement.crossOrigin = 'anonymous';
    imgElement.src = urlData;
    imgElement.srcset = '';
    imgElement.onload = () => {
      imgElement.setAttribute('skf-already-processed', 'true');
      imgElement.classList.remove('skf-hide-class');
    };
  } catch (error) {
    // Either the processing failed or there was no person detected
    imgElement.setAttribute('skf-already-processed', 'true');
    imgElement.classList.remove('skf-hide-class');
  }
}

async function filterImageElementAsBackground(imgElement, domElement, bgUrl) {
  try {
    const base64Img = await segmentPeople(imgElement);
    domElement.style.backgroundImage = `url(${base64Img})`;
  } catch (error) {
    // Either the processing failed or there was no person detected,
    // set the original image
    domElement.style.backgroundImage = `url(${bgUrl})`;
  } finally {
    domElement.setAttribute('skf-already-processed', 'true');
    domElement.classList.remove('skf-hide-class');
  }
}

export function processBgImg(domElement, bgUrl) {
  fetchAndReadImage(bgUrl).then(image => {
    filterImageElementAsBackground(image, domElement, bgUrl);
  });
}
