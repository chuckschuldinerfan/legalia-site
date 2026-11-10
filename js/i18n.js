/* Every text on the page, per language.
   Estonian is complete and comes from the current legalia.ee.
   Any value that starts with "TODO" is shown in Estonian instead (marked lang="et" for screen
   readers), so the page never displays a TODO. Keep the keys and the array shape (one array
   item per line). */
window.LEGALIA_I18N = {
  et: {
    meta: { title: 'Legalia Advokaadibüroo' },
    header: { home: 'Legalia, avaleht', menu: 'Menüü', language: 'Keel' },
    nav: { about: 'Meist', contact: 'Kontakt' },
    hero: { label: 'Meeskond' },
    files: { title: 'Meie meeskond', text: 'Viis inimest, kes seisavad Teie huvide eest, igaüks oma valdkonna asjatundja. Koos katame nii era- kui ka avaliku õiguse ning nõustame kliente seitsmes keeles.' }, // EN from the user; ET translation to check
    card: { flip: 'Klõpsa pööramiseks', back: 'Pööra tagasi' },
    about: {
      label: 'Meist',
      text: 'Osutame kvaliteetset ja terviklikku õigusteenust, nõustades kohalikke ja väliskliente nii eraõiguse kui ka avaliku õiguse erinevates valdkondades.'
    },
    traits: {
      title: 'Meid iseloomustab',
      items: ['kliendikesksus,', 'konfidentsiaalsus,', 'paindlikkus', 'ja kiire reageerimine.'],
      text: 'Soovime pakkuda Teile tuge kõigis õigusküsimustes. Meie eesmärk on tagada Teie huvide tulemuslik kaitse ning probleemide õigeaegne lahendamine.',
      langs: 'Teenindame teid eesti, vene, inglise ja soome keeles.'
    },
    experience: { text: 'Iga aasta alates 1992. aastast on lisanud meie kogemusele. Üle kolme aastakümne oleme nõustanud kliente nii eraõiguse kui ka avaliku õiguse küsimustes.' }, // own translation of the English
    contact: {
      label: 'Kontakt',
      address: ['Lootsi tn 8,', '10151 Tallinn'],
      map: 'Leia meid kaardilt'
    },
    team: {
      aivar: {
        name: 'Aivar Pihlak', title: 'Advokaat',
        spec: 'Äriõigus, võlaõigus, tsiviilkohtumenetlus, ühinemised ja omandamised, pankrotiõigus, pangandus- ja finantsõigus, väärtpaberid, maksuõigus, asjaõigus',
        cred: ['Eesti Advokatuuri liige', 'Tartu Ülikooli õigusteaduskond, 1992'],
        lang: 'Eesti, inglise, soome, vene'
      },
      dragan: {
        name: 'Dragan Perovic', title: 'Advokaat',
        spec: 'Äriõigus, asjaõigus, tsiviil- ja halduskohtumenetlus, pankrotiõigus, maksuõigus, võlaõigus, haldusmenetlus, tööõigus',
        cred: ['Eesti Advokatuuri liige', 'Tartu Ülikooli õigusteaduskond, 1993'],
        lang: 'Eesti, inglise, vene, serbo-horvaadi'
      },
      henrik: {
        name: 'Henrik Kirsimäe', title: 'Advokaat',
        spec: 'Võla- ja lepinguõigus, äri- ja ühinguõigus, ehitus- ja omandiküsimused, tööõigus, kriminaal- ja väärteomenetlus, haldusmenetlus, kohtumenetlus',
        cred: ['Eesti Advokatuuri liige, 2010', 'Tartu Ülikooli Õigusinstituut, BA 2006', 'Tartu Ülikooli õigusteaduskond, MA 2009'],
        lang: 'Eesti, inglise, saksa, rootsi'
      },
      gert: {
        name: 'Gert Kasekivi', title: 'Vandeadvokaat',
        spec: 'Lepinguõigus ja kohtumenetlus',
        cred: ['Eesti Advokatuuri liige, 2013', 'Tartu Ülikooli õigusteaduskond, BA 2009, MA 2012'],
        lang: 'Eesti, inglise'
      },
      piret: {
        name: 'Piret Oja', title: 'Kantselei juht',
        spec: 'Asjaajamine ja arhiivindus, raamatupidamine',
        cred: [],
        lang: 'Eesti, inglise, soome, vene'
      }
    }
  },

  /* English and Russian: texts copied from legalia.ee/en and legalia.ee/ru (October 2026), in the
     same label-free form as the Estonian cards. The UI strings marked "own translation" are not
     on legalia.ee and should be checked. */
  en: {
    meta: { title: 'Legalia Law Office' },
    header: { home: 'Legalia, home page', menu: 'Menu', language: 'Language' },          // own translation
    nav: { about: 'About', contact: 'Contact' },
    hero: { label: 'Team' },                                                              // own translation
    files: { title: 'Our team', text: 'Five people who stand up for your interests, each with their own field of expertise. Together we cover private and public law, and advise clients in seven languages.' }, // user's text (7 = the team's languages combined)
    card: { flip: 'Click to flip', back: 'Flip back' },                                  // own translation
    about: {
      label: 'About',
      text: 'We provide high-quality and comprehensive legal services, advising local and international clients in various areas of both private and public law.'
    },
    traits: {
      title: 'Characteristics',
      items: ['client-centricity,', 'confidentiality,', 'flexibility,', 'and quick response.'],
      text: 'We aim to offer you support in all legal matters. Our goal is to ensure the effective protection of your interests and the timely resolution of issues.',
      langs: 'We serve clients in Estonian, Russian, English, and Finnish.'
    },
    experience: { text: 'Every year since 1992 has added to our experience. Over three decades, we have guided clients through matters in both private and public law.' },
    contact: { label: 'Contact', address: ['Lootsi tn 8,', '10151 Tallinn'], map: 'Find us on the map' }, // map: own translation
    team: {
      aivar: {
        name: 'Aivar Pihlak', title: 'Attorney',
        spec: 'Business law, contract law, civil litigation, mergers and acquisitions, bankruptcy law, banking and financial law, securities, tax law, property law',
        cred: ['Member of the Estonian Bar Association', 'University of Tartu, Faculty of Law, 1992'],
        lang: 'Estonian, English, Finnish, Russian'
      },
      dragan: {
        name: 'Dragan Perovic', title: 'Attorney',
        spec: 'Business law, property law, civil and administrative proceedings, bankruptcy law, tax law, contract law, administrative procedure, labor law',
        cred: ['Member of the Estonian Bar Association', 'University of Tartu, Faculty of Law, 1993'],
        lang: 'Estonian, English, Russian, Serbo-Croatian'
      },
      henrik: {
        name: 'Henrik Kirsimäe', title: 'Attorney',
        spec: 'Contract and obligations law, business and corporate law, construction and property issues, labor law, criminal and misdemeanor proceedings, administrative procedure, litigation',
        cred: ['Member of the Estonian Bar Association since 2010', 'University of Tartu, Institute of Law, BA 2006', 'University of Tartu, Faculty of Law, MA 2009'],
        lang: 'Estonian, English, German, Swedish'
      },
      gert: {
        name: 'Gert Kasekivi', title: 'Attorney at law',
        spec: 'Contract law and litigation',
        cred: ['Member of the Estonian Bar Association since 2013', 'University of Tartu, Faculty of Law, BA 2009, MA 2012'],
        lang: 'Estonian, English'
      },
      piret: {
        name: 'Piret Oja', title: 'Office manager',
        spec: 'Administration and archival work, accounting',
        cred: [],
        lang: 'Estonian, English, Finnish, Russian'
      }
    }
  },

  ru: {
    meta: { title: 'Адвокатское бюро Legalia' },
    header: { home: 'Legalia, главная страница', menu: 'Меню', language: 'Язык' },       // own translation
    nav: { about: 'О нас', contact: 'Контакты' },
    hero: { label: 'Команда' },                                                           // own translation
    files: { title: 'Наша команда', text: 'Пять человек, которые защищают Ваши интересы, каждый — специалист в своей области. Вместе мы охватываем частное и публичное право и консультируем клиентов на семи языках.' }, // own text
    card: { flip: 'Перевернуть', back: 'Назад' },           // own translation
    about: {
      label: 'О нас',
      text: 'Мы оказываем качественные и комплексные юридические услуги, консультируя местных и зарубежных клиентов в различных областях частного и публичного права.'
    },
    traits: {
      title: 'Нас характеризуют',
      items: ['клиентоориентированность,', 'конфиденциальность,', 'гибкость', 'и быстрое реагирование.'],
      text: 'Мы стремимся оказать Вам поддержку во всех правовых вопросах. Наша цель — обеспечить эффективную защиту Ваших интересов и своевременное решение проблем.',
      langs: 'Мы обслуживаем клиентов на эстонском, русском, английском и финском языках.'
    },
    experience: { text: 'Каждый год с 1992 года пополнял наш опыт. За более чем три десятилетия мы сопровождали клиентов в делах как частного, так и публичного права.' }, // own translation
    contact: { label: 'Контакты', address: ['Lootsi tn 8,', '10151 Tallinn'], map: 'Найти нас на карте' }, // map: own translation
    team: {
      aivar: {
        name: 'Айвар Пихлак', title: 'Адвокат',
        spec: 'Коммерческое право, обязательственное право, гражданское судопроизводство, слияния и поглощения, банкротное право, банковское и финансовое право, ценные бумаги, налоговое право, вещное право',
        cred: ['Член Коллегии адвокатов Эстонии', 'Юридический факультет Тартуского университета, 1992'],
        lang: 'Эстонский, английский, финский, русский'
      },
      dragan: {
        name: 'Драган Перович', title: 'Адвокат',
        spec: 'Коммерческое право, вещное право, гражданское и административное судопроизводство, банкротное право, налоговое право, обязательственное право, административное производство, трудовое право',
        cred: ['Член Коллегии адвокатов Эстонии', 'Юридический факультет Тартуского университета, 1993'],
        lang: 'Эстонский, английский, русский, сербо-хорватский'
      },
      henrik: {
        name: 'Хенрик Кирсимяэ', title: 'Адвокат',
        spec: 'Обязательное и договорное право, коммерческое и корпоративное право, строительное и имущественное право, трудовое право, уголовное и административное судопроизводство, административное производство, судебное производство',
        cred: ['Член Коллегии адвокатов Эстонии с 2010 года', 'Юридический институт Тартуского университета, степень бакалавра, 2006', 'Юридический факультет Тартуского университета, степень магистра, 2009'],
        lang: 'Эстонский, английский, немецкий, шведский'
      },
      gert: {
        name: 'Герт Касекиви', title: 'Присяжный адвокат',
        spec: 'Договорное право и судебное производство',
        cred: ['Член Коллегии адвокатов Эстонии с 2013 года', 'Юридический факультет Тартуского университета, степень бакалавра, 2009, степень магистра, 2012'],
        lang: 'Эстонский, английский'
      },
      piret: {
        name: 'Пирет Оя', title: 'Заведующая канцелярией',
        spec: 'Делопроизводство и архивоведение, бухгалтерия',
        cred: [],
        lang: 'Эстонский, английский, финский, русский'
      }
    }
  }
};
