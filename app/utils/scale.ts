// src/utils/scale.ts
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Change this to match your Figma design dimensions
const BASE_WIDTH = 945;  // Example: iPhone 11 screen width in Figma
const BASE_HEIGHT = 2048; // Optional: if you want vertical scaling

// Horizontal scaling
export const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;

// Vertical scaling (optional)
export const verticalScale = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

// Moderate scale (optional: adds a scaling factor)
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;
