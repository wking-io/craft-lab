import { invariant } from '@epic-web/invariant'
import { type LoaderFunctionArgs } from '@remix-run/node'
import { json, useLoaderData } from '@remix-run/react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '#app/components/ui/table.js'
import { prisma } from '#app/utils/db.server.js'

export async function loader({ params }: LoaderFunctionArgs) {
	const { groupId } = params
	invariant(groupId, 'Missing Group ID.')

	const members = await prisma.group
		.findUniqueOrThrow({
			where: { id: groupId },
			select: {
				members: {
					select: {
						id: true,
						roles: true,
						account: {
							select: {
								handle: true,
								email: true,
								name: true,
							},
						},
					},
				},
			},
		})
		.then(({ members }) =>
			members.map(member => ({
				id: member.id,
				name: member.account.name,
				email: member.account.email,
				handle: member.account.handle,
				roles: member.roles.map(({ name }) => name),
			})),
		)

	return json({
		members,
	})
}

export default function Screen() {
	const { members } = useLoaderData<typeof loader>()

	return (
		<div>
			<Table dense>
				<TableHead>
					<TableRow>
						<TableHeader>Name</TableHeader>
						<TableHeader>Email</TableHeader>
						<TableHeader>Role</TableHeader>
					</TableRow>
				</TableHead>
				<TableBody>
					{members.map(member => (
						<TableRow key={member.handle}>
							<TableCell className="font-medium">{member.name}</TableCell>
							<TableCell>{member.email}</TableCell>
							<TableCell className="text-zinc-500">
								{member.roles.join(' - ')}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<button>Invite New Member</button>
		</div>
	)
}
