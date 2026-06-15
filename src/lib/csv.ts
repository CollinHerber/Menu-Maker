import type { CsvPreviewRow, CsvPreviewSectionSummary, MenuSection } from './types';
import { createItem, createSection, defaultSectionColumnSpan } from './factories';

export const parseCsvRows = (text: string) => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      const nextCharacter = text[index + 1];

      if (character === '"') {
        if (inQuotes && nextCharacter === '"') {
          currentCell += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (character === ',' && !inQuotes) {
        currentRow.push(currentCell);
        currentCell = '';
        continue;
      }

      if ((character === '\n' || character === '\r') && !inQuotes) {
        if (character === '\r' && nextCharacter === '\n') index += 1;
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
        continue;
      }

      currentCell += character;
    }

    if (inQuotes) {
      throw new Error('CSV has an unclosed quoted field.');
    }

    currentRow.push(currentCell);
    rows.push(currentRow);

    return rows.filter((row) => row.some((cell) => cell.trim().length > 0));
  };

export const parseCsvImport = (text: string): CsvPreviewRow[] => {
    const rows = parseCsvRows(text);
    if (rows.length < 2) {
      throw new Error('CSV must include a header row and at least one menu item row.');
    }

    const headers = rows[0].map((header) => header.trim().toLowerCase());
    const sectionIndex = headers.indexOf('section');
    const nameIndex = headers.indexOf('name');
    const descriptionIndex = headers.indexOf('description');
    const priceIndex = headers.indexOf('price');

    if (sectionIndex < 0) {
      throw new Error('CSV header must include a section column.');
    }

    if (nameIndex < 0) {
      throw new Error('CSV header must include a name column.');
    }

    return rows.slice(1).map((row, index) => {
      const rowNumber = index + 2;
      const section = (row[sectionIndex] ?? '').trim();
      const name = (row[nameIndex] ?? '').trim();

      if (!section) {
        throw new Error(`Row ${rowNumber} is missing a section.`);
      }

      if (!name) {
        throw new Error(`Row ${rowNumber} is missing an item name.`);
      }

      return {
        rowNumber,
        section,
        name,
        description: descriptionIndex >= 0 ? (row[descriptionIndex] ?? '').trim() : '',
        price: priceIndex >= 0 ? (row[priceIndex] ?? '').trim() : '',
      };
    });
  };

export const sectionsFromCsvRows = (rows: CsvPreviewRow[]): MenuSection[] => {
    const sections = new Map<string, MenuSection>();

    rows.forEach((row) => {
      const existingSection = sections.get(row.section);
      const section =
        existingSection ??
        createSection(row.section, defaultSectionColumnSpan(row.section));

      section.items.push(
        createItem({
          name: row.name,
          description: row.description,
          price: row.price,
        }),
      );
      sections.set(row.section, section);
    });

    return Array.from(sections.values());
  };

export const summarizeCsvRows = (rows: CsvPreviewRow[]): CsvPreviewSectionSummary[] => {
    const sectionCounts = new Map<string, number>();

    rows.forEach((row) => {
      sectionCounts.set(row.section, (sectionCounts.get(row.section) ?? 0) + 1);
    });

    return Array.from(sectionCounts, ([section, itemCount]) => ({ section, itemCount }));
  };
