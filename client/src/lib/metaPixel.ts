export const META_PIXEL_ID = "3944305545877463";

type FbqCommand = "track" | "trackCustom";

type FbqFunction = (
  command: FbqCommand,
  eventName: string,
  parameters?: Record<string, string | number | boolean | undefined>,
) => void;

declare global {
  interface Window {
    fbq?: FbqFunction;
  }
}

function hasMetaPixel(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

export function trackMetaPageView(path?: string): void {
  if (!hasMetaPixel()) return;

  window.fbq?.("track", "PageView", {
    page_path: path ?? window.location.pathname,
  });
}

export function trackMetaLead(parameters: Record<string, string | number | boolean | undefined> = {}): void {
  if (!hasMetaPixel()) return;

  window.fbq?.("track", "Lead", parameters);
}

export function trackMetaCustomEvent(
  eventName: string,
  parameters: Record<string, string | number | boolean | undefined> = {},
): void {
  if (!hasMetaPixel()) return;

  window.fbq?.("trackCustom", eventName, parameters);
}
