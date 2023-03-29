import React, { useEffect, useCallback } from 'react';
import { processDomImg, processBgImg } from 'Utils/filterImage';
import validTags from 'Utils/validTags';
import hasBeenProcessed from 'Utils/hasBeenProcessed';
import addSkfId from 'Utils/addSkfId';

// eslint-disable-next-line no-undef
const extensionUrl = chrome.extension.getURL('');
const urlExtensionUrl = `url("${extensionUrl}`;
const blankImg =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const urlBlankImg = `url("${blankImg}")`;

const processElement = (domElement, callbacks) => {
  const { processIMG, processNoIMG } = callbacks;
  if (domElement.tagName === 'IMG') {
    // Hide until the image is processed
    domElement.classList.add('skf-hide-class');

    if (!domElement.getAttribute('skf-id')) {
      addSkfId(domElement);
    }

    if (domElement.complete) {
      processIMG(domElement);
    } else {
      const self = domElement;
      domElement.addEventListener('load', () => {
        if (!hasBeenProcessed(self)) {
          processIMG(self);
        }
      });
    }
  } else {
    // For these elements the images are in the background-image property
    const computedStyle = getComputedStyle(domElement);
    const bgImg = computedStyle.getPropertyValue('background-image');
    const isValidBgImg =
      bgImg !== 'none' &&
      bgImg.includes('url(') &&
      !bgImg.startsWith(urlExtensionUrl) &&
      bgImg !== urlBlankImg;
    const alreadyProcessed = hasBeenProcessed(domElement);

    if (isValidBgImg && !alreadyProcessed) {
      // Hide until the image is processed
      domElement.classList.add('skf-hide-class');

      // Used to fetch image with xhr.
      const bgImgUrl = bgImg.slice(5, -2);

      // Avoids quick display of original image
      domElement.style.backgroundImage = "url('')";
      addSkfId(domElement);
      processNoIMG(domElement, bgImgUrl);
    }
  }
};

const scanElements = (domElement, callbacks, includeChildren = false) => {
  if (validTags.includes(domElement.tagName)) {
    processElement(domElement, callbacks);
  }

  if (includeChildren) {
    domElement
      .querySelectorAll(validTags.join(','))
      .forEach(childDomElement => {
        processElement(childDomElement, callbacks);
      });
  }
};

const useScanWindow = window => {
  const processIMG = useCallback(domElement => {
    processDomImg(domElement);
  }, []);

  const processNoIMG = useCallback((domElement, bgImgUrl) => {
    processBgImg(domElement, bgImgUrl);
  }, []);

  useEffect(() => {
    // Scan the body to filter any images on it.
    scanElements(
      window.document.body,
      {
        processIMG,
        processNoIMG,
      },
      true,
    );

    // Observe changes in the DOM to filter new images.
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.type === 'childList') {
          m.addedNodes.forEach(domElement => {
            // TODO: Handle iframes, is it necessary?
            if (
              domElement.tagName !== 'CANVAS' &&
              domElement.tagName !== 'IFRAME'
            ) {
              scanElements(domElement, {
                processIMG,
                processNoIMG,
              });
            }
          });
        } else if (m.type === 'attributes') {
          if (
            m.attributeName === 'style' &&
            m.target.style.backgroundImage.includes('url(')
          ) {
            scanElements(m.target, {
              processIMG,
              processNoIMG,
            });
          }
        }
      });
    });

    observer.observe(window.document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeOldValue: true,
    });
  }, [window, processIMG, processNoIMG]);
};

function WindowScanner() {
  useScanWindow(window);
  return <div id="skf-window-scanner" />;
}

export default WindowScanner;
