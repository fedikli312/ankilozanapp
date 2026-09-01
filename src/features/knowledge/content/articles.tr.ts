import type { KnowledgeArticle } from "../types";

/**
 * Turkish Knowledge Hub content — Product 2.0 Phase P. Mirrors
 * `articles.en.ts` 1:1 by `id` (enforced by a Jest parity test). See
 * `types.ts` for why this content lives here rather than in `tr.json`.
 * Informal "sen" register throughout, matching the rest of the app.
 */
export const KNOWLEDGE_ARTICLES_TR: KnowledgeArticle[] = [
  {
    id: "what-is-as",
    category: "basics",
    icon: "book-outline",
    title: "Ankilozan spondilit nedir?",
    summary: "Durumu kısa ve sade bir dille tanıyan bir giriş.",
    readTime: "2 dk",
    keyPoints: [
      "Öncelikle omurgayı ve sakroiliak eklemleri etkileyen, uzun süreli bir iltihabi durum",
      "Belirtiler genellikle aylar veya yıllar içinde yavaşça ortaya çıkar",
      "Kesin bir tedavisi yok, ama tedavi ve hareket yönetmene yardımcı olabilir",
    ],
    sections: [
      {
        heading: "Uzun süreli, iltihabi bir durum",
        body: "Ankilozan spondilit (AS), özellikle omurganın leğen kemiğiyle birleştiği bölgede ve omurga boyunca iltihaba yol açar. Zamanla bazı kişiler sırtlarında esneklik azalması fark eder.",
      },
      {
        heading: "Genellikle nasıl ortaya çıkar",
        body: "Özellikle sabahları ya da dinlendikten sonra hissedilen sırt ağrısı ve tutukluk, en yaygın erken belirtilerdir. Yorgunluk ve vücudun başka bölgelerinde eklem rahatsızlığı da görülebilir.",
      },
      {
        heading: "Kişiden kişiye çok değişir",
        body: "AS'nin günlük yaşamı nasıl etkilediği kişiden kişiye büyük farklılık gösterir — bazıları uzun vadede çok iyi idare ederken, bazılarının daha fazla desteğe ihtiyacı olabilir. Tek bir sabit yol yok.",
      },
      {
        heading: "Yönetilir, iyileştirilmez",
        body: "Şu an AS için kesin bir tedavi yok, ama hareket, tedavi ve düzenli takibin bir araya gelmesi çoğu kişinin belirtilerini yönetmesine ve aktif kalmasına yardımcı olabilir.",
      },
    ],
    sources: [
      { organization: "NHS", title: "Ankylosing spondylitis", url: "https://www.nhs.uk/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
      { organization: "Versus Arthritis", title: "Ankylosing spondylitis", url: "https://versusarthritis.org/about-arthritis/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "axspa-and-as",
    category: "basics",
    icon: "layers-outline",
    title: "Aksiyel spondiloartrit ile AS arasındaki ilişki",
    summary: "Farklı kaynaklarda farklı şekillerde karşına çıkabilecek iki ilişkili terim.",
    readTime: "2 dk",
    keyPoints: [
      "Aksiyel spondiloartrit (aksSpA), daha geniş kapsamlı bir şemsiye terimdir",
      "Ankilozan spondilit, röntgende değişikliklerin görülebildiği biçimidir",
      "Röntgen dışı (non-radyografik) aksSpA, aynı sürecin bu değişiklikler görünmeden önceki halini tanımlar",
    ],
    sections: [
      {
        heading: "Tek şemsiye, iki isim",
        body: "Aksiyel spondiloartrit (aksSpA), öncelikle omurga ve leğen kemiğini etkileyen iltihabi bir süreci tanımlar. Ankilozan spondilit bunun belirli bir biçimidir — iki terim yakından ilişkilidir ama her zaman birebir aynı anlamda kullanılmaz.",
      },
      {
        heading: "Aralarındaki fark",
        body: "Sakroiliak eklemlerin röntgeninde yapısal değişiklikler görüldüğünde AS tanısı konur. Aynı iltihabi örüntü olup henüz röntgende görünür bir değişiklik yoksa, genellikle röntgen dışı (non-radyografik) aksSpA olarak adlandırılır.",
      },
      {
        heading: "İki ayrı hastalık değil",
        body: "Röntgen dışı aksSpA ve AS, aynı altta yatan durumun farklı görünürlük noktaları olarak kabul edilir. Röntgen dışı aksSpA zamanla röntgende değişiklik gösterebilir, ama bu her zaman olmaz.",
      },
      {
        heading: "Terimlerin neden değiştiğini",
        body: "Farklı yerlerde — doktor mektuplarında, araştırmalarda ya da bu uygulamada — iki terimden birini görebilirsin. Karşına çıkan bir terim net değilse, bunu doğrudan romatoloji ekibine sormak makul bir seçenek.",
      },
    ],
    sources: [
      { organization: "Versus Arthritis", title: "Ankylosing spondylitis", url: "https://versusarthritis.org/about-arthritis/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
      { organization: "Spondylitis Association of America", title: "Ankylosing Spondylitis", url: "https://spondylitis.org/about-spondylitis/overview-of-spondyloarthritis/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "morning-stiffness",
    category: "symptoms",
    icon: "time-outline",
    title: "Sabah tutukluğu neden takip edilir?",
    summary: "AS'ye bağlı tutukluğu ayırt eden özellik, ve süresini not etmenin faydası.",
    readTime: "2 dk",
    keyPoints: [
      "30 dakika veya daha uzun süren, hareketle azalan tutukluk AS'de bilinen bir örüntüdür",
      "Genellikle dinlenme sonrası ortaya çıkar — uyku sonrası ya da uzun süre oturduktan sonra",
      "Süresini zaman içinde takip etmek, senin ve sağlık ekibinin örüntüleri fark etmesine yardımcı olabilir",
    ],
    sections: [
      {
        heading: "Tanınabilir bir örüntü",
        body: "Yarım saat veya daha uzun süren ve hareketle yavaşça azalan sabah sırt tutukluğu, AS gibi iltihabi sırt ağrısında sık tarif edilen bir örüntüdür — hızlı geçen alışılagelmiş kas tutukluğundan farklıdır.",
      },
      {
        heading: "Dinlenmek her zaman iyileştirmez",
        body: "Uzun süre hareketsiz kalmanın ardından (gece uykusu, uzun bir yolculuk, masa başında oturmak) ortaya çıkan tutukluk bilinen bir özelliktir — genellikle iyileştiren şey dinlenme değil, hareket etmektir.",
      },
      {
        heading: "Kendi kaydının neden önemli olduğu",
        body: "Herkesin kendi başlangıç noktası farklıdır. Tutukluğunun ne kadar sürdüğünü gün gün kaydetmek, sana özgü bir tablo oluşturur — anlık yorumlamak yerine, geriye dönüp bakmak için değerlidir.",
      },
    ],
    tip: {
      heading: "Bilmen iyi olabilir",
      body: "Tek bir tutuk sabah tek başına fazla bir şey söylemez — günler ve haftalar içindeki örüntü genellikle daha bilgilendiricidir.",
    },
    sources: [
      { organization: "Versus Arthritis", title: "Ankylosing spondylitis", url: "https://versusarthritis.org/about-arthritis/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
      { organization: "NHS inform", title: "Ankylosing spondylitis (AS)", url: "https://www.nhsinform.scot/illnesses-and-conditions/muscle-bone-and-joints/neck-and-back-problems-and-conditions/ankylosing-spondylitis", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "pain-and-fatigue",
    category: "symptoms",
    icon: "body-outline",
    title: "Ağrı ve yorgunluk hakkında bilmen gerekenler",
    summary: "AS ile yaşarken en sık karşılaşılan iki günlük deneyim.",
    readTime: "3 dk",
    keyPoints: [
      "Ağrı ve yorgunluk AS'de yaygındır ve birbirinden bağımsız değişebilir",
      "AS'deki yorgunluk genellikle iltihap, uyku kalitesi ve ağrının birlikte etkisiyle ilişkilidir — sadece yorgunluk değildir",
      "İkisini de düzenli ve dürüstçe kaydetmek, tek bir günü yargılamaktan daha faydalıdır",
    ],
    sections: [
      {
        heading: "Ağrı gelip gidebilir",
        body: "AS'ye bağlı ağrı genellikle gün gün değişir ve her zaman tahmin edilebilir bir örüntü izlemez. Bazı günler net bir tek nedeni olmadan daha zor geçer.",
      },
      {
        heading: "Yorgunluk sadece yorgun olmaktan fazlasıdır",
        body: "AS gibi iltihabi durumlardaki yorgunluk, günlük yorgunluktan daha ağır ve atlatılması daha zor bir yorgunluk olarak tarif edilir; iltihap, bozulan uyku ve ağrının birlikte etkisinden etkilenebilir.",
      },
      {
        heading: "Her zaman birlikte hareket etmezler",
        body: "Ağrının az olduğu bir gün, otomatik olarak yorgunluğun da az olduğu anlamına gelmez — tersi de doğrudur. Bu uygulamanın yaptığı gibi ikisini ayrı değerler olarak takip etmek, ilişkili ama farklı deneyimler olduklarını yansıtır.",
      },
      {
        heading: "Kaydının ne işe yaradığı",
        body: "Gün gün tutulan bir kayıt, en çok zaman içinde bir referans olarak faydalıdır — hem senin için, hem sağlık ekibine götürmek için — anlık olarak tek başına yorumlamak için değil.",
      },
    ],
    sources: [
      { organization: "NHS", title: "Ankylosing spondylitis", url: "https://www.nhs.uk/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
      { organization: "Versus Arthritis", title: "Ankylosing spondylitis", url: "https://versusarthritis.org/about-arthritis/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "nsaid-role",
    category: "treatment",
    icon: "medical-outline",
    title: "İltihap önleyici ilaçların genel rolü",
    summary: "NSAİİ'lere kategori düzeyinde genel bir bakış — bir öneri değil.",
    readTime: "2 dk",
    keyPoints: [
      "NSAİİ'ler, AS'ye bağlı ağrı için sıkça konuşulan bir ilaç kategorisidir",
      "Güncel kılavuzlar, düzenli olarak gözden geçirilen en düşük etkili dozu önerir",
      "Tedavi planları kişiye özgüdür ve sağlık ekibin tarafından belirlenir",
    ],
    sections: [
      {
        heading: "Sıkça kullanılan bir kategori",
        body: "Steroid olmayan iltihap önleyici ilaçlar (NSAİİ), AS'ye bağlı ağrı ve tutukluk için sıkça konuşulan bir ilaç kategorisidir; bir klinisyenin yönlendirmesiyle, fayda sağlayan en düşük dozda kullanılır.",
      },
      {
        heading: "Sabit değil, gözden geçirilir",
        body: "Güncel klinik kılavuzlar, bu ilaç kategorisinin zaman içinde güvenle kullanılmasının bir parçası olarak — ilacın ne kadar işe yaradığını kontrol etmeyi ve yan etkileri izlemeyi — sürekli bir takip olarak tarif eder.",
      },
      {
        heading: "Tasarım gereği kişiseldir",
        body: "Neyin işe yaradığı ve hangi dozda, kişiden kişiye değişir. Bu, senin kendi yanıtına ve sağlık geçmişine dayanarak romatoloji ekibinle birlikte verilen bir karardır.",
      },
    ],
    sources: [
      { organization: "NICE", title: "Spondyloarthritis in over 16s: diagnosis and management (NG65)", url: "https://www.nice.org.uk/guidance/ng65/chapter/recommendations", accessedAt: "2026-09-01" },
      { organization: "NHS", title: "Ankylosing spondylitis — Treatment", url: "https://www.nhs.uk/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "biologic-therapies",
    category: "treatment",
    icon: "flask-outline",
    title: "Biyolojik tedaviler nedir?",
    summary: "Genel, kategori düzeyinde bir açıklama — ilaca özgü bir öneri değil.",
    readTime: "2 dk",
    keyPoints: [
      "Biyolojik ilaçlar, bağışıklık/iltihap sürecinin belirli bölümlerini hedefler",
      "Bu kategorinin değerlendirilip değerlendirilmeyeceği, kişinin tedavi geçmişine ve yanıtına bağlıdır",
      "Hangi biyolojik ilacın (varsa) uygun olduğu, kişiye özgü bir klinik karardır",
    ],
    sections: [
      {
        heading: "Onları farklı kılan şey",
        body: "Genel iltihap önleyici ilaçların aksine, biyolojik tedaviler iltihap sürecinde rol oynayan belirli proteinleri hedeflemek üzere tasarlanmıştır — örneğin bazıları TNF adlı bir proteini hedefler.",
      },
      {
        heading: "Bir tedavi planına nasıl uyduğu",
        body: "Biyolojik tedavilerin ne zaman ve kimin için değerlendirileceği kişiden kişiye değişir; kişinin tedavi geçmişine ve yanıtına bağlıdır — bu, herkese aynı şekilde uygulanan sabit bir kural değil, romatoloji ekibi tarafından yapılan bir değerlendirmedir.",
      },
      {
        heading: "Ortak bir karar",
        body: "Bu kategori içinde birden fazla tür ve seçenek vardır. Kime (varsa) hangisinin uygun olabileceği, romatoloji ekibi tarafından kişiye özgü değerlendirilir — bu uygulama böyle bir değerlendirme yapmaz.",
      },
    ],
    sources: [
      { organization: "NICE", title: "Spondyloarthritis in over 16s: diagnosis and management (NG65)", url: "https://www.nice.org.uk/guidance/ng65/chapter/recommendations", accessedAt: "2026-09-01" },
      { organization: "Spondylitis Association of America", title: "Ankylosing Spondylitis — Treatment", url: "https://spondylitis.org/about-spondylitis/treatment-information/", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "movement-daily-life",
    category: "dailyLife",
    icon: "walk-outline",
    title: "Hareket ve AS ile günlük yaşam",
    summary: "Aktif kalmanın neden AS yönetiminin merkezinde görüldüğü.",
    readTime: "2 dk",
    keyPoints: [
      "Düzenli hareket, AS yönetiminin merkezi bir parçası olarak sıkça tarif edilir",
      "Uzun süreli hareketsizlik, genellikle daha fazla tutuklukla ilişkilendirilir",
      "Yavaş başlayıp kademeli olarak artırmak, yaygın ve makul bir yaklaşımdır",
    ],
    sections: [
      {
        heading: "Hareketin burada özellikle neden önemli olduğu",
        body: "Hasta dernekleri, egzersizin AS'de — birçok başka duruma kıyasla daha da belirgin şekilde — önemli bir rol oynadığını sürekli tarif eder; omurga esnekliğini ve hareket açıklığını korumaya yardımcı olur.",
      },
      {
        heading: "Dinlenmek AS için her zaman dinlendirici değildir",
        body: "Aşırı hareketsizlik, AS'de artan tutuklukla sıkça ilişkilendirilir — bu yüzden nazik ve düzenli hareket, herhangi bir tedavi planının yanında bu kadar sık vurgulanır.",
      },
      {
        heading: "Bir başlangıç noktası, bir reçete değil",
        body: "Genel kılavuzlar yavaş başlamayı ve kademeli olarak artırmayı önerir. Vücuduna ne uyduğunu tahmin etmek yerine, sağlık ekibinle ya da bir fizyoterapistle konuşmaya değer.",
      },
    ],
    tip: {
      heading: "Bilmen iyi olabilir",
      body: "Bu uygulamadaki Nefes & Postür rutinleri kısa, genel destekleyici uygulamalardır — kişiye özel bir fizyoterapi planı değildir.",
    },
    sources: [
      { organization: "Versus Arthritis", title: "Ankylosing spondylitis", url: "https://versusarthritis.org/about-arthritis/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
      { organization: "Spondylitis Association of America", title: "Spondyloarthritis and Exercise", url: "https://spondylitis.org/about-spondylitis/treatment-information/exercise/", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "desk-posture",
    category: "dailyLife",
    icon: "desktop-outline",
    title: "Oturma düzeni ve masa başı postür",
    summary: "Masa başında uzun süre geçirmek için genel, pratik fikirler.",
    readTime: "2 dk",
    keyPoints: [
      "Uzun süre tek bir pozisyonda kalmak genellikle önerilmez",
      "Sandalye yüksekliği, sırt desteği ve ekran konumu önemli rol oynar",
      "Küçük, düzenli pozisyon değişiklikleri tek bir 'mükemmel' postürden daha faydalıdır",
    ],
    sections: [
      {
        heading: "Hareket, tek bir 'doğru' postürden daha değerlidir",
        body: "Tek bir ideal pozisyonda hareketsiz kalmak yerine, gün boyunca düzenli olarak pozisyon değiştirmek — ayağa kalkmak, esnemek, sandalyeni ayarlamak — genellikle daha faydalı bir alışkanlıktır.",
      },
      {
        heading: "Çalışma alanını düzenlemek",
        body: "Destekleyici, dik bir sandalye, sırtının sandalyenin arkalığına değmesi, ekran ve klavyenin uzanmadan rahatça ulaşabileceğin mesafede olması, masa düzeni için sıkça önerilen temel noktalardır.",
      },
      {
        heading: "Küçük, düzenli molalar",
        body: "Saatlerce tek bir mükemmel pozisyonu korumaya çalışmak yerine, kısa ve sık aralıklarla ayağa kalkıp hareket etmek genellikle daha sürdürülebilirdir.",
      },
    ],
    sources: [
      { organization: "Versus Arthritis", title: "Ankylosing spondylitis", url: "https://versusarthritis.org/about-arthritis/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "sleep-routine",
    category: "dailyLife",
    icon: "bed-outline",
    title: "Uyku ve günlük rutinin",
    summary: "AS ile yaşayan bazı kişilerin faydalı bulduğu genel fikirler.",
    readTime: "2 dk",
    keyPoints: [
      "Bozulan uyku, AS ile birlikte sıkça bildirilir",
      "Uyku pozisyonu ve yatak sertliği sıkça değinilen faktörlerdir",
      "Düzenli bir rutin, başlamak için makul bir nokta",
    ],
    sections: [
      {
        heading: "Uyku ve AS genellikle birbirini etkiler",
        body: "AS ile yaşayan kişiler tarafından bozulan ya da düşük kaliteli uyku sıkça bildirilir; ağrı ya da tutukluk rahat bir pozisyon bulmayı zorlaştırabilir.",
      },
      {
        heading: "Pozisyon ve destek",
        body: "Bazı kişiler daha düz, nötr bir omurga pozisyonunda, çok sert olmayan destekleyici bir yatakta uyumanın daha rahat hissettirdiğini fark eder — bu kişiden kişiye değişir.",
      },
      {
        heading: "Rutin genel olarak yardımcı olur",
        body: "Düzenli bir uyku öncesi rutin ve sabit uyku/uyanma saatleri genel olarak faydalı uyku alışkanlıklarıdır, ve AS'yi yönetirken bunların daha az geçerli olacağına dair bir neden yok.",
      },
    ],
    sources: [
      { organization: "Versus Arthritis", title: "Ankylosing spondylitis", url: "https://versusarthritis.org/about-arthritis/conditions/ankylosing-spondylitis/", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "appointment-prep",
    category: "appointmentPrep",
    icon: "calendar-outline",
    title: "Romatoloji randevusuna hazırlanmak",
    summary: "Sınırlı bir süreden en iyi şekilde yararlanmanın pratik yolları.",
    readTime: "2 dk",
    keyPoints: [
      "Kısa bir belirti özeti, her şeyi anlık hatırlamaya çalışmaktan daha faydalıdır",
      "Güncel bir ilaç listesi getirmek zaman kazandırır",
      "Yanında biriyle gelmek ya da soruları önceden yazmak makul bir yaklaşımdır",
    ],
    sections: [
      {
        heading: "Hafızandan değil, bir özetten yararlan",
        body: "Randevular genellikle kısadır ve haftalar süren ayrıntıyı hafızadan hatırlamak herkes için zordur. Yazılı ya da uygulama üzerinden hazırlanmış kısa bir belirti özeti getirmek gerçekten faydalı olur.",
      },
      {
        heading: "İlaçlar ve son sonuçlar",
        body: "Güncel bir ilaç ve doz listesi, artı elindeki son laboratuvar ya da görüntüleme sonuçları, sağlık ekibinin sohbete hızlıca devam etmesine yardımcı olur.",
      },
      {
        heading: "Soru hazırlamak senin hakkın",
        body: "Sormak istediklerini önceden yazmak — ve faydalı olacaksa yanında biriyle gelmek — kısa bir ziyarette önemli bir şeyin atlanmamasını sağlamanın normal, makul bir yolu.",
      },
    ],
    tip: {
      heading: "Bilmen iyi olabilir",
      body: "Bu uygulamanın Randevu Hazırlığı özeti tam olarak bunun için var — yanında götürebileceğin, son check-in'lerinin, tedavilerinin ve tahlillerinin gerçek bir dökümü.",
    },
    sources: [
      { organization: "American College of Rheumatology", title: "How To Prepare for Your Rheumatology Appointment", url: "https://rheumatology.org/patient-blog/how-to-prepare-for-your-rheumatology-appointment", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "doctor-questions",
    category: "appointmentPrep",
    icon: "chatbubble-ellipses-outline",
    title: "Doktoruna sorabileceğin sorular",
    summary: "Başlangıç noktaları — bir senaryo değil, kendi sorularının yerine geçmez.",
    readTime: "2 dk",
    keyPoints: [
      "Randevuya götürülecek yanlış bir soru yoktur",
      "Bir tahlilin ya da bir sonraki adımın amacını sormak her zaman makuldür",
      "Anlaşılmayan bir şeyin tekrar açıklanmasını istemek normaldir, rahatsız edici değildir",
    ],
    sections: [
      {
        heading: "Kendi örüntün hakkında",
        body: "Son belirtilerinin daha önce anlattıklarınla nasıl karşılaştırıldığını ve fark ettiğin bir şeyin özellikle belirtilmeye değer olup olmadığını sormak makuldür.",
      },
      {
        heading: "Tahliller ve sonraki adımlar hakkında",
        body: "Belirli bir tahlilin neyi kontrol ettiğini ve sonuçlar geldikten sonra ne olacağını sormak, planı sadece takip etmek yerine anlamana yardımcı olur.",
      },
      {
        heading: "Anlaşılmayan her şey hakkında",
        body: "Bir terim ya da açıklama mantıklı gelmiyorsa, daha sade bir dille tekrar anlatılmasını istemek, iyi bir randevunun tamamen normal, beklenen bir parçasıdır.",
      },
    ],
    sources: [
      { organization: "Arthritis Foundation", title: "Questions to Ask Your Doctor", url: "https://www.arthritis.org/health-wellness/treatment/treatment-plan/you-your-doctor/questions-about-ra", accessedAt: "2026-09-01" },
      { organization: "American College of Rheumatology", title: "How To Prepare for Your Rheumatology Appointment", url: "https://rheumatology.org/patient-blog/how-to-prepare-for-your-rheumatology-appointment", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
  {
    id: "crp-esr",
    category: "symptoms",
    icon: "flask-outline",
    title: "CRP ve ESR sonuçları ne anlama gelir?",
    summary: "İki yaygın iltihap belirtecine dair genel bir arka plan bilgisi.",
    readTime: "2 dk",
    keyPoints: [
      "CRP ve ESR, AS'ye özgü olmayan genel iltihap belirteçleridir",
      "Tek bir değer, hastalık durumunu tek başına tanımlamaz",
      "En doğru şekilde, belirtilerinle ve geçmişinle birlikte, sağlık ekibin tarafından değerlendirilirler",
    ],
    sections: [
      {
        heading: "Ne ölçerler",
        body: "C-reaktif protein (CRP) ve eritrosit sedimentasyon hızı (ESR), vücudun herhangi bir yerinde iltihap olduğunda yükselebilen genel kan belirteçleridir.",
      },
      {
        heading: "Tek bir duruma özgü değildir",
        body: "Yüksek bir CRP ya da ESR, iltihabın var olduğunu gösterir, ama nedenini göstermez — AS dışında birçok şey bu değerleri yükseltebilir ve klinik olarak hiçbir zaman tek başına değerlendirilmezler.",
      },
      {
        heading: "Tek bir sayı, birçok olası açıklama",
        body: "Tek bir sonuç, tek başına, AS'nin o gün nasıl gittiğini tanımlamaz. Sağlık ekibin bunu belirtilerin, muayenen ve geçmişinle birlikte yorumlar.",
      },
      {
        heading: "Bu uygulamanın neden sadece sayıyı gösterdiği",
        body: "Bu uygulama CRP/ESR değerlerini kaydeder ve kendi geçmişine göre gösterir, herhangi bir otomatik yorum yapmadan — bu değerlendirme sana ve doktoruna aittir, bu uygulamaya değil.",
      },
    ],
    sources: [
      { organization: "Arthritis Foundation", title: "Blood Tests for Arthritis", url: "https://www.arthritis.org/health-wellness/about-arthritis/understanding-arthritis/blood-tests-for-arthritis", accessedAt: "2026-09-01" },
      { organization: "Leeds Teaching Hospitals NHS Trust", title: "C-Reactive Protein (CRP)", url: "https://www.leedsth.nhs.uk/services/pathology/tests/c-reactive-protein-crp/", accessedAt: "2026-09-01" },
    ],
    reviewedAt: "2026-09-01",
  },
];
