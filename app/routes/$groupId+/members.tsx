import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { invariant } from '@epic-web/invariant'
import * as E from '@react-email/components'
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, json, useActionData, useLoaderData } from '@remix-run/react'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { z } from 'zod'
import { Button } from '#app/components/catalyst/button.js'
import {
	Dialog,
	DialogActions,
	DialogBody,
	DialogDescription,
	DialogTitle,
} from '#app/components/catalyst/dialog.js'
import {
	ErrorMessage,
	Field,
	Label,
} from '#app/components/catalyst/fieldset.js'
import { Input } from '#app/components/catalyst/input.js'
import { Icon } from '#app/components/ui/icon.js'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '#app/components/ui/table.js'
import { EmailSchema } from '#app/utils/account-validation.js'
import { prisma } from '#app/utils/db.server.js'
import { sendEmail } from '#app/utils/email.server.js'
import { createToastHeaders } from '#app/utils/toast.server.js'
import { prepareVerification } from '../_auth+/verify.server'

export async function loader({ params }: LoaderFunctionArgs) {
	const { groupId } = params
	invariant(groupId, 'Missing Group ID.')

	const members = await prisma.group
		.findUniqueOrThrow({
			where: { id: groupId },
			select: {
				members: {
					select: {
						id: true,
						roles: true,
						account: {
							select: {
								handle: true,
								email: true,
								name: true,
							},
						},
					},
				},
			},
		})
		.then(({ members }) =>
			members.map(member => ({
				id: member.id,
				name: member.account.name,
				email: member.account.email,
				handle: member.account.handle,
				roles: member.roles.map(({ name }) => name),
			})),
		)

	return json({
		members,
	})
}

const InviteSchema = z.object({
	email: EmailSchema,
})

export async function action({ request, params }: ActionFunctionArgs) {
	const { groupId } = params
	invariant(groupId, 'Missing Group ID.')

	const formData = await request.formData()

	const submission = await parseWithZod(formData, {
		schema: InviteSchema.superRefine(async (data, ctx) => {
			const existingVerification = await prisma.verification.findUnique({
				where: {
					target_type: {
						target: `${groupId}:${data.email}`,
						type: 'invite',
					},
				},
				select: { id: true },
			})
			if (existingVerification) {
				ctx.addIssue({
					path: ['email'],
					code: z.ZodIssueCode.custom,
					message: 'A verification already exists with this email',
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
	const { verifyUrl, otp } = await prepareVerification({
		period: 7 * 24 * 60 * 60,
		request,
		type: 'invite',
		target: `${groupId}:${email}`,
	})

	const response = await sendEmail({
		to: email,
		subject: `You've been invited to join Craft Lab!`,
		react: <InviteEmail onboardingUrl={verifyUrl.toString()} otp={otp} />,
	})

	const toastHeaders = await createToastHeaders({
		title: 'Invite Sent',
		description: 'You have successfully invited a new member.',
	})

	if (response.status === 'success') {
		return json({ result: submission.reply() }, { headers: toastHeaders })
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

export function InviteEmail({
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

export default function Screen() {
	const { members } = useLoaderData<typeof loader>()
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div className="p-6">
			<div className="flex items-center justify-between">
				<h1 className="text-lg/7 font-semibold tracking-[-0.015em] text-zinc-950">
					Members
				</h1>
				<Button color="orange" onClick={() => setIsOpen(true)}>
					<Icon name="envelope-closed" /> Invite Member
				</Button>
				<InviteModal isOpen={isOpen} setIsOpen={setIsOpen} />
			</div>
			<Table dense className="mt-6">
				<TableHead>
					<TableRow>
						<TableHeader>Name</TableHeader>
						<TableHeader>Email</TableHeader>
						<TableHeader>Role</TableHeader>
					</TableRow>
				</TableHead>
				<TableBody>
					{members.map(member => (
						<TableRow key={member.handle}>
							<TableCell className="font-medium">{member.name}</TableCell>
							<TableCell>{member.email}</TableCell>
							<TableCell className="text-zinc-500">
								{member.roles.join(' - ')}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}

function InviteModal({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean
	setIsOpen: Dispatch<SetStateAction<boolean>>
}) {
	const actionData = useActionData<typeof action>()

	const [form, fields] = useForm({
		id: `invite-form`,
		constraint: getZodConstraint(InviteSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			const result = parseWithZod(formData, { schema: InviteSchema })
			return result
		},
		shouldRevalidate: 'onBlur',
	})

	useEffect(() => {
		if (actionData?.result?.status === 'success') {
			setIsOpen(false)
		}
	}, [actionData, setIsOpen])

	return (
		<Dialog open={isOpen} onClose={setIsOpen}>
			<Form method="POST" {...getFormProps(form)}>
				<DialogTitle>Let's Add More Cool People!</DialogTitle>
				<DialogDescription>
					An email invite will be sent to whoever you enter in the form below.
					They will be able to use the link in that email to create a profile in
					this group.
				</DialogDescription>
				<DialogBody>
					<Field>
						<Label htmlFor={fields.email.id}>Invitee Email</Label>
						<Input
							{...getInputProps(fields.email, { type: 'email' })}
							autoFocus={true}
							placeholder="design@engineer.awesome"
							invalid={Boolean(fields.email.errors?.length)}
						/>
						<ErrorMessage errors={fields.email.errors} />
					</Field>
					<ErrorMessage errors={form.errors} id={form.errorId} />
				</DialogBody>
				<DialogActions>
					<Button plain onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button color="orange" type="submit">
						Send It <Icon name="paper-plane" />
					</Button>
				</DialogActions>
			</Form>
		</Dialog>
	)
}
