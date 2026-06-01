export async function createAudioFingerprint(file, segmentSize = 256 * 1024) {
  const arrayBuffer = await file.arrayBuffer();
  const fingerprints = [];

  for (let start = 0; start < arrayBuffer.byteLength; start += segmentSize) {
    const chunk = arrayBuffer.slice(start, start + segmentSize);
    const hashBuffer = await crypto.subtle.digest("SHA-256", chunk);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex =
      "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    fingerprints.push(hashHex);
  }

  return fingerprints;
}

export function compareFingerprints(original, target) {
  if (!original.length || !target.length) return 0;

  const originalSet = new Set(original.map((h) => h.toLowerCase()));
  let matched = 0;

  for (const hash of target) {
    if (originalSet.has(hash.toLowerCase())) {
      matched++;
    }
  }

  return Math.round((matched / target.length) * 100);
}