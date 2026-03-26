import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.reply.deleteMany()
  await prisma.asset.deleteMany()
  await prisma.product.deleteMany()

  const p1 = await prisma.product.create({
    data: {
      name: "超彈力無縫托腹帶",
      pitch: "從孕期到產後，完美支撐不勒肚",
      coreSellingPoints: "✅ 無縫編織不刺癢\n✅ 業界最強彈力，大肚不緊繃\n✅ 產後可當束腹帶",
      problemsSolved: "✔ 孕晚期腰痠背痛\n✔ 肚子下墜感\n✔ 一般托腹帶流汗悶熱搔癢",
      targetAudience: "🔸 懷孕 4 個月以上媽咪\n🔸 會腰痠、恥骨痛的媽咪",
      salesTips: "🌟 銷售時請讓客人親手拉拉看彈力\n🌟 強調『買一條抵兩條』，產後也能繼續穿",
      bossNotes: "📌 [老闆叮嚀] 這款的紗線成本是市面上兩倍，所以我們絕不打價格戰，講究的是包覆性跟親膚度。",
      replies: {
        create: [
          { content: "媽咪您好，這款托腹帶採用專利無縫編織，非常透氣，即使夏天穿也很舒服喔！", scenario: "客人詢問是否悶熱", note: "溫和安撫型", isPremium: true },
          { content: "這款材質彈性極佳，從孕期可以一路穿到產後作為束腹帶，非常超值！", scenario: "客人覺得單價高", note: "強調 CP 值", isPremium: true }
        ]
      },
      assets: {
        create: [
          { title: "商品主視覺", type: "product_img", url: "https://via.placeholder.com/600x400?text=Mamaway+Product", sortOrder: 1 },
          { title: "媽咪實穿分享", type: "testimonial_img", url: "https://via.placeholder.com/600x400?text=Testimonial", note: "可用於社群貼文", sortOrder: 2 },
          { title: "介紹影片", type: "video_link", url: "https://youtube.com/watch?v=12345", sortOrder: 3 }
        ]
      }
    }
  })

  const p2 = await prisma.product.create({
    data: {
      name: "抗菌防溢乳墊",
      pitch: "乾爽不回滲，保護脆弱肌膚",
      coreSellingPoints: "✅ 瞬吸 100ml 不回滲\n✅ 醫療級抗菌材質\n✅ 3D 立體剪裁超服貼",
      problemsSolved: "✔ 溢乳沾濕衣服的尷尬\n✔ 乳頭摩擦悶痛\n✔ 異味滋生",
      targetAudience: "🔸 產後哺乳媽咪\n🔸 奶量豐沛的媽咪",
      salesTips: "🌟 可拿我們家與他牌比較，滴水測試吸水力\n🌟 強調厚度極薄，穿著不突兀",
      bossNotes: "📌 [DNA] 母乳富含營養容易滋生細菌，抗菌功能才是防溢乳墊最核心的價值。",
      replies: {
        create: [
          { content: "您好，我們的防溢乳墊有獨家抗菌塗層，能避免母乳細菌滋生導致乳頭發炎喔！", scenario: "客人詢問與一般品牌差異", note: "教育引導型", isPremium: true },
          { content: "這款厚度不到 2mm，墊在內衣裡完全看不出痕跡，吸水後也不會結塊變硬。", scenario: "客人擔心穿衣服不好看", note: "破除疑慮", isPremium: true }
        ]
      },
      assets: {
        create: [
          { title: "吸水測試圖", type: "scenario_img", url: "https://via.placeholder.com/600x400?text=Water+Test", note: "回覆私訊好用", sortOrder: 1 }
        ]
      }
    }
  })

  const p3 = await prisma.product.create({
    data: {
      name: "全效嬰兒推車坐墊",
      pitch: "恆溫透氣，寶寶出門不爆汗",
      coreSellingPoints: "✅ 智慧調溫材質\n✅ 適用市面 99% 推車\n✅ 機洗不變形",
      problemsSolved: "✔ 寶寶坐推車流汗起紅疹\n✔ 推車布面不易清洗",
      targetAudience: "🔸 準備帶寶寶出遊的父母\n🔸 怕熱寶寶",
      salesTips: "🌟 請客人摸摸看表面的涼感\n🌟 提醒媽媽：常常洗坐墊比洗推車方便多了",
      bossNotes: "📌 [老闆筆記] 材質是我們找了半年才敲定的NASA太空衣布料，千萬別說它只是普通的涼感布。",
      replies: {
        create: [
          { content: "媽咪你好，這款坐墊是可以丟洗衣機機洗的喔！建議套洗衣袋用冷水柔洗模式。", scenario: "客人詢問如何清潔", note: "正確衛教", isPremium: true },
          { content: "我們採用太空級恆溫材質，不是普通的化學涼感，所以在冷氣房也不會讓寶寶覺得太冷。", scenario: "客人詢問涼感材質會不會感冒", note: "突顯材質優勢", isPremium: true }
        ]
      },
      assets: {
        create: [
          { title: "官網詳情頁", type: "official_url", url: "https://www.mamaway.com/tw", sortOrder: 1 },
          { title: "清洗教學影片", type: "video_link", url: "https://youtube.com/watch?v=67890", note: "售後服務必備", sortOrder: 2 }
        ]
      }
    }
  })

  console.log("Database seeded successfully with 3 products.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
