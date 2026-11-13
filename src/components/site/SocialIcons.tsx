const icons = {
  Facebook: "M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z",
  X: "M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L1.9 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z",
  LinkedIn: "M6.9 8.8H3.5V20h3.4V8.8zM5.2 3.5a2 2 0 100 4 2 2 0 000-4zM20.5 13.6c0-3-.7-5.1-4.1-5.1-1.7 0-2.8.9-3.2 1.8V8.8H9.9V20h3.4v-5.5c0-1.5.3-2.9 2.1-2.9 1.8 0 1.8 1.7 1.8 3V20h3.4l-.1-6.4z",
  YouTube: "M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2 26 26 0 002 12a26 26 0 00.4 4.8 2.5 2.5 0 001.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8A26 26 0 0022 12a26 26 0 00-.4-4.8zM10 15V9l5.2 3L10 15z",
} as const;

const links: Record<keyof typeof icons, string> = {
  Facebook: "https://facebook.com",
  X: "https://x.com",
  LinkedIn: "https://linkedin.com",
  YouTube: "https://youtube.com",
};

export function SocialIcons() {
  return (
    <div className="flex items-center gap-3">
      {(Object.keys(icons) as (keyof typeof icons)[]).map((name) => (
        <a
          key={name}
          href={links[name]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-foreground/10 text-navy-foreground transition-all hover:-translate-y-0.5 hover:bg-primary"
        >
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-current" aria-hidden="true">
            <path d={icons[name]} />
          </svg>
        </a>
      ))}
    </div>
  );
}
