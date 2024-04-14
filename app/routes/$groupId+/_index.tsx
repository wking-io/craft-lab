import { generatePath, redirect } from '@remix-run/react'

export async function loader() {
	return redirect(generatePath('objectives'))
}
