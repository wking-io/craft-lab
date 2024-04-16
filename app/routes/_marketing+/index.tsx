import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import * as E from '@react-email/components'
import { type ActionFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Form, json, redirect, useActionData } from '@remix-run/react'
import clsx from 'clsx'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { ErrorList, Field } from '#app/components/forms.js'
import { Logo } from '#app/components/logo.js'
import { StatusButton } from '#app/components/ui/status-button.js'
import { rootRouteId } from '#app/root.js'
import { EmailSchema } from '#app/utils/account-validation.js'
import { prisma } from '#app/utils/db.server.js'
import { sendEmail } from '#app/utils/email.server.js'
import { checkHoneypot } from '#app/utils/honeypot.server.js'
import { useIsPending } from '#app/utils/misc.js'
import { useRouteIdLoaderData } from '#app/utils/route-id.js'
import { prepareVerification } from '../_auth+/verify.server'

export const meta: MetaFunction = () => [{ title: 'Craft Lab' }]

const WaitlistFormSchema = z.object({
	email: EmailSchema,
})

export async function action({ request }: ActionFunctionArgs) {
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
		subject: `Welcome to Epic Notes!`,
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

export function WaitlistEmail({
	waitlistVerificationUrl,
	otp,
}: {
	waitlistVerificationUrl: string
	otp: string
}) {
	return (
		<E.Html lang="en" dir="ltr">
			<E.Container>
				<h1>
					<E.Text>OHHhh yeah!</E.Text>
				</h1>
				<p>
					<E.Text>
						This community is going to be a blast, and I cannot wait for you to
						see it.
					</E.Text>
				</p>
				<p>
					<E.Text>
						Here's your verification code: <strong>{otp}</strong>
					</E.Text>
				</p>
				<p>
					<E.Text>Or click the link to get started:</E.Text>
				</p>
				<E.Link href={waitlistVerificationUrl}>
					{waitlistVerificationUrl}
				</E.Link>
			</E.Container>
		</E.Html>
	)
}

// const gridLines =
// 	'before:absolute before:left-1/2 before:right-1/2 before:top-0 before:-ml-[50vw] before:-mr-[50vw] before:h-0 before:w-screen before:border-t after:absolute after:left-1/2 after:right-1/2 after:bottom-0 after:-ml-[50vw] after:-mr-[50vw] after:h-0 after:w-screen after:border-t'

export default function Index() {
	const actionData = useActionData<typeof action>()
	const { seed } = useRouteIdLoaderData(rootRouteId)
	const isPending = useIsPending()

	const [form, fields] = useForm({
		id: 'waitlist-form',
		constraint: getZodConstraint(WaitlistFormSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: WaitlistFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<main className="h-full">
			<nav className="flex justify-between gap-8 px-4 py-2">
				<div className={clsx('relative flex items-center gap-2')}>
					<Logo seed={seed} className="h-auto w-6" />
					<p className="text-xl font-semibold tracking-tight">Craft Lab</p>
				</div>
			</nav>
			<div className="max-w-2xl self-center">
				<h1 className={clsx('relative mt-8 px-2 py-1 font-semibold')}>
					# A community for Design Engineers by Design Engineers.
				</h1>
				<p className={clsx('relative mt-3 px-2 py-1')}>
					There are only <span className="underline">8</span> spots left for the
					alpha group to help get this space off of the ground. Get on the
					waitlist and let's chat 👇
				</p>
				<Form
					method="POST"
					{...getFormProps(form)}
					className={clsx('relative mt-6 px-2 pb-2 pt-1')}
				>
					<HoneypotInputs />
					<Field
						labelProps={{
							htmlFor: fields.email.id,
							children: 'Email',
						}}
						inputProps={{
							...getInputProps(fields.email, { type: 'email' }),
							autoFocus: true,
							autoComplete: 'email',
							placeholder: 'design@engineer.awesome',
							className: 'placeholder:text-primary/40 mt-1 border-primary',
						}}
						errors={fields.email.errors}
					/>
					<ErrorList errors={form.errors} id={form.errorId} />
					<StatusButton
						className="w-full"
						status={isPending ? 'pending' : form.status ?? 'idle'}
						type="submit"
						disabled={isPending}
					>
						Submit
					</StatusButton>
				</Form>
			</div>
		</main>
	)
}
