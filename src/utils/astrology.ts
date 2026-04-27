// ─── Astrology Engine ───
// Deterministic "AI" predictions based on name + DOB hashing.
// No real astrology API — everything runs in the browser.

export interface UserData {
  name: string;
  dob: string;
  gender: string;
}

export interface Prediction {
  category: string;
  emoji: string;
  title: string;
  description: string;
  rating: number; // 1-5
}

export interface PalmReading {
  rashi: string;
  nakshatra: string;
  rulingPlanet: string;
  luckyNumber: number;
  luckyColor: string;
  predictions: Prediction[];
  overallFortune: string;
  specialMessage: string;
}

// Simple hash from string to number
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Seeded pseudo-random
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rashis = [
  "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)",
  "Karka (Cancer)", "Simha (Leo)", "Kanya (Virgo)",
  "Tula (Libra)", "Vrishchika (Scorpio)", "Dhanu (Sagittarius)",
  "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"
];

const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
  "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
  "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra",
  "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Moola",
  "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const planets = [
  "Sun (Surya)", "Moon (Chandra)", "Mars (Mangal)",
  "Mercury (Budha)", "Jupiter (Guru)", "Venus (Shukra)",
  "Saturn (Shani)", "Rahu", "Ketu"
];

const luckyColors = [
  "Royal Purple", "Golden Yellow", "Deep Red", "Emerald Green",
  "Sapphire Blue", "Silver White", "Coral Orange", "Rose Pink"
];

const careerPredictions = [
  {
    title: "A Great Rise Awaits You",
    descriptions: [
      "The lines on your palm reveal a strong and ascending fate line. Between ages {age1} and {age2}, you will experience a significant career breakthrough. Your hard work from the past will finally bear fruit. A person of authority — possibly someone connected to government or corporate leadership — will recognize your talent and open doors you never expected. Financial stability through career will be a defining feature of the next 3 years.",
      "Your palm shows remarkable signs of leadership. The fate line intersects with your sun line, indicating that public recognition and career advancement are written in your destiny. Expect promotions, new opportunities, or even a completely new career path that aligns better with your true calling. The universe has been preparing you for this moment.",
      "The depth of your fate line suggests resilience and determination. You may have faced setbacks, but the stars indicate that those were merely tests. From {month} onwards, a powerful planetary alignment will push your career forward. Be ready to take bold decisions — they will pay off immensely."
    ]
  },
  {
    title: "Creative Success in Your Future",
    descriptions: [
      "Your palm reveals a unique Mercury line formation that indicates exceptional creative and intellectual abilities. Whether in writing, technology, art, or entrepreneurship — your ideas will gain momentum. Around {month}, a creative project or business idea you've been nurturing will take off. Trust your instincts and don't let doubt hold you back.",
      "The combination of your head line and sun line suggests that your career success will come through innovation and original thinking. You are not meant for conventional paths. The stars see you building something unique — perhaps a business, a brand, or an influential body of work. Financial rewards will follow creative fulfillment.",
      "Your palm indicates that the next {years} years will be transformative for your professional life. A collaboration or partnership will emerge that perfectly complements your strengths. This person may come from an unexpected place — perhaps through social media or a chance encounter."
    ]
  }
];

const marriagePredictions = [
  {
    title: "Deep & Soulful Connection",
    descriptions: [
      "Your heart line is beautifully curved and extends toward Jupiter mount, indicating a deep, passionate, and spiritually fulfilling love life. If you're single, the stars suggest that you will meet your soulmate within the next {years} years — possibly through a family connection or a social gathering. If you're already in a relationship, expect it to deepen significantly. A wedding or commitment is highly likely by {year}.",
      "The depth and clarity of your heart line suggests you are someone who loves deeply and loyally. Your partner (or future partner) will be someone who matches your emotional intensity. The Venus mount on your palm is well-developed, which in Indian palmistry indicates a harmonious and affectionate married life. Children will bring additional joy and purpose.",
      "Your marriage line shows a single, strong, and unbroken marking — this is considered very auspicious in Vedic palmistry. It suggests a long-lasting and devoted partnership. There may be minor challenges around {month}, but these will only strengthen your bond. Trust and communication are your greatest assets in love."
    ]
  },
  {
    title: "Love After Transformation",
    descriptions: [
      "Your palm reveals that love will come after a period of personal transformation. Perhaps you've been through difficult times in relationships, but the lines clearly show healing and renewal. The period around {month} to {month2} will be particularly significant for romantic connections. Stay open to unexpected encounters.",
      "The positioning of your marriage line suggests that your ideal partner may come from a different cultural background or geographic region. This relationship will teach you profound lessons about acceptance and growth. Your Venus mount shows increasing warmth and attractiveness as you mature.",
      "An interesting fork in your heart line indicates that you may have to choose between two paths in love. Trust your intuition when the time comes — your palm shows that the choice you make will lead to deep fulfillment and lasting happiness."
    ]
  }
];

const wealthPredictions = [
  {
    title: "Prosperity Through Wisdom",
    descriptions: [
      "The money lines on your palm are remarkably well-defined. You have what palmists call the 'Lakshmi Rekha' — a rare marking that indicates wealth accumulation through wisdom and smart decisions. Between ages {age1} and {age2}, your financial situation will improve dramatically. Property, investments, or business ventures initiated during this period will yield exceptional returns.",
      "Your palm shows a strong connection between the fate line and the sun line, creating what is known as a 'prosperity triangle.' This geometric formation is found in fewer than 8% of people and indicates above-average wealth potential. Focus on investments and savings during {month} — planetary alignments will favor financial growth.",
      "The Jupiter mount on your palm is elevated, suggesting good fortune through knowledge, teaching, or advisory roles. You have the potential to build significant wealth, but it will come through helping others succeed. Think of mentorship, consulting, or creating educational content. The money will follow the value you create."
    ]
  },
  {
    title: "Unexpected Financial Gains",
    descriptions: [
      "A rare cross-marking near your fate line suggests unexpected financial windfalls. This could come in the form of inheritance, a sudden business opportunity, or a fortunate investment. The period between {month} and {month2} is particularly favorable for financial decisions. Trust your gut and act decisively.",
      "Your palm reveals strong Rahu influence on your wealth sector, indicating that unconventional income sources will be your strength. Digital businesses, technology, cryptocurrency, or international trade are strongly indicated. Don't be afraid to explore unfamiliar territories — your destiny lies outside your comfort zone.",
      "The clarity of your success line suggests that public recognition will precede wealth. You may become known for something — a skill, a creation, or a service — and the financial rewards will follow naturally. Focus on building your personal brand in the next {years} years."
    ]
  }
];

const healthPredictions = [
  {
    title: "Strong Vitality & Long Life",
    descriptions: [
      "Your life line is long, deep, and unbroken — one of the most auspicious signs in palmistry. This indicates strong physical vitality, resilience against illness, and a naturally long life. However, the stars advise paying special attention to your digestive health and stress levels between {month} and {month2}. Regular yoga and meditation will amplify your natural wellness.",
      "The curve of your life line suggests an active and energetic lifestyle. You recover quickly from illness and have a strong immune system. Your palm also shows a secondary health line that indicates growing interest in wellness, fitness, or healing practices. Consider incorporating Ayurvedic principles into your daily routine for optimal health.",
      "Your palm shows what Vedic palmists call the 'Rishi Rekha' — a marking associated with spiritual health and inner peace. While your physical health is generally strong, your greatest strength lies in mental and emotional wellness. Practices like pranayama, meditation, and spending time in nature will unlock extraordinary vitality."
    ]
  },
  {
    title: "Healing & Renewal Phase",
    descriptions: [
      "Your life line shows a small island formation around the middle section, which in palmistry indicates a period of health challenges that leads to profound healing and lifestyle transformation. This is not a cause for alarm — rather, it's your body's way of guiding you toward healthier habits. The period around {month} is ideal for starting a wellness journey.",
      "The head line on your palm suggests occasional overthinking and mental fatigue. Your greatest health challenge is not physical but psychological — learning to rest, disconnect, and trust the process. The stars strongly recommend reducing screen time and embracing nature-based healing during {month}.",
      "An interesting formation near your Mars mount suggests tremendous physical endurance once you channel your energy properly. Sports, martial arts, or intensive workout routines will not only improve your health but also boost your confidence and career performance."
    ]
  }
];

const overallFortunes = [
  "The cosmic alignment at your birth, combined with the sacred geometry of your palm lines, reveals a destiny of extraordinary significance. You are at a pivotal crossroad, and the choices you make in the next {years} years will define the next decade of your life. The stars have been silently preparing you for a breakthrough — in love, in career, in wealth. Trust the process, trust yourself, and let the universe guide your steps. 🙏✨",
  "Your palm tells the story of a soul that has traveled through many lifetimes to arrive at this moment. The wisdom etched in your lines speaks of past struggles that have forged an unbreakable spirit. The next chapter of your life will be marked by abundance, love, and deep spiritual awakening. Everything you've been through has been preparing you for what's coming. The universe remembers your patience. 🌟",
  "Ancient Vedic wisdom teaches that every palm is a map of destiny written by the stars at the moment of birth. Your map reveals a remarkable journey — one filled with both challenges and extraordinary blessings. The key to unlocking your full potential lies in self-belief and decisive action. The next {years} years will be the most transformative period of your life. Embrace the changes with courage and gratitude. 🔮",
  "The mystic configuration of your palm lines creates what ancient rishis called 'Divya Yoga' — a divine combination that appears once in a generation. This marking suggests that you are destined for something greater than ordinary success. Whether it manifests as spiritual leadership, creative genius, or material abundance depends on the choices you make from this point forward. The stars are watching, and they are in your favor. ✨🙏"
];

const specialMessages = [
  "🕉️ Recommended Mantra: Chant 'Om Hreem Shreem Lakshmi Bhyo Namah' 108 times every Friday for enhanced prosperity.",
  "🪔 Light a ghee lamp every Thursday evening facing North-East for Jupiter's blessings on your career and wisdom.",
  "💎 Your lucky gemstone is {gem}. Wearing it on your {finger} finger can amplify the positive energies in your palm.",
  "🌿 Vedic Remedy: Plant a Tulsi sapling on a Monday morning. Water it daily while chanting your personal mantra for health and peace.",
  "🔔 Temple Visit: Visit a Hanuman temple on Tuesdays and Saturdays. Offer sindoor and recite Hanuman Chalisa for removing obstacles.",
  "📿 Wear a Rudraksha mala with {beads} beads for spiritual protection and enhanced intuition.",
];

const gems = ["Yellow Sapphire (Pukhraj)", "Blue Sapphire (Neelam)", "Ruby (Manik)", "Emerald (Panna)", "Pearl (Moti)", "Red Coral (Moonga)", "Diamond (Heera)", "Cat's Eye (Lehsunia)"];
const fingers = ["index", "ring", "middle", "little"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function generateReading(userData: UserData): PalmReading {
  const seed = hashString(userData.name + userData.dob);
  const rand = seededRandom(seed);

  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
  const randRange = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

  const dobDate = new Date(userData.dob);
  const currentYear = new Date().getFullYear();
  const age = currentYear - dobDate.getFullYear();

  const rashi = rashis[dobDate.getMonth()];
  const nakshatra = pick(nakshatras);
  const rulingPlanet = pick(planets);
  const luckyNumber = randRange(1, 9);
  const luckyColor = pick(luckyColors);

  const fillTemplate = (text: string): string => {
    return text
      .replace(/\{age1\}/g, String(age + randRange(1, 3)))
      .replace(/\{age2\}/g, String(age + randRange(4, 8)))
      .replace(/\{month\}/g, pick(months))
      .replace(/\{month2\}/g, pick(months))
      .replace(/\{year\}/g, String(currentYear + randRange(1, 3)))
      .replace(/\{years\}/g, String(randRange(2, 5)))
      .replace(/\{gem\}/g, pick(gems))
      .replace(/\{finger\}/g, pick(fingers))
      .replace(/\{beads\}/g, String(pick([5, 7, 9, 11, 21])));
  };

  const careerGroup = pick(careerPredictions);
  const marriageGroup = pick(marriagePredictions);
  const wealthGroup = pick(wealthPredictions);
  const healthGroup = pick(healthPredictions);

  const predictions: Prediction[] = [
    {
      category: "Career",
      emoji: "💼",
      title: careerGroup.title,
      description: fillTemplate(pick(careerGroup.descriptions)),
      rating: randRange(3, 5),
    },
    {
      category: "Marriage & Love",
      emoji: "💕",
      title: marriageGroup.title,
      description: fillTemplate(pick(marriageGroup.descriptions)),
      rating: randRange(3, 5),
    },
    {
      category: "Wealth & Finance",
      emoji: "💰",
      title: wealthGroup.title,
      description: fillTemplate(pick(wealthGroup.descriptions)),
      rating: randRange(3, 5),
    },
    {
      category: "Health & Vitality",
      emoji: "🏥",
      title: healthGroup.title,
      description: fillTemplate(pick(healthGroup.descriptions)),
      rating: randRange(3, 5),
    },
  ];

  return {
    rashi,
    nakshatra,
    rulingPlanet,
    luckyNumber,
    luckyColor,
    predictions,
    overallFortune: fillTemplate(pick(overallFortunes)),
    specialMessage: fillTemplate(pick(specialMessages)),
  };
}
