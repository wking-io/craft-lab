import { type SEOHandle } from '@nasa-gcn/remix-seo'
import {
	BlobLineLogo,
	BlobLogo,
	Logo,
	PointLogo,
} from '#app/components/logo.js'
import { rootRouteId } from '#app/root.js'
import { useRouteIdLoaderData } from '#app/utils/route-id.js'

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}

export default function Screen() {
	const { seed } = useRouteIdLoaderData(rootRouteId)
	return (
		<div className="grid h-screen grid-cols-2 grid-rows-3">
			<div className="flex items-center justify-center border-b border-r border-gray-950">
				<div className="relative flex items-center gap-[1vw]">
					<Logo seed={seed} className="h-auto w-[4vw]" />
					<p className="text-[4vw] font-semibold tracking-tighter">Craft Lab</p>
				</div>
			</div>
			<div className="flex items-center justify-center border-b border-gray-950">
				<div className="relative flex items-center gap-[1vw]">
					<BlobLogo seed={seed} className="-m-2 h-auto w-[5vw]" />
					<p className="text-[4vw] font-semibold tracking-tighter">Craft Lab</p>
				</div>
			</div>
			<div className="flex items-center justify-center border-b border-r border-gray-950">
				<div className="relative flex items-center gap-[1vw]">
					<PointLogo seed={seed} className="h-auto w-[4vw]" />
					<p className="text-[4vw] font-semibold tracking-tighter">Craft Lab</p>
				</div>
			</div>
			<div className="flex items-center justify-center border-b border-gray-950">
				<div className="relative flex items-center gap-[1vw]">
					<BlobLineLogo seed={seed} className="-m-2 h-auto w-[5vw]" />
					<p className="text-[4vw] font-semibold tracking-tighter">Craft Lab</p>
				</div>
			</div>
			<div className="flex items-center justify-center border-r border-gray-950">
				<div className="relative flex items-center gap-2">
					<Logo seed={seed} className="h-auto w-6" />
					<p className="text-xl font-semibold tracking-tighter">Craft Lab</p>
				</div>
			</div>
			<div className="flex items-center justify-center">
				<div className="relative flex items-center gap-2">
					<Logo seed={seed} className="h-auto w-6" />
					<p className="text-xl font-semibold tracking-tighter">Craft Lab</p>
				</div>
			</div>
		</div>
	)
}
