import { rootRouteId } from '#app/root.tsx'
import { useRouteIdLoaderDataOptional } from './route-id'

export function useOptionalAccount() {
	const data = useRouteIdLoaderDataOptional(rootRouteId)
	return data?.account ?? undefined
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
