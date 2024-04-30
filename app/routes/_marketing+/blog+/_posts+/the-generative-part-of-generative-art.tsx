import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import Alea from 'alea'
import clsx from 'clsx'
import { makeNoise2D } from 'open-simplex-noise'
import {
	type ComponentProps,
	useState,
	type PropsWithChildren,
	useMemo,
} from 'react'
import { getHighlighter } from 'shiki'
import { RefreshIcon } from '#app/components/two-tone-icon.js'
import { theme } from '#app/utils/shiki.js'

const exampleOne = `/** 
* This function is used to return a random positive integer (whole number) 
* that will never be any larger than the max integer you pass in. 
* This is extremely useful when trying to get a randomized value from 
* an array.
**/
function getRandomPositiveIntWithin(max: number) { 
  return Math.floor(Math.random() * max)
} 

/** 
* This function will give us a random color from the array of colors
* we have defined using the \`getRandomPositiveIntWithin\`. We use the
* length of the colors array to make sure the index lookup will be
* guaranteed to find a match.
**/
function generateColor() {
  const colors = []
  return colors[getRandomPositiveIntWithin(colors.length)]
}

function ColorBox() { 
  const color = generateColor() 
  return <div className="w-12 h-12" style={{ backgroundColor: color }} />
}`

const exampleTwo = `/**
 * I am using tailwind classes for existing color variables on my site, but
 * you can use hex codes, hsl values, or any supported color property
 **/
const colors = [
	'bg-pink',
	'bg-orange',
	'bg-yellow',
	'bg-lime',
	'bg-green',
	'bg-blue',
	'bg-purple',
]

/** 
* This function is used to return a random positive integer (whole number) 
* that will never be any larger than the max integer you pass in. 
* This is extremely useful when trying to get a randomized value from 
* an array.
**/
function getRandomPositiveIntWithin(max: number) { 
  return Math.floor(Math.random() * max)
} 

/** 
* This function will give us a random color from the array of colors
* we have defined using the \`getRandomPositiveIntWithin\`. We use the
* length of the colors array to make sure the index lookup will be
* guaranteed to find a match.
**/
function generateColor() {
  return colors[getRandomPositiveIntWithin(colors.length)]
}

/** 
* This function will allow us to pass a length we need and array to be
* and will return an array where each value in the array is its index.
* Useful for creating rows and columns as seen below.
**/
function createArrayOfLength(length: number): number[] {
	return Array.from(Array(length), (_, i) => i)
}

function ColorBox(props: ComponentProps<'rect'>) { 
  const color = generateColor() 
  return <rect {...props} className={color} />
}

function ColorGrid() { 
  const rows = createArrayOfLength(getRandomPositiveIntWithin(100))
  const columns = createArrayOfLength(getRandomPositiveIntWithin(50))
  const boxSize = 6
  return (
    <svg 
      width={rows * boxSize} 
      height={columns * boxSize} 
      viewBox={\`0 0 \${rows} \${columns}\`}
    > 
      {rows.map((x => columns.map(y => {
        <ColorBox
          x={x} 
          y={y}
          width="1"
          height="1"
          key={\`pixel-\${x}-\${y}\`}
        />
      ))
    </svg>
  )
}`

const exampleThree = `/** 
* Here is a manually setup array of colors that will map to percentages.
* There are 10 indexed positions that will allow us to have a color grouping 
* for every 10th of either the x or y axis.
**/
const colors = [
	['fill-blue', 'fill-purple', 'fill-purple'],
	['fill-green', 'fill-blue', 'fill-purple'],
	['fill-green', 'fill-blue', 'fill-purple'],
	['fill-lime', 'fill-green', 'fill-blue'],
	['fill-yellow', 'fill-lime', 'fill-green', 'fill-blue'],
	['fill-yellow', 'fill-lime', 'fill-green'],
	['fill-pink', 'fill-yellow', 'fill-lime', 'fill-green'],
	['fill-pink', 'fill-yellow', 'fill-lime'],
	['fill-pink', 'fill-orange', 'fill-yellow'],
	['fill-pink', 'fill-orange', 'fill-orange'],
]

/** 
* This function is used to return a random positive integer (whole number) 
* that will never be any larger than the max integer you pass in. 
* This is extremely useful when trying to get a randomized value from 
* an array.
**/
function getRandomPositiveIntWithin(max: number) { 
  return Math.floor(Math.random() * max)
} 

/** 
* This function will give us a random color from the array of colors
* we have defined using the \`getRandomPositiveIntWithin\`. We use the
* length of the colors array to make sure the index lookup will be
* guaranteed to find a match.
**/
function generateColor(colors: string[]) {
  return colors[getRandomPositiveIntWithin(colors.length)]
}

/** 
* This function will allow us to pass a length we need and array to be
* and will return an array where each value in the array is its index.
* Useful for creating rows and columns as seen below.
**/
function createArrayOfLength(length: number): number[] {
	return Array.from(Array(length), (_, i) => i)
}

function ColorBox({
	xPercent,
	yPercent,
	...props
}: ComponentProps<'rect'> & { xPercent: number; yPercent: number }) {
	const color = generateColor([...colors[xPercent], ...colors[yPercent]])
	return <rect {...props} className={color} />
}

function ColorGrid() { 
  const rows = createArrayOfLength(getRandomPositiveIntWithin(100))
  const columns = createArrayOfLength(getRandomPositiveIntWithin(50))
  const boxSize = 6
  return (
    <svg
		width={rows.length * boxSize}
		height={columns.length * boxSize}
		viewBox={\`0 0 \${rows.length} \${columns.length}\`}
	>
		{rows.map(x =>
			columns.map(y => (
				<ColorBox
					x={x}
					y={y}
					xPercent={Math.floor((x / rows.length) * colors.length)}
					yPercent={Math.floor((y / columns.length) * colors.length)}
					width="1"
					height="1"
					key={\`pixel-\${x}-\${y}\`}
				/>
			)),
		)}
	</svg>
  )
}`

const exampleFour = `import { makeNoise2D } from 'open-simplex-noise'

/** 
* Here we are just going back to our basic array of colors and will let the
* simplex noise algorithm pick what colors are being selected from this array
**/
const colors = [
	'fill-purple',
	'fill-blue',
	'fill-green',
	'fill-lime',
	'fill-yellow',
	'fill-pink',
	'fill-orange',
]

/** 
* This function is used to return a random positive integer (whole number) 
* that will never be any larger than the max integer you pass in. 
* This is extremely useful when trying to get a randomized value from 
* an array.
**/
function getRandomPositiveIntWithin(max: number) { 
  return Math.floor(Math.random() * max)
}

/**
 * Simplex Noise generates a value between -1 and 1, but we are working with an
 * array that will not accept a negative index. We will be converting the original
 * noise range to fit the 0 to 1 scale we need.
 **/
function getColorByNoise(noise: number) {
	return colors[Math.floor(((noise + 1) / 2) * colors.length)]
}

/** 
* This function will allow us to pass a length we need and array to be
* and will return an array where each value in the array is its index.
* Useful for creating rows and columns as seen below.
**/
function createArrayOfLength(length: number): number[] {
	return Array.from(Array(length === 0 ? 1 : length), (_, i) => i)
}

function ColorBox({
	noise,
	...props
}: ComponentProps<'rect'> & { noise: number }) {
	const color = getColorByNoise(noise)
	return <rect {...props} className={color} />
}

function ColorGrid() { 
  const rows = createArrayOfLength(getRandomPositiveIntWithin(100))
  const columns = createArrayOfLength(getRandomPositiveIntWithin(50))
  const boxSize = 6
  const xSmoothness = 20
  const ySmoothness = 20
  const noise2D = makeNoise2D(Math.random())
  return (
    <svg
		width={rows.length * boxSize}
		height={columns.length * boxSize}
		viewBox={\`0 0 \${rows.length} \${columns.length}\`}
	>
		{rows.map(x =>
			columns.map(y => (
				<ColorBox
					x={x}
					y={y}
					noise={noise2D(x / xSmoothness, y / ySmoothness)}
					width="1"
					height="1"
					key={\`pixel-\${x}-\${y}\`}
				/>
			)),
		)}
	</svg>
  )
}`

const exampleSix = `import Alea from 'alea'
import { makeNoise2D } from 'open-simplex-noise'

/** 
* Here we are just going back to our basic array of colors and will let the
* simplex noise algorithm pick what colors are being selected from this array
**/
const colors = [
	'fill-purple',
	'fill-blue',
	'fill-green',
	'fill-lime',
	'fill-yellow',
	'fill-pink',
	'fill-orange',
]

/** 
* This function is now updated to accept the random number and the max. This
* allows us to make sure that we are passing in a number we know is connected
* to our seeded PRNG.
**/
function getRandomPositiveIntWithin(randomNum: number, max: number) { 
  return Math.floor(randomNum * max)
} 

/**
 * Simplex Noise generates a value between -1 and 1, but we are working with an
 * array that will not accept a negative index. We will be converting the original
 * noise range to fit the 0 to 1 scale we need.
 **/
function getColorByNoise(noise: number) {
	return colors[Math.floor(((noise + 1) / 2) * colors.length)]
}

/** 
* This function will allow us to pass a length we need and array to be
* and will return an array where each value in the array is its index.
* Useful for creating rows and columns as seen below.
**/
function createArrayOfLength(length: number): number[] {
	return Array.from(Array(length === 0 ? 1 : length), (_, i) => i)
}

function ColorBox({
	noise,
	...props
}: ComponentProps<'rect'> & { noise: number }) {
	const color = getColorByNoise(noise)
	return <rect {...props} className={color} />
}

function ColorGrid() {
	const seed = 99
	const generator = Alea(seed)
	const rows = createArrayOfLength(getRandomPositiveIntWithin(generator(), 100))
	const columns = createArrayOfLength(getRandomPositiveIntWithin(generator(), 50))
	const boxSize = 6
	const xSmoothness = 20
	const ySmoothness = 20
	const noise2D = makeNoise2D(generator())
	return (
		<svg
			width={rows.length * boxSize}
			height={columns.length * boxSize}
			viewBox={\`0 0 \${rows.length} \${columns.length}\`}
		>
			{rows.map(x =>
				columns.map(y => (
					<ColorBox
						x={x}
						y={y}
						noise={noise2D(x / xSmoothness, y / ySmoothness)}
						width="1"
						height="1"
						key={\`pixel-\${x}-\${y}\`}
					/>
				)),
			)}
		</svg>
	)
}`

export async function loader() {
	const highlighter = await getHighlighter({
		themes: [theme],
		langs: ['typescript', 'tsx'],
	})

	return json({
		exampleOne: highlighter.codeToHtml(exampleOne, {
			lang: 'tsx',
			theme,
		}),
		exampleTwo: highlighter.codeToHtml(exampleTwo, {
			lang: 'tsx',
			theme,
		}),
		exampleThree: highlighter.codeToHtml(exampleThree, {
			lang: 'tsx',
			theme,
		}),
		exampleFour: highlighter.codeToHtml(exampleFour, {
			lang: 'tsx',
			theme,
		}),
		exampleSix: highlighter.codeToHtml(exampleSix, {
			lang: 'tsx',
			theme,
		}),
	})
}

export default function Screen() {
	const { exampleOne, exampleTwo, exampleThree, exampleFour, exampleSix } =
		useLoaderData<typeof loader>()
	return (
		<article className="prose mx-auto py-16 prose-headings:font-semibold prose-p:text-pretty prose-p:text-foreground/70 hover:prose-a:text-lime lg:py-24 lg:text-lg prose-h1:lg:text-5xl">
			<h1>The Generative Part of Generative Art</h1>
			<p>
				Part of the creation of the Craft Lab brand has involved generative
				elements. I have always been interested in them, and thought what better
				opportunity to explore and enforce my experience with generative art
				than a community platform built for design enineers.
			</p>
			<p>
				After going through multiple pieces of generative art I want to document
				what I have learned so that if this is something you are interested in
				exploring maybe this will expedite your understanding.
			</p>
			<h2>Random Values</h2>
			<p>
				What makes generative art…well generative? The idea is that by using
				some source of randomized data, usually in the form of numbers, and
				applying it to a visual algorithm you can create unique and interesting
				art that changes every time the underlying data changes.
			</p>

			<p>
				Visual Algorithm is just an easier way to refer to the function (or
				functions) that you use to take in the randomized data, apply some rules
				to that data, and output the visual you have designed.
			</p>
			<h2>Applying Values to Visuals</h2>
			<p>
				Well we're not just going to leave it there. Let's dig into how to go
				about building your visual algorithm using concrete examples.
			</p>
			<h3>A Basic Example</h3>
			<p>
				We will start by explaining a very simple example. Let's pick a color.
			</p>
			<div
				dangerouslySetInnerHTML={{ __html: exampleOne }}
				className="text-sm md:-mx-10 lg:-mx-12"
			/>

			<DemoOne />

			<p>BOOM! Generative art.</p>

			<h3>Let’s take it a little further</h3>

			<p>
				We have randomized color, what if we want to do more than one color?
				What if we want a grid of colors where the size of that grid is also
				generative?
			</p>
			<div
				dangerouslySetInnerHTML={{ __html: exampleTwo }}
				className="text-sm md:-mx-10 lg:-mx-12"
			/>

			<DemoTwo />

			<p>
				Okay, now we're cooking! We have color generation and size generation.
				However, just because we are generating randomized values that are
				influencing our output the question is:
			</p>
			<blockquote>Is this good?</blockquote>
			<h2>Contraints Breed Craft</h2>
			<p>
				The answer is no. Objectively speaking it isn't anything special, yet.
				It has allowed us to learn some important concepts and is interesting,
				but, as with a lot of great art and design, it is missing constraints.
				Constraints breed craft. They allow you to guide the randomness of
				generative art in a way that keeps what is interesting while still
				controlling the visual output to fit within parameters of “good” art.
			</p>
			<h3>Color Constraint</h3>
			<p>
				Let's take a look at this in practice. In the example that we have been
				building color for each square is completely random. It could be any of
				the available colors. How can we take the idea of constraint to increase
				the quality of the art that our visual algorithm is creating?
			</p>
			<p>
				There are a lot of approaches we could take, but we are going to update
				our visual algorithm so that the output has cooler colors in the top
				left and moves to warmer colors in the bottom right.
			</p>

			<div
				dangerouslySetInnerHTML={{ __html: exampleThree }}
				className="text-sm md:-mx-10 lg:-mx-12"
			/>

			<DemoThree />

			<p>
				Okay, now the output of our visual algorithm is feeling more intentional
				and designed. There is one more constraint concept that I want to
				introduce you to. Our color example is very easy to hardcode our
				available values and select them, but as you introduce more complex
				variables like distance or size in your work how can we add constraints
				without needing to manually enter and control every available value?
			</p>

			<h3>Pattern Algorithms</h3>

			<p>
				In generative art there are a huge library of common visual /
				mathematical algorithms that allow you to create patterns that have a
				feeling of intention and direction by adding constraints to the
				randomness in your work.
			</p>

			<p>Here are a list of some commonly used ones:</p>

			<ul>
				<li>Simplex Noise</li>
				<li>Perlin Noise</li>
				<li>Fibonacci Sequence</li>
				<li>L-System</li>
				<li>Truchet Tiles</li>
			</ul>

			<p>
				However, there is a wide world of available pattern algorithms to
				experiment with.
			</p>

			<p>
				For demonstration let me show you how we can use Simplex Noise in the
				example we have been building vs manually grouping colors.
			</p>

			<div className="callout">
				Simplex Noise is an algorithm created by Ken Perlin. It is most commonly
				used in video games topography and generative art…obviously.
			</div>

			<div
				dangerouslySetInnerHTML={{ __html: exampleFour }}
				className="text-sm md:-mx-10 lg:-mx-12"
			/>

			<DemoFour />

			<p>
				We are just substituting our random number with the noise value that
				gets output by the simplex algorithm, and since the simplex algorithm is
				a very well know algorithm it has a library that exists we can use
				without needing to write our own.
			</p>

			<h2>Random, but Repeatable</h2>

			<p>
				As I close out this article there is one more VERY important detail.
				What happens in the examples about when you hit the rerun button? You
				get a brand new output! What if when you press the button you really
				like the output. What happens if your dev environment crashes or your
				browser tab gets closed? That version that you really liked is gone.
				Most likely forever because of the probabilities of so many completely
				random values being used.
			</p>

			<p>
				So the question is, how to generate art that is random, but repeatable?
			</p>

			<h3>The Mighty Seed</h3>
			<p>
				In generative art the ability to create repeatable outputs is captured
				in two concepts. A Pseudo Random Number Generator (PRNG) and a seed.
			</p>
			<p>
				A PRNG is exactly like it sounds. It is an algorithm (like{' '}
				<code className="inline-block bg-gray-100 text-sm text-purple before:hidden after:hidden">
					Math.random()
				</code>{' '}
				under the hood) that outputs a randomized number.
			</p>
			<p>
				However, the big difference between Math.random and using a “real” PRNG
				is the ability to accept a seed.
			</p>
			<p>
				A seed is just a number that we pass to the PRNG that guarantee that the
				numbers that are output are always the same. Let’s take an interactive
				look at how that will work real quick.
			</p>
			<p>
				The example below uses the Alea PRNG, and when we pass the same seed you
				can see that the first four generated numbers will always be the same.
				Try changing the numbers around and matching them back up.
			</p>

			<DemoFive />

			<p>
				See? Repeatable randomness. This means we can save and track inputs that
				make great outputs. Let's implement seeding with our latest example for
				our color grid that is using simplex noise.
			</p>

			<div
				dangerouslySetInnerHTML={{ __html: exampleSix }}
				className="text-sm md:-mx-10 lg:-mx-12"
			/>

			<DemoSix />

			<h2>Go Forth and Generate</h2>
			<p>
				That wraps it up. What we have covered here is enough for you to go and
				get started making generative art.
			</p>
			<p>
				The only real way to make great visual algorithms at this point is to
				get out there and start building! You will learn so much when you try to
				make your first one. However, if you would like to dive a little deeper
				there are some great topics that will help you expand your capability to
				create visual algorithms.
			</p>

			<h2>More Resources:</h2>
			<div className="grid lg:grid-cols-2">
				<div>
					<h3 className="text-lg">Concepts</h3>
					<ul>
						<li className="font-mono text-xs">
							<a href="https://tylerxhobbs.com/essays/2016/working-with-color-in-generative-art">
								Working With Color in Generative Art
							</a>
						</li>
						<li className="font-mono text-xs">
							<a href="https://tylerxhobbs.com/essays/2021/color-arrangement-in-generative-art">
								Color Arrangement in Generative Art
							</a>
						</li>
						<li className="font-mono text-xs">
							<a href="https://www.gorillasun.de/blog/style-in-generative-art/">
								Personal Style
							</a>
						</li>
						<li className="font-mono text-xs">
							Pattern Algorithms (Coming Soon)
						</li>
					</ul>
				</div>
				<div>
					<h3 className="text-lg">Creators</h3>
					<ul>
						<li className="font-mono text-xs">
							<a href="https://twitter.com/tylerxhobbs">Tyler Hobbs</a>
						</li>
						<li className="font-mono text-xs">
							<a href="https://twitter.com/mattdesl">Matt DesLauriers</a>
						</li>
						<li className="font-mono text-xs">
							<a href="https://twitter.com/sasj_nl">Saskia Freeke</a>
						</li>
						<li className="font-mono text-xs">
							<a href="https://twitter.com/zachlieberman">Zach Liebermann</a>
						</li>
						<li className="font-mono text-xs">
							<a href="https://twitter.com/gorillasu">Gorilla Sun</a>
						</li>
					</ul>
				</div>
				<div>
					<h3 className="text-lg">Misc.</h3>
					<ul>
						<li className="font-mono text-xs">
							<a href="https://www.gorillasun.de/blog/3-generative-artists-3-principles">
								3 Generative Artists - Iterating, Mindset, and First Principles
							</a>
						</li>
						<li className="font-mono text-xs">
							<a href="https://www.gorillasun.de/blog/3-generative-artists-3-pieces-of-advice/">
								3 Generative Artists - Consistency and Momentum
							</a>
						</li>
					</ul>
				</div>
			</div>
		</article>
	)
}

function DemoWrapper({
	children,
	onClick,
	className = '',
}: PropsWithChildren<{ onClick(): void; className?: string }>) {
	return (
		<div
			className={clsx(
				className,
				'relative flex items-center justify-center rounded-xl border border-gray-200 bg-gray-100 p-12 md:-mx-10 lg:-mx-12',
			)}
		>
			{children}
			<button
				onClick={onClick}
				className="group absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 font-mono text-xs hover:bg-gray-200"
			>
				<svg
					className="absolute -right-px -top-px h-[24px] w-[24px] rotate-0"
					viewBox="0 0 4 4"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<rect
						className="fill-transparent group-hover:fill-gray-100"
						x="0"
						y="0"
						width="4"
						height="4"
					/>
					<path
						d="M 0 0 H 2 V 1 H 3 V 2 H 4 V 4 H 0 V 0 Z"
						className="fill-transparent group-hover:fill-gray-200"
					/>
				</svg>
				<span>Refresh Example</span>
				<span className="h-auto w-4 transition group-hover:rotate-90">
					<RefreshIcon />
				</span>
			</button>
		</div>
	)
}

function DemoOne() {
	const [color, setColor] = useState(generateColor())

	/**
	 * This function is used to return a random positive integer (whole number)
	 * that will never be any larger than the max integer you pass in.
	 * This is extremely useful when trying to get a randomized value from
	 * an array.
	 **/
	function getRandomPositiveIntWithin(max: number) {
		return Math.floor(Math.random() * max)
	}

	/**
	 * This function will give us a random color from the array of colors
	 * we have defined using the `getRandomPositiveIntWithin`. We use the
	 * length of the colors array to make sure the index lookup will be
	 * guaranteed to find a match.
	 **/
	function generateColor() {
		const colors = [
			'bg-pink',
			'bg-orange',
			'bg-yellow',
			'bg-lime',
			'bg-green',
			'bg-blue',
			'bg-purple',
		]
		return colors[getRandomPositiveIntWithin(colors.length)]
	}

	return (
		<DemoWrapper onClick={() => setColor(generateColor())}>
			<div className={clsx(color, 'h-12 w-12')} />
		</DemoWrapper>
	)
}

function DemoTwo() {
	const [rows, setRows] = useState(
		createArrayOfLength(getRandomPositiveIntWithin(100)),
	)
	const [columns, setColumns] = useState(
		createArrayOfLength(getRandomPositiveIntWithin(50)),
	)
	const boxSize = 6
	/**
	 * This function is used to return a random positive integer (whole number)
	 * that will never be any larger than the max integer you pass in.
	 * This is extremely useful when trying to get a randomized value from
	 * an array.
	 **/
	function getRandomPositiveIntWithin(max: number) {
		return Math.floor(Math.random() * max)
	}

	/**
	 * This function will give us a random color from the array of colors
	 * we have defined using the `getRandomPositiveIntWithin`. We use the
	 * length of the colors array to make sure the index lookup will be
	 * guaranteed to find a match.
	 **/
	function generateColor() {
		const colors = [
			'fill-pink',
			'fill-orange',
			'fill-yellow',
			'fill-lime',
			'fill-green',
			'fill-blue',
			'fill-purple',
		]
		return colors[getRandomPositiveIntWithin(colors.length)]
	}

	function createArrayOfLength(length: number): number[] {
		return Array.from(Array(length), (_, i) => i)
	}

	function ColorBox(props: ComponentProps<'rect'>) {
		const color = generateColor()
		return <rect {...props} className={color} />
	}

	return (
		<DemoWrapper
			className="min-h-96"
			onClick={() => {
				setRows(createArrayOfLength(getRandomPositiveIntWithin(100)))
				setColumns(createArrayOfLength(getRandomPositiveIntWithin(50)))
			}}
		>
			<svg
				width={rows.length * boxSize}
				height={columns.length * boxSize}
				viewBox={`0 0 ${rows.length} ${columns.length}`}
			>
				{rows.map(x =>
					columns.map(y => (
						<ColorBox
							x={x}
							y={y}
							width="1"
							height="1"
							key={`demo-2-pixel-${x}-${y}`}
						/>
					)),
				)}
			</svg>
		</DemoWrapper>
	)
}

function DemoThree() {
	const [rows, setRows] = useState(
		createArrayOfLength(getRandomPositiveIntWithin(100)),
	)
	const [columns, setColumns] = useState(
		createArrayOfLength(getRandomPositiveIntWithin(50)),
	)
	const boxSize = 6

	const colors = [
		['fill-blue', 'fill-purple', 'fill-purple'],
		['fill-green', 'fill-blue', 'fill-purple'],
		['fill-green', 'fill-blue', 'fill-purple'],
		['fill-lime', 'fill-green', 'fill-blue'],
		['fill-yellow', 'fill-lime', 'fill-green', 'fill-blue'],
		['fill-yellow', 'fill-lime', 'fill-green'],
		['fill-pink', 'fill-yellow', 'fill-lime', 'fill-green'],
		['fill-pink', 'fill-yellow', 'fill-lime'],
		['fill-pink', 'fill-orange', 'fill-yellow'],
		['fill-pink', 'fill-orange', 'fill-orange'],
	]

	/**
	 * This function is used to return a random positive integer (whole number)
	 * that will never be any larger than the max integer you pass in.
	 * This is extremely useful when trying to get a randomized value from
	 * an array.
	 **/
	function getRandomPositiveIntWithin(max: number) {
		return Math.floor(Math.random() * max)
	}

	/**
	 * This function will give us a random color from the array of colors
	 * we have defined using the `getRandomPositiveIntWithin`. We use the
	 * length of the colors array to make sure the index lookup will be
	 * guaranteed to find a match.
	 **/
	function generateColor(colors: string[]) {
		return colors[getRandomPositiveIntWithin(colors.length)]
	}

	function createArrayOfLength(length: number): number[] {
		return Array.from(Array(length), (_, i) => i)
	}

	function ColorBox({
		xPercent,
		yPercent,
		...props
	}: ComponentProps<'rect'> & { xPercent: number; yPercent: number }) {
		const color = generateColor([...colors[xPercent], ...colors[yPercent]])
		return <rect {...props} className={color} />
	}

	return (
		<DemoWrapper
			className="min-h-96"
			onClick={() => {
				setRows(createArrayOfLength(getRandomPositiveIntWithin(100)))
				setColumns(createArrayOfLength(getRandomPositiveIntWithin(50)))
			}}
		>
			<svg
				width={rows.length * boxSize}
				height={columns.length * boxSize}
				viewBox={`0 0 ${rows.length} ${columns.length}`}
			>
				{rows.map(x =>
					columns.map(y => (
						<ColorBox
							x={x}
							y={y}
							xPercent={Math.floor((x / rows.length) * colors.length)}
							yPercent={Math.floor((y / columns.length) * colors.length)}
							width="1"
							height="1"
							key={`demo-3-pixel-${x}-${y}`}
						/>
					)),
				)}
			</svg>
		</DemoWrapper>
	)
}

function DemoFour() {
	const [rows, setRows] = useState(
		createArrayOfLength(getRandomPositiveIntWithin(100)),
	)
	const [columns, setColumns] = useState(
		createArrayOfLength(getRandomPositiveIntWithin(50)),
	)
	const [xSmoothness, setXSmoothness] = useState(20)
	const [ySmoothness, setYSmoothness] = useState(20)
	const [noiseSeed, setNoiseSeed] = useState<number>(Math.random())
	const noise2D = useMemo(() => makeNoise2D(noiseSeed), [noiseSeed])

	const boxSize = 6

	const colors = [
		'fill-purple',
		'fill-blue',
		'fill-green',
		'fill-lime',
		'fill-yellow',
		'fill-pink',
		'fill-orange',
	]

	/**
	 * This function is used to return a random positive integer (whole number)
	 * that will never be any larger than the max integer you pass in.
	 * This is extremely useful when trying to get a randomized value from
	 * an array.
	 **/
	function getRandomPositiveIntWithin(max: number) {
		return Math.floor(Math.random() * max)
	}

	/**
	 * Simplex Noise generates a value between -1 and 1, but we are working with an
	 * array that will not accept a negative index. We will be converting the original
	 * noise range to fit the 0 to 1 scale we need.
	 **/
	function getColorByNoise(noise: number) {
		return colors[Math.floor(((noise + 1) / 2) * colors.length)]
	}

	function createArrayOfLength(length: number): number[] {
		return Array.from(Array(length), (_, i) => i)
	}

	function ColorBox({
		noise,
		...props
	}: ComponentProps<'rect'> & { noise: number }) {
		const color = getColorByNoise(noise)
		return <rect {...props} className={color} />
	}

	return (
		<DemoWrapper
			className="min-h-[410px]"
			onClick={() => {
				setRows(createArrayOfLength(getRandomPositiveIntWithin(100)))
				setColumns(createArrayOfLength(getRandomPositiveIntWithin(50)))
				setNoiseSeed(Math.random())
			}}
		>
			<svg
				width={rows.length * boxSize}
				height={columns.length * boxSize}
				viewBox={`0 0 ${rows.length} ${columns.length}`}
			>
				{rows.map(x =>
					columns.map(y => (
						<ColorBox
							x={x}
							y={y}
							noise={noise2D(x / xSmoothness, y / ySmoothness)}
							width="1"
							height="1"
							key={`demo-4-pixel-${x}-${y}`}
						/>
					)),
				)}
			</svg>
			<div className="absolute bottom-4 left-4 flex flex-col gap-1 font-mono text-xs">
				<div className="flex items-center gap-2">
					<input
						type="range"
						id="xSmoothness"
						name="xSmoothness"
						min="1"
						max="30"
						value={xSmoothness}
						onChange={e => setXSmoothness(e.target.valueAsNumber)}
						className="h-2 w-24 cursor-pointer appearance-none overflow-hidden rounded-none bg-transparent outline-none [--c:hsl(var(--pink))]"
					/>
					<label htmlFor="xSmoothness">X Smoothness</label>
				</div>
				<div className="flex items-center gap-2">
					<input
						type="range"
						id="ySmoothness"
						name="ySmoothness"
						min="1"
						max="30"
						value={ySmoothness}
						onChange={e => setYSmoothness(e.target.valueAsNumber)}
						className="h-2 w-24 cursor-pointer appearance-none overflow-hidden rounded-none bg-transparent outline-none [--c:hsl(var(--blue))]"
					/>
					<label htmlFor="ySmoothness">Y Smoothness</label>
				</div>
			</div>
		</DemoWrapper>
	)
}

function DemoFive() {
	const [seedOne, setSeedOne] = useState<number>(99)
	const [seedTwo, setSeedTwo] = useState<number>(99)

	const outputOne = useMemo(() => {
		const generator = Alea(seedOne)
		return [generator(), generator(), generator(), generator()]
	}, [seedOne])

	const outputTwo = useMemo(() => {
		const generator = Alea(seedTwo)
		return [generator(), generator(), generator(), generator()]
	}, [seedTwo])

	return (
		<div className="relative grid grid-cols-2 items-center rounded-xl border border-gray-200 bg-gray-100 p-12 md:-mx-10 lg:-mx-12">
			<div>
				<div className="flex items-center gap-2 font-mono text-xs">
					<label htmlFor="seed">Seed One</label>
					<input
						type="number"
						min="1"
						max="100"
						id="seed"
						name="seed"
						value={seedOne}
						onChange={e => {
							setSeedOne(e.target.valueAsNumber)
						}}
						className="w-28 rounded-none border border-foreground px-1.5 py-0.5"
					/>
				</div>

				{outputOne?.length ? (
					<div className="not-prose mt-6 flex flex-col gap-2 text-sm">
						{outputOne.map(o => (
							<p className="text-bold font-mono" key={`output-${o}`}>
								{o}
							</p>
						))}
					</div>
				) : null}
			</div>
			<div>
				<div className="flex items-center gap-2 font-mono text-xs">
					<label htmlFor="seed">Seed Two</label>
					<input
						type="number"
						min="1"
						max="100"
						id="seed"
						name="seed"
						value={seedTwo}
						onChange={e => {
							setSeedTwo(e.target.valueAsNumber)
						}}
						className="w-28 rounded-none border border-foreground px-1.5 py-0.5"
					/>
				</div>

				{outputTwo?.length ? (
					<div className="not-prose mt-6 flex flex-col gap-2 text-sm">
						{outputTwo.map(o => (
							<p className="text-bold font-mono" key={`output-${o}`}>
								{o}
							</p>
						))}
					</div>
				) : null}
			</div>
		</div>
	)
}

function DemoSix() {
	const [seed, setSeed] = useState<number>(99)
	const generator = useMemo(() => {
		return Alea(seed)
	}, [seed])
	const noise2D = useMemo(() => makeNoise2D(seed), [seed])

	const rowRandomNumber = useMemo(() => generator(), [generator])
	const columnRandomNumber = useMemo(() => generator(), [generator])
	const rows = createArrayOfLength(Math.floor(rowRandomNumber * 100))
	const columns = createArrayOfLength(Math.floor(columnRandomNumber * 50))

	const [xSmoothness, setXSmoothness] = useState(20)
	const [ySmoothness, setYSmoothness] = useState(20)

	const boxSize = 6

	const colors = [
		'fill-purple',
		'fill-blue',
		'fill-green',
		'fill-lime',
		'fill-yellow',
		'fill-pink',
		'fill-orange',
	]

	/**
	 * Simplex Noise generates a value between -1 and 1, but we are working with an
	 * array that will not accept a negative index. We will be converting the original
	 * noise range to fit the 0 to 1 scale we need.
	 **/
	function getColorByNoise(noise: number) {
		return colors[Math.floor(((noise + 1) / 2) * colors.length)]
	}

	function createArrayOfLength(length: number): number[] {
		return Array.from(Array(length === 0 ? 1 : length), (_, i) => i)
	}

	function ColorBox({
		noise,
		...props
	}: ComponentProps<'rect'> & { noise: number }) {
		const color = getColorByNoise(noise)
		return <rect {...props} className={color} />
	}

	return (
		<div className="relative flex min-h-[410px] items-center justify-center rounded-xl border border-gray-200 bg-gray-100 p-12 md:-mx-10 lg:-mx-12">
			<svg
				width={rows.length * boxSize}
				height={columns.length * boxSize}
				viewBox={`0 0 ${rows.length} ${columns.length}`}
			>
				{rows.map(x =>
					columns.map(y => (
						<ColorBox
							x={x}
							y={y}
							noise={noise2D(x / xSmoothness, y / ySmoothness)}
							width="1"
							height="1"
							key={`demo-6-pixel-${x}-${y}`}
						/>
					)),
				)}
			</svg>
			<div className="absolute bottom-4 left-4 flex flex-col gap-1 font-mono text-xs">
				<div className="flex items-center gap-2">
					<input
						type="range"
						id="xSmoothness"
						name="xSmoothness"
						min="1"
						max="30"
						value={xSmoothness}
						onChange={e => setXSmoothness(e.target.valueAsNumber)}
						className="h-2 w-24 cursor-pointer appearance-none overflow-hidden rounded-none bg-transparent outline-none [--c:hsl(var(--pink))]"
					/>
					<label htmlFor="xSmoothness">X Smoothness</label>
				</div>
				<div className="flex items-center gap-2">
					<input
						type="range"
						id="ySmoothness"
						name="ySmoothness"
						min="1"
						max="30"
						value={ySmoothness}
						onChange={e => setYSmoothness(e.target.valueAsNumber)}
						className="h-2 w-24 cursor-pointer appearance-none overflow-hidden rounded-none bg-transparent outline-none [--c:hsl(var(--blue))]"
					/>
					<label htmlFor="ySmoothness">Y Smoothness</label>
				</div>
			</div>
			<div className="absolute bottom-4 right-4 flex items-center gap-2 font-mono text-xs">
				<label htmlFor="seed">Seed</label>
				<input
					type="number"
					min="1"
					max="100"
					id="seed"
					name="seed"
					value={seed}
					onChange={e => setSeed(e.target.valueAsNumber)}
					className="w-28 rounded-none border border-foreground px-1.5 py-0.5"
				/>
			</div>
		</div>
	)
}
