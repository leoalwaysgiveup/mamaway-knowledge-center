import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 將所有 isPremium 為 true 的回覆標記為 isFAQ
  const result = await prisma.reply.updateMany({
    where: { isPremium: true },
    data: { isFAQ: true }
  })
  console.log(`✅ 已將 ${result.count} 筆優質回覆標記為 FAQ`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
