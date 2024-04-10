import { json } from '@remix-run/node'
import { type PermissionString, parsePermissionString } from './account.ts'
import { requireAccountId } from './auth.server.ts'
import { prisma } from './db.server.ts'

export async function requireProfileWithPermission(
	request: Request,
	permission: PermissionString,
) {
	const accountId = await requireAccountId(request)
	const permissionData = parsePermissionString(permission)
	const account = await prisma.profile.findFirst({
		select: { id: true },
		where: {
			accountId,
			// FIXME: This will require coming back and adding group id
			groupId: '',
			roles: {
				some: {
					permissions: {
						some: {
							...permissionData,
							access: permissionData.access
								? { in: permissionData.access }
								: undefined,
						},
					},
				},
			},
		},
	})
	if (!account) {
		throw json(
			{
				error: 'Unauthorized',
				requiredPermission: permissionData,
				message: `Unauthorized: required permissions: ${permission}`,
			},
			{ status: 403 },
		)
	}
	return account.id
}

export async function requireProfileWithRole(request: Request, name: string) {
	const accountId = await requireAccountId(request)
	const account = await prisma.profile.findFirst({
		select: { id: true },
		// FIXME: This will require coming back and adding group id
		where: { accountId, groupId: '', roles: { some: { name } } },
	})
	if (!account) {
		throw json(
			{
				error: 'Unauthorized',
				requiredRole: name,
				message: `Unauthorized: required role: ${name}`,
			},
			{ status: 403 },
		)
	}
	return account.id
}
