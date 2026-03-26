const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const teacher1 = await prisma.teacher.create({
        data: {
            full_name: 'Əli Əliyev',
            plate_number: '99-AA-999',
            status: 'active',
        },
    })

    const teacher2 = await prisma.teacher.create({
        data: {
            full_name: 'Vəli Vəliyev',
            plate_number: '10-BB-100',
            status: 'inactive',
        },
    })

    await prisma.entryLog.create({
        data: {
            teacher_id: teacher1.id,
            plate_number: '99-AA-999',
            status: 'success',
            match_type: 'plate',
            date: new Date(),
            entry_time: new Date()
        }
    })

    await prisma.entryLog.create({
        data: {
            plate_number: '99-ZZ-000',
            status: 'failed',
            match_type: 'plate',
            date: new Date()
        }
    })

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
