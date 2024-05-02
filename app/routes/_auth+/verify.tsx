import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { Input, Field } from '@headlessui/react'
import { type MetaFunction, type ActionFunctionArgs } from '@remix-run/node'
import { Form, useActionData, useSearchParams } from '@remix-run/react'
import clsx from 'clsx'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { ErrorMessage } from '#app/components/ui/fieldset.js'
import { StatusButton } from '#app/components/ui/status-button.js'
import { checkHoneypot } from '#app/utils/honeypot.server.ts'
import { useIsPending } from '#app/utils/misc.tsx'
import { seoData } from '#app/utils/seo.js'
import { validateRequest } from './verify.server.ts'

export const codeQueryParam = 'code'
export const targetQueryParam = 'target'
export const typeQueryParam = 'type'
export const redirectToQueryParam = 'redirectTo'
const types = [
	'onboarding',
	'reset-password',
	'change-email',
	'2fa',
	'waitlist',
	'invite',
] as const
const VerificationTypeSchema = z.enum(types)
export type VerificationTypes = z.infer<typeof VerificationTypeSchema>

export const VerifySchema = z.object({
	[codeQueryParam]: z.string().min(6).max(6),
	[typeQueryParam]: VerificationTypeSchema,
	[targetQueryParam]: z.string(),
	[redirectToQueryParam]: z.string().optional(),
})

export const meta: MetaFunction = () =>
	seoData({
		title: 'Craft Lab • Verify one-time code',
		description:
			'Help us build a space where we learn and share everything about our craft and have fun doing it.',
	})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	checkHoneypot(formData)
	return validateRequest(request, formData)
}

export default function VerifyRoute() {
	const [searchParams] = useSearchParams()
	const isPending = useIsPending()
	const actionData = useActionData<typeof action>()
	const parseWithZoddType = VerificationTypeSchema.safeParse(
		searchParams.get(typeQueryParam),
	)
	const type = parseWithZoddType.success ? parseWithZoddType.data : null

	const checkEmail = (
		<>
			<h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl">
				Check your email
			</h1>
			<p className="mt-3 text-pretty text-body-md text-primary/70">
				We've sent you a code to verify your email address.
			</p>
		</>
	)

	const headings: Record<VerificationTypes, React.ReactNode> = {
		invite: checkEmail,
		waitlist: checkEmail,
		onboarding: checkEmail,
		'reset-password': checkEmail,
		'change-email': checkEmail,
		'2fa': (
			<>
				<h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl">
					Check your 2FA app
				</h1>
				<p className="mt-3 text-pretty text-body-md text-primary/70">
					Please enter your 2FA code to verify your identity.
				</p>
			</>
		),
	}

	const [form, fields] = useForm({
		id: 'verify-form',
		constraint: getZodConstraint(VerifySchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: VerifySchema })
		},
		defaultValue: {
			code: searchParams.get(codeQueryParam),
			type: type,
			target: searchParams.get(targetQueryParam),
			redirectTo: searchParams.get(redirectToQueryParam),
		},
	})

	return (
		<main className="dark flex min-h-screen flex-col items-center justify-center bg-background pb-32 pt-20 text-primary">
			<div className="container px-6">
				<div className="text-center">
					{type ? headings[type] : 'Invalid Verification Type'}
				</div>
				<div className="flex w-full justify-center gap-2">
					<Form
						method="POST"
						{...getFormProps(form)}
						className={clsx(
							'group relative isolate mt-8 w-full max-w-md transition lg:mt-12',
						)}
					>
						<svg
							className="absolute -left-1.5 -top-1.5 -z-10 h-[42px] w-auto -scale-y-100 text-primary/5 opacity-0 transition group-focus-within:text-blue/10 group-focus-within:opacity-100 group-hover:opacity-100 sm:top-1.5 sm:scale-y-100"
							viewBox="0 0 125 7"
						>
							{/* Layer one */}
							<rect
								x="0"
								y="0"
								width="1"
								height="1"
								className="fill-current "
							/>
							<rect x="0" y="2" width="1" height="5" className="fill-current" />
							<rect
								x="1"
								y="6"
								width="50"
								height="1"
								className="fill-current"
							/>
							<rect
								x="53"
								y="6"
								width="2"
								height="1"
								className="fill-current"
							/>
							<rect
								x="56"
								y="6"
								width="1"
								height="1"
								className="fill-current"
							/>
							<rect
								x="58"
								y="6"
								width="1"
								height="1"
								className="fill-current"
							/>
							{/* Layer two */}
							<rect x="0" y="2" width="1" height="1" className="fill-current" />
							<rect x="0" y="4" width="1" height="3" className="fill-current" />
							<rect
								x="1"
								y="6"
								width="40"
								height="1"
								className="fill-current"
							/>
							<rect
								x="24"
								y="6"
								width="4"
								height="1"
								className="fill-current"
							/>
							<rect
								x="28"
								y="6"
								width="2"
								height="1"
								className="fill-current"
							/>
							<rect
								x="32"
								y="6"
								width="1"
								height="1"
								className="fill-current"
							/>
							{/* Layer three */}
							<rect x="0" y="6" width="8" height="1" className="fill-current" />
							<rect
								x="10"
								y="6"
								width="4"
								height="1"
								className="fill-current"
							/>
							<rect
								x="16"
								y="6"
								width="2"
								height="1"
								className="fill-current"
							/>
							<rect
								x="19"
								y="6"
								width="1"
								height="1"
								className="fill-current"
							/>
						</svg>
						<HoneypotInputs />
						<input
							{...getInputProps(fields[typeQueryParam], { type: 'hidden' })}
						/>
						<input
							{...getInputProps(fields[targetQueryParam], { type: 'hidden' })}
						/>
						<input
							{...getInputProps(fields[redirectToQueryParam], {
								type: 'hidden',
							})}
						/>
						<Field className="flex w-full flex-col items-start sm:flex-row">
							<label className="sr-only" htmlFor={fields[codeQueryParam].id}>
								Email
							</label>
							<div className="w-full flex-1">
								<Input
									{...getInputProps(fields[codeQueryParam], { type: 'text' })}
									autoComplete="one-time-code"
									placeholder="Enter code"
									invalid={Boolean(fields[codeQueryParam].errors?.length)}
									className="w-full border border-foreground bg-background px-4 py-2 focus:outline-none"
								/>
								<ErrorMessage errors={fields[codeQueryParam].errors} />
								<ErrorMessage errors={form.errors} id={form.errorId} />
							</div>
							<StatusButton
								className="w-full min-w-[30%] sm:w-auto"
								status={isPending ? 'pending' : form.status ?? 'idle'}
								type="submit"
								disabled={isPending}
							>
								Submit Code
							</StatusButton>
						</Field>
					</Form>
				</div>
			</div>
		</main>
	)
}
export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
