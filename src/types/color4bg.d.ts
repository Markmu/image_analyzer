/**
 * Color4Bg 全局类型声明
 */

declare module 'color4bg' {
  export class CurveGradientBg {
    constructor(config: {
      dom: string;
      colors: string[];
      seed?: number;
      loop?: boolean;
    });
    destroy(): void;
  }

  export class AbstractShapeBg {
    constructor(config: any);
    destroy(): void;
  }

  export class AestheticFluidBg {
    constructor(config: any);
    destroy(): void;
  }

  export class AmbientLightBg {
    constructor(config: any);
    destroy(): void;
  }

  export class BigBlobBg {
    constructor(config: any);
    destroy(): void;
  }

  export class BlurDotBg {
    constructor(config: any);
    destroy(): void;
  }

  export class BlurGradientBg {
    constructor(config: any);
    destroy(): void;
  }

  export class ChaosWavesBg {
    constructor(config: any);
    destroy(): void;
  }

  export class GridArrayBg {
    constructor(config: any);
    destroy(): void;
  }

  export class RandomCubesBg {
    constructor(config: any);
    destroy(): void;
  }

  export class StepGradientBg {
    constructor(config: any);
    destroy(): void;
  }

  export class SwirlingCurvesBg {
    constructor(config: any);
    destroy(): void;
  }

  export class TrianglesMosaicBg {
    constructor(config: any);
    destroy(): void;
  }

  export class WavyWavesBg {
    constructor(config: any);
    destroy(): void;
  }
}
