/**
 * E3D — Custom 3D animated & interactive emoji component
 *
 * Props:
 *   emoji       string   — the emoji character(s) to render
 *   size        number   — font-size in px  (default 24)
 *   anim        string   — override animation: 'float'|'bounce'|'wiggle'|'pulse'|'shake'|'spin'
 *   interactive bool     — enable hover/press/click effects  (default true)
 *   delay       number   — animation-delay in ms so sibling emojis feel alive (default 0)
 *   onClick     fn       — optional click handler
 *   style       object   — extra inline styles on the wrapper span
 *   className   string   — extra class names
 */

import { useState, useRef } from 'react';

/* ── animation defaults per emoji ─────────────────────────────────────────── */
const ANIM = {
  /* Food & drink → bounce */
  '🥐':'bounce','🍽':'bounce','🍳':'bounce','☕':'bounce',
  /* Tools / mechanical → wiggle */
  '🔧':'wiggle','🪠':'wiggle','🔑':'wiggle','🔩':'wiggle','🔒':'wiggle',
  '🔄':'wiggle','🔁':'wiggle','🛠':'wiggle','✂':'wiggle',
  /* Nature → float */
  '🌿':'float','🌸':'float','🌱':'float','🌹':'float',
  /* Animals → bounce */
  '🐾':'bounce','🦷':'bounce',
  /* Stars / sparkle → pulse */
  '★':'pulse','⭐':'pulse','🌟':'pulse',
  /* Energy / warning → shake */
  '⚡':'shake','⚠':'shake',
  /* Celebration / action → bounce */
  '🎉':'bounce','🎯':'bounce','🚀':'bounce','🏆':'bounce',
  /* People / body → wiggle */
  '👔':'wiggle','💇':'wiggle','👨':'wiggle','🧘':'wiggle',
  /* Heart → pulse */
  '♥':'pulse','❤':'pulse',
  /* Flags → float (staggered, gentle) */
  '🇬':'float','🇺':'float','🇦':'float','🇨':'float','🇸':'float',
  /* Pin → bounce */
  '📍':'bounce',
  /* Tag → wiggle */
  '🏷':'wiggle',
  /* Documents / data (default float) */
};

function getAnim(emoji) {
  if (!emoji) return 'float';
  return (
    ANIM[emoji]           ||   // full match
    ANIM[emoji.slice(0,2)]||   // first two chars (covers flag sequences like 🇬🇧)
    ANIM[emoji[0]]        ||   // first char
    'float'
  );
}

/* ── drop-shadow stacks for resting / hovered states ─────────────────────── */
const SHADOW_REST =
  'drop-shadow(0 3px 7px rgba(0,0,0,.30)) drop-shadow(0 1px 2px rgba(0,0,0,.18))';

const SHADOW_HOV =
  'drop-shadow(0 14px 24px rgba(16,185,129,.50)) ' +
  'drop-shadow(0 5px 10px rgba(0,0,0,.18)) ' +
  'drop-shadow(0 0 14px rgba(16,185,129,.22))';

const SHADOW_PRESS =
  'drop-shadow(0 1px 3px rgba(0,0,0,.25))';

/* ── component ────────────────────────────────────────────────────────────── */
export default function E3D({
  emoji,
  size     = 24,
  anim,
  interactive = true,
  delay    = 0,
  onClick,
  style    = {},
  className = '',
}) {
  const [hov,     setHov]     = useState(false);
  const [pressed, setPressed] = useState(false);
  const [popping, setPopping] = useState(false);
  const popTimer = useRef(null);

  const animType = anim || getAnim(emoji);

  /* build className string */
  const cls = [
    'e3d',
    `e3d-${animType}`,
    popping  ? 'e3d-popping'  : '',
    hov      ? 'e3d-hovered'  : '',
    pressed  ? 'e3d-pressed'  : '',
    className,
  ].filter(Boolean).join(' ');

  const transform = pressed
    ? 'scale(0.76) translateY(4px)'
    : hov
    ? 'scale(1.35) translateY(-10px) rotate(-7deg)'
    : undefined;

  const filter = pressed ? SHADOW_PRESS : hov ? SHADOW_HOV : SHADOW_REST;

  function handleMouseUp() {
    if (!interactive) return;
    setPressed(false);
    /* trigger pop burst */
    clearTimeout(popTimer.current);
    setPopping(true);
    popTimer.current = setTimeout(() => setPopping(false), 520);
    onClick?.();
  }

  return (
    <span
      className={cls}
      style={{
        fontSize : size,
        transform,
        filter,
        animationDelay: delay ? `${delay}ms` : undefined,
        ...style,
      }}
      onMouseEnter={() => interactive && setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown ={() => interactive && setPressed(true)}
      onMouseUp   ={handleMouseUp}
    >
      {emoji}
    </span>
  );
}
