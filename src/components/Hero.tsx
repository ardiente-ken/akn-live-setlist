import "./Hero.css";

const BARS = [0, 3, 1, 4, 2, 5, 1, 3, 0, 4, 2, 5, 3, 1];

const SOCIALS = [
  {
    label: "Spotify",
    handle: "AKN",
    href: "https://open.spotify.com/artist/5UgDVlqSLFEguGSYx82l50",
    icon: "spotify",
  },
  {
    label: "TikTok",
    handle: "@_angeloken",
    href: "https://www.tiktok.com/@_angeloken",
    icon: "tiktok",
  },
  {
    label: "Instagram",
    handle: "@_angeloken",
    href: "https://www.instagram.com/_angeloken",
    icon: "instagram",
  },
  {
    label: "Instagram (music)",
    handle: "@aknmusika",
    href: "https://www.instagram.com/aknmusika",
    icon: "instagram",
  },
  {
    label: "Facebook",
    handle: "akn.",
    href: "https://www.facebook.com/profile.php?id=61574357214212",
    icon: "facebook",
  },
] as const;

function Icon({ name }: { name: (typeof SOCIALS)[number]["icon"] }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
    focusable: false,
  } as const;

  if (name === "spotify")
    return (
      <svg {...common} fill="currentColor">
        <path d="M12 1.8A10.2 10.2 0 1 0 12 22.2 10.2 10.2 0 0 0 12 1.8Zm4.67 14.72a.76.76 0 0 1-1.05.25c-2.87-1.75-6.48-2.15-10.74-1.18a.76.76 0 1 1-.34-1.48c4.66-1.06 8.65-.6 11.88 1.37.36.22.47.7.25 1.04Zm1.4-3.11a.95.95 0 0 1-1.31.31c-3.29-2.02-8.3-2.6-12.18-1.42a.95.95 0 1 1-.55-1.82c4.44-1.35 9.98-.7 13.73 1.6.44.27.58.86.31 1.33Zm.12-3.24C14.25 7.76 7.31 7.54 3.2 8.79a1.14 1.14 0 1 1-.66-2.18c4.72-1.43 12.57-1.14 17.2 1.6a1.14 1.14 0 0 1-1.55 1.96Z" />
      </svg>
    );

  if (name === "instagram")
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );

  if (name === "tiktok")
    return (
      <svg {...common} fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    );

  return (
    <svg {...common} fill="currentColor">
      <path d="M24 12.07C24 5.45 18.63.07 12 .07S0 5.45 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.39H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.23 2.69.23v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.39C19.61 23.03 24 18.06 24 12.07z" />
    </svg>
  );
}

export default function Hero() {
  const scrollToSetlist = () =>
    document
      .getElementById("setlist")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <header className="hero">
      <div className="wrap">
        <div className="stub">
          <p className="hero-where">Live tonight</p>

          <h1 className="hero-name">Hi, I'm Ken!!</h1>

          <div className="hero-bars" aria-hidden="true">
            {BARS.map((b, i) => (
              <span key={i} style={{ animationDelay: `${b * 90}ms` }} />
            ))}
          </div>

          <div className="hero-perf" aria-hidden="true" />
          <h3>
            I'm an independent artist making music as AKN! :) <br></br>
          </h3>
          <p className="hero-blurb">
            I'll be playing some songs tonight, so take a look around and see if
            there's anything you wanna hear 🎶
          </p>
          <p className="hero-social-label">Follow me on my social media:</p>
          <ul className="hero-socials" aria-label="Follow Ken / AKN">
            {SOCIALS.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.label}: ${s.handle}`}
                >
                  <Icon name={s.icon} />
                  <span>{s.handle}</span>
                </a>
              </li>
            ))}
          </ul>

          <p className="hero-thanks">Thank you for your support! ♡</p>

          <div className="hero-actions">
            <button
              className="hero-cta"
              type="button"
              onClick={scrollToSetlist}
            >
              Browse the Setlist ↓
            </button>

            <a
              className="hero-website"
              href="https://akn-artist-website.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              My Website ↗
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
