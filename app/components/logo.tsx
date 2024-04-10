import { useMemo } from 'react'

const ROWS = 8
const COLUMNS = 8
const CELL_SIZE = 6
const CANVAS_WIDTH = CELL_SIZE * COLUMNS
const CANVAS_HEIGHT = CELL_SIZE * ROWS

const COLORS = [
	'#3479F6',
	'#34BF96',
	'#EFBD2D',
	'#97DC42',
	'#F27D47',
	'#5948F6',
	'#F460CF',
]

type Seed = [number, number, number, number]

function Logo({ seed, className }: { seed: Seed; className?: string }) {
	const randomNumbers = useMemo(() => {
		const generator = sfc32(seed)
		return Array.from({ length: ROWS * COLUMNS }, () => generator())
	}, [seed])

	return (
		<svg
			id="craft-lab-logo"
			viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
			width={CANVAS_WIDTH}
			height={CANVAS_HEIGHT}
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			{randomNumbers.map((rn, i) => {
				const { x, y } = getCoordinates(i)
				return (
					<rect
						x={x * CELL_SIZE}
						y={y * CELL_SIZE}
						width={CELL_SIZE}
						height={CELL_SIZE}
						fill={COLORS[Math.floor(rn * COLORS.length)]}
						key={`rect-${rn}-${i}`}
					/>
				)
			})}
		</svg>
	)
}

function makeFavicon(seed: Seed) {
	if (window) {
		const generator = sfc32(seed)
		const randomNumbers = Array.from({ length: ROWS * COLUMNS }, () =>
			generator(),
		)

		const svg = `<svg
            id="craft-lab-logo"
            viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}"
            width="${CANVAS_WIDTH}"
            height="${CANVAS_HEIGHT}"
            xmlns="http://www.w3.org/2000/svg"
        >
            ${randomNumbers.map((rn, i) => {
							const { x, y } = getCoordinates(i)
							return `<rect
                        x="${x * CELL_SIZE}"
                        y="${y * CELL_SIZE}"
                        width="${CELL_SIZE}"
                        height="${CELL_SIZE}"
                        fill="${COLORS[Math.floor(rn * COLORS.length)]}"
                    />`
						})}
        </svg>`.trim()

		return `data:image/svg+xml;base64,${window.btoa(window.unescape(window.encodeURIComponent(svg)))}`
	}
}

/***
 * Get coordinates from a number based on a specific grid size
 */
function getCoordinates(
	index: number,
	{ width, height } = { width: COLUMNS, height: ROWS },
) {
	const y = Math.floor(index / width)
	const x = index % height
	return { x, y }
}

/**
 * Implementation for the Simple Fast Counter (sfc32)
 * A Pseudorandom Number Generator (PRNG) that takes four numbers and
 * will output a predictable generator as long as the seed stays the same.
 *
 */
function sfc32([a, b, c, d]: Seed) {
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

export { Logo, makeFavicon }
export type { Seed }
