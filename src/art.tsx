import type { CSSProperties } from 'react';

/**
 * Bobcat — the FixIt mascot, drawn inline so it needs no image files.
 * Moods: curious (big green eyes), happy (closed smiling eyes + blush), sleepy (closed eyes + z).
 * Accessories: hat (staff hard hat), lens (magnifying glass while "looking").
 */
export type Mood = 'curious' | 'happy' | 'sleepy';

interface BobcatProps {
  mood?: Mood;
  hat?: boolean;
  lens?: boolean;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

const FUR = '#d9a066';
const FUR_DARK = '#8b5a2b';
const CREAM = '#f7e6d0';
const INK = '#3b2a1e';
const PINK = '#f2b5a7';
const EYE = '#2fb66f';

export function Bobcat({ mood = 'curious', hat = false, lens = false, size = 120, className, style }: BobcatProps) {
  const smiling = mood === 'happy';
  return (
    <svg
      className={['mascot', className].filter(Boolean).join(' ')}
      viewBox="0 0 200 200"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={style}
    >
      {/* ears (behind the head) */}
      <path d="M50 84 L34 20 L86 58 Z" fill={FUR} />
      <path d="M150 84 L166 20 L114 58 Z" fill={FUR} />
      <path d="M54 76 L44 38 L76 60 Z" fill={PINK} />
      <path d="M146 76 L156 38 L124 60 Z" fill={PINK} />
      <path d="M34 20 L46 44 L62 34 Z" fill={INK} />
      <path d="M166 20 L154 44 L138 34 Z" fill={INK} />
      <path d="M34 20 L26 6 M34 20 L40 4" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M166 20 L174 6 M166 20 L160 4" stroke={INK} strokeWidth="4" strokeLinecap="round" />

      {/* head with jagged cheek ruffs */}
      <path
        d="M100 50 C136 50 164 68 170 98 L184 114 L170 124 L180 146 L160 150 C150 172 128 180 100 180 C72 180 50 172 40 150 L20 146 L30 124 L16 114 L30 98 C36 68 64 50 100 50 Z"
        fill={FUR}
      />
      {/* forehead stripes + cheek spots */}
      <path d="M88 64 L91 82 M100 60 L100 80 M112 64 L109 82" stroke={FUR_DARK} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      <g fill={FUR_DARK} opacity="0.55">
        <ellipse cx="48" cy="122" rx="5" ry="3.5" />
        <ellipse cx="56" cy="140" rx="4" ry="3" />
        <ellipse cx="152" cy="122" rx="5" ry="3.5" />
        <ellipse cx="144" cy="140" rx="4" ry="3" />
      </g>

      {/* muzzle */}
      <ellipse cx="100" cy="138" rx="36" ry="26" fill={CREAM} />

      {/* eyes */}
      {mood === 'happy' ? (
        <g stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d="M62 108 C68 96 84 96 90 108" />
          <path d="M110 108 C116 96 132 96 138 108" />
        </g>
      ) : mood === 'sleepy' ? (
        <g stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M64 106 C70 112 84 112 90 106" />
          <path d="M110 106 C116 112 130 112 136 106" />
        </g>
      ) : (
        <g>
          <ellipse cx="76" cy="104" rx="12" ry="13" fill="#fff" />
          <ellipse cx="124" cy="104" rx="12" ry="13" fill="#fff" />
          <circle cx="78" cy="106" r="7.5" fill={EYE} />
          <circle cx="122" cy="106" r="7.5" fill={EYE} />
          <circle cx="79" cy="107" r="3.6" fill="#111" />
          <circle cx="121" cy="107" r="3.6" fill="#111" />
          <circle cx="75" cy="101" r="2.4" fill="#fff" />
          <circle cx="118" cy="101" r="2.4" fill="#fff" />
        </g>
      )}

      {/* nose + mouth */}
      <path d="M91 128 L109 128 L100 138 Z" fill={INK} />
      {smiling ? (
        <path d="M100 138 L100 144 M100 144 C94 154 82 152 80 144 M100 144 C106 154 118 152 120 144" stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M100 138 L100 144 M100 144 C96 150 88 150 86 145 M100 144 C104 150 112 150 114 145" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
      )}
      {smiling && (
        <g fill={PINK} opacity="0.7">
          <ellipse cx="60" cy="126" rx="9" ry="5" />
          <ellipse cx="140" cy="126" rx="9" ry="5" />
        </g>
      )}

      {/* whiskers */}
      <g stroke={INK} strokeWidth="2" strokeLinecap="round" opacity="0.75">
        <path d="M64 132 L30 126 M64 140 L30 142" />
        <path d="M136 132 L170 126 M136 140 L170 142" />
      </g>

      {mood === 'sleepy' && (
        <g fill={INK} opacity="0.8" fontFamily="system-ui, sans-serif" fontWeight="800">
          <text x="150" y="62" fontSize="20">z</text>
          <text x="166" y="44" fontSize="14">z</text>
        </g>
      )}

      {hat && (
        <g>
          <path d="M44 66 C44 30 156 30 156 66 Z" fill="#f5c518" />
          <rect x="92" y="34" width="16" height="32" rx="6" fill="#ffd84a" />
          <rect x="34" y="62" width="132" height="12" rx="6" fill="#e0b010" />
        </g>
      )}

      {lens && (
        <g>
          <line x1="166" y1="166" x2="192" y2="192" stroke={INK} strokeWidth="9" strokeLinecap="round" />
          <circle cx="146" cy="146" r="28" fill="rgba(47, 208, 131, 0.18)" stroke="#0b3426" strokeWidth="6" />
          <path d="M132 134 C136 128 144 126 150 128" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" fill="none" />
        </g>
      )}
    </svg>
  );
}

/**
 * BrandMark — the FixIt Bobcat logo: a paw print over a hammer.
 * tone "light" = leaf-green mark for dark backgrounds, "dark" = forest mark for paper.
 */
interface BrandMarkProps {
  size?: number;
  tone?: 'light' | 'dark' | 'white';
  className?: string;
}

export function BrandMark({ size = 36, tone = 'light', className }: BrandMarkProps) {
  const fill = tone === 'light' ? '#2fb66f' : tone === 'white' ? '#ffffff' : '#0f3d2e';
  const cut = tone === 'dark' ? '#f3f7f4' : '#0f3d2e';
  return (
    <svg
      className={['brand-mark', className].filter(Boolean).join(' ')}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <g fill={fill} transform="rotate(45 32 32)">
        {/* hammer: handle + head */}
        <rect x="28.5" y="19" width="7" height="39" rx="3.5" />
        <rect x="18" y="6" width="28" height="13" rx="3.5" />
        <rect x="18" y="6" width="9" height="13" rx="3.5" opacity="0.55" />
      </g>
      <g fill={fill} stroke={cut} strokeWidth="2.2">
        {/* paw print */}
        <ellipse cx="41" cy="46" rx="8.5" ry="6.5" />
        <circle cx="31.5" cy="38.5" r="3.7" />
        <circle cx="38.5" cy="34" r="3.7" />
        <circle cx="46" cy="35" r="3.7" />
        <circle cx="51.5" cy="40.5" r="3.7" />
      </g>
    </svg>
  );
}
