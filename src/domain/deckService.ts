import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../state/queryKeys";

const GITHUB_BASE_URL = "https://raw.githubusercontent.com/commanddeck/awesome-command-decks/main";

export interface DeckMeta {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  commandCount: number;
  tags: string[];
  file: string;
}

export interface DeckManifest {
  decks: DeckMeta[];
}

export interface DeckCommand {
  title: string;
  command: string;
  description: string | null;
  tags: string[];
  examples: string[];
  parameters: { name: string; description: string }[];
  notes: string | null;
  is_favorite: boolean;
}

export interface DeckPlatform {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
}

export interface DeckCategory {
  id: string;
  platform_id: string;
  name: string;
  sort_order: number;
}

export interface DeckData {
  platforms: DeckPlatform[];
  categories: DeckCategory[];
  commands: DeckCommand[];
}

export async function fetchManifest(): Promise<DeckManifest> {
  const response = await fetch(`${GITHUB_BASE_URL}/manifest.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch manifest: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchDeckData(filePath: string): Promise<DeckData> {
  const response = await fetch(`${GITHUB_BASE_URL}/${filePath}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch deck data: ${response.statusText}`);
  }
  return response.json();
}

export function useDeckManifest() {
  return useQuery({
    queryKey: queryKeys.deckManifest(),
    queryFn: fetchManifest,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Local cache for installed decks
const DECK_CACHE_KEY = "commanddeck_installed_decks";

export interface InstalledDeck {
  id: string;
  version: string;
  installedAt: string;
  importedCount: number;
}

export function getInstalledDecks(): InstalledDeck[] {
  try {
    const cached = localStorage.getItem(DECK_CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

export function saveInstalledDeck(deck: InstalledDeck): void {
  const installed = getInstalledDecks();
  const index = installed.findIndex((d) => d.id === deck.id);
  if (index >= 0) {
    installed[index] = deck;
  } else {
    installed.push(deck);
  }
  localStorage.setItem(DECK_CACHE_KEY, JSON.stringify(installed));
}

export function removeInstalledDeck(deckId: string): void {
  const installed = getInstalledDecks().filter((d) => d.id !== deckId);
  localStorage.setItem(DECK_CACHE_KEY, JSON.stringify(installed));
}

export function isDeckInstalled(deckId: string, version: string): boolean {
  const installed = getInstalledDecks();
  const deck = installed.find((d) => d.id === deckId);
  return deck !== undefined && deck.version === version;
}
