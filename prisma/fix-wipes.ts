import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 尋找乾濕兩用巾 Product
  const product = await prisma.product.findFirst({
    where: { name: { contains: '乾濕兩用巾' } },
    include: { assets: true }
  })

  if (!product) {
    console.log('找不到「乾濕兩用巾」商品')
    return
  }

  // 1. 更新官網的 Asset URL
  const officialAsset = product.assets.find(a => a.type === 'official_url' || a.title.includes('官網'))
  if (officialAsset) {
    await prisma.asset.update({
      where: { id: officialAsset.id },
      data: { url: 'https://www.mamaway.com.tw/product-detail/A202250882WF/' }
    })
    console.log('✅ 已更新官網連結')
  }

  // 2. 更新主視覺的 Asset URL
  const imgAsset = product.assets.find(a => a.type === 'product_img')
  if (imgAsset) {
    await prisma.asset.update({
      where: { id: imgAsset.id },
      data: { url: 'https://cdn-mamaway-tw-rwd-new.shang-yu.com//upload_files/fonlego-rwd/prodpic/D_A202250882-900.jpg' }
    })
    console.log('✅ 已更新商品主視覺圖片')
  }

  console.log('乾濕兩用巾資料已成功修正！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
