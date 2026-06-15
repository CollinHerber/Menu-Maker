import type { BadgeColorKey, BodyFontChoice, BorderStyle, CornerStyle, DescriptionIndent, DesignSettings, DividerStyle, FontWeightChoice, HeaderFlair, HeadingFontChoice, ImageFit, ItemBadge, ItemImageSettings, ItemImageShape, ItemLayoutChoice, ItemSize, LogoPlacement, MenuDraft, MenuItem, MenuSection, MenuVariant, ModifierGroup, PaperTexture, PriceCurrencyStyle, PriceDecimalStyle, PrintSettings, SectionBackgroundStyle, SectionColumnSpan, SectionHeadingAlignChoice, SectionImageLayout, SectionItemLayoutChoice, StylePresetId, TextAlignChoice, TextTransformChoice, WatermarkStyle } from './types';
import { badgeColorStyles, builtInBadges, defaultDesignSettings, defaultPrintSettings, draftFileSchemaVersion, stylePresets } from './constants';
import { applyVariantToDraft, createId, createItemImageSettings, createVariantFromMenu, defaultSectionColumnSpan, syncActiveVariantIntoDraft } from './factories';
import { starterMenu } from './templates';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

export const normalizeLogoPlacement = (placement: unknown): LogoPlacement => {
    if (placement === 'before-eyebrow') return 'above-eyebrow';
    if (placement === 'after-eyebrow') return 'below-eyebrow';
    if (
      placement === 'above-eyebrow' ||
      placement === 'below-eyebrow' ||
      placement === 'left-eyebrow' ||
      placement === 'right-eyebrow'
    ) {
      return placement;
    }

    return 'above-eyebrow';
  };

export const normalizeImageFit = (value: unknown): ImageFit => (value === 'cover' ? 'cover' : 'contain');

export const normalizeSectionImageLayout = (value: unknown): SectionImageLayout => {
    if (value === 'thumbnail' || value === 'banner') return value;
    return 'none';
  };

export const normalizeFontWeight = (value: unknown, fallback: FontWeightChoice): FontWeightChoice =>
    value === 'regular' || value === 'medium' || value === 'semibold' || value === 'bold' ? value : fallback;

export const normalizeTextTransform = (value: unknown, fallback: TextTransformChoice): TextTransformChoice =>
    value === 'preset' || value === 'none' || value === 'uppercase' || value === 'capitalize' ? value : fallback;

export const normalizeTextAlign = (value: unknown, fallback: TextAlignChoice): TextAlignChoice =>
    value === 'left' || value === 'center' || value === 'right' ? value : fallback;

export const normalizeItemLayout = (value: unknown, fallback: ItemLayoutChoice): ItemLayoutChoice =>
    value === 'stacked' ||
    value === 'inline' ||
    value === 'right-price' ||
    value === 'leader' ||
    value === 'centered'
      ? value
      : fallback;

export const normalizeSectionItemLayout = (value: unknown): SectionItemLayoutChoice => {
    if (value === 'preset') return 'preset';
    if (
      value === 'stacked' ||
      value === 'inline' ||
      value === 'right-price' ||
      value === 'leader' ||
      value === 'centered'
    ) {
      return value;
    }

    return 'preset';
  };

export const normalizePriceCurrencyStyle = (value: unknown): PriceCurrencyStyle => (value === 'plain' ? 'plain' : 'symbol');

export const normalizePriceDecimalStyle = (value: unknown): PriceDecimalStyle => {
    if (value === 'auto' || value === 'trim') return value;
    return 'always';
  };

export const normalizeDescriptionIndent = (value: unknown): DescriptionIndent => {
    if (value === 'slight' || value === 'deep') return value;
    return 'none';
  };

export const normalizeSectionHeadingAlign = (value: unknown): SectionHeadingAlignChoice => {
    if (value === 'left' || value === 'center' || value === 'right') return value;
    return 'preset';
  };

export const normalizeSectionBackgroundStyle = (value: unknown): SectionBackgroundStyle => {
    if (value === 'tint' || value === 'box') return value;
    return 'none';
  };

export const normalizeStylePresetId = (presetId: unknown): StylePresetId => {
    if (stylePresets.some((preset) => preset.id === presetId)) return presetId as StylePresetId;
    return 'simple';
  };

export const normalizePrintSettings = (value: unknown): PrintSettings => {
    const defaults = defaultPrintSettings();
    if (!isRecord(value)) return defaults;

    return {
      pageSize: value.pageSize === 'a4' || value.pageSize === 'letter' ? value.pageSize : defaults.pageSize,
      orientation:
        value.orientation === 'landscape' || value.orientation === 'portrait'
          ? value.orientation
          : defaults.orientation,
      margin:
        value.margin === 'compact' || value.margin === 'standard' || value.margin === 'wide'
          ? value.margin
          : defaults.margin,
      columns: value.columns === 1 || value.columns === 2 ? value.columns : defaults.columns,
      density: value.density === 'compact' || value.density === 'comfortable' ? value.density : defaults.density,
    };
  };

export const normalizeNumericSetting = (value: unknown, fallback: number, min: number, max: number) => {
    const numericValue = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numericValue)) return fallback;

    return Math.min(max, Math.max(min, numericValue));
  };

export const normalizeColorSetting = (value: unknown) =>
    typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : '';

export const normalizeHeadingFont = (value: unknown): HeadingFontChoice =>
    value === 'serif' || value === 'sans' || value === 'display' ? value : 'preset';

export const normalizeBodyFont = (value: unknown): BodyFontChoice =>
    value === 'sans' || value === 'serif' ? value : 'preset';

export const normalizeDividerStyle = (value: unknown): DividerStyle =>
    value === 'line' || value === 'bold' || value === 'double' || value === 'none' ? value : 'preset';

export const normalizeBorderStyle = (value: unknown): BorderStyle =>
    value === 'line' || value === 'double' || value === 'dotted' || value === 'ornate' ? value : 'none';

export const normalizeCornerStyle = (value: unknown): CornerStyle =>
    value === 'line' || value === 'flourish' ? value : 'none';

export const normalizeHeaderFlair = (value: unknown): HeaderFlair =>
    value === 'rule' || value === 'ornament' ? value : 'none';

export const normalizeWatermarkStyle = (value: unknown): WatermarkStyle => (value === 'botanical' ? value : 'none');

export const normalizePaperTexture = (value: unknown): PaperTexture =>
    value === 'warm' || value === 'parchment' || value === 'sage' ? value : 'none';

export const normalizeDesignSettings = (value: unknown): DesignSettings => {
    const defaults = defaultDesignSettings();
    if (!isRecord(value)) return defaults;

    return {
      accentColor: normalizeColorSetting(value.accentColor),
      backgroundColor: normalizeColorSetting(value.backgroundColor),
      textColor: normalizeColorSetting(value.textColor),
      mutedColor: normalizeColorSetting(value.mutedColor),
      ruleColor: normalizeColorSetting(value.ruleColor),
      headingFont: normalizeHeadingFont(value.headingFont),
      bodyFont: normalizeBodyFont(value.bodyFont),
      dividerStyle: normalizeDividerStyle(value.dividerStyle),
      borderStyle: normalizeBorderStyle(value.borderStyle),
      cornerStyle: normalizeCornerStyle(value.cornerStyle),
      headerFlair: normalizeHeaderFlair(value.headerFlair),
      watermarkStyle: normalizeWatermarkStyle(value.watermarkStyle),
      paperTexture: normalizePaperTexture(value.paperTexture),
      titleScale: normalizeNumericSetting(value.titleScale, defaults.titleScale, 80, 145),
      sectionHeadingScale: normalizeNumericSetting(
        value.sectionHeadingScale,
        defaults.sectionHeadingScale,
        80,
        140,
      ),
      itemTextScale: normalizeNumericSetting(value.itemTextScale, defaults.itemTextScale, 85, 130),
      descriptionTextScale: normalizeNumericSetting(
        value.descriptionTextScale,
        defaults.descriptionTextScale,
        80,
        125,
      ),
      lineHeightScale: normalizeNumericSetting(value.lineHeightScale, defaults.lineHeightScale, 85, 130),
      headerSpacingScale: normalizeNumericSetting(
        value.headerSpacingScale,
        defaults.headerSpacingScale,
        70,
        160,
      ),
      sectionSpacingScale: normalizeNumericSetting(
        value.sectionSpacingScale,
        defaults.sectionSpacingScale,
        65,
        170,
      ),
      itemSpacingScale: normalizeNumericSetting(value.itemSpacingScale, defaults.itemSpacingScale, 60, 170),
      dividerWeightScale: normalizeNumericSetting(
        value.dividerWeightScale,
        defaults.dividerWeightScale,
        0,
        250,
      ),
      decorationScale: normalizeNumericSetting(value.decorationScale, defaults.decorationScale, 60, 150),
      headerAlign: normalizeTextAlign(value.headerAlign, defaults.headerAlign),
      sectionHeadingAlign: normalizeTextAlign(value.sectionHeadingAlign, defaults.sectionHeadingAlign),
      titleWeight: normalizeFontWeight(value.titleWeight, defaults.titleWeight),
      subtitleWeight: normalizeFontWeight(value.subtitleWeight, defaults.subtitleWeight),
      sectionHeadingWeight: normalizeFontWeight(value.sectionHeadingWeight, defaults.sectionHeadingWeight),
      itemNameWeight: normalizeFontWeight(value.itemNameWeight, defaults.itemNameWeight),
      descriptionWeight: normalizeFontWeight(value.descriptionWeight, defaults.descriptionWeight),
      priceWeight: normalizeFontWeight(value.priceWeight, defaults.priceWeight),
      footerWeight: normalizeFontWeight(value.footerWeight, defaults.footerWeight),
      sectionHeadingTransform: normalizeTextTransform(
        value.sectionHeadingTransform,
        defaults.sectionHeadingTransform,
      ),
      itemNameTransform: normalizeTextTransform(value.itemNameTransform, defaults.itemNameTransform),
      titleLetterSpacingScale: normalizeNumericSetting(
        value.titleLetterSpacingScale,
        defaults.titleLetterSpacingScale,
        0,
        200,
      ),
      sectionLetterSpacingScale: normalizeNumericSetting(
        value.sectionLetterSpacingScale,
        defaults.sectionLetterSpacingScale,
        0,
        200,
      ),
      itemLayout: normalizeItemLayout(value.itemLayout, defaults.itemLayout),
      priceCurrencyStyle: normalizePriceCurrencyStyle(value.priceCurrencyStyle),
      priceDecimalStyle: normalizePriceDecimalStyle(value.priceDecimalStyle),
      descriptionIndent: normalizeDescriptionIndent(value.descriptionIndent),
      sizeDisplay: value.sizeDisplay === 'inline' ? 'inline' : 'stacked',
      modifierDisplay: value.modifierDisplay === 'inline' ? 'inline' : 'list',
    };
  };

export const normalizeSectionColumnSpan = (span: unknown, sectionName: string): SectionColumnSpan => {
    if (span === 1 || span === 2) return span;
    return defaultSectionColumnSpan(sectionName);
  };

export const normalizeTextField = (value: unknown) => (typeof value === 'string' ? value : '');

export const optionalDetailFields = [
    'address',
    'phone',
    'website',
    'hours',
    'socialHandle',
    'footerNote',
    'disclaimer',
    'qrCodeUrl',
    'qrCodeLabel',
  ] as const satisfies readonly (keyof MenuDraft)[];

export const normalizeItemImageShape = (value: unknown): ItemImageShape =>
    value === 'rounded' || value === 'circle' || value === 'wide' ? value : 'square';

export const normalizeItemImageSettings = (value: unknown): ItemImageSettings => {
    const defaults = createItemImageSettings();
    if (!isRecord(value)) return defaults;

    return {
      fit: value.fit === 'contain' ? 'contain' : 'cover',
      scale: normalizeNumericSetting(value.scale, defaults.scale, 100, 250),
      focalX: normalizeNumericSetting(value.focalX, defaults.focalX, -50, 50),
      focalY: normalizeNumericSetting(value.focalY, defaults.focalY, -50, 50),
      shape: normalizeItemImageShape(value.shape),
    };
  };

export const normalizeItemSizes = (value: unknown): ItemSize[] => {
    if (!Array.isArray(value)) return [];

    return value
      .filter(isRecord)
      .map((entry) => ({
        id: normalizeTextField(entry.id) || createId(),
        label: normalizeTextField(entry.label),
        price: normalizeTextField(entry.price),
      }))
      .filter((size) => size.label.trim().length > 0 || size.price.trim().length > 0);
  };

export const normalizeModifierGroups = (value: unknown): ModifierGroup[] => {
    if (!Array.isArray(value)) return [];

    return value
      .filter(isRecord)
      .map((group) => ({
        id: normalizeTextField(group.id) || createId(),
        name: normalizeTextField(group.name),
        options: Array.isArray(group.options)
          ? group.options
              .filter(isRecord)
              .map((option) => ({
                id: normalizeTextField(option.id) || createId(),
                label: normalizeTextField(option.label),
                price: normalizeTextField(option.price),
              }))
              .filter((option) => option.label.trim().length > 0 || option.price.trim().length > 0)
          : [],
      }))
      .filter((group) => group.name.trim().length > 0 || group.options.length > 0);
  };

export const normalizeBadgeColor = (value: unknown): BadgeColorKey =>
    typeof value === 'string' && value in badgeColorStyles ? (value as BadgeColorKey) : 'slate';

export const normalizeBadgeIds = (value: unknown): string[] =>
    Array.isArray(value)
      ? Array.from(new Set(value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)))
      : [];

export const normalizeCustomBadges = (value: unknown): ItemBadge[] => {
    if (!Array.isArray(value)) return [];

    const badges: ItemBadge[] = [];
    const seenIds = new Set(builtInBadges.map((badge) => badge.id));

    value.forEach((entry) => {
      if (!isRecord(entry)) return;

      const label = normalizeTextField(entry.label).trim();
      if (!label) return;

      let id = normalizeTextField(entry.id) || createId();
      while (seenIds.has(id)) id = createId();
      seenIds.add(id);

      badges.push({
        id,
        label,
        shortCode: normalizeTextField(entry.shortCode).trim().slice(0, 6) || label.slice(0, 2).toUpperCase(),
        color: normalizeBadgeColor(entry.color),
      });
    });

    return badges;
  };

export const normalizeImportedItem = (value: unknown, itemIndex: number, sectionIndex: number): MenuItem => {
    if (!isRecord(value)) {
      throw new Error(`Item ${itemIndex + 1} in section ${sectionIndex + 1} is invalid.`);
    }

    return {
      id: normalizeTextField(value.id) || createId(),
      name: normalizeTextField(value.name),
      description: normalizeTextField(value.description),
      price: normalizeTextField(value.price),
      imageDataUrl: normalizeTextField(value.imageDataUrl),
      imageName: normalizeTextField(value.imageName),
      imageAlt: normalizeTextField(value.imageAlt),
      badgeIds: normalizeBadgeIds(value.badgeIds),
      imageUseSectionDefaults: value.imageUseSectionDefaults !== false,
      image: normalizeItemImageSettings(value.image),
      sizes: normalizeItemSizes(value.sizes),
      modifierGroups: normalizeModifierGroups(value.modifierGroups),
    };
  };

export const normalizeImportedSection = (value: unknown, sectionIndex: number): MenuSection => {
    if (!isRecord(value)) {
      throw new Error(`Section ${sectionIndex + 1} is invalid.`);
    }

    if (!Array.isArray(value.items)) {
      throw new Error(`Section ${sectionIndex + 1} is missing an items list.`);
    }

    const name = normalizeTextField(value.name) || `Section ${sectionIndex + 1}`;

    return {
      id: normalizeTextField(value.id) || createId(),
      name,
      columnSpan: normalizeSectionColumnSpan(value.columnSpan, name),
      imageLayout: normalizeSectionImageLayout(value.imageLayout),
      note: normalizeTextField(value.note),
      headingAlign: normalizeSectionHeadingAlign(value.headingAlign),
      dividerStyle: normalizeDividerStyle(value.dividerStyle),
      backgroundStyle: normalizeSectionBackgroundStyle(value.backgroundStyle),
      itemLayout: normalizeSectionItemLayout(value.itemLayout),
      imageDefaults: normalizeItemImageSettings(value.imageDefaults),
      items: value.items.map((item, itemIndex) => normalizeImportedItem(item, itemIndex, sectionIndex)),
    };
  };

export const normalizeImportedVariant = (value: unknown, variantIndex: number): MenuVariant => {
    if (!isRecord(value)) {
      throw new Error(`Menu variant ${variantIndex + 1} is invalid.`);
    }

    if (!Array.isArray(value.sections) || value.sections.length === 0) {
      throw new Error(`Menu variant ${variantIndex + 1} must include at least one section.`);
    }

    return {
      id: normalizeTextField(value.id) || createId(),
      name: normalizeTextField(value.name) || `Menu ${variantIndex + 1}`,
      subtitle: normalizeTextField(value.subtitle),
      eyebrow: normalizeTextField(value.eyebrow),
      footerNote: normalizeTextField(value.footerNote),
      disclaimer: normalizeTextField(value.disclaimer),
      qrCodeUrl: normalizeTextField(value.qrCodeUrl),
      qrCodeLabel: normalizeTextField(value.qrCodeLabel),
      sections: value.sections.map(normalizeImportedSection),
    };
  };

export const normalizeImportedDraft = (value: unknown): MenuDraft => {
    if (!isRecord(value)) {
      throw new Error('Draft data is missing or invalid.');
    }

    const topLevelSections = Array.isArray(value.sections) && value.sections.length > 0 ? value.sections : null;
    const hasTopLevelSections = topLevelSections !== null;
    const variantValues = Array.isArray(value.variants) ? value.variants : [];
    const normalizedVariants = variantValues.map(normalizeImportedVariant);
    const fallbackSections = topLevelSections ?? normalizedVariants[0]?.sections;

    if (!Array.isArray(fallbackSections) || fallbackSections.length === 0) {
      throw new Error('Draft must include at least one section.');
    }

    const importedMenu: MenuDraft = {
      ...starterMenu(),
      name: normalizeTextField(value.name),
      subtitle: normalizeTextField(value.subtitle),
      eyebrow: normalizeTextField(value.eyebrow),
      logoDataUrl: normalizeTextField(value.logoDataUrl),
      logoName: normalizeTextField(value.logoName),
      logoAlt: normalizeTextField(value.logoAlt),
      logoFit: normalizeImageFit(value.logoFit),
      logoScale: normalizeNumericSetting(value.logoScale, 100, 40, 200),
      logoOffsetX: normalizeNumericSetting(value.logoOffsetX, 0, -50, 50),
      logoOffsetY: normalizeNumericSetting(value.logoOffsetY, 0, -50, 50),
      logoPlacement: normalizeLogoPlacement(value.logoPlacement),
      customBadges: normalizeCustomBadges(value.customBadges),
      showBadgeLegend: value.showBadgeLegend === true,
      activeVariantId: normalizeTextField(value.activeVariantId),
      variants: normalizedVariants,
      stylePresetId: normalizeStylePresetId(value.stylePresetId),
      printSettings: normalizePrintSettings(value.printSettings),
      designSettings: normalizeDesignSettings(value.designSettings),
      sections: topLevelSections ? topLevelSections.map(normalizeImportedSection) : normalizedVariants[0].sections,
    };

    optionalDetailFields.forEach((field) => {
      importedMenu[field] = normalizeTextField(value[field]);
    });

    if (importedMenu.variants.length === 0) {
      importedMenu.activeVariantId = importedMenu.activeVariantId || createId();
      importedMenu.variants = [createVariantFromMenu(importedMenu, importedMenu.activeVariantId)];
    } else if (!importedMenu.variants.some((variant) => variant.id === importedMenu.activeVariantId)) {
      importedMenu.activeVariantId = importedMenu.variants[0].id;
      applyVariantToDraft(importedMenu, importedMenu.variants[0]);
    }

    if (!hasTopLevelSections) {
      const activeVariant = importedMenu.variants.find((variant) => variant.id === importedMenu.activeVariantId);
      return activeVariant ? applyVariantToDraft(importedMenu, activeVariant) : importedMenu;
    }

    return syncActiveVariantIntoDraft(importedMenu);
  };

export const parseDraftFile = (value: unknown): MenuDraft => {
    if (!isRecord(value)) {
      throw new Error('Choose a valid MenuMaker draft JSON file.');
    }

    if (value.app !== 'MenuMaker' || value.schemaVersion !== draftFileSchemaVersion) {
      throw new Error('This draft file is missing a supported MenuMaker schema version.');
    }

    return normalizeImportedDraft(value.draft);
  };
