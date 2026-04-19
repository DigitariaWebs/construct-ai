'use client'

// Decorative animated backdrop — flowing wave contours.
// Stacked sine-wave lines that translate horizontally at different speeds,
// layered over a breathing color wash with a subtle noise grain.
// Pure SVG + CSS keyframes — no video, no JS animation loop. Honors
// prefers-reduced-motion.

export default function PlatformBackdrop() {
  return (
    <div
      aria-hidden
      className="pc-backdrop pointer-events-none fixed inset-0 -z-0 overflow-hidden"
    >
      {/* Color wash — slow breathing glow */}
      <div className="pc-wash absolute inset-0" />

      {/* Flowing wave lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1600 900"
      >
        <defs>
          <linearGradient id="pc-line-lime" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(212,255,58,0)" />
            <stop offset="30%"  stopColor="rgba(212,255,58,0.8)" />
            <stop offset="70%"  stopColor="rgba(212,255,58,0.8)" />
            <stop offset="100%" stopColor="rgba(212,255,58,0)" />
          </linearGradient>
          <linearGradient id="pc-line-cyan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(56,189,248,0)" />
            <stop offset="30%"  stopColor="rgba(56,189,248,0.6)" />
            <stop offset="70%"  stopColor="rgba(56,189,248,0.6)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0)" />
          </linearGradient>
          <linearGradient id="pc-line-violet" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(168,85,247,0)" />
            <stop offset="30%"  stopColor="rgba(168,85,247,0.55)" />
            <stop offset="70%"  stopColor="rgba(168,85,247,0.55)" />
            <stop offset="100%" stopColor="rgba(168,85,247,0)" />
          </linearGradient>

          {/* One full-period sine wave (x: -800 → 2400), vertically centered at 0.
              Groups translate this path around viewBox to position each band. */}
          <path
            id="pc-wave"
            d="M -800 0
               C -600 -40, -400  40, -200 0
               S  200 -40,  400 0
               S  800 -40, 1000 0
               S 1400 -40, 1600 0
               S 2000 -40, 2200 0
               S 2600 -40, 2400 0"
          />

          {/* Second wave with different phase/amplitude */}
          <path
            id="pc-wave-b"
            d="M -800 0
               C -600  50, -400 -50, -200 0
               S  200  50,  400 0
               S  800  50, 1000 0
               S 1400  50, 1600 0
               S 2000  50, 2200 0
               S 2600  50, 2400 0"
          />

          <radialGradient id="pc-fade" cx="50%" cy="50%" r="70%">
            <stop offset="0%"  stopColor="white" stopOpacity="1" />
            <stop offset="60%" stopColor="white" stopOpacity="0.85" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="pc-edge-fade">
            <rect width="100%" height="100%" fill="url(#pc-fade)" />
          </mask>
        </defs>

        <g mask="url(#pc-edge-fade)" fill="none" strokeLinecap="round">
          {/* Top group of waves */}
          <g className="pc-flow pc-flow--a" transform="translate(0 180)">
            <use href="#pc-wave" stroke="url(#pc-line-lime)"   strokeWidth="1.25" opacity="0.9" />
          </g>
          <g className="pc-flow pc-flow--b" transform="translate(0 260)">
            <use href="#pc-wave-b" stroke="url(#pc-line-cyan)" strokeWidth="1" opacity="0.7" />
          </g>
          <g className="pc-flow pc-flow--c" transform="translate(0 340)">
            <use href="#pc-wave" stroke="url(#pc-line-violet)" strokeWidth="0.9" opacity="0.6" />
          </g>

          {/* Middle */}
          <g className="pc-flow pc-flow--d" transform="translate(0 450)">
            <use href="#pc-wave-b" stroke="url(#pc-line-lime)" strokeWidth="1.5" opacity="1" />
          </g>
          <g className="pc-flow pc-flow--e" transform="translate(0 540)">
            <use href="#pc-wave" stroke="url(#pc-line-cyan)"   strokeWidth="1" opacity="0.65" />
          </g>

          {/* Bottom group */}
          <g className="pc-flow pc-flow--f" transform="translate(0 640)">
            <use href="#pc-wave" stroke="url(#pc-line-violet)" strokeWidth="0.9" opacity="0.55" />
          </g>
          <g className="pc-flow pc-flow--g" transform="translate(0 720)">
            <use href="#pc-wave-b" stroke="url(#pc-line-lime)" strokeWidth="1.1" opacity="0.75" />
          </g>
          <g className="pc-flow pc-flow--h" transform="translate(0 800)">
            <use href="#pc-wave" stroke="url(#pc-line-cyan)"   strokeWidth="0.9" opacity="0.55" />
          </g>
        </g>
      </svg>

      {/* Subtle drifting particles along the flow */}
      <div className="pc-particles absolute inset-0">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className={`pc-particle pc-particle--${i + 1}`} />
        ))}
      </div>

      {/* Inner vignette keeps the center readable */}
      <div className="pc-vignette absolute inset-0" />

      <style>{`
        .pc-backdrop {
          background: radial-gradient(ellipse at center, #0a0d10 0%, #06080a 100%);
        }

        /* Breathing color wash */
        .pc-wash {
          background:
            radial-gradient(1100px 700px at 20% 25%, rgba(212,255,58,0.10), transparent 60%),
            radial-gradient(950px 650px at 82% 78%,  rgba(56,189,248,0.08), transparent 60%),
            radial-gradient(700px 500px at 55% 110%, rgba(168,85,247,0.06), transparent 60%);
          animation: pc-wash 18s ease-in-out infinite alternate;
        }

        /* Wave groups translate left-to-right at different speeds.
           Each uses its own timing so they never sync up. */
        .pc-flow { will-change: transform; }
        .pc-flow--a { animation: pc-slide   14s linear infinite;        }
        .pc-flow--b { animation: pc-slide-r 19s linear infinite;        }
        .pc-flow--c { animation: pc-slide   24s linear infinite;        }
        .pc-flow--d { animation: pc-slide-r 11s linear infinite;        }
        .pc-flow--e { animation: pc-slide   17s linear infinite;        }
        .pc-flow--f { animation: pc-slide-r 22s linear infinite;        }
        .pc-flow--g { animation: pc-slide   13s linear infinite;        }
        .pc-flow--h { animation: pc-slide-r 20s linear infinite;        }

        /* Particles drift left along the waves, trailing a short glow */
        .pc-particle {
          position: absolute;
          width: 4px; height: 4px;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(212,255,58,0.9), rgba(212,255,58,0.2) 60%, transparent 80%);
          box-shadow: -12px 0 18px rgba(212,255,58,0.4);
          opacity: 0;
          animation: pc-particle 12s linear infinite;
        }
        .pc-particle--1 { top: 18%; animation-delay:   0s; animation-duration: 13s; }
        .pc-particle--2 { top: 27%; animation-delay:  -3s; animation-duration: 17s; background: radial-gradient(circle, rgba(56,189,248,0.9), rgba(56,189,248,0.2) 60%, transparent 80%); box-shadow: -12px 0 18px rgba(56,189,248,0.4); }
        .pc-particle--3 { top: 36%; animation-delay:  -6s; animation-duration: 19s; }
        .pc-particle--4 { top: 48%; animation-delay:  -2s; animation-duration: 14s; background: radial-gradient(circle, rgba(168,85,247,0.9), rgba(168,85,247,0.2) 60%, transparent 80%); box-shadow: -12px 0 18px rgba(168,85,247,0.4); }
        .pc-particle--5 { top: 58%; animation-delay:  -8s; animation-duration: 16s; }
        .pc-particle--6 { top: 68%; animation-delay:  -4s; animation-duration: 21s; background: radial-gradient(circle, rgba(56,189,248,0.9), rgba(56,189,248,0.2) 60%, transparent 80%); box-shadow: -12px 0 18px rgba(56,189,248,0.4); }
        .pc-particle--7 { top: 76%; animation-delay: -10s; animation-duration: 15s; }
        .pc-particle--8 { top: 84%; animation-delay:  -1s; animation-duration: 18s; background: radial-gradient(circle, rgba(168,85,247,0.9), rgba(168,85,247,0.2) 60%, transparent 80%); box-shadow: -12px 0 18px rgba(168,85,247,0.4); }
        .pc-particle--9 { top: 90%; animation-delay:  -5s; animation-duration: 14s; }

        /* Vignette — pulls focus back to content */
        .pc-vignette {
          background:
            radial-gradient(ellipse 65% 50% at 50% 45%, rgba(6,8,10,0.55) 0%, transparent 75%),
            linear-gradient(to bottom, transparent 60%, rgba(6,8,10,0.5) 100%);
        }

        @keyframes pc-slide {
          from { transform: translateX(-800px); }
          to   { transform: translateX(0px);    }
        }
        @keyframes pc-slide-r {
          from { transform: translateX(0px);     }
          to   { transform: translateX(-800px);  }
        }
        @keyframes pc-wash {
          0%   { opacity: 0.85; transform: scale(1);    }
          50%  { opacity: 1;    transform: scale(1.04); }
          100% { opacity: 0.9;  transform: scale(1.02); }
        }
        @keyframes pc-particle {
          0%   { left: 105%; opacity: 0; }
          8%   { opacity: 1;              }
          92%  { opacity: 1;              }
          100% { left: -5%;  opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pc-wash, .pc-flow, .pc-particle { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
