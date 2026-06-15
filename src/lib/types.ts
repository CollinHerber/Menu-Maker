export type LogoPlacement = 'above-eyebrow' | 'below-eyebrow' | 'left-eyebrow' | 'right-eyebrow';
export type ImageFit = 'contain' | 'cover';
export type SectionImageLayout = 'none' | 'thumbnail' | 'banner';
export type SectionColumnSpan = 1 | 2;
export type StylePresetId = 'simple' | 'elegant' | 'professional' | 'hometown';
export type PrintPageSize = 'letter' | 'a4';
export type PrintOrientation = 'portrait' | 'landscape';
export type PrintMargin = 'compact' | 'standard' | 'wide';
export type PrintDensity = 'comfortable' | 'compact';
export type EditorPanelId = 'menu' | 'sections' | 'design' | 'print' | 'details';
export type WizardStep = 'basics' | 'style' | 'logo';
export type ExportImageFormat = 'png' | 'jpeg';
export type SectionDropPosition = 'before' | 'after';
export type DesignSettingKey =
    | 'titleScale'
    | 'sectionHeadingScale'
    | 'itemTextScale'
    | 'descriptionTextScale'
    | 'lineHeightScale'
    | 'headerSpacingScale'
    | 'sectionSpacingScale'
    | 'itemSpacingScale'
    | 'dividerWeightScale'
    | 'decorationScale';
export type DesignColorSettingKey = 'accentColor' | 'backgroundColor' | 'textColor' | 'mutedColor' | 'ruleColor';
export type DesignFontWeightSettingKey =
    | 'titleWeight'
    | 'subtitleWeight'
    | 'sectionHeadingWeight'
    | 'itemNameWeight'
    | 'descriptionWeight'
    | 'priceWeight'
    | 'footerWeight';
export type DesignTextTransformSettingKey = 'sectionHeadingTransform' | 'itemNameTransform';
export type HeadingFontChoice = 'preset' | 'serif' | 'sans' | 'display';
export type BodyFontChoice = 'preset' | 'sans' | 'serif';
export type DividerStyle = 'preset' | 'line' | 'bold' | 'double' | 'none';
export type BorderStyle = 'none' | 'line' | 'double' | 'dotted' | 'ornate';
export type CornerStyle = 'none' | 'line' | 'flourish';
export type HeaderFlair = 'none' | 'rule' | 'ornament';
export type WatermarkStyle = 'none' | 'botanical';
export type PaperTexture = 'none' | 'warm' | 'parchment' | 'sage';
export type FontWeightChoice = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextTransformChoice = 'preset' | 'none' | 'uppercase' | 'capitalize';
export type TextAlignChoice = 'left' | 'center' | 'right';
export type ItemLayoutChoice = 'stacked' | 'inline' | 'right-price' | 'leader' | 'centered';
export type SectionItemLayoutChoice = 'preset' | ItemLayoutChoice;
export type PriceCurrencyStyle = 'symbol' | 'plain';
export type PriceDecimalStyle = 'auto' | 'always' | 'trim';
export type DescriptionIndent = 'none' | 'slight' | 'deep';
export type SectionHeadingAlignChoice = 'preset' | TextAlignChoice;
export type SectionBackgroundStyle = 'none' | 'tint' | 'box';
export type BadgeColorKey = 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'slate';
export type ItemImageShape = 'square' | 'rounded' | 'circle' | 'wide';
export type SizeDisplay = 'inline' | 'stacked';
export type ModifierDisplay = 'list' | 'inline';

export type PrintSettings = {
    pageSize: PrintPageSize;
    orientation: PrintOrientation;
    margin: PrintMargin;
    columns: SectionColumnSpan;
    density: PrintDensity;
  };

export type DesignSettings = {
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    mutedColor: string;
    ruleColor: string;
    headingFont: HeadingFontChoice;
    bodyFont: BodyFontChoice;
    dividerStyle: DividerStyle;
    borderStyle: BorderStyle;
    cornerStyle: CornerStyle;
    headerFlair: HeaderFlair;
    watermarkStyle: WatermarkStyle;
    paperTexture: PaperTexture;
    titleScale: number;
    sectionHeadingScale: number;
    itemTextScale: number;
    descriptionTextScale: number;
    lineHeightScale: number;
    headerSpacingScale: number;
    sectionSpacingScale: number;
    itemSpacingScale: number;
    dividerWeightScale: number;
    decorationScale: number;
    headerAlign: TextAlignChoice;
    sectionHeadingAlign: TextAlignChoice;
    titleWeight: FontWeightChoice;
    subtitleWeight: FontWeightChoice;
    sectionHeadingWeight: FontWeightChoice;
    itemNameWeight: FontWeightChoice;
    descriptionWeight: FontWeightChoice;
    priceWeight: FontWeightChoice;
    footerWeight: FontWeightChoice;
    sectionHeadingTransform: TextTransformChoice;
    itemNameTransform: TextTransformChoice;
    titleLetterSpacingScale: number;
    sectionLetterSpacingScale: number;
    itemLayout: ItemLayoutChoice;
    priceCurrencyStyle: PriceCurrencyStyle;
    priceDecimalStyle: PriceDecimalStyle;
    descriptionIndent: DescriptionIndent;
    sizeDisplay: SizeDisplay;
    modifierDisplay: ModifierDisplay;
  };

export type ItemBadge = {
    id: string;
    label: string;
    shortCode: string;
    color: BadgeColorKey;
  };

export type ItemImageSettings = {
    fit: ImageFit;
    scale: number;
    focalX: number;
    focalY: number;
    shape: ItemImageShape;
  };

export type ItemSize = {
    id: string;
    label: string;
    price: string;
  };

export type ModifierOption = {
    id: string;
    label: string;
    price: string;
  };

export type ModifierGroup = {
    id: string;
    name: string;
    options: ModifierOption[];
  };

export type MenuItem = {
    id: string;
    name: string;
    description: string;
    price: string;
    imageDataUrl: string;
    imageName: string;
    imageAlt: string;
    badgeIds: string[];
    imageUseSectionDefaults: boolean;
    image: ItemImageSettings;
    sizes: ItemSize[];
    modifierGroups: ModifierGroup[];
  };

export type MenuSection = {
    id: string;
    name: string;
    columnSpan: SectionColumnSpan;
    imageLayout: SectionImageLayout;
    note: string;
    headingAlign: SectionHeadingAlignChoice;
    dividerStyle: DividerStyle;
    backgroundStyle: SectionBackgroundStyle;
    itemLayout: SectionItemLayoutChoice;
    imageDefaults: ItemImageSettings;
    items: MenuItem[];
  };

export type MenuVariant = {
    id: string;
    name: string;
    subtitle: string;
    eyebrow: string;
    footerNote: string;
    disclaimer: string;
    qrCodeUrl: string;
    qrCodeLabel: string;
    sections: MenuSection[];
  };

export type MenuDraft = {
    name: string;
    subtitle: string;
    eyebrow: string;
    address: string;
    phone: string;
    website: string;
    hours: string;
    socialHandle: string;
    footerNote: string;
    disclaimer: string;
    qrCodeUrl: string;
    qrCodeLabel: string;
    stylePresetId: StylePresetId;
    printSettings: PrintSettings;
    designSettings: DesignSettings;
    logoDataUrl: string;
    logoName: string;
    logoAlt: string;
    logoFit: ImageFit;
    logoScale: number;
    logoOffsetX: number;
    logoOffsetY: number;
    logoPlacement: LogoPlacement;
    customBadges: ItemBadge[];
    showBadgeLegend: boolean;
    activeVariantId: string;
    variants: MenuVariant[];
    sections: MenuSection[];
  };

export type MenuDraftFile = {
    app: 'MenuMaker';
    schemaVersion: 1;
    exportedAt: string;
    draft: MenuDraft;
  };

export type TemplateMenuItem = Pick<MenuItem, 'name' | 'description' | 'price'> &
    Partial<Pick<MenuItem, 'imageDataUrl' | 'imageName' | 'imageAlt'>>;

export type TemplateSection = {
    name: string;
    columnSpan?: SectionColumnSpan;
    imageLayout?: SectionImageLayout;
    note?: string;
    headingAlign?: SectionHeadingAlignChoice;
    dividerStyle?: DividerStyle;
    backgroundStyle?: SectionBackgroundStyle;
    itemLayout?: SectionItemLayoutChoice;
    items: TemplateMenuItem[];
  };

export type MenuTemplate = {
    id: string;
    name: string;
    description: string;
    bestFor: string;
    defaultName: string;
    subtitle: string;
    eyebrow: string;
    footerNote?: string;
    sections: TemplateSection[];
  };

export type StylePreset = {
    id: StylePresetId;
    name: string;
    description: string;
    swatch: string;
    previewClass: string;
    variables: Record<string, string>;
  };

export type CsvImportMode = 'append' | 'replace';

export type CsvPreviewRow = {
    rowNumber: number;
    section: string;
    name: string;
    description: string;
    price: string;
  };

export type CsvPreviewSectionSummary = {
    section: string;
    itemCount: number;
  };

export type QuickAddItemDraft = Pick<MenuItem, 'name' | 'description' | 'price'>;

export type DraftHistoryEntry = {
    id: string;
    itemCount: number;
    label: string;
    menuName: string;
    savedAt: string;
    sectionCount: number;
    snapshot: string;
  };

export type PreviewSectionChunk = {
    id: string;
    sectionId: string;
    name: string;
    columnSpan: SectionColumnSpan;
    imageLayout: SectionImageLayout;
    note: string;
    headingAlign: SectionHeadingAlignChoice;
    dividerStyle: DividerStyle;
    backgroundStyle: SectionBackgroundStyle;
    itemLayout: SectionItemLayoutChoice;
    imageDefaults: ItemImageSettings;
    items: MenuItem[];
    isContinuation: boolean;
  };

export type PreviewPage = {
    id: string;
    sections: PreviewSectionChunk[];
    showFooter: boolean;
    showHeader: boolean;
  };

export type PdfPageImage = {
    imageBytes: Uint8Array;
    imageHeight: number;
    imageWidth: number;
    pageHeight: number;
    pageWidth: number;
  };

export type PreparedImageUpload = {
    dataUrl: string;
    fileName: string;
    finalBytes: number;
    originalBytes: number;
    resized: boolean;
  };
