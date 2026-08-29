export const LANDSCAPE_CONTENT_SCALE = 0.82;

export function getVirtualCanvasSize(width: number, height: number) {
  const contentScale = width > height ? LANDSCAPE_CONTENT_SCALE : 1;
  return {
    width: width / contentScale,
    height: height / contentScale,
  };
}
