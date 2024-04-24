import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { Field, Input } from '@headlessui/react'
import * as E from '@react-email/components'
import { type ActionFunctionArgs, type MetaFunction } from '@remix-run/node'
import {
	Form,
	json,
	redirect,
	useActionData,
	useLoaderData,
} from '@remix-run/react'
import clsx from 'clsx'
import QR from 'qrcode'
import { type PropsWithChildren } from 'react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { ErrorMessage } from '#app/components/catalyst/fieldset.js'
import { Logo } from '#app/components/logo.js'
import MemberCard from '#app/components/member-card.js'
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

export async function loader() {
	return json({
		qrcode: await QR.toDataURL('https://mubs.me/', {
			color: { light: '#09090b', dark: '#fff' },
		}),
	})
}
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

export default function Index() {
	const { qrcode } = useLoaderData<typeof loader>()
	const { seed } = useRouteIdLoaderData(rootRouteId)

	return (
		<main className="h-full">
			<div className="container flex flex-col py-8 md:py-12 lg:py-16">
				<div className={clsx('relative flex gap-3')}>
					<Logo seed={seed} className="h-auto w-8" />
					<p className="text-3xl font-semibold tracking-tight">Craft Lab</p>
				</div>
				<h1 className="relative mt-8 max-w-2xl text-balance text-5xl font-semibold leading-tight">
					A community built for Incredible Design Engineers
				</h1>
				<p className="mt-5 text-secondary md:text-lg xl:text-xl">
					Help us build a space where we learn and share everything about our
					craft and have fun doing it.
				</p>
				<WaitlistForm />
			</div>
			<section className="container">
				<div className="-mx-5 grid grid-cols-3 gap-6 py-8 md:gap-y-8 lg:gap-y-8">
					<div className="grid max-w-sm px-5 py-6">
						<div className="max-w-xl">
							<FeatureName color="text-pink">Objectives</FeatureName>
							<h2 className="mt-4 text-balance text-xl font-semibold">
								Collaborate daily on what matters
							</h2>
							<p className="mt-4 text-pretty text-secondary">
								Start every day sharing what you're working on. That objective
								will now be available for tracking progress and having
								conversations focused around it.
							</p>
						</div>
					</div>
					<div className="grid max-w-sm px-5 py-6">
						<div className="max-w-xl justify-self-end">
							<FeatureName color="text-yellow">Milestones</FeatureName>
							<h2 className="mt-4 text-balance text-xl font-semibold">
								Plan your long term growth
							</h2>
							<p className="mt-4 text-pretty text-secondary">
								A community can't help you if we don't know where you are
								headed. Use milestones to share your big goal for the year, and
								what you are doing this quarter to achieve it.
							</p>
						</div>
					</div>
					<div className="grid max-w-sm px-5 py-6">
						<div className="max-w-xl">
							<FeatureName color="text-lime">Signals</FeatureName>
							<h2 className="mt-4 text-balance text-xl font-semibold">
								Targeted help when you need it
							</h2>
							<p className="mt-4 text-pretty text-secondary">
								A wide range of expertise in the community gives you access to
								the right kind of help when you need it. Signals everyone know
								that you are looking for active feedback to get past hurdles
								that come up.
							</p>
						</div>
					</div>

					<div className="grid max-w-sm px-5 py-6">
						<div className="max-w-xl justify-self-end">
							<FeatureName color="text-green">Library</FeatureName>
							<h2 className="mt-4 text-balance text-xl font-semibold">
								Curated resources from the best people
							</h2>
							<p className="mt-4 text-pretty text-secondary">
								Submit your favorite resources and access the ones that have
								been shared by the rest of us. A library of trusted and tried
								information...it doesn't get better than that.
							</p>
						</div>
					</div>

					<div className="grid max-w-sm px-5 py-6">
						<div className="max-w-xl">
							<FeatureName color="text-blue">Threads</FeatureName>
							<h2 className="mt-4 text-balance text-xl font-semibold">
								Let's not forget we want to have fun
							</h2>
							<p className="mt-4 text-pretty text-secondary">
								Threads is a space for fun and community. It is a group chat
								with a ton of people who care about the things you do both
								professionally and creatively.
							</p>
						</div>
					</div>

					<div className="dark group relative flex max-w-sm flex-col bg-background px-5 py-6">
						<svg
							className="absolute right-0 top-0 h-[24px] w-[24px]"
							viewBox="0 0 4 4"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<rect
								className="fill-current text-foreground"
								x="0"
								y="0"
								width="4"
								height="4"
							/>
							<path
								d="M 0 0 H 2 V 1 H 3 V 2 H 4 V 4 H 0 V 0 Z"
								className="fill-current text-background"
							/>
						</svg>
						<PlaygroundHoverSVG className="absolute right-0 top-0 opacity-0 transition group-hover:opacity-100" />
						<div className="flex-1">
							<FeatureName color="text-foreground">
								Playground for Ideas
							</FeatureName>
							<div className="">
								<h2 className="mt-4 text-pretty text-xl font-semibold text-foreground">
									Help build the platform yourself
								</h2>
								<p className="mt-4 text-pretty text-secondary">
									Members get full access to contribute to the design and
									development of making this space something really special.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>
			<section className="container flex items-center gap-8 py-8 md:gap-12 md:py-12 lg:gap-16 lg:py-16">
				<div>
					<MemberCard seed={seed} qrcode={qrcode} />
				</div>
				<div>
					<h3 className="font-mono font-semibold">
						Did I mention the membership cards yet?
					</h3>
					<h2 className="relative mt-3 max-w-4xl text-balance text-5xl font-semibold leading-tight">
						Only waitlist members will get the holographic overlay.
					</h2>
					<p className="mt-5 max-w-3xl text-pretty text-secondary md:text-lg xl:text-xl">
						This community is about exploring the craft of design engineering
						with others, making each other better, and having fun while we do
						it. Not every idea or project has the space to be explored in our
						day jobs. So, let's do that here. Membership cards are an example of
						this.
					</p>
					<WaitlistForm />
				</div>
			</section>
		</main>
	)
}

function FeatureName({
	color,
	children,
}: PropsWithChildren<{ color: `text-${string}` }>) {
	return (
		<h3 className="relative inline-flex items-center gap-1 border border-foreground py-0.5 pl-2 pr-2.5 font-mono text-xs font-semibold uppercase text-foreground">
			<span className="absolute -left-px -top-px h-1.5 w-1.5 border border-b-foreground border-l-background border-r-foreground border-t-background bg-background" />
			<span className="absolute -bottom-px -left-px h-1.5 w-1.5 border border-b-background border-l-background border-r-foreground border-t-foreground bg-background" />
			<span className="absolute -right-px -top-px h-1.5 w-1.5 border border-b-foreground border-l-foreground border-r-background border-t-background bg-background" />
			<span className="absolute -bottom-px -right-px h-1.5 w-1.5 border border-b-background border-l-foreground border-r-background border-t-foreground bg-background" />
			<svg
				className={clsx(color, 'h-3 w-3')}
				viewBox="0 0 12 12"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M 0 3 H 3 V 0 H 9 V 3 H 12 V 9 H 9 V 12 H 3 V 9 H 0 V 3 Z"
					className="fill-current"
				/>
			</svg>
			{children}
		</h3>
	)
}

function PlaygroundHoverSVG({ className }: { className?: string }) {
	return (
		<svg
			width="66"
			height="72"
			viewBox="0 0 66 72"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<rect x="48" width="6" height="6" fill="white" fillOpacity="0.5" />
			<rect x="42" y="6" width="6" height="6" fill="white" fillOpacity="0.4" />
			<rect x="36" width="6" height="6" fill="white" fillOpacity="0.5" />
			<rect x="24" width="6" height="6" fill="white" fillOpacity="0.3" />
			<rect x="12" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="12" y="12" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="24" y="18" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="36" y="24" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="24" y="24" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="30" y="36" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="24" y="42" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="36" y="42" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="42" y="54" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="18" y="30" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="30" y="6" width="6" height="6" fill="white" fillOpacity="0.4" />
			<rect x="24" y="6" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="36" y="12" width="6" height="6" fill="white" fillOpacity="0.3" />
			<rect x="18" y="12" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="42" y="18" width="6" height="6" fill="white" fillOpacity="0.3" />
			<rect x="30" y="18" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="48" y="24" width="6" height="6" fill="white" fillOpacity="0.3" />
			<rect x="42" y="24" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="54" y="6" width="6" height="6" fill="white" fillOpacity="0.5" />
			<rect x="48" y="6" width="6" height="6" fill="white" fillOpacity="0.5" />
			<rect x="48" y="12" width="6" height="6" fill="white" fillOpacity="0.4" />
			<rect x="60" y="12" width="6" height="6" fill="white" fillOpacity="0.5" />
			<rect x="60" y="18" width="6" height="6" fill="white" fillOpacity="0.5" />
			<rect x="60" y="36" width="6" height="6" fill="white" fillOpacity="0.4" />
			<rect x="60" y="48" width="6" height="6" fill="white" fillOpacity="0.3" />
			<rect x="60" y="60" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="60" y="66" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="54" y="54" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="48" y="48" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="36" y="48" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="54" y="42" width="6" height="6" fill="white" fillOpacity="0.3" />
			<rect x="54" y="18" width="6" height="6" fill="white" fillOpacity="0.4" />
			<rect x="60" y="24" width="6" height="6" fill="white" fillOpacity="0.5" />
			<rect x="54" y="30" width="6" height="6" fill="white" fillOpacity="0.4" />
			<rect x="48" y="36" width="6" height="6" fill="white" fillOpacity="0.3" />
			<rect x="42" y="36" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="36" y="30" width="6" height="6" fill="white" fillOpacity="0.2" />
		</svg>
	)
}

function WaitlistForm() {
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
		<Form
			method="POST"
			{...getFormProps(form)}
			className={clsx(
				'group relative isolate mt-8 w-full max-w-2xl transition lg:mt-12',
			)}
		>
			<svg
				className="absolute -left-1.5 top-1.5 -z-10 h-[42px] w-auto text-zinc-950/5 opacity-0 transition group-focus-within:text-blue/10 group-focus-within:opacity-100 group-hover:opacity-100"
				viewBox="0 0 125 7"
			>
				{/* Layer one */}
				<rect x="0" y="0" width="1" height="1" className="fill-current " />
				<rect x="0" y="2" width="1" height="5" className="fill-current" />
				<rect x="1" y="6" width="80" height="1" className="fill-current" />
				<rect x="83" y="6" width="2" height="1" className="fill-current" />
				<rect x="86" y="6" width="1" height="1" className="fill-current" />
				<rect x="88" y="6" width="1" height="1" className="fill-current" />
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
			<Field className="flex w-full flex-col items-start md:flex-row">
				<label className="sr-only" htmlFor={fields.email.id}>
					Email
				</label>
				<div className="flex-1">
					<Input
						{...getInputProps(fields.email, { type: 'email' })}
						placeholder="design@engineer.awesome"
						invalid={Boolean(fields.email.errors?.length)}
						className="w-full border border-primary px-4 py-2 focus:outline-none"
					/>
					<ErrorMessage errors={fields.email.errors} />
					<ErrorMessage errors={form.errors} id={form.errorId} />
				</div>
				<StatusButton
					className="min-w-[30%]"
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
