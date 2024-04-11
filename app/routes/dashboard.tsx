import { generatePath, redirect } from '@remix-run/react'
import { prisma } from '#app/utils/db.server.js'

export async function loader() {
	const group = await prisma.group.findFirstOrThrow()
	return redirect(generatePath('/:groupId/dashboard', { groupId: group.id }))
}
