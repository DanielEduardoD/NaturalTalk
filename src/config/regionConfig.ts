/**
 * Micro-regional speech and flag identity.
 *
 * Dialect lists in languageConfig cover broad variants. Real speech varies by
 * city: Torreón sounds different from Monterrey even though both are northern
 * Mexican. The free-form "region" field carries that nuance into the prompt.
 */

export interface RegionSuggestion {
  /** Dialect code this suggestion belongs to, or "*" for the whole language. */
  dialect: string;
  examples: string[];
}

export const REGION_SUGGESTIONS: Record<string, RegionSuggestion[]> = {
  es: [
    {
      dialect: 'mexican-north',
      examples: ['Torreón, Coahuila', 'Monterrey, Nuevo León', 'Chihuahua', 'Hermosillo, Sonora'],
    },
    { dialect: 'mexican-central', examples: ['Mexico City', 'Puebla', 'Guadalajara', 'Querétaro'] },
    { dialect: 'mexican-coastal', examples: ['Veracruz', 'Acapulco', 'Mérida, Yucatán', 'Cancún'] },
    { dialect: 'argentina', examples: ['Buenos Aires (porteño)', 'Córdoba', 'Rosario'] },
    { dialect: 'colombian', examples: ['Bogotá (rolo)', 'Medellín (paisa)', 'Cali', 'Barranquilla'] },
    { dialect: 'spain', examples: ['Madrid', 'Andalusia', 'Barcelona', 'Galicia'] },
    { dialect: '*', examples: ['Santiago de Chile', 'Lima', 'Caracas', 'San Juan, Puerto Rico'] },
  ],
  en: [
    { dialect: 'american', examples: ['New York', 'Texas / Southern', 'California', 'Midwest'] },
    { dialect: 'british', examples: ['London', 'Manchester', 'Scotland', 'Yorkshire'] },
    { dialect: '*', examples: ['Dublin', 'Toronto', 'Sydney', 'Singapore', 'Lagos'] },
  ],
  pt: [
    { dialect: 'brazilian', examples: ['São Paulo', 'Rio de Janeiro (carioca)', 'Bahia', 'Minas Gerais'] },
    { dialect: 'european', examples: ['Lisbon', 'Porto', 'Azores'] },
  ],
  ar: [
    { dialect: 'egyptian', examples: ['Cairo', 'Alexandria', 'Upper Egypt'] },
    { dialect: 'levantine', examples: ['Beirut', 'Damascus', 'Amman', 'Ramallah'] },
    { dialect: 'gulf', examples: ['Riyadh', 'Jeddah', 'Kuwait City', 'Dubai'] },
    { dialect: '*', examples: ['Casablanca', 'Tunis', 'Baghdad'] },
  ],
  zh: [
    { dialect: '*', examples: ['Beijing', 'Shanghai', 'Taipei', 'Chengdu', 'Guangzhou'] },
  ],
  ja: [
    { dialect: 'kansai', examples: ['Osaka', 'Kyoto', 'Kobe'] },
    { dialect: '*', examples: ['Tokyo', 'Fukuoka (Hakata)', 'Sapporo', 'Okinawa'] },
  ],
  ko: [{ dialect: '*', examples: ['Seoul', 'Busan (Gyeongsang)', 'Jeolla', 'Jeju'] }],
  fr: [
    { dialect: 'quebec', examples: ['Montréal', 'Québec City', 'Saguenay'] },
    { dialect: '*', examples: ['Paris', 'Marseille', 'Brussels', 'Abidjan', 'Dakar'] },
  ],
  de: [{ dialect: '*', examples: ['Berlin', 'Bavaria / Munich', 'Vienna', 'Zurich', 'Hamburg'] }],
  it: [{ dialect: '*', examples: ['Rome', 'Milan', 'Naples', 'Sicily'] }],
  vi: [{ dialect: '*', examples: ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Huế'] }],
  hi: [{ dialect: '*', examples: ['Delhi', 'Mumbai', 'Lucknow', 'Jaipur'] }],
  th: [{ dialect: '*', examples: ['Bangkok', 'Chiang Mai', 'Isan', 'Phuket'] }],
  id: [{ dialect: '*', examples: ['Jakarta', 'Bandung', 'Surabaya', 'Bali'] }],
  tr: [{ dialect: '*', examples: ['Istanbul', 'Ankara', 'Izmir', 'Trabzon'] }],
  pl: [{ dialect: '*', examples: ['Warsaw', 'Kraków', 'Gdańsk', 'Silesia'] }],
};

export function regionExamplesFor(languageCode: string, dialect: string | null): string[] {
  const groups = REGION_SUGGESTIONS[languageCode];
  if (!groups) return [];
  const bucket =
    groups.find((g) => dialect && g.dialect !== '*' && dialect.toLowerCase().includes(g.dialect.split('-').pop()!)) ??
    groups.find((g) => g.dialect === '*') ??
    groups[0];
  return bucket?.examples ?? [];
}

/**
 * Flags are identity, not linguistics. A Mexican speaker may not want the
 * Spanish flag next to "Spanish", so every language offers alternatives and a
 * neutral option.
 */
export const FLAG_OPTIONS: Record<string, string[]> = {
  es: ['🇪🇸', '🇲🇽', '🇦🇷', '🇨🇴', '🇨🇱', '🇵🇪', '🇻🇪', '🇬🇹', '🇵🇷', '🇺🇾', '🇩🇴', '🇪🇨'],
  en: ['🇬🇧', '🇺🇸', '🇨🇦', '🇦🇺', '🇳🇿', '🇮🇪', '🇿🇦', '🇮🇳', '🇳🇬', '🇵🇭', '🇸🇬'],
  pt: ['🇧🇷', '🇵🇹', '🇦🇴', '🇲🇿', '🇨🇻'],
  fr: ['🇫🇷', '🇨🇦', '🇧🇪', '🇨🇭', '🇸🇳', '🇨🇮', '🇨🇩'],
  ar: ['🇸🇦', '🇪🇬', '🇦🇪', '🇲🇦', '🇩🇿', '🇹🇳', '🇯🇴', '🇱🇧', '🇮🇶', '🇰🇼', '🇶🇦', '🇵🇸'],
  zh: ['🇨🇳', '🇹🇼', '🇭🇰', '🇸🇬', '🇲🇴'],
  de: ['🇩🇪', '🇦🇹', '🇨🇭', '🇱🇮'],
  nl: ['🇳🇱', '🇧🇪'],
  ko: ['🇰🇷'],
  ja: ['🇯🇵'],
  it: ['🇮🇹', '🇨🇭', '🇸🇲'],
  hi: ['🇮🇳'],
  ur: ['🇵🇰', '🇮🇳'],
  bn: ['🇧🇩', '🇮🇳'],
  ta: ['🇮🇳', '🇱🇰', '🇸🇬'],
  sw: ['🇰🇪', '🇹🇿', '🇺🇬'],
  ru: ['🇷🇺', '🇰🇿', '🇧🇾'],
  sr: ['🇷🇸', '🇧🇦', '🇲🇪'],
};

export const NEUTRAL_FLAGS = ['🌐', '🗣️', '💬', '🏳️', '🔤'];

export function flagChoicesFor(languageCode: string, defaultFlag: string): string[] {
  const options = FLAG_OPTIONS[languageCode] ?? [];
  return Array.from(new Set([defaultFlag, ...options, ...NEUTRAL_FLAGS]));
}
