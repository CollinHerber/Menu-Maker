import type { ItemImageSettings, MenuDraft, MenuItem, MenuSection, MenuVariant, QuickAddItemDraft, SectionColumnSpan } from './types';

export const createId = () => crypto.randomUUID();

export const createItemImageSettings = (overrides: Partial<ItemImageSettings> = {}): ItemImageSettings => ({
    fit: 'cover',
    scale: 100,
    focalX: 0,
    focalY: 0,
    shape: 'square',
    ...overrides,
  });

export const createItem = (overrides: Partial<MenuItem> = {}): MenuItem => ({
    id: createId(),
    name: '',
    description: '',
    price: '',
    imageDataUrl: '',
    imageName: '',
    imageAlt: '',
    badgeIds: [],
    imageUseSectionDefaults: true,
    image: createItemImageSettings(),
    sizes: [],
    modifierGroups: [],
    ...overrides,
  });

export const defaultSectionColumnSpan = (name: string): SectionColumnSpan =>
    name === 'Burgers' || name === 'Sandwiches & Wraps' ? 1 : 2;

export const createSection = (name = 'New Section', columnSpan: SectionColumnSpan = 2): MenuSection => ({
    id: createId(),
    name,
    columnSpan,
    imageLayout: 'none',
    note: '',
    headingAlign: 'preset',
    dividerStyle: 'preset',
    backgroundStyle: 'none',
    itemLayout: 'preset',
    imageDefaults: createItemImageSettings(),
    items: [],
  });

export const copyName = (value: string, fallback: string) => `${value.trim() || fallback} copy`;

export const cloneMenuItem = (item: MenuItem, appendCopyLabel = false): MenuItem =>
    createItem({
      name: appendCopyLabel ? copyName(item.name, 'Untitled item') : item.name,
      description: item.description,
      price: item.price,
      imageDataUrl: item.imageDataUrl,
      imageName: item.imageName,
      imageAlt: item.imageAlt,
      badgeIds: [...item.badgeIds],
      imageUseSectionDefaults: item.imageUseSectionDefaults,
      image: { ...item.image },
      sizes: item.sizes.map((size) => ({ ...size, id: createId() })),
      modifierGroups: item.modifierGroups.map((group) => ({
        ...group,
        id: createId(),
        options: group.options.map((option) => ({ ...option, id: createId() })),
      })),
    });

export const cloneMenuSection = (section: MenuSection): MenuSection => ({
    id: createId(),
    name: copyName(section.name, 'Untitled section'),
    columnSpan: section.columnSpan,
    imageLayout: section.imageLayout,
    note: section.note,
    headingAlign: section.headingAlign,
    dividerStyle: section.dividerStyle,
    backgroundStyle: section.backgroundStyle,
    itemLayout: section.itemLayout,
    imageDefaults: { ...section.imageDefaults },
    items: section.items.map((item) => cloneMenuItem(item)),
  });

export const copyMenuItem = (item: MenuItem, preserveId = true): MenuItem => ({
    id: preserveId ? item.id || createId() : createId(),
    name: item.name,
    description: item.description,
    price: item.price,
    imageDataUrl: item.imageDataUrl,
    imageName: item.imageName,
    imageAlt: item.imageAlt,
    badgeIds: [...(item.badgeIds ?? [])],
    imageUseSectionDefaults: item.imageUseSectionDefaults ?? true,
    image: { ...(item.image ?? createItemImageSettings()) },
    sizes: (item.sizes ?? []).map((size) => ({ ...size })),
    modifierGroups: (item.modifierGroups ?? []).map((group) => ({
      ...group,
      options: group.options.map((option) => ({ ...option })),
    })),
  });

export const copyMenuSection = (section: MenuSection, preserveId = true): MenuSection => ({
    id: preserveId ? section.id || createId() : createId(),
    name: section.name,
    columnSpan: section.columnSpan,
    imageLayout: section.imageLayout,
    note: section.note,
    headingAlign: section.headingAlign,
    dividerStyle: section.dividerStyle,
    backgroundStyle: section.backgroundStyle,
    itemLayout: section.itemLayout,
    imageDefaults: { ...(section.imageDefaults ?? createItemImageSettings()) },
    items: section.items.map((item) => copyMenuItem(item, preserveId)),
  });

export const createVariantFromMenu = (draft: MenuDraft, id = draft.activeVariantId || createId()): MenuVariant => ({
    id,
    name: draft.name,
    subtitle: draft.subtitle,
    eyebrow: draft.eyebrow,
    footerNote: draft.footerNote,
    disclaimer: draft.disclaimer,
    qrCodeUrl: draft.qrCodeUrl,
    qrCodeLabel: draft.qrCodeLabel,
    sections: draft.sections.map((section) => copyMenuSection(section)),
  });

export const applyVariantToDraft = (draft: MenuDraft, variant: MenuVariant) => {
    draft.activeVariantId = variant.id;
    draft.name = variant.name;
    draft.subtitle = variant.subtitle;
    draft.eyebrow = variant.eyebrow;
    draft.footerNote = variant.footerNote;
    draft.disclaimer = variant.disclaimer;
    draft.qrCodeUrl = variant.qrCodeUrl;
    draft.qrCodeLabel = variant.qrCodeLabel;
    draft.sections = variant.sections.map((section) => copyMenuSection(section));

    return draft;
  };

export const syncActiveVariantIntoDraft = (draft: MenuDraft) => {
    const activeVariantId = draft.activeVariantId || draft.variants[0]?.id || createId();
    const activeVariant = createVariantFromMenu(draft, activeVariantId);
    const variants = draft.variants.length > 0 ? draft.variants.map((variant) => ({ ...variant })) : [activeVariant];
    const activeVariantIndex = variants.findIndex((variant) => variant.id === activeVariantId);

    if (activeVariantIndex >= 0) {
      variants[activeVariantIndex] = activeVariant;
    } else {
      variants.unshift(activeVariant);
    }

    draft.activeVariantId = activeVariantId;
    draft.variants = variants;

    return draft;
  };

export function parseQuickAddItemLine(line: string): QuickAddItemDraft | null {
    const parts = line
      .split('|')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    if (parts.length === 0) return null;

    const [name, ...details] = parts;

    if (details.length === 0) {
      return { name, description: '', price: '' };
    }

    if (details.length === 1) {
      return { name, description: details[0], price: '' };
    }

    return {
      name,
      description: details.slice(0, -1).join(' | '),
      price: details.at(-1) ?? '',
    };
  }
