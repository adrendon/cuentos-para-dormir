/**
 * Module declarations for non-TypeScript assets.
 */

declare module '*.csv' {
  const content: string;
  export default content;
}

declare module '*.mp3' {
  const src: number;
  export default src;
}

declare module '*.webp' {
  const src: number;
  export default src;
}

declare module '*.png' {
  const src: number;
  export default src;
}

declare module '*.json' {
  const value: any;
  export default value;
}

declare module '@react-native-community/slider' {
  import { ComponentType } from 'react';
  import { ViewProps } from 'react-native';

  interface SliderProps extends ViewProps {
    minimumValue?: number;
    maximumValue?: number;
    value?: number;
    onValueChange?: (value: number) => void;
    minimumTrackTintColor?: string;
    maximumTrackTintColor?: string;
    thumbTintColor?: string;
    step?: number;
    disabled?: boolean;
  }

  const Slider: ComponentType<SliderProps>;
  export default Slider;
}
