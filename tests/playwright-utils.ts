import { test as base } from '@playwright/test'
import { type Account as AccountModel } from '@prisma/client'
import * as setCookieParser from 'set-cookie-parser'
import {
	getPasswordHash,
	getSessionExpirationDate,
	sessionKey,
} from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { authSessionStorage } from '#app/utils/session.server.ts'
import { createAccount } from './db-utils.ts'

export * from './db-utils.ts'

type GetOrInsertAccountOptions = {
	id?: string
	handle?: AccountModel['handle']
	password?: string
	email?: AccountModel['email']
}

type Account = {
	id: string
	email: string
	handle: string
	name: string
}

async function getOrInsertAccount({
	id,
	handle,
	password,
	email,
}: GetOrInsertAccountOptions = {}): Promise<Account> {
	const select = { id: true, email: true, handle: true, name: true }
	if (id) {
		return await prisma.account.findUniqueOrThrow({
			select,
			where: { id: id },
		})
	} else {
		const accountData = createAccount()
		handle ??= accountData.handle
		password ??= accountData.handle
		email ??= accountData.email

		// Start a transaction
		return await prisma.$transaction(async tx => {
			const account = await tx.account.create({
				select,
				data: {
					email: email!,
					handle: handle!,
					name: accountData.name,
					password: { create: { hash: await getPasswordHash(password!) } },
				},
			})

			const group = await tx.group.create({
				data: {
					name: `${accountData.name}'s Group`,
					account: {
						connect: { id: account.id },
					},
				},
			})

			// Create the profile and link to both the account and the group
			await tx.profile.create({
				select: { name: true },
				data: {
					account: {
						connect: { id: account.id },
					},
					group: {
						connect: { id: group.id },
					},
				},
			})

			return account
		})
	}
}

export const test = base.extend<{
	insertNewAccount(options?: GetOrInsertAccountOptions): Promise<Account>
	login(options?: GetOrInsertAccountOptions): Promise<Account>
}>({
	insertNewAccount: async ({}, use) => {
		let accountId: string | undefined = undefined
		await use(async options => {
			const account = await getOrInsertAccount(options)
			accountId = account.id
			return account
		})
		await prisma.account.delete({ where: { id: accountId } }).catch(() => {})
	},
	login: async ({ page }, use) => {
		let accountId: string | undefined = undefined
		await use(async options => {
			const account = await getOrInsertAccount(options)
			accountId = account.id
			const session = await prisma.session.create({
				data: {
					expirationDate: getSessionExpirationDate(),
					accountId: account.id,
				},
				select: { id: true },
			})

			const authSession = await authSessionStorage.getSession()
			authSession.set(sessionKey, session.id)
			const cookieConfig = setCookieParser.parseString(
				await authSessionStorage.commitSession(authSession),
			) as any
			await page
				.context()
				.addCookies([{ ...cookieConfig, domain: 'localhost' }])
			return account
		})
		await prisma.account.deleteMany({ where: { id: accountId } })
	},
})
export const { expect } = test

/**
 * This allows you to wait for something (like an email to be available).
 *
 * It calls the callback every 50ms until it returns a value (and does not throw
 * an error). After the timeout, it will throw the last error that was thrown or
 * throw the error message provided as a fallback
 */
export async function waitFor<ReturnValue>(
	cb: () => ReturnValue | Promise<ReturnValue>,
	{
		errorMessage,
		timeout = 5000,
	}: { errorMessage?: string; timeout?: number } = {},
) {
	const endTime = Date.now() + timeout
	let lastError: unknown = new Error(errorMessage)
	while (Date.now() < endTime) {
		try {
			const response = await cb()
			if (response) return response
		} catch (e: unknown) {
			lastError = e
		}
		await new Promise(r => setTimeout(r, 100))
	}
	throw lastError
}
