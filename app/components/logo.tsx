import clsx from 'clsx'
import { useMemo } from 'react'
import { type Seed, sfc32 } from '#app/utils/random.js'

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

const rowColors = [
	[
		'#5948F6', // PURPLE
		'#5948F6', // PURPLE
		'#3479F6', // BLUE
	],
	[
		'#5948F6', // PURPLE
		'#3479F6', // BLUE
		'#3479F6', // BLUE
		'#34BF96', // GREEN
	],
	[
		'#5948F6', // PURPLE
		'#3479F6', // BLUE
		'#34BF96', // GREEN
	],
	[
		'#EFBD2D', // YELLOW
		'#3479F6', // BLUE
		'#34BF96', // GREEN
		'#97DC42', // LIME
	],
	[
		'#EFBD2D', // YELLOW
		'#F27D47', // ORANGE
		'#34BF96', // GREEN
		'#97DC42', // LIME
	],
	[
		'#EFBD2D', // YELLOW
		'#F27D47', // ORANGE
		'#F460CF', // PINK
		'#97DC42', // LIME
	],
	[
		'#EFBD2D', // YELLOW
		'#F27D47', // ORANGE
		'#F460CF', // PINK
		'#F27D47', // ORANGE
		'#F460CF', // PINK
	],
	[
		'#F27D47', // ORANGE
		'#F460CF', // PINK
	],
]

type BaseProps = { seed: Seed; className?: string }
function Logo({ seed, className }: BaseProps) {
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
				const colors = rowColors[y]
				if (
					[
						[9, 0],
						[9, 1],
						[9, 2],
						[9, 3],
						[8, 0],
						[8, 1],
						[8, 2],
						[7, 0],
						[7, 1],
						[6, 0],
					].some(([x2, y2]) => x === x2 && y === y2)
				) {
					return null
				}
				return (
					<rect
						x={x * CELL_SIZE}
						y={y * CELL_SIZE}
						width={CELL_SIZE}
						height={CELL_SIZE}
						fill={colors[Math.floor(rn * colors.length)]}
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
							const colors = rowColors[y]
							if (
								[
									[9, 0],
									[9, 1],
									[9, 2],
									[9, 3],
									[8, 0],
									[8, 1],
									[8, 2],
									[7, 0],
									[7, 1],
									[6, 0],
								].some(([x2, y2]) => x === x2 && y === y2)
							) {
								return ''
							}
							return `<rect
                        x="${x * CELL_SIZE}"
                        y="${y * CELL_SIZE}"
                        width="${CELL_SIZE}"
                        height="${CELL_SIZE}"
                        fill="${colors[Math.floor(rn * colors.length)]}"
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
 * Blob generator
 */
function blobGenerator({
	size = 400,
	growth = 6,
	edges = 6,
	seed,
}: {
	size?: number
	growth?: number
	edges?: number
	seed?: number
}) {
	var { destPoints, seedValue } = createPoints({ size, growth, edges, seed })
	var path = createSvgPath(destPoints)
	return { path, seedValue }
}

function circleLineGenerator({
	size,
	colors,
	seed: number,
}: {
	size: number
	colors: string[]
	seed: number
}): [string, [number, number][]][] {
	const paths = colors.map((color, i): [string, [number, number][]] => [
		color,
		circleWithPoints({
			size,
			outerRad: (size - 20) * Math.pow(0.8, colors.length - i),
			growth: 8,
			edges: Math.ceil(6 / Math.pow(0.67, i)),
		}),
	])

	return paths
}

function circleWithPoints({
	size,
	outerRad,
	growth,
	edges,
	seed,
}: {
	size: number
	outerRad: number
	growth: number
	edges: number
	seed?: number
}): [number, number][] {
	let innerRad = growth * (outerRad / 10)
	let origin = size / 2

	let slices = divide(edges)
	let maxRandomValue = shuffle([99, 999, 9999, 99999, 999999])[0]
	let id = Math.floor(Math.random() * maxRandomValue)
	let seedValue = seed ?? id
	let randVal = randomDoubleGenerator(seedValue)
	let destPoints: [number, number][] = []

	slices.forEach(degree => {
		let O = magicPoint({ value: randVal(), min: innerRad, max: outerRad })
		let end = point({ origin, radius: O, degree })
		destPoints.push(end)
	})
	return destPoints
}

const createPoints = ({
	size,
	growth,
	edges,
	seed,
}: {
	size: number
	growth: number
	edges: number
	seed?: number
}) => {
	let outerRad = size / 2
	let innerRad = growth * (outerRad / 10)
	let origin = size / 2

	let slices = divide(edges)
	let maxRandomValue = shuffle([99, 999, 9999, 99999, 999999])[0]
	let id = Math.floor(Math.random() * maxRandomValue)
	let seedValue = seed ?? id
	let randVal = randomDoubleGenerator(seedValue)
	let destPoints: [number, number][] = []

	slices.forEach(degree => {
		let O = magicPoint({ value: randVal(), min: innerRad, max: outerRad })
		let end = point({ origin, radius: O, degree })
		destPoints.push(end)
	})
	return { destPoints, seedValue }
}

function createSvgPath(points: [number, number][]) {
	let svgPath = ''
	var mid = [
		(points[0][0] + points[1][0]) / 2,
		(points[0][1] + points[1][1]) / 2,
	]
	svgPath += 'M' + mid[0] + ',' + mid[1]

	for (var i = 0; i < points.length; i++) {
		var p1 = points[(i + 1) % points.length]
		var p2 = points[(i + 2) % points.length]
		mid = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2]
		svgPath += 'Q' + p1[0] + ',' + p1[1] + ',' + mid[0] + ',' + mid[1]
	}
	svgPath += 'Z'
	return svgPath
}

function toRad(deg: number) {
	return deg * (Math.PI / 180.0)
}

function divide(count: number) {
	var deg = 360 / count

	return Array(count)
		.fill('a')
		.map((_, i) => i * deg)
}

function randomDoubleGenerator(s: number) {
	var mask = 0xffffffff
	var m_w = (123456789 + s) & mask
	var m_z = (987654321 - s) & mask

	return function () {
		m_z = (36969 * (m_z & 65535) + (m_z >>> 16)) & mask
		m_w = (18000 * (m_w & 65535) + (m_w >>> 16)) & mask

		var result = ((m_z << 16) + (m_w & 65535)) >>> 0
		result /= 4294967296
		return result
	}
}

function magicPoint({
	value,
	min,
	max,
}: {
	value: number
	min: number
	max: number
}) {
	let radius = min + value * (max - min)
	if (radius > max) {
		radius = radius - min
	} else if (radius < min) {
		radius = radius + min
	}
	return radius
}

function point({
	origin,
	radius,
	degree,
}: {
	origin: number
	radius: number
	degree: number
}): [number, number] {
	var x = origin + radius * Math.cos(toRad(degree))
	var y = origin + radius * Math.sin(toRad(degree))
	return [Math.round(x), Math.round(y)]
}

function shuffle<T>(array: T[]) {
	array.sort(() => Math.random() - 0.5)
	return array
}

/**
 * UNUSED
 */

function PointLogo({ seed, className }: BaseProps) {
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
				const sizeMultiplier = Math.random() * (1 - 0.4) + 0.4
				const { x, y } = getCoordinates(i)
				if (
					[
						[4, 2],
						[3, 3],
						[3, 4],
						[4, 3],
						[4, 4],
						[5, 4],
						[3, 5],
						[2, 3],
					].some(([x2, y2]) => x === x2 && y === y2)
				) {
					return null
				}
				return (
					<circle
						cx={x * CELL_SIZE + CELL_SIZE / 2}
						cy={y * CELL_SIZE + CELL_SIZE / 2}
						r={(CELL_SIZE / 2) * sizeMultiplier}
						fill={COLORS[Math.floor(rn * COLORS.length)]}
						key={`rect-${rn}-${i}`}
					/>
				)
			})}
		</svg>
	)
}

function BlobLogo({ seed, className }: BaseProps) {
	return (
		<svg
			id="craft-lab-logo"
			viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
			width={CANVAS_WIDTH}
			height={CANVAS_HEIGHT}
			xmlns="http://www.w3.org/2000/svg"
			className={clsx(className, 'isolate')}
		>
			{shuffle(COLORS).map((color, i) => {
				const blob = blobGenerator({
					size: CANVAS_WIDTH,
					growth: 1 + i * 0.85,
					edges: 8,
					seed: seed[0] + i,
				})
				return (
					<path
						d={blob.path}
						key={color}
						fill={color}
						className="mix-blend-screen"
					/>
				)
			})}
		</svg>
	)
}

const best = [
	'#EFBD2D', // YELLOW
	'#F27D47', // ORANGE
	'#F460CF', // PINK
	'#5948F6', // PURPLE
	'#3479F6', // BLUE
	'#34BF96', // GREEN
	'#97DC42', // LIME
]

function BlobLineLogo({ seed, className }: BaseProps) {
	const paths = circleLineGenerator({
		size: CANVAS_WIDTH,
		colors: best,
		seed: seed[0],
	})
	return (
		<svg
			id="craft-lab-logo"
			viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
			width={CANVAS_WIDTH}
			height={CANVAS_HEIGHT}
			xmlns="http://www.w3.org/2000/svg"
			className={clsx(className, 'isolate')}
		>
			{paths.reverse().map(([color, points], i) =>
				points.map(([x, y]) => {
					return (
						<circle
							cx={x}
							cy={y}
							key={`${color}-${x}-${y}`}
							fill={color}
							r={1.8 * Math.pow(0.8, (paths.length - 1 - i) / 1.3)}
						/>
					)
				}),
			)}
		</svg>
	)
}

export { PointLogo, BlobLogo, BlobLineLogo, Logo, makeFavicon }
