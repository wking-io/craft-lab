// This module should contain type definitions for modules which do not have
// their own type definitions and are not available on DefinitelyTyped.

declare class VectorNoiseGenerator {
	constructor(width: number, height: number): void
	getPixel(x: number, y: number): number
}

declare module 'atlas-vector-noise' {
	export = VectorNoiseGenerator
}
