import { Link, Outlet } from '@remix-run/react'
import clsx from 'clsx'
import { Logo } from '#app/components/logo.js'
import { rootRouteId } from '#app/root.js'
import { useRouteIdLoaderData } from '#app/utils/route-id.js'

export default function Screen() {
	const { seed } = useRouteIdLoaderData(rootRouteId)
	return (
		<>
			<div className="flex items-center justify-between px-4 py-3">
				<div className={clsx('relative flex gap-2 md:gap-3')}>
					<Logo seed={seed} className="h-auto w-6 md:w-8" />
					<p className="text-xl font-semibold tracking-tight md:text-2xl">
						Craft Lab
					</p>
				</div>
				<nav>
					<Link to="/articles" className="font-mono text-sm hover:text-lime">
						Articles
					</Link>
				</nav>
			</div>
			<Outlet />
		</>
	)
}
