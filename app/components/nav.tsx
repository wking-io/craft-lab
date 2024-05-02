import { Link } from '@remix-run/react'
import clsx from 'clsx'
import { Logo } from '#app/components/logo.js'
import { rootRouteId } from '#app/root.js'
import { useRouteIdLoaderData } from '#app/utils/route-id.js'

export function Nav() {
	const { seed } = useRouteIdLoaderData(rootRouteId)

	return (
		<div className="flex items-center justify-between px-4 py-3">
			<div className={clsx('relative flex gap-2 md:gap-3')}>
				<Logo seed={seed} className="h-auto w-6 md:w-8" />
				<Link
					to="/"
					className="text-xl font-semibold tracking-tight md:text-2xl"
				>
					Craft Lab
					<span className="absolute inset-0" />
				</Link>
			</div>
			<nav>
				<Link
					to="/articles"
					className="font-mono text-sm hover:text-foreground/70"
				>
					Articles
				</Link>
			</nav>
		</div>
	)
}
