import React, { useEffect, useCallback, useRef } from 'react';
import CanvasImageFilterer from './CanvasImageFilterer';
import validTags from 'Utils/validTags';
import hasBeenProcessed from 'Utils/hasBeenProcessed';
import addSkfId from 'Utils/addSkfId';
import { processDomImg, processBgImg } from 'Utils/filterImage';

const extensionUrl = chrome.extension.getURL('');
const urlExtensionUrl = 'url("' + extensionUrl;
const blankImg =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const urlBlankImg = 'url("' + blankImg + '")';

const processElement = (domElement, callbacks) => {
  const { processIMG, processNoIMG } = callbacks;
  if (domElement.tagName === 'IMG') {
    if(!domElement.getAttribute('skf-id')) {
      addSkfId(domElement);
    }
    if (domElement.complete) {
      processIMG(domElement);
    }
  } else {
    // For these elements the images are in the background-image property
    const computedStyle = getComputedStyle(domElement);
    const bgImg = computedStyle.backgroundImage;

    const isValidBgImg = bgImg !== 'none' &&
      bgImg.includes('url(') &&
      !bgImg.startsWith(urlExtensionUrl) &&
      bgImg !== urlBlankImg;
    const alreadyProcessed = hasBeenProcessed(domElement);

    if (isValidBgImg && !alreadyProcessed) {
      // Used to fetch image with xhr.
      const bgImgUrl = bgImg.slice(5, -2);
      // Avoids quick display of original image
      domElement.style.backgroundImage = "url('')";
      addSkfId(domElement);
      processNoIMG(domElement, bgImgUrl);
    }
  }
}

const scanElements = (domElement, callbacks, includeChildren = false) => {
  if (validTags.includes(domElement.tagName)) {
    processElement(domElement, callbacks);
  }

  if(includeChildren){
    domElement.querySelectorAll(validTags.join(',')).forEach((domElement) => {
      processElement(domElement, callbacks);
    });
  }
}

const useScanWindow = (window, canvasRef) => {

  const processIMG = useCallback(
    (domElement) => {
      if (!canvasRef?.current) {
        return;
      }
      processDomImg(domElement, canvasRef.current);
    },
    [canvasRef]
  );

  const processNoIMG = useCallback(
    (domElement, bgImgUrl) => {
      if (!canvasRef?.current) {
        return;
      }
      processBgImg(domElement, bgImgUrl, canvasRef.current);
    },
    [canvasRef]
  );

  useEffect(() => {
    if(!canvasRef?.current) {
      return; 
    }

    // Scan the body to filter any images on it.
    scanElements(
      window.document.body,
      {
        processIMG,
        processNoIMG,
      },
      true
    );

  }, [window, canvasRef]);
};

function WindowScanner() {
  const canvasRef = useRef(null);
  useScanWindow(window, canvasRef);

  return (
    <CanvasImageFilterer id="skf-canvas-filterer" ref={canvasRef}/>
  );
}

export default WindowScanner;