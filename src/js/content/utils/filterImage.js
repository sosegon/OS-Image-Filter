import '@tensorflow/tfjs-backend-webgl';
import * as bodyPix from '@tensorflow-models/body-pix';

function filterSkinColor(imgElement, canvas) {
  const { width, height } = imgElement;
  canvas.setAttribute('width', width);
  canvas.setAttribute('height', height);

  const context = canvas.getContext('2d');
  context.drawImage(imgElement, 0, 0);

  const imageData = context.getImageData(0, 0, width, height);
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

async function segmentPeople(imgElement, canvas) {
  const model = await bodyPix.load();
  const person = await model.segmentPerson(imgElement);

  canvas.width = imgElement.width;
  canvas.height = imgElement.height;

  const coloredPartImage = bodyPix.toMask(
    person,
    { r: 127, g: 127, b: 127, a: 255 },
    { r: 0, g: 0, b: 0, a: 0 },
    false
  );

  const opacity = 1;
  const flipHorizontal = false;
  const maskBlurAmount = 0;

  bodyPix.drawMask(
    canvas,
    imgElement,
    coloredPartImage,
    opacity,
    maskBlurAmount,
    flipHorizontal
  );

  const base64Img = canvas.toDataURL('image/png');
  return base64Img;
}

export async function processDomImg(imgElement, canvas) {
  const urlData = await segmentPeople(imgElement, canvas);
  imgElement.src = urlData;
  imgElement.srcset = '';
  imgElement.onload = () => {
    imgElement.setAttribute('skf-already-processed', 'true');
    imgElement.classList.remove('skf-hide-class');
  };
}

function fetchAndReadImage(url) {
  return fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      return new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
      });
    })
    .then((dataUrl) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = dataUrl;
      return new Promise((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = reject;
      });
    });
}

function filterImageElementAsBackground(imgElement, domElement, canvas) {
  const base64Img = filterSkinColor(imgElement, canvas);
  const newBackgroundImgUrl = "url('" + base64Img + "')";

  domElement.style.backgroundImage = newBackgroundImgUrl;
  domElement.setAttribute('skf-already-processed', 'true');
  domElement.classList.remove('skf-hide-class');
}

export function processBgImg(domElement, bgUrl, canvas) {
  fetchAndReadImage(bgUrl).then((image) => {
    filterImageElementAsBackground(image, domElement, canvas);
  });
}
