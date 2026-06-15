<script lang="ts">
  import QRCode from 'qrcode';
  import html2canvas from 'html2canvas';
  import { Button, Modal } from 'flowbite-svelte';
  import {
    ArrowDown,
    ArrowUp,
    Clock,
    Copy,
    Download,
    DollarSign,
    Eye,
    FileSpreadsheet,
    FileText,
    Globe,
    GripVertical,
    Image,
    LayoutTemplate,
    MapPin,
    Palette,
    Pencil,
    Phone,
    Plus,
    Printer,
    QrCode,
    RotateCcw,
    Sparkles,
    StickyNote,
    Tag,
    Trash2,
    Redo2,
    Undo2,
    Upload,
    Utensils,
    X,
  } from '@lucide/svelte';

import type { CsvImportMode, CsvPreviewRow, DesignColorSettingKey, DesignSettingKey, DraftHistoryEntry, EditorPanelId, ExportImageFormat, ItemBadge, ItemImageSettings, ItemLayoutChoice, MenuDraft, MenuDraftFile, MenuItem, MenuSection, MenuTemplate, MenuVariant, ModifierGroup, PdfPageImage, PreviewPage, PreviewSectionChunk, QuickAddItemDraft, SectionColumnSpan, SectionDropPosition, SectionImageLayout, StylePresetId, TextAlignChoice, WizardStep } from './lib/types';
import { badgeColorOptions, badgeColorStyles, bodyFontOptions, bodyFontStacks, borderStyleOptions, builtInBadges, cornerStyleOptions, defaultDesignSettings, descriptionIndentOptions, designColorControls, designControlGroups, dividerStyleOptions, draftFileSchemaVersion, editorPanels, fontWeightOptions, fontWeightValues, headerFlairOptions, headingFontOptions, headingFontStacks, itemImageShapeOptions, itemLayoutOptions, logoFitOptions, maxDraftHistoryEntries, maxUndoSnapshots, modifierDisplayOptions, paperTextureOptions, previewPaddingPixels, previewPixelsPerInch, priceCurrencyOptions, priceDecimalOptions, printColumnOptions, printDensities, printDensityOptions, printMarginOptions, printMargins, printOrientationOptions, printPageSizeOptions, printPageSizes, sectionBackgroundOptions, sectionHeadingAlignOptions, sectionImageLayoutOptions, sectionItemLayoutOptions, sizeDisplayOptions, storageKey, stylePresets, textAlignJustifyValues, textAlignOptions, textTransformControls, textTransformOptions, typographyWeightControls, watermarkStyleOptions, wizardSteps } from './lib/constants';
import { applyVariantToDraft, cloneMenuItem, cloneMenuSection, copyMenuSection, copyName, createId, createItem, createSection, createVariantFromMenu, parseQuickAddItemLine, syncActiveVariantIntoDraft } from './lib/factories';
import { createDraftFromTemplate, menuTemplates, starterMenu, templateItemCount, templateSectionSummary } from './lib/templates';
import { normalizeImportedDraft, parseDraftFile } from './lib/normalizers';
import { parseCsvImport, sectionsFromCsvRows, summarizeCsvRows } from './lib/csv';
import { imageUploadStatusMessage, prepareImageUpload, sanitizeFileName } from './lib/images';
import { ensureDraftHistoryEntry, formatHistoryTimestamp, hasSavedDraft, loadDraftHistory, loadMenu, saveDraftHistoryEntries } from './lib/persistence';

  const initialSavedDraftExists = hasSavedDraft();
  const initialMenu = loadMenu();
  const initialMenuSnapshot = JSON.stringify(initialMenu);
  const initialDraftHistory = ensureDraftHistoryEntry(
    loadDraftHistory(),
    initialMenuSnapshot,
    initialSavedDraftExists ? 'Recovered draft' : 'Started draft',
  );
  saveDraftHistoryEntries(initialDraftHistory);

  let menu = $state<MenuDraft>(initialMenu);
  let mobileView = $state<'editor' | 'preview'>('editor');
  let selectedSectionId = $state(initialMenu.sections[0]?.id ?? '');
  let activeEditorPanel = $state<EditorPanelId>('menu');
  let newSectionName = $state('');
  let sectionModalOpen = $state(false);
  let templateModalOpen = $state(false);
  let csvImportModalOpen = $state(false);
  let historyModalOpen = $state(false);
  let wizardModalOpen = $state(!initialSavedDraftExists);
  let wizardStep = $state<WizardStep>('basics');
  let showRecoveryNotice = $state(initialSavedDraftExists);
  let pendingTemplateId = $state('');
  let wizardName = $state(initialMenu.name);
  let wizardSubtitle = $state(initialMenu.subtitle);
  let wizardTemplateId = $state(menuTemplates[0]?.id ?? '');
  let wizardStylePresetId = $state<StylePresetId>(initialMenu.stylePresetId);
  let wizardLogoDataUrl = $state(initialMenu.logoDataUrl);
  let wizardLogoName = $state(initialMenu.logoName);
  let previewElement = $state<HTMLDivElement | null>(null);
  let qrCodeDataUrl = $state('');
  let qrCodeError = $state('');
  let draftFileStatus = $state('');
  let draftFileError = $state('');
  let autosaveStatus = $state(initialSavedDraftExists ? 'Recovered autosaved draft' : 'Autosaved locally');
  let undoSnapshots = $state<string[]>([]);
  let redoSnapshots = $state<string[]>([]);
  let draftHistory = $state<DraftHistoryEntry[]>(initialDraftHistory);
  let csvFileName = $state('');
  let csvImportError = $state('');
  let csvImportMode = $state<CsvImportMode>('append');
  let csvPreviewRows = $state<CsvPreviewRow[]>([]);
  let isExporting = $state(false);
  let draggedSectionId = $state('');
  let sectionDropTargetId = $state('');
  let sectionDropPosition = $state<SectionDropPosition>('after');
  let sectionDragPointerId = $state<number | null>(null);
  let sectionDragMouseActive = $state(false);
  let sectionDragHandleElement: HTMLElement | null = null;
  let selectedItemIds = $state<string[]>([]);
  let quickAddItemsText = $state('');
  let draggedItemId = $state('');
  let itemDropTargetId = $state('');
  let itemDropPosition = $state<SectionDropPosition>('after');
  let itemDragPointerId = $state<number | null>(null);
  let itemDragMouseActive = $state(false);
  let itemDragHandleElement: HTMLElement | null = null;
  let lastMenuSnapshot = initialMenuSnapshot;
  let applyingHistorySnapshot = false;

  const createSerializableMenuDraft = (draft: MenuDraft = menu) =>
    syncActiveVariantIntoDraft($state.snapshot(draft) as MenuDraft);

  const createMenuSnapshot = (draft: MenuDraft = menu) => JSON.stringify(createSerializableMenuDraft(draft));

  let selectedSection = $derived(
    menu.sections.find((section) => section.id === selectedSectionId) ?? menu.sections[0],
  );
  let selectedWizardTemplate = $derived(
    menuTemplates.find((template) => template.id === wizardTemplateId) ?? menuTemplates[0],
  );
  let wizardCanContinueBasics = $derived(wizardName.trim().length > 0 && Boolean(selectedWizardTemplate));
  let selectedItemIdsInSelectedSection = $derived(
    selectedSection
      ? selectedItemIds.filter((itemId) => selectedSection.items.some((item) => item.id === itemId))
      : [],
  );
  let quickAddItemDrafts = $derived(
    quickAddItemsText
      .split(/\r?\n/)
      .map((line) => parseQuickAddItemLine(line))
      .filter((item): item is QuickAddItemDraft => item !== null),
  );
  let canUndo = $derived(undoSnapshots.length > 0);
  let canRedo = $derived(redoSnapshots.length > 0);

  let itemCount = $derived(menu.sections.reduce((count, section) => count + section.items.length, 0));
  let hasMenuContent = $derived(menu.sections.some((section) => section.items.length > 0));
  let canCreateSection = $derived(newSectionName.trim().length > 0);
  let hasTopText = $derived(menu.eyebrow.trim().length > 0);
  let hasLogo = $derived(menu.logoDataUrl.length > 0);
  let logoImageStyle = $derived(
    `object-fit: ${menu.logoFit}; object-position: ${50 + menu.logoOffsetX}% ${
      50 + menu.logoOffsetY
    }%; transform: scale(${menu.logoScale / 100});`,
  );
  let hasHeaderTopContent = $derived(hasTopText || hasLogo);
  let hasRestaurantDetails = $derived(
    menu.address.trim().length > 0 ||
      menu.phone.trim().length > 0 ||
      menu.website.trim().length > 0 ||
      menu.hours.trim().length > 0 ||
      menu.socialHandle.trim().length > 0,
  );
  let hasFooterDetails = $derived(menu.footerNote.trim().length > 0 || menu.disclaimer.trim().length > 0);
  let hasQrCodeUrl = $derived(menu.qrCodeUrl.trim().length > 0);
  let availableBadges = $derived<ItemBadge[]>([...builtInBadges, ...menu.customBadges]);
  let badgeLookup = $derived(new Map(availableBadges.map((badge) => [badge.id, badge])));
  let activeBadges = $derived(
    availableBadges.filter((badge) =>
      menu.sections.some((section) => section.items.some((item) => item.badgeIds.includes(badge.id))),
    ),
  );
  let hasBadgeLegend = $derived(menu.showBadgeLegend && activeBadges.length > 0);
  let hasMenuFooter = $derived(hasFooterDetails || hasQrCodeUrl || hasBadgeLegend);
  let qrCodeCaption = $derived(menu.qrCodeLabel.trim() || 'Scan for more');

  const resolveItemBadges = (item: MenuItem): ItemBadge[] =>
    item.badgeIds.map((id) => badgeLookup.get(id)).filter((badge): badge is ItemBadge => badge !== undefined);

  const badgeChipStyle = (badge: ItemBadge) => {
    const colors = badgeColorStyles[badge.color];
    return `background:${colors.bg};color:${colors.text};border:1px solid ${colors.border};`;
  };
  let csvPreviewSections = $derived(summarizeCsvRows(csvPreviewRows));
  let csvPreviewItemCount = $derived(csvPreviewRows.length);
  let activeStylePreset = $derived(
    stylePresets.find((preset) => preset.id === menu.stylePresetId) ?? stylePresets[0],
  );
  let activeStyleVariables = $derived(
    Object.entries(activeStylePreset.variables)
      .map(([key, value]) => `${key}: ${value};`)
      .join(' '),
  );
  const presetVariable = (key: string) => activeStylePreset.variables[key] ?? '';

  let activeAccentColor = $derived(menu.designSettings.accentColor || presetVariable('--menu-accent') || '#16876f');
  let activeBackgroundColor = $derived(
    menu.designSettings.backgroundColor || presetVariable('--menu-bg') || '#fffdf8',
  );
  let activeTextColor = $derived(menu.designSettings.textColor || presetVariable('--menu-text') || '#172033');
  let activeMutedColor = $derived(menu.designSettings.mutedColor || presetVariable('--menu-muted') || '#5f6b7a');
  let activeRuleColor = $derived(menu.designSettings.ruleColor || presetVariable('--menu-rule') || '#cbd5e1');
  let activeHeadingFont = $derived(
    menu.designSettings.headingFont === 'preset'
      ? presetVariable('--menu-heading-font') || headingFontStacks.serif
      : headingFontStacks[menu.designSettings.headingFont],
  );
  let activeBodyFont = $derived(
    menu.designSettings.bodyFont === 'preset'
      ? presetVariable('--menu-body-font') || bodyFontStacks.sans
      : bodyFontStacks[menu.designSettings.bodyFont],
  );
  let selectedPrintPageSize = $derived(printPageSizes[menu.printSettings.pageSize]);
  let selectedPrintMargin = $derived(printMargins[menu.printSettings.margin]);
  let selectedPrintDensity = $derived(printDensities[menu.printSettings.density]);
  let titleFontSize = $derived(30 * (menu.designSettings.titleScale / 100));
  let sectionHeadingFontSize = $derived(18 * (menu.designSettings.sectionHeadingScale / 100));
  let itemNameFontSize = $derived(16 * (menu.designSettings.itemTextScale / 100));
  let descriptionFontSize = $derived(14 * (menu.designSettings.descriptionTextScale / 100));
  let detailFontSize = $derived(12 * (menu.designSettings.descriptionTextScale / 100));
  let bodyLineHeight = $derived(1.5 * (menu.designSettings.lineHeightScale / 100));
  let itemLineHeight = $derived(1.35 * (menu.designSettings.lineHeightScale / 100));
  let effectiveHeaderSpacingRem = $derived(1.5 * (menu.designSettings.headerSpacingScale / 100));
  let effectiveItemSpacingRem = $derived(
    selectedPrintDensity.itemSpacingRem * (menu.designSettings.itemSpacingScale / 100),
  );
  let effectiveSectionSpacingRem = $derived(
    selectedPrintDensity.sectionSpacingRem * (menu.designSettings.sectionSpacingScale / 100),
  );
  let dividerConfig = $derived.by(() => {
    const scale = menu.designSettings.dividerWeightScale / 100;
    const isHometownPreset = menu.stylePresetId === 'hometown';

    if (menu.designSettings.dividerStyle === 'none') {
      return {
        headingDividerStyle: 'solid',
        headingDividerWidth: '0px',
        ruleDisplay: 'none',
        ruleStyle: 'solid',
        ruleWidth: '0px',
      };
    }

    if (menu.designSettings.dividerStyle === 'double') {
      return {
        headingDividerStyle: 'solid',
        headingDividerWidth: '0px',
        ruleDisplay: 'block',
        ruleStyle: 'double',
        ruleWidth: `${Math.max(1, 3 * scale).toFixed(2)}px`,
      };
    }

    if (menu.designSettings.dividerStyle === 'bold') {
      return {
        headingDividerStyle: 'solid',
        headingDividerWidth: '0px',
        ruleDisplay: 'block',
        ruleStyle: 'solid',
        ruleWidth: `${Math.max(1, 2 * scale).toFixed(2)}px`,
      };
    }

    if (menu.designSettings.dividerStyle === 'line') {
      return {
        headingDividerStyle: 'solid',
        headingDividerWidth: '0px',
        ruleDisplay: 'block',
        ruleStyle: 'solid',
        ruleWidth: `${Math.max(1, scale).toFixed(2)}px`,
      };
    }

    return {
      headingDividerStyle: 'solid',
      headingDividerWidth: isHometownPreset ? `${Math.max(1, 2 * scale).toFixed(2)}px` : '0px',
      ruleDisplay: isHometownPreset ? 'none' : 'block',
      ruleStyle: 'solid',
      ruleWidth: `${Math.max(1, scale).toFixed(2)}px`,
    };
  });
  let headerJustify = $derived(textAlignJustifyValues[menu.designSettings.headerAlign]);
  let sectionHeadingJustify = $derived(textAlignJustifyValues[menu.designSettings.sectionHeadingAlign]);
  let titleLetterSpacing = $derived(`${(menu.designSettings.titleLetterSpacingScale * 0.0012).toFixed(3)}em`);
  let sectionLetterSpacing = $derived(`${(menu.designSettings.sectionLetterSpacingScale * 0.0012).toFixed(3)}em`);
  let resolvedSectionTransform = $derived(
    menu.designSettings.sectionHeadingTransform === 'preset'
      ? presetVariable('--menu-header-transform') || 'uppercase'
      : menu.designSettings.sectionHeadingTransform,
  );
  let resolvedItemTransform = $derived(
    menu.designSettings.itemNameTransform === 'preset' ? 'none' : menu.designSettings.itemNameTransform,
  );
  let printPageWidth = $derived(
    menu.printSettings.orientation === 'portrait' ? selectedPrintPageSize.width : selectedPrintPageSize.height,
  );
  let printPageHeight = $derived(
    menu.printSettings.orientation === 'portrait' ? selectedPrintPageSize.height : selectedPrintPageSize.width,
  );
  let printSetupVariables = $derived(
    [
      `--print-preview-aspect: ${printPageWidth} / ${printPageHeight};`,
      `--print-preview-paper-width: ${Math.round(printPageWidth * previewPixelsPerInch)}px;`,
      `--print-preview-paper-height: ${Math.round(printPageHeight * previewPixelsPerInch)}px;`,
      `--print-preview-padding: ${selectedPrintMargin.previewPadding};`,
      `--print-grid-columns: ${menu.printSettings.columns};`,
      `--menu-item-spacing: ${selectedPrintDensity.itemSpacing};`,
      `--menu-section-spacing: ${selectedPrintDensity.sectionSpacing};`,
    ].join(' '),
  );
  let designStyleVariables = $derived(
    [
      `--menu-bg: ${activeBackgroundColor};`,
      `--menu-text: ${activeTextColor};`,
      `--menu-muted: ${activeMutedColor};`,
      `--menu-accent: ${activeAccentColor};`,
      `--menu-rule: ${activeRuleColor};`,
      `--menu-heading-font: ${activeHeadingFont};`,
      `--menu-body-font: ${activeBodyFont};`,
      `--menu-header-align: ${menu.designSettings.headerAlign};`,
      `--menu-header-justify: ${headerJustify};`,
      `--menu-section-align: ${menu.designSettings.sectionHeadingAlign};`,
      `--menu-section-justify: ${sectionHeadingJustify};`,
      `--menu-title-size: ${titleFontSize.toFixed(1)}px;`,
      `--menu-section-heading-size: ${sectionHeadingFontSize.toFixed(1)}px;`,
      `--menu-item-name-size: ${itemNameFontSize.toFixed(1)}px;`,
      `--menu-price-size: ${itemNameFontSize.toFixed(1)}px;`,
      `--menu-description-size: ${descriptionFontSize.toFixed(1)}px;`,
      `--menu-detail-size: ${detailFontSize.toFixed(1)}px;`,
      `--menu-body-line-height: ${bodyLineHeight.toFixed(2)};`,
      `--menu-item-line-height: ${itemLineHeight.toFixed(2)};`,
      `--menu-header-spacing: ${effectiveHeaderSpacingRem.toFixed(2)}rem;`,
      `--menu-item-spacing: ${effectiveItemSpacingRem.toFixed(2)}rem;`,
      `--menu-section-spacing: ${effectiveSectionSpacingRem.toFixed(2)}rem;`,
      `--menu-rule-scale: ${(menu.designSettings.dividerWeightScale / 100).toFixed(2)};`,
      `--menu-rule-display: ${dividerConfig.ruleDisplay};`,
      `--menu-rule-style: ${dividerConfig.ruleStyle};`,
      `--menu-rule-width: ${dividerConfig.ruleWidth};`,
      `--menu-heading-divider-style: ${dividerConfig.headingDividerStyle};`,
      `--menu-heading-divider-width: ${dividerConfig.headingDividerWidth};`,
      `--menu-decoration-scale: ${(menu.designSettings.decorationScale / 100).toFixed(2)};`,
      `--menu-title-weight: ${fontWeightValues[menu.designSettings.titleWeight]};`,
      `--menu-subtitle-weight: ${fontWeightValues[menu.designSettings.subtitleWeight]};`,
      `--menu-section-weight: ${fontWeightValues[menu.designSettings.sectionHeadingWeight]};`,
      `--menu-item-weight: ${fontWeightValues[menu.designSettings.itemNameWeight]};`,
      `--menu-description-weight: ${fontWeightValues[menu.designSettings.descriptionWeight]};`,
      `--menu-price-weight: ${fontWeightValues[menu.designSettings.priceWeight]};`,
      `--menu-footer-weight: ${fontWeightValues[menu.designSettings.footerWeight]};`,
      `--menu-title-letter-spacing: ${titleLetterSpacing};`,
      `--menu-section-letter-spacing: ${sectionLetterSpacing};`,
      `--menu-section-transform: ${resolvedSectionTransform};`,
      `--menu-item-transform: ${resolvedItemTransform};`,
    ].join(' '),
  );
  let previewStyleVariables = $derived(`${activeStyleVariables} ${printSetupVariables} ${designStyleVariables}`);

  const getSectionHeadingAlign = (section: PreviewSectionChunk | MenuSection): TextAlignChoice =>
    section.headingAlign === 'preset' ? menu.designSettings.sectionHeadingAlign : section.headingAlign;

  const getSectionItemLayout = (section: PreviewSectionChunk | MenuSection): ItemLayoutChoice =>
    section.itemLayout === 'preset' ? menu.designSettings.itemLayout : section.itemLayout;

  const resolveItemImageSettings = (section: PreviewSectionChunk | MenuSection, item: MenuItem): ItemImageSettings =>
    item.imageUseSectionDefaults ? section.imageDefaults : item.image;

  const itemPhotoStyle = (settings: ItemImageSettings) =>
    `object-fit: ${settings.fit}; object-position: ${50 + settings.focalX}% ${
      50 + settings.focalY
    }%; transform: scale(${settings.scale / 100});`;

  const getSectionRuleConfig = (section: PreviewSectionChunk | MenuSection) => {
    const scale = menu.designSettings.dividerWeightScale / 100;

    if (section.dividerStyle === 'none') {
      return {
        display: 'none',
        style: 'solid',
        width: '0px',
      };
    }

    if (section.dividerStyle === 'double') {
      return {
        display: 'block',
        style: 'double',
        width: `${Math.max(1, 3 * scale).toFixed(2)}px`,
      };
    }

    if (section.dividerStyle === 'bold') {
      return {
        display: 'block',
        style: 'solid',
        width: `${Math.max(1, 2 * scale).toFixed(2)}px`,
      };
    }

    if (section.dividerStyle === 'line') {
      return {
        display: 'block',
        style: 'solid',
        width: `${Math.max(1, scale).toFixed(2)}px`,
      };
    }

    return {
      display: 'var(--menu-rule-display, block)',
      style: 'var(--menu-rule-style, solid)',
      width: 'var(--menu-rule-width, 1px)',
    };
  };

  const getSectionStyleVariables = (section: PreviewSectionChunk) => {
    const sectionAlign = getSectionHeadingAlign(section);
    const sectionRule = getSectionRuleConfig(section);
    const headingDirection = sectionAlign === 'right' ? 'row-reverse' : 'row';
    const ruleFlex = sectionAlign === 'center' ? '0 1 7rem' : '1 1 0%';

    return [
      `--section-column-span: ${Math.min(section.columnSpan, menu.printSettings.columns)};`,
      `--section-heading-align: ${sectionAlign};`,
      `--section-heading-justify: ${textAlignJustifyValues[sectionAlign]};`,
      `--section-heading-direction: ${headingDirection};`,
      `--section-rule-flex: ${ruleFlex};`,
      `--section-rule-display: ${sectionRule.display};`,
      `--section-rule-style: ${sectionRule.style};`,
      `--section-rule-width: ${sectionRule.width};`,
    ].join(' ');
  };
  let printPageCss = $derived(`
@media print {
  @page {
    size: ${selectedPrintPageSize.cssSize} ${menu.printSettings.orientation};
    margin: ${selectedPrintMargin.value};
  }

  .menu-print-grid {
    grid-template-columns: repeat(${menu.printSettings.columns}, minmax(0, 1fr)) !important;
  }
}
`);
  let printWarnings = $derived.by(() => {
    const warnings: string[] = [];
    const largestSectionItemCount = Math.max(...menu.sections.map((section) => section.items.length), 0);

    if (itemCount > 22 && menu.printSettings.density === 'comfortable') {
      warnings.push('This menu has many items. Compact spacing may reduce awkward page breaks.');
    }

    if (itemCount > 14 && menu.printSettings.columns === 1) {
      warnings.push('One-column printing may create a longer menu for this item count.');
    }

    if (largestSectionItemCount > 8) {
      warnings.push('One section has many items and may split across pages.');
    }

    if (hasMenuFooter && menu.printSettings.margin === 'compact') {
      warnings.push('Compact margins may crowd footer notes or QR codes.');
    }

    return warnings;
  });

  $effect(() => {
    const styleElementId = 'menumaker-print-page-setup';
    let styleElement = document.getElementById(styleElementId) as HTMLStyleElement | null;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleElementId;
      document.head.append(styleElement);
    }

    styleElement.textContent = printPageCss;
  });

  const toWebsiteHref = (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return '';

    return /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`;
  };

  let websiteHref = $derived(toWebsiteHref(menu.website));

  $effect(() => {
    const qrCodeUrl = menu.qrCodeUrl.trim();

    if (!qrCodeUrl) {
      qrCodeDataUrl = '';
      qrCodeError = '';
      return;
    }

    let cancelled = false;

    QRCode.toDataURL(qrCodeUrl, {
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 144,
    })
      .then((dataUrl) => {
        if (cancelled) return;
        qrCodeDataUrl = dataUrl;
        qrCodeError = '';
      })
      .catch(() => {
        if (cancelled) return;
        qrCodeDataUrl = '';
        qrCodeError = 'QR code unavailable for this link.';
      });

    return () => {
      cancelled = true;
    };
  });

  const recordDraftHistorySnapshot = (snapshot: string, label: string) => {
    const nextHistory = ensureDraftHistoryEntry(draftHistory, snapshot, label);

    if (nextHistory !== draftHistory) {
      draftHistory = nextHistory;
      saveDraftHistoryEntries(nextHistory);
    }
  };

  const saveMenuSnapshot = (snapshot: string, label = 'Autosave') => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, snapshot);
    }

    recordDraftHistorySnapshot(snapshot, label);
    autosaveStatus = `${label} saved ${formatHistoryTimestamp(new Date().toISOString())}`;
  };

  $effect(() => {
    const snapshot = createMenuSnapshot();

    if (snapshot === lastMenuSnapshot) {
      saveMenuSnapshot(snapshot);
      return;
    }

    if (applyingHistorySnapshot) {
      applyingHistorySnapshot = false;
    } else {
      undoSnapshots = [...undoSnapshots.slice(-(maxUndoSnapshots - 1)), lastMenuSnapshot];
      redoSnapshots = [];
    }

    lastMenuSnapshot = snapshot;
    saveMenuSnapshot(snapshot);
  });

  const formatPrice = (price: string) => {
    const trimmedPrice = price.trim();
    const numericPrice = Number(trimmedPrice.replace(/[$,]/g, ''));

    if (!trimmedPrice || Number.isNaN(numericPrice)) return trimmedPrice;

    const minimumFractionDigits =
      menu.designSettings.priceDecimalStyle === 'always' || (!Number.isInteger(numericPrice) && menu.designSettings.priceDecimalStyle === 'auto')
        ? 2
        : 0;
    const maximumFractionDigits = menu.designSettings.priceDecimalStyle === 'trim' ? 2 : Math.max(2, minimumFractionDigits);
    const formattedPrice = new Intl.NumberFormat('en-US', {
      currency: 'USD',
      maximumFractionDigits,
      minimumFractionDigits,
      style: menu.designSettings.priceCurrencyStyle === 'symbol' ? 'currency' : 'decimal',
    }).format(numericPrice);

    return menu.designSettings.priceDecimalStyle === 'trim'
      ? formattedPrice.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '')
      : formattedPrice;
  };

  const formatDesignSetting = (value: number) => `${Math.round(value)}%`;

  const updateDesignSetting = (setting: DesignSettingKey, value: string) => {
    menu.designSettings[setting] = Number(value);
  };

  const updateDesignColor = (setting: DesignColorSettingKey, value: string) => {
    menu.designSettings[setting] = value;
  };

  const resetDesignSettings = () => {
    menu.designSettings = defaultDesignSettings();
  };

  const applyStylePreset = (presetId: StylePresetId) => {
    menu.stylePresetId = presetId;
    resetDesignSettings();
  };

  const resetWizardFromDraft = (draft: MenuDraft = menu) => {
    wizardStep = 'basics';
    wizardName = draft.name;
    wizardSubtitle = draft.subtitle;
    wizardTemplateId = menuTemplates[0]?.id ?? '';
    wizardStylePresetId = draft.stylePresetId;
    wizardLogoDataUrl = draft.logoDataUrl;
    wizardLogoName = draft.logoName;
  };

  const openWizard = () => {
    resetWizardFromDraft(menu);
    wizardModalOpen = true;
  };

  const skipWizard = () => {
    wizardModalOpen = false;
  };

  const handleWizardLogoUpload = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
      const upload = await prepareImageUpload(file);
      wizardLogoDataUrl = upload.dataUrl;
      wizardLogoName = upload.fileName;
      draftFileError = '';
      draftFileStatus = imageUploadStatusMessage(upload);
    } catch {
      draftFileStatus = '';
      draftFileError = 'Could not upload that logo image.';
    } finally {
      input.value = '';
    }
  };

  const removeWizardLogo = () => {
    wizardLogoDataUrl = '';
    wizardLogoName = '';
  };

  const completeWizard = () => {
    if (!selectedWizardTemplate || !wizardCanContinueBasics) return;

    const wizardDraft = createDraftFromTemplate(selectedWizardTemplate);
    wizardDraft.name = wizardName.trim();
    wizardDraft.subtitle = wizardSubtitle.trim();
    wizardDraft.stylePresetId = wizardStylePresetId;
    wizardDraft.logoDataUrl = wizardLogoDataUrl;
    wizardDraft.logoName = wizardLogoName;
    wizardDraft.logoAlt = wizardLogoName.replace(/\.[^.]+$/, '');
    wizardDraft.logoPlacement = wizardLogoDataUrl ? 'above-eyebrow' : wizardDraft.logoPlacement;

    menu = wizardDraft;
    selectedSectionId = wizardDraft.sections[0]?.id ?? '';
    activeEditorPanel = 'sections';
    wizardModalOpen = false;
    showRecoveryNotice = false;
    draftFileError = '';
    draftFileStatus = `Created ${selectedWizardTemplate.name} menu from the wizard.`;
  };

  const restoreMenuSnapshot = (snapshot: string, statusMessage: string) => {
    try {
      const restoredMenu = normalizeImportedDraft(JSON.parse(snapshot));
      applyingHistorySnapshot = true;
      menu = restoredMenu;
      selectedSectionId = restoredMenu.sections[0]?.id ?? '';
      selectedItemIds = [];
      quickAddItemsText = '';
      showRecoveryNotice = false;
      draftFileError = '';
      draftFileStatus = statusMessage;
      autosaveStatus = statusMessage;
      resetItemDrag();
    } catch {
      draftFileStatus = '';
      draftFileError = 'Could not restore that saved draft.';
    }
  };

  const undoMenuChange = () => {
    if (!canUndo) return;

    const currentSnapshot = createMenuSnapshot();
    const previousSnapshot = undoSnapshots.at(-1);

    if (!previousSnapshot) return;

    undoSnapshots = undoSnapshots.slice(0, -1);
    redoSnapshots = [currentSnapshot, ...redoSnapshots].slice(0, maxUndoSnapshots);
    restoreMenuSnapshot(previousSnapshot, 'Undid last edit.');
  };

  const redoMenuChange = () => {
    if (!canRedo) return;

    const currentSnapshot = createMenuSnapshot();
    const nextSnapshot = redoSnapshots[0];

    if (!nextSnapshot) return;

    redoSnapshots = redoSnapshots.slice(1);
    undoSnapshots = [...undoSnapshots.slice(-(maxUndoSnapshots - 1)), currentSnapshot];
    restoreMenuSnapshot(nextSnapshot, 'Redid edit.');
  };

  const restoreDraftHistoryEntry = (entryId: string) => {
    const entry = draftHistory.find((historyEntry) => historyEntry.id === entryId);

    if (!entry) return;

    const currentSnapshot = createMenuSnapshot();

    if (currentSnapshot !== entry.snapshot) {
      undoSnapshots = [...undoSnapshots.slice(-(maxUndoSnapshots - 1)), currentSnapshot];
      redoSnapshots = [];
    }

    restoreMenuSnapshot(entry.snapshot, `Restored ${entry.label.toLowerCase()} from ${formatHistoryTimestamp(entry.savedAt)}.`);
    historyModalOpen = false;
  };

  const handleHistoryShortcut = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const hasShortcutModifier = event.ctrlKey || event.metaKey;

    if (!hasShortcutModifier || event.altKey) return;

    if (key === 'z' && !event.shiftKey && canUndo) {
      event.preventDefault();
      undoMenuChange();
      return;
    }

    if ((key === 'y' || (key === 'z' && event.shiftKey)) && canRedo) {
      event.preventDefault();
      redoMenuChange();
    }
  };

  $effect(() => {
    window.addEventListener('keydown', handleHistoryShortcut);

    return () => {
      window.removeEventListener('keydown', handleHistoryShortcut);
    };
  });

  const selectSection = (sectionId: string) => {
    if (selectedSectionId !== sectionId) {
      selectedItemIds = [];
      quickAddItemsText = '';
      resetItemDrag();
    }

    selectedSectionId = sectionId;
    activeEditorPanel = 'sections';
  };

  const resetEditorForActiveVariant = (statusMessage: string) => {
    selectedSectionId = menu.sections[0]?.id ?? '';
    selectedItemIds = [];
    quickAddItemsText = '';
    resetSectionDrag();
    resetItemDrag();
    draftFileError = '';
    draftFileStatus = statusMessage;
  };

  const selectVariant = (variantId: string) => {
    if (variantId === menu.activeVariantId) return;

    const syncedDraft = createSerializableMenuDraft();
    const nextVariant = syncedDraft.variants.find((variant) => variant.id === variantId);

    if (!nextVariant) return;

    menu = applyVariantToDraft(syncedDraft, nextVariant);
    resetEditorForActiveVariant(`Switched to ${nextVariant.name || 'menu variant'}.`);
  };

  const addVariant = () => {
    const syncedDraft = createSerializableMenuDraft();
    const variantNumber = syncedDraft.variants.length + 1;
    const variant: MenuVariant = {
      id: createId(),
      name: `Menu ${variantNumber}`,
      subtitle: syncedDraft.subtitle,
      eyebrow: syncedDraft.eyebrow,
      footerNote: syncedDraft.footerNote,
      disclaimer: syncedDraft.disclaimer,
      qrCodeUrl: syncedDraft.qrCodeUrl,
      qrCodeLabel: syncedDraft.qrCodeLabel,
      sections: [createSection('New Section')],
    };

    syncedDraft.variants = [...syncedDraft.variants, variant];
    menu = applyVariantToDraft(syncedDraft, variant);
    activeEditorPanel = 'sections';
    resetEditorForActiveVariant(`Added ${variant.name}.`);
  };

  const duplicateActiveVariant = () => {
    const syncedDraft = createSerializableMenuDraft();
    const activeVariant =
      syncedDraft.variants.find((variant) => variant.id === syncedDraft.activeVariantId) ??
      createVariantFromMenu(syncedDraft);
    const duplicatedVariant: MenuVariant = {
      ...activeVariant,
      id: createId(),
      name: copyName(activeVariant.name, 'Menu'),
      sections: activeVariant.sections.map((section) => copyMenuSection(section, false)),
    };

    syncedDraft.variants = [...syncedDraft.variants, duplicatedVariant];
    menu = applyVariantToDraft(syncedDraft, duplicatedVariant);
    activeEditorPanel = 'sections';
    resetEditorForActiveVariant(`Duplicated ${activeVariant.name || 'menu variant'}.`);
  };

  const removeActiveVariant = () => {
    const syncedDraft = createSerializableMenuDraft();

    if (syncedDraft.variants.length <= 1) return;

    const activeVariantIndex = Math.max(
      0,
      syncedDraft.variants.findIndex((variant) => variant.id === syncedDraft.activeVariantId),
    );
    const variants = syncedDraft.variants.filter((variant) => variant.id !== syncedDraft.activeVariantId);
    const nextVariant = variants[Math.max(0, activeVariantIndex - 1)] ?? variants[0];

    syncedDraft.variants = variants;
    menu = applyVariantToDraft(syncedDraft, nextVariant);
    resetEditorForActiveVariant(`Removed variant and switched to ${nextVariant.name || 'menu variant'}.`);
  };

  const estimateWrappedLineCount = (value: string, charactersPerLine: number) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return 0;

    return Math.max(1, Math.ceil(trimmedValue.length / charactersPerLine));
  };

  const estimatePreviewHeaderHeight = () => {
    let height = Math.round(78 + titleFontSize * 1.35);

    if (menu.designSettings.headerFlair !== 'none') {
      height += Math.round(26 * (menu.designSettings.decorationScale / 100));
    }

    if (hasTopText) height += Math.round(detailFontSize * bodyLineHeight + 10);
    if (menu.subtitle.trim()) height += Math.round(descriptionFontSize * bodyLineHeight + 10);
    if (hasRestaurantDetails) height += Math.round(detailFontSize * bodyLineHeight * 3.25);
    if (hasLogo && (menu.logoPlacement === 'above-eyebrow' || menu.logoPlacement === 'below-eyebrow')) {
      height += Math.round(86 * (menu.logoScale / 100));
    }

    return height;
  };

  const estimatePreviewItemHeight = (
    item: MenuItem,
    sectionSpan: SectionColumnSpan,
    imageLayout: SectionImageLayout,
  ) => {
    const isNarrowColumn = menu.printSettings.columns === 2 && sectionSpan === 1;
    const nameLines = estimateWrappedLineCount(item.name || 'Untitled item', isNarrowColumn ? 22 : 46);
    const descriptionLines = estimateWrappedLineCount(item.description, isNarrowColumn ? 34 : 78);
    const nameLineHeight = itemNameFontSize * itemLineHeight;
    const descriptionLineHeight = descriptionFontSize * bodyLineHeight;
    let imageHeight = 0;

    if (item.imageDataUrl && imageLayout === 'thumbnail') {
      imageHeight = 74;
    } else if (item.imageDataUrl && imageLayout === 'banner') {
      imageHeight = isNarrowColumn ? 104 : 126;
    }

    let extrasHeight = 0;
    if (item.sizes.length > 0) {
      extrasHeight +=
        4 + (menu.designSettings.sizeDisplay === 'inline' ? descriptionLineHeight : item.sizes.length * descriptionLineHeight);
    }
    if (item.modifierGroups.length > 0) {
      extrasHeight += item.modifierGroups.reduce((groupHeight, group) => {
        const optionLines = menu.designSettings.modifierDisplay === 'inline' ? 1 : group.options.length;
        return groupHeight + descriptionLineHeight + optionLines * descriptionLineHeight + 4;
      }, 0);
    }

    const textHeight =
      nameLines * nameLineHeight +
      (descriptionLines > 0 ? descriptionLines * descriptionLineHeight + 8 : 0) +
      extrasHeight;

    return imageLayout === 'thumbnail' ? Math.max(textHeight, imageHeight) : textHeight + imageHeight;
  };

  const estimatePreviewSectionHeight = (section: PreviewSectionChunk) => {
    const sectionSpan = Math.min(section.columnSpan, menu.printSettings.columns) as SectionColumnSpan;
    const itemGap = effectiveItemSpacingRem * 16;
    const headingHeight = sectionHeadingFontSize * 1.35 + 26;
    const noteLines = estimateWrappedLineCount(section.note, sectionSpan === 1 ? 42 : 88);
    const noteHeight = noteLines > 0 ? noteLines * descriptionFontSize * bodyLineHeight + 12 : 0;
    const sectionPadding = section.backgroundStyle === 'none' ? 0 : 26;

    if (section.items.length === 0) return headingHeight + noteHeight + 30 + sectionPadding;

    return (
      headingHeight +
      noteHeight +
      section.items.reduce(
        (height, item, itemIndex) =>
          height +
          estimatePreviewItemHeight(item, sectionSpan, section.imageLayout) +
          (itemIndex === 0 ? 0 : itemGap),
        0,
      ) +
      sectionPadding
    );
  };

  const estimatePreviewSectionsHeight = (sections: PreviewSectionChunk[]) => {
    if (sections.length === 0) return hasMenuContent ? 0 : 94;

    const rowGap = effectiveSectionSpacingRem * 16;
    let totalHeight = effectiveHeaderSpacingRem * 16;
    let pendingColumnHeights: number[] = [];

    const addRow = (rowHeight: number) => {
      totalHeight += (totalHeight === 24 ? 0 : rowGap) + rowHeight;
    };

    const flushColumns = () => {
      if (pendingColumnHeights.length === 0) return;
      addRow(Math.max(...pendingColumnHeights));
      pendingColumnHeights = [];
    };

    sections.forEach((section) => {
      const sectionSpan = Math.min(section.columnSpan, menu.printSettings.columns);
      const sectionHeight = estimatePreviewSectionHeight(section);

      if (menu.printSettings.columns === 1 || sectionSpan === menu.printSettings.columns) {
        flushColumns();
        addRow(sectionHeight);
        return;
      }

      pendingColumnHeights.push(sectionHeight);
      if (pendingColumnHeights.length === menu.printSettings.columns) {
        flushColumns();
      }
    });

    flushColumns();
    return totalHeight;
  };

  const estimatePreviewFooterHeight = () => {
    if (!hasMenuFooter) return 0;

    let height = 78;
    if (menu.footerNote.trim()) height += 34;
    if (menu.disclaimer.trim()) height += 40;
    if (hasQrCodeUrl) height = Math.max(height, 168);
    if (hasBadgeLegend) height += 28 + Math.ceil(activeBadges.length / 4) * 22;

    return height;
  };

  const createPreviewSectionChunk = (
    section: MenuSection,
    items: MenuItem[],
    chunkIndex = 0,
  ): PreviewSectionChunk => ({
    id: `${section.id}-${chunkIndex}-${items.map((item) => item.id).join('-') || 'empty'}`,
    sectionId: section.id,
    name: section.name,
    columnSpan: section.columnSpan,
    imageLayout: section.imageLayout,
    note: section.note,
    headingAlign: section.headingAlign,
    dividerStyle: section.dividerStyle,
    backgroundStyle: section.backgroundStyle,
    itemLayout: section.itemLayout,
    imageDefaults: section.imageDefaults,
    items,
    isContinuation: chunkIndex > 0,
  });

  const estimatePreviewPageHeight = (page: PreviewPage, extraSection?: PreviewSectionChunk, showFooter = page.showFooter) => {
    const sections = extraSection ? [...page.sections, extraSection] : page.sections;
    let height = page.showHeader ? estimatePreviewHeaderHeight() : 0;
    height += estimatePreviewSectionsHeight(sections);

    if (showFooter) {
      height += (height > 0 ? 32 : 0) + estimatePreviewFooterHeight();
    }

    return height;
  };

  const paginatePreview = () => {
    const pageContentHeight =
      Math.round(printPageHeight * previewPixelsPerInch) - previewPaddingPixels[menu.printSettings.margin] * 2;
    const pages: PreviewPage[] = [{ id: 'page-1', sections: [], showFooter: false, showHeader: true }];

    const createPage = () => {
      const page: PreviewPage = {
        id: `page-${pages.length + 1}`,
        sections: [],
        showFooter: false,
        showHeader: false,
      };
      pages.push(page);
      return page;
    };

    const canFit = (page: PreviewPage, chunk?: PreviewSectionChunk, showFooter = page.showFooter) =>
      estimatePreviewPageHeight(page, chunk, showFooter) <= pageContentHeight;

    const addChunkToPage = (chunk: PreviewSectionChunk) => {
      let page = pages[pages.length - 1];

      if (canFit(page, chunk)) {
        page.sections.push(chunk);
        return;
      }

      if (!page.showHeader || page.sections.length > 0) {
        page = createPage();
      }

      if (canFit(page, chunk) || chunk.items.length <= 1) {
        page.sections.push(chunk);
        return;
      }

      let itemIndex = 0;
      let chunkIndex = chunk.isContinuation ? 1 : 0;

      while (itemIndex < chunk.items.length) {
        page = pages[pages.length - 1];

        if (!canFit(page) && page.sections.length > 0) {
          page = createPage();
        }

        const chunkItems: MenuItem[] = [];

        while (itemIndex < chunk.items.length) {
          const nextItems = [...chunkItems, chunk.items[itemIndex]];
          const candidate = createPreviewSectionChunk(
            {
              id: chunk.sectionId,
              name: chunk.name,
              columnSpan: chunk.columnSpan,
              imageLayout: chunk.imageLayout,
              note: chunk.note,
              headingAlign: chunk.headingAlign,
              dividerStyle: chunk.dividerStyle,
              backgroundStyle: chunk.backgroundStyle,
              itemLayout: chunk.itemLayout,
              imageDefaults: chunk.imageDefaults,
              items: chunk.items,
            },
            nextItems,
            chunkIndex,
          );

          if (canFit(page, candidate) || chunkItems.length === 0) {
            chunkItems.push(chunk.items[itemIndex]);
            itemIndex += 1;
            continue;
          }

          break;
        }

        page.sections.push(
          createPreviewSectionChunk(
            {
            id: chunk.sectionId,
            name: chunk.name,
            columnSpan: chunk.columnSpan,
            imageLayout: chunk.imageLayout,
            note: chunk.note,
            headingAlign: chunk.headingAlign,
            dividerStyle: chunk.dividerStyle,
            backgroundStyle: chunk.backgroundStyle,
            itemLayout: chunk.itemLayout,
            imageDefaults: chunk.imageDefaults,
            items: chunk.items,
          },
            chunkItems,
            chunkIndex,
          ),
        );
        chunkIndex += 1;

        if (itemIndex < chunk.items.length) {
          createPage();
        }
      }
    };

    menu.sections.forEach((section) => {
      const chunk = createPreviewSectionChunk(section, section.items);
      const currentPage = pages[pages.length - 1];

      if (canFit(currentPage, chunk)) {
        currentPage.sections.push(chunk);
        return;
      }

      const emptyPage: PreviewPage = { id: 'test-page', sections: [], showFooter: false, showHeader: false };
      const shouldMoveWholeSection = currentPage.sections.length > 0 && canFit(emptyPage, chunk);

      if (shouldMoveWholeSection) {
        createPage().sections.push(chunk);
        return;
      }

      addChunkToPage(chunk);
    });

    if (hasMenuFooter) {
      let page = pages[pages.length - 1];

      if (canFit(page, undefined, true)) {
        page.showFooter = true;
      } else {
        page = createPage();
        page.showFooter = true;
      }
    }

    return pages;
  };

  let previewPages = $derived(paginatePreview());

  const openTemplateModal = () => {
    pendingTemplateId = '';
    templateModalOpen = true;
  };

  const requestTemplateApply = (template: MenuTemplate) => {
    pendingTemplateId = template.id;
  };

  const cancelTemplateApply = () => {
    pendingTemplateId = '';
  };

  const applyTemplate = (template: MenuTemplate) => {
    const templatedMenu = createDraftFromTemplate(template);
    menu = templatedMenu;
    selectedSectionId = templatedMenu.sections[0]?.id ?? '';
    activeEditorPanel = 'sections';
    templateModalOpen = false;
    pendingTemplateId = '';
    draftFileError = '';
    draftFileStatus = `Applied ${template.name} template.`;
  };

  const openSectionModal = () => {
    activeEditorPanel = 'sections';
    newSectionName = '';
    sectionModalOpen = true;
  };

  const addSection = () => {
    const sectionName = newSectionName.trim();
    if (!sectionName) return;

    const section = createSection(sectionName);
    menu.sections.push(section);
    selectedSectionId = section.id;
    selectedItemIds = [];
    quickAddItemsText = '';
    activeEditorPanel = 'sections';
    newSectionName = '';
    sectionModalOpen = false;
  };

  const removeSection = (sectionId: string) => {
    if (menu.sections.length === 1) return;

    const sectionIndex = menu.sections.findIndex((section) => section.id === sectionId);
    const removedSection = menu.sections[sectionIndex];
    const removedItemIds = new Set(removedSection?.items.map((item) => item.id) ?? []);
    menu.sections = menu.sections.filter((section) => section.id !== sectionId);
    selectedItemIds = selectedItemIds.filter((itemId) => !removedItemIds.has(itemId));

    if (selectedSectionId === sectionId) {
      selectedSectionId = menu.sections[Math.max(0, sectionIndex - 1)]?.id ?? menu.sections[0]?.id ?? '';
      quickAddItemsText = '';
      resetItemDrag();
    }
  };

  const duplicateSection = (sectionId: string) => {
    const sectionIndex = menu.sections.findIndex((section) => section.id === sectionId);
    const section = menu.sections[sectionIndex];

    if (!section) return;

    const duplicatedSection = cloneMenuSection(section);
    menu.sections = [
      ...menu.sections.slice(0, sectionIndex + 1),
      duplicatedSection,
      ...menu.sections.slice(sectionIndex + 1),
    ];
    selectedSectionId = duplicatedSection.id;
    selectedItemIds = [];
    quickAddItemsText = '';
    activeEditorPanel = 'sections';
  };

  const moveSection = (sectionId: string, direction: -1 | 1) => {
    const sectionIndex = menu.sections.findIndex((section) => section.id === sectionId);
    const nextIndex = sectionIndex + direction;

    if (sectionIndex < 0 || nextIndex < 0 || nextIndex >= menu.sections.length) return;

    const sections = [...menu.sections];
    [sections[sectionIndex], sections[nextIndex]] = [sections[nextIndex], sections[sectionIndex]];
    menu.sections = sections;
    selectedSectionId = sectionId;
  };

  const resetSectionDrag = () => {
    window.removeEventListener('pointermove', handleSectionGripPointerMove);
    window.removeEventListener('pointerup', handleSectionGripPointerUp);
    window.removeEventListener('pointercancel', resetSectionDrag);
    window.removeEventListener('mousemove', handleSectionGripMouseMove);
    window.removeEventListener('mouseup', handleSectionGripMouseUp);
    draggedSectionId = '';
    sectionDropTargetId = '';
    sectionDropPosition = 'after';
    sectionDragPointerId = null;
    sectionDragMouseActive = false;
    sectionDragHandleElement = null;
  };

  const startSectionDrag = (sectionId: string) => {
    draggedSectionId = sectionId;
    sectionDropTargetId = '';
    selectedSectionId = sectionId;
    activeEditorPanel = 'sections';
  };

  const getSectionDropPosition = (clientY: number, target: HTMLElement): SectionDropPosition => {
    const bounds = target.getBoundingClientRect();

    return clientY > bounds.top + bounds.height / 2 ? 'after' : 'before';
  };

  const getSectionDropTarget = (clientX: number, clientY: number) => {
    const element = document.elementFromPoint(clientX, clientY);
    const sectionRow = element?.closest<HTMLElement>('[data-section-id]');
    const sectionId = sectionRow?.dataset.sectionId;

    if (!sectionId || !sectionRow) return null;

    return {
      sectionId,
      dropPosition: getSectionDropPosition(clientY, sectionRow),
    };
  };

  const moveSectionToPosition = (
    sectionId: string,
    targetSectionId: string,
    dropPosition: SectionDropPosition,
  ) => {
    if (sectionId === targetSectionId) return;

    const sourceIndex = menu.sections.findIndex((section) => section.id === sectionId);
    const targetIndex = menu.sections.findIndex((section) => section.id === targetSectionId);

    if (sourceIndex < 0 || targetIndex < 0) return;

    const sections = [...menu.sections];
    const [section] = sections.splice(sourceIndex, 1);
    let insertionIndex = targetIndex + (dropPosition === 'after' ? 1 : 0);

    if (sourceIndex < insertionIndex) {
      insertionIndex -= 1;
    }

    sections.splice(insertionIndex, 0, section);
    menu.sections = sections;
    selectedSectionId = sectionId;
  };

  const updateSectionDragTarget = (clientX: number, clientY: number) => {
    const dropTarget = getSectionDropTarget(clientX, clientY);

    if (!dropTarget || dropTarget.sectionId === draggedSectionId) {
      sectionDropTargetId = '';
      return;
    }

    sectionDropTargetId = dropTarget.sectionId;
    sectionDropPosition = dropTarget.dropPosition;
  };

  const finishSectionDrag = (clientX: number, clientY: number) => {
    const sourceSectionId = draggedSectionId;
    const dropTarget = getSectionDropTarget(clientX, clientY);

    if (sourceSectionId && dropTarget && dropTarget.sectionId !== sourceSectionId) {
      moveSectionToPosition(sourceSectionId, dropTarget.sectionId, dropTarget.dropPosition);
    }
  };

  const handleSectionGripPointerDown = (event: PointerEvent, sectionId: string) => {
    if (event.button !== 0 || menu.sections.length <= 1) return;

    startSectionDrag(sectionId);
    sectionDragPointerId = event.pointerId;
    sectionDragHandleElement = event.currentTarget as HTMLElement;

    sectionDragHandleElement.setPointerCapture(event.pointerId);
    window.addEventListener('pointermove', handleSectionGripPointerMove);
    window.addEventListener('pointerup', handleSectionGripPointerUp);
    window.addEventListener('pointercancel', resetSectionDrag);
    event.preventDefault();
  };

  const handleSectionGripPointerMove = (event: PointerEvent) => {
    if (!draggedSectionId || sectionDragPointerId !== event.pointerId) return;

    updateSectionDragTarget(event.clientX, event.clientY);
    event.preventDefault();
  };

  const handleSectionGripPointerUp = (event: PointerEvent) => {
    if (!draggedSectionId || sectionDragPointerId !== event.pointerId) return;

    if (sectionDragHandleElement?.hasPointerCapture(event.pointerId)) {
      sectionDragHandleElement.releasePointerCapture(event.pointerId);
    }

    finishSectionDrag(event.clientX, event.clientY);
    event.preventDefault();
    resetSectionDrag();
  };

  const handleSectionGripMouseDown = (event: MouseEvent, sectionId: string) => {
    if (event.button !== 0 || menu.sections.length <= 1 || sectionDragPointerId !== null) return;

    startSectionDrag(sectionId);
    sectionDragMouseActive = true;
    window.addEventListener('mousemove', handleSectionGripMouseMove);
    window.addEventListener('mouseup', handleSectionGripMouseUp);
    event.preventDefault();
  };

  const handleSectionGripMouseMove = (event: MouseEvent) => {
    if (!sectionDragMouseActive || !draggedSectionId) return;

    updateSectionDragTarget(event.clientX, event.clientY);
    event.preventDefault();
  };

  const handleSectionGripMouseUp = (event: MouseEvent) => {
    if (!sectionDragMouseActive || !draggedSectionId) return;

    finishSectionDrag(event.clientX, event.clientY);
    event.preventDefault();
    resetSectionDrag();
  };

  const addItem = (section: MenuSection) => {
    section.items = [...section.items, createItem({ name: `Item ${section.items.length + 1}` })];
  };

  const removeItem = (section: MenuSection, itemId: string) => {
    section.items = section.items.filter((item) => item.id !== itemId);
    selectedItemIds = selectedItemIds.filter((selectedItemId) => selectedItemId !== itemId);
  };

  const moveItem = (section: MenuSection, itemId: string, direction: -1 | 1) => {
    const itemIndex = section.items.findIndex((item) => item.id === itemId);
    const nextIndex = itemIndex + direction;

    if (itemIndex < 0 || nextIndex < 0 || nextIndex >= section.items.length) return;

    const items = [...section.items];
    [items[itemIndex], items[nextIndex]] = [items[nextIndex], items[itemIndex]];
    section.items = items;
  };

  const duplicateItem = (section: MenuSection, itemId: string) => {
    const itemIndex = section.items.findIndex((item) => item.id === itemId);
    const item = section.items[itemIndex];

    if (!item) return;

    const duplicatedItem = cloneMenuItem(item, true);
    section.items = [
      ...section.items.slice(0, itemIndex + 1),
      duplicatedItem,
      ...section.items.slice(itemIndex + 1),
    ];
    selectedItemIds = [duplicatedItem.id];
  };

  const getSelectedItemIdsForSection = (section: MenuSection) =>
    selectedItemIds.filter((itemId) => section.items.some((item) => item.id === itemId));

  const isItemSelected = (itemId: string) => selectedItemIds.includes(itemId);

  const toggleItemSelection = (itemId: string, checked: boolean) => {
    if (checked) {
      selectedItemIds = selectedItemIds.includes(itemId) ? selectedItemIds : [...selectedItemIds, itemId];
      return;
    }

    selectedItemIds = selectedItemIds.filter((selectedItemId) => selectedItemId !== itemId);
  };

  const clearSelectedItems = (section?: MenuSection) => {
    if (!section) {
      selectedItemIds = [];
      return;
    }

    const sectionItemIds = new Set(section.items.map((item) => item.id));
    selectedItemIds = selectedItemIds.filter((itemId) => !sectionItemIds.has(itemId));
  };

  const setAllItemsSelected = (section: MenuSection, checked: boolean) => {
    if (!checked) {
      clearSelectedItems(section);
      return;
    }

    const sectionItemIds = section.items.map((item) => item.id);
    const existingSelectedIds = selectedItemIds.filter((itemId) => !sectionItemIds.includes(itemId));
    selectedItemIds = [...existingSelectedIds, ...sectionItemIds];
  };

  const canMoveSelectedItems = (section: MenuSection, direction: -1 | 1) => {
    const selectedIds = new Set(getSelectedItemIdsForSection(section));

    if (selectedIds.size === 0) return false;

    if (direction === -1) {
      return section.items.some(
        (item, index) => selectedIds.has(item.id) && index > 0 && !selectedIds.has(section.items[index - 1].id),
      );
    }

    return section.items.some(
      (item, index) =>
        selectedIds.has(item.id) &&
        index < section.items.length - 1 &&
        !selectedIds.has(section.items[index + 1].id),
    );
  };

  const moveSelectedItems = (section: MenuSection, direction: -1 | 1) => {
    const selectedIds = new Set(getSelectedItemIdsForSection(section));

    if (selectedIds.size === 0) return;

    const items = [...section.items];

    if (direction === -1) {
      for (let index = 1; index < items.length; index += 1) {
        if (selectedIds.has(items[index].id) && !selectedIds.has(items[index - 1].id)) {
          [items[index - 1], items[index]] = [items[index], items[index - 1]];
        }
      }
    } else {
      for (let index = items.length - 2; index >= 0; index -= 1) {
        if (selectedIds.has(items[index].id) && !selectedIds.has(items[index + 1].id)) {
          [items[index + 1], items[index]] = [items[index], items[index + 1]];
        }
      }
    }

    section.items = items;
  };

  const duplicateSelectedItems = (section: MenuSection) => {
    const selectedIds = new Set(getSelectedItemIdsForSection(section));

    if (selectedIds.size === 0) return;

    const duplicatedItemIds: string[] = [];
    const items = section.items.flatMap((item) => {
      if (!selectedIds.has(item.id)) return [item];

      const duplicatedItem = cloneMenuItem(item, true);
      duplicatedItemIds.push(duplicatedItem.id);

      return [item, duplicatedItem];
    });

    section.items = items;
    selectedItemIds = duplicatedItemIds;
  };

  const deleteSelectedItems = (section: MenuSection) => {
    const selectedIds = new Set(getSelectedItemIdsForSection(section));

    if (selectedIds.size === 0) return;

    section.items = section.items.filter((item) => !selectedIds.has(item.id));
    selectedItemIds = selectedItemIds.filter((itemId) => !selectedIds.has(itemId));
  };

  const addQuickItems = (section: MenuSection) => {
    if (quickAddItemDrafts.length === 0) return;

    section.items = [...section.items, ...quickAddItemDrafts.map((item) => createItem(item))];
    quickAddItemsText = '';
  };

  const resetItemDrag = () => {
    window.removeEventListener('pointermove', handleItemGripPointerMove);
    window.removeEventListener('pointerup', handleItemGripPointerUp);
    window.removeEventListener('pointercancel', resetItemDrag);
    window.removeEventListener('mousemove', handleItemGripMouseMove);
    window.removeEventListener('mouseup', handleItemGripMouseUp);
    draggedItemId = '';
    itemDropTargetId = '';
    itemDropPosition = 'after';
    itemDragPointerId = null;
    itemDragMouseActive = false;
    itemDragHandleElement = null;
  };

  const startItemDrag = (itemId: string) => {
    draggedItemId = itemId;
    itemDropTargetId = '';
    selectedItemIds = isItemSelected(itemId) ? selectedItemIds : [];
  };

  const getItemDropPosition = (clientY: number, target: HTMLElement): SectionDropPosition => {
    const bounds = target.getBoundingClientRect();

    return clientY > bounds.top + bounds.height / 2 ? 'after' : 'before';
  };

  const getItemDropTarget = (clientX: number, clientY: number) => {
    const element = document.elementFromPoint(clientX, clientY);
    const itemCard = element?.closest<HTMLElement>('[data-item-id]');
    const itemId = itemCard?.dataset.itemId;

    if (!itemId || !itemCard) return null;

    return {
      itemId,
      dropPosition: getItemDropPosition(clientY, itemCard),
    };
  };

  const moveItemToPosition = (
    section: MenuSection,
    itemId: string,
    targetItemId: string,
    dropPosition: SectionDropPosition,
  ) => {
    if (itemId === targetItemId) return;

    const sourceIndex = section.items.findIndex((item) => item.id === itemId);
    const targetIndex = section.items.findIndex((item) => item.id === targetItemId);

    if (sourceIndex < 0 || targetIndex < 0) return;

    const items = [...section.items];
    const [item] = items.splice(sourceIndex, 1);
    let insertionIndex = targetIndex + (dropPosition === 'after' ? 1 : 0);

    if (sourceIndex < insertionIndex) {
      insertionIndex -= 1;
    }

    items.splice(insertionIndex, 0, item);
    section.items = items;
  };

  const updateItemDragTarget = (clientX: number, clientY: number) => {
    if (!selectedSection) return;

    const dropTarget = getItemDropTarget(clientX, clientY);
    const targetBelongsToSection = selectedSection.items.some((item) => item.id === dropTarget?.itemId);

    if (!dropTarget || dropTarget.itemId === draggedItemId || !targetBelongsToSection) {
      itemDropTargetId = '';
      return;
    }

    itemDropTargetId = dropTarget.itemId;
    itemDropPosition = dropTarget.dropPosition;
  };

  const finishItemDrag = (clientX: number, clientY: number) => {
    if (!selectedSection) return;

    const sourceItemId = draggedItemId;
    const dropTarget = getItemDropTarget(clientX, clientY);
    const targetBelongsToSection = selectedSection.items.some((item) => item.id === dropTarget?.itemId);

    if (sourceItemId && dropTarget && dropTarget.itemId !== sourceItemId && targetBelongsToSection) {
      moveItemToPosition(selectedSection, sourceItemId, dropTarget.itemId, dropTarget.dropPosition);
    }
  };

  const handleItemGripPointerDown = (event: PointerEvent, itemId: string) => {
    if (event.button !== 0 || !selectedSection || selectedSection.items.length <= 1) return;

    startItemDrag(itemId);
    itemDragPointerId = event.pointerId;
    itemDragHandleElement = event.currentTarget as HTMLElement;

    itemDragHandleElement.setPointerCapture(event.pointerId);
    window.addEventListener('pointermove', handleItemGripPointerMove);
    window.addEventListener('pointerup', handleItemGripPointerUp);
    window.addEventListener('pointercancel', resetItemDrag);
  };

  const handleItemGripPointerMove = (event: PointerEvent) => {
    if (!draggedItemId || itemDragPointerId !== event.pointerId) return;

    updateItemDragTarget(event.clientX, event.clientY);
    event.preventDefault();
  };

  const handleItemGripPointerUp = (event: PointerEvent) => {
    if (!draggedItemId || itemDragPointerId !== event.pointerId) return;

    if (itemDragHandleElement?.hasPointerCapture(event.pointerId)) {
      itemDragHandleElement.releasePointerCapture(event.pointerId);
    }

    finishItemDrag(event.clientX, event.clientY);
    event.preventDefault();
    resetItemDrag();
  };

  const handleItemGripMouseDown = (event: MouseEvent, itemId: string) => {
    if (event.button !== 0 || !selectedSection || selectedSection.items.length <= 1) return;

    if (!draggedItemId) {
      startItemDrag(itemId);
    }

    itemDragMouseActive = true;
    window.addEventListener('mousemove', handleItemGripMouseMove);
    window.addEventListener('mouseup', handleItemGripMouseUp);
    event.preventDefault();
  };

  const handleItemGripMouseMove = (event: MouseEvent) => {
    if (!itemDragMouseActive || !draggedItemId) return;

    updateItemDragTarget(event.clientX, event.clientY);
    event.preventDefault();
  };

  const handleItemGripMouseUp = (event: MouseEvent) => {
    if (!itemDragMouseActive || !draggedItemId) return;

    finishItemDrag(event.clientX, event.clientY);
    event.preventDefault();
    resetItemDrag();
  };

  const handleLogoUpload = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
      const upload = await prepareImageUpload(file);
      menu.logoDataUrl = upload.dataUrl;
      menu.logoName = upload.fileName;
      menu.logoAlt = menu.logoAlt || upload.fileName.replace(/\.[^.]+$/, '');
      draftFileError = '';
      draftFileStatus = imageUploadStatusMessage(upload);
    } catch {
      draftFileStatus = '';
      draftFileError = 'Could not upload that logo image.';
    } finally {
      input.value = '';
    }
  };

  const removeLogo = () => {
    menu.logoDataUrl = '';
    menu.logoName = '';
    menu.logoAlt = '';
    menu.logoFit = 'contain';
    menu.logoScale = 100;
    menu.logoOffsetX = 0;
    menu.logoOffsetY = 0;
  };

  const handleItemImageUpload = async (event: Event, item: MenuItem) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
      const upload = await prepareImageUpload(file);
      item.imageDataUrl = upload.dataUrl;
      item.imageName = upload.fileName;
      item.imageAlt = item.imageAlt || item.name || upload.fileName.replace(/\.[^.]+$/, '');
      draftFileError = '';
      draftFileStatus = imageUploadStatusMessage(upload);
    } catch {
      draftFileStatus = '';
      draftFileError = 'Could not upload that item photo.';
    } finally {
      input.value = '';
    }
  };

  const removeItemImage = (item: MenuItem) => {
    item.imageDataUrl = '';
    item.imageName = '';
    item.imageAlt = '';
  };

  const toggleItemBadge = (item: MenuItem, badgeId: string) => {
    item.badgeIds = item.badgeIds.includes(badgeId)
      ? item.badgeIds.filter((id) => id !== badgeId)
      : [...item.badgeIds, badgeId];
  };

  const addItemSize = (item: MenuItem) => {
    item.sizes = [...item.sizes, { id: createId(), label: '', price: '' }];
  };

  const removeItemSize = (item: MenuItem, sizeId: string) => {
    item.sizes = item.sizes.filter((size) => size.id !== sizeId);
  };

  const addModifierGroup = (item: MenuItem) => {
    item.modifierGroups = [
      ...item.modifierGroups,
      { id: createId(), name: 'Choose an option', options: [{ id: createId(), label: '', price: '' }] },
    ];
  };

  const removeModifierGroup = (item: MenuItem, groupId: string) => {
    item.modifierGroups = item.modifierGroups.filter((group) => group.id !== groupId);
  };

  const addModifierOption = (group: ModifierGroup) => {
    group.options = [...group.options, { id: createId(), label: '', price: '' }];
  };

  const removeModifierOption = (group: ModifierGroup, optionId: string) => {
    group.options = group.options.filter((option) => option.id !== optionId);
  };

  const formatAddonPrice = (price: string) => {
    const trimmed = price.trim();
    if (!trimmed) return '';
    const unsigned = trimmed.replace(/^[+-]/, '');
    const numeric = Number(unsigned.replace(/[$,]/g, ''));
    if (Number.isNaN(numeric)) return formatPrice(trimmed);
    return `${trimmed.startsWith('-') ? '-' : '+'}${formatPrice(unsigned)}`;
  };

  const addCustomBadge = () => {
    const count = menu.customBadges.length + 1;
    menu.customBadges = [
      ...menu.customBadges,
      { id: createId(), label: `Custom ${count}`, shortCode: '', color: 'slate' },
    ];
  };

  const removeCustomBadge = (badgeId: string) => {
    menu.customBadges = menu.customBadges.filter((badge) => badge.id !== badgeId);
    menu.sections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.badgeIds.includes(badgeId)) {
          item.badgeIds = item.badgeIds.filter((id) => id !== badgeId);
        }
      });
    });
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');

    downloadLink.href = downloadUrl;
    downloadLink.download = fileName;
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(downloadUrl);
  };

  const menuFileBaseName = () => sanitizeFileName(menu.name) || 'menu';

  const exportDraft = () => {
    const draftFile: MenuDraftFile = {
      app: 'MenuMaker',
      schemaVersion: draftFileSchemaVersion,
      exportedAt: new Date().toISOString(),
      draft: createSerializableMenuDraft(),
    };
    const serializedDraft = JSON.stringify(draftFile, null, 2);
    const blob = new Blob([serializedDraft], { type: 'application/json' });
    const fileName = `${menuFileBaseName()}-menumaker-draft.json`;

    downloadBlob(blob, fileName);

    draftFileError = '';
    draftFileStatus = `Exported ${fileName}.`;
  };

  const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not render the menu export.'));
          }
        },
        type,
        quality,
      );
    });

  const blobToBytes = async (blob: Blob) => new Uint8Array(await blob.arrayBuffer());

  const sanitizeCanvasUnsupportedColors = (value: string) => value.replace(/\b(?:oklch|oklab|lch|lab)\([^)]*\)/g, '#64748b');

  const collectExportStyles = () =>
    sanitizeCanvasUnsupportedColors(
      Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join('\n');
          } catch {
            return '';
          }
        })
        .filter(Boolean)
        .join('\n'),
    );

  const renderElementToCanvas = async (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const width = Math.ceil(Math.max(rect.width, element.scrollWidth));
    const height = Math.ceil(Math.max(rect.height, element.scrollHeight));

    if (width <= 0 || height <= 0) {
      throw new Error('Open the menu preview before exporting.');
    }

    const exportTargetId = createId();
    const exportStyles = collectExportStyles();
    element.dataset.exportTarget = exportTargetId;

    try {
      return await html2canvas(element, {
        backgroundColor: '#ffffff',
        height,
        logging: false,
        scale: 2,
        useCORS: true,
        width,
        windowHeight: Math.max(document.documentElement.scrollHeight, height),
        windowWidth: Math.max(document.documentElement.scrollWidth, width),
        onclone: (clonedDocument) => {
          const clonedElement = clonedDocument.querySelector<HTMLElement>(`[data-export-target="${exportTargetId}"]`);
          const sanitizedStyle = clonedDocument.createElement('style');
          const overrideStyle = clonedDocument.createElement('style');

          clonedDocument.querySelectorAll('style, link[rel="stylesheet"]').forEach((styleNode) => styleNode.remove());
          sanitizedStyle.textContent = exportStyles;
          clonedDocument.head.append(sanitizedStyle);

          overrideStyle.textContent = `
            html,
            body {
              background: #ffffff !important;
              color: ${activeTextColor} !important;
            }
            [data-export-target="${exportTargetId}"] {
              background-color: ${activeBackgroundColor} !important;
              color: ${activeTextColor} !important;
            }
            [data-export-target="${exportTargetId}"],
            [data-export-target="${exportTargetId}"] * {
              border-color: ${activeRuleColor} !important;
              outline-color: ${activeRuleColor} !important;
              text-decoration-color: currentColor !important;
            }
          `;
          clonedDocument.head.append(overrideStyle);

          if (!clonedElement) return;

          clonedElement.style.margin = '0';
          clonedElement.style.transform = 'none';
          clonedElement.style.boxShadow = 'none';
          clonedElement.querySelectorAll<HTMLElement>('.menu-print-preview').forEach((pageElement) => {
            pageElement.style.boxShadow = 'none';
          });
        },
      });
    } finally {
      delete element.dataset.exportTarget;
    }
  };

  const createPdfBlob = (pages: PdfPageImage[]) => {
    const encoder = new TextEncoder();
    const chunks: BlobPart[] = [];
    const offsets = new Map<number, number>();
    let byteOffset = 0;

    const append = (chunk: string | Uint8Array) => {
      const bytes = typeof chunk === 'string' ? encoder.encode(chunk) : chunk;
      const buffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(buffer).set(bytes);

      chunks.push(buffer);
      byteOffset += bytes.length;
    };

    const appendObject = (objectId: number, objectChunks: Array<string | Uint8Array>) => {
      offsets.set(objectId, byteOffset);
      append(`${objectId} 0 obj\n`);
      objectChunks.forEach((chunk) => append(chunk));
      append('\nendobj\n');
    };

    const pageObjectIds = pages.map((_, index) => 3 + index * 3);
    const maxObjectId = 2 + pages.length * 3;

    append('%PDF-1.4\n');
    appendObject(1, ['<< /Type /Catalog /Pages 2 0 R >>']);
    appendObject(2, [`<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`]);

    pages.forEach((page, index) => {
      const pageObjectId = 3 + index * 3;
      const contentObjectId = pageObjectId + 1;
      const imageObjectId = pageObjectId + 2;
      const imageName = `Im${index + 1}`;
      const content = `q\n${page.pageWidth.toFixed(2)} 0 0 ${page.pageHeight.toFixed(2)} 0 0 cm\n/${imageName} Do\nQ`;

      appendObject(pageObjectId, [
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.pageWidth.toFixed(2)} ${page.pageHeight.toFixed(
          2,
        )}] /Resources << /XObject << /${imageName} ${imageObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`,
      ]);
      appendObject(contentObjectId, [`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`]);
      appendObject(imageObjectId, [
        `<< /Type /XObject /Subtype /Image /Width ${page.imageWidth} /Height ${page.imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.imageBytes.length} >>\nstream\n`,
        page.imageBytes,
        '\nendstream',
      ]);
    });

    const xrefOffset = byteOffset;
    append(`xref\n0 ${maxObjectId + 1}\n`);
    append('0000000000 65535 f \n');

    for (let objectId = 1; objectId <= maxObjectId; objectId += 1) {
      append(`${String(offsets.get(objectId) ?? 0).padStart(10, '0')} 00000 n \n`);
    }

    append(`trailer\n<< /Size ${maxObjectId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

    return new Blob(chunks, { type: 'application/pdf' });
  };

  const exportMenuImage = async (format: ExportImageFormat) => {
    if (!previewElement || isExporting) return;

    isExporting = true;
    draftFileStatus = `Preparing ${format.toUpperCase()} export...`;
    draftFileError = '';

    try {
      const canvas = await renderElementToCanvas(previewElement);
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const extension = format === 'png' ? 'png' : 'jpg';
      const blob = await canvasToBlob(canvas, mimeType, format === 'jpeg' ? 0.92 : undefined);
      const fileName = `${menuFileBaseName()}-menu.${extension}`;

      downloadBlob(blob, fileName);
      draftFileStatus = `Exported ${fileName}.`;
    } catch (error) {
      draftFileStatus = '';
      draftFileError = error instanceof Error ? error.message : 'Could not export the menu image.';
    } finally {
      isExporting = false;
    }
  };

  const exportMenuPdf = async () => {
    if (!previewElement || isExporting) return;

    const pageElements = Array.from(previewElement.querySelectorAll<HTMLElement>('.menu-print-preview'));

    if (pageElements.length === 0) {
      draftFileError = 'Open the menu preview before exporting.';
      draftFileStatus = '';
      return;
    }

    isExporting = true;
    draftFileStatus = 'Preparing PDF export...';
    draftFileError = '';

    try {
      const pageWidth = printPageWidth * 72;
      const pageHeight = printPageHeight * 72;
      const pages = await Promise.all(
        pageElements.map(async (pageElement) => {
          const canvas = await renderElementToCanvas(pageElement);
          const imageBlob = await canvasToBlob(canvas, 'image/jpeg', 0.94);

          return {
            imageBytes: await blobToBytes(imageBlob),
            imageHeight: canvas.height,
            imageWidth: canvas.width,
            pageHeight,
            pageWidth,
          };
        }),
      );
      const fileName = `${menuFileBaseName()}-menu.pdf`;

      downloadBlob(createPdfBlob(pages), fileName);
      draftFileStatus = `Exported ${fileName}.`;
    } catch (error) {
      draftFileStatus = '';
      draftFileError = error instanceof Error ? error.message : 'Could not export the menu PDF.';
    } finally {
      isExporting = false;
    }
  };

  const resetCsvImport = () => {
    csvFileName = '';
    csvImportError = '';
    csvImportMode = 'append';
    csvPreviewRows = [];
  };

  const openCsvImportModal = () => {
    resetCsvImport();
    csvImportModalOpen = true;
  };

  const handleCsvImportFile = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
      const previewRows = parseCsvImport(await file.text());
      csvFileName = file.name;
      csvPreviewRows = previewRows;
      csvImportError = '';
    } catch (error) {
      csvFileName = file.name;
      csvPreviewRows = [];
      csvImportError = error instanceof Error ? error.message : 'Choose a valid CSV file.';
    } finally {
      input.value = '';
    }
  };

  const applyCsvImport = () => {
    if (csvPreviewRows.length === 0) return;

    if (csvImportMode === 'replace') {
      const shouldReplace = window.confirm('Replace the current menu sections with this CSV import?');
      if (!shouldReplace) return;
    }

    const importedSections = sectionsFromCsvRows(csvPreviewRows);
    let firstAppliedSectionId = '';

    if (csvImportMode === 'replace') {
      menu.sections = importedSections;
      firstAppliedSectionId = importedSections[0]?.id ?? '';
    } else {
      importedSections.forEach((importedSection) => {
        const matchingSection = menu.sections.find(
          (section) => section.name.trim().toLowerCase() === importedSection.name.trim().toLowerCase(),
        );

        if (matchingSection) {
          matchingSection.items = [...matchingSection.items, ...importedSection.items];
          firstAppliedSectionId ||= matchingSection.id;
        } else {
          menu.sections = [...menu.sections, importedSection];
          firstAppliedSectionId ||= importedSection.id;
        }
      });
    }

    selectedSectionId = firstAppliedSectionId || menu.sections[0]?.id || '';
    activeEditorPanel = 'sections';
    csvImportModalOpen = false;
    draftFileError = '';
    draftFileStatus = `${csvImportMode === 'replace' ? 'Replaced menu with' : 'Imported'} ${csvPreviewItemCount} CSV item${
      csvPreviewItemCount === 1 ? '' : 's'
    } from ${csvFileName}.`;
    resetCsvImport();
  };

  const handleDraftImport = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
      const parsedFile = JSON.parse(await file.text()) as unknown;
      const importedDraft = parseDraftFile(parsedFile);
      const shouldImport = window.confirm('Importing this draft will replace the current menu. Continue?');

      if (!shouldImport) {
        draftFileError = '';
        draftFileStatus = 'Import canceled.';
        return;
      }

      menu = importedDraft;
      selectedSectionId = importedDraft.sections[0]?.id ?? '';
      activeEditorPanel = 'menu';
      draftFileError = '';
      draftFileStatus = `Imported ${file.name}.`;
    } catch (error) {
      draftFileStatus = '';
      draftFileError = error instanceof Error ? error.message : 'Choose a valid MenuMaker draft JSON file.';
    } finally {
      input.value = '';
    }
  };

  const resetMenu = () => {
    const defaultMenu = starterMenu();
    menu = defaultMenu;
    selectedSectionId = defaultMenu.sections[0]?.id ?? '';
    activeEditorPanel = 'menu';
    newSectionName = '';
    sectionModalOpen = false;
    templateModalOpen = false;
    csvImportModalOpen = false;
    historyModalOpen = false;
    resetWizardFromDraft(defaultMenu);
    wizardModalOpen = true;
    showRecoveryNotice = false;
    pendingTemplateId = '';
    selectedItemIds = [];
    quickAddItemsText = '';
    resetCsvImport();
    draftFileError = '';
    draftFileStatus = '';
  };

  const printMenu = () => {
    if (!previewElement) return;

    window.print();
  };
</script>

<svelte:head>
  <title>{menu.name || 'MenuMaker'}</title>
</svelte:head>

<Modal bind:open={wizardModalOpen} size="xl" title="Create your menu">
  <div class="space-y-5">
    <div class="grid gap-2 sm:grid-cols-3" aria-label="Wizard steps">
      {#each wizardSteps as step, stepIndex (step.id)}
        <button
          aria-current={wizardStep === step.id ? 'step' : undefined}
          class={`rounded-lg border px-4 py-3 text-left transition ${
            wizardStep === step.id
              ? 'border-brand-600 bg-brand-50 text-brand-950'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          } disabled:cursor-not-allowed disabled:opacity-45`}
          disabled={step.id !== 'basics' && !wizardCanContinueBasics}
          type="button"
          onclick={() => (wizardStep = step.id)}
        >
          <span class="block text-xs font-semibold uppercase tracking-[0.12em]">Step {stepIndex + 1}</span>
          <span class="mt-1 block text-sm font-semibold">{step.label}</span>
        </button>
      {/each}
    </div>

    {#if wizardStep === 'basics'}
      <div class="grid gap-5">
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="text-sm font-medium text-slate-700">Restaurant or menu name</span>
            <input
              class="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              bind:value={wizardName}
              placeholder="Main Street Grill"
            />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Subtitle</span>
            <input
              class="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              bind:value={wizardSubtitle}
              placeholder="Small town favorites served fresh"
            />
          </label>
        </div>

        <fieldset>
          <legend class="text-sm font-semibold text-slate-900">Menu type</legend>
          <div class="mt-3 grid gap-3 md:grid-cols-2">
            {#each menuTemplates as template (template.id)}
              <button
                aria-pressed={wizardTemplateId === template.id}
                class={`min-h-28 rounded-lg border p-4 text-left shadow-sm transition focus:outline-none focus:ring-4 focus:ring-brand-200 ${
                  wizardTemplateId === template.id
                    ? 'border-brand-600 bg-brand-50 text-brand-950'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
                type="button"
                onclick={() => (wizardTemplateId = template.id)}
              >
                <span class="block text-sm font-semibold text-slate-950">{template.name}</span>
                <span class="mt-1 block text-sm leading-6">{template.description}</span>
                <span class="mt-3 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {templateItemCount(template)} items
                </span>
              </button>
            {/each}
          </div>
        </fieldset>
      </div>
    {:else if wizardStep === 'style'}
      <fieldset>
        <legend class="text-sm font-semibold text-slate-900">Starting style</legend>
        <div class="mt-3 grid gap-3 sm:grid-cols-2">
          {#each stylePresets as preset (preset.id)}
            <button
              aria-pressed={wizardStylePresetId === preset.id}
              class={`flex min-h-24 items-start gap-3 rounded-lg border p-4 text-left shadow-sm transition focus:outline-none focus:ring-4 focus:ring-brand-200 ${
                wizardStylePresetId === preset.id
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
              type="button"
              onclick={() => (wizardStylePresetId = preset.id)}
            >
              <span
                class="mt-1 h-7 w-7 shrink-0 rounded-full border border-white shadow ring-1 ring-slate-200"
                style={`background: ${preset.swatch};`}
                aria-hidden="true"
              ></span>
              <span>
                <span class="block text-sm font-semibold text-slate-950">{preset.name}</span>
                <span class="mt-1 block text-sm leading-6 text-slate-600">{preset.description}</span>
              </span>
            </button>
          {/each}
        </div>
      </fieldset>
    {:else}
      <div class="grid gap-5">
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold text-slate-950">Optional logo</h2>
              <p class="mt-1 text-sm leading-6 text-slate-600">Add one now or set it later from the Menu tab.</p>
            </div>
            <label class="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 focus-within:ring-4 focus-within:ring-brand-200">
              <Upload class="mr-2 h-4 w-4" />
              {wizardLogoDataUrl ? 'Change logo' : 'Add logo'}
              <input class="sr-only" type="file" accept="image/*" onchange={handleWizardLogoUpload} />
            </label>
          </div>

          {#if wizardLogoDataUrl}
            <div class="mt-4 flex flex-wrap items-center gap-4">
              <div class="flex h-20 w-28 items-center justify-center rounded-lg border border-slate-200 bg-white p-3">
                <img class="max-h-full max-w-full object-contain" src={wizardLogoDataUrl} alt={wizardLogoName || 'Wizard logo'} />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-slate-900">{wizardLogoName || 'Uploaded logo'}</p>
                <button class="mt-2 text-sm font-medium text-red-700 hover:text-red-800" type="button" onclick={removeWizardLogo}>
                  Remove logo
                </button>
              </div>
            </div>
          {/if}
        </div>

        <div class="rounded-lg border border-brand-100 bg-brand-50 p-4">
          <h2 class="text-base font-semibold text-brand-950">Ready to start</h2>
          <p class="mt-1 text-sm leading-6 text-brand-900">
            {wizardName.trim() || 'Untitled menu'} will use the {selectedWizardTemplate?.name ?? 'selected'} structure with the
            {stylePresets.find((preset) => preset.id === wizardStylePresetId)?.name ?? 'selected'} style.
          </p>
        </div>
      </div>
    {/if}

    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
      <button
        class="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-200"
        type="button"
        onclick={skipWizard}
      >
        Skip wizard
      </button>

      <div class="flex flex-wrap justify-end gap-2">
        {#if wizardStep !== 'basics'}
          <button
            class="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-200"
            type="button"
            onclick={() => (wizardStep = wizardStep === 'logo' ? 'style' : 'basics')}
          >
            Back
          </button>
        {/if}

        {#if wizardStep === 'basics'}
          <button
            class="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!wizardCanContinueBasics}
            type="button"
            onclick={() => (wizardStep = 'style')}
          >
            Next
          </button>
        {:else if wizardStep === 'style'}
          <button
            class="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-200"
            type="button"
            onclick={() => (wizardStep = 'logo')}
          >
            Next
          </button>
        {:else}
          <button
            class="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!wizardCanContinueBasics}
            type="button"
            onclick={completeWizard}
          >
            Create menu
          </button>
        {/if}
      </div>
    </div>
  </div>
</Modal>

<Modal bind:open={historyModalOpen} size="lg" title="Autosave history">
  <div class="space-y-4">
    <div class="flex items-start gap-3 rounded-lg border border-brand-100 bg-brand-50 p-4">
      <span class="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700 shadow-sm">
        <Clock class="h-5 w-5" />
      </span>
      <div>
        <h2 class="text-lg font-semibold text-slate-950">Restore a recent local draft</h2>
        <p class="mt-1 text-sm leading-6 text-slate-700">
          Restore points stay in this browser and are capped to the latest {maxDraftHistoryEntries} snapshots.
        </p>
      </div>
    </div>

    {#if draftHistory.length === 0}
      <div class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <p class="text-sm font-medium text-slate-900">No restore points yet.</p>
        <p class="mt-1 text-sm text-slate-600">Autosave will add snapshots as you edit this menu.</p>
      </div>
    {:else}
      <div class="grid max-h-96 gap-3 overflow-auto pr-1">
        {#each draftHistory as entry (entry.id)}
          <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" data-history-entry={entry.id}>
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 class="text-base font-semibold text-slate-950">{entry.label}</h3>
                <p class="mt-1 text-sm text-slate-600">{entry.menuName}</p>
                <p class="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                  {entry.sectionCount} section{entry.sectionCount === 1 ? '' : 's'} | {entry.itemCount} item{entry.itemCount === 1 ? '' : 's'}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm text-slate-500">{formatHistoryTimestamp(entry.savedAt)}</p>
                <Button class="mt-3" color="light" onclick={() => restoreDraftHistoryEntry(entry.id)}>
                  Restore
                </Button>
              </div>
            </div>
          </article>
        {/each}
      </div>
    {/if}
  </div>
</Modal>

<Modal bind:open={templateModalOpen} size="xl" title="Choose a template">
  <div class="space-y-5">
    <div class="flex items-start gap-3 rounded-lg border border-brand-100 bg-brand-50 p-4">
      <span class="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700 shadow-sm">
        <Sparkles class="h-5 w-5" />
      </span>
      <div>
        <h2 class="text-lg font-semibold text-slate-950">Start with a ready-made structure</h2>
        <p class="mt-1 text-sm leading-6 text-slate-700">
          Templates replace the current draft with editable sections and sample items. You can change everything after applying one.
        </p>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      {#each menuTemplates as template (template.id)}
        <article class="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm" data-template-id={template.id}>
          <div class="flex-1">
            <div class="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 class="text-base font-semibold text-slate-950">{template.name}</h3>
                <p class="mt-1 text-sm leading-6 text-slate-600">{template.description}</p>
              </div>
              <span class="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800">
                {template.sections.length} sections
              </span>
            </div>

            <dl class="grid gap-3 text-sm text-slate-600">
              <div>
                <dt class="font-medium text-slate-800">Best for</dt>
                <dd class="mt-1">{template.bestFor}</dd>
              </div>
              <div>
                <dt class="font-medium text-slate-800">Includes</dt>
                <dd class="mt-1">
                  {templateItemCount(template)} sample items across {templateSectionSummary(template)}
                </dd>
              </div>
            </dl>
          </div>

          {#if pendingTemplateId === template.id}
            <div class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p class="text-sm font-medium text-amber-950">Replace the current menu with this template?</p>
              <p class="mt-1 text-sm text-amber-800">Your current draft will be overwritten after confirmation.</p>
              <div class="mt-3 flex flex-wrap justify-end gap-2">
                <button
                  class="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-950 shadow-sm transition hover:bg-amber-100 focus:outline-none focus:ring-4 focus:ring-amber-200"
                  type="button"
                  onclick={cancelTemplateApply}
                >
                  Cancel
                </button>
                <button
                  class="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-200"
                  data-template-action={`replace-${template.id}`}
                  type="button"
                  onclick={() => applyTemplate(template)}
                >
                  <LayoutTemplate class="mr-2 h-4 w-4" />
                  Replace menu
                </button>
              </div>
            </div>
          {:else}
            <div class="mt-4 flex justify-end border-t border-slate-200 pt-4">
              <button
                class="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-200"
                data-template-action={`use-${template.id}`}
                type="button"
                onclick={() => requestTemplateApply(template)}
              >
                <LayoutTemplate class="mr-2 h-4 w-4" />
                Use template
              </button>
            </div>
          {/if}
        </article>
      {/each}
    </div>
  </div>
</Modal>

<Modal bind:open={csvImportModalOpen} size="xl" title="Import CSV">
  <div class="space-y-5">
    <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div class="flex items-start gap-3">
        <span class="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700 shadow-sm">
          <FileSpreadsheet class="h-5 w-5" />
        </span>
        <div>
          <h2 class="text-lg font-semibold text-slate-950">Import items from a spreadsheet</h2>
          <p class="mt-1 text-sm leading-6 text-slate-600">
            Use a CSV with headers for section and name. Description and price are optional.
          </p>
        </div>
      </div>

      <div class="mt-4 rounded-lg bg-white p-3 font-mono text-xs leading-5 text-slate-700 shadow-sm">
        section,name,description,price<br />
        Appetizers,Cheese Curds,Golden fried curds,9.99
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <label class="block">
        <span class="text-sm font-medium text-slate-700">CSV file</span>
        <input
          class="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-800 hover:file:bg-brand-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          type="file"
          accept=".csv,text/csv"
          onchange={handleCsvImportFile}
        />
      </label>

      {#if csvPreviewRows.length > 0}
        <button
          class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-200"
          type="button"
          onclick={resetCsvImport}
        >
          Clear
        </button>
      {/if}
    </div>

    {#if csvImportError}
      <p class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" aria-live="polite">
        {csvImportError}
      </p>
    {/if}

    {#if csvPreviewRows.length > 0}
      <div class="rounded-lg border border-slate-200 bg-white">
        <div class="border-b border-slate-200 p-4">
          <h3 class="text-base font-semibold text-slate-950">
            Preview {csvPreviewItemCount} item{csvPreviewItemCount === 1 ? '' : 's'} from {csvFileName}
          </h3>
          <p class="mt-1 text-sm text-slate-600">
            {csvPreviewSections.length} section{csvPreviewSections.length === 1 ? '' : 's'} detected:
            {csvPreviewSections.map((section) => `${section.section} (${section.itemCount})`).join(', ')}
          </p>
        </div>

        <div class="max-h-72 overflow-auto">
          <table class="w-full min-w-[42rem] text-left text-sm">
            <caption class="sr-only">CSV import preview rows</caption>
            <thead class="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th class="px-4 py-3 font-semibold">Row</th>
                <th class="px-4 py-3 font-semibold">Section</th>
                <th class="px-4 py-3 font-semibold">Name</th>
                <th class="px-4 py-3 font-semibold">Description</th>
                <th class="px-4 py-3 font-semibold">Price</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {#each csvPreviewRows as row (row.rowNumber)}
                <tr>
                  <td class="whitespace-nowrap px-4 py-3 text-slate-500">{row.rowNumber}</td>
                  <td class="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{row.section}</td>
                  <td class="px-4 py-3 text-slate-800">{row.name}</td>
                  <td class="px-4 py-3 text-slate-600">{row.description || '-'}</td>
                  <td class="whitespace-nowrap px-4 py-3 text-slate-800">{row.price || '-'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      <fieldset class="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <legend class="px-1 text-sm font-medium text-slate-700">Import behavior</legend>
        <div class="mt-2 grid gap-3 sm:grid-cols-2">
          <label class="flex gap-3 rounded-lg border border-slate-200 bg-white p-3">
            <input class="mt-1 h-4 w-4 accent-brand-600" type="radio" bind:group={csvImportMode} value="append" />
            <span>
              <span class="block text-sm font-medium text-slate-900">Append to menu</span>
              <span class="mt-1 block text-sm text-slate-600">Add rows to matching sections or create new ones.</span>
            </span>
          </label>

          <label class="flex gap-3 rounded-lg border border-slate-200 bg-white p-3">
            <input class="mt-1 h-4 w-4 accent-brand-600" type="radio" bind:group={csvImportMode} value="replace" />
            <span>
              <span class="block text-sm font-medium text-slate-900">Replace menu sections</span>
              <span class="mt-1 block text-sm text-slate-600">Clear current sections and use only this CSV.</span>
            </span>
          </label>
        </div>
      </fieldset>
    {/if}

    <div class="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
      <button
        class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-200"
        type="button"
        onclick={() => (csvImportModalOpen = false)}
      >
        Cancel
      </button>
      <button
        class="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        disabled={csvPreviewRows.length === 0}
        onclick={applyCsvImport}
      >
        <FileSpreadsheet class="mr-2 h-4 w-4" />
        Apply CSV
      </button>
    </div>
  </div>
</Modal>

<Modal bind:open={sectionModalOpen} size="sm" title="Add section">
  <form
    class="space-y-4"
    onsubmit={(event) => {
      event.preventDefault();
      addSection();
    }}
  >
    <label class="block">
      <span class="text-sm font-medium text-slate-700">Section name</span>
      <input
        class="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        bind:value={newSectionName}
        placeholder="Breakfast, drinks, desserts..."
      />
    </label>

    <div class="flex justify-end gap-2">
      <Button color="light" type="button" onclick={() => (sectionModalOpen = false)}>Cancel</Button>
      <Button disabled={!canCreateSection} type="submit">
        <Plus class="mr-2 h-4 w-4" />
        Add section
      </Button>
    </div>
  </form>
</Modal>

<a class="skip-link" href="#menu-editor">Skip to menu editor</a>

{#snippet photoSettingsControls(settings: ItemImageSettings)}
  <div class="grid gap-4">
    <div class="grid gap-4 sm:grid-cols-2">
      <fieldset>
        <legend class="text-sm font-medium text-slate-700">Photo fit</legend>
        <div class="mt-2 grid grid-cols-2 rounded-lg border border-slate-300 bg-white p-1">
          {#each logoFitOptions as fit (fit)}
            <button
              aria-pressed={settings.fit === fit}
              class={`rounded-md px-3 py-2 text-sm font-medium capitalize transition ${
                settings.fit === fit ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
              type="button"
              onclick={() => (settings.fit = fit)}
            >
              {fit}
            </button>
          {/each}
        </div>
      </fieldset>

      <fieldset>
        <legend class="text-sm font-medium text-slate-700">Photo shape</legend>
        <div class="mt-2 grid grid-cols-4 rounded-lg border border-slate-300 bg-white p-1">
          {#each itemImageShapeOptions as option (option.value)}
            <button
              aria-pressed={settings.shape === option.value}
              class={`rounded-md px-2 py-2 text-sm font-medium transition ${
                settings.shape === option.value ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
              type="button"
              onclick={() => (settings.shape = option.value)}
            >
              {option.label}
            </button>
          {/each}
        </div>
      </fieldset>
    </div>

    <div class="grid gap-3 sm:grid-cols-3">
      <label class="block">
        <span class="flex items-center justify-between gap-2 text-sm font-medium text-slate-700">
          Zoom
          <span class="text-xs font-semibold text-slate-500">{Math.round(settings.scale)}%</span>
        </span>
        <input
          class="mt-2 block w-full accent-brand-600"
          max="250"
          min="100"
          step="5"
          type="range"
          value={settings.scale}
          oninput={(event) => (settings.scale = Number(event.currentTarget.value))}
        />
      </label>

      <label class="block">
        <span class="flex items-center justify-between gap-2 text-sm font-medium text-slate-700">
          Focus X
          <span class="text-xs font-semibold text-slate-500">{Math.round(settings.focalX)}</span>
        </span>
        <input
          class="mt-2 block w-full accent-brand-600"
          max="50"
          min="-50"
          step="5"
          type="range"
          value={settings.focalX}
          oninput={(event) => (settings.focalX = Number(event.currentTarget.value))}
        />
      </label>

      <label class="block">
        <span class="flex items-center justify-between gap-2 text-sm font-medium text-slate-700">
          Focus Y
          <span class="text-xs font-semibold text-slate-500">{Math.round(settings.focalY)}</span>
        </span>
        <input
          class="mt-2 block w-full accent-brand-600"
          max="50"
          min="-50"
          step="5"
          type="range"
          value={settings.focalY}
          oninput={(event) => (settings.focalY = Number(event.currentTarget.value))}
        />
      </label>
    </div>
  </div>
{/snippet}

<main class="app-shell flex h-screen min-h-0 flex-col overflow-hidden">
  <header
    class="editor-topbar shrink-0 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-5"
  >
    <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div class="flex min-w-0 items-center gap-3">
        <span class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
          <Utensils class="h-5 w-5" />
        </span>
        <div class="min-w-0">
          <div class="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">MenuMaker</div>
          <h1 class="truncate text-lg font-semibold text-slate-950 sm:text-xl">{menu.name || 'Untitled menu'}</h1>
        </div>
      </div>

      <div class="flex min-w-0 flex-col gap-2 lg:items-end">
        <div class="editor-command-group grid w-full max-w-full grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-end">
          <button
            class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-45 sm:px-4"
            type="button"
            aria-label="Undo last edit"
            title="Undo (Ctrl+Z)"
            disabled={!canUndo}
            onclick={undoMenuChange}
          >
            <Undo2 class="h-4 w-4 sm:mr-2" />
            <span class="hidden sm:inline">Undo</span>
          </button>
          <button
            class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-45 sm:px-4"
            type="button"
            aria-label="Redo edit"
            title="Redo (Ctrl+Y)"
            disabled={!canRedo}
            onclick={redoMenuChange}
          >
            <Redo2 class="h-4 w-4 sm:mr-2" />
            <span class="hidden sm:inline">Redo</span>
          </button>
          <button
            class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-200 sm:px-4"
            type="button"
            aria-label="Open autosave history"
            title="History"
            onclick={() => (historyModalOpen = true)}
          >
            <Clock class="h-4 w-4 sm:mr-2" />
            <span class="hidden sm:inline">History</span>
          </button>
          <button
            class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-200 sm:px-4"
            type="button"
            aria-label="Open menu wizard"
            title="Wizard"
            onclick={openWizard}
          >
            <Sparkles class="h-4 w-4 sm:mr-2" />
            <span class="hidden sm:inline">Wizard</span>
          </button>
          <button
            class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-200 sm:px-4"
            type="button"
            aria-label="Open templates"
            title="Templates"
            onclick={openTemplateModal}
          >
            <LayoutTemplate class="h-4 w-4 sm:mr-2" />
            <span class="hidden sm:inline">Templates</span>
          </button>
          <button
            class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-200 sm:px-4"
            type="button"
            aria-label="Export draft"
            title="Export"
            onclick={exportDraft}
          >
            <Download class="h-4 w-4 sm:mr-2" />
            <span class="hidden sm:inline">Export</span>
          </button>
          <button
            class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-200 sm:px-4"
            type="button"
            aria-label="Import CSV"
            title="CSV"
            onclick={openCsvImportModal}
          >
            <FileSpreadsheet class="h-4 w-4 sm:mr-2" />
            <span class="hidden sm:inline">CSV</span>
          </button>
          <label
            class="inline-flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100 focus-within:ring-4 focus-within:ring-brand-200 sm:px-4"
            aria-label="Import draft"
            title="Import"
          >
            <Upload class="h-4 w-4 sm:mr-2" />
            <span class="hidden sm:inline">Import</span>
            <input class="sr-only" type="file" accept=".json,application/json" onchange={handleDraftImport} />
          </label>
          <button
            class="print-command inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-200 sm:px-4"
            type="button"
            aria-label="Print menu"
            title="Print"
            onclick={printMenu}
          >
            <Printer class="h-4 w-4 sm:mr-2" />
            <span class="hidden sm:inline">Print</span>
          </button>
          <button
            class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-200 sm:px-4"
            type="button"
            aria-label="Reset menu"
            title="Reset"
            onclick={resetMenu}
          >
            <RotateCcw class="h-4 w-4 sm:mr-2" />
            <span class="hidden sm:inline">Reset</span>
          </button>
        </div>

        <p class="max-w-xl text-left text-xs font-medium text-slate-500 lg:text-right" aria-live="polite">
          {autosaveStatus}
        </p>

        {#if draftFileError || draftFileStatus}
          <p
            class={`max-w-xl text-left text-sm lg:text-right ${draftFileError ? 'text-red-700' : 'text-slate-600'}`}
            aria-live="polite"
          >
            {draftFileError || draftFileStatus}
          </p>
        {/if}
      </div>
    </div>
  </header>

  {#if showRecoveryNotice}
    <div class="mx-3 mt-3 rounded-lg border border-brand-200 bg-brand-50 p-4 shadow-sm xl:mx-5" role="status">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-sm font-semibold text-brand-950">Recovered autosaved draft</h2>
          <p class="mt-1 text-sm leading-6 text-brand-900">
            Your last local draft was restored in this browser. Use History to restore an earlier snapshot.
          </p>
        </div>
        <button
          class="inline-flex min-h-9 items-center justify-center rounded-lg border border-brand-200 bg-white px-3 text-sm font-medium text-brand-900 shadow-sm transition hover:bg-brand-100 focus:outline-none focus:ring-4 focus:ring-brand-200"
          type="button"
          onclick={() => (showRecoveryNotice = false)}
        >
          Dismiss
        </button>
      </div>
    </div>
  {/if}

  <div
    class="mobile-view-switch mx-3 mt-3 grid shrink-0 grid-cols-2 rounded-lg border border-slate-200 bg-white p-1 shadow-sm xl:hidden"
    role="group"
    aria-label="Choose editor or preview view"
  >
    <button
      class={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-brand-200 ${
        mobileView === 'editor' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'
      }`}
      type="button"
      aria-controls="menu-editor"
      aria-pressed={mobileView === 'editor'}
      onclick={() => (mobileView = 'editor')}
    >
      <Pencil class="h-4 w-4" />
      Editor
    </button>
    <button
      class={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-brand-200 ${
        mobileView === 'preview' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'
      }`}
      type="button"
      aria-controls="menu-preview"
      aria-pressed={mobileView === 'preview'}
      onclick={() => (mobileView = 'preview')}
    >
      <Eye class="h-4 w-4" />
      Preview
    </button>
  </div>

  <div
    class={`app-layout grid min-h-0 flex-1 gap-3 overflow-hidden p-3 xl:grid-rows-1 xl:gap-0 xl:p-0 ${
      mobileView === 'preview' ? 'grid-rows-1' : 'grid-rows-[auto_minmax(0,1fr)]'
    }`}
  >
    <nav
      class={`editor-tool-rail grid shrink-0 grid-cols-5 gap-2 rounded-lg border border-slate-200 bg-white/90 p-2 shadow-sm xl:flex xl:h-full xl:flex-col xl:rounded-none xl:border-y-0 xl:border-l-0 xl:border-r xl:shadow-none ${
        mobileView === 'preview' ? 'hidden xl:flex' : ''
      }`}
      aria-label="Editor tools"
    >
      {#each editorPanels as panel (panel.id)}
        <button
          class={`group flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-semibold transition focus:outline-none focus:ring-4 focus:ring-brand-200 xl:text-sm ${
            activeEditorPanel === panel.id
              ? 'border-brand-600 bg-brand-50 text-brand-800 shadow-sm'
              : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950'
          }`}
          data-editor-panel={panel.id}
          type="button"
          aria-label={`${panel.label}: ${panel.description}`}
          aria-pressed={activeEditorPanel === panel.id}
          title={panel.description}
          onclick={() => (activeEditorPanel = panel.id)}
        >
          {#if panel.id === 'menu'}
            <Pencil class="h-5 w-5" />
          {:else if panel.id === 'sections'}
            <Utensils class="h-5 w-5" />
          {:else if panel.id === 'design'}
            <Palette class="h-5 w-5" />
          {:else if panel.id === 'print'}
            <FileText class="h-5 w-5" />
          {:else}
            <MapPin class="h-5 w-5" />
          {/if}
          <span>{panel.label}</span>
        </button>
      {/each}
    </nav>

    <section
      id="menu-editor"
      class={`menu-editor editor-inspector h-full min-h-0 space-y-5 overflow-y-auto xl:border-r xl:border-slate-200 xl:bg-slate-50 xl:p-5 ${
        mobileView === 'preview' ? 'hidden xl:block' : ''
      }`}
      aria-label="Menu editor"
    >
      {#if activeEditorPanel === 'menu'}
      <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-start gap-3">
          <span class="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Pencil class="h-5 w-5" />
          </span>
          <div>
            <h2 class="text-xl font-semibold text-slate-950">Menu details</h2>
            <p class="mt-1 text-sm text-slate-600">Set the name, subtitle, top text, and logo for this menu.</p>
          </div>
        </div>

        <div class="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold text-slate-950">Menu variants</h3>
              <p class="mt-1 text-sm leading-6 text-slate-600">
                Make breakfast, lunch, dinner, drinks, or catering menus from one shared restaurant profile.
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <Button color="light" onclick={addVariant}>
                <Plus class="mr-2 h-4 w-4" />
                Add
              </Button>
              <Button color="light" onclick={duplicateActiveVariant}>
                <Copy class="mr-2 h-4 w-4" />
                Duplicate
              </Button>
              <Button color="red" disabled={menu.variants.length <= 1} onclick={removeActiveVariant}>
                <Trash2 class="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          <div class="mt-4 grid gap-2">
            {#each menu.variants as variant, variantIndex (variant.id)}
              <button
                aria-pressed={variant.id === menu.activeVariantId}
                class={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition focus:outline-none focus:ring-4 focus:ring-brand-200 ${
                  variant.id === menu.activeVariantId
                    ? 'border-brand-600 bg-white text-brand-950 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950'
                }`}
                type="button"
                onclick={() => selectVariant(variant.id)}
              >
                <span class="min-w-0">
                  <span class="block truncate text-sm font-semibold">
                    {variant.id === menu.activeVariantId ? menu.name || 'Untitled menu' : variant.name || 'Untitled menu'}
                  </span>
                  <span class="mt-0.5 block text-xs text-slate-500">
                    {variant.id === menu.activeVariantId
                      ? `${menu.sections.length} section${menu.sections.length === 1 ? '' : 's'}`
                      : `${variant.sections.length} section${variant.sections.length === 1 ? '' : 's'}`}
                  </span>
                </span>
                <span class="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                  {variantIndex + 1}
                </span>
              </button>
            {/each}
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block sm:col-span-2">
            <span class="text-sm font-medium text-slate-700">Small top text</span>
            <input
              class="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              bind:value={menu.eyebrow}
              placeholder="Leave blank to hide"
            />
          </label>

          <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div class="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Image class="h-4 w-4" />
                  Logo
                </div>
                <p class="mt-1 text-sm text-slate-600">
                  Add a logo and choose where it appears near the small top text.
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <label
                  class="inline-flex cursor-pointer items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 focus-within:ring-4 focus-within:ring-brand-200"
                >
                  <input class="sr-only" type="file" accept="image/*" onchange={handleLogoUpload} />
                  {menu.logoDataUrl ? 'Change logo' : 'Add logo'}
                </label>

                {#if menu.logoDataUrl}
                  <Button color="light" onclick={removeLogo}>
                    <X class="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                {/if}
              </div>
            </div>

            {#if menu.logoDataUrl}
              <div class="mt-4 grid gap-4 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
                <div class="flex h-28 w-36 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-3">
                  <img
                    class="h-full w-full"
                    src={menu.logoDataUrl}
                    alt={menu.logoAlt || menu.logoName || 'Menu logo'}
                    style={logoImageStyle}
                  />
                </div>

                <div class="grid gap-4">
                  <label class="block">
                    <span class="text-sm font-medium text-slate-700">Logo description</span>
                    <input
                      class="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                      bind:value={menu.logoAlt}
                      placeholder="Alt text for exports and screen readers"
                    />
                  </label>

                  <fieldset>
                    <legend class="text-sm font-medium text-slate-700">Logo position</legend>
                    <div class="mt-3 grid max-w-md grid-cols-3 gap-2">
                      <div></div>
                      <button
                        aria-pressed={menu.logoPlacement === 'above-eyebrow'}
                        class={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                          menu.logoPlacement === 'above-eyebrow'
                            ? 'border-brand-600 bg-brand-50 text-brand-800'
                            : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-950'
                        }`}
                        type="button"
                        onclick={() => (menu.logoPlacement = 'above-eyebrow')}
                      >
                        Above
                      </button>
                      <div></div>

                      <button
                        aria-pressed={menu.logoPlacement === 'left-eyebrow'}
                        class={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                          menu.logoPlacement === 'left-eyebrow'
                            ? 'border-brand-600 bg-brand-50 text-brand-800'
                            : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-950'
                        }`}
                        type="button"
                        onclick={() => (menu.logoPlacement = 'left-eyebrow')}
                      >
                        Left
                      </button>

                      <div class="flex min-h-20 items-center justify-center rounded-lg border border-slate-300 bg-white p-3 text-center">
                        <span class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                          Small top text
                        </span>
                      </div>

                      <button
                        aria-pressed={menu.logoPlacement === 'right-eyebrow'}
                        class={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                          menu.logoPlacement === 'right-eyebrow'
                            ? 'border-brand-600 bg-brand-50 text-brand-800'
                            : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-950'
                        }`}
                        type="button"
                        onclick={() => (menu.logoPlacement = 'right-eyebrow')}
                      >
                        Right
                      </button>

                      <div></div>
                      <button
                        aria-pressed={menu.logoPlacement === 'below-eyebrow'}
                        class={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                          menu.logoPlacement === 'below-eyebrow'
                            ? 'border-brand-600 bg-brand-50 text-brand-800'
                            : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-950'
                        }`}
                        type="button"
                        onclick={() => (menu.logoPlacement = 'below-eyebrow')}
                      >
                        Below
                      </button>
                      <div></div>
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend class="text-sm font-medium text-slate-700">Logo fit</legend>
                    <div class="mt-2 grid grid-cols-2 rounded-lg border border-slate-300 bg-white p-1">
                      {#each logoFitOptions as fit}
                        <button
                          aria-pressed={menu.logoFit === fit}
                          class={`rounded-md px-3 py-2 text-sm font-medium capitalize transition ${
                            menu.logoFit === fit ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                          type="button"
                          onclick={() => (menu.logoFit = fit)}
                        >
                          {fit}
                        </button>
                      {/each}
                    </div>
                  </fieldset>

                  <div class="grid gap-3 sm:grid-cols-3">
                    <label class="block">
                      <span class="flex items-center justify-between gap-2 text-sm font-medium text-slate-700">
                        Scale
                        <span class="text-xs font-semibold text-slate-500">{Math.round(menu.logoScale)}%</span>
                      </span>
                      <input
                        class="mt-2 block w-full accent-brand-600"
                        max="200"
                        min="40"
                        step="5"
                        type="range"
                        value={menu.logoScale}
                        oninput={(event) => (menu.logoScale = Number(event.currentTarget.value))}
                      />
                    </label>

                    <label class="block">
                      <span class="flex items-center justify-between gap-2 text-sm font-medium text-slate-700">
                        Focus X
                        <span class="text-xs font-semibold text-slate-500">{Math.round(menu.logoOffsetX)}</span>
                      </span>
                      <input
                        class="mt-2 block w-full accent-brand-600"
                        max="50"
                        min="-50"
                        step="5"
                        type="range"
                        value={menu.logoOffsetX}
                        oninput={(event) => (menu.logoOffsetX = Number(event.currentTarget.value))}
                      />
                    </label>

                    <label class="block">
                      <span class="flex items-center justify-between gap-2 text-sm font-medium text-slate-700">
                        Focus Y
                        <span class="text-xs font-semibold text-slate-500">{Math.round(menu.logoOffsetY)}</span>
                      </span>
                      <input
                        class="mt-2 block w-full accent-brand-600"
                        max="50"
                        min="-50"
                        step="5"
                        type="range"
                        value={menu.logoOffsetY}
                        oninput={(event) => (menu.logoOffsetY = Number(event.currentTarget.value))}
                      />
                    </label>
                  </div>
                </div>
              </div>
            {/if}
          </div>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Menu name</span>
            <input
              class="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              bind:value={menu.name}
              placeholder="Restaurant or menu name"
            />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-slate-700">Subtitle</span>
            <input
              class="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              bind:value={menu.subtitle}
              placeholder="Short menu description"
            />
          </label>
        </div>
      </div>

      {:else if activeEditorPanel === 'design'}
      <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-start gap-3">
          <span class="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Palette class="h-5 w-5" />
          </span>
          <div>
            <h2 class="text-xl font-semibold text-slate-950">Style preset</h2>
            <p class="mt-1 text-sm text-slate-600">Apply a complete visual style without changing menu content.</p>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          {#each stylePresets as preset (preset.id)}
            <button
              class={`flex min-h-24 items-start gap-3 rounded-lg border p-4 text-left shadow-sm transition focus:outline-none focus:ring-4 focus:ring-brand-200 ${
                menu.stylePresetId === preset.id
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
              data-style-preset={preset.id}
              type="button"
              aria-pressed={menu.stylePresetId === preset.id}
              onclick={() => applyStylePreset(preset.id)}
            >
              <span
                class="mt-1 h-7 w-7 shrink-0 rounded-full border border-white shadow ring-1 ring-slate-200"
                style={`background: ${preset.swatch};`}
                aria-hidden="true"
              ></span>
              <span>
                <span class="block text-sm font-semibold text-slate-950">{preset.name}</span>
                <span class="mt-1 block text-sm leading-6 text-slate-600">{preset.description}</span>
              </span>
            </button>
          {/each}
        </div>
      </div>

      <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-start gap-3">
          <span class="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Sparkles class="h-5 w-5" />
          </span>
          <div>
            <h2 class="text-xl font-semibold text-slate-950">Custom theme</h2>
            <p class="mt-1 text-sm text-slate-600">Tune colors, font styles, and section dividers.</p>
          </div>
        </div>

        <div class="grid gap-5">
          <fieldset>
            <legend class="text-sm font-semibold text-slate-900">Colors</legend>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              {#each designColorControls as control (control.setting)}
                <label class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <span class="flex items-start justify-between gap-3">
                    <span>
                      <span class="block text-sm font-medium text-slate-800">{control.label}</span>
                      <span class="mt-1 block text-xs leading-5 text-slate-500">{control.description}</span>
                    </span>
                    <span
                      class="h-8 w-8 shrink-0 rounded-full border border-white shadow ring-1 ring-slate-200"
                      style={`background: ${
                        control.setting === 'accentColor'
                          ? activeAccentColor
                          : control.setting === 'backgroundColor'
                            ? activeBackgroundColor
                            : control.setting === 'textColor'
                              ? activeTextColor
                              : control.setting === 'mutedColor'
                                ? activeMutedColor
                                : activeRuleColor
                      };`}
                      aria-hidden="true"
                    ></span>
                  </span>
                  <input
                    class="mt-3 h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                    data-design-color={control.setting}
                    type="color"
                    value={control.setting === 'accentColor'
                      ? activeAccentColor
                      : control.setting === 'backgroundColor'
                        ? activeBackgroundColor
                        : control.setting === 'textColor'
                          ? activeTextColor
                          : control.setting === 'mutedColor'
                            ? activeMutedColor
                            : activeRuleColor}
                    oninput={(event) => updateDesignColor(control.setting, event.currentTarget.value)}
                  />
                </label>
              {/each}
            </div>
          </fieldset>

          <fieldset>
            <legend class="text-sm font-semibold text-slate-900">Heading font</legend>
            <div class="mt-3 grid grid-cols-2 rounded-lg border border-slate-300 bg-white p-1 sm:grid-cols-4">
              {#each headingFontOptions as option (option.value)}
                <button
                  aria-pressed={menu.designSettings.headingFont === option.value}
                  class={`min-h-10 rounded-md px-3 py-2 text-sm font-medium transition ${
                    menu.designSettings.headingFont === option.value
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  data-design-font={`heading-${option.value}`}
                  type="button"
                  onclick={() => (menu.designSettings.headingFont = option.value)}
                >
                  {option.label}
                </button>
              {/each}
            </div>
          </fieldset>

          <fieldset>
            <legend class="text-sm font-semibold text-slate-900">Body font</legend>
            <div class="mt-3 grid grid-cols-3 rounded-lg border border-slate-300 bg-white p-1">
              {#each bodyFontOptions as option (option.value)}
                <button
                  aria-pressed={menu.designSettings.bodyFont === option.value}
                  class={`min-h-10 rounded-md px-3 py-2 text-sm font-medium transition ${
                    menu.designSettings.bodyFont === option.value
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  data-design-font={`body-${option.value}`}
                  type="button"
                  onclick={() => (menu.designSettings.bodyFont = option.value)}
                >
                  {option.label}
                </button>
              {/each}
            </div>
          </fieldset>

          <fieldset>
            <legend class="text-sm font-semibold text-slate-900">Alignment</legend>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <span class="text-xs font-medium uppercase text-slate-500">Header</span>
                <div class="mt-2 grid grid-cols-3 rounded-lg border border-slate-300 bg-white p-1">
                  {#each textAlignOptions as option (option.value)}
                    <button
                      aria-pressed={menu.designSettings.headerAlign === option.value}
                      class={`min-h-10 rounded-md px-3 py-2 text-sm font-medium transition ${
                        menu.designSettings.headerAlign === option.value
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      type="button"
                      onclick={() => (menu.designSettings.headerAlign = option.value)}
                    >
                      {option.label}
                    </button>
                  {/each}
                </div>
              </div>

              <div>
                <span class="text-xs font-medium uppercase text-slate-500">Section headings</span>
                <div class="mt-2 grid grid-cols-3 rounded-lg border border-slate-300 bg-white p-1">
                  {#each textAlignOptions as option (option.value)}
                    <button
                      aria-pressed={menu.designSettings.sectionHeadingAlign === option.value}
                      class={`min-h-10 rounded-md px-3 py-2 text-sm font-medium transition ${
                        menu.designSettings.sectionHeadingAlign === option.value
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      type="button"
                      onclick={() => (menu.designSettings.sectionHeadingAlign = option.value)}
                    >
                      {option.label}
                    </button>
                  {/each}
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend class="text-sm font-semibold text-slate-900">Text weights</legend>
            <div class="mt-3 grid gap-3">
              {#each typographyWeightControls as control (control.setting)}
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span class="text-sm font-medium text-slate-800">{control.label}</span>
                  <div class="mt-2 grid grid-cols-4 rounded-lg border border-slate-300 bg-white p-1">
                    {#each fontWeightOptions as option (option.value)}
                      <button
                        aria-pressed={menu.designSettings[control.setting] === option.value}
                        class={`min-h-9 rounded-md px-2 py-1.5 text-xs font-medium transition ${
                          menu.designSettings[control.setting] === option.value
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        type="button"
                        onclick={() => (menu.designSettings[control.setting] = option.value)}
                      >
                        {option.label}
                      </button>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          </fieldset>

          <fieldset>
            <legend class="text-sm font-semibold text-slate-900">Text case and spacing</legend>
            <div class="mt-3 grid gap-4">
              {#each textTransformControls as control (control.setting)}
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span class="text-sm font-medium text-slate-800">{control.label}</span>
                  <div class="mt-2 grid grid-cols-4 rounded-lg border border-slate-300 bg-white p-1">
                    {#each textTransformOptions as option (option.value)}
                      <button
                        aria-pressed={menu.designSettings[control.setting] === option.value}
                        class={`min-h-9 rounded-md px-2 py-1.5 text-xs font-medium transition ${
                          menu.designSettings[control.setting] === option.value
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        type="button"
                        onclick={() => (menu.designSettings[control.setting] = option.value)}
                      >
                        {option.label}
                      </button>
                    {/each}
                  </div>
                </div>
              {/each}

              <div class="grid gap-3 sm:grid-cols-2">
                <label class="block rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span class="flex items-center justify-between gap-2 text-sm font-medium text-slate-800">
                    Title letter spacing
                    <span class="text-xs font-semibold text-slate-500">{Math.round(menu.designSettings.titleLetterSpacingScale)}%</span>
                  </span>
                  <input
                    class="mt-3 block w-full accent-brand-600"
                    max="200"
                    min="0"
                    step="5"
                    type="range"
                    value={menu.designSettings.titleLetterSpacingScale}
                    oninput={(event) => (menu.designSettings.titleLetterSpacingScale = Number(event.currentTarget.value))}
                  />
                </label>

                <label class="block rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span class="flex items-center justify-between gap-2 text-sm font-medium text-slate-800">
                    Section letter spacing
                    <span class="text-xs font-semibold text-slate-500">{Math.round(menu.designSettings.sectionLetterSpacingScale)}%</span>
                  </span>
                  <input
                    class="mt-3 block w-full accent-brand-600"
                    max="200"
                    min="0"
                    step="5"
                    type="range"
                    value={menu.designSettings.sectionLetterSpacingScale}
                    oninput={(event) => (menu.designSettings.sectionLetterSpacingScale = Number(event.currentTarget.value))}
                  />
                </label>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend class="text-sm font-semibold text-slate-900">Item and price layout</legend>
            <div class="mt-3 grid gap-4">
              <div>
                <span class="text-xs font-medium uppercase text-slate-500">Default item layout</span>
                <div class="mt-2 grid grid-cols-2 rounded-lg border border-slate-300 bg-white p-1 sm:grid-cols-5">
                  {#each itemLayoutOptions as option (option.value)}
                    <button
                      aria-pressed={menu.designSettings.itemLayout === option.value}
                      class={`min-h-10 rounded-md px-2 py-2 text-sm font-medium transition ${
                        menu.designSettings.itemLayout === option.value
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      type="button"
                      onclick={() => (menu.designSettings.itemLayout = option.value)}
                    >
                      {option.label}
                    </button>
                  {/each}
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-3">
                <div>
                  <span class="text-xs font-medium uppercase text-slate-500">Price style</span>
                  <div class="mt-2 grid grid-cols-2 rounded-lg border border-slate-300 bg-white p-1">
                    {#each priceCurrencyOptions as option (option.value)}
                      <button
                        aria-pressed={menu.designSettings.priceCurrencyStyle === option.value}
                        class={`min-h-10 rounded-md px-3 py-2 text-sm font-medium transition ${
                          menu.designSettings.priceCurrencyStyle === option.value
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        type="button"
                        onclick={() => (menu.designSettings.priceCurrencyStyle = option.value)}
                      >
                        {option.label}
                      </button>
                    {/each}
                  </div>
                </div>

                <div>
                  <span class="text-xs font-medium uppercase text-slate-500">Decimals</span>
                  <div class="mt-2 grid grid-cols-3 rounded-lg border border-slate-300 bg-white p-1">
                    {#each priceDecimalOptions as option (option.value)}
                      <button
                        aria-pressed={menu.designSettings.priceDecimalStyle === option.value}
                        class={`min-h-10 rounded-md px-2 py-2 text-sm font-medium transition ${
                          menu.designSettings.priceDecimalStyle === option.value
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        type="button"
                        onclick={() => (menu.designSettings.priceDecimalStyle = option.value)}
                      >
                        {option.label}
                      </button>
                    {/each}
                  </div>
                </div>

                <div>
                  <span class="text-xs font-medium uppercase text-slate-500">Description indent</span>
                  <div class="mt-2 grid grid-cols-3 rounded-lg border border-slate-300 bg-white p-1">
                    {#each descriptionIndentOptions as option (option.value)}
                      <button
                        aria-pressed={menu.designSettings.descriptionIndent === option.value}
                        class={`min-h-10 rounded-md px-2 py-2 text-sm font-medium transition ${
                          menu.designSettings.descriptionIndent === option.value
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        type="button"
                        onclick={() => (menu.designSettings.descriptionIndent = option.value)}
                      >
                        {option.label}
                      </button>
                    {/each}
                  </div>
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <span class="text-xs font-medium uppercase text-slate-500">Size display</span>
                  <div class="mt-2 grid grid-cols-2 rounded-lg border border-slate-300 bg-white p-1">
                    {#each sizeDisplayOptions as option (option.value)}
                      <button
                        aria-pressed={menu.designSettings.sizeDisplay === option.value}
                        class={`min-h-10 rounded-md px-3 py-2 text-sm font-medium transition ${
                          menu.designSettings.sizeDisplay === option.value
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        type="button"
                        onclick={() => (menu.designSettings.sizeDisplay = option.value)}
                      >
                        {option.label}
                      </button>
                    {/each}
                  </div>
                </div>

                <div>
                  <span class="text-xs font-medium uppercase text-slate-500">Modifier display</span>
                  <div class="mt-2 grid grid-cols-2 rounded-lg border border-slate-300 bg-white p-1">
                    {#each modifierDisplayOptions as option (option.value)}
                      <button
                        aria-pressed={menu.designSettings.modifierDisplay === option.value}
                        class={`min-h-10 rounded-md px-3 py-2 text-sm font-medium transition ${
                          menu.designSettings.modifierDisplay === option.value
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        type="button"
                        onclick={() => (menu.designSettings.modifierDisplay = option.value)}
                      >
                        {option.label}
                      </button>
                    {/each}
                  </div>
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend class="text-sm font-semibold text-slate-900">Divider style</legend>
            <div class="mt-3 grid grid-cols-2 rounded-lg border border-slate-300 bg-white p-1 sm:grid-cols-5">
              {#each dividerStyleOptions as option (option.value)}
                <button
                  aria-pressed={menu.designSettings.dividerStyle === option.value}
                  class={`min-h-10 rounded-md px-3 py-2 text-sm font-medium transition ${
                    menu.designSettings.dividerStyle === option.value
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  data-design-divider={option.value}
                  type="button"
                  onclick={() => (menu.designSettings.dividerStyle = option.value)}
                >
                  {option.label}
                </button>
              {/each}
            </div>
          </fieldset>
        </div>
      </div>

      <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-start gap-3">
          <span class="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Sparkles class="h-5 w-5" />
          </span>
          <div>
            <h2 class="text-xl font-semibold text-slate-950">Borders and flair</h2>
            <p class="mt-1 text-sm text-slate-600">Add printable borders, corner accents, top ornaments, and subtle paper effects.</p>
          </div>
        </div>

        <div class="grid gap-5">
          <fieldset>
            <legend class="text-sm font-semibold text-slate-900">Menu border</legend>
            <div class="mt-3 grid grid-cols-2 rounded-lg border border-slate-300 bg-white p-1 sm:grid-cols-5">
              {#each borderStyleOptions as option (option.value)}
                <button
                  aria-pressed={menu.designSettings.borderStyle === option.value}
                  class={`min-h-10 rounded-md px-3 py-2 text-sm font-medium transition ${
                    menu.designSettings.borderStyle === option.value
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  data-design-border={option.value}
                  type="button"
                  onclick={() => (menu.designSettings.borderStyle = option.value)}
                >
                  {option.label}
                </button>
              {/each}
            </div>
          </fieldset>

          <fieldset>
            <legend class="text-sm font-semibold text-slate-900">Corner accents</legend>
            <div class="mt-3 grid grid-cols-3 rounded-lg border border-slate-300 bg-white p-1">
              {#each cornerStyleOptions as option (option.value)}
                <button
                  aria-pressed={menu.designSettings.cornerStyle === option.value}
                  class={`min-h-10 rounded-md px-3 py-2 text-sm font-medium transition ${
                    menu.designSettings.cornerStyle === option.value
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  data-design-corners={option.value}
                  type="button"
                  onclick={() => (menu.designSettings.cornerStyle = option.value)}
                >
                  {option.label}
                </button>
              {/each}
            </div>
          </fieldset>

          <fieldset>
            <legend class="text-sm font-semibold text-slate-900">Header ornament</legend>
            <div class="mt-3 grid grid-cols-3 rounded-lg border border-slate-300 bg-white p-1">
              {#each headerFlairOptions as option (option.value)}
                <button
                  aria-pressed={menu.designSettings.headerFlair === option.value}
                  class={`min-h-10 rounded-md px-3 py-2 text-sm font-medium transition ${
                    menu.designSettings.headerFlair === option.value
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  data-design-header-flair={option.value}
                  type="button"
                  onclick={() => (menu.designSettings.headerFlair = option.value)}
                >
                  {option.label}
                </button>
              {/each}
            </div>
          </fieldset>

          <div class="grid gap-5 xl:grid-cols-2">
            <fieldset>
              <legend class="text-sm font-semibold text-slate-900">Watermark</legend>
              <div class="mt-3 grid grid-cols-2 rounded-lg border border-slate-300 bg-white p-1">
                {#each watermarkStyleOptions as option (option.value)}
                  <button
                    aria-pressed={menu.designSettings.watermarkStyle === option.value}
                    class={`min-h-10 rounded-md px-3 py-2 text-sm font-medium transition ${
                      menu.designSettings.watermarkStyle === option.value
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    data-design-watermark={option.value}
                    type="button"
                    onclick={() => (menu.designSettings.watermarkStyle = option.value)}
                  >
                    {option.label}
                  </button>
                {/each}
              </div>
            </fieldset>

            <fieldset>
              <legend class="text-sm font-semibold text-slate-900">Paper effect</legend>
              <div class="mt-3 grid grid-cols-2 rounded-lg border border-slate-300 bg-white p-1">
                {#each paperTextureOptions as option (option.value)}
                  <button
                    aria-pressed={menu.designSettings.paperTexture === option.value}
                    class={`min-h-10 rounded-md px-3 py-2 text-sm font-medium transition ${
                      menu.designSettings.paperTexture === option.value
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    data-design-paper={option.value}
                    type="button"
                    onclick={() => (menu.designSettings.paperTexture = option.value)}
                  >
                    {option.label}
                  </button>
                {/each}
              </div>
            </fieldset>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div class="flex items-start gap-3">
            <span class="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Sparkles class="h-5 w-5" />
            </span>
            <div>
              <h2 class="text-xl font-semibold text-slate-950">Fine tune</h2>
              <p class="mt-1 text-sm text-slate-600">Adjust typography, spacing, and dividers for this menu.</p>
            </div>
          </div>

          <Button color="light" data-design-reset onclick={resetDesignSettings}>
            <RotateCcw class="mr-2 h-4 w-4" />
            Reset to preset
          </Button>
        </div>

        <div class="grid gap-5">
          {#each designControlGroups as group (group.title)}
            <fieldset>
              <legend class="text-sm font-semibold text-slate-900">{group.title}</legend>
              <div class="mt-3 grid gap-4">
                {#each group.controls as control (control.setting)}
                  <label class="block rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <span class="flex items-center justify-between gap-3">
                      <span class="text-sm font-medium text-slate-800">{control.label}</span>
                      <span class="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                        {formatDesignSetting(menu.designSettings[control.setting])}
                      </span>
                    </span>
                    <input
                      class="mt-3 block w-full accent-brand-600"
                      data-design-setting={control.setting}
                      max={control.max}
                      min={control.min}
                      step={control.step}
                      type="range"
                      value={menu.designSettings[control.setting]}
                      oninput={(event) => updateDesignSetting(control.setting, event.currentTarget.value)}
                    />
                    <span class="mt-2 block text-xs leading-5 text-slate-500">{control.description}</span>
                  </label>
                {/each}
              </div>
            </fieldset>
          {/each}
        </div>
      </div>

      {:else if activeEditorPanel === 'print'}
      <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-start gap-3">
          <span class="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <FileText class="h-5 w-5" />
          </span>
          <div>
            <h2 class="text-xl font-semibold text-slate-950">Print setup</h2>
            <p class="mt-1 text-sm text-slate-600">Choose page options before opening the browser print dialog.</p>
          </div>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <fieldset>
            <legend class="text-sm font-medium text-slate-700">Page size</legend>
            <div class="mt-2 grid grid-cols-2 rounded-lg border border-slate-300 bg-white p-1">
              {#each printPageSizeOptions as pageSize}
                <button
                  aria-pressed={menu.printSettings.pageSize === pageSize}
                  class={`min-h-10 rounded-md px-3 py-2 text-sm font-medium transition ${
                    menu.printSettings.pageSize === pageSize ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  data-print-setting={`page-size-${pageSize}`}
                  type="button"
                  onclick={() => (menu.printSettings.pageSize = pageSize)}
                >
                  {printPageSizes[pageSize].label}
                </button>
              {/each}
            </div>
          </fieldset>

          <fieldset>
            <legend class="text-sm font-medium text-slate-700">Orientation</legend>
            <div class="mt-2 grid grid-cols-2 rounded-lg border border-slate-300 bg-white p-1">
              {#each printOrientationOptions as orientation}
                <button
                  aria-pressed={menu.printSettings.orientation === orientation}
                  class={`min-h-10 rounded-md px-3 py-2 text-sm font-medium capitalize transition ${
                    menu.printSettings.orientation === orientation
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  data-print-setting={`orientation-${orientation}`}
                  type="button"
                  onclick={() => (menu.printSettings.orientation = orientation)}
                >
                  {orientation}
                </button>
              {/each}
            </div>
          </fieldset>

          <fieldset>
            <legend class="text-sm font-medium text-slate-700">Margins</legend>
            <div class="mt-2 grid grid-cols-3 rounded-lg border border-slate-300 bg-white p-1">
              {#each printMarginOptions as margin}
                <button
                  aria-pressed={menu.printSettings.margin === margin}
                  class={`min-h-10 rounded-md px-2 py-2 text-sm font-medium transition ${
                    menu.printSettings.margin === margin ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  data-print-setting={`margin-${margin}`}
                  type="button"
                  onclick={() => (menu.printSettings.margin = margin)}
                >
                  {printMargins[margin].label}
                </button>
              {/each}
            </div>
          </fieldset>

          <fieldset>
            <legend class="text-sm font-medium text-slate-700">Columns</legend>
            <div class="mt-2 grid grid-cols-2 rounded-lg border border-slate-300 bg-white p-1">
              {#each printColumnOptions as columns}
                <button
                  aria-pressed={menu.printSettings.columns === columns}
                  class={`min-h-10 rounded-md px-3 py-2 text-sm font-medium transition ${
                    menu.printSettings.columns === columns ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  data-print-setting={`columns-${columns}`}
                  type="button"
                  onclick={() => (menu.printSettings.columns = columns)}
                >
                  {columns} column{columns === 1 ? '' : 's'}
                </button>
              {/each}
            </div>
          </fieldset>

          <fieldset class="lg:col-span-2">
            <legend class="text-sm font-medium text-slate-700">Spacing</legend>
            <div class="mt-2 grid grid-cols-2 rounded-lg border border-slate-300 bg-white p-1">
              {#each printDensityOptions as density}
                <button
                  aria-pressed={menu.printSettings.density === density}
                  class={`min-h-10 rounded-md px-3 py-2 text-sm font-medium transition ${
                    menu.printSettings.density === density ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  data-print-setting={`density-${density}`}
                  type="button"
                  onclick={() => (menu.printSettings.density = density)}
                >
                  {printDensities[density].label}
                </button>
              {/each}
            </div>
          </fieldset>
        </div>

        <div class="mt-5 border-t border-slate-200 pt-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold text-slate-950">Download finished menu</h3>
              <p class="mt-1 text-sm leading-6 text-slate-600">Export the current preview as a PDF or image file.</p>
            </div>
            <div class="flex flex-wrap justify-end gap-2">
              <button
                class="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-200 disabled:cursor-wait disabled:opacity-60"
                type="button"
                disabled={isExporting}
                onclick={exportMenuPdf}
              >
                <FileText class="mr-2 h-4 w-4" />
                PDF
              </button>
              <button
                class="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-200 disabled:cursor-wait disabled:opacity-60"
                type="button"
                disabled={isExporting}
                onclick={() => exportMenuImage('png')}
              >
                <Image class="mr-2 h-4 w-4" />
                PNG
              </button>
              <button
                class="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-200 disabled:cursor-wait disabled:opacity-60"
                type="button"
                disabled={isExporting}
                onclick={() => exportMenuImage('jpeg')}
              >
                <Image class="mr-2 h-4 w-4" />
                JPEG
              </button>
            </div>
          </div>

          {#if isExporting}
            <p class="mt-3 text-sm font-medium text-slate-600" role="status">Preparing export...</p>
          {/if}
        </div>

        {#if printWarnings.length > 0}
          <div class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4" role="status" aria-live="polite">
            <h3 class="text-sm font-semibold text-amber-950">Layout warnings</h3>
            <ul class="mt-2 space-y-1 text-sm leading-6 text-amber-800">
              {#each printWarnings as warning}
                <li>{warning}</li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>

      {:else if activeEditorPanel === 'details'}
      <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-start gap-3">
          <span class="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <MapPin class="h-5 w-5" />
          </span>
          <div>
            <h2 class="text-xl font-semibold text-slate-950">Restaurant details</h2>
            <p class="mt-1 text-sm text-slate-600">Add optional contact details, hours, footer notes, and a QR code.</p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block sm:col-span-2">
            <span class="text-sm font-medium text-slate-700">Address</span>
            <textarea
              class="mt-2 block min-h-20 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              bind:value={menu.address}
              placeholder="Street address, city, and state"
            ></textarea>
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Phone</span>
            <div class="relative mt-2">
              <Phone class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                class="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-8 pr-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                bind:value={menu.phone}
                placeholder="(555) 123-4567"
              />
            </div>
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Website</span>
            <div class="relative mt-2">
              <Globe class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                class="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-8 pr-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                bind:value={menu.website}
                placeholder="example.com"
              />
            </div>
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Hours</span>
            <div class="relative mt-2">
              <Clock class="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <textarea
                class="block min-h-20 w-full resize-y rounded-lg border border-slate-300 bg-white py-2.5 pl-8 pr-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                bind:value={menu.hours}
                placeholder="Mon-Fri 11 AM - 9 PM"
              ></textarea>
            </div>
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Social handle</span>
            <input
              class="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              bind:value={menu.socialHandle}
              placeholder="@restaurant"
            />
          </label>

          <label class="block sm:col-span-2">
            <span class="text-sm font-medium text-slate-700">Footer note</span>
            <textarea
              class="mt-2 block min-h-20 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              bind:value={menu.footerNote}
              placeholder="Ask about catering, reservations, specials..."
            ></textarea>
          </label>

          <label class="block sm:col-span-2">
            <span class="text-sm font-medium text-slate-700">Disclaimer</span>
            <textarea
              class="mt-2 block min-h-20 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              bind:value={menu.disclaimer}
              placeholder="Allergy note, gratuity note, substitutions policy..."
            ></textarea>
          </label>

          <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
            <div class="mb-4 flex items-start gap-3">
              <span class="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700 shadow-sm">
                <QrCode class="h-5 w-5" />
              </span>
              <div>
                <h3 class="text-base font-semibold text-slate-950">QR code</h3>
                <p class="mt-1 text-sm text-slate-600">Link to online ordering, a website, catering info, or a digital menu.</p>
              </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <label class="block">
                <span class="text-sm font-medium text-slate-700">QR code link</span>
                <input
                  class="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  bind:value={menu.qrCodeUrl}
                  placeholder="https://example.com/order"
                />
              </label>

              <label class="block">
                <span class="text-sm font-medium text-slate-700">QR code label</span>
                <input
                  class="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  bind:value={menu.qrCodeLabel}
                  placeholder="Scan for online ordering"
                />
              </label>
            </div>

            {#if qrCodeError}
              <p class="mt-3 text-sm text-red-700" role="alert">{qrCodeError}</p>
            {/if}
          </div>

          <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
            <div class="mb-4 flex items-start gap-3">
              <span class="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700 shadow-sm">
                <Tag class="h-5 w-5" />
              </span>
              <div>
                <h3 class="text-base font-semibold text-slate-950">Item badges</h3>
                <p class="mt-1 text-sm text-slate-600">
                  Label items as vegan, spicy, popular, and more. Apply badges to each item in the Items tab.
                </p>
              </div>
            </div>

            <label class="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
              <input
                class="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                type="checkbox"
                bind:checked={menu.showBadgeLegend}
              />
              <span>
                <span class="block text-sm font-medium text-slate-800">Show badge legend</span>
                <span class="mt-0.5 block text-xs leading-5 text-slate-500">
                  Prints a key of every badge in use at the bottom of the menu.
                </span>
              </span>
            </label>

            <div class="mt-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <span class="text-sm font-medium text-slate-700">Custom badges</span>
                <Button color="light" onclick={addCustomBadge}>
                  <Plus class="mr-2 h-4 w-4" />
                  Add badge
                </Button>
              </div>

              {#if menu.customBadges.length === 0}
                <p class="mt-2 text-xs leading-5 text-slate-500">
                  Built-in badges are always available. Add your own with a label, short code, and color.
                </p>
              {:else}
                <div class="mt-3 grid gap-3">
                  {#each menu.customBadges as badge (badge.id)}
                    <div
                      class="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-[auto_minmax(0,1fr)_6rem_8rem_auto] sm:items-end"
                    >
                      <div class="flex items-center justify-center sm:pb-2">
                        <span class="menu-badge-chip" style={badgeChipStyle(badge)}>
                          {badge.shortCode || badge.label.slice(0, 2)}
                        </span>
                      </div>

                      <label class="block">
                        <span class="text-xs font-medium text-slate-600">Label</span>
                        <input
                          class="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                          bind:value={badge.label}
                          placeholder="Badge name"
                        />
                      </label>

                      <label class="block">
                        <span class="text-xs font-medium text-slate-600">Code</span>
                        <input
                          class="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                          bind:value={badge.shortCode}
                          maxlength="6"
                          placeholder="VG"
                        />
                      </label>

                      <label class="block">
                        <span class="text-xs font-medium text-slate-600">Color</span>
                        <select
                          class="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                          bind:value={badge.color}
                        >
                          {#each badgeColorOptions as option (option.value)}
                            <option value={option.value}>{option.label}</option>
                          {/each}
                        </select>
                      </label>

                      <Button color="light" aria-label="Delete badge" title="Delete badge" onclick={() => removeCustomBadge(badge.id)}>
                        <Trash2 class="h-4 w-4" />
                      </Button>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>

      {:else if activeEditorPanel === 'sections'}
      <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 class="text-xl font-semibold text-slate-950">Sections</h2>
            <p class="mt-1 text-sm text-slate-600">
              {menu.sections.length} section{menu.sections.length === 1 ? '' : 's'} in this menu
            </p>
          </div>

          <button
            aria-label="Add section"
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-200"
            title="Add section"
            type="button"
            onclick={openSectionModal}
          >
            <Plus class="h-5 w-5" />
          </button>
        </div>

        <div class="grid gap-2" role="list" aria-label="Menu sections">
          {#each menu.sections as section, sectionIndex (section.id)}
            <div
              class={`relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border p-2 transition ${
                selectedSection?.id === section.id
                  ? 'border-brand-600 bg-brand-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              } ${draggedSectionId === section.id ? 'opacity-60' : ''} ${
                sectionDropTargetId === section.id && draggedSectionId !== section.id
                  ? 'ring-2 ring-brand-300 ring-offset-2'
                  : ''
              }`}
              data-section-id={section.id}
              role="listitem"
            >
              {#if sectionDropTargetId === section.id && draggedSectionId !== section.id}
                <span
                  class={`pointer-events-none absolute left-2 right-2 h-1 rounded-full bg-brand-500 ${
                    sectionDropPosition === 'before' ? '-top-1' : '-bottom-1'
                  }`}
                ></span>
              {/if}

              <div class="flex items-center gap-2 text-slate-400">
                <button
                  aria-label={`Drag ${section.name || 'section'} to reorder`}
                  class="inline-flex h-10 w-8 touch-none cursor-grab select-none items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-700 active:cursor-grabbing focus:outline-none focus:ring-4 focus:ring-brand-200"
                  draggable="false"
                  title="Drag to reorder"
                  type="button"
                  onclick={() => selectSection(section.id)}
                  onpointerdown={(event) => handleSectionGripPointerDown(event, section.id)}
                  onpointermove={handleSectionGripPointerMove}
                  onpointerup={handleSectionGripPointerUp}
                  onpointercancel={resetSectionDrag}
                  onmousedown={(event) => handleSectionGripMouseDown(event, section.id)}
                >
                  <GripVertical class="h-5 w-5" aria-hidden="true" />
                </button>
                <span class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-600">
                  {sectionIndex + 1}
                </span>
              </div>

              <button
                aria-pressed={selectedSection?.id === section.id}
                class={`min-w-0 rounded-md px-3 py-2 text-left transition ${
                  selectedSection?.id === section.id
                    ? 'bg-white/80 text-brand-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
                type="button"
                onclick={() => selectSection(section.id)}
              >
                <span class="block truncate text-sm font-semibold">{section.name || 'Untitled section'}</span>
                <span class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span>{section.items.length} item{section.items.length === 1 ? '' : 's'}</span>
                  <span>{section.columnSpan} col width</span>
                  {#if section.imageLayout !== 'none'}
                    <span>{section.imageLayout === 'thumbnail' ? 'photos' : 'photo banners'}</span>
                  {/if}
                </span>
              </button>

              <div class="flex items-center gap-1">
                <button
                  aria-label={`Duplicate ${section.name || 'section'}`}
                  class="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-950"
                  title="Duplicate section"
                  type="button"
                  onclick={() => duplicateSection(section.id)}
                >
                  <Copy class="h-4 w-4" />
                </button>

                <button
                  aria-label={`Move ${section.name || 'section'} up`}
                  class="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-35"
                  disabled={sectionIndex === 0}
                  title="Move up"
                  type="button"
                  onclick={() => moveSection(section.id, -1)}
                >
                  <ArrowUp class="h-4 w-4" />
                </button>

                <button
                  aria-label={`Move ${section.name || 'section'} down`}
                  class="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-35"
                  disabled={sectionIndex === menu.sections.length - 1}
                  title="Move down"
                  type="button"
                  onclick={() => moveSection(section.id, 1)}
                >
                  <ArrowDown class="h-4 w-4" />
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>

      {#if selectedSection}
        <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:items-end">
            <label class="block">
              <span class="text-sm font-medium text-slate-700">Section name</span>
              <input
                class="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                bind:value={selectedSection.name}
                placeholder="Entrees, drinks, desserts..."
              />
            </label>

            <fieldset>
              <legend class="text-sm font-medium text-slate-700">Section width</legend>
              <div class="mt-2 grid grid-cols-2 rounded-lg border border-slate-300 bg-white p-1">
                <button
                  aria-pressed={selectedSection.columnSpan === 1}
                  class={`rounded-md px-3 py-2 text-sm font-medium transition ${
                    selectedSection.columnSpan === 1 ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  type="button"
                  onclick={() => (selectedSection.columnSpan = 1)}
                >
                  1 col
                </button>
                <button
                  aria-pressed={selectedSection.columnSpan === 2}
                  class={`rounded-md px-3 py-2 text-sm font-medium transition ${
                    selectedSection.columnSpan === 2 ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  type="button"
                  onclick={() => (selectedSection.columnSpan = 2)}
                >
                  2 col
                </button>
              </div>
            </fieldset>

            <fieldset>
              <legend class="text-sm font-medium text-slate-700">Photo layout</legend>
              <div class="mt-2 grid grid-cols-3 rounded-lg border border-slate-300 bg-white p-1">
                {#each sectionImageLayoutOptions as option (option.value)}
                  <button
                    aria-pressed={selectedSection.imageLayout === option.value}
                    class={`rounded-md px-3 py-2 text-sm font-medium transition ${
                      selectedSection.imageLayout === option.value
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    type="button"
                    onclick={() => (selectedSection.imageLayout = option.value)}
                  >
                    {option.label}
                  </button>
                {/each}
              </div>
            </fieldset>

            <div class="flex gap-2">
              <Button
                aria-label="Duplicate section"
                color="light"
                title="Duplicate section"
                onclick={() => duplicateSection(selectedSection.id)}
              >
                <Copy class="h-4 w-4" />
              </Button>

              <Button
                aria-label="Delete section"
                color="red"
                disabled={menu.sections.length === 1}
                title="Delete section"
                onclick={() => removeSection(selectedSection.id)}
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div class="mb-5 grid gap-4">
            <label class="block">
              <span class="text-sm font-medium text-slate-700">Section note</span>
              <textarea
                class="mt-2 block min-h-20 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                bind:value={selectedSection.note}
                placeholder="Optional intro text, availability, or section guidance"
              ></textarea>
            </label>

            <div class="grid gap-4 xl:grid-cols-2">
              <fieldset>
                <legend class="text-sm font-medium text-slate-700">Heading alignment</legend>
                <div class="mt-2 grid grid-cols-4 rounded-lg border border-slate-300 bg-white p-1">
                  {#each sectionHeadingAlignOptions as option (option.value)}
                    <button
                      aria-pressed={selectedSection.headingAlign === option.value}
                      class={`rounded-md px-2 py-2 text-sm font-medium transition ${
                        selectedSection.headingAlign === option.value
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      type="button"
                      onclick={() => (selectedSection.headingAlign = option.value)}
                    >
                      {option.label}
                    </button>
                  {/each}
                </div>
              </fieldset>

              <fieldset>
                <legend class="text-sm font-medium text-slate-700">Item layout</legend>
                <div class="mt-2 grid grid-cols-3 rounded-lg border border-slate-300 bg-white p-1 sm:grid-cols-6">
                  {#each sectionItemLayoutOptions as option (option.value)}
                    <button
                      aria-pressed={selectedSection.itemLayout === option.value}
                      class={`rounded-md px-2 py-2 text-sm font-medium transition ${
                        selectedSection.itemLayout === option.value
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      type="button"
                      onclick={() => (selectedSection.itemLayout = option.value)}
                    >
                      {option.label}
                    </button>
                  {/each}
                </div>
              </fieldset>

              <fieldset>
                <legend class="text-sm font-medium text-slate-700">Divider override</legend>
                <div class="mt-2 grid grid-cols-3 rounded-lg border border-slate-300 bg-white p-1 sm:grid-cols-5">
                  {#each dividerStyleOptions as option (option.value)}
                    <button
                      aria-pressed={selectedSection.dividerStyle === option.value}
                      class={`rounded-md px-2 py-2 text-sm font-medium transition ${
                        selectedSection.dividerStyle === option.value
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      type="button"
                      onclick={() => (selectedSection.dividerStyle = option.value)}
                    >
                      {option.label}
                    </button>
                  {/each}
                </div>
              </fieldset>

              <fieldset>
                <legend class="text-sm font-medium text-slate-700">Section background</legend>
                <div class="mt-2 grid grid-cols-3 rounded-lg border border-slate-300 bg-white p-1">
                  {#each sectionBackgroundOptions as option (option.value)}
                    <button
                      aria-pressed={selectedSection.backgroundStyle === option.value}
                      class={`rounded-md px-2 py-2 text-sm font-medium transition ${
                        selectedSection.backgroundStyle === option.value
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      type="button"
                      onclick={() => (selectedSection.backgroundStyle = option.value)}
                    >
                      {option.label}
                    </button>
                  {/each}
                </div>
              </fieldset>
            </div>

            {#if selectedSection.imageLayout !== 'none'}
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div class="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Image class="h-4 w-4 text-brand-700" />
                  Default photo settings
                </div>
                <p class="mt-1 text-xs leading-5 text-slate-500">
                  Applied to every {selectedSection.imageLayout === 'thumbnail' ? 'thumbnail' : 'banner'} photo in this section, unless an item overrides it.
                </p>
                <div class="mt-3">
                  {@render photoSettingsControls(selectedSection.imageDefaults)}
                </div>
              </div>
            {/if}
          </div>

          <div class="space-y-4">
            {#if selectedSection.items.length > 0}
              <div class="rounded-lg border border-brand-200 bg-brand-50 p-4" aria-live="polite">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <label class="inline-flex items-center gap-2 text-sm font-semibold text-brand-950">
                    <input
                      aria-label="Select all items in section"
                      class="h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                      type="checkbox"
                      checked={selectedItemIdsInSelectedSection.length === selectedSection.items.length}
                      onchange={(event) => setAllItemsSelected(selectedSection, event.currentTarget.checked)}
                    />
                    <span>
                      {selectedItemIdsInSelectedSection.length === 0
                        ? 'Select items for batch actions'
                        : `${selectedItemIdsInSelectedSection.length} selected in ${selectedSection.name || 'this section'}`}
                    </span>
                  </label>

                  <div class="flex flex-wrap items-center gap-2">
                    <button
                      aria-label="Move selected items up"
                      class="inline-flex min-h-10 items-center justify-center rounded-lg border border-brand-200 bg-white px-3 text-sm font-medium text-brand-900 shadow-sm transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={!canMoveSelectedItems(selectedSection, -1)}
                      type="button"
                      onclick={() => moveSelectedItems(selectedSection, -1)}
                    >
                      <ArrowUp class="mr-2 h-4 w-4" />
                      Move up
                    </button>

                    <button
                      aria-label="Move selected items down"
                      class="inline-flex min-h-10 items-center justify-center rounded-lg border border-brand-200 bg-white px-3 text-sm font-medium text-brand-900 shadow-sm transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={!canMoveSelectedItems(selectedSection, 1)}
                      type="button"
                      onclick={() => moveSelectedItems(selectedSection, 1)}
                    >
                      <ArrowDown class="mr-2 h-4 w-4" />
                      Move down
                    </button>

                    <button
                      aria-label="Duplicate selected items"
                      class="inline-flex min-h-10 items-center justify-center rounded-lg border border-brand-200 bg-white px-3 text-sm font-medium text-brand-900 shadow-sm transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={selectedItemIdsInSelectedSection.length === 0}
                      type="button"
                      onclick={() => duplicateSelectedItems(selectedSection)}
                    >
                      <Copy class="mr-2 h-4 w-4" />
                      Duplicate
                    </button>

                    <button
                      aria-label="Delete selected items"
                      class="inline-flex min-h-10 items-center justify-center rounded-lg border border-red-200 bg-white px-3 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={selectedItemIdsInSelectedSection.length === 0}
                      type="button"
                      onclick={() => deleteSelectedItems(selectedSection)}
                    >
                      <Trash2 class="mr-2 h-4 w-4" />
                      Delete
                    </button>

                    <button
                      aria-label="Clear selected items"
                      class="inline-flex min-h-10 items-center justify-center rounded-lg border border-brand-200 bg-white px-3 text-sm font-medium text-brand-900 shadow-sm transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={selectedItemIdsInSelectedSection.length === 0}
                      type="button"
                      onclick={() => clearSelectedItems(selectedSection)}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            {/if}

            {#each selectedSection.items as item, itemIndex (item.id)}
              <div
                class={`relative rounded-lg border p-4 transition ${
                  isItemSelected(item.id) ? 'border-brand-400 bg-brand-50/80 shadow-sm' : 'border-slate-200 bg-slate-50'
                } ${draggedItemId === item.id ? 'opacity-60' : ''} ${
                  itemDropTargetId === item.id && draggedItemId !== item.id ? 'ring-2 ring-brand-300 ring-offset-2' : ''
                }`}
                data-item-id={item.id}
                role="group"
                aria-label={`${item.name || 'Untitled item'} editor`}
              >
                {#if itemDropTargetId === item.id && draggedItemId !== item.id}
                  <span
                    class={`pointer-events-none absolute left-4 right-4 h-1 rounded-full bg-brand-500 ${
                      itemDropPosition === 'before' ? '-top-1' : '-bottom-1'
                    }`}
                  ></span>
                {/if}

                <div class="grid gap-4">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="flex flex-wrap items-center gap-2">
                      <button
                        aria-label={`Drag ${item.name || 'item'} to reorder`}
                        class="inline-flex h-10 w-9 touch-none cursor-grab select-none items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-950 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-35 focus:outline-none focus:ring-4 focus:ring-brand-200"
                        disabled={selectedSection.items.length <= 1}
                        draggable="false"
                        title="Drag to reorder"
                        type="button"
                        onpointerdown={(event) => handleItemGripPointerDown(event, item.id)}
                        onpointermove={handleItemGripPointerMove}
                        onpointerup={handleItemGripPointerUp}
                        onpointercancel={resetItemDrag}
                        onmousedown={(event) => handleItemGripMouseDown(event, item.id)}
                      >
                        <GripVertical class="h-5 w-5" aria-hidden="true" />
                      </button>

                      <label class="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm">
                        <input
                          aria-label={`Select ${item.name || 'item'}`}
                          class="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          type="checkbox"
                          checked={isItemSelected(item.id)}
                          onchange={(event) => toggleItemSelection(item.id, event.currentTarget.checked)}
                        />
                        Select
                      </label>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                      <button
                        aria-label={`Move ${item.name || 'item'} up`}
                        class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-35"
                        disabled={itemIndex === 0}
                        title="Move up"
                        type="button"
                        onclick={() => moveItem(selectedSection, item.id, -1)}
                      >
                        <ArrowUp class="h-4 w-4" />
                      </button>
                      <button
                        aria-label={`Move ${item.name || 'item'} down`}
                        class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-35"
                        disabled={itemIndex === selectedSection.items.length - 1}
                        title="Move down"
                        type="button"
                        onclick={() => moveItem(selectedSection, item.id, 1)}
                      >
                        <ArrowDown class="h-4 w-4" />
                      </button>
                      <button
                        aria-label={`Duplicate ${item.name || 'menu item'}`}
                        class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-950"
                        title="Duplicate item"
                        type="button"
                        onclick={() => duplicateItem(selectedSection, item.id)}
                      >
                        <Copy class="h-4 w-4" />
                      </button>
                      <Button
                        aria-label={`Delete ${item.name || 'menu item'}`}
                        color="light"
                        title="Delete menu item"
                        onclick={() => removeItem(selectedSection, item.id)}
                      >
                        <Trash2 class="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_10rem]">
                    <label class="block">
                      <span class="text-sm font-medium text-slate-700">Item name</span>
                      <input
                        class="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                        bind:value={item.name}
                        placeholder="Menu item"
                      />
                    </label>

                    <label class="block max-w-40">
                      <span class="text-sm font-medium text-slate-700">Price</span>
                      <div class="relative mt-2">
                        <DollarSign class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          class="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-8 pr-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                          bind:value={item.price}
                          inputmode="decimal"
                          placeholder="0"
                        />
                      </div>
                    </label>
                  </div>

                  <label class="block">
                    <span class="text-sm font-medium text-slate-700">Description</span>
                    <textarea
                      class="mt-2 block min-h-24 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                      bind:value={item.description}
                      placeholder="Optional item details"
                    ></textarea>
                  </label>

                  <div class="rounded-lg border border-slate-200 bg-white p-4">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div class="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <Image class="h-4 w-4 text-brand-700" />
                          Item photo
                        </div>
                        <p class="mt-1 text-xs leading-5 text-slate-500">
                          {selectedSection.imageLayout === 'none'
                            ? 'Choose a section photo layout to show item photos in the preview.'
                            : selectedSection.imageLayout === 'thumbnail'
                              ? 'This section will print item photos as thumbnails.'
                              : 'This section will print item photos as banners.'}
                        </p>
                      </div>

                      <div class="flex flex-wrap gap-2">
                        <label
                          class="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus-within:ring-4 focus-within:ring-brand-200"
                        >
                          <Upload class="mr-2 h-4 w-4" />
                          {item.imageDataUrl ? 'Change' : 'Upload'}
                          <input
                            class="sr-only"
                            type="file"
                            accept="image/*"
                            onchange={(event) => handleItemImageUpload(event, item)}
                          />
                        </label>

                        {#if item.imageDataUrl}
                          <Button color="light" onclick={() => removeItemImage(item)}>
                            <X class="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        {/if}
                      </div>
                    </div>

                    {#if item.imageDataUrl}
                      {@const resolvedItemPhoto = item.imageUseSectionDefaults ? selectedSection.imageDefaults : item.image}
                      <div class="mt-4 grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
                        <span
                          class={`item-photo-edit-frame h-28 w-28 border border-slate-200 shadow-sm menu-photo-shape-${resolvedItemPhoto.shape}`}
                        >
                          <img
                            src={item.imageDataUrl}
                            alt={item.imageAlt || item.name || 'Menu item photo'}
                            style={itemPhotoStyle(resolvedItemPhoto)}
                          />
                        </span>
                        <label class="block">
                          <span class="text-sm font-medium text-slate-700">Photo description</span>
                          <input
                            class="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                            bind:value={item.imageAlt}
                            placeholder="Alt text for exports and screen readers"
                          />
                        </label>
                      </div>

                      <div class="mt-4 border-t border-slate-100 pt-4">
                        <label class="flex items-start gap-3">
                          <input
                            class="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                            type="checkbox"
                            checked={item.imageUseSectionDefaults}
                            onchange={(event) => (item.imageUseSectionDefaults = event.currentTarget.checked)}
                          />
                          <span>
                            <span class="block text-sm font-medium text-slate-800">Use section photo defaults</span>
                            <span class="mt-0.5 block text-xs leading-5 text-slate-500">
                              {item.imageUseSectionDefaults
                                ? 'This photo follows the section default crop, zoom, and shape.'
                                : 'Custom crop, zoom, and shape for this item only.'}
                            </span>
                          </span>
                        </label>

                        {#if !item.imageUseSectionDefaults}
                          <div class="mt-3">
                            {@render photoSettingsControls(item.image)}
                          </div>
                        {/if}
                      </div>
                    {/if}
                  </div>

                  <div class="rounded-lg border border-slate-200 bg-white p-4">
                    <div class="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Tag class="h-4 w-4 text-brand-700" />
                      Badges
                    </div>
                    <p class="mt-1 text-xs leading-5 text-slate-500">
                      Tap to label this item. Manage the badge library and legend in the Details tab.
                    </p>
                    <div class="mt-3 flex flex-wrap gap-2">
                      {#each availableBadges as badge (badge.id)}
                        {@const selected = item.badgeIds.includes(badge.id)}
                        <button
                          aria-pressed={selected}
                          class={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                            selected
                              ? 'border-brand-500 bg-brand-50 text-brand-900 shadow-sm'
                              : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                          type="button"
                          onclick={() => toggleItemBadge(item, badge.id)}
                        >
                          <span class="menu-badge-chip" style={badgeChipStyle(badge)}>
                            {badge.shortCode || badge.label.slice(0, 2)}
                          </span>
                          {badge.label}
                        </button>
                      {/each}
                    </div>
                  </div>

                  <div class="rounded-lg border border-slate-200 bg-white p-4">
                    <div class="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <DollarSign class="h-4 w-4 text-brand-700" />
                      Sizes &amp; prices
                    </div>
                    <p class="mt-1 text-xs leading-5 text-slate-500">
                      Add size-based prices like Small / Large. Leave empty to keep a single price.
                    </p>

                    {#if item.sizes.length > 0}
                      <div class="mt-3 grid gap-2">
                        {#each item.sizes as size (size.id)}
                          <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-center">
                            <input
                              class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                              bind:value={size.label}
                              placeholder="Size (e.g. Small)"
                            />
                            <div class="relative">
                              <DollarSign class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                              <input
                                class="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                                bind:value={size.price}
                                inputmode="decimal"
                                placeholder="0"
                              />
                            </div>
                            <Button color="light" aria-label="Remove size" title="Remove size" onclick={() => removeItemSize(item, size.id)}>
                              <X class="h-4 w-4" />
                            </Button>
                          </div>
                        {/each}
                      </div>
                    {/if}

                    <div class="mt-3">
                      <Button color="light" onclick={() => addItemSize(item)}>
                        <Plus class="mr-2 h-4 w-4" />
                        Add size
                      </Button>
                    </div>
                  </div>

                  <div class="rounded-lg border border-slate-200 bg-white p-4">
                    <div class="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Utensils class="h-4 w-4 text-brand-700" />
                      Modifier groups
                    </div>
                    <p class="mt-1 text-xs leading-5 text-slate-500">
                      Add option groups like Add protein, Choose a side, or Substitute. Prices are optional.
                    </p>

                    {#if item.modifierGroups.length > 0}
                      <div class="mt-3 grid gap-3">
                        {#each item.modifierGroups as group (group.id)}
                          <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div class="flex items-center gap-2">
                              <input
                                class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                                bind:value={group.name}
                                placeholder="Group name (e.g. Add protein)"
                              />
                              <Button color="light" aria-label="Remove group" title="Remove modifier group" onclick={() => removeModifierGroup(item, group.id)}>
                                <Trash2 class="h-4 w-4" />
                              </Button>
                            </div>

                            {#if group.options.length > 0}
                              <div class="mt-2 grid gap-2">
                                {#each group.options as option (option.id)}
                                  <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-center">
                                    <input
                                      class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                                      bind:value={option.label}
                                      placeholder="Option (e.g. Grilled chicken)"
                                    />
                                    <div class="relative">
                                      <DollarSign class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                      <input
                                        class="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                                        bind:value={option.price}
                                        inputmode="decimal"
                                        placeholder="+0"
                                      />
                                    </div>
                                    <Button color="light" aria-label="Remove option" title="Remove option" onclick={() => removeModifierOption(group, option.id)}>
                                      <X class="h-4 w-4" />
                                    </Button>
                                  </div>
                                {/each}
                              </div>
                            {/if}

                            <div class="mt-2">
                              <Button color="light" onclick={() => addModifierOption(group)}>
                                <Plus class="mr-2 h-4 w-4" />
                                Add option
                              </Button>
                            </div>
                          </div>
                        {/each}
                      </div>
                    {/if}

                    <div class="mt-3">
                      <Button color="light" onclick={() => addModifierGroup(item)}>
                        <Plus class="mr-2 h-4 w-4" />
                        Add modifier group
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            {/each}

            {#if selectedSection.items.length === 0}
              <button
                class="flex min-h-36 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-brand-300 bg-brand-50/70 p-6 text-center transition hover:border-brand-500 hover:bg-brand-50 focus:outline-none focus:ring-4 focus:ring-brand-200"
                type="button"
                onclick={() => addItem(selectedSection)}
              >
                <span class="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm">
                  <Plus class="h-6 w-6" />
                </span>
                <span class="text-base font-semibold text-brand-900">Add first menu item</span>
                <span class="mt-1 text-sm text-brand-800">Click here to add an item to this section.</span>
              </button>
            {/if}

            <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <label class="block">
                <span class="text-sm font-semibold text-slate-900">Quick add items</span>
                <textarea
                  class="mt-2 block min-h-28 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  bind:value={quickAddItemsText}
                  placeholder={`Cheese Pizza | House sauce and mozzarella | 12.99
Pepperoni Pizza | Mozzarella and pepperoni | 14.99`}
                ></textarea>
              </label>

              <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p class="text-xs leading-5 text-slate-500">Use one item per line: name | description | price.</p>
                <Button color="light" disabled={quickAddItemDrafts.length === 0} onclick={() => addQuickItems(selectedSection)}>
                  <Plus class="mr-2 h-4 w-4" />
                  {quickAddItemDrafts.length === 0
                    ? 'Add lines'
                    : `Add ${quickAddItemDrafts.length} line${quickAddItemDrafts.length === 1 ? '' : 's'}`}
                </Button>
              </div>
            </div>

            {#if selectedSection.items.length > 0}
              <div class="flex justify-center border-t border-slate-200 pt-4">
                <Button color="light" onclick={() => addItem(selectedSection)}>
                  <Plus class="mr-2 h-4 w-4" />
                  Add another menu item
                </Button>
              </div>
            {/if}
          </div>
        </div>
      {/if}
      {/if}
    </section>

    <aside
      id="menu-preview"
      class={`menu-preview-column h-full min-h-0 overflow-hidden ${mobileView === 'editor' ? 'hidden xl:block' : ''}`}
      aria-label="Menu preview"
    >
      <div class="editor-preview-pane flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:rounded-none xl:border-0 xl:shadow-none">
        <div class="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
          <div>
            <div class="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-brand-700">
              <Eye class="h-4 w-4" />
              Preview
            </div>
            <h2 class="mt-1 text-xl font-semibold text-slate-950">Live menu</h2>
          </div>
          <Button class="print-command" color="light" onclick={printMenu}>
            <Printer class="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>

        <div class="menu-preview-canvas min-h-0 flex-1 overflow-auto bg-slate-200/70 p-3 sm:p-5">
          <div bind:this={previewElement} class="menu-print-pages" style={previewStyleVariables}>
            {#each previewPages as page, pageIndex (page.id)}
              <div
                class={`menu-print-preview ${activeStylePreset.previewClass} menu-border-${menu.designSettings.borderStyle} menu-corners-${menu.designSettings.cornerStyle} menu-flair-${menu.designSettings.headerFlair} menu-watermark-${menu.designSettings.watermarkStyle} menu-paper-${menu.designSettings.paperTexture} rounded-lg border border-slate-200 bg-[#fffdf8] p-6 shadow-sm sm:p-8`}
                data-preview-page={pageIndex + 1}
              >
                {#if menu.designSettings.watermarkStyle !== 'none'}
                  <span class="menu-print-watermark" aria-hidden="true"></span>
                {/if}

                {#if menu.designSettings.cornerStyle !== 'none'}
                  <span class="menu-print-corners" aria-hidden="true"></span>
                {/if}

                {#if page.showHeader}
                  {#if menu.designSettings.headerFlair !== 'none'}
                    <div class="menu-print-top-flair" aria-hidden="true">
                      <span class="menu-print-top-flair-mark"></span>
                    </div>
                  {/if}

                  <div class="menu-print-header relative border-b border-slate-300 pb-6 text-center">
                    {#if hasLogo && menu.logoPlacement === 'left-eyebrow'}
                      <div class="menu-print-logo-frame mx-auto mb-4 h-24 w-48 overflow-hidden sm:absolute sm:left-0 sm:top-0 sm:mx-0 sm:mb-0 sm:h-20 sm:w-32">
                        <img
                          class="menu-print-logo h-full w-full"
                          src={menu.logoDataUrl}
                          alt={menu.logoAlt || menu.logoName || 'Menu logo'}
                          style={logoImageStyle}
                        />
                      </div>
                    {/if}

                    {#if hasLogo && menu.logoPlacement === 'right-eyebrow'}
                      <div class="menu-print-logo-frame mx-auto mb-4 h-24 w-48 overflow-hidden sm:absolute sm:right-0 sm:top-0 sm:mx-0 sm:mb-0 sm:h-20 sm:w-32">
                        <img
                          class="menu-print-logo h-full w-full"
                          src={menu.logoDataUrl}
                          alt={menu.logoAlt || menu.logoName || 'Menu logo'}
                          style={logoImageStyle}
                        />
                      </div>
                    {/if}

                    {#if hasLogo && menu.logoPlacement === 'above-eyebrow'}
                      <div class="menu-print-logo-frame mx-auto mb-4 h-24 w-48 overflow-hidden">
                        <img
                          class="menu-print-logo h-full w-full"
                          src={menu.logoDataUrl}
                          alt={menu.logoAlt || menu.logoName || 'Menu logo'}
                          style={logoImageStyle}
                        />
                      </div>
                    {/if}

                    {#if hasTopText}
                      <p class="text-sm font-medium uppercase tracking-[0.2em] text-brand-700">{menu.eyebrow}</p>
                    {/if}

                    {#if hasLogo && menu.logoPlacement === 'below-eyebrow'}
                      <div class="menu-print-logo-frame mx-auto mt-4 h-24 w-48 overflow-hidden">
                        <img
                          class="menu-print-logo h-full w-full"
                          src={menu.logoDataUrl}
                          alt={menu.logoAlt || menu.logoName || 'Menu logo'}
                          style={logoImageStyle}
                        />
                      </div>
                    {/if}

                    <h3
                      class={hasHeaderTopContent
                        ? 'mt-3 text-3xl font-serif text-slate-950'
                        : 'text-3xl font-serif text-slate-950'}
                    >
                      {menu.name || 'Untitled Menu'}
                    </h3>
                    {#if menu.subtitle}
                      <p class="mt-2 text-sm text-slate-600">{menu.subtitle}</p>
                    {/if}

                    {#if hasRestaurantDetails}
                      <div class="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs leading-5 text-slate-600">
                        {#if menu.address.trim()}
                          <span class="inline-flex items-center gap-1.5">
                            <MapPin class="h-3.5 w-3.5 shrink-0 text-brand-700" />
                            {menu.address}
                          </span>
                        {/if}

                        {#if menu.phone.trim()}
                          <span class="inline-flex items-center gap-1.5">
                            <Phone class="h-3.5 w-3.5 shrink-0 text-brand-700" />
                            {menu.phone}
                          </span>
                        {/if}

                        {#if menu.website.trim()}
                          <a class="inline-flex items-center gap-1.5 text-slate-600 no-underline" href={websiteHref}>
                            <Globe class="h-3.5 w-3.5 shrink-0 text-brand-700" />
                            {menu.website}
                          </a>
                        {/if}

                        {#if menu.hours.trim()}
                          <span class="inline-flex items-center gap-1.5">
                            <Clock class="h-3.5 w-3.5 shrink-0 text-brand-700" />
                            {menu.hours}
                          </span>
                        {/if}

                        {#if menu.socialHandle.trim()}
                          <span class="inline-flex items-center gap-1.5">
                            <Globe class="h-3.5 w-3.5 shrink-0 text-brand-700" />
                            {menu.socialHandle}
                          </span>
                        {/if}
                      </div>
                    {/if}
                  </div>
                {/if}

                <div
                  class="menu-print-grid mt-6 grid gap-x-8 gap-y-8"
                  style={`grid-template-columns: repeat(${menu.printSettings.columns}, minmax(0, 1fr));`}
                >
                  {#each page.sections as section (section.id)}
                    <section
                      class={`menu-print-section menu-section-bg-${section.backgroundStyle}`}
                      style={getSectionStyleVariables(section)}
                    >
                      <h4
                        class="menu-print-section-heading mb-4 flex items-center gap-3 text-lg font-semibold uppercase tracking-[0.12em] text-slate-900"
                      >
                        <span>
                          {section.name || 'Untitled section'}
                          {#if section.isContinuation}
                            <span class="ml-2 align-middle text-xs font-medium normal-case tracking-normal text-slate-500">
                              continued
                            </span>
                          {/if}
                        </span>
                        <span class="menu-print-section-rule flex-1"></span>
                      </h4>

                      {#if section.note}
                        <p class="menu-print-section-note mb-4 text-sm leading-6 text-slate-600">{section.note}</p>
                      {/if}

                      <div class="space-y-4">
                        {#each section.items as item (item.id)}
                          {@const itemBadges = resolveItemBadges(item)}
                          {@const itemPhoto = resolveItemImageSettings(section, item)}
                          <article
                            class={`menu-print-item menu-print-item-${section.imageLayout} menu-item-layout-${getSectionItemLayout(section)} menu-description-indent-${menu.designSettings.descriptionIndent}`}
                          >
                            {#if item.imageDataUrl && section.imageLayout === 'banner'}
                              <span class={`menu-print-item-photo-frame menu-print-item-photo-banner menu-photo-shape-${itemPhoto.shape}`}>
                                <img
                                  class="menu-print-item-photo"
                                  src={item.imageDataUrl}
                                  alt={item.imageAlt || item.name || 'Menu item photo'}
                                  style={itemPhotoStyle(itemPhoto)}
                                />
                              </span>
                            {/if}

                            <div class={item.imageDataUrl && section.imageLayout === 'thumbnail' ? 'menu-print-item-content menu-print-item-content-with-photo' : 'menu-print-item-content'}>
                              {#if item.imageDataUrl && section.imageLayout === 'thumbnail'}
                                <span class={`menu-print-item-photo-frame menu-print-item-photo-thumbnail menu-photo-shape-${itemPhoto.shape}`}>
                                  <img
                                    class="menu-print-item-photo"
                                    src={item.imageDataUrl}
                                    alt={item.imageAlt || item.name || 'Menu item photo'}
                                    style={itemPhotoStyle(itemPhoto)}
                                  />
                                </span>
                              {/if}

                              <div class="menu-print-item-body">
                                {#if getSectionItemLayout(section) === 'centered'}
                                  <div class="menu-print-item-centered text-center">
                                    <h5 class="font-semibold text-slate-950">{item.name || 'Untitled item'}</h5>
                                    {#if item.price}
                                      <p class="menu-print-item-price mt-1 font-semibold text-slate-900">
                                        {formatPrice(item.price)}
                                      </p>
                                    {/if}
                                  </div>
                                {:else if getSectionItemLayout(section) === 'inline'}
                                  <div class="menu-print-item-inline">
                                    <h5 class="font-semibold text-slate-950">
                                      {item.name || 'Untitled item'}
                                      {#if item.price}
                                        <span class="menu-print-item-price ml-2 font-semibold text-slate-900">
                                          {formatPrice(item.price)}
                                        </span>
                                      {/if}
                                    </h5>
                                  </div>
                                {:else if getSectionItemLayout(section) === 'leader'}
                                  <div class="menu-print-item-leader-row flex items-baseline gap-3">
                                    <h5 class="font-semibold text-slate-950">{item.name || 'Untitled item'}</h5>
                                    <span class="menu-print-price-leader flex-1" aria-hidden="true"></span>
                                    <p class="menu-print-item-price shrink-0 font-semibold text-slate-900">
                                      {item.price ? formatPrice(item.price) : ''}
                                    </p>
                                  </div>
                                {:else if getSectionItemLayout(section) === 'stacked'}
                                  <div class="menu-print-item-stacked">
                                    <h5 class="font-semibold text-slate-950">{item.name || 'Untitled item'}</h5>
                                    {#if item.price}
                                      <p class="menu-print-item-price mt-1 font-semibold text-slate-900">
                                        {formatPrice(item.price)}
                                      </p>
                                    {/if}
                                  </div>
                                {:else}
                                  <div class="menu-print-item-row flex items-baseline justify-between gap-4">
                                    <h5 class="font-semibold text-slate-950">{item.name || 'Untitled item'}</h5>
                                    <p class="menu-print-item-price shrink-0 font-semibold text-slate-900">
                                      {item.price ? formatPrice(item.price) : ''}
                                    </p>
                                  </div>
                                {/if}
                                {#if item.sizes.length > 0}
                                  {#if menu.designSettings.sizeDisplay === 'inline'}
                                    <div class="menu-print-item-sizes menu-print-item-sizes-inline">
                                      {#each item.sizes as size (size.id)}
                                        <span class="menu-print-size">
                                          <span class="menu-print-size-label">{size.label || 'Size'}</span>
                                          {#if size.price.trim()}
                                            <span class="menu-print-size-price">{formatPrice(size.price)}</span>
                                          {/if}
                                        </span>
                                      {/each}
                                    </div>
                                  {:else}
                                    <div class="menu-print-item-sizes menu-print-item-sizes-stacked">
                                      {#each item.sizes as size (size.id)}
                                        <div class="menu-print-size-row">
                                          <span class="menu-print-size-label">{size.label || 'Size'}</span>
                                          <span class="menu-print-size-leader" aria-hidden="true"></span>
                                          <span class="menu-print-size-price">{size.price.trim() ? formatPrice(size.price) : ''}</span>
                                        </div>
                                      {/each}
                                    </div>
                                  {/if}
                                {/if}
                                {#if itemBadges.length > 0}
                                  <div
                                    class={`menu-print-item-badges mt-1.5 flex flex-wrap gap-1 ${
                                      getSectionItemLayout(section) === 'centered' ? 'justify-center' : ''
                                    }`}
                                  >
                                    {#each itemBadges as badge (badge.id)}
                                      <span class="menu-badge-chip" style={badgeChipStyle(badge)} title={badge.label}>
                                        {badge.shortCode || badge.label}
                                      </span>
                                    {/each}
                                  </div>
                                {/if}
                                {#if item.description}
                                  <p class="menu-print-item-description mt-1 max-w-prose text-sm leading-6 text-slate-600">
                                    {item.description}
                                  </p>
                                {/if}
                                {#if item.modifierGroups.length > 0}
                                  <div class="menu-print-item-modifiers">
                                    {#each item.modifierGroups as group (group.id)}
                                      {#if group.name.trim() || group.options.length > 0}
                                        <div class="menu-print-modifier-group">
                                          {#if group.name.trim()}
                                            <span class="menu-print-modifier-name">{group.name}</span>
                                          {/if}
                                          {#if menu.designSettings.modifierDisplay === 'inline'}
                                            <span class="menu-print-modifier-options-inline">
                                              {#each group.options as option, optionIndex (option.id)}{optionIndex > 0
                                                  ? ', '
                                                  : ''}{option.label || 'Option'}{#if option.price.trim()} ({formatAddonPrice(option.price)}){/if}{/each}
                                            </span>
                                          {:else}
                                            <ul class="menu-print-modifier-options-list">
                                              {#each group.options as option (option.id)}
                                                <li class="menu-print-modifier-option">
                                                  <span class="menu-print-modifier-option-label">{option.label || 'Option'}</span>
                                                  {#if option.price.trim()}
                                                    <span class="menu-print-modifier-price">{formatAddonPrice(option.price)}</span>
                                                  {/if}
                                                </li>
                                              {/each}
                                            </ul>
                                          {/if}
                                        </div>
                                      {/if}
                                    {/each}
                                  </div>
                                {/if}
                              </div>
                            </div>
                          </article>
                        {/each}

                        {#if section.items.length === 0}
                          <p class="menu-print-empty-section text-sm italic text-slate-500">No items yet.</p>
                        {/if}
                      </div>
                    </section>
                  {/each}

                  {#if !hasMenuContent && pageIndex === 0}
                    <p
                      class="menu-print-empty-state rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600"
                    >
                      Add a menu item to see it here.
                    </p>
                  {/if}
                </div>

                {#if page.showFooter}
                  <div class="menu-print-footer mt-8 border-t border-slate-300 pt-5">
                    {#if hasBadgeLegend}
                      <div class="menu-print-legend mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs leading-5 text-slate-600">
                        {#each activeBadges as badge (badge.id)}
                          <span class="inline-flex items-center gap-1.5">
                            <span class="menu-badge-chip" style={badgeChipStyle(badge)}>
                              {badge.shortCode || badge.label.slice(0, 2)}
                            </span>
                            <span>{badge.label}</span>
                          </span>
                        {/each}
                      </div>
                    {/if}

                    {#if hasFooterDetails || hasQrCodeUrl}
                    <div class={hasQrCodeUrl ? 'grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start' : 'grid gap-4'}>
                      {#if hasFooterDetails}
                        <div class="space-y-3 text-sm leading-6 text-slate-600">
                          {#if menu.footerNote.trim()}
                            <p class="flex gap-2">
                              <StickyNote class="mt-1 h-4 w-4 shrink-0 text-brand-700" />
                              <span>{menu.footerNote}</span>
                            </p>
                          {/if}

                          {#if menu.disclaimer.trim()}
                            <p class="text-xs leading-5 text-slate-500">{menu.disclaimer}</p>
                          {/if}
                        </div>
                      {/if}

                      {#if hasQrCodeUrl}
                        <div class="justify-self-center rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm sm:justify-self-end">
                          {#if qrCodeDataUrl}
                            <img class="mx-auto h-28 w-28" src={qrCodeDataUrl} alt={qrCodeCaption} />
                          {:else}
                            <div class="flex h-28 w-28 items-center justify-center rounded-md border border-dashed border-slate-300 p-3 text-xs text-slate-500">
                              {qrCodeError || 'Creating QR code...'}
                            </div>
                          {/if}
                          <p class="mt-2 max-w-32 text-xs font-medium leading-4 text-slate-700">{qrCodeCaption}</p>
                        </div>
                      {/if}
                    </div>
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </div>
    </aside>
  </div>
</main>
