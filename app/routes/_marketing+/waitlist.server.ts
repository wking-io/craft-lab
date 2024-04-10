import { invariant } from '@epic-web/invariant'
import { redirect } from '@remix-run/react'
import { prisma } from '#app/utils/db.server.js'
import { type VerifyFunctionArgs } from '../_auth+/verify.server'

export async function handleVerification({ submission }: VerifyFunctionArgs) {
	invariant(
		submission.status === 'success',
		'Submission should be successful by now',
	)
	const target = submission.value.target
	const waitlistMember = await prisma.waitlistMember.create({
		select: { email: true },
		data: {
			email: target,
		},
	})

	return redirect(`/waitlist/success?email=${waitlistMember.email}`)
}
