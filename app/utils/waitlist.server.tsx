import { parseWithZod } from '@conform-to/zod'
import { json, redirect } from '@remix-run/node'
import { z } from 'zod'
import { WaitlistFormSchema, WaitlistEmail } from '#app/components/waitlist.js'
import { prepareVerification } from '#app/routes/_auth+/verify.server'
import { prisma } from '#app/utils/db.server.js'
import { sendEmail } from '#app/utils/email.server.js'
import { checkHoneypot } from '#app/utils/honeypot.server.js'

export async function submitWaitlist({ request }: { request: Request }) {
	const formData = await request.formData()

	checkHoneypot(formData)

	const submission = await parseWithZod(formData, {
		schema: WaitlistFormSchema.superRefine(async (data, ctx) => {
			const pExistingAccount = prisma.account.findUnique({
				where: { email: data.email },
				select: { id: true },
			})
			const pExistingWaitlistMember = prisma.waitlistMember.findUnique({
				where: { email: data.email },
				select: { id: true },
			})

			const [existingAccount, existingWaitlistMember] = await Promise.all([
				pExistingAccount,
				pExistingWaitlistMember,
			])

			if (existingAccount) {
				ctx.addIssue({
					path: ['email'],
					code: z.ZodIssueCode.custom,
					message: 'A account already exists with this email',
				})
				return
			}

			if (existingWaitlistMember) {
				ctx.addIssue({
					path: ['email'],
					code: z.ZodIssueCode.custom,
					message: 'A waitlist member already exists with this email',
				})
				return
			}
		}),
		async: true,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}
	const { email } = submission.value

	const { verifyUrl, redirectTo, otp } = await prepareVerification({
		period: 10 * 60,
		request,
		type: 'waitlist',
		target: email,
	})

	const response = await sendEmail({
		to: email,
		subject: `Verify email to lock in your waitlist reward!`,
		react: (
			<WaitlistEmail waitlistVerificationUrl={verifyUrl.toString()} otp={otp} />
		),
	})

	if (response.status === 'success') {
		return redirect(redirectTo.toString())
	} else {
		return json(
			{
				result: submission.reply({ formErrors: [response.error.message] }),
			},
			{
				status: 500,
			},
		)
	}
}
