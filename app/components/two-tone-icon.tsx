const colors = {
	pink: {
		primary: 'fill-pink', // group-hover:fill-pink
		dark: 'fill-pink-dark', // group-hover:fill-pink-dark
	},
	orange: {
		primary: 'fill-orange', // group-hover:fill-orange
		dark: 'fill-orange-dark', // group-hover:fill-orange-dark
	},
	yellow: {
		primary: 'fill-yellow', // group-hover:fill-yellow
		dark: 'fill-yellow-dark', // group-hover:fill-yellow-dark
	},
	lime: {
		primary: 'fill-lime', // group-hover:fill-lime
		dark: 'fill-lime-dark', // group-hover:fill-lime-dark
	},
	green: {
		primary: 'fill-green', // group-hover:fill-green
		dark: 'fill-green-dark', // group-hover:fill-green-dark
	},
	blue: {
		primary: 'fill-blue', // group-hover:fill-blue
		dark: 'fill-blue-dark', // group-hover:fill-blue-dark
	},
	purple: {
		primary: 'fill-purple', // group-hover:fill-purple
		dark: 'fill-purple-dark', // group-hover:fill-purple-dark
	},
	inactive: {
		primary: 'fill-current text-primary/30',
		dark: 'fill-current text-primary/50',
	},
}
function BaseGrid({
	pixels,
	color,
	active = false,
}: {
	pixels: ('□' | '◩' | '■')[][]
	color: keyof typeof colors
	active?: boolean
}) {
	const selectedColors = colors[color]
	const inactiveColors = colors.inactive
	const primary = active
		? selectedColors.primary
		: `${inactiveColors.primary} group-hover:${selectedColors.primary}`
	const dark = active
		? selectedColors.dark
		: `${inactiveColors.dark} group-hover:${selectedColors.dark}`
	return (
		<svg
			id="craft-lab-logo"
			viewBox="0 0 8 8"
			width="8"
			height="8"
			xmlns="http://www.w3.org/2000/svg"
			className="h-auto w-full"
		>
			{pixels.map((c, y) =>
				c.map((pixel, x) => (
					<rect
						x={x}
						y={y}
						width="1"
						height="1"
						className={
							pixel === '□'
								? 'fill-transparent'
								: pixel === '◩'
									? primary
									: dark
						}
						key={`${x}-${y}-two-tone-pixel`}
					/>
				)),
			)}
		</svg>
	)
}

export const ObjectiveIcon = ({ active = false }: { active?: boolean }) => (
	<BaseGrid
		pixels={[
			['□', '□', '◩', '□', '□', '◩', '□', '□'],
			['□', '◩', '■', '◩', '◩', '■', '◩', '□'],
			['◩', '◩', '◩', '◩', '◩', '◩', '◩', '◩'],
			['■', '◩', '◩', '◩', '◩', '□', '◩', '◩'],
			['■', '■', '□', '◩', '□', '◩', '◩', '◩'],
			['■', '■', '■', '□', '◩', '◩', '◩', '◩'],
			['■', '■', '■', '■', '■', '◩', '◩', '◩'],
			['■', '■', '■', '■', '■', '■', '◩', '◩'],
		]}
		color="orange"
		active={active}
	/>
)

export const MilestoneIcon = ({ active = false }: { active?: boolean }) => (
	<BaseGrid
		pixels={[
			['■', '□', '□', '□', '□', '□', '□', '□'],
			['■', '◩', '◩', '◩', '□', '□', '□', '□'],
			['■', '◩', '◩', '◩', '■', '◩', '◩', '◩'],
			['■', '◩', '◩', '◩', '■', '◩', '◩', '□'],
			['■', '◩', '◩', '◩', '■', '◩', '□', '□'],
			['■', '◩', '◩', '◩', '◩', '◩', '◩', '□'],
			['■', '□', '□', '□', '◩', '◩', '◩', '◩'],
			['■', '□', '□', '□', '□', '□', '□', '□'],
		]}
		color="pink"
		active={active}
	/>
)

export const SignalsIcon = ({ active = false }: { active?: boolean }) => (
	<BaseGrid
		pixels={[
			['◩', '□', '□', '◩', '◩', '□', '□', '◩'],
			['□', '■', '□', '□', '□', '□', '■', '□'],
			['□', '□', '□', '◩', '◩', '□', '□', '□'],
			['◩', '□', '◩', '■', '■', '◩', '□', '◩'],
			['◩', '□', '◩', '■', '■', '◩', '□', '◩'],
			['□', '□', '□', '◩', '◩', '□', '□', '□'],
			['□', '■', '□', '□', '□', '□', '■', '□'],
			['◩', '□', '□', '◩', '◩', '□', '□', '◩'],
		]}
		color="yellow"
		active={active}
	/>
)

export const LibraryIcon = ({ active = false }: { active?: boolean }) => (
	<BaseGrid
		pixels={[
			['■', '■', '■', '■', '■', '■', '■', '□'],
			['□', '◩', '◩', '◩', '◩', '◩', '◩', '■'],
			['□', '◩', '◩', '◩', '◩', '◩', '◩', '■'],
			['■', '■', '■', '■', '■', '■', '■', '□'],
			['□', '■', '■', '■', '■', '■', '■', '■'],
			['■', '◩', '◩', '◩', '◩', '◩', '◩', '□'],
			['■', '◩', '◩', '◩', '◩', '◩', '◩', '□'],
			['□', '■', '■', '■', '■', '■', '■', '■'],
		]}
		color="lime"
		active={active}
	/>
)

export const ThreadsIcon = ({ active = false }: { active?: boolean }) => (
	<BaseGrid
		pixels={[
			['□', '□', '■', '■', '■', '■', '□', '□'],
			['□', '■', '■', '■', '■', '■', '■', '□'],
			['■', '■', '■', '■', '■', '■', '■', '■'],
			['■', '◩', '■', '◩', '■', '◩', '■', '◩'],
			['◩', '■', '◩', '■', '◩', '■', '◩', '■'],
			['◩', '◩', '◩', '◩', '◩', '◩', '◩', '□'],
			['□', '◩', '◩', '◩', '□', '□', '□', '□'],
			['□', '□', '◩', '□', '□', '□', '□', '□'],
		]}
		color="green"
		active={active}
	/>
)

export const MembersIcon = ({ active = false }: { active?: boolean }) => (
	<BaseGrid
		pixels={[
			['□', '□', '□', '◩', '◩', '□', '□', '□'],
			['□', '■', '◩', '◩', '◩', '◩', '■', '□'],
			['■', '■', '◩', '◩', '◩', '◩', '■', '■'],
			['■', '■', '■', '◩', '◩', '■', '■', '■'],
			['□', '■', '■', '□', '□', '■', '■', '□'],
			['□', '□', '□', '◩', '◩', '□', '□', '□'],
			['□', '■', '◩', '◩', '◩', '◩', '■', '□'],
			['■', '■', '◩', '◩', '◩', '◩', '■', '■'],
		]}
		color="blue"
		active={active}
	/>
)

export const RefreshIcon = ({ active = false }: { active?: boolean }) => (
	<BaseGrid
		pixels={[
			['□', '□', '◩', '◩', '◩', '◩', '□', '□'],
			['□', '◩', '□', '□', '◩', '□', '□', '□'],
			['◩', '□', '□', '◩', '□', '□', '□', '■'],
			['◩', '□', '□', '□', '□', '□', '□', '■'],
			['◩', '□', '□', '□', '□', '□', '□', '■'],
			['□', '□', '□', '□', '■', '□', '□', '■'],
			['□', '□', '□', '■', '□', '□', '■', '□'],
			['□', '□', '■', '■', '■', '■', '□', '□'],
		]}
		color="green"
		active={active}
	/>
)
