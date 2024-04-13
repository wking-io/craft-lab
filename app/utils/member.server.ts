import { prisma } from './db.server'

export async function createMember({
	accountId,
	groupId,
}: {
	accountId: string
	groupId: string
}) {
	return prisma.member.create({
		data: {
			group: { connect: { id: groupId } },
			account: { connect: { id: accountId } },
			roles: {
				connect: [
					{
						name: 'member',
					},
				],
			},
		},
	})
}
