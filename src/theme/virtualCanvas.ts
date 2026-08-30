import React, { createContext } from 'react';

export interface VirtualCanvas {
  width: number;
  height: number;
  scale: number;
}

export const VirtualCanvasContext = createContext<VirtualCanvas | null>(null);

export function useVirtualCanvas(): VirtualCanvas {
  const canvas = React.use(VirtualCanvasContext);
  if (!canvas) {
    throw new Error('useVirtualCanvas must be used inside VirtualCanvasContext.Provider');
  }
  return canvas;
}
