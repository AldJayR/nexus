import 'dotenv/config'
import { PrismaClient, Role, PhaseType, DeliverableStatus, DeliverableStage } from '../src/generated/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting database seeding...')

  // 1. Create the First Admin (Team Lead) - Idempotent
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexus.local' },
    update: {},
    create: {
      email: 'admin@nexus.local',
      name: 'Admin User',
      passwordHash: hashedPassword,
      role: Role.TEAM_LEAD
    }
  })
  console.log(`👤 Admin user ready: ${admin.email}`)

  // 2. Create Project (Singleton Check)
  const existingProject = await prisma.project.findFirst()

  if (existingProject) {
    console.log(`📦 Project already exists: ${existingProject.name}`)
    return
  }

  // 3. Create Project with Phases AND Deliverables
  const project = await prisma.project.create({
    data: {
      name: 'Nexus Capstone',
      description: 'Internal capstone progress tracker',
      startDate: new Date(),
      phases: {
        create: [
          {
            type: PhaseType.WATERFALL,
            name: 'Planning & Design',
            deliverables: {
              create: [
                { title: 'Project Proposal', description: 'Scope and objectives', status: DeliverableStatus.NOT_STARTED, stage: DeliverableStage.PLANNING },
                { title: 'Requirements Specification', description: 'Functional requirements', status: DeliverableStatus.NOT_STARTED, stage: DeliverableStage.PLANNING },
                { title: 'UI/UX Design', description: 'Wireframes and mockups', status: DeliverableStatus.NOT_STARTED, stage: DeliverableStage.DESIGN }
              ]
            }
          },
          {
            type: PhaseType.SCRUM,
            name: 'Development',
            deliverables: {
              create: [
                { title: 'Sprint 1 Code', description: 'Initial MVP', status: DeliverableStatus.NOT_STARTED, stage: DeliverableStage.DEVELOPMENT },
                { title: 'API Documentation', description: 'Swagger/OpenAPI docs', status: DeliverableStatus.NOT_STARTED, stage: DeliverableStage.DEVELOPMENT }
              ]
            }
          },
          {
            type: PhaseType.FALL,
            name: 'Deployment & Closing',
            deliverables: {
              create: [
                { title: 'Test Plan', description: 'QA testing procedures', status: DeliverableStatus.NOT_STARTED, stage: DeliverableStage.TESTING },
                { title: 'User Manual', description: 'End-user guide', status: DeliverableStatus.NOT_STARTED, stage: DeliverableStage.DEPLOYMENT },
                { title: 'Final Report', description: 'Conclusion and results', status: DeliverableStatus.NOT_STARTED, stage: DeliverableStage.DEPLOYMENT }
              ]
            }
          },
        ]
      }
    }
  })

  console.log(`✅ Created project "${project.name}" with default phases and deliverables`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })