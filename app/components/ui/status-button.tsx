import { type LinkProps, Link } from '@remix-run/react'
import * as React from 'react'
import { useSpinDelay } from 'spin-delay'
import { cn } from '#app/utils/misc.tsx'
import { Icon } from './icon.tsx'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from './tooltip.tsx'

export const StatusButton = React.forwardRef<
	HTMLButtonElement,
	React.ComponentPropsWithoutRef<'button'> &
		React.PropsWithChildren<{
			className?: string
			status: 'pending' | 'success' | 'error' | 'idle'
			message?: string | null
			spinDelay?: Parameters<typeof useSpinDelay>[1]
		}>
>(({ message, status, className, children, spinDelay, ...props }, ref) => {
	const delayedPending = useSpinDelay(status === 'pending', {
		delay: 400,
		minDuration: 300,
		...spinDelay,
	})
	const companion = {
		pending: delayedPending ? (
			<div className="inline-flex h-6 w-6 items-center justify-center">
				<Icon name="update" className="animate-spin" />
			</div>
		) : null,
		success: (
			<div className="inline-flex h-6 w-6 items-center justify-center">
				<Icon name="check" />
			</div>
		),
		error: null,
		idle: null,
	}[status]

	return (
		<button
			ref={ref}
			className={cn(
				status === 'error' && 'border-red',
				'group relative flex justify-center gap-4 border border-transparent bg-primary px-4 py-2 font-medium text-primary-foreground',
				className,
			)}
			{...props}
		>
			<svg
				className="absolute -right-px -top-px h-[24px] w-[24px]"
				viewBox="0 0 4 4"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<rect
					className="fill-current text-background"
					x="0"
					y="0"
					width="4"
					height="4"
				/>
				<path
					d="M 0 0 H 2 V 1 H 3 V 2 H 4 V 4 H 0 V 0 Z"
					className="fill-current text-foreground"
				/>
			</svg>
			<HoverSVG className="absolute -right-px -top-px opacity-0 transition duration-200 group-hover:opacity-100" />
			<div>{children}</div>
			{message ? (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>{companion}</TooltipTrigger>
						<TooltipContent>{message}</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			) : (
				companion
			)}
		</button>
	)
})
StatusButton.displayName = 'Button'

export const MarketingButton = React.forwardRef<
	HTMLAnchorElement,
	LinkProps &
		React.PropsWithChildren<{
			className?: string
		}>
>(({ className, children, ...props }, ref) => {
	return (
		<Link
			ref={ref}
			className={cn(
				'group relative flex justify-center gap-4 border border-transparent bg-primary py-2 pl-5 pr-6 font-medium text-primary-foreground',
				className,
			)}
			{...props}
		>
			<svg
				className="absolute -right-px -top-px h-[24px] w-[24px]"
				viewBox="0 0 4 4"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<rect
					className="fill-current text-background"
					x="0"
					y="0"
					width="4"
					height="4"
				/>
				<path
					d="M 0 0 H 2 V 1 H 3 V 2 H 4 V 4 H 0 V 0 Z"
					className="fill-current text-foreground"
				/>
			</svg>
			<HoverSVG className="absolute -right-px -top-px opacity-0 transition duration-200 group-hover:opacity-100" />
			<span className="relative inline-flex items-center justify-center gap-2">
				{children}
			</span>
		</Link>
	)
})

MarketingButton.displayName = 'Button'

function HoverSVG({ className }: { className?: string }) {
	return (
		<svg
			width="66"
			height="42"
			viewBox="0 0 66 42"
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
			<rect x="24" y="18" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="36" y="24" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="24" y="30" width="6" height="6" fill="white" fillOpacity="0.1" />
			<rect x="30" y="36" width="6" height="6" fill="white" fillOpacity="0.1" />
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
			<rect x="60" y="36" width="6" height="6" fill="white" fillOpacity="0.5" />
			<rect x="54" y="18" width="6" height="6" fill="white" fillOpacity="0.4" />
			<rect x="60" y="24" width="6" height="6" fill="white" fillOpacity="0.5" />
			<rect x="54" y="30" width="6" height="6" fill="white" fillOpacity="0.4" />
			<rect x="48" y="36" width="6" height="6" fill="white" fillOpacity="0.3" />
			<rect x="42" y="36" width="6" height="6" fill="white" fillOpacity="0.2" />
			<rect x="36" y="30" width="6" height="6" fill="white" fillOpacity="0.2" />
		</svg>
	)
}
