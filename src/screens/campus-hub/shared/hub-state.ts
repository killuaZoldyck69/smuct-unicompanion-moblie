import type { HubSection } from "./section-tab-bar";

let savedHubSection: HubSection = "FORUM";
const sectionListeners = new Set<(section: HubSection) => void>();

export function getCampusHubActiveSection(): HubSection {
  return savedHubSection;
}

export function setCampusHubActiveSection(section: HubSection) {
  savedHubSection = section;
  sectionListeners.forEach((fn) => {
    try {
      fn(section);
    } catch {
      // ignore
    }
  });
}

export function subscribeCampusHubSection(fn: (section: HubSection) => void): () => void {
  sectionListeners.add(fn);
  return () => {
    sectionListeners.delete(fn);
  };
}
