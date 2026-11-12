/* Every text on the page, per language.
   Estonian is complete and comes from the current legalia.ee.
   Any value that starts with "TODO" is shown in Estonian instead (marked lang="et" for screen
   readers), so the page never displays a TODO. Keep the keys and the array shape (one array
   item per line). */
window.LEGALIA_I18N = {
  et: {
    meta: { title: 'Legalia Advokaadibüroo' },
    header: { home: 'Legalia, avaleht', menu: 'Menüü', language: 'Keel' },
    nav: { about: 'Meist', team: 'Meeskond', contact: 'Kontakt' },
    hero: { label: 'Meeskond' },
    files: { title: 'Meie meeskond', text: 'Meie meeskonda kuuluvad kogenud advokaadid, kelle erinevad spetsialiseerumisvaldkonnad võimaldavad pakkuda klientidele asjatundlikku õigusnõustamist ja tõhusaid lahendusi ka keerukates õigusküsimustes.' }, // from the client, 2026-11-12
    about: {
      label: 'Meist',
      text: 'Osutame kvaliteetset ja terviklikku õigusteenust, nõustades kohalikke ja väliskliente nii eraõiguse kui ka avaliku õiguse erinevates valdkondades.'
    },
    traits: {
      title: 'Meid iseloomustab',
      items: ['kliendikesksus,', 'konfidentsiaalsus,', 'paindlikkus', 'ja kiire reageerimine.'],
      text: 'Soovime pakkuda Teile tuge kõigis õigusküsimustes. Meie eesmärk on tagada Teie huvide tulemuslik kaitse ning probleemide õigeaegne lahendamine.',
      langs: 'Teenindame Teid eesti, vene ja inglise keeles.'
    },
    experience: { label: 'Kogemus', text: 'Üle 30 aasta kogemust õigusteenuste osutamisel. Meie tegevuse aluseks on põhjalikud õigusalased teadmised, pikaajaline praktika ja pühendumine klientide huvide kaitsele.' }, // from the client, 2026-11-12
    contact: {
      label: 'Kontakt',
      address: ['Lootsi tn 8,', '10151 Tallinn'],
      map: 'Leia meid kaardilt'
    },
    details: { langs: 'Keeled:' },
    team: {
      aivar: {
        name: 'Aivar Pihlak', title: 'Advokaat',
        spec: 'Äriõigus, võlaõigus, tsiviilkohtumenetlus, ühinemised ja omandamised, pankrotiõigus, pangandus- ja finantsõigus, väärtpaberid, maksuõigus, asjaõigus',
        cred: ['Eesti Advokatuuri liige', 'Tartu Ülikooli õigusteaduskond, 1992'],
        lang: 'Eesti, vene, inglise'
      },
      dragan: {
        name: 'Dragan Perovic', title: 'Advokaat',
        spec: 'Äriõigus, asjaõigus, tsiviil- ja halduskohtumenetlus, pankrotiõigus, maksuõigus, võlaõigus, haldusmenetlus, tööõigus',
        cred: ['Eesti Advokatuuri liige', 'Tartu Ülikooli õigusteaduskond, 1993'],
        lang: 'Eesti, vene, inglise, serbohorvaadi'
      },
      henrik: {
        name: 'Henrik Kirsimäe', title: 'Advokaat',
        spec: 'Võla- ja lepinguõigus, äri- ja ühinguõigus, ehitus- ja omandiküsimused, tööõigus, kriminaal- ja väärteomenetlus, haldusmenetlus, kohtumenetlus',
        cred: ['Eesti Advokatuuri liige, 2010', 'Tartu Ülikooli Õigusinstituut, BA 2006', 'Tartu Ülikooli õigusteaduskond, MA 2009'],
        lang: 'Eesti, vene, inglise'
      },
      gert: {
        name: 'Gert Kasekivi', title: 'Vandeadvokaat',
        spec: 'Lepinguõigus ja kohtumenetlus',
        cred: ['Eesti Advokatuuri liige, 2013', 'Tartu Ülikooli õigusteaduskond, BA 2009, MA 2012'],
        lang: 'Eesti, vene, inglise'
      },
      piret: {
        name: 'Piret Oja', title: 'Kantseleijuht',
        spec: 'Asjaajamine ja arhiivindus, raamatupidamine',
        cred: [],
        lang: 'Eesti, vene, inglise'
      }
    }
  },

  /* English and Russian: texts copied from legalia.ee/en and legalia.ee/ru (October 2026), in the
     same label-free form as the Estonian cards. The UI strings marked "own translation" are not
     on legalia.ee and should be checked. */
  en: {
    meta: { title: 'Legalia Law Office' },
    header: { home: 'Legalia, home page', menu: 'Menu', language: 'Language' },          // own translation
    nav: { about: 'About', team: 'Team', contact: 'Contact' },
    hero: { label: 'Team' },                                                              // own translation
    files: { title: 'Our team', text: 'Our team consists of experienced attorneys whose different areas of specialization allow us to offer clients expert legal advice and effective solutions, even in complex legal matters.' }, // translated from the client's Estonian, 2026-11-12
    about: {
      label: 'About us',
      text: 'We provide high-quality and comprehensive legal services, advising local and international clients in various areas of both private and public law.'
    },
    traits: {
      title: 'Characteristics',
      items: ['client-centricity,', 'confidentiality,', 'flexibility,', 'and quick response.'],
      text: 'We aim to offer you support in all legal matters. Our goal is to ensure the effective protection of your interests and the timely resolution of issues.',
      langs: 'We serve clients in Estonian, Russian, and English.'
    },
    experience: { label: 'Experience', text: 'Over 30 years of experience in providing legal services. Our work is built on in-depth legal knowledge, long-standing practice and a commitment to protecting our clients’ interests.' }, // translated from the client's Estonian, 2026-11-12
    contact: { label: 'Contact', address: ['Lootsi tn 8,', '10151 Tallinn'], map: 'Find us on the map' }, // map: own translation
    details: { langs: 'Languages:' },
    team: {
      aivar: {
        name: 'Aivar Pihlak', title: 'Attorney',
        spec: 'Business law, contract law, civil litigation, mergers and acquisitions, bankruptcy law, banking and financial law, securities, tax law, property law',
        cred: ['Member of the Estonian Bar Association', 'University of Tartu, Faculty of Law, 1992'],
        lang: 'Estonian, Russian, English'
      },
      dragan: {
        name: 'Dragan Perovic', title: 'Attorney',
        spec: 'Business law, property law, civil and administrative proceedings, bankruptcy law, tax law, contract law, administrative procedure, labor law',
        cred: ['Member of the Estonian Bar Association', 'University of Tartu, Faculty of Law, 1993'],
        lang: 'Estonian, Russian, English, Serbo-Croatian'
      },
      henrik: {
        name: 'Henrik Kirsimäe', title: 'Attorney',
        spec: 'Contract and obligations law, business and corporate law, construction and property issues, labor law, criminal and misdemeanor proceedings, administrative procedure, litigation',
        cred: ['Member of the Estonian Bar Association since 2010', 'University of Tartu, Institute of Law, BA 2006', 'University of Tartu, Faculty of Law, MA 2009'],
        lang: 'Estonian, Russian, English'
      },
      gert: {
        name: 'Gert Kasekivi', title: 'Attorney at law',
        spec: 'Contract law and litigation',
        cred: ['Member of the Estonian Bar Association since 2013', 'University of Tartu, Faculty of Law, BA 2009, MA 2012'],
        lang: 'Estonian, Russian, English'
      },
      piret: {
        name: 'Piret Oja', title: 'Office manager',
        spec: 'Administration and archival work, accounting',
        cred: [],
        lang: 'Estonian, Russian, English'
      }
    }
  },

  ru: {
    meta: { title: 'Адвокатское бюро Legalia' },
    header: { home: 'Legalia, главная страница', menu: 'Меню', language: 'Язык' },       // own translation
    nav: { about: 'О нас', team: 'Команда', contact: 'Контакты' },
    hero: { label: 'Команда' },                                                           // own translation
    files: { title: 'Наша команда', text: 'В нашу команду входят опытные адвокаты, чьи различные области специализации позволяют нам предоставлять клиентам квалифицированные юридические консультации и эффективные решения даже в сложных правовых вопросах.' }, // translated from the client's Estonian, 2026-11-12
    about: {
      label: 'О нас',
      text: 'Мы оказываем качественные и комплексные юридические услуги, консультируя местных и зарубежных клиентов в различных областях частного и публичного права.'
    },
    traits: {
      title: 'Нас характеризуют',
      items: ['клиентоориентированность,', 'конфиденциальность,', 'гибкость', 'и быстрое реагирование.'],
      text: 'Мы стремимся оказать Вам поддержку во всех правовых вопросах. Наша цель — обеспечить эффективную защиту Ваших интересов и своевременное решение проблем.',
      langs: 'Мы обслуживаем клиентов на эстонском, русском и английском языках.'
    },
    experience: { label: 'Опыт', text: 'Более 30 лет опыта в оказании юридических услуг. В основе нашей деятельности — глубокие юридические знания, многолетняя практика и приверженность защите интересов клиентов.' }, // translated from the client's Estonian, 2026-11-12
    contact: { label: 'Контакты', address: ['Lootsi tn 8,', '10151 Tallinn'], map: 'Найти нас на карте' }, // map: own translation
    details: { langs: 'Языки:' },
    team: {
      aivar: {
        name: 'Айвар Пихлак', title: 'Адвокат',
        spec: 'Коммерческое право, обязательственное право, гражданское судопроизводство, слияния и поглощения, банкротное право, банковское и финансовое право, ценные бумаги, налоговое право, вещное право',
        cred: ['Член Коллегии адвокатов Эстонии', 'Юридический факультет Тартуского университета, 1992'],
        lang: 'Эстонский, русский, английский'
      },
      dragan: {
        name: 'Драган Перович', title: 'Адвокат',
        spec: 'Коммерческое право, вещное право, гражданское и административное судопроизводство, банкротное право, налоговое право, обязательственное право, административное производство, трудовое право',
        cred: ['Член Коллегии адвокатов Эстонии', 'Юридический факультет Тартуского университета, 1993'],
        lang: 'Эстонский, русский, английский, сербохорватский'
      },
      henrik: {
        name: 'Хенрик Кирсимяэ', title: 'Адвокат',
        spec: 'Обязательственное и договорное право, коммерческое и корпоративное право, строительное и имущественное право, трудовое право, уголовное и административное судопроизводство, административное производство, судебное производство',
        cred: ['Член Коллегии адвокатов Эстонии с 2010 года', 'Юридический институт Тартуского университета, степень бакалавра, 2006', 'Юридический факультет Тартуского университета, степень магистра, 2009'],
        lang: 'Эстонский, русский, английский'
      },
      gert: {
        name: 'Герт Касекиви', title: 'Присяжный адвокат',
        spec: 'Договорное право и судебное производство',
        cred: ['Член Коллегии адвокатов Эстонии с 2013 года', 'Юридический факультет Тартуского университета, степень бакалавра, 2009, степень магистра, 2012'],
        lang: 'Эстонский, русский, английский'
      },
      piret: {
        name: 'Пирет Оя', title: 'Заведующая канцелярией',
        spec: 'Делопроизводство и архивоведение, бухгалтерия',
        cred: [],
        lang: 'Эстонский, русский, английский'
      }
    }
  }
};
