import {
	Description as HeadlessDescription,
	Field as HeadlessField,
	Fieldset as HeadlessFieldset,
	Label as HeadlessLabel,
	Legend as HeadlessLegend,
	type DescriptionProps as HeadlessDescriptionProps,
	type FieldProps as HeadlessFieldProps,
	type FieldsetProps as HeadlessFieldsetProps,
	type LabelProps as HeadlessLabelProps,
	type LegendProps as HeadlessLegendProps,
} from '@headlessui/react'
import clsx from 'clsx'

export type ListOfErrors = Array<string | null | undefined> | null | undefined

export function Fieldset({
	className,
	...props
}: { disabled?: boolean } & HeadlessFieldsetProps) {
	return (
		<HeadlessFieldset
			{...props}
			className={clsx(
				className,
				'[&>*+[data-slot=control]]:mt-6 [&>[data-slot=text]]:mt-1',
			)}
		/>
	)
}

export function Legend({ ...props }: HeadlessLegendProps) {
	return (
		<HeadlessLegend
			{...props}
			data-slot="legend"
			className={clsx(
				props.className,
				'text-base/6 font-semibold text-zinc-950 data-[disabled]:opacity-50 dark:text-white sm:text-sm/6',
			)}
		/>
	)
}

export function FieldGroup({
	className,
	...props
}: React.ComponentPropsWithoutRef<'div'>) {
	return (
		<div
			{...props}
			data-slot="control"
			className={clsx(className, 'space-y-8')}
		/>
	)
}

export function Field({ className, ...props }: HeadlessFieldProps) {
	return (
		<HeadlessField
			className={clsx(
				className,
				'[&>[data-slot=label]+[data-slot=control]]:mt-3',
				'[&>[data-slot=label]+[data-slot=description]]:mt-1',
				'[&>[data-slot=description]+[data-slot=control]]:mt-3',
				'[&>[data-slot=control]+[data-slot=description]]:mt-3',
				'[&>[data-slot=control]+[data-slot=error]]:mt-3',
				'[&>[data-slot=label]]:font-medium',
			)}
			{...props}
		/>
	)
}

export function Label({
	className,
	...props
}: { className?: string } & HeadlessLabelProps) {
	return (
		<HeadlessLabel
			{...props}
			data-slot="label"
			className={clsx(
				className,
				'select-none text-base/6 text-zinc-950 data-[disabled]:opacity-50 dark:text-white sm:text-sm/6',
			)}
		/>
	)
}

export function Description({
	className,
	disabled,
	...props
}: { className?: string; disabled?: boolean } & HeadlessDescriptionProps) {
	return (
		<HeadlessDescription
			{...props}
			data-slot="description"
			className={clsx(
				className,
				'text-base/6 text-zinc-500 data-[disabled]:opacity-50 dark:text-zinc-400 sm:text-sm/6',
			)}
		/>
	)
}

export function ErrorMessage({
	className,
	disabled,
	children,
	errors,
	...props
}: {
	className?: string
	disabled?: boolean
	errors?: ListOfErrors
} & HeadlessDescriptionProps) {
	if (!errors?.length) return null

	return (
		<HeadlessDescription
			{...props}
			as="div"
			data-slot="error"
			className={clsx(
				className,
				'text-base/6 text-red data-[disabled]:opacity-50 sm:text-sm/6',
			)}
		>
			<ErrorList errors={errors} />
		</HeadlessDescription>
	)
}

export function ErrorList({ errors }: { errors?: ListOfErrors }) {
	const errorsToRender = errors?.filter(Boolean)
	if (!errorsToRender?.length) return null
	return (
		<ul className="flex flex-col gap-1">
			{errorsToRender.map(e => (
				<li key={e}>{e}</li>
			))}
		</ul>
	)
}
