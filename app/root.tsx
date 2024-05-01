import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import {
	json,
	redirect,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	type HeadersFunction,
	type LinksFunction,
	type MetaFunction,
} from '@remix-run/node'
import {
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useFetchers,
	useLoaderData,
	useLocation,
	useNavigate,
} from '@remix-run/react'
import { withSentry } from '@sentry/remix'
import * as Fathom from 'fathom-client'
import { useEffect, useRef } from 'react'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { CanonicalLink } from './components/canonical-link.tsx'
import { GeneralErrorBoundary } from './components/error-boundary.tsx'
import { Logo, type Seed, makeFavicon } from './components/logo.tsx'
import { useToast } from './components/toaster.tsx'
import { href as iconsHref } from './components/ui/icon.tsx'
import { EpicToaster } from './components/ui/sonner.tsx'
import { useKonamiCode } from './hooks/useKonami.tsx'
import tailwindStyleSheetUrl from './styles/tailwind.css?url'
import { getAccountId, logout } from './utils/auth.server.ts'
import { ClientHintCheck, getHints, useHints } from './utils/client-hints.tsx'
import { prisma } from './utils/db.server.ts'
import { getEnv } from './utils/env.server.ts'
import { honeypot } from './utils/honeypot.server.ts'
import { combineHeaders, getDomainUrl } from './utils/misc.tsx'
import { useNonce } from './utils/nonce-provider.ts'
import { useRequestInfo } from './utils/request-info.ts'
import { type RouteID } from './utils/route-id.ts'
import { seoData } from './utils/seo.ts'
import { type Theme, setTheme, getTheme } from './utils/theme.server.ts'
import { makeTimings, time } from './utils/timing.server.ts'
import { getToast } from './utils/toast.server.ts'

const ROUTE_ID = 'root' as RouteID<{ loader: typeof loader }>
export { ROUTE_ID as rootRouteId }

export const links: LinksFunction = () => {
	return [
		// Preload svg sprite as a resource to avoid render blocking
		{ rel: 'preload', href: iconsHref, as: 'image' },
		// Preload CSS as a resource to avoid render blocking
		{ rel: 'mask-icon', href: '/favicons/mask-icon.svg' },
		{
			rel: 'alternate icon',
			type: 'image/png',
			href: '/favicons/favicon-32x32.png',
		},
		{ rel: 'apple-touch-icon', href: '/favicons/apple-touch-icon.png' },
		{
			rel: 'manifest',
			href: '/site.webmanifest',
			crossOrigin: 'use-credentials',
		} as const, // necessary to make typescript happy
		//These should match the css preloads above to avoid css as render blocking resource
		{
			rel: 'icon',
			type: 'image/svg+xml',
			href: '/favicons/favicon.svg',
			id: 'favicon',
		},
		{ rel: 'stylesheet', href: tailwindStyleSheetUrl },
	].filter(Boolean)
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const title = data ? 'Craft Lab' : 'Error | Craft Lab'
	const description =
		'A community built for Design Engineers. Help us build a space where we learn and share everything about our craft and have fun doing it.'

	return seoData({ title, description })
}

export async function loader({ request }: LoaderFunctionArgs) {
	const allowedPaths = [
		'/',
		'/verify',
		'/waitlist/success',
		'/articles',
		'/articles/the-generative-part-of-generative-art',
	]
	const url = new URL(request.url)
	if (
		process.env.SKIP_ALLOWED_PATHS !== 'true' &&
		!allowedPaths.includes(url.pathname)
	) {
		return redirect('/')
	}
	const timings = makeTimings('root loader')
	const accountId = await time(() => getAccountId(request), {
		timings,
		type: 'getAccountId',
		desc: 'getAccountId in root',
	})

	const account = accountId
		? await time(
				() =>
					prisma.account.findUniqueOrThrow({
						select: {
							id: true,
							name: true,
							handle: true,
							image: { select: { id: true } },
						},
						where: {
							id: accountId,
						},
					}),
				{ timings, type: 'find account', desc: 'find account in root' },
			)
		: null
	if (accountId && !account) {
		console.info('something weird happened')
		// something weird happened... The account is authenticated but we can't find
		// them in the database. Maybe they were deleted? Let's log them out.
		await logout({ request, redirectTo: '/' })
	}
	const { toast, headers: toastHeaders } = await getToast(request)
	const honeyProps = honeypot.getInputProps()

	return json(
		{
			seed: Math.random(),
			account,
			requestInfo: {
				hints: getHints(request),
				origin: getDomainUrl(request),
				path: new URL(request.url).pathname,
				accountPrefs: {
					theme: getTheme(request),
				},
			},
			ENV: getEnv(),
			toast,
			honeyProps,
		},
		{
			headers: combineHeaders(
				{ 'Server-Timing': timings.toString() },
				toastHeaders,
			),
		},
	)
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
	const headers = {
		'Server-Timing': loaderHeaders.get('Server-Timing') ?? '',
	}
	return headers
}

const ThemeFormSchema = z.object({
	theme: z.enum(['system', 'light', 'dark']),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: ThemeFormSchema,
	})

	invariantResponse(submission.status === 'success', 'Invalid theme received')

	const { theme } = submission.value

	const responseInit = {
		headers: { 'set-cookie': setTheme(theme) },
	}
	return json({ result: submission.reply() }, responseInit)
}

function Document({
	children,
	nonce,
	seed,
	theme = 'light',
	env = {},
	allowIndexing = true,
}: {
	children: React.ReactNode
	nonce: string
	seed: Seed
	theme?: Theme
	env?: Record<string, string>
	allowIndexing?: boolean
}) {
	return (
		<html lang="en" className={`${theme}`}>
			<head>
				<ClientHintCheck nonce={nonce} />
				<CanonicalLink />
				<Meta />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				{allowIndexing ? null : (
					<meta name="robots" content="noindex, nofollow" />
				)}
				<Links />
			</head>
			<body className="bg-background text-foreground">
				{children}
				<footer className="flex items-center justify-between gap-8 border-t border-foreground p-2">
					<p className="flex items-center gap-2 text-sm font-semibold">
						<Logo seed={seed} className="h-auto w-5" /> Craft Lab ©{' '}
						{new Date().getFullYear()}
					</p>
					<nav className="font-mono text-xs">
						<Link to="/articles" className="hover:text-lime">
							Articles
						</Link>
					</nav>
				</footer>
				<script
					nonce={nonce}
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(env)}`,
					}}
				/>
				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
			</body>
		</html>
	)
}

function App() {
	const data = useLoaderData<typeof loader>()
	const fathomLoaded = useRef(false)
	const nonce = useNonce()
	const location = useLocation()
	const codeComplete = useKonamiCode()
	const navigate = useNavigate()
	const theme = 'light'
	const allowIndexing = data.ENV.ALLOW_INDEXING !== 'false'
	useToast(data.toast)

	useEffect(() => {
		if (codeComplete) navigate('/login')
	}, [codeComplete, navigate])

	useEffect(() => {
		if (!fathomLoaded.current && ENV.FATHOM_ID) {
			Fathom.load(ENV.FATHOM_ID, {
				url: 'https://cdn.usefathom.com/script.js',
			})
			fathomLoaded.current = true
		} else {
			Fathom.trackPageview()
		}
	}, [location, fathomLoaded, data.ENV])

	useEffect(() => {
		const favicon = document.getElementById('favicon')
		const svg = makeFavicon(data.seed)
		if (svg && favicon) {
			favicon.setAttribute('href', svg)
		}
	})

	return (
		<Document
			nonce={nonce}
			theme={theme}
			allowIndexing={allowIndexing}
			env={data.ENV}
			seed={data.seed}
		>
			<div className="min-h-screen">
				<Outlet />
			</div>
			<EpicToaster closeButton position="top-center" theme={theme} />
		</Document>
	)
}

function AppWithProviders() {
	const data = useLoaderData<typeof loader>()
	return (
		<HoneypotProvider {...data.honeyProps}>
			<App />
		</HoneypotProvider>
	)
}

export default withSentry(AppWithProviders)

/**
 * @returns the account's theme preference, or the client hint theme if the account
 * has not set a preference.
 */
export function useTheme() {
	const hints = useHints()
	const requestInfo = useRequestInfo()
	const optimisticMode = useOptimisticThemeMode()
	if (optimisticMode) {
		return optimisticMode === 'system' ? hints.theme : optimisticMode
	}
	return requestInfo.accountPrefs.theme ?? hints.theme
}

/**
 * If the account's changing their theme mode preference, this will return the
 * value it's being changed to.
 */
export function useOptimisticThemeMode() {
	const fetchers = useFetchers()
	const themeFetcher = fetchers.find(f => f.formAction === '/')

	if (themeFetcher && themeFetcher.formData) {
		const submission = parseWithZod(themeFetcher.formData, {
			schema: ThemeFormSchema,
		})

		if (submission.status === 'success') {
			return submission.value.theme
		}
	}
}

// function ThemeSwitch({
// 	accountPreference,
// }: {
// 	accountPreference?: Theme | null
// }) {
// 	const fetcher = useFetcher<typeof action>()

// 	const [form] = useForm({
// 		id: 'theme-switch',
// 		lastResult: fetcher.data?.result,
// 	})

// 	const optimisticMode = useOptimisticThemeMode()
// 	const mode = optimisticMode ?? accountPreference ?? 'system'
// 	const nextMode =
// 		mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system'
// 	const modeLabel = {
// 		light: (
// 			<Icon name="sun">
// 				<span className="sr-only">Light</span>
// 			</Icon>
// 		),
// 		dark: (
// 			<Icon name="moon">
// 				<span className="sr-only">Dark</span>
// 			</Icon>
// 		),
// 		system: (
// 			<Icon name="laptop">
// 				<span className="sr-only">System</span>
// 			</Icon>
// 		),
// 	}

// 	return (
// 		<fetcher.Form method="POST" {...getFormProps(form)}>
// 			<input type="hidden" name="theme" value={nextMode} />
// 			<div className="flex gap-2">
// 				<button
// 					type="submit"
// 					className="flex h-8 w-8 cursor-pointer items-center justify-center"
// 				>
// 					{modeLabel[mode]}
// 				</button>
// 			</div>
// 		</fetcher.Form>
// 	)
// }

export function ErrorBoundary() {
	// the nonce doesn't rely on the loader so we can access that
	const nonce = useNonce()

	// NOTE: you cannot use useLoaderData in an ErrorBoundary because the loader
	// likely failed to run so we have to do the best we can.
	// We could probably do better than this (it's possible the loader did run).
	// This would require a change in Remix.

	// Just make sure your root route never errors out and you'll always be able
	// to give the account a better UX.

	return (
		<Document seed={39909} nonce={nonce}>
			<GeneralErrorBoundary />
		</Document>
	)
}
