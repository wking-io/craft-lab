import { invariant } from '@epic-web/invariant'
import { faker } from '@faker-js/faker'
import { verifyAccountPassword } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { readEmail } from '#tests/mocks/utils.ts'
import {
	expect,
	test,
	createAccount,
	waitFor,
} from '#tests/playwright-utils.ts'

const CODE_REGEX = /Here's your verification code: (?<code>[\d\w]+)/

test('Users can update their basic info', async ({ page, login }) => {
	await login()
	await page.goto('/settings/profile')

	const newUserData = createAccount()

	await page.getByRole('textbox', { name: /^name/i }).fill(newUserData.name)
	await page.getByRole('textbox', { name: /^handle/i }).fill(newUserData.handle)

	await page.getByRole('button', { name: /^save/i }).click()
})

test('Users can update their password', async ({ page, login }) => {
	const oldPassword = faker.internet.password()
	const newPassword = faker.internet.password()
	const account = await login({ password: oldPassword })
	await page.goto('/settings/profile')

	await page.getByRole('link', { name: /change password/i }).click()

	await page
		.getByRole('textbox', { name: /^current password/i })
		.fill(oldPassword)
	await page.getByRole('textbox', { name: /^new password/i }).fill(newPassword)
	await page
		.getByRole('textbox', { name: /^confirm new password/i })
		.fill(newPassword)

	await page.getByRole('button', { name: /^change password/i }).click()

	await expect(page).toHaveURL(`/settings/profile`)

	const { handle } = account
	expect(
		await verifyAccountPassword({ handle }, oldPassword),
		'Old password still works',
	).toEqual(null)
	expect(
		await verifyAccountPassword({ handle }, newPassword),
		'New password does not work',
	).toEqual({ id: account.id })
})

test('Users can update their profile photo', async ({ page, login }) => {
	const account = await login()
	await page.goto('/settings/profile')

	const beforeSrc = await page
		.getByRole('img', { name: account.name ?? account.handle })
		.getAttribute('src')

	await page.getByRole('link', { name: /change profile photo/i }).click()

	await expect(page).toHaveURL(`/settings/profile/photo`)

	await page
		.getByRole('textbox', { name: /change/i })
		.setInputFiles('./tests/fixtures/images/account/kody.png')

	await page.getByRole('button', { name: /save/i }).click()

	await expect(
		page,
		'Was not redirected after saving the profile photo',
	).toHaveURL(`/settings/profile`)

	const afterSrc = await page
		.getByRole('img', { name: account.name ?? account.handle })
		.getAttribute('src')

	expect(beforeSrc).not.toEqual(afterSrc)
})

test('Users can change their email address', async ({ page, login }) => {
	const preUpdateUser = await login()
	const newEmailAddress = faker.internet.email().toLowerCase()
	expect(preUpdateUser.email).not.toEqual(newEmailAddress)
	await page.goto('/settings/profile')
	await page.getByRole('link', { name: /change email/i }).click()
	await page.getByRole('textbox', { name: /new email/i }).fill(newEmailAddress)
	await page.getByRole('button', { name: /send confirmation/i }).click()
	await expect(page.getByText(/check your email/i)).toBeVisible()
	const email = await waitFor(() => readEmail(newEmailAddress), {
		errorMessage: 'Confirmation email was not sent',
	})
	invariant(email, 'Email was not sent')
	const codeMatch = email.text.match(CODE_REGEX)
	const code = codeMatch?.groups?.code
	invariant(code, 'Onboarding code not found')
	await page.getByRole('textbox', { name: /code/i }).fill(code)
	await page.getByRole('button', { name: /submit/i }).click()
	await expect(page.getByText(/email changed/i)).toBeVisible()

	const updatedUser = await prisma.account.findUnique({
		where: { id: preUpdateUser.id },
		select: { email: true },
	})
	invariant(updatedUser, 'Updated account not found')
	expect(updatedUser.email).toBe(newEmailAddress)
	const noticeEmail = await waitFor(() => readEmail(preUpdateUser.email), {
		errorMessage: 'Notice email was not sent',
	})
	expect(noticeEmail.subject).toContain('changed')
})
