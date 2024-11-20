export const ipaMappings = {
    'aa': 'ɑ',  // "father"
    'ae': 'æ',  // "cat"
    'ah': 'ʌ',  // "strut"
    'ao': 'ɔ',  // "caught"
    'aw': 'aʊ', // "now"
    'ay': 'aɪ', // "my"
    'b': 'b',   // "bat"
    'ch': 'tʃ', // "cheese"
    'd': 'd',   // "dog"
    'dh': 'ð',  // "this"
    'eh': 'ɛ',  // "bet"
    'er': 'ɝ',  // "bird" (stressed)
    'ey': 'eɪ', // "say"
    'f': 'f',   // "fine"
    'g': 'ɡ',   // "go"
    'hh': 'h',  // "hat"
    'ih': 'ɪ',  // "bit"
    'iy': 'i',  // "see"
    'jh': 'dʒ', // "judge"
    'k': 'k',   // "cat"
    'l': 'l',   // "love"
    'm': 'm',   // "man"
    'n': 'n',   // "no"
    'ng': 'ŋ',  // "sing"
    'ow': 'oʊ', // "go"
    'oy': 'ɔɪ', // "boy"
    'p': 'p',   // "pat"
    'r': 'ɹ',   // "run"
    's': 's',   // "sit"
    'sh': 'ʃ',  // "she"
    't': 't',   // "tap"
    'th': 'θ',  // "thing"
    'uh': 'ʊ',  // "foot"
    'uw': 'u',  // "food"
    'v': 'v',   // "van"
    'w': 'w',   // "wet"
    'y': 'j',   // "yes"
    'z': 'z',   // "zoo"
    'zh': 'ʒ',  // "measure"
    'oov': 'ʔ'  // Out of vocabulary / glottal stop (or undefined sound)
};

export const toIPA = (phone: keyof typeof ipaMappings) => 
    `/${ipaMappings[phone]}/`;

export enum PhonemeCategory {
    Consonants,
    Fricatives,
    StopsAndNasal,
    VowelsAndApproximant,
    Approximants,
    Vowels,
    Unknown
}

const categorizeIPA = (ipa: string) => {
    const consonants = new Set(['/t/', '/d/', '/k/', '/g/', '/n/', '/θ/', '/ð/', '/s/', '/z/', '/dʒ/', '/w/', '/h/', '/ŋ/', '/ɹ/', '/ʔ/', '/ʃ/', '/tʃ/', '/t/', '/ɡ/']);
    const fricatives = new Set(['/f/', '/v/']);
    const stopsAndNasal = new Set(['/m/', '/b/', '/p/']);
    const vowelsAndApproximant = new Set(['/u/', '/ʊ/', '/o/', '/ʌ/', '/r/', '/ɝ/']);
    const approximants = new Set(['/j/', '/l/']);
    const vowels = new Set(['/i/', '/ɪ/', '/e/', '/ɛ/', '/æ/', '/ɔ/', '/ɑ/', '/ə/', '/ʌ/', '/aɪ/', '/ɔɪ/', '/aʊ/', '/oʊ/', '/eɪ/']);

    if (consonants.has(ipa)) {
        return PhonemeCategory.Consonants;
    } else if (fricatives.has(ipa)) {
        return PhonemeCategory.Fricatives;
    } else if (stopsAndNasal.has(ipa)) {
        return PhonemeCategory.StopsAndNasal;
    } else if (vowelsAndApproximant.has(ipa)) {
        return PhonemeCategory.VowelsAndApproximant;
    } else if (approximants.has(ipa)) {
        return PhonemeCategory.Approximants;
    } else if (vowels.has(ipa)) {
        return PhonemeCategory.Vowels;
    } else {
        return PhonemeCategory.Unknown;
    }
}

export const categorizePhone = (phone: string | null) => {
    if (phone == null) return null;

    const truePhone = phone.split('_')[0];
    const ipa = toIPA(truePhone as keyof typeof ipaMappings);
    const category = categorizeIPA(ipa);

    return category;
}

const states: [ PhonemeCategory, number ][]  = [
    [ PhonemeCategory.Vowels, 5 ],
    [ PhonemeCategory.Approximants, 0 ],
    [ PhonemeCategory.StopsAndNasal, 8 ],
    [ PhonemeCategory.VowelsAndApproximant, 10 ],
    [ PhonemeCategory.Fricatives, 7 ],
    [ PhonemeCategory.Consonants, 6 ]
];

const transitions: [ PhonemeCategory, PhonemeCategory, ...number[] ][] = [
    [ PhonemeCategory.VowelsAndApproximant, PhonemeCategory.Vowels, 9, 3 ],
    [ PhonemeCategory.Consonants, PhonemeCategory.Vowels, 0, 2 ],
    [ PhonemeCategory.StopsAndNasal, PhonemeCategory.Vowels, 0, 2 ],
    [ PhonemeCategory.VowelsAndApproximant, PhonemeCategory.Consonants, 9, 3 ]
]

// Any transitions from one category to another are reversable
for (const [ from, to, ...phases ] of [ ...transitions ]) {
    const phasesReversed = phases;
    phasesReversed.reverse();

    transitions.push([ to, from, ...phasesReversed ]);
}

export const findMouth = (
    { prevPhone, phone, nextPhone }: {  
        prevPhone: string | null,
        phone: string,
        nextPhone: string | null
    }, 
    frameLen: number
) => {
    const category = categorizePhone(phone);
    const prevCategory = prevPhone != null ? categorizePhone(prevPhone) : null;

    const transitionFromTo = transitions.find(([ from, to ]) => from == prevCategory && to == category);
    if (transitionFromTo != null) {
        const transitions = transitionFromTo.slice(2);
        const transition = transitions[frameLen];
        if (transition != null) return transition;
    }

    const state = states.find(state => state[0] == category);
    if (state != null) {
        return state[1];
    }

    return 8;
}