import { type SerializeFrom } from '@remix-run/node'
import { useRouteLoaderData } from '@remix-run/react'
import { type loader as rootLoader } from '#app/root.tsx'

function isAccount(
	account: any,
): account is SerializeFrom<typeof rootLoader>['account'] {
	return (
		account && typeof account === 'object' && typeof account.id === 'string'
	)
}

export function useOptionalAccount() {
	const data = useRouteLoaderData<typeof rootLoader>('root')
	if (!data || !isAccount(data.account)) {
		return undefined
	}
	return data.account
}

export function useAccount() {
	const maybeAccount = useOptionalAccount()
	if (!maybeAccount) {
		throw new Error(
			'No account found in root loader, but account is required by useAccount. If account is optional, try useOptionalAccount instead.',
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

export function accountHasPermission(
	account: Pick<ReturnType<typeof useAccount>, 'roles'> | null | undefined,
	permission: PermissionString,
) {
	if (!account) return false
	const { action, entity, access } = parsePermissionString(permission)
	return account.roles.some(role =>
		role.permissions.some(
			permission =>
				permission.entity === entity &&
				permission.action === action &&
				(!access || access.includes(permission.access)),
		),
	)
}

export function accountHasRole(
	account: Pick<ReturnType<typeof useAccount>, 'roles'> | null,
	role: string,
) {
	if (!account) return false
	return account.roles.some(r => r.name === role)
}
