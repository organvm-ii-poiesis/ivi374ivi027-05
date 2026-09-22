/** Encode a repository-relative archive path, preserving only directory separators. */
export function buildMirrorDownloadUrl(relativePath: string): string {
  return `/mirror/${relativePath.split("/").map(encodeURIComponent).join("/")}`;
}
