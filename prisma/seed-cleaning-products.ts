import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

/**
 * 新增 5 項 Mamaway 清潔用品到資料庫
 * 商品資料來自 Mamaway 官網 + 專業知識整理
 */
async function main() {
  console.log("🧹 開始新增 5 項清潔用品...")

  // ─────────────────────────────────────
  // 1. 防蟎嬰兒洗衣精
  // ─────────────────────────────────────
  const p1 = await prisma.product.create({
    data: {
      name: "防蟎抗菌嬰兒洗衣精",
      pitch: "植萃 2 倍濃縮，防蟎抗菌一次搞定",
      description: "採用 ECOCERT 認證植萃 APG 潔淨成分（萃取自玉米及椰子油），搭配美國 EPA 認可的 SILVÉRION® 2400 檸檬酸銀離子，實驗室檢測抑菌率達 99.9%。2 倍濃縮配方更經濟，細緻泡沫好沖洗，不殘留。成分 100% 可生物分解，溫和守護寶寶也愛護地球。",
      ingredients: "去離子水、月桂醇聚醚硫酸酯鈉、癸基葡萄糖苷（APG 植萃）、椰油醯胺丙基甜菜鹼、檸檬酸銀（SILVÉRION® 2400）、氯己定二葡萄糖酸鹽、脂肪酸蔗糖酯（食品級防蟎成分）",
      tags: ["洗衣精", "防蟎", "抗菌", "嬰兒", "植萃", "洗沐護理"],
      coreSellingPoints: "✅ SILVÉRION® 2400 檸檬酸銀離子，實驗室檢測抑菌率 99.9%\n✅ ECOCERT 認證植萃 APG 成分，萃取自玉米及椰子油\n✅ 2 倍濃縮配方，省量又經濟\n✅ 食品級脂肪酸蔗糖酯，有效預防塵蟎\n✅ 成分 100% 可生物分解，環保無負擔\n✅ 不含螢光劑、漂白劑、磷、PARABEN",
      problemsSolved: "✔ 寶寶衣物上的奶漬、口水漬、食物殘留難清洗\n✔ 一般洗衣精含化學成分，擔心刺激寶寶肌膚\n✔ 寶寶貼身衣物擔心塵蟎滋生\n✔ 洗劑殘留讓媽媽不安心",
      targetAudience: "🔸 家有 0-3 歲寶寶的新手爸媽\n🔸 對化學洗劑敏感、重視天然成分的家庭\n🔸 寶寶有異位性皮膚炎或敏感肌膚\n🔸 注重環保的消費者",
      salesTips: "🌟 強調「植萃 + 銀離子」雙效配方，市面上少有\n🌟 讓客人聞聞看天然草本香氣，不刺鼻很舒服\n🌟 提醒 2 倍濃縮很省，一瓶可以用很久\n🌟 跟客人說紗布巾、包巾、口水巾都適合用這罐洗",
      bossNotes: "📌 [老闆叮嚀] 這款洗衣精的銀離子技術是美國 EPA 認可的，這是我們跟一般嬰兒洗衣精最大差異化的地方。不要只講『溫和』，要強調抗菌防蟎的科學根據。成分 100% 可生物分解也是很重要的賣點。",
      replies: {
        create: [
          {
            content: "媽咪您好！我們的防蟎洗衣精使用美國 EPA 認可的銀離子抗菌技術，搭配食品級防蟎成分，不只洗得乾淨，還能幫寶寶的貼身衣物建立防蟎屏障喔！而且成分 100% 可生物分解，對環境也很友善呢～",
            scenario: "客人詢問跟一般嬰兒洗衣精有什麼不同",
            note: "突顯技術差異化",
            isPremium: true
          },
          {
            content: "這款是 2 倍濃縮配方，所以每次只需要一般用量的一半就夠了，其實算下來非常經濟實惠！而且用植萃 APG 成分，泡沫細緻好沖洗，不會有殘留的問題。",
            scenario: "客人覺得價格偏高",
            note: "強調濃縮划算 + 品質",
            isPremium: true
          },
          {
            content: "完全可以！紗布巾、包巾、口水巾、圍兜兜這些寶寶每天會接觸到的都很適合用這罐洗。不含螢光劑和漂白劑，洗完衣服摸起來很柔軟自然。",
            scenario: "客人問適合洗哪些嬰兒用品",
            note: "拓展使用場景",
            isPremium: false
          }
        ]
      },
      assets: {
        create: [
          { title: "商品主視覺", type: "product_img", url: "https://www.mamaway.com.tw/upload_files/fonlego-rwd/prodpic/A715220106-900-02.jpg", sortOrder: 1 },
          { title: "使用見證分享", type: "testimonial_img", url: "https://cdn-mamaway-tw-rwd-new.shang-yu.com/upload_files/fonlego-rwd/website/%E6%88%AA%E5%9C%96%202025-10-07%20%E6%99%9A%E4%B8%8A100106.png", note: "媽咪真實使用心得", sortOrder: 2 },
          { title: "官網商品頁", type: "official_url", url: "https://www.mamaway.com.tw/product-detail/A715220106/", sortOrder: 3 }
        ]
      }
    }
  })
  console.log(`  ✅ 已新增：${p1.name}`)

  // ─────────────────────────────────────
  // 2. 奶瓶蔬果清潔劑
  // ─────────────────────────────────────
  const p2 = await prisma.product.create({
    data: {
      name: "奶瓶蔬果洗潔精",
      pitch: "pH 5.5 溫和不刺激，奶瓶蔬果碗盤一瓶搞定",
      description: "pH 5.5 弱酸性配方，溫和不傷手也不傷寶寶餐具。植物萃取潔淨成分，有效去除奶垢與殘留農藥。不含磷、甲醛、壬基酚、螢光劑、漂白劑、PARABEN 等有害物質。符合 CNS3800 國家標準，有效界面活性劑含量 15% 以上，生物分解度超過 90%。",
      ingredients: "植物萃取界面活性劑、去離子水（pH 5.5 弱酸性配方）。不含磷、甲醛、壬基酚、螢光劑、漂白劑、PARABEN。",
      tags: ["奶瓶", "蔬果", "清潔劑", "洗碗", "嬰兒", "洗沐護理"],
      coreSellingPoints: "✅ pH 5.5 弱酸性，溫和不刺激寶寶餐具\n✅ 植物萃取成分，天然安心\n✅ 一瓶多用：奶瓶、奶嘴、蔬果、碗盤都能洗\n✅ 符合 CNS3800 國家標準\n✅ 生物分解度 > 90%\n✅ 不含六大有害物質（磷、甲醛、壬基酚、螢光劑、漂白劑、PARABEN）",
      problemsSolved: "✔ 奶瓶奶垢難清洗，擔心清潔劑殘留\n✔ 一般洗碗精太強，不敢用在寶寶餐具上\n✔ 蔬果農藥殘留讓媽媽擔心\n✔ 媽媽洗奶瓶手容易乾裂",
      targetAudience: "🔸 正在瓶餵或混餵的媽咪\n🔸 開始吃副食品的寶寶家庭\n🔸 重視食品安全的家長\n🔸 手部肌膚敏感的照顧者",
      salesTips: "🌟 強調 pH 5.5 跟人體肌膚相近，洗完手不乾澀\n🌟 一瓶可洗奶瓶、蔬果、碗盤，帶出門也方便\n🌟 建議搭配奶瓶刷使用效果更好\n🌟 提醒客人一壓大約 3.5g，加 1 公升水就夠用",
      bossNotes: "📌 [老闆叮嚀] 這罐的定位是『安心到可以洗蔬果的嬰兒清潔劑』——這句話要讓客人記住。符合國家標準不是噱頭，是我們的底氣。",
      replies: {
        create: [
          {
            content: "媽咪您好！我們這款清潔劑是 pH 5.5 弱酸性的，跟寶寶肌膚酸鹼值接近，洗奶瓶、奶嘴甚至蔬果都可以用，而且不含螢光劑和甲醛，沖洗後不殘留，可以很放心喔！",
            scenario: "客人問是否安全、會不會殘留",
            note: "標準安心回覆",
            isPremium: true
          },
          {
            content: "這瓶是多功能的喔！除了洗奶瓶、奶嘴之外，寶寶的碗盤湯匙、甚至買回來的水果蔬菜都可以用它來清洗。一壓大約 3.5 克加 1 公升水就很夠用了，很經濟！",
            scenario: "客人問除了奶瓶還能洗什麼",
            note: "拓展使用場景",
            isPremium: true
          }
        ]
      },
      assets: {
        create: [
          { title: "商品主視覺", type: "product_img", url: "https://www.mamaway.com.tw/upload_files/fonlego-rwd/prodpic/A715220107-900-02.jpg", sortOrder: 1 },
          { title: "官網商品頁", type: "official_url", url: "https://www.mamaway.com.tw/product-detail/A715220107/", sortOrder: 2 }
        ]
      }
    }
  })
  console.log(`  ✅ 已新增：${p2.name}`)

  // ─────────────────────────────────────
  // 3. 抗菌噴霧
  // ─────────────────────────────────────
  const p3 = await prisma.product.create({
    data: {
      name: "抗菌噴霧",
      pitch: "無酒精、無色無味，噴了擦一擦就能抗菌 24 小時",
      description: "含美國 EPA 認可 SILVÉRION® 2400 檸檬酸銀離子及衛福部核准之氯己定（Chlorhexidine）抑菌成分，pH 5.0 溫和不刺激。不含酒精、次氯酸、腐蝕性化學添加物，對寶寶及敏感肌友善。噴灑後擦拭即可達到 24 小時抗菌效果，有效對抗新冠病毒、腸病毒、諾羅病毒及流感病毒。",
      ingredients: "檸檬酸銀離子（SILVÉRION® 2400，美國 EPA 認可）、氯己定二葡萄糖酸鹽（衛福部核可抑菌成分）、去離子水。pH 5.0，無酒精、無次氯酸。",
      tags: ["抗菌", "噴霧", "消毒", "銀離子", "嬰兒", "洗沐護理"],
      coreSellingPoints: "✅ 美國 EPA 認可 SILVÉRION® 2400 銀離子抗菌\n✅ 24 小時長效抗菌保護\n✅ pH 5.0 溫和，寶寶及敏感肌可用\n✅ 無酒精、無次氯酸、無腐蝕性添加\n✅ 有效對抗新冠、腸病毒、諾羅、流感病毒\n✅ 噴了擦一擦免沖洗，使用超方便",
      problemsSolved: "✔ 外出時無法隨時洗手消毒\n✔ 酒精消毒刺激寶寶皮膚\n✔ 推車、餐椅、玩具等無法水洗的物品需要消毒\n✔ 公共場所接觸擔心病菌傳染",
      targetAudience: "🔸 經常帶寶寶外出的家庭\n🔸 腸病毒/流感季節的防護需求\n🔸 月子中心/托嬰中心的環境消毒\n🔸 對酒精過敏的成人或寶寶",
      salesTips: "🌟 強調『無酒精但抗菌力不打折』，噴了擦一擦就好\n🌟 腸病毒季節是銷售旺季，要主動推薦\n🌟 建議客人包包放一瓶 100ml、家裡放 300ml 大瓶\n🌟 提醒不要用金屬瓶分裝，因銀離子會沉澱，用 PET/HDPE/PP 塑膠瓶",
      bossNotes: "📌 [老闆叮嚀] 銀離子遇光會產生黑色沉澱是正常的，不影響抗菌效果。門市同事要先知道這件事，客人如果問就解釋清楚，建議存放在避光處。這款的核心價值是『無酒精卻有醫療級抗菌力』，不要跟一般酒精噴霧比價格。",
      replies: {
        create: [
          {
            content: "媽咪您好！我們這款噴霧完全不含酒精，是用美國 EPA 認可的銀離子技術抗菌的，pH 5.0 很溫和。噴在推車、餐椅、玩具上擦一擦就好，不用沖洗，而且可以維持 24 小時的抗菌效果喔！",
            scenario: "客人問跟酒精噴霧有什麼不同",
            note: "突顯無酒精 + 長效優勢",
            isPremium: true
          },
          {
            content: "可以的！除了寶寶的物品之外，大人的手機、門把、桌面都可以噴。只是要注意不要噴在大理石上面（銀離子可能留痕），另外分裝的話請用塑膠瓶，不要用金屬瓶喔。",
            scenario: "客人問除了嬰兒用品外，其他地方能不能用",
            note: "擴大適用範圍 + 使用注意事項",
            isPremium: true
          },
          {
            content: "腸病毒和諾羅病毒用酒精是殺不死的，但我們這款銀離子噴霧經過實驗證實可以有效對抗這些病毒！腸病毒季節帶寶寶去公園、親子餐廳，先噴一下會比較安心。",
            scenario: "腸病毒季節家長擔心傳染",
            note: "專業衛教型回覆，突顯產品價值",
            isPremium: true
          }
        ]
      },
      assets: {
        create: [
          { title: "商品主視覺", type: "product_img", url: "https://www.mamaway.com.tw/upload_files/fonlego-rwd/prodpic/A717220310-900-03.jpg", sortOrder: 1 },
          { title: "官網商品頁（100ml 隨身瓶）", type: "official_url", url: "https://www.mamaway.com.tw/product-detail/A717220310/", sortOrder: 2 }
        ]
      }
    }
  })
  console.log(`  ✅ 已新增：${p3.name}`)

  // ─────────────────────────────────────
  // 4. 抗菌洗手慕斯
  // ─────────────────────────────────────
  const p4 = await prisma.product.create({
    data: {
      name: "蘆薈抗菌洗手慕斯",
      pitch: "洗 30 秒抗菌 99.9%，洗完不乾澀",
      description: "結合 SILVÉRION® 2400 七效草本抗菌配方（百里香、鼠尾草、迷迭香、印楝、岩蘭草、苦橙、蘆薈），pH 5.5 溫和弱酸性。三合一功能：抗菌、溫和潔淨、保濕。洗手 30 秒即可達到 99.9% 抗菌效果，有效對抗腸病毒、輪狀病毒、新冠病毒。通過美國 EPA、SGS 及歐盟嚴格檢測。",
      ingredients: "SILVÉRION® 2400 七效草本抗菌成分（百里香、鼠尾草、迷迭香、印楝、岩蘭草、苦橙、蘆薈）、植物性界面活性劑。pH 5.5 弱酸性。",
      tags: ["洗手", "慕斯", "抗菌", "蘆薈", "嬰兒", "洗沐護理"],
      coreSellingPoints: "✅ 七效草本 SILVÉRION® 2400 抗菌配方\n✅ 洗手 30 秒達 99.9% 抗菌效果\n✅ pH 5.5 溫和弱酸性，洗完雙手不乾澀\n✅ 三合一：抗菌 + 潔淨 + 保濕\n✅ 有效對抗腸病毒、輪狀病毒、新冠病毒\n✅ 通過美國 EPA、SGS、歐盟檢測認證",
      problemsSolved: "✔ 一般洗手乳洗完手很乾澀\n✔ 小孩不愛洗手，需要溫和又有趣的產品\n✔ 擔心肥皂或洗手乳的化學成分傷害寶寶皮膚\n✔ 腸病毒/輪狀病毒用酒精無效，需要更有效的洗手方案",
      targetAudience: "🔸 有幼兒的家庭（寶寶開始到處探索、愛摸東西的階段）\n🔸 腸病毒/流感季節加強防護\n🔸 月子中心、托嬰中心、幼兒園\n🔸 手部肌膚乾燥敏感的媽咪",
      salesTips: "🌟 慕斯質地小朋友很喜歡，可以培養洗手好習慣\n🌟 強調洗完手不乾澀，媽媽自己也會愛用\n🌟 搭配抗菌噴霧一起推薦，居家 + 外出全方位防護\n🌟 350ml 用完可以買 1000ml 補充包比較經濟環保",
      bossNotes: "📌 [老闆叮嚀] 這款的七效草本配方是我們的獨家技術。市面上洗手慕斯很多，但能做到抗菌 + 保濕 + 溫和三合一的很少。門市可以讓客人試洗看看，體驗洗完手的觸感，這是最直接的銷售方式。",
      replies: {
        create: [
          {
            content: "媽咪您好～我們這款慕斯用的是七效草本抗菌配方，包含蘆薈保濕成分，洗完手不會乾乾的喔！pH 5.5 跟寶寶肌膚接近，大人小孩都適合用～您要不要試擠一點洗看看？",
            scenario: "客人在門市看到洗手慕斯",
            note: "體驗式銷售",
            isPremium: true
          },
          {
            content: "腸病毒用酒精其實是殺不死的喔！但我們這款洗手慕斯經過 SGS 檢測，對腸病毒、輪狀病毒都有效。建議小朋友回到家第一件事就是用慕斯洗手 30 秒，養成好習慣最重要！",
            scenario: "腸病毒季節家長詢問防護",
            note: "專業衛教 + 建議",
            isPremium: true
          }
        ]
      },
      assets: {
        create: [
          { title: "商品主視覺", type: "product_img", url: "https://www.mamaway.com.tw/upload_files/fonlego-rwd/prodpic/A716220214-900.jpg", sortOrder: 1 },
          { title: "官網商品頁", type: "official_url", url: "https://www.mamaway.com.tw/product-detail/A716220214/", sortOrder: 2 }
        ]
      }
    }
  })
  console.log(`  ✅ 已新增：${p4.name}`)

  // ─────────────────────────────────────
  // 5. 嬰兒超柔濕紙巾 (乾濕兩用巾)
  // ─────────────────────────────────────
  const p5 = await prisma.product.create({
    data: {
      name: "嬰兒超柔乾濕兩用巾",
      pitch: "100% 天然棉不含防腐劑，乾濕兩用最安心",
      description: "100% 天然純棉嫘縈無紡布製成，不含防腐劑、刺激物質、可遷移螢光劑及重金屬，通過 SGS 檢測。乾用可當清潔紗布；加水沾濕後可替代濕紙巾使用，避免防腐劑接觸寶寶肌膚的疑慮。質地柔軟細緻、透氣不掉屑，採用特殊壓紋與醫療級棉材，撕不破不掉棉絮。自動化無菌包裝產線生產。",
      ingredients: "100% 天然純棉嫘縈無紡布。不含防腐劑、螢光劑、重金屬、刺激物質。通過 SGS 安全檢測。",
      tags: ["濕紙巾", "乾濕兩用", "紗布巾", "棉巾", "嬰兒", "洗沐護理"],
      coreSellingPoints: "✅ 100% 天然純棉嫘縈，柔軟親膚\n✅ 不含防腐劑，比傳統濕紙巾更安心\n✅ 乾濕兩用：乾用擦拭、沾水替代濕紙巾\n✅ 特殊壓紋設計，撕不破不掉棉絮\n✅ 通過 SGS 檢測，無螢光劑、無重金屬\n✅ 自動化無菌包裝，衛生有保障",
      problemsSolved: "✔ 傳統濕紙巾含防腐劑，擔心長期使用傷害寶寶肌膚\n✔ 一般紗布擦一擦就破、掉棉絮\n✔ 外出攜帶紗布巾不方便\n✔ 需要一款既能乾用又能濕用的萬用巾",
      targetAudience: "🔸 新生兒家庭（擦臉、擦口水、擦屁屁）\n🔸 擔心防腐劑的爸媽\n🔸 需要外出攜帶方便的清潔用品\n🔸 大人日常卸妝、清潔也適用",
      salesTips: "🌟 讓客人摸摸看材質，柔軟度跟厚度是最大說服力\n🌟 強調「這不是濕紙巾，是無防腐劑的乾棉巾」——觀念翻轉最重要\n🌟 外出可帶 12 抽隨身包，在家用 80 抽盒裝\n🌟 大人卸妝洗臉也超好用，全家都能用",
      bossNotes: "📌 [老闆叮嚀] 很多客人會把這個當成濕紙巾，但其實它是乾的棉巾。門市一定要解釋清楚：因為不含防腐劑所以做成乾的，要用的時候沾水就變濕的了。這個觀念翻轉很重要，翻過來客人就會覺得我們的產品更安全。",
      replies: {
        create: [
          {
            content: "媽咪～這款其實不是傳統的濕紙巾喔！它是 100% 純棉的乾綿巾，因為不含防腐劑所以做成乾的型態。您要用的時候噴點水或沾水就變成濕的了，這樣不會有防腐劑接觸寶寶皮膚的問題，特別是擦臉擦嘴的時候，會比一般濕紙巾安心很多！",
            scenario: "客人以為是普通濕紙巾",
            note: "關鍵觀念翻轉回覆",
            isPremium: true
          },
          {
            content: "這款棉巾用了特殊壓紋和醫療級棉材，所以撕不破也不掉棉絮。擦屁屁、擦臉都很好用。而且大人也可以拿來卸妝、擦手，一包全家都能用！出門帶 12 抽小包放包包裡很方便。",
            scenario: "客人問品質跟用途",
            note: "強調品質 + 拓展使用場景",
            isPremium: true
          }
        ]
      },
      assets: {
        create: [
          { title: "商品主視覺", type: "product_img", url: "https://www.mamaway.com.tw/upload_files/fonlego-rwd/prodpic/A202260878-900.jpg", sortOrder: 1 },
          { title: "官網商品頁", type: "official_url", url: "https://www.mamaway.com.tw/product-detail/A202260878WF/", sortOrder: 2 }
        ]
      }
    }
  })
  console.log(`  ✅ 已新增：${p5.name}`)

  console.log("\n🎉 完成！已成功新增 5 項清潔用品。")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
