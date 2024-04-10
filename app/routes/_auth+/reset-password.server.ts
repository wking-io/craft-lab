import { invariant } from '@epic-web/invariant'
import { json, redirect } from '@remix-run/node'
import { prisma } from '#app/utils/db.server.ts'
import { verifySessionStorage } from '#app/utils/verification.server.ts'
import { resetPasswordHandleSessionKey } from './reset-password.tsx'
import { type VerifyFunctionArgs } from './verify.server.ts'

export async function handleVerification({ submission }: VerifyFunctionArgs) {
	invariant(
		submission.status === 'success',
		'Submission should be successful by now',
	)
	const target = submission.value.target
	const account = await prisma.account.findFirst({
		where: { OR: [{ email: target }, { handle: target }] },
		select: { email: true, handle: true },
	})
	// we don't want to say the account is not found if the email is not found
	// because that would allow an attacker to check if an email is registered
	if (!account) {
		return json(
			{ result: submission.reply({ fieldErrors: { code: ['Invalid code'] } }) },
			{ status: 400 },
		)
	}

	const verifySession = await verifySessionStorage.getSession()
	verifySession.set(resetPasswordHandleSessionKey, account.handle)
	return redirect('/reset-password', {
		headers: {
			'set-cookie': await verifySessionStorage.commitSession(verifySession),
		},
	})
}
