/**
 * @vitest-environment jsdom
 */
import { faker } from '@faker-js/faker'
import { createRemixStub } from '@remix-run/testing'
import { render, screen } from '@testing-library/react'
import setCookieParser from 'set-cookie-parser'
import { test } from 'vitest'
import { loader as rootLoader } from '#app/root.tsx'
import { getSessionExpirationDate, sessionKey } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { authSessionStorage } from '#app/utils/session.server.ts'
import { createUser, getUserImages } from '#tests/db-utils.ts'
import { default as HandleRoute, loader } from './$handle.tsx'

test('The account profile when not logged in as self', async () => {
	const accountImages = await getUserImages()
	const accountImage =
		accountImages[faker.number.int({ min: 0, max: accountImages.length - 1 })]
	const account = await prisma.account.create({
		select: { id: true, handle: true, name: true },
		data: { ...createUser(), image: { create: accountImage } },
	})
	const App = createRemixStub([
		{
			path: '/accounts/:handle',
			Component: HandleRoute,
			loader,
		},
	])

	const routeUrl = `/accounts/${account.handle}`
	render(<App initialEntries={[routeUrl]} />)

	await screen.findByRole('heading', { level: 1, name: account.name! })
	await screen.findByRole('img', { name: account.name! })
	await screen.findByRole('link', { name: `${account.name}'s notes` })
})

test('The account profile when logged in as self', async () => {
	const accountImages = await getUserImages()
	const accountImage =
		accountImages[faker.number.int({ min: 0, max: accountImages.length - 1 })]
	const account = await prisma.account.create({
		select: { id: true, handle: true, name: true },
		data: { ...createUser(), image: { create: accountImage } },
	})
	const session = await prisma.session.create({
		select: { id: true },
		data: {
			expirationDate: getSessionExpirationDate(),
			accountId: account.id,
		},
	})

	const authSession = await authSessionStorage.getSession()
	authSession.set(sessionKey, session.id)
	const setCookieHeader = await authSessionStorage.commitSession(authSession)
	const parsedCookie = setCookieParser.parseString(setCookieHeader)
	const cookieHeader = new URLSearchParams({
		[parsedCookie.name]: parsedCookie.value,
	}).toString()

	const App = createRemixStub([
		{
			id: 'root',
			path: '/',
			loader: async args => {
				// add the cookie header to the request
				args.request.headers.set('cookie', cookieHeader)
				return rootLoader(args)
			},
			children: [
				{
					path: 'accounts/:handle',
					Component: HandleRoute,
					loader: async args => {
						// add the cookie header to the request
						args.request.headers.set('cookie', cookieHeader)
						return loader(args)
					},
				},
			],
		},
	])

	const routeUrl = `/accounts/${account.handle}`
	await render(<App initialEntries={[routeUrl]} />)

	await screen.findByRole('heading', { level: 1, name: account.name! })
	await screen.findByRole('img', { name: account.name! })
	await screen.findByRole('button', { name: /logout/i })
	await screen.findByRole('link', { name: /my notes/i })
	await screen.findByRole('link', { name: /edit profile/i })
})
