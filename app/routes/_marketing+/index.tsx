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
					A community built for incredible Design Engineers
				</h1>
				<p className={clsx('relative mt-3 px-2 py-1')}>
					Come help us build a space where the goal is to learn and share
					everything about your craft and have fun doing it.
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
			<h3>Objectives</h3>
			<h2>Collaborate daily on what matters</h2>
			<p>
				Start every day sharing what you're working on. That objective will now
				be available for tracking progress and having conversations focused
				around it.
			</p>
			<h3>Milestones</h3>
			<h2>Plan your long term growth</h2>
			<p>
				A community can't help you if we don't know where you are headed. Use
				milestones to share your big goal for the year, and what you are doing
				this quarter to achieve it.
			</p>
			<h3>Signals</h3>
			<h2>Targeted help when you need it</h2>
			<p>
				A wide range of expertise in the community gives you access to the right
				kind of help when you need it. Signals everyone know that you are
				looking for active feedback to get past hurdles that come up.
			</p>
			<h3>Library</h3>
			<h2>The best resources from people who get it</h2>
			<p>
				Submit your favorite resources and access the ones that have been shared
				by the rest of us. A library of trusted and tried information...it
				doesn't get better than that.
			</p>
			<h3>Threads</h3>
			<h2>Let's not forget we want to have fun</h2>
			<p>
				Threads is a space for fun and community. It is a group chat with a ton
				of people who care about the things you do both professionally and
				creatively.
			</p>
			<h3>A Playground for Ideas</h3>
			<h2>You can help build the platform yourself</h2>
			<p>
				The value is you. This platform is open source for anyone to read, but
				Members get full access to contribute to the design and development of
				making this space something really special.
			</p>

			<h3>Did I mention membership cards yet?</h3>
			<h2>
				Get an exclusive membership card variant when you join the waitlist
			</h2>
			<p>
				This community is about exploring the craft of design engineering with
				others, making each other better, and having fun while we do it.
			</p>
			<p>
				Not every idea or project has the space to be explored in our day jobs.
				So, let's do that here. Membership cards are an example of this.
			</p>
			<p>
				Variants will be custom generative graphics that are unique to only you.
				The designs are keyed off of your account information, and if you join
				the waitlist you will have a variant only available to you.
			</p>
			<p>
				Also, the goal is for members to be able to contribute new variants to
				be made available to everyone if that is a area that is interesting to
				you.
			</p>
		</main>
	)
}
