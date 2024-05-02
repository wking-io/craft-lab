import { type ActionFunctionArgs, type MetaFunction } from '@remix-run/node'
import { json, useLoaderData } from '@remix-run/react'
import clsx from 'clsx'
import QR from 'qrcode'
import { type PropsWithChildren } from 'react'
import MemberCard from '#app/components/member-card.js'
import { Nav } from '#app/components/nav.js'
import { WaitlistForm } from '#app/components/waitlist.js'
import { rootRouteId } from '#app/root.js'
import { useRouteIdLoaderData } from '#app/utils/route-id.js'
import { seoData } from '#app/utils/seo.js'
import { submitWaitlist } from '#app/utils/waitlist.server.js'

export const meta: MetaFunction = () =>
	seoData({
		title: 'Craft Lab — A community built for Design Engineers',
		description:
			'Help us build a space where we learn and share everything about our craft and have fun doing it.',
	})

export async function loader() {
	return json({
		qrcode: await QR.toDataURL('https://mubs.me/', {
			color: { light: '#09090b', dark: '#fff' },
		}),
	})
}

export async function action({ request }: ActionFunctionArgs) {
	return submitWaitlist({ request })
}

export default function Index() {
	const { qrcode } = useLoaderData<typeof loader>()
	const { seed } = useRouteIdLoaderData(rootRouteId)

	return (
		<main className="h-full">
			<Nav />
			<div className="container flex flex-col overflow-x-hidden px-6 py-8 md:py-12 lg:py-16">
				<h1 className="relative mt-8 text-4xl font-semibold leading-tight md:text-5xl">
					Your friends are your future.
					<br className="hidden md:block" /> Come make more Design Engineer
					ones.
				</h1>
				<p className="mt-5 text-pretty text-foreground/70 md:text-lg xl:text-xl">
					Help us build a community where we learn and share everything about
					our craft and have fun doing it.
				</p>
				<WaitlistForm />
			</div>
			<section className="container">
				<div className="grid gap-6 py-8 md:grid-cols-2 md:gap-y-8 md:px-6 lg:grid-cols-3 lg:gap-y-8">
					<div className="grid px-5 py-6 md:max-w-sm">
						<div className="">
							<FeatureName color="text-pink">Objectives</FeatureName>
							<h2 className="mt-4 text-balance text-xl font-semibold">
								Collaborate daily on what matters
							</h2>
							<p className="mt-4 text-pretty text-foreground/70">
								Start every day sharing what you're working on. That objective
								will now be available for tracking progress and having
								conversations focused around it.
							</p>
						</div>
					</div>
					<div className="grid px-5 py-6 md:max-w-sm">
						<div className="justify-self-end">
							<FeatureName color="text-yellow">Milestones</FeatureName>
							<h2 className="mt-4 text-balance text-xl font-semibold">
								Plan your long term growth
							</h2>
							<p className="mt-4 text-pretty text-foreground/70">
								A community can't help you if we don't know where you are
								headed. Use milestones to share your big goal for the year, and
								what you are doing this quarter to achieve it.
							</p>
						</div>
					</div>
					<div className="grid px-5 py-6 md:max-w-sm">
						<div className="">
							<FeatureName color="text-lime">Signals</FeatureName>
							<h2 className="mt-4 text-balance text-xl font-semibold">
								Targeted help when you need it
							</h2>
							<p className="mt-4 text-pretty text-foreground/70">
								A wide range of expertise in the community gives you access to
								the right kind of help when you need it. Signals everyone know
								that you are looking for active feedback to get past hurdles
								that come up.
							</p>
						</div>
					</div>

					<div className="grid px-5 py-6 md:max-w-sm">
						<div className="justify-self-end">
							<FeatureName color="text-green">Library</FeatureName>
							<h2 className="mt-4 text-balance text-xl font-semibold">
								Curated resources from the best people
							</h2>
							<p className="mt-4 text-pretty text-foreground/70">
								Submit your favorite resources and access the ones that have
								been shared by the rest of us. A library of trusted and tried
								information...it doesn't get better than that.
							</p>
						</div>
					</div>

					<div className="grid px-5 py-6 md:max-w-sm">
						<div className="">
							<FeatureName color="text-blue">Threads</FeatureName>
							<h2 className="mt-4 text-balance text-xl font-semibold">
								Let's not forget we want to have fun
							</h2>
							<p className="mt-4 text-pretty text-foreground/70">
								Threads is a space for fun and community. It is a group chat
								with a ton of people who care about the things you do both
								professionally and creatively.
							</p>
						</div>
					</div>

					<div className="dark group relative flex flex-col bg-background px-5 py-6 md:max-w-sm">
						<svg
							className="absolute right-0 top-0 h-[24px] w-[24px]"
							viewBox="0 0 4 4"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<rect
								className="fill-current text-foreground"
								x="0"
								y="0"
								width="4"
								height="4"
							/>
							<path
								d="M 0 0 H 2 V 1 H 3 V 2 H 4 V 4 H 0 V 0 Z"
								className="fill-current text-background"
							/>
						</svg>
						<PlaygroundHoverSVG className="absolute right-0 top-0 opacity-0 transition group-hover:opacity-100" />
						<div className="flex-1">
							<FeatureName color="text-foreground">
								Playground for Ideas
							</FeatureName>
							<div className="">
								<h2 className="mt-4 text-pretty text-xl font-semibold text-foreground">
									Help build the platform yourself
								</h2>
								<p className="mt-4 text-pretty text-foreground/70">
									Members get full access to contribute to the design and
									development of making this space something really special.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>
			<section className="container flex flex-col-reverse items-center gap-8 px-6 py-8 md:gap-12 md:py-12 lg:flex-row lg:gap-16 lg:py-16">
				<div>
					<MemberCard seed={seed} qrcode={qrcode} />
				</div>
				<div>
					<h3 className="font-mono text-sm font-semibold md:text-base">
						Did I mention the membership cards yet?
					</h3>
					<h2 className="relative mt-3 max-w-4xl text-4xl font-semibold leading-tight md:text-balance md:text-5xl">
						Only waitlist members will get the holographic overlay.
					</h2>
					<p className="mt-5 max-w-3xl text-pretty text-foreground/70 md:text-lg xl:text-xl">
						This community is about exploring the craft of design engineering
						with others, making each other better, and having fun while we do
						it. Not every idea or project has the space to be explored in our
						day jobs. So, let's do that here. Membership cards are an example of
						this.
					</p>
					<WaitlistForm />
				</div>
			</section>
		</main>
	)
}

function FeatureName({
	color,
	children,
}: PropsWithChildren<{ color: `text-${string}` }>) {
	return (
		<h3 className="relative inline-flex items-center gap-1 border border-foreground py-0.5 pl-2 pr-2.5 font-mono text-xs font-semibold uppercase text-foreground">
			<span className="absolute -left-px -top-px h-1.5 w-1.5 border border-b-foreground border-l-background border-r-foreground border-t-background bg-background" />
			<span className="absolute -bottom-px -left-px h-1.5 w-1.5 border border-b-background border-l-background border-r-foreground border-t-foreground bg-background" />
			<span className="absolute -right-px -top-px h-1.5 w-1.5 border border-b-foreground border-l-foreground border-r-background border-t-background bg-background" />
			<span className="absolute -bottom-px -right-px h-1.5 w-1.5 border border-b-background border-l-foreground border-r-background border-t-foreground bg-background" />
			<svg
				className={clsx(color, 'h-3 w-3')}
				viewBox="0 0 12 12"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M 0 3 H 3 V 0 H 9 V 3 H 12 V 9 H 9 V 12 H 3 V 9 H 0 V 3 Z"
					className="fill-current"
				/>
			</svg>
			{children}
		</h3>
	)
}

function PlaygroundHoverSVG({ className }: { className?: string }) {
	return (
		<svg
			width="66"
			height="72"
			viewBox="0 0 66 72"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<rect x="48" width="6" height="6" fill="white" fillOpacity="0.5" />
			<rect x="42" y="6" width="6" height="6" fill="white" fillOpacity="0.4" />
			<rect x="36" width="6" height="6" fill="white" fillOpacity="0.5" />
			<rect x="24" width="6" height="6" fill="white" fillOpacity="0.3" />
			<rect x="12" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="12" y="12" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="24" y="18" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="36" y="24" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="24" y="24" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="30" y="36" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="24" y="42" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="36" y="42" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="42" y="54" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="18" y="30" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="30" y="6" width="6" height="6" fill="white" fillOpacity="0.4" />
			<rect x="24" y="6" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="36" y="12" width="6" height="6" fill="white" fillOpacity="0.3" />
			<rect x="18" y="12" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="42" y="18" width="6" height="6" fill="white" fillOpacity="0.3" />
			<rect x="30" y="18" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="48" y="24" width="6" height="6" fill="white" fillOpacity="0.3" />
			<rect x="42" y="24" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="54" y="6" width="6" height="6" fill="white" fillOpacity="0.5" />
			<rect x="48" y="6" width="6" height="6" fill="white" fillOpacity="0.5" />
			<rect x="48" y="12" width="6" height="6" fill="white" fillOpacity="0.4" />
			<rect x="60" y="12" width="6" height="6" fill="white" fillOpacity="0.5" />
			<rect x="60" y="18" width="6" height="6" fill="white" fillOpacity="0.5" />
			<rect x="60" y="36" width="6" height="6" fill="white" fillOpacity="0.4" />
			<rect x="60" y="48" width="6" height="6" fill="white" fillOpacity="0.3" />
			<rect x="60" y="60" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="60" y="66" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="54" y="54" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="48" y="48" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="36" y="48" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="54" y="42" width="6" height="6" fill="white" fillOpacity="0.3" />
			<rect x="54" y="18" width="6" height="6" fill="white" fillOpacity="0.4" />
			<rect x="60" y="24" width="6" height="6" fill="white" fillOpacity="0.5" />
			<rect x="54" y="30" width="6" height="6" fill="white" fillOpacity="0.4" />
			<rect x="48" y="36" width="6" height="6" fill="white" fillOpacity="0.3" />
			<rect x="42" y="36" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="36" y="30" width="6" height="6" fill="white" fillOpacity="0.2" />
		</svg>
	)
}
