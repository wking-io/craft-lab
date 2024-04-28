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
import clsx from 'clsx'
import { Logo } from '#app/components/logo.js'
import { MilestoneIcon, ObjectiveIcon } from '#app/components/two-tone-icon.js'
import { Icon } from '#app/components/ui/icon.js'
import { rootRouteId } from '#app/root.js'
import { requireAccountId } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { type RouteID, useRouteIdLoaderData } from '#app/utils/route-id.js'

const ROUTE_ID = 'root' as RouteID<{ loader: typeof loader }>
export { ROUTE_ID as groupRouteId }

export async function loader({ request, params }: LoaderFunctionArgs) {
	const { groupId } = params
	invariant(groupId, 'Missing groupId.')
	const accountId = await requireAccountId(request)

	const member = await prisma.member.findUnique({
		where: {
			accountId_groupId: {
				groupId,
				accountId,
			},
		},
		select: {
			roles: {
				select: {
					name: true,
					permissions: {
						select: { entity: true, action: true, access: true },
					},
				},
			},
		},
	})

	return json({
		groupId,
		member,
	})
}

export default function Screen() {
	const { groupId } = useLoaderData<typeof loader>()
	const { seed } = useRouteIdLoaderData(rootRouteId)

	return (
		<div className="flex h-full">
			<div className="sticky top-0 flex w-56 flex-col border-r border-foreground">
				<div className="m-1.5 flex flex-1 flex-col">
					<div className="flex items-center gap-2 px-2 py-3.5">
						<Logo seed={seed} className="h-auto w-6" />
						<p className="font-semibold">Craft Lab</p>
					</div>
					<div className="flex flex-1 flex-col gap-1 pt-8">
						<NavLink
							to={generatePath('/:groupId/objectives', { groupId })}
							className={({ isActive }) =>
								clsx(
									isActive ? 'bg-primary/5 text-primary' : 'text-primary/70',
									'group flex items-center gap-2 rounded p-2 font-mono text-sm font-semibold',
								)
							}
						>
							{({ isActive }) => (
								<>
									<span className="h-auto w-5">
										<ObjectiveIcon active={isActive} />
									</span>
									Objectives
								</>
							)}
						</NavLink>
						<NavLink
							to={generatePath('/:groupId/milestones', { groupId })}
							className={({ isActive }) =>
								clsx(
									isActive
										? 'bg-primary/5 text-primary'
										: 'text-primary/60 hover:bg-primary/5',
									'group flex items-center gap-2 rounded p-2 text-sm font-medium',
								)
							}
						>
							{({ isActive }) => (
								<>
									<span className="h-auto w-5">
										<MilestoneIcon active={isActive} />
									</span>
									Milestones
								</>
							)}
						</NavLink>
						<NavLink
							to={generatePath('/:groupId/signals', { groupId })}
							className={({ isActive }) =>
								clsx(
									isActive
										? 'bg-primary/5 text-primary'
										: 'text-primary/60 hover:bg-primary/5',
									'group flex items-center gap-2 rounded p-2 text-sm font-medium',
								)
							}
						>
							{({ isActive }) => (
								<>
									<span
										className={clsx(
											isActive
												? 'bg-lime text-lime-foreground'
												: 'bg-primary group-hover:bg-lime group-hover:text-lime-foreground',
											'inline-flex h-6 w-6 items-center justify-center rounded text-white',
										)}
									>
										<Icon name="target" size="sm" />
									</span>
									Signals
								</>
							)}
						</NavLink>
						<NavLink
							to={generatePath('/:groupId/threads', { groupId })}
							className={({ isActive }) =>
								clsx(
									isActive
										? 'bg-primary/5 text-primary'
										: 'text-primary/60 hover:bg-primary/5',
									'group flex items-center gap-2 rounded p-2 text-sm font-medium',
								)
							}
						>
							{({ isActive }) => (
								<>
									<span
										className={clsx(
											isActive
												? 'bg-pink text-purple-foreground'
												: 'bg-primary group-hover:bg-purple group-hover:text-purple-foreground',
											'inline-flex h-6 w-6 items-center justify-center rounded text-white',
										)}
									>
										<Icon name="chat-bubble" size="sm" />
									</span>
									Threads
								</>
							)}
						</NavLink>
						<NavLink
							to={generatePath('/:groupId/library', { groupId })}
							className={({ isActive }) =>
								clsx(
									isActive
										? 'bg-primary/5 text-primary'
										: 'text-primary/60 hover:bg-primary/5',
									'group flex items-center gap-2 rounded p-2 text-sm font-medium',
								)
							}
						>
							{({ isActive }) => (
								<>
									<span
										className={clsx(
											isActive
												? 'bg-blue text-blue-foreground'
												: 'bg-primary group-hover:bg-blue group-hover:text-blue-foreground',
											'inline-flex h-6 w-6 items-center justify-center rounded text-white',
										)}
									>
										<Icon name="bookmark" size="sm" />
									</span>
									Library
								</>
							)}
						</NavLink>
						<NavLink
							to={generatePath('/:groupId/members', { groupId })}
							className={({ isActive }) =>
								clsx(
									isActive
										? 'bg-primary/5 text-primary'
										: 'text-primary/60 hover:bg-primary/5',
									'group flex items-center gap-2 rounded p-2 text-sm font-medium',
								)
							}
						>
							{({ isActive }) => (
								<>
									<span
										className={clsx(
											isActive
												? 'bg-orange text-orange-foreground'
												: 'bg-primary group-hover:bg-orange group-hover:text-orange-foreground',
											'inline-flex h-6 w-6 items-center justify-center rounded text-white',
										)}
									>
										<Icon name="person" size="sm" />
									</span>
									Members
								</>
							)}
						</NavLink>
					</div>
					<div className="flex items-center justify-between p-2">
						<div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-white">
							<Icon name="person" size="sm" />
						</div>
						<Form action="/logout" method="POST">
							<button
								type="submit"
								className="flex h-6 w-6 items-center justify-center rounded hover:bg-red/15 hover:text-red"
							>
								<Icon name="exit" size="xs">
									<span className="sr-only">Logout</span>
								</Icon>
							</button>
						</Form>
					</div>
				</div>
			</div>
			<div className="mr-4 mt-4 flex-1 rounded-t-xl bg-white">
				<Outlet />
			</div>
		</div>
	)
}
