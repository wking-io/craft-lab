export function seoData({
	title,
	description,
	image = 'https://res.cloudinary.com/dzqdvin5s/image/upload/v1714077475/craft-lab-og-v2.jpg',
}: {
	title: string
	description: string
	image?: string
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
			content: image,
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
