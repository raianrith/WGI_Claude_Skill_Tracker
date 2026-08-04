import { avatarColor, initials } from "@/lib/avatar";

export function Avatar({
  name,
  url,
  size = "md",
}: {
  name: string;
  url?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-12 w-12 text-base" : "h-10 w-10 text-sm";

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        className={`${dim} object-cover`}
        style={{ borderRadius: 2 }}
      />
    );
  }

  return (
    <span
      className={`${dim} inline-flex items-center justify-center font-display tracking-wide text-white`}
      style={{ backgroundColor: avatarColor(name), borderRadius: 2 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
