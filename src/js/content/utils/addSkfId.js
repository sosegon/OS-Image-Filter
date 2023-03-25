export default function addSkfId(domElement) {
  const uuid = crypto.randomUUID()
  domElement.setAttribute('skf-id', uuid);
  return uuid;
}