export interface DialectOption {
  code: string;
  label: string;
}

export interface PronounOption {
  value: string;
  label: string;
  description: string;
}

export interface FormalityOption {
  value: string;
  label: string;
}

export interface LanguageConfig {
  code: string;
  name: string;
  flag: string;              // emoji flag
  tier: 1 | 2 | 3;
  usesNonLatinScript: boolean;
  needsRomanization: boolean;
  romanizationLabel: string; // "Romaji", "Pinyin", "Romanization", ""
  isRTL: boolean;
  dialects: DialectOption[];
  hasPronounSystem: boolean;
  pronounOptions: {
    selfLabel: string;       // e.g., "Pronoun for yourself"
    recipientLabel: string;  // e.g., "Pronoun for them"
    selfOptions: PronounOption[];
    recipientOptions: PronounOption[];
  };
  hasFormality: boolean;
  formalityLabel: string;    // e.g., "Address style", "Formality"
  formalityLevels: FormalityOption[];
  hasSpeechLevels: boolean;
  speechLevelLabel: string;
  speechLevels: FormalityOption[];
  hasGendering: boolean;
  genderingNote: string;
  ageHierarchyWeight: 'critical' | 'significant' | 'minor' | 'none';
  ageHierarchyNote: string;
  slangCapability: 'excellent' | 'good' | 'limited';
  languageSpecificPromptRules: string;
}

export const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {

  ja: {
    code: 'ja',
    name: 'Japanese',
    flag: '🇯🇵',
    tier: 1,
    usesNonLatinScript: true,
    needsRomanization: true,
    romanizationLabel: 'Romaji',
    isRTL: false,
    dialects: [
      { code: 'tokyo', label: 'Standard (Tokyo)' },
      { code: 'kansai', label: 'Kansai (Osaka/Kyoto)' },
    ],
    hasPronounSystem: true,
    pronounOptions: {
      selfLabel: 'How you refer to yourself',
      recipientLabel: 'How you address them',
      selfOptions: [
        { value: '僕 (boku)', label: '僕 (boku)', description: 'Casual male, polite-ish' },
        { value: '俺 (ore)', label: '俺 (ore)', description: 'Very casual/masculine' },
        { value: '私 (watashi)', label: '私 (watashi)', description: 'Neutral / feminine casual' },
        { value: 'あたし (atashi)', label: 'あたし (atashi)', description: 'Casual feminine' },
      ],
      recipientOptions: [
        { value: 'name only', label: 'Use their name', description: 'Most natural in Japanese' },
        { value: 'あなた (anata)', label: 'あなた (anata)', description: 'You — can sound intimate or stiff depending on context' },
        { value: 'きみ (kimi)', label: 'きみ (kimi)', description: 'You — affectionate/casual' },
      ],
    },
    hasFormality: false,
    formalityLabel: '',
    formalityLevels: [],
    hasSpeechLevels: false,
    speechLevelLabel: '',
    speechLevels: [],
    hasGendering: false,
    genderingNote: '',
    ageHierarchyWeight: 'critical',
    ageHierarchyNote: 'Age hierarchy is critical in Japanese. If the recipient is older, language will be softened automatically.',
    slangCapability: 'excellent',
    languageSpecificPromptRules: `JAPANESE-SPECIFIC RULES:
- Default to casual register. Avoid desu/masu endings unless relationship is "older person/superior" or formality is set to Formal.
- Use the configured self-pronoun consistently. If recipient is significantly older, prefer 僕 over 俺.
- Gen Z Japanese slang: use naturally (ちょまって, わかる, マジで, やばい, エモい, それな, うざい, etc.)
- If Kansai dialect: use appropriate Kansai vocabulary (ちゃう instead of じゃない, なんで, あかん, etc.)
- Do not translate English exclamations into formal Japanese equivalents — find the natural casual equivalent.
- Sentence-ending particles: use よ、ね、な、かな naturally based on context.
- For flirty tone: add warmth via particles and word choice, not overt declarations.`,
  },

  vi: {
    code: 'vi',
    name: 'Vietnamese',
    flag: '🇻🇳',
    tier: 1,
    usesNonLatinScript: false,
    needsRomanization: false,
    romanizationLabel: '',
    isRTL: false,
    dialects: [
      { code: 'southern', label: 'Southern (Ho Chi Minh City)' },
      { code: 'northern', label: 'Northern (Hanoi)' },
    ],
    hasPronounSystem: true,
    pronounOptions: {
      selfLabel: 'How you refer to yourself',
      recipientLabel: 'How you refer to them',
      selfOptions: [
        { value: 'Anh', label: 'Anh', description: 'Older male to younger person — warm, common' },
        { value: 'Em', label: 'Em', description: 'Younger person to older person' },
        { value: 'Tao', label: 'Tao', description: 'Very casual (close friends only)' },
        { value: 'Mình', label: 'Mình', description: 'Neutral, friendly' },
        { value: 'Tui', label: 'Tui', description: 'Southern casual "I"' },
      ],
      recipientOptions: [
        { value: 'Em', label: 'Em', description: 'Younger female — very common in romantic contexts' },
        { value: 'Bé', label: 'Bé', description: 'Baby/sweetheart — intimate, affectionate' },
        { value: 'Mày', label: 'Mày', description: 'Very casual, close friends only' },
        { value: 'Bạn', label: 'Bạn', description: 'Friend — neutral, safer for acquaintances' },
        { value: 'Anh', label: 'Anh', description: 'Older male recipient' },
      ],
    },
    hasFormality: false,
    formalityLabel: '',
    formalityLevels: [],
    hasSpeechLevels: false,
    speechLevelLabel: '',
    speechLevels: [],
    hasGendering: false,
    genderingNote: '',
    ageHierarchyWeight: 'significant',
    ageHierarchyNote: 'Pronoun choice in Vietnamese directly encodes the age/relationship dynamic. The pronoun pair you select is very important.',
    slangCapability: 'excellent',
    languageSpecificPromptRules: `VIETNAMESE-SPECIFIC RULES:
- Apply the configured dialect: Southern uses different vocabulary and slang than Northern. Do not mix dialects.
- Southern slang/shortcuts: "ib" = inbox/text me, "bh" = bây giờ (now), "ck/vk" = chồng/vợ (husband/wife), "nt" = nhắn tin (text), "cx" = cũng (also), "mk" = mình (me), "t" = tao, "m" = mày.
- Use the configured pronoun pair consistently throughout. This is the most culturally critical element.
- For flirty/romantic tone: Vietnamese texts to girlfriends/crushes are often very sweet and use a lot of terms of endearment. Lean into this.
- Gen Z Vietnamese texting often omits diacritics in shortcuts but preserves them in full words — apply naturally.
- Avoid literal translation of English idioms — find the Vietnamese equivalent or rephrase naturally.`,
  },

  ko: {
    code: 'ko',
    name: 'Korean',
    flag: '🇰🇷',
    tier: 1,
    usesNonLatinScript: true,
    needsRomanization: true,
    romanizationLabel: 'Romanization',
    isRTL: false,
    dialects: [],
    hasPronounSystem: false,
    pronounOptions: { selfLabel: '', recipientLabel: '', selfOptions: [], recipientOptions: [] },
    hasFormality: false,
    formalityLabel: '',
    formalityLevels: [],
    hasSpeechLevels: true,
    speechLevelLabel: 'Speech level',
    speechLevels: [
      { value: 'banmal', label: '반말 (Banmal) — Casual, peers/close friends/younger' },
      { value: 'jondaemal', label: '존댓말 (Jondaemal) — Polite, elders/new acquaintances' },
    ],
    hasGendering: false,
    genderingNote: '',
    ageHierarchyWeight: 'critical',
    ageHierarchyNote: 'Korean speech levels are determined heavily by age. Using the wrong speech level is a serious social error.',
    slangCapability: 'excellent',
    languageSpecificPromptRules: `KOREAN-SPECIFIC RULES:
- Apply the configured speech level strictly: banmal (해체/해라체) for peers/close friends/younger people; jondaemal (해요체) for elders/new acquaintances.
- Age hierarchy is critical: if the recipient is clearly older, use jondaemal regardless of tone setting.
- Gen Z Korean texting: ㅋㅋ (laughter), ㅠㅠ (sadness/crying), ㄱㅅ (감사 - thanks), ㄷㄷ (떨다 - shaking), ㅇㅇ (응 - yes/okay), 대박 (daebak - awesome), 진짜 (jinjja - really), 완전 (wanjeon - totally).
- Korean texts often omit subject pronouns entirely — this is natural, not a mistake.
- For flirty tone: use sweet expressions naturally. 보고 싶어, 보고 싶다, etc.
- Do not romanize the entire output — romanization guide is separate from the Korean text.`,
  },

  zh: {
    code: 'zh',
    name: 'Mandarin Chinese',
    flag: '🇨🇳',
    tier: 1,
    usesNonLatinScript: true,
    needsRomanization: true,
    romanizationLabel: 'Pinyin',
    isRTL: false,
    dialects: [
      { code: 'simplified', label: 'Simplified (Mainland China)' },
      { code: 'traditional', label: 'Traditional (Taiwan/Hong Kong)' },
    ],
    hasPronounSystem: false,
    pronounOptions: { selfLabel: '', recipientLabel: '', selfOptions: [], recipientOptions: [] },
    hasFormality: true,
    formalityLabel: 'Formality',
    formalityLevels: [
      { value: 'casual', label: 'Casual (网络语言)' },
      { value: 'polite', label: 'Polite (礼貌)' },
      { value: 'formal', label: 'Formal (正式)' },
    ],
    hasSpeechLevels: false,
    speechLevelLabel: '',
    speechLevels: [],
    hasGendering: false,
    genderingNote: '',
    ageHierarchyWeight: 'significant',
    ageHierarchyNote: 'Age and social hierarchy affect formality in Chinese, especially with elders or superiors.',
    slangCapability: 'excellent',
    languageSpecificPromptRules: `MANDARIN CHINESE-SPECIFIC RULES:
- Apply the configured script variant: Simplified for Mainland China; Traditional for Taiwan/Hong Kong.
- Gen Z Chinese internet slang: 绝绝子 (amazing), 笑死 (dying of laughter), 好家伙 (oh wow), 内卷 (involution/rat race), 躺平 (lying flat), yyds (永远的神 - GOAT), 666 (awesome), 磕 (ship), 芜湖 (excitement). Use naturally if internet language is ON.
- For casual texting, sentence-final particles like 啊、呢、呀、哦、嘛 add natural flavor.
- Avoid overly formal or written-language structures in casual mode.
- Taiwan Traditional Chinese has different vocabulary: 可以 vs 可以, but also unique words like 超 (super), 好棒 (great).`,
  },

  es: {
    code: 'es',
    name: 'Spanish',
    flag: '🇪🇸',
    tier: 1,
    usesNonLatinScript: false,
    needsRomanization: false,
    romanizationLabel: '',
    isRTL: false,
    dialects: [
      { code: 'mexican', label: 'Mexican Spanish' },
      { code: 'colombian', label: 'Colombian Spanish' },
      { code: 'argentina', label: 'Argentine Spanish (voseo)' },
      { code: 'spain', label: 'Spanish (Spain)' },
      { code: 'latam-general', label: 'Latin American (general)' },
    ],
    hasPronounSystem: false,
    pronounOptions: { selfLabel: '', recipientLabel: '', selfOptions: [], recipientOptions: [] },
    hasFormality: true,
    formalityLabel: 'Address style',
    formalityLevels: [
      { value: 'tu', label: 'Tú — informal, peers, friends, romantic' },
      { value: 'usted', label: 'Usted — formal, elders, strangers, professional' },
      { value: 'vos', label: 'Vos — informal (Argentina, Uruguay, parts of Central America)' },
    ],
    hasSpeechLevels: false,
    speechLevelLabel: '',
    speechLevels: [],
    hasGendering: true,
    genderingNote: 'Spanish uses grammatical gender. Adjectives and some nouns will be matched to the speaker and recipient genders automatically.',
    ageHierarchyWeight: 'minor',
    ageHierarchyNote: '',
    slangCapability: 'excellent',
    languageSpecificPromptRules: `SPANISH-SPECIFIC RULES:
- Apply the configured regional variant strictly. Slang varies enormously by region.
- Mexican: güey/wey, chido/a, órale, no manches, chale, qué onda, chamba, fresa, neta, chafa.
- Argentina (voseo): use "vos" + second-person conjugation (tenés, querés, sabés). Slang: boludo/a, re- prefix, copado/a, laburar, bardear.
- Spain: tío/tía, guay, mola, flipar, hostia, caña, chaval, pasta (money).
- Colombia: parce, bacano, chimba, rumbear, polla (annoying), chévere.
- Apply the configured address style (tú/usted/vos) to all second-person references.
- Gendered agreement: match adjectives to speaker gender and recipient gender.
- Gen Z Spanish internet language: jajaja (haha), xd, tmr, kiero (quiero), k (que), sii/noo, morirme (dying laughing), x favor.`,
  },

  ar: {
    code: 'ar',
    name: 'Arabic',
    flag: '🇸🇦',
    tier: 1,
    usesNonLatinScript: true,
    needsRomanization: true,
    romanizationLabel: 'Transliteration',
    isRTL: true,
    dialects: [
      { code: 'msa', label: 'Modern Standard Arabic (MSA / فصحى)' },
      { code: 'egyptian', label: 'Egyptian Colloquial (عامية مصرية)' },
      { code: 'levantine', label: 'Levantine (شامي — Syria/Lebanon/Jordan/Palestine)' },
      { code: 'gulf', label: 'Gulf Arabic (خليجي)' },
    ],
    hasPronounSystem: false,
    pronounOptions: { selfLabel: '', recipientLabel: '', selfOptions: [], recipientOptions: [] },
    hasFormality: false,
    formalityLabel: '',
    formalityLevels: [],
    hasSpeechLevels: false,
    speechLevelLabel: '',
    speechLevels: [],
    hasGendering: true,
    genderingNote: 'Arabic requires grammatical gender agreement throughout the sentence. The output will be matched to the recipient\'s gender automatically.',
    ageHierarchyWeight: 'minor',
    ageHierarchyNote: '',
    slangCapability: 'good',
    languageSpecificPromptRules: `ARABIC-SPECIFIC RULES:
- CRITICAL: For casual texting, use the configured colloquial dialect — NOT Modern Standard Arabic (MSA). People do not text in MSA.
- If MSA is configured: use formal vocabulary and standard grammatical forms.
- Egyptian colloquial: ق → ء or omit, ث → س or ت, unique vocabulary (إيه = what, عامل إيه = how are you, تمام = okay, أوعى = don't, بص = look).
- Levantine: شو (what), هيك (like this), كيفك (how are you), يلا (let's go/come on), بدي (I want), ما في (there is none).
- Gulf: شنو/وش (what), كيفك (how are you), زين (good), عيل (then), أبد (never/at all).
- Gendered agreement: apply masculine/feminine verb forms, adjectives, and pronouns correctly based on recipient gender.
- For internet language ON: Arabic speakers frequently mix in English words naturally in texting. Apply appropriately.
- Arabic texts often use the Arabic script "2" (ء) for ء sound in informal writing.`,
  },

  pt: {
    code: 'pt',
    name: 'Portuguese',
    flag: '🇧🇷',
    tier: 1,
    usesNonLatinScript: false,
    needsRomanization: false,
    romanizationLabel: '',
    isRTL: false,
    dialects: [
      { code: 'brazilian', label: 'Brazilian Portuguese (PT-BR)' },
      { code: 'european', label: 'European Portuguese (PT-PT)' },
    ],
    hasPronounSystem: false,
    pronounOptions: { selfLabel: '', recipientLabel: '', selfOptions: [], recipientOptions: [] },
    hasFormality: true,
    formalityLabel: 'Address style',
    formalityLevels: [
      { value: 'voce', label: 'Você — casual, standard Brazil' },
      { value: 'tu', label: 'Tu — informal (some Brazilian regions, Portugal)' },
      { value: 'formal', label: 'Formal (o senhor / a senhora)' },
    ],
    hasSpeechLevels: false,
    speechLevelLabel: '',
    speechLevels: [],
    hasGendering: true,
    genderingNote: 'Portuguese uses grammatical gender. Adjectives will be matched to speaker and recipient genders.',
    ageHierarchyWeight: 'minor',
    ageHierarchyNote: '',
    slangCapability: 'excellent',
    languageSpecificPromptRules: `PORTUGUESE-SPECIFIC RULES:
- Brazilian and European Portuguese have significant vocabulary and pronunciation differences — apply the configured variant.
- Brazilian slang: cara, gente, né, tá, kkk (haha), oxente/eita (surprise), saudade, firme, legal, gato/gata.
- European Portuguese: fixes (cool), bué (very), fixes, pá (man/dude), fixolas, à vontade.
- Brazilian internet language: kkkk, rsrs, né, tô (estou), tá (está), vdd (verdade), msg, blz (beleza/ok).
- Apply gendered agreement to adjectives based on speaker and recipient genders.`,
  },

  fr: {
    code: 'fr',
    name: 'French',
    flag: '🇫🇷',
    tier: 1,
    usesNonLatinScript: false,
    needsRomanization: false,
    romanizationLabel: '',
    isRTL: false,
    dialects: [
      { code: 'european', label: 'French (France)' },
      { code: 'quebec', label: 'Quebec French (Québécois)' },
    ],
    hasPronounSystem: false,
    pronounOptions: { selfLabel: '', recipientLabel: '', selfOptions: [], recipientOptions: [] },
    hasFormality: true,
    formalityLabel: 'Address style',
    formalityLevels: [
      { value: 'tu', label: 'Tu — informal, friends, peers, romantic' },
      { value: 'vous', label: 'Vous — formal, strangers, elders, professional' },
    ],
    hasSpeechLevels: false,
    speechLevelLabel: '',
    speechLevels: [],
    hasGendering: true,
    genderingNote: 'French uses grammatical gender. Adjectives will be matched to speaker and recipient genders.',
    ageHierarchyWeight: 'minor',
    ageHierarchyNote: '',
    slangCapability: 'excellent',
    languageSpecificPromptRules: `FRENCH-SPECIFIC RULES:
- Apply the configured address style strictly: tu for informal, vous for formal.
- French internet language: mdr (mort de rire = lol), lol, ptdr (pété de rire), jsuis (je suis), ça va, cc (coucou/hi), stp (s'il te plaît), svp (s'il vous plaît), pk (pourquoi), bcp (beaucoup), tjrs (toujours).
- Quebec specific: tabarnac/câlice (strong expressions), chu (je suis), pis (et/and), tsé (tu sais), faque (so), pogner (to grab/appeal to), maganer (to bother), asteure (maintenant).
- France slang: grave (totally/definitely), ouf (crazy, backwards verlan for fou), chelou (weird, verlan for louche), meuf (woman, verlan for femme), keum (man), vénère (angry), kiffer (to like/love).
- Gendered agreement: match adjectives to speaker gender.`,
  },

  de: {
    code: 'de',
    name: 'German',
    flag: '🇩🇪',
    tier: 1,
    usesNonLatinScript: false,
    needsRomanization: false,
    romanizationLabel: '',
    isRTL: false,
    dialects: [],
    hasPronounSystem: false,
    pronounOptions: { selfLabel: '', recipientLabel: '', selfOptions: [], recipientOptions: [] },
    hasFormality: true,
    formalityLabel: 'Address style',
    formalityLevels: [
      { value: 'du', label: 'Du — informal, friends, peers, romantic' },
      { value: 'Sie', label: 'Sie — formal, strangers, elders, professional' },
    ],
    hasSpeechLevels: false,
    speechLevelLabel: '',
    speechLevels: [],
    hasGendering: false,
    genderingNote: '',
    ageHierarchyWeight: 'minor',
    ageHierarchyNote: '',
    slangCapability: 'good',
    languageSpecificPromptRules: `GERMAN-SPECIFIC RULES:
- Apply the configured address style: du (informal) or Sie (formal, capitalized) consistently.
- German internet slang: lol, haha, omg, krass (crazy/intense), geil (cool/awesome), alter (dude), digga (dude, Hamburg), ne? (right?), echt (really), hammer (awesome).
- Gen Z German: lit, cringe, flexen, ok boomer (borrowed from English), voll (totally), mega, heftig (intense).
- Texting abbreviations: lg (liebe Grüße = kind regards, for sign-off), mfg (mit freundlichen Grüßen = formal sign-off), bitte (please/you're welcome context-dependent).
- German compound words: don't be afraid to use them naturally — they sound authentic.`,
  },

  it: {
    code: 'it',
    name: 'Italian',
    flag: '🇮🇹',
    tier: 1,
    usesNonLatinScript: false,
    needsRomanization: false,
    romanizationLabel: '',
    isRTL: false,
    dialects: [],
    hasPronounSystem: false,
    pronounOptions: { selfLabel: '', recipientLabel: '', selfOptions: [], recipientOptions: [] },
    hasFormality: true,
    formalityLabel: 'Address style',
    formalityLevels: [
      { value: 'tu', label: 'Tu — informal, friends, peers, romantic' },
      { value: 'lei', label: 'Lei — formal, strangers, elders, professional' },
    ],
    hasSpeechLevels: false,
    speechLevelLabel: '',
    speechLevels: [],
    hasGendering: true,
    genderingNote: 'Italian uses grammatical gender. Adjectives will be matched to speaker and recipient genders.',
    ageHierarchyWeight: 'minor',
    ageHierarchyNote: '',
    slangCapability: 'good',
    languageSpecificPromptRules: `ITALIAN-SPECIFIC RULES:
- Apply tu (informal) or Lei (formal) consistently.
- Italian internet slang: ahah/ahaha (lol), xD, dai (come on), cazzo (strong expletive), figata (cool thing), roba (stuff), tipo (like/kinda), boh (I dunno), vabbe' (whatever/fine), mannaggia (darn), niente (nothing/nah).
- Italian texts often drop subject pronouns (pro-drop language) — this is natural.
- Gendered adjectives: apply to speaker and recipient gender.`,
  },

  hi: {
    code: 'hi',
    name: 'Hindi',
    flag: '🇮🇳',
    tier: 1,
    usesNonLatinScript: true,
    needsRomanization: true,
    romanizationLabel: 'Romanization',
    isRTL: false,
    dialects: [],
    hasPronounSystem: true,
    pronounOptions: {
      selfLabel: 'How you refer to yourself',
      recipientLabel: 'How you address them',
      selfOptions: [
        { value: 'मैं (main)', label: 'मैं (main)', description: 'Standard "I" for all contexts' },
      ],
      recipientOptions: [
        { value: 'आप (aap)', label: 'आप (aap)', description: 'Respectful you — elders, strangers, formal' },
        { value: 'तुम (tum)', label: 'तुम (tum)', description: 'Casual you — friends, peers' },
        { value: 'तू (tu)', label: 'तू (tu)', description: 'Very intimate — very close friends or can be rude' },
      ],
    },
    hasFormality: false,
    formalityLabel: '',
    formalityLevels: [],
    hasSpeechLevels: false,
    speechLevelLabel: '',
    speechLevels: [],
    hasGendering: true,
    genderingNote: 'Hindi verbs and adjectives change based on the speaker\'s gender. Output will be gender-matched automatically.',
    ageHierarchyWeight: 'significant',
    ageHierarchyNote: 'The pronoun chosen (आप/तुम/तू) reflects the social relationship. Choose carefully.',
    slangCapability: 'good',
    languageSpecificPromptRules: `HINDI-SPECIFIC RULES:
- Apply the configured recipient pronoun (आप/तुम/तू) consistently throughout.
- Modern Indian urban Hindi texting is heavily Hinglish (Hindi + English mixed). Apply naturally for casual/Gen Z tone.
- Gen Z Indian slang: yaar (friend), bhai (brother), arre (hey/oh), sahi hai (that's right/cool), mast (great), jugaad (workaround), timepass (wasting time), bindaas (carefree/cool).
- Gendered verbs: match to speaker gender (e.g., गया vs गई for "went").
- For internet language ON: mix English words naturally as real Hindi texters do.`,
  },

  th: {
    code: 'th',
    name: 'Thai',
    flag: '🇹🇭',
    tier: 1,
    usesNonLatinScript: true,
    needsRomanization: true,
    romanizationLabel: 'Romanization',
    isRTL: false,
    dialects: [],
    hasPronounSystem: true,
    pronounOptions: {
      selfLabel: 'Polite particle for yourself',
      recipientLabel: 'How you address them',
      selfOptions: [
        { value: 'ผม (phom)', label: 'ผม (phom)', description: 'Polite "I" for males' },
        { value: 'หนู (nu)', label: 'หนู (nu)', description: '"I" for females or younger person to elder' },
        { value: 'เรา (rao)', label: 'เรา (rao)', description: 'Casual "I/we" — very common in informal speech' },
        { value: 'กู (gu)', label: 'กู (gu)', description: 'Very casual, close friends only' },
      ],
      recipientOptions: [
        { value: 'เธอ (thoe)', label: 'เธอ (thoe)', description: '"You" — casual/intimate' },
        { value: 'คุณ (khun)', label: 'คุณ (khun)', description: '"You" — polite/neutral' },
        { value: 'มึง (mueng)', label: 'มึง (mueng)', description: 'Very casual, very close friends only' },
      ],
    },
    hasFormality: true,
    formalityLabel: 'Polite particle',
    formalityLevels: [
      { value: 'krap', label: 'ครับ (khrap) — male speaker polite particle' },
      { value: 'ka', label: 'ค่ะ/คะ (kha) — female speaker polite particle' },
      { value: 'none', label: 'None — casual, omit polite particle' },
    ],
    hasSpeechLevels: false,
    speechLevelLabel: '',
    speechLevels: [],
    hasGendering: false,
    genderingNote: '',
    ageHierarchyWeight: 'significant',
    ageHierarchyNote: 'Thai politeness particles (ครับ/ค่ะ) signal respect. They are tied to the speaker\'s gender.',
    slangCapability: 'good',
    languageSpecificPromptRules: `THAI-SPECIFIC RULES:
- Apply the configured polite particle (ครับ for male speakers, ค่ะ/คะ for female speakers) at sentence ends where appropriate. Omit if "None" is selected (casual texting often omits them).
- Use the configured pronoun pair for self and recipient.
- Thai Gen Z slang: 555 (hahaha — 5 = ha in Thai), โอ้โห (wow), เฮีย (big brother/dude), เท (cool/pour — used as slang for "diss"), มาก (very/a lot, often added at end), จริงๆ (really), โคตร (very/extremely), ป่ะ (isn't it?/right?).
- Thai internet texting omits spaces between words more than formal writing. This is natural.
- For casual texting between friends: pronouns can be dropped entirely (Thai is a pro-drop language).`,
  },

  id: {
    code: 'id',
    name: 'Indonesian',
    flag: '🇮🇩',
    tier: 1,
    usesNonLatinScript: false,
    needsRomanization: false,
    romanizationLabel: '',
    isRTL: false,
    dialects: [],
    hasPronounSystem: false,
    pronounOptions: { selfLabel: '', recipientLabel: '', selfOptions: [], recipientOptions: [] },
    hasFormality: true,
    formalityLabel: 'Formality',
    formalityLevels: [
      { value: 'casual', label: 'Casual (Bahasa gaul / Jakarta slang)' },
      { value: 'standard', label: 'Standard Indonesian' },
      { value: 'formal', label: 'Formal (Bahasa baku)' },
    ],
    hasSpeechLevels: false,
    speechLevelLabel: '',
    speechLevels: [],
    hasGendering: false,
    genderingNote: '',
    ageHierarchyWeight: 'minor',
    ageHierarchyNote: '',
    slangCapability: 'good',
    languageSpecificPromptRules: `INDONESIAN-SPECIFIC RULES:
- Apply the configured formality level. Indonesian Gen Z texting uses heavy Jakarta slang (bahasa gaul).
- Jakarta slang: gue/gw (I, casual), lo/lu (you, casual), dong (softening particle), sih (emphasis), deh (softening), kan (right?), nih (this/look), tuh (that/see), banget (very), baper (bawa perasaan = emotionally sensitive), gabut (bored with nothing to do), santuy (santai = relaxed), mantul (mantap betul = totally great), wkwkwk (lol).
- Standard: saya (I, formal), Anda (you, formal), kami/kita (we).
- For casual: abbreviations are common — yg (yang), utk (untuk), dgn (dengan), krn (karena), blm (belum), sdh (sudah), hrs (harus).`,
  },

  tr: {
    code: 'tr',
    name: 'Turkish',
    flag: '🇹🇷',
    tier: 1,
    usesNonLatinScript: false,
    needsRomanization: false,
    romanizationLabel: '',
    isRTL: false,
    dialects: [],
    hasPronounSystem: false,
    pronounOptions: { selfLabel: '', recipientLabel: '', selfOptions: [], recipientOptions: [] },
    hasFormality: true,
    formalityLabel: 'Address style',
    formalityLevels: [
      { value: 'sen', label: 'Sen — informal, friends, peers, romantic' },
      { value: 'siz', label: 'Siz — formal, elders, strangers' },
    ],
    hasSpeechLevels: false,
    speechLevelLabel: '',
    speechLevels: [],
    hasGendering: false,
    genderingNote: '',
    ageHierarchyWeight: 'minor',
    ageHierarchyNote: '',
    slangCapability: 'good',
    languageSpecificPromptRules: `TURKISH-SPECIFIC RULES:
- Apply sen (informal) or siz (formal) to all second-person references.
- Turkish internet slang: aq/amk (strong expressions, use carefully), lan (dude/man), ya (particle, emphasis), yani (I mean/basically), falan (and such/whatever), haha/hahah, ahahah, kanka (buddy, from kardeş), ya neyse (anyway), çok iyi (very good/great), olm (dude, from oğlum), mk (abbreviation for swear — use carefully).
- Turkish is agglutinative — make sure suffixes are applied correctly.
- Gen Z Turkish texting often uses phonetic spellings and English loanwords naturally.`,
  },

  pl: {
    code: 'pl',
    name: 'Polish',
    flag: '🇵🇱',
    tier: 1,
    usesNonLatinScript: false,
    needsRomanization: false,
    romanizationLabel: '',
    isRTL: false,
    dialects: [],
    hasPronounSystem: false,
    pronounOptions: { selfLabel: '', recipientLabel: '', selfOptions: [], recipientOptions: [] },
    hasFormality: true,
    formalityLabel: 'Address style',
    formalityLevels: [
      { value: 'ty', label: 'Ty — informal, friends, peers, romantic' },
      { value: 'pan-pani', label: 'Pan/Pani — formal, strangers, elders' },
    ],
    hasSpeechLevels: false,
    speechLevelLabel: '',
    speechLevels: [],
    hasGendering: true,
    genderingNote: 'Polish uses grammatical gender extensively. Adjectives, verbs, and past-tense forms will be matched to speaker and recipient genders.',
    ageHierarchyWeight: 'minor',
    ageHierarchyNote: '',
    slangCapability: 'good',
    languageSpecificPromptRules: `POLISH-SPECIFIC RULES:
- Apply the configured address style (ty/Pan/Pani) consistently.
- Polish internet slang: hej (hey), git (good/okay, from English "get"), spoko (cool/okay, from "spokojnie"), nara (bye, from "na razie"), luzik (relax/chill), ogarnij (get it together/handle it), masakra (disaster/wow), mega (very), no (yeah/well), siema (hey).
- Gendered past tense: apply speaker gender (e.g., zrobiłem vs zrobiłam for "I did").
- Polish texts often drop pronouns when the verb ending makes it clear.`,
  },

};

// Tier 2 languages — no LFCS config, AI uses general knowledge
export const TIER2_LANGUAGES: { code: string; name: string; flag: string }[] = [
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'fa', name: 'Persian / Farsi', flag: '🇮🇷' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'ca', name: 'Catalan', flag: '🏴' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
];

export const ALL_LANGUAGES = [
  ...Object.values(LANGUAGE_CONFIGS),
  ...TIER2_LANGUAGES.map(l => ({ ...l, tier: 2 as const })),
];
