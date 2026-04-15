import React from 'react';

export interface AnimalDef {
  id: string;
  label: string;
  bg: string;
  Illustration: React.FC;
}

// Fox
const FoxIllustration: React.FC = () => (
  <>
    {/* Face */}
    <circle cx="50" cy="55" r="30" fill="#FF8C00" />
    {/* Ears - outer */}
    <polygon points="25,30 35,55 15,55" fill="#FF8C00" />
    <polygon points="75,30 85,55 65,55" fill="#FF8C00" />
    {/* Ears - inner */}
    <polygon points="25,33 33,52 17,52" fill="#FFCC80" />
    <polygon points="75,33 83,52 67,52" fill="#FFCC80" />
    {/* White muzzle */}
    <ellipse cx="50" cy="65" rx="16" ry="12" fill="#FFF8F0" />
    {/* Eyes */}
    <ellipse cx="41" cy="52" rx="4" ry="4.5" fill="#1A1A1A" />
    <ellipse cx="59" cy="52" rx="4" ry="4.5" fill="#1A1A1A" />
    {/* Nose */}
    <circle cx="50" cy="62" r="3" fill="#1A1A1A" />
  </>
);

// Panda
const PandaIllustration: React.FC = () => (
  <>
    {/* White face */}
    <circle cx="50" cy="55" r="30" fill="#FFFFFF" />
    {/* Ears */}
    <circle cx="25" cy="28" r="12" fill="#1A1A1A" />
    <circle cx="75" cy="28" r="12" fill="#1A1A1A" />
    {/* Eye patches */}
    <ellipse cx="40" cy="50" rx="9" ry="10" fill="#1A1A1A" />
    <ellipse cx="60" cy="50" rx="9" ry="10" fill="#1A1A1A" />
    {/* Eyes */}
    <circle cx="40" cy="51" r="5" fill="#FFFFFF" />
    <circle cx="60" cy="51" r="5" fill="#FFFFFF" />
    <circle cx="40" cy="51" r="3" fill="#1A1A1A" />
    <circle cx="60" cy="51" r="3" fill="#1A1A1A" />
    {/* Nose */}
    <ellipse cx="50" cy="63" rx="5" ry="4" fill="#1A1A1A" />
    {/* Smile */}
    <path d="M44 70 Q50 74 56 70" stroke="#888" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </>
);

// Lion
const LionIllustration: React.FC = () => (
  <>
    {/* Mane */}
    <circle cx="50" cy="55" r="36" fill="#C77B00" />
    {/* Face */}
    <circle cx="50" cy="55" r="26" fill="#FFD54F" />
    {/* Snout */}
    <ellipse cx="50" cy="65" rx="12" ry="9" fill="#FFE082" />
    {/* Eyes */}
    <ellipse cx="41" cy="51" rx="4" ry="4" fill="#A0522D" />
    <ellipse cx="59" cy="51" rx="4" ry="4" fill="#A0522D" />
    <circle cx="41" cy="51" r="2" fill="#1A1A1A" />
    <circle cx="59" cy="51" r="2" fill="#1A1A1A" />
    {/* Nose */}
    <circle cx="50" cy="63" r="3" fill="#1A1A1A" />
  </>
);

// Frog
const FrogIllustration: React.FC = () => (
  <>
    {/* Head */}
    <circle cx="50" cy="58" r="30" fill="#66BB6A" />
    {/* Eye whites - big protruding */}
    <circle cx="35" cy="32" r="12" fill="#FFFFFF" />
    <circle cx="65" cy="32" r="12" fill="#FFFFFF" />
    {/* Eye pupils */}
    <circle cx="35" cy="32" r="7" fill="#43A047" />
    <circle cx="65" cy="32" r="7" fill="#43A047" />
    <circle cx="35" cy="32" r="4" fill="#1A1A1A" />
    <circle cx="65" cy="32" r="4" fill="#1A1A1A" />
    {/* Nostrils */}
    <circle cx="46" cy="60" r="2.5" fill="#388E3C" />
    <circle cx="54" cy="60" r="2.5" fill="#388E3C" />
    {/* Smile */}
    <path d="M35 70 Q50 82 65 70" stroke="#388E3C" strokeWidth="3" fill="none" strokeLinecap="round" />
  </>
);

// Penguin
const PenguinIllustration: React.FC = () => (
  <>
    {/* Head */}
    <circle cx="50" cy="50" r="35" fill="#263238" />
    {/* Belly/face oval */}
    <ellipse cx="50" cy="62" rx="20" ry="24" fill="#ECEFF1" />
    {/* Eyes */}
    <circle cx="40" cy="44" r="7" fill="#FFFFFF" />
    <circle cx="60" cy="44" r="7" fill="#FFFFFF" />
    <circle cx="40" cy="44" r="4" fill="#1A1A1A" />
    <circle cx="60" cy="44" r="4" fill="#1A1A1A" />
    <circle cx="41" cy="43" r="1.5" fill="#FFFFFF" />
    <circle cx="61" cy="43" r="1.5" fill="#FFFFFF" />
    {/* Beak */}
    <polygon points="50,54 44,60 56,60" fill="#FF8F00" />
    {/* Flippers hint */}
    <ellipse cx="22" cy="62" rx="8" ry="14" fill="#1C2428" />
    <ellipse cx="78" cy="62" rx="8" ry="14" fill="#1C2428" />
  </>
);

// Koala
const KoalaIllustration: React.FC = () => (
  <>
    {/* Face */}
    <circle cx="50" cy="55" r="28" fill="#B0BEC5" />
    {/* Ears - large */}
    <circle cx="18" cy="38" r="18" fill="#90A4AE" />
    <circle cx="82" cy="38" r="18" fill="#90A4AE" />
    {/* Inner ears */}
    <circle cx="18" cy="38" r="11" fill="#607D8B" />
    <circle cx="82" cy="38" r="11" fill="#607D8B" />
    {/* Nose */}
    <ellipse cx="50" cy="62" rx="10" ry="8" fill="#455A64" />
    {/* Eyes */}
    <circle cx="39" cy="50" r="4" fill="#455A64" />
    <circle cx="61" cy="50" r="4" fill="#455A64" />
    <circle cx="40" cy="49" r="1.5" fill="#FFFFFF" />
    <circle cx="62" cy="49" r="1.5" fill="#FFFFFF" />
    {/* Smile */}
    <path d="M44 70 Q50 74 56 70" stroke="#607D8B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </>
);

// Cat
const CatIllustration: React.FC = () => (
  <>
    {/* Face */}
    <circle cx="50" cy="55" r="30" fill="#FFCC80" />
    {/* Ears outer */}
    <polygon points="26,28 36,55 16,55" fill="#FFCC80" />
    <polygon points="74,28 84,55 64,55" fill="#FFCC80" />
    {/* Ears inner */}
    <polygon points="26,33 33,52 19,52" fill="#FF8A65" />
    <polygon points="74,33 81,52 67,52" fill="#FF8A65" />
    {/* Eyes */}
    <ellipse cx="40" cy="52" rx="5" ry="6" fill="#558B2F" />
    <ellipse cx="60" cy="52" rx="5" ry="6" fill="#558B2F" />
    <ellipse cx="40" cy="52" rx="2.5" ry="5" fill="#1A1A1A" />
    <ellipse cx="60" cy="52" rx="2.5" ry="5" fill="#1A1A1A" />
    <circle cx="38" cy="50" r="1.5" fill="#FFFFFF" />
    <circle cx="58" cy="50" r="1.5" fill="#FFFFFF" />
    {/* Nose */}
    <polygon points="50,63 46,59 54,59" fill="#FF8A65" />
    {/* Whiskers */}
    <line x1="20" y1="62" x2="44" y2="65" stroke="#888" strokeWidth="1" />
    <line x1="20" y1="67" x2="44" y2="67" stroke="#888" strokeWidth="1" />
    <line x1="20" y1="72" x2="44" y2="69" stroke="#888" strokeWidth="1" />
    <line x1="80" y1="62" x2="56" y2="65" stroke="#888" strokeWidth="1" />
    <line x1="80" y1="67" x2="56" y2="67" stroke="#888" strokeWidth="1" />
    <line x1="80" y1="72" x2="56" y2="69" stroke="#888" strokeWidth="1" />
  </>
);

// Dog
const DogIllustration: React.FC = () => (
  <>
    {/* Face */}
    <circle cx="50" cy="52" r="28" fill="#A1887F" />
    {/* Floppy ears */}
    <ellipse cx="20" cy="55" rx="14" ry="22" fill="#795548" />
    <ellipse cx="80" cy="55" rx="14" ry="22" fill="#795548" />
    {/* Eyes */}
    <circle cx="40" cy="48" r="5" fill="#5D4037" />
    <circle cx="60" cy="48" r="5" fill="#5D4037" />
    <circle cx="40" cy="48" r="3" fill="#1A1A1A" />
    <circle cx="60" cy="48" r="3" fill="#1A1A1A" />
    <circle cx="41" cy="47" r="1.5" fill="#FFFFFF" />
    <circle cx="61" cy="47" r="1.5" fill="#FFFFFF" />
    {/* Snout */}
    <ellipse cx="50" cy="62" rx="13" ry="10" fill="#BCAAA4" />
    {/* Nose */}
    <ellipse cx="50" cy="58" rx="7" ry="5" fill="#1A1A1A" />
    {/* Smile */}
    <path d="M42 70 Q50 76 58 70" stroke="#795548" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </>
);

// Bunny
const BunnyIllustration: React.FC = () => (
  <>
    {/* Ears */}
    <ellipse cx="36" cy="22" rx="9" ry="22" fill="#F3E5F5" />
    <ellipse cx="64" cy="22" rx="9" ry="22" fill="#F3E5F5" />
    {/* Inner ears */}
    <ellipse cx="36" cy="22" rx="5" ry="17" fill="#CE93D8" />
    <ellipse cx="64" cy="22" rx="5" ry="17" fill="#CE93D8" />
    {/* Face */}
    <circle cx="50" cy="60" r="28" fill="#F8F0FF" />
    {/* Eyes */}
    <circle cx="40" cy="55" r="4.5" fill="#1A1A1A" />
    <circle cx="60" cy="55" r="4.5" fill="#1A1A1A" />
    <circle cx="41" cy="54" r="1.5" fill="#FFFFFF" />
    <circle cx="61" cy="54" r="1.5" fill="#FFFFFF" />
    {/* Nose */}
    <polygon points="50,66 46,63 54,63" fill="#CE93D8" />
    {/* Smile */}
    <path d="M44 70 Q50 75 56 70" stroke="#CE93D8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </>
);

// Raccoon
const RaccoonIllustration: React.FC = () => (
  <>
    {/* Face */}
    <circle cx="50" cy="55" r="30" fill="#90A4AE" />
    {/* Ears */}
    <circle cx="28" cy="28" r="11" fill="#607D8B" />
    <circle cx="72" cy="28" r="11" fill="#607D8B" />
    <circle cx="28" cy="28" r="6" fill="#455A64" />
    <circle cx="72" cy="28" r="6" fill="#455A64" />
    {/* Mask */}
    <ellipse cx="40" cy="51" rx="12" ry="9" fill="#455A64" />
    <ellipse cx="60" cy="51" rx="12" ry="9" fill="#455A64" />
    {/* Eyes (through mask) */}
    <circle cx="40" cy="51" r="6" fill="#FFFFFF" />
    <circle cx="60" cy="51" r="6" fill="#FFFFFF" />
    <circle cx="40" cy="51" r="3.5" fill="#1A1A1A" />
    <circle cx="60" cy="51" r="3.5" fill="#1A1A1A" />
    <circle cx="41" cy="50" r="1.5" fill="#FFFFFF" />
    <circle cx="61" cy="50" r="1.5" fill="#FFFFFF" />
    {/* Nose */}
    <ellipse cx="50" cy="65" rx="6" ry="5" fill="#1A1A1A" />
    {/* Chin stripe */}
    <ellipse cx="50" cy="72" rx="10" ry="6" fill="#CFD8DC" />
  </>
);

// Bear
const BearIllustration: React.FC = () => (
  <>
    {/* Ears */}
    <circle cx="28" cy="28" r="13" fill="#5D4037" />
    <circle cx="72" cy="28" r="13" fill="#5D4037" />
    <circle cx="28" cy="28" r="7" fill="#8D6E63" />
    <circle cx="72" cy="28" r="7" fill="#8D6E63" />
    {/* Face */}
    <circle cx="50" cy="55" r="30" fill="#8D6E63" />
    {/* Snout */}
    <ellipse cx="50" cy="65" rx="14" ry="11" fill="#A1887F" />
    {/* Nose */}
    <ellipse cx="50" cy="60" rx="6" ry="5" fill="#1A1A1A" />
    {/* Eyes */}
    <circle cx="38" cy="49" r="5" fill="#1A1A1A" />
    <circle cx="62" cy="49" r="5" fill="#1A1A1A" />
    <circle cx="39" cy="48" r="2" fill="#FFFFFF" />
    <circle cx="63" cy="48" r="2" fill="#FFFFFF" />
  </>
);

// Tiger
const TigerIllustration: React.FC = () => (
  <>
    {/* Face */}
    <circle cx="50" cy="55" r="30" fill="#FF8C00" />
    {/* Ears */}
    <polygon points="24,28 34,52 14,52" fill="#FF8C00" />
    <polygon points="76,28 86,52 66,52" fill="#FF8C00" />
    <polygon points="24,32 31,49 17,49" fill="#FF6F00" />
    <polygon points="76,32 83,49 69,49" fill="#FF6F00" />
    {/* White chin */}
    <ellipse cx="50" cy="68" rx="16" ry="13" fill="#FFF8F0" />
    {/* Forehead stripes */}
    <path d="M42 32 Q50 28 58 32" stroke="#1A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M39 38 Q50 34 61 38" stroke="#1A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M40 43 Q50 40 60 43" stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Eyes */}
    <ellipse cx="40" cy="51" rx="5" ry="5" fill="#FFC107" />
    <ellipse cx="60" cy="51" rx="5" ry="5" fill="#FFC107" />
    <ellipse cx="40" cy="51" rx="2" ry="4.5" fill="#1A1A1A" />
    <ellipse cx="60" cy="51" rx="2" ry="4.5" fill="#1A1A1A" />
    {/* Nose */}
    <circle cx="50" cy="63" r="3.5" fill="#1A1A1A" />
  </>
);

export const ANIMALS: AnimalDef[] = [
  { id: 'fox',     label: 'שועל',    bg: '#FF8C00', Illustration: FoxIllustration },
  { id: 'panda',   label: 'פנדה',    bg: '#ECEFF1', Illustration: PandaIllustration },
  { id: 'lion',    label: 'אריה',    bg: '#FFB300', Illustration: LionIllustration },
  { id: 'frog',    label: 'צפרדע',   bg: '#43A047', Illustration: FrogIllustration },
  { id: 'penguin', label: 'פינגווין', bg: '#263238', Illustration: PenguinIllustration },
  { id: 'koala',   label: 'קואלה',   bg: '#90A4AE', Illustration: KoalaIllustration },
  { id: 'cat',     label: 'חתול',    bg: '#FFA726', Illustration: CatIllustration },
  { id: 'dog',     label: 'כלב',     bg: '#795548', Illustration: DogIllustration },
  { id: 'bunny',   label: 'ארנב',    bg: '#E1BEE7', Illustration: BunnyIllustration },
  { id: 'raccoon', label: 'ראקון',   bg: '#607D8B', Illustration: RaccoonIllustration },
  { id: 'bear',    label: 'דב',      bg: '#6D4C41', Illustration: BearIllustration },
  { id: 'tiger',   label: 'נמר',     bg: '#F57C00', Illustration: TigerIllustration },
];
