import { clsx } from 'clsx'
import { Link } from '../ui/link'

export function Text({
	className,
	...props
}: React.ComponentPropsWithoutRef<'p'>) {
	return (
		<p
			{...props}
			data-slot="text"
			className={clsx(className, 'text-base/6 text-primary/60 sm:text-sm/6')}
		/>
	)
}

export function TextLink({
	className,
	children,
	...props
}: React.ComponentPropsWithoutRef<typeof Link>) {
	return (
		<Link
			{...props}
			className={clsx(
				className,
				'text-primary underline decoration-primary/50 data-[hover]:decoration-primary',
			)}
		>
			{children}
		</Link>
	)
}

export function Strong({
	className,
	...props
}: React.ComponentPropsWithoutRef<'strong'>) {
	return (
		<strong
			{...props}
			className={clsx(className, 'font-medium text-zinc-950 dark:text-white')}
		/>
	)
}

export function Code({
	className,
	...props
}: React.ComponentPropsWithoutRef<'code'>) {
	return (
		<code
			{...props}
			className={clsx(
				className,
				'rounded border border-zinc-950/10 bg-zinc-950/[2.5%] px-0.5 text-sm font-medium text-zinc-950 dark:border-white/20 dark:bg-white/5 dark:text-white sm:text-[0.8125rem]',
			)}
		/>
	)
}
