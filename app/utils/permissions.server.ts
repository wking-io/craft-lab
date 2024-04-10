import { json } from '@remix-run/node'
import { type PermissionString, parsePermissionString } from './account.ts'
import { requireUserId } from './auth.server.ts'
import { prisma } from './db.server.ts'

export async function requireUserWithPermission(
	request: Request,
	permission: PermissionString,
) {
	const accountId = await requireUserId(request)
	const permissionData = parsePermissionString(permission)
	const account = await prisma.account.findFirst({
		select: { id: true },
		where: {
			id: accountId,
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

export async function requireUserWithRole(request: Request, name: string) {
	const accountId = await requireUserId(request)
	const account = await prisma.account.findFirst({
		select: { id: true },
		where: { id: accountId, roles: { some: { name } } },
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
