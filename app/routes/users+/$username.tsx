import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link, useLoaderData, type MetaFunction } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Spacer } from '#app/components/spacer.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { useOptionalUser } from '#app/utils/account.js'
import { prisma } from '#app/utils/db.server.ts'
import { getUserImgSrc } from '#app/utils/misc.tsx'

export async function loader({ params }: LoaderFunctionArgs) {
	const account = await prisma.account.findFirst({
		select: {
			id: true,
			name: true,
			handle: true,
			createdAt: true,
			image: { select: { id: true } },
		},
		where: {
			handle: params.handle,
		},
	})

	invariantResponse(account, 'User not found', { status: 404 })

	return json({
		account,
		accountJoinedDisplay: account.createdAt.toLocaleDateString(),
	})
}

export default function ProfileRoute() {
	const data = useLoaderData<typeof loader>()
	const account = data.account
	const accountDisplayName = account.name ?? account.handle
	const loggedInUser = useOptionalUser()
	const isLoggedInUser = data.account.id === loggedInUser?.id

	return (
		<div className="container mb-48 mt-36 flex flex-col items-center justify-center">
			<Spacer size="4xs" />

			<div className="container flex flex-col items-center rounded-3xl bg-muted p-12">
				<div className="relative w-52">
					<div className="absolute -top-40">
						<div className="relative">
							<img
								src={getUserImgSrc(data.account.image?.id)}
								alt={accountDisplayName}
								className="h-52 w-52 rounded-full object-cover"
							/>
						</div>
					</div>
				</div>

				<Spacer size="sm" />

				<div className="flex flex-col items-center">
					<div className="flex flex-wrap items-center justify-center gap-4">
						<h1 className="text-center text-h2">{accountDisplayName}</h1>
					</div>
					<p className="mt-2 text-center text-muted-foreground">
						Joined {data.accountJoinedDisplay}
					</p>
					{isLoggedInUser ? (
						<Form action="/logout" method="POST" className="mt-3">
							<Button type="submit" variant="link" size="pill">
								<Icon name="exit" className="scale-125 max-md:scale-150">
									Logout
								</Icon>
							</Button>
						</Form>
					) : null}
					<div className="mt-10 flex gap-4">
						{isLoggedInUser ? (
							<>
								<Button asChild>
									<Link to="notes" prefetch="intent">
										My notes
									</Link>
								</Button>
								<Button asChild>
									<Link to="/settings/profile" prefetch="intent">
										Edit profile
									</Link>
								</Button>
							</>
						) : (
							<Button asChild>
								<Link to="notes" prefetch="intent">
									{accountDisplayName}'s notes
								</Link>
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
	const displayName = data?.account.name ?? params.handle
	return [
		{ title: `${displayName} | Epic Notes` },
		{
			name: 'description',
			content: `Profile of ${displayName} on Epic Notes`,
		},
	]
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No account with the handle "{params.handle}" exists</p>
				),
			}}
		/>
	)
}
