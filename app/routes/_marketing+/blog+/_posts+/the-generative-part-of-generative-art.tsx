import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getHighlighter } from 'shiki'
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

function ColorBox(props: ComponentProps<'rect'>) { 
  const color = generateColor() 
  return <rect {...props} fill={color} />
}

function createArrayOfLength(length: number) { 
  return Array.from(Array(length), (_, i) => i)
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

function ColorBox(props: ComponentProps<'rect'>) { 
  const color = generateColor() 
  return <rect {...props} fill={color} />
}

function createArrayOfLength(length: number) { 
  return Array.from(Array(length), (_, i) => i)
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
	})
}

export default function Screen() {
	const { exampleOne, exampleTwo, exampleThree } =
		useLoaderData<typeof loader>()
	return (
		<article className="prose prose-p:text-pretty prose-p:text-foreground/70 mx-auto py-16 lg:py-24 lg:text-lg">
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
				className="text-sm"
			/>
			<p>BOOM! Generative art.</p>

			<h3>Let’s take it a little further</h3>

			<p>
				We have randomized color, what if we want to do more than one color?
				What if we want a grid of colors where the size of that grid is also
				generative?
			</p>
			<div
				dangerouslySetInnerHTML={{ __html: exampleTwo }}
				className="text-sm"
			/>
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
				className="text-sm"
			/>
			<h2>Random, but Repeatable</h2>
		</article>
	)
}
