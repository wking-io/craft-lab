import { invariant } from '@epic-web/invariant'
import { type LoaderFunctionArgs } from '@remix-run/node'
import {
	Form,
	NavLink,
	Outlet,
	generatePath,
	json,
	useLoaderData,
} from '@remix-run/react'
import { Logo } from '#app/components/logo.js'
import { Icon } from '#app/components/ui/icon.js'
import { rootRouteId } from '#app/root.js'
import { useRouteIdLoaderData } from '#app/utils/route-id.js'

export async function loader({ params }: LoaderFunctionArgs) {
	const { groupId } = params
	invariant(groupId, 'Missing groupId.')

	return json({
		groupId,
	})
}

export default function Screen() {
	const { groupId } = useLoaderData<typeof loader>()
	const { seed } = useRouteIdLoaderData(rootRouteId)

	return (
		<div className="flex h-full bg-gray-100">
			<div className="sticky top-0 m-1.5 flex w-56 flex-col">
				<div className="flex items-center gap-2 px-2 py-3.5">
					<Logo seed={seed} className="h-auto w-6" />
					<p className="font-semibold">Craft Lab</p>
				</div>
				<div className="flex flex-1 flex-col pt-8">
					<NavLink
						to={generatePath('/:groupId/objectives', { groupId })}
						className="group flex items-center gap-2 rounded p-2 text-sm font-medium text-primary/60 hover:bg-primary/5 hover:text-primary"
					>
						<span className="group-hover:bg-pink group-hover:text-pink-foreground inline-flex h-6 w-6 items-center justify-center rounded bg-primary text-white">
							<Icon name="columns" size="sm" />
						</span>
						Objectives
					</NavLink>
					<NavLink
						to={generatePath('/:groupId/milestones', { groupId })}
						className="group flex items-center gap-2 rounded p-2 text-sm font-medium text-primary/60 hover:bg-primary/5 hover:text-primary"
					>
						<span className="group-hover:bg-yellow inline-flex h-6 w-6 items-center justify-center rounded bg-primary text-white">
							<Icon name="lightning-bolt" size="sm" />
						</span>
						Milestones
					</NavLink>
					<NavLink
						to={generatePath('/:groupId/signals', { groupId })}
						className="group flex items-center gap-2 rounded p-2 text-sm font-medium text-primary/60 hover:bg-primary/5 hover:text-primary"
					>
						<span className="group-hover:bg-lime inline-flex h-6 w-6 items-center justify-center rounded bg-primary text-white">
							<Icon name="target" size="sm" />
						</span>
						Signals
					</NavLink>
					<NavLink
						to={generatePath('/:groupId/threads', { groupId })}
						className="group flex items-center gap-2 rounded p-2 text-sm font-medium text-primary/60 hover:bg-primary/5 hover:text-primary"
					>
						<span className="group-hover:bg-blue inline-flex h-6 w-6 items-center justify-center rounded bg-primary text-white">
							<Icon name="chat-bubble" size="sm" />
						</span>
						Threads
					</NavLink>
					<NavLink
						to={generatePath('/:groupId/members', { groupId })}
						className="group flex items-center gap-2 rounded p-2 text-sm font-medium text-primary/60 hover:bg-primary/5 hover:text-primary"
					>
						<span className="group-hover:bg-orange inline-flex h-6 w-6 items-center justify-center rounded bg-primary text-white">
							<Icon name="person" size="sm" />
						</span>
						Members
					</NavLink>
				</div>
				<div className="flex items-center justify-between p-2">
					<div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-white">
						<Icon name="person" size="sm" />
					</div>
					<Form action="/logout" method="POST">
						<button
							type="submit"
							className="hover:bg-red/15 hover:text-red flex h-6 w-6 items-center justify-center rounded"
						>
							<Icon name="exit" size="xs">
								<span className="sr-only">Logout</span>
							</Icon>
						</button>
					</Form>
				</div>
			</div>
			<div className="mr-4 mt-4 flex-1 rounded-t-xl bg-white">
				<Outlet />
			</div>
		</div>
	)
}
