import { type MetaFunction } from '@remix-run/node'
import clsx from 'clsx'
import { Logo } from '#app/components/logo.js'
import { MarketingButton } from '#app/components/ui/status-button.js'
import { rootRouteId } from '#app/root.js'
import { useRouteIdLoaderData } from '#app/utils/route-id.js'
import { seoData } from '#app/utils/seo.js'

export const meta: MetaFunction = () =>
	seoData({
		title: 'Craft Lab — A community built for Incredible Design Engineers',
		description:
			'Help us build a space where we learn and share everything about our craft and have fun doing it.',
	})

export default function Screen() {
	const { seed } = useRouteIdLoaderData(rootRouteId)

	return (
		<main className="h-full">
			<div className="container flex h-full flex-col items-center justify-center px-6 py-8 text-center md:py-12 lg:py-16">
				<div className={clsx('relative flex gap-3')}>
					<Logo seed={seed} className="h-auto w-8" />
					<p className="text-3xl font-semibold tracking-tight">Craft Lab</p>
				</div>
				<h1 className="relative mt-8 max-w-2xl text-balance text-4xl font-semibold leading-tight md:text-5xl">
					You are now on the waitlist!
				</h1>
				<p className="text-primary/70 mt-5 text-pretty md:text-lg xl:text-xl">
					Can't wait to chat. Will shoot you an update to the email you entered
					shortly. In the meantime, feel free to DM me on X.
				</p>
				<MarketingButton
					to="https://x.com/wking__"
					reloadDocument
					className="mt-6"
				>
					<svg
						width="24"
						height="15"
						viewBox="0 0 24 15"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="rotate-[-10deg]"
					>
						<path
							d="M4.575 3.08679H-3.8147e-06V4.48311H4.575V3.08679Z"
							className="fill-current"
						/>
						<path
							d="M2.2875 5.88855H-1.90735e-06V7.28487H2.2875V5.88855Z"
							className="fill-current"
						/>
						<path
							d="M17.145 12.8888H11.43V14.2851H5.715V11.4833H2.2875V8.69067H3.4275V10.087H22.86V8.69067H24V11.4833H17.145V12.8888Z"
							className="fill-current"
						/>
						<path
							d="M5.715 7.28491H3.4275V8.69042H5.715V7.28491Z"
							className="fill-current"
						/>
						<path
							d="M6.8625 0.285034H4.575V1.69054H6.8625V0.285034Z"
							className="fill-current"
						/>
						<path
							d="M8.0025 5.88855H5.715V7.28487H8.0025V5.88855Z"
							className="fill-current"
						/>
						<path
							d="M10.29 4.48311H11.43V5.88862H8.0025V4.48311H9.1425V3.08679H10.29V4.48311Z"
							className="fill-current"
						/>
						<path
							d="M9.1425 3.08686H8.0025V0.285034H11.43V1.69054H9.1425V3.08686Z"
							className="fill-current"
						/>
						<path
							d="M13.7175 1.69043H11.43V3.08675H13.7175V1.69043Z"
							className="fill-current"
						/>
						<path
							d="M14.8575 5.88855H11.43V7.28487H14.8575V5.88855Z"
							className="fill-current"
						/>
						<path
							d="M16.005 3.08679H13.7175V4.48311H16.005V3.08679Z"
							className="fill-current"
						/>
						<path
							d="M18.285 4.48315H16.005V5.88866H18.285V4.48315Z"
							className="fill-current"
						/>
						<path
							d="M20.5725 5.88855H18.285V7.28487H20.5725V5.88855Z"
							className="fill-current"
						/>
						<path
							d="M22.86 7.28491H20.5725V8.69042H22.86V7.28491Z"
							className="fill-current"
						/>
					</svg>
					Shoot me a DM
				</MarketingButton>
			</div>
		</main>
	)
}
