import {
	type Connection,
	type Password,
	type Account,
	type Group,
} from '@prisma/client'
import { redirect } from '@remix-run/node'
import bcrypt from 'bcryptjs'
import { Authenticator } from 'remix-auth'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { connectionSessionStorage, providers } from './connections.server.ts'
import { prisma } from './db.server.ts'
import { combineHeaders, downloadFile } from './misc.tsx'
import { type ProviderAccount } from './providers/provider.ts'
import { authSessionStorage } from './session.server.ts'

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30
export const getSessionExpirationDate = () =>
	new Date(Date.now() + SESSION_EXPIRATION_TIME)

export const sessionKey = 'sessionId'

export const authenticator = new Authenticator<ProviderAccount>(
	connectionSessionStorage,
)

for (const [providerName, provider] of Object.entries(providers)) {
	authenticator.use(provider.getAuthStrategy(), providerName)
}

export async function getAccountId(request: Request) {
	const authSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	)
	const sessionId = authSession.get(sessionKey)
	if (!sessionId) return null
	const session = await prisma.session.findUnique({
		select: { account: { select: { id: true } } },
		where: { id: sessionId, expirationDate: { gt: new Date() } },
	})
	if (!session?.account) {
		throw redirect('/', {
			headers: {
				'set-cookie': await authSessionStorage.destroySession(authSession),
			},
		})
	}
	return session.account.id
}

export async function requireAccountId(
	request: Request,
	{ redirectTo }: { redirectTo?: string | null } = {},
) {
	const accountId = await getAccountId(request)
	if (!accountId) {
		const requestUrl = new URL(request.url)
		redirectTo =
			redirectTo === null
				? null
				: redirectTo ?? `${requestUrl.pathname}${requestUrl.search}`
		const loginParams = redirectTo ? new URLSearchParams({ redirectTo }) : null
		const loginRedirect = ['/login', loginParams?.toString()]
			.filter(Boolean)
			.join('?')
		throw redirect(loginRedirect)
	}
	return accountId
}

export async function requireAnonymous(request: Request) {
	const accountId = await getAccountId(request)
	if (accountId) {
		throw redirect('/dashboard')
	}
}

export async function login({
	handle,
	password,
}: {
	handle: Account['handle']
	password: string
}) {
	const account = await verifyAccountPassword({ handle }, password)
	if (!account) return null
	const session = await prisma.session.create({
		select: { id: true, expirationDate: true, accountId: true },
		data: {
			expirationDate: getSessionExpirationDate(),
			accountId: account.id,
		},
	})
	return session
}

export async function resetAccountPassword({
	handle,
	password,
}: {
	handle: Account['handle']
	password: string
}) {
	const hashedPassword = await getPasswordHash(password)
	return prisma.account.update({
		where: { handle },
		data: {
			password: {
				update: {
					hash: hashedPassword,
				},
			},
		},
	})
}

export async function signup({
	email,
	handle,
	password,
	name,
	groupId,
}: {
	email: Account['email']
	handle: Account['handle']
	name: Account['name']
	password: string
	groupId: Group['id']
}) {
	const hashedPassword = await getPasswordHash(password)

	const session = await await prisma.$transaction(async tx => {
		const account = await tx.account.create({
			select: { id: true },
			data: {
				email: email.toLowerCase(),
				handle: handle.toLowerCase(),
				name,
				password: {
					create: {
						hash: hashedPassword,
					},
				},
			},
		})

		// Create the profile and link to both the account and the group
		tx.member.create({
			select: { id: true },
			data: {
				roles: { connect: { name: 'member' } },
				account: {
					connect: { id: account.id },
				},
				group: {
					connect: { id: groupId },
				},
			},
		})

		return prisma.session.create({
			data: {
				expirationDate: getSessionExpirationDate(),
				account: {
					connect: {
						id: account.id,
					},
				},
			},
			select: { id: true, expirationDate: true },
		})
	})

	return session
}

export async function signupWithConnection({
	email,
	handle,
	name,
	providerId,
	providerName,
	imageUrl,
	groupId,
}: {
	email: Account['email']
	handle: Account['handle']
	name: Account['name']
	providerId: Connection['providerId']
	providerName: Connection['providerName']
	imageUrl?: string
	groupId: string
}) {
	const session = await await prisma.$transaction(async tx => {
		const account = await tx.account.create({
			select: { id: true },
			data: {
				email: email.toLowerCase(),
				handle: handle.toLowerCase(),
				name,
				image: imageUrl ? { create: await downloadFile(imageUrl) } : undefined,

				connections: { create: { providerId, providerName } },
			},
		})

		// Create the profile and link to both the account and the group
		tx.member.create({
			select: { id: true },
			data: {
				roles: { connect: { name: 'member' } },
				account: {
					connect: { id: account.id },
				},
				group: {
					connect: { id: groupId },
				},
			},
		})

		return prisma.session.create({
			data: {
				expirationDate: getSessionExpirationDate(),
				account: {
					connect: {
						id: account.id,
					},
				},
			},
			select: { id: true, expirationDate: true },
		})
	})

	return session
}

export async function logout(
	{
		request,
		redirectTo = '/',
	}: {
		request: Request
		redirectTo?: string
	},
	responseInit?: ResponseInit,
) {
	const authSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	)
	const sessionId = authSession.get(sessionKey)
	// if this fails, we still need to delete the session from the account's browser
	// and it doesn't do any harm staying in the db anyway.
	if (sessionId) {
		// the .catch is important because that's what triggers the query.
		// learn more about PrismaPromise: https://www.prisma.io/docs/orm/reference/prisma-client-reference#prismapromise-behavior
		void prisma.session.deleteMany({ where: { id: sessionId } }).catch(() => {})
	}
	throw redirect(safeRedirect(redirectTo), {
		...responseInit,
		headers: combineHeaders(
			{ 'set-cookie': await authSessionStorage.destroySession(authSession) },
			responseInit?.headers,
		),
	})
}

export async function getPasswordHash(password: string) {
	const hash = await bcrypt.hash(password, 10)
	return hash
}

export async function verifyAccountPassword(
	where: Pick<Account, 'handle'> | Pick<Account, 'id'>,
	password: Password['hash'],
) {
	const accountWithPassword = await prisma.account.findUnique({
		where,
		select: { id: true, password: { select: { hash: true } } },
	})

	if (!accountWithPassword || !accountWithPassword.password) {
		return null
	}

	const isValid = await bcrypt.compare(
		password,
		accountWithPassword.password.hash,
	)

	if (!isValid) {
		return null
	}

	return { id: accountWithPassword.id }
}
