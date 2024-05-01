import { Link } from '@remix-run/react'
import { DemoPreview } from './_article+/the-generative-part-of-generative-art'

export default function Screen() {
	return (
		<div className="container mt-8 px-4 md:mt-12">
			<h1 className="font-mono text-sm font-semibold">
				Articles, Guides, and more...eventually
			</h1>
			<div className="grid md:grid-cols-2 lg:grid-cols-3">
				<div className="relative mt-8">
					<svg
						className="absolute right-0 top-0 z-10 h-[24px] w-[24px]"
						viewBox="0 0 4 4"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M 2 0 H 2 V 1 H 3 V 2 H 4 V 0 H 0 Z"
							className="fill-background"
							strokeWidth="0"
						/>
						<path
							d="M 2 0 H 2 V 1 H 3 V 2 H 4"
							className="stroke-foreground"
							strokeWidth=".125"
						/>
					</svg>
					<div className="overflow-hidden border border-foreground">
						<DemoPreview />
						<div className="relative p-4">
							<h2 className="text-xl font-semibold">
								The Generative Part of Generative Art
							</h2>
							<p className="mt-2 text-pretty text-sm">
								This is an interactive guide sharing what I have learned about
								Generative Art to help you go from zero to one faster.{' '}
							</p>
							<Link to="the-generative-part-of-generative-art">
								<span className="sr-only">Read Article</span>
								<span className="absolute inset-0"></span>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
