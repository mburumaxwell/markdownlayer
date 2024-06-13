export function getYAMLErrorLine(rawData: string | undefined, objectKey: string) {
  if (!rawData) return 0;
  const indexOfObjectKey = rawData.search(
    // Match key either at the top of the file or after a newline
    // Ensures matching on top-level object keys only
    new RegExp(`(\n|^)${objectKey}`),
  );
  if (indexOfObjectKey === -1) return 0;

  const dataBeforeKey = rawData.substring(0, indexOfObjectKey + 1);
  const numNewlinesBeforeKey = dataBeforeKey.split('\n').length;
  return numNewlinesBeforeKey;
}
