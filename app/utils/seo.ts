export function seoData({
	title,
	description,
}: {
	title: string
	description: string
}) {
	return [
		{ title },
		{
			name: 'description',
			content: description,
		},
		{
			property: 'og:title',
			content: title,
		},
		{
			property: 'og:description',
			content: description,
		},
		{
			property: 'og:image',
			content:
				'https://res.cloudinary.com/dzqdvin5s/image/upload/v1714063227/craft-lab-og.jpg',
		},
		{
			property: 'og:type',
			content: 'website',
		},
		{
			property: 'twitter:title',
			content: title,
		},
		{
			property: 'twitter:description',
			content: description,
		},
		{
			property: 'twitter:card',
			content: 'summary_large_image',
		},
		{
			property: 'twitter:domain',
			content: 'craftlab.fun',
		},
	]
}
