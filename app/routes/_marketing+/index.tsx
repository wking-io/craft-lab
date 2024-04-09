import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import * as E from '@react-email/components'
import { type ActionFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Form, json, useActionData } from '@remix-run/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { ErrorList, Field } from '#app/components/forms.js'
import { StatusButton } from '#app/components/ui/status-button.js'
import { EmailSchema } from '#app/utils/account-validation.js'
import { prisma } from '#app/utils/db.server.js'
import { checkHoneypot } from '#app/utils/honeypot.server.js'
import { useIsPending } from '#app/utils/misc.js'

export const meta: MetaFunction = () => [{ title: 'Craft Lab' }]

const WaitlistFormSchema = z.object({
	email: EmailSchema,
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	checkHoneypot(formData)

	const submission = await parseWithZod(formData, {
		schema: WaitlistFormSchema.superRefine(async (data, ctx) => {
			const existingUser = await prisma.account.findUnique({
				where: { email: data.email },
				select: { id: true },
			})
			if (existingUser) {
				ctx.addIssue({
					path: ['email'],
					code: z.ZodIssueCode.custom,
					message: 'A user already exists with this email',
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
		type: 'onboarding',
		target: email,
	})

	const response = await sendEmail({
		to: email,
		subject: `Welcome to Epic Notes!`,
		react: <SignupEmail onboardingUrl={verifyUrl.toString()} otp={otp} />,
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
	onboardingUrl,
	otp,
}: {
	onboardingUrl: string
	otp: string
}) {
	return (
		<E.Html lang="en" dir="ltr">
			<E.Container>
				<h1>
					<E.Text>Welcome to Epic Notes!</E.Text>
				</h1>
				<p>
					<E.Text>
						Here's your verification code: <strong>{otp}</strong>
					</E.Text>
				</p>
				<p>
					<E.Text>Or click the link to get started:</E.Text>
				</p>
				<E.Link href={onboardingUrl}>{onboardingUrl}</E.Link>
			</E.Container>
		</E.Html>
	)
}

export default function Index() {
	const actionData = useActionData<typeof action>()
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
		<main className="font-poppins grid h-full place-items-center">
			<h1>A community for Design Engineers by Design Engineers.</h1>
			<Form method="POST" {...getFormProps(form)}>
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
		</main>
	)
}
