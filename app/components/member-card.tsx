import clsx from 'clsx'
import {
	type MotionStyle,
	motion,
	useMotionTemplate,
	useMotionValue,
	useTransform,
	type MotionValue,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { sfc32, type Seed } from '#app/utils/random.js'

type CustomStyle = MotionStyle & {
	'--background-y'?: MotionValue<string>
	'--background-x'?: MotionValue<string>
	'--pointer-y'?: MotionValue<string>
	'--pointer-x'?: MotionValue<string>
	'--card-opacity'?: string
	'--pointer-from-center'?: MotionValue<string>
}

export default function MemberCard({
	seed,
	qrcode,
}: {
	qrcode: string
	seed: Seed
}) {
	const cardRef = useRef<HTMLDivElement>(null)
	const [showHolo, setShowHolo] = useState(false)

	// mouse position
	const mouseX = useMotionValue(
		typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
	)
	const mouseY = useMotionValue(
		typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
	)

	const dampen = 40
	const rotateX = useTransform<number, number>(mouseY, newMouseY => {
		if (!cardRef.current) return 0
		const rect = cardRef.current.getBoundingClientRect()
		const newRotateX = newMouseY - rect.top - rect.height / 2
		return clamp(-newRotateX / dampen, -7, 7)
	})
	const rotateY = useTransform(mouseX, newMouseX => {
		if (!cardRef.current) return 0
		const rect = cardRef.current.getBoundingClientRect()
		const newRotateY = newMouseX - rect.left - rect.width / 2
		return clamp(newRotateY / dampen, -7, 7)
	})

	// sheen
	const gradientX = useTransform(mouseX, x => {
		if (!cardRef.current) return 50 // default to center
		const rect = cardRef.current.getBoundingClientRect()
		return ((x - rect.left) / rect.width) * 100
	})
	const gradientY = useTransform(mouseY, y => {
		if (!cardRef.current) return 50 // default to center
		const rect = cardRef.current.getBoundingClientRect()
		return ((y - rect.top) / rect.height) * 100
	})

	const backgroundX = useTransform(gradientX, x => {
		return adjust({ value: x, fromMin: 0, fromMax: 100, toMin: 37, toMax: 63 })
	})
	const backgroundY = useTransform(gradientY, y => {
		return adjust({ value: y, fromMin: 0, fromMax: 100, toMin: 33, toMax: 67 })
	})

	const fromCenter = useTransform(() => {
		return clamp(
			Math.sqrt(
				(gradientY.get() - 50) * (gradientY.get() - 50) +
					(gradientX.get() - 50) * (gradientX.get() - 50),
			) / 50,
			0,
			1,
		)
	})

	const sheenGradient = useMotionTemplate`
        radial-gradient(circle at ${gradientX}% ${gradientY}%, hsl(0,0%,80%, 0.3), hsla(0, 0%, 74.9%, 0))
    `

	// handle mouse move on document
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			// animate mouse x and y
			mouseX.set(e.clientX)
			mouseY.set(e.clientY)
		}
		if (typeof window === 'undefined') return
		// recalculate grid on resize
		window.addEventListener('mousemove', handleMouseMove)
		// cleanup
		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
		}
		// eslint-disable-next-line
	}, [])

	const cardStyles: CustomStyle = {
		transformStyle: 'preserve-3d',
		rotateX,
		rotateY,
		'--background-x': useMotionTemplate`${backgroundX}%`,
		'--background-y': useMotionTemplate`${backgroundY}%`,
		'--pointer-x': useMotionTemplate`${gradientX}%`,
		'--pointer-y': useMotionTemplate`${gradientY}%`,
		'--card-opacity': `${showHolo ? '85%' : '50%'}`,
		'--pointer-from-center': useMotionTemplate`${fromCenter}`,
	}

	return (
		<div
			style={{ perspective: '1000px' }}
			onMouseEnter={() => setShowHolo(true)}
			onMouseLeave={() => setShowHolo(false)}
		>
			<motion.div style={cardStyles}>
				<motion.div ref={cardRef} className="card">
					<div className="dark relative flex aspect-[5/7] w-80 flex-col items-center justify-center overflow-hidden rounded-xl bg-background p-[25px] text-primary/70 shadow-xl">
						<div className="h-full w-full overflow-hidden rounded border border-foreground">
							<div className="flex">
								<div className="w-32 border-b border-r border-foreground">
									<img
										src="https://res.cloudinary.com/dzqdvin5s/image/upload/v1713902480/mubs.jpg"
										alt="Mubashar Iqbal"
										className="h-full w-full object-cover grayscale"
									/>
								</div>
								<div className="flex flex-1 items-center justify-center">
									<img
										src={qrcode}
										alt="Mubashar showcase URL"
										className="h-auto w-16"
									/>
								</div>
							</div>
							<h2 className="mt-4 px-4 font-mono text-4xl font-semibold leading-tight text-primary">
								Mubashar Iqbal
							</h2>
							<p className="mt-6 px-4 text-xs uppercase tracking-wide">
								Became Member:
							</p>
							<p className="mt-1 px-4 font-mono text-xs font-bold text-primary">
								April 22, 2024
							</p>
							<p className="mt-6 px-4 text-xs uppercase tracking-wide">
								Currently:
							</p>
							<p className="mt-1 px-4 font-mono text-xs font-bold text-primary">
								Mubs | Product Studio
							</p>
						</div>
						<Cubes width={320} height={(320 * 7) / 5} seed={seed} />
						<div
							className={clsx(
								'card-shine absolute inset-0 rounded-2xl transition duration-500 after:transition after:duration-500',
							)}
						/>
						<motion.div
							className={
								'absolute inset-0 mix-blend-hard-light brightness-[.9] contrast-[2]'
							}
							style={{ backgroundImage: sheenGradient }}
						/>
					</div>
				</motion.div>
			</motion.div>
		</div>
	)
}

const colors = [
	'text-pink',
	'text-orange',
	'text-yellow',
	'text-lime',
	'text-green',
	'text-blue',
	'text-purple',
]

type Direction = 'x' | 'y' | 'z'
type Vector2D = [number, number] // [x, y]

function Cubes({
	width,
	height,
	seed,
}: {
	width: number
	height: number
	seed: Seed
}) {
	const generator = sfc32(seed)
	const config = {
		size: 10,
		originX: width - 50,
		originY: height - 50,
		generator,
	}

	const zCubes = createCubes({
		...config,
		direction: 'z',
	})

	const xCubes = createCubes({
		...config,
		direction: 'x',
	})

	const yCubes = createCubes({
		...config,
		direction: 'y',
	})

	return (
		<svg
			id="svg"
			viewBox={`0 0 ${width} ${height}`}
			width={width}
			height={height}
			className="absolute left-0 top-0 h-full w-full"
		>
			<rect
				x={config.originX - 50}
				y={config.originY - 50}
				width={50 * 2}
				height={50 * 2}
				className="fill-background"
			/>
			{zCubes.map((cube, i) => (
				<Cube key={`cube-z-${i}`} {...cube} generator={generator} />
			))}
			{yCubes.map((cube, i) => (
				<Cube key={`cube-y-${i}`} {...cube} generator={generator} />
			))}
			{xCubes.map((cube, i) => (
				<Cube key={`cube-x-${i}`} {...cube} generator={generator} />
			))}
		</svg>
	)
}

function Cube({
	origin,
	frames,
	generator,
}: Cube & { generator: () => number }) {
	const faces = cubeToFaces({ origin, frames })

	return faces.map((face, i) => {
		const randomNumber = generator()
		const color = getRandomColor(colors, generator())
		return (
			<Face
				{...face}
				color={color}
				key={`face-${i}-${randomNumber}-${color}`}
			/>
		)
	})
}

function cubeToFaces({
	origin,
	frames,
}: Cube): { points: string; frames: string }[] {
	const o1 = origin[0]
	const o2 = origin[1]
	const o4 = origin[3]
	const [d1, d2, d3, d4] = frames[0]
	return [
		{
			points: [
				vectorToString(o1),
				vectorToString(d1),
				vectorToString(d2),
				vectorToString(o2),
			].join(' '),
			frames: frames
				.map(d =>
					[
						vectorToString(o1),
						vectorToString(d[0]),
						vectorToString(d[1]),
						vectorToString(o2),
					].join(' '),
				)
				.join('; '),
		},
		{
			points: [
				vectorToString(o1),
				vectorToString(d1),
				vectorToString(d4),
				vectorToString(o4),
			].join(' '),
			frames: frames
				.map(d =>
					[
						vectorToString(o1),
						vectorToString(d[0]),
						vectorToString(d[3]),
						vectorToString(o4),
					].join(' '),
				)
				.join('; '),
		},
		{
			points: [
				vectorToString(d1),
				vectorToString(d2),
				vectorToString(d3),
				vectorToString(d4),
			].join(' '),
			frames: frames
				.map(d =>
					[
						vectorToString(d[0]),
						vectorToString(d[1]),
						vectorToString(d[2]),
						vectorToString(d[3]),
					].join(' '),
				)
				.join('; '),
		},
	]
}

function Face({
	points,
	frames,
	color,
}: {
	points: string
	frames: string
	color: string
}) {
	return (
		<polygon
			className={clsx(color, 'fill-current stroke-background')}
			points={points}
		>
			<animate
				attributeName="points"
				begin="0s"
				dur="8s"
				repeatCount="indefinite"
				values={frames}
				calcMode="spline"
				keyTimes="0; 0.15; 0.3; 0.45; 0.6; 0.75; 1"
				keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
			/>
		</polygon>
	)
}

// Cube Functions
function createCubes(args: {
	originX: number
	originY: number
	size: number
	direction: Direction
	generator: () => number
}) {
	const c1 = createCube(args)
	return [
		createCube({ ...args, originX: c1.origin[2][0], originY: c1.origin[2][1] }),
		createCube({ ...args, originX: c1.origin[1][0], originY: c1.origin[1][1] }),
		createCube({ ...args, originX: c1.origin[3][0], originY: c1.origin[3][1] }),
		c1,
	]
}

function createCube({
	originX,
	originY,
	generator,
	direction,
	size,
}: {
	originX: number
	originY: number
	size: number
	direction: Direction
	generator: () => number
}): Cube {
	const origin = makeOrigin({ size, originX, originY, direction })
	const frames = [
		origin,
		transformOrigin({
			origin,
			size,
			scale: getRandomScale(3, generator()),
			direction,
		}),
		transformOrigin({
			origin,
			size,
			scale: getRandomScale(3, generator()),
			direction,
		}),
		transformOrigin({
			origin,
			size,
			scale: getRandomScale(3, generator()),
			direction,
		}),
		transformOrigin({
			origin,
			size,
			scale: getRandomScale(3, generator()),
			direction,
		}),
		transformOrigin({
			origin,
			size,
			scale: getRandomScale(3, generator()),
			direction,
		}),
		origin,
	]

	return {
		origin,
		frames,
	}
}

type Face = [Vector2D, Vector2D, Vector2D, Vector2D]
type Cube = {
	origin: Face
	frames: Face[]
}

function makeOrigin({
	size,
	originX,
	originY,
	direction,
}: {
	size: number
	originX: number
	originY: number
	direction: Direction
}): Face {
	const deltaX = size * Math.cos(Math.PI / 6) // cos(30°)
	const deltaY = size * Math.sin(Math.PI / 6) // sin(30°)

	switch (direction) {
		case 'x':
			return [
				[originX, originY],
				[originX, originY + deltaY * 2],
				[originX - deltaX, originY + deltaY],
				[originX - deltaX, originY - deltaY],
			]
		case 'y':
			return [
				[originX, originY],
				[originX + deltaX, originY - deltaY],
				[originX + deltaX, originY + deltaY],
				[originX, originY + deltaY * 2],
			]
		case 'z':
			return [
				[originX, originY],
				[originX - deltaX, originY - deltaY],
				[originX, originY - deltaY * 2],
				[originX + deltaX, originY - deltaY],
			]
		default:
			throw new Error('Invalid direction')
	}
}

function transformOrigin({
	origin,
	size,
	scale,
	direction,
}: {
	origin: Face
	size: number
	scale: number
	direction: Direction
}): Face {
	const deltaX = size * Math.cos(Math.PI / 6) * scale
	const deltaY = size * Math.sin(Math.PI / 6) * scale

	// Calculate changes based on direction
	switch (direction) {
		case 'x':
			return origin.map(v => moveVector(v, [-deltaX, deltaY])) as Face
		case 'y':
			return origin.map(v => moveVector(v, [deltaX, deltaY])) as Face
		case 'z':
			return origin.map(v => moveVector(v, [0, -deltaY])) as Face
		default:
			throw new Error('Invalid direction')
	}
}

function moveVector([x, y]: Vector2D, [dx, dy]: Vector2D): Vector2D {
	return [x + dx, y + dy]
}

// utils
function vectorToString([x, y]: Vector2D) {
	return `${x},${y}`
}

function getRandomColor(colors: string[], seed: number): string {
	return colors[Math.floor(seed * colors.length)]
}

function getRandomScale(max: number, seed: number): number {
	return seed * max
}

/**
 * return a value that has been limited between min & max
 * @param {Number} value the value to clamp
 * @param {Number} min minimum value to allow, default: 0
 * @param {Number} max maximum value to allow, default: 100
 * @returns {Number}
 */
function clamp(value: number, min = 0, max = 100) {
	return Math.min(Math.max(value, min), max)
}

/**
 * return a value that has been rounded to a set precision
 * @param {Number} value the value to round
 * @param {Number} precision the precision (decimal places), default: 3
 * @returns {Number}
 */
function round(value: number, precision = 3) {
	return parseFloat(value.toFixed(precision))
}

/**
 * return a value that has been re-mapped according to the from/to
 * - for example, adjust(10, 0, 100, 100, 0) = 90
 * @param {Number} value the value to re-map (or adjust)
 * @param {Number} fromMin min value to re-map from
 * @param {Number} fromMax max value to re-map from
 * @param {Number} toMin min value to re-map to
 * @param {Number} toMax max value to re-map to
 * @returns {Number}
 */
function adjust({
	value,
	fromMin,
	fromMax,
	toMin,
	toMax,
}: {
	value: number
	fromMin: number
	fromMax: number
	toMin: number
	toMax: number
}) {
	return round(
		toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin),
	)
}
