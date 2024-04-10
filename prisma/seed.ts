import { prisma } from '#app/utils/db.server.ts'
import { cleanupDb, createPassword } from '#tests/db-utils.ts'
import { insertGitHubUser } from '#tests/mocks/github.ts'

async function seed() {
	console.log('🌱 Seeding...')
	console.time(`🌱 Database has been seeded`)

	console.time('🧹 Cleaned up the database...')
	await cleanupDb(prisma)
	console.timeEnd('🧹 Cleaned up the database...')

	console.time('🔑 Created permissions...')
	const entities = ['account', 'profile', 'group']
	const actions = ['create', 'read', 'update', 'delete']
	const accesses = ['own', 'any'] as const
	for (const entity of entities) {
		for (const action of actions) {
			for (const access of accesses) {
				await prisma.permission.create({ data: { entity, action, access } })
			}
		}
	}
	console.timeEnd('🔑 Created permissions...')

	console.time('👑 Created roles...')
	await prisma.role.create({
		data: {
			name: 'admin',
			permissions: {
				connect: await prisma.permission.findMany({
					select: { id: true },
					where: { access: 'any' },
				}),
			},
		},
	})
	await prisma.role.create({
		data: {
			name: 'member',
			permissions: {
				connect: await prisma.permission.findMany({
					select: { id: true },
					where: { access: 'own' },
				}),
			},
		},
	})
	console.timeEnd('👑 Created roles...')

	console.time(`🤘 Created admin account "wking"`)

	const githubUser = await insertGitHubUser('MOCK_CODE_GITHUB_WKING')

	const me = await prisma.account.create({
		select: { id: true },
		data: {
			email: 'contact@wking.dev',
			handle: 'wking',
			name: 'Will King',
			password: { create: createPassword('craftlablocal') },
			connections: {
				create: { providerName: 'github', providerId: githubUser.profile.id },
			},
		},
	})
	console.timeEnd(`🤘 Created admin account "wking"`)

	console.time('🙌 Created groups...')
	const group = await prisma.group.create({
		data: {
			name: 'Origin',
			account: { connect: { id: me.id } },
		},
	})
	console.timeEnd('🙌 Created groups...')

	console.time('👨‍🦰 Created profile...')
	await prisma.profile.create({
		data: {
			name: 'Squilliam',
			group: { connect: { id: group.id } },
			account: { connect: { id: me.id } },
			roles: { connect: [{ name: 'admin' }, { name: 'member' }] },
		},
	})
	console.timeEnd('👨‍🦰 Created profile...')

	console.timeEnd(`🌱 Database has been seeded`)
}

seed()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
