import { Outlet } from '@remix-run/react'
import { Nav } from '#app/components/nav.js'

export default function Screen() {
	return (
		<>
			<Nav />
			<Outlet />
		</>
	)
}
