import { groupRouteId } from '#app/routes/$groupId.js'
import { useRouteIdLoaderData } from './route-id'

export function useOptionalMember() {
	const data = useRouteIdLoaderData(groupRouteId)
	return data?.member
}

export function useMember() {
	const maybeAccount = useOptionalMember()
	if (!maybeAccount) {
		throw new Error(
			'No member found in group loader, but member is required by useMember. If member is optional, try useOptionalMember instead.',
		)
	}
	return maybeAccount
}

type Action = 'create' | 'read' | 'update' | 'delete'
type Entity = 'account' | 'note'
type Access = 'own' | 'any' | 'own,any' | 'any,own'
export type PermissionString =
	| `${Action}:${Entity}`
	| `${Action}:${Entity}:${Access}`

export function parsePermissionString(permissionString: PermissionString) {
	const [action, entity, access] = permissionString.split(':') as [
		Action,
		Entity,
		Access | undefined,
	]
	return {
		action,
		entity,
		access: access ? (access.split(',') as Array<Access>) : undefined,
	}
}

export function memberHasPermission(
	member: Pick<ReturnType<typeof useMember>, 'roles'> | null | undefined,
	permission: PermissionString,
) {
	if (!member) return false
	const { action, entity, access } = parsePermissionString(permission)
	return member.roles.some(role =>
		role.permissions.some(
			permission =>
				permission.entity === entity &&
				permission.action === action &&
				(!access || access.includes(permission.access)),
		),
	)
}

export function memberHasRole(
	member: Pick<ReturnType<typeof useMember>, 'roles'> | null,
	role: string,
) {
	if (!member) return false
	return member.roles.some(r => r.name === role)
}
