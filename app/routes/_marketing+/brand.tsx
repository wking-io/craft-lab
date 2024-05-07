import { type SEOHandle } from '@nasa-gcn/remix-seo'
import Alea from 'alea'
import { useMemo, useState, type ComponentProps } from 'react'
import { createNoise2D } from 'simplex-noise'
import { rootRouteId } from '#app/root.js'
import { useRouteIdLoaderData } from '#app/utils/route-id.js'
import { clamp } from '#app/components/member-card.js'

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}

export default function Screen() {
	const { seed } = useRouteIdLoaderData(rootRouteId)

	const generator = useMemo(() => {
		return Alea(seed)
	}, [seed])

	const noise2D = useMemo(() => createNoise2D(generator), [generator])
	const rows = createArrayOfLength(100)
	const columns = createArrayOfLength(100)

	const [xSmoothness] = useState(30)
	const [ySmoothness] = useState(80)

	const boxSize = 3

	return (
		<>
			<div className="dark fixed inset-0 bg-background">
				<svg
					className="h-auto w-full animate-[pulse_8s_ease-in-out_infinite]"
					width={rows.length * boxSize}
					height={columns.length * boxSize}
					viewBox={`0 0 ${rows.length} ${columns.length}`}
				>
					{rows.map(x =>
						columns.map(y => (
							<NoiseRect
								cx={x + 0.5}
								cy={y + 0.5}
								colors={simpleColorsFill}
								noise={noise2D(x / xSmoothness, y / ySmoothness)}
								key={`demo-6-pixel-${x}-${y}`}
							/>
						)),
					)}
				</svg>
				<div className="absolute inset-0 backdrop-blur [mask:linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.9),rgba(0,0,0,1))]" />
			</div>
			<div className="dark container relative my-8 text-foreground md:my-12 lg:my-16">
				<h1 className="font-display text-center text-5xl font-semibold">
					This is the title
				</h1>
			</div>
		</>
	)
}

function NoiseRect({
	noise,
	colors,
	...props
}: ComponentProps<'circle'> & { noise: number; colors: string[] }) {
	const radius = ((noise + 1) / 2) * 0.2
	const opacity = clamp(((noise + 1) / 2) * 0.6, 0.3)
	return (
		<circle
			{...props}
			r={radius}
			className={'fill-foreground'}
			opacity={opacity}
		/>
	)
}

/**
 * UTILS
 */

function createArrayOfLength(length: number): number[] {
	return Array.from(Array(length === 0 ? 1 : length), (_, i) => i)
}

/**
 * Simplex Noise generates a value between -1 and 1, but we are working with an
 * array that will not accept a negative index. We will be converting the original
 * noise range to fit the 0 to 1 scale we need.
 **/
function getColorByNoise(colors: string[], noise: number) {
	return colors[Math.floor(((noise + 1) / 2) * colors.length)]
}

const simpleColorsFill = ['fill-purple', 'fill-blue', 'fill-green']
