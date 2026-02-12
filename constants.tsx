
import { CakeSize, Flavor, Filling, DecorationInfo, CakeColor } from './types';

export const CAKE_SIZES: CakeSize[] = [
  { id: '14_short', diameter: 14, heightType: 'SHORT', portions: '6-8 Porciones', basePrice: 25, costMultiplier: 1.0 },
  { id: '14_tall', diameter: 14, heightType: 'TALL', portions: '10-12 Porciones', basePrice: 35, costMultiplier: 1.2 },
  { id: '16_short', diameter: 16, heightType: 'SHORT', portions: '8-10 Porciones', basePrice: 30, costMultiplier: 1.1 },
  { id: '16_tall', diameter: 16, heightType: 'TALL', portions: '12-16 Porciones', basePrice: 45, costMultiplier: 1.4 },
  { id: '18_short', diameter: 18, heightType: 'SHORT', portions: '10-12 Porciones', basePrice: 40, costMultiplier: 1.3 },
  { id: '18_tall', diameter: 18, heightType: 'TALL', portions: '15-18 Porciones', basePrice: 55, costMultiplier: 1.6 },
  { id: '20_short', diameter: 20, heightType: 'SHORT', portions: '12-15 Porciones', basePrice: 50, costMultiplier: 1.5 },
  { id: '20_tall', diameter: 20, heightType: 'TALL', portions: '20-25 Porciones', basePrice: 65, costMultiplier: 1.8 },
  { id: '22_short', diameter: 22, heightType: 'SHORT', portions: '15-20 Porciones', basePrice: 60, costMultiplier: 1.7 },
  { id: '22_tall', diameter: 22, heightType: 'TALL', portions: '25-30 Porciones', basePrice: 75, costMultiplier: 2.1 },
  { id: '24_short', diameter: 24, heightType: 'SHORT', portions: '20-25 Porciones', basePrice: 70, costMultiplier: 2.0 },
  { id: '24_tall', diameter: 24, heightType: 'TALL', portions: '30-35 Porciones', basePrice: 85, costMultiplier: 2.4 },
];

export const FLAVORS: Flavor[] = [
  { id: 'vanilla', name: 'Vainilla', color: '#F3E5AB', priceModifier: 0 },
  { id: 'chocolate', name: 'Chocolate', color: '#5D4037', priceModifier: 5 },
  { id: 'mix', name: 'Mixto', color: '#8D6E63', priceModifier: 5, pattern: 'bg-pattern-mixed' },
];

export const FILLINGS: Filling[] = [
  { id: 'choco', name: 'Choco', color: '#5D4037', priceModifier: 3 },
  { id: 'areq', name: 'Areq', color: '#D48846', priceModifier: 3 },
  { id: 'oreo', name: 'Oreo', color: '#333333', priceModifier: 5, pattern: 'bg-pattern-oreo' },
  { id: 'parchita', name: 'Parchita', color: '#FACC15', priceModifier: 4 },
  { id: 'melocoton', name: 'Melocoton', color: '#FDBA74', priceModifier: 5 },
  { id: 'fresa', name: 'Fresa', color: '#EF4444', priceModifier: 5 },
  { id: 'nucita', name: 'Nucita', color: '#8D6E63', priceModifier: 6 },
  { id: 'others', name: 'Otros', color: '#E5E7EB', priceModifier: 8 },
];

export const DECORATIONS: Record<string, DecorationInfo> = {
  liso: { id: 'liso', label: "Acabado Liso", priceModifier: 0 },
  vintage: { id: 'vintage', label: "Estilo Vintage", priceModifier: 15 },
  textura: { id: 'textura', label: "Textura (Rayado)", priceModifier: 8 },
  degradado: { id: 'degradado', label: "Degradado (Ombré)", priceModifier: 12 },
};

export const CAKE_COLORS: CakeColor[] = [
  { name: 'Amarillo', hex: '#FFEB3B' },
  { name: 'Azul', hex: '#60A5FA' },
  { name: 'Naranja', hex: '#FB923C' },
  { name: 'Morado', hex: '#A855F7' },
  { name: 'Rojo', hex: '#EF4444', isSaturated: true },
  { name: 'Rosa', hex: '#F472B6' },
  { name: 'Lila', hex: '#C084FC' },
  { name: 'Verde', hex: '#4ADE80' },
  { name: 'Verde Agua', hex: '#2DD4BF' },
  { name: 'Azul Rey', hex: '#1E40AF', isSaturated: true },
  { name: 'Negro', hex: '#1A1A1A', isSaturated: true },
  { name: 'Blanco', hex: '#FFFFFF' },
];

export const TOPPER_PRICES: Record<string, number> = {
  none: 0,
  generic: 5,
  personalized: 12,
  plus_pieces: 25,
};

export const SPHERES_PRICE = 8;
export const SATURATED_COLOR_SURCHARGE = 5;
