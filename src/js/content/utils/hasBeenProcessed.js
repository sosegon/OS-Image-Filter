export default function hasBeenProcessed(domElement) {
  return domElement.getAttribute('skf-already-processed') !== null;
}