import type { DraftHistoryEntry } from './types';
import { historyStorageKey, maxDraftHistoryEntries, storageKey } from './constants';
import { createId } from './factories';
import { starterMenu } from './templates';
import { isRecord, normalizeImportedDraft, normalizeTextField } from './normalizers';

export const hasSavedDraft = () => {
    if (typeof localStorage === 'undefined') return false;

    return localStorage.getItem(storageKey) !== null;
  };

export const formatHistoryTimestamp = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return 'just now';

    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };

export const summarizeDraftSnapshot = (snapshot: string) => {
    try {
      const draft = normalizeImportedDraft(JSON.parse(snapshot));

      return {
        itemCount: draft.sections.reduce((count, section) => count + section.items.length, 0),
        menuName: draft.name.trim() || 'Untitled menu',
        sectionCount: draft.sections.length,
      };
    } catch {
      return {
        itemCount: 0,
        menuName: 'Untitled menu',
        sectionCount: 0,
      };
    }
  };

export const createDraftHistoryEntry = (snapshot: string, label: string): DraftHistoryEntry => {
    const summary = summarizeDraftSnapshot(snapshot);

    return {
      id: createId(),
      label,
      savedAt: new Date().toISOString(),
      snapshot,
      ...summary,
    };
  };

export const normalizeDraftHistoryEntry = (value: unknown): DraftHistoryEntry | null => {
    if (!isRecord(value) || typeof value.snapshot !== 'string') return null;

    const summary = summarizeDraftSnapshot(value.snapshot);

    return {
      id: normalizeTextField(value.id) || createId(),
      label: normalizeTextField(value.label) || 'Autosave',
      savedAt: normalizeTextField(value.savedAt) || new Date().toISOString(),
      snapshot: value.snapshot,
      itemCount: typeof value.itemCount === 'number' ? value.itemCount : summary.itemCount,
      menuName: normalizeTextField(value.menuName) || summary.menuName,
      sectionCount: typeof value.sectionCount === 'number' ? value.sectionCount : summary.sectionCount,
    };
  };

export const loadDraftHistory = () => {
    if (typeof localStorage === 'undefined') return [];

    try {
      const saved = localStorage.getItem(historyStorageKey);
      if (!saved) return [];

      return (JSON.parse(saved) as unknown[])
        .map(normalizeDraftHistoryEntry)
        .filter((entry): entry is DraftHistoryEntry => entry !== null)
        .slice(0, maxDraftHistoryEntries);
    } catch {
      return [];
    }
  };

export const saveDraftHistoryEntries = (entries: DraftHistoryEntry[]) => {
    if (typeof localStorage === 'undefined') return;

    localStorage.setItem(historyStorageKey, JSON.stringify(entries.slice(0, maxDraftHistoryEntries)));
  };

export const ensureDraftHistoryEntry = (entries: DraftHistoryEntry[], snapshot: string, label: string) => {
    if (entries[0]?.snapshot === snapshot) return entries;

    return [
      createDraftHistoryEntry(snapshot, label),
      ...entries.filter((entry) => entry.snapshot !== snapshot),
    ].slice(0, maxDraftHistoryEntries);
  };

export const loadMenu = () => {
    if (typeof localStorage === 'undefined') return starterMenu();

    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return starterMenu();

      return normalizeImportedDraft(JSON.parse(saved));
    } catch {
      return starterMenu();
    }
  };
