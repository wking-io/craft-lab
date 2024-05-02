import {
	type SubmissionResult,
	getFormProps,
	getInputProps,
	useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { Field, Input } from '@headlessui/react'
import * as E from '@react-email/components'
import { Form, useActionData } from '@remix-run/react'
import clsx from 'clsx'
import { useId } from 'react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { EmailSchema } from '#app/utils/account-validation.js'
import { useIsPending } from '#app/utils/misc.js'
import { ErrorMessage } from './ui/fieldset'
import { StatusButton } from './ui/status-button'

export const WaitlistFormSchema = z.object({
	email: EmailSchema,
})

export function WaitlistForm({
	className = 'mt-8 lg:mt-12',
}: {
	className?: string
}) {
	const actionData = useActionData<{ result: SubmissionResult<string[]> }>()
	const isPending = useIsPending()
	const id = useId()

	const [form, fields] = useForm({
		id: `waitlist-form-${id}`,
		constraint: getZodConstraint(WaitlistFormSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			console.log(Object.fromEntries(formData))
			return parseWithZod(formData, { schema: WaitlistFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<Form
			method="POST"
			{...getFormProps(form)}
			className={clsx(
				className,
				'group relative isolate w-full max-w-2xl transition',
			)}
		>
			<svg
				className="absolute -left-1.5 -top-1.5 -z-10 hidden h-[42px] w-auto -scale-y-100 text-foreground/5 opacity-0 transition group-focus-within:text-blue/10 group-focus-within:opacity-100 group-hover:opacity-100 dark:text-foreground/10 group-focus-within:dark:text-blue/20 sm:top-1.5 sm:block sm:scale-y-100"
				viewBox="0 0 125 7"
			>
				{/* Layer one */}
				<rect x="0" y="0" width="1" height="1" className="fill-current " />
				<rect x="0" y="2" width="1" height="5" className="fill-current" />
				<rect x="1" y="6" width="70" height="1" className="fill-current" />
				<rect x="73" y="6" width="2" height="1" className="fill-current" />
				<rect x="76" y="6" width="1" height="1" className="fill-current" />
				<rect x="78" y="6" width="1" height="1" className="fill-current" />
				{/* Layer two */}
				<rect x="0" y="2" width="1" height="1" className="fill-current" />
				<rect x="0" y="4" width="1" height="3" className="fill-current" />
				<rect x="1" y="6" width="40" height="1" className="fill-current" />
				<rect x="44" y="6" width="4" height="1" className="fill-current" />
				<rect x="48" y="6" width="2" height="1" className="fill-current" />
				<rect x="52" y="6" width="1" height="1" className="fill-current" />
				{/* Layer three */}
				<rect x="0" y="6" width="8" height="1" className="fill-current" />
				<rect x="10" y="6" width="4" height="1" className="fill-current" />
				<rect x="16" y="6" width="2" height="1" className="fill-current" />
				<rect x="19" y="6" width="1" height="1" className="fill-current" />
			</svg>
			<HoneypotInputs />
			<Field className="flex w-full flex-col items-start sm:flex-row">
				<label className="sr-only" htmlFor={fields.email.id}>
					Email
				</label>
				<div className="w-full flex-1">
					<Input
						{...getInputProps(fields.email, { type: 'email' })}
						placeholder="design@engineer.awesome"
						invalid={Boolean(fields.email.errors?.length)}
						className="w-full rounded-none border border-foreground bg-background px-4 py-2 leading-normal focus:outline-none"
					/>
					<ErrorMessage errors={fields.email.errors} />
					<ErrorMessage errors={form.errors} id={form.errorId} />
				</div>
				<StatusButton
					className="w-full min-w-[30%] leading-normal sm:w-auto"
					status={isPending ? 'pending' : form.status ?? 'idle'}
					type="submit"
					disabled={isPending}
				>
					Join The Waitlist
				</StatusButton>
			</Field>
		</Form>
	)
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
						Please verify your email! This community is going to be a blast, and
						I cannot wait for you to see it.
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
