import { prisma } from './db.server'

export function accountExistsByEmail(email: string) {
	return prisma.account.findUnique({ select: { id: true }, where: { email } })
}
