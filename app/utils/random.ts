export type Seed = [number, number, number, number]
/**
 * Implementation for the Simple Fast Counter (sfc32)
 * A Pseudorandom Number Generator (PRNG) that takes four numbers and
 * will output a predictable generator as long as the seed stays the same.
 *
 */
export function sfc32([a, b, c, d]: Seed) {
	return function () {
		a |= 0
		b |= 0
		c |= 0
		d |= 0
		let t = (((a + b) | 0) + d) | 0
		d = (d + 1) | 0
		a = b ^ (b >>> 9)
		b = (c + (c << 3)) | 0
		c = (c << 21) | (c >>> 11)
		c = (c + t) | 0

		// Dividing the 32-bit integer by 2^32 to make sure the output
		// Always stays between 0 - 1.
		return (t >>> 0) / 4294967296
	}
}
