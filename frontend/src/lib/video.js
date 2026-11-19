const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|mov|m4v)$/i;

export function getVideoSource(value) {
  const rawValue = String(value || "").trim();
  if (/^data:video\/(?:mp4|webm|ogg)(?:;[^,]*)?,/i.test(rawValue)) {
    return { type: "file", src: rawValue };
  }

  try {
    const url = new URL(rawValue);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;

    const host = url.hostname.toLowerCase();
    if (host === "youtu.be" || host.endsWith(".youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? { type: "embed", src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` } : null;
    }

    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      const id = url.searchParams.get("v") || url.pathname.match(/\/(?:embed|shorts|live)\/([\w-]+)/)?.[1];
      return id ? { type: "embed", src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` } : null;
    }

    if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
      const id = url.pathname.match(/\/(?:video\/)?(\d+)/)?.[1];
      return id ? { type: "embed", src: `https://player.vimeo.com/video/${id}` } : null;
    }

    if (VIDEO_EXTENSIONS.test(url.pathname)) return { type: "file", src: url.href };
    return null;
  } catch {
    return null;
  }
}
