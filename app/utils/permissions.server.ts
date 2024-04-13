import { json } from '@remix-run/node'
import { requireAccountId } from './auth.server.ts'
import { prisma } from './db.server.ts'
import { type PermissionString, parsePermissionString } from './member.ts'

export async function requireMemberWithPermission(
	request: Request,
	permission: PermissionString,
	groupId: string,
) {
	const accountId = await requireAccountId(request)
	const permissionData = parsePermissionString(permission)
	const account = await prisma.member.findFirst({
		select: { id: true },
		where: {
			accountId,
			// FIXME: This will require coming back and adding group id
			groupId,
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

export async function requireMemberWithRole(
	request: Request,
	name: string,
	groupId: string,
) {
	const accountId = await requireAccountId(request)
	const account = await prisma.member.findFirst({
		select: { id: true },
		// FIXME: This will require coming back and adding group id
		where: { accountId, groupId, roles: { some: { name } } },
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

export async function requireSuperAdmin(request: Request) {
	const accountId = await requireAccountId(request)
	const account = await prisma.account.findFirst({
		select: { id: true },
		// FIXME: This will require coming back and adding group id
		where: { id: accountId, email: 'contact@wking.dev' },
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
