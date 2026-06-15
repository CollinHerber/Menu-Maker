import type { BadgeColorKey, BodyFontChoice, BorderStyle, CornerStyle, DescriptionIndent, DesignColorSettingKey, DesignFontWeightSettingKey, DesignSettingKey, DesignSettings, DesignTextTransformSettingKey, DividerStyle, EditorPanelId, FontWeightChoice, HeaderFlair, HeadingFontChoice, ImageFit, ItemBadge, ItemImageShape, ItemLayoutChoice, ModifierDisplay, PaperTexture, PriceCurrencyStyle, PriceDecimalStyle, PrintDensity, PrintMargin, PrintOrientation, PrintPageSize, PrintSettings, SectionBackgroundStyle, SectionColumnSpan, SectionHeadingAlignChoice, SectionImageLayout, SectionItemLayoutChoice, SizeDisplay, StylePreset, TextAlignChoice, TextTransformChoice, WatermarkStyle, WizardStep } from './types';

export const storageKey = 'menumaker:draft:v1';
export const historyStorageKey = 'menumaker:draft-history:v1';
export const draftFileSchemaVersion = 1;
export const maxUndoSnapshots = 75;
export const maxDraftHistoryEntries = 15;
export const maxImageUploadDimension = 1400;
export const largeImageUploadThreshold = 650_000;

export const defaultPrintSettings = (): PrintSettings => ({
    pageSize: 'letter',
    orientation: 'portrait',
    margin: 'standard',
    columns: 2,
    density: 'comfortable',
  });

export const printPageSizes: Record<PrintPageSize, { label: string; width: number; height: number; cssSize: string }> = {
    letter: { label: 'Letter', width: 8.5, height: 11, cssSize: 'letter' },
    a4: { label: 'A4', width: 8.27, height: 11.69, cssSize: 'A4' },
  };

export const printMargins: Record<PrintMargin, { label: string; value: string; previewPadding: string }> = {
    compact: { label: 'Compact', value: '0.35in', previewPadding: '1rem' },
    standard: { label: 'Standard', value: '0.5in', previewPadding: '1.5rem' },
    wide: { label: 'Wide', value: '0.75in', previewPadding: '2rem' },
  };

export const printDensities: Record<
    PrintDensity,
    { label: string; itemSpacing: string; sectionSpacing: string; itemSpacingRem: number; sectionSpacingRem: number }
  > = {
    comfortable: {
      label: 'Comfortable',
      itemSpacing: '1rem',
      sectionSpacing: '2rem',
      itemSpacingRem: 1,
      sectionSpacingRem: 2,
    },
    compact: {
      label: 'Compact',
      itemSpacing: '0.7rem',
      sectionSpacing: '1.35rem',
      itemSpacingRem: 0.7,
      sectionSpacingRem: 1.35,
    },
  };
export const previewPaddingPixels: Record<PrintMargin, number> = {
    compact: 16,
    standard: 24,
    wide: 32,
  };
export const printPageSizeOptions: PrintPageSize[] = ['letter', 'a4'];
export const printOrientationOptions: PrintOrientation[] = ['portrait', 'landscape'];
export const printMarginOptions: PrintMargin[] = ['compact', 'standard', 'wide'];
export const printDensityOptions: PrintDensity[] = ['comfortable', 'compact'];
export const printColumnOptions: SectionColumnSpan[] = [1, 2];
export const logoFitOptions: ImageFit[] = ['contain', 'cover'];
export const sectionImageLayoutOptions: Array<{ label: string; value: SectionImageLayout }> = [
    { label: 'None', value: 'none' },
    { label: 'Thumb', value: 'thumbnail' },
    { label: 'Banner', value: 'banner' },
  ];
export const fontWeightOptions: Array<{ label: string; value: FontWeightChoice }> = [
    { label: 'Regular', value: 'regular' },
    { label: 'Medium', value: 'medium' },
    { label: 'Semi', value: 'semibold' },
    { label: 'Bold', value: 'bold' },
  ];
export const textAlignOptions: Array<{ label: string; value: TextAlignChoice }> = [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ];
export const sectionHeadingAlignOptions: Array<{ label: string; value: SectionHeadingAlignChoice }> = [
    { label: 'Preset', value: 'preset' },
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ];
export const textTransformOptions: Array<{ label: string; value: TextTransformChoice }> = [
    { label: 'Preset', value: 'preset' },
    { label: 'None', value: 'none' },
    { label: 'Upper', value: 'uppercase' },
    { label: 'Title', value: 'capitalize' },
  ];
export const typographyWeightControls: Array<{ label: string; setting: DesignFontWeightSettingKey }> = [
    { label: 'Title', setting: 'titleWeight' },
    { label: 'Subtitle', setting: 'subtitleWeight' },
    { label: 'Sections', setting: 'sectionHeadingWeight' },
    { label: 'Items', setting: 'itemNameWeight' },
    { label: 'Descriptions', setting: 'descriptionWeight' },
    { label: 'Prices', setting: 'priceWeight' },
    { label: 'Footer', setting: 'footerWeight' },
  ];
export const textTransformControls: Array<{ label: string; setting: DesignTextTransformSettingKey }> = [
    { label: 'Section headings', setting: 'sectionHeadingTransform' },
    { label: 'Item names', setting: 'itemNameTransform' },
  ];
export const itemLayoutOptions: Array<{ label: string; value: ItemLayoutChoice }> = [
    { label: 'Stacked', value: 'stacked' },
    { label: 'Inline', value: 'inline' },
    { label: 'Right', value: 'right-price' },
    { label: 'Leaders', value: 'leader' },
    { label: 'Center', value: 'centered' },
  ];
export const sectionItemLayoutOptions: Array<{ label: string; value: SectionItemLayoutChoice }> = [
    { label: 'Preset', value: 'preset' },
    ...itemLayoutOptions,
  ];
export const priceCurrencyOptions: Array<{ label: string; value: PriceCurrencyStyle }> = [
    { label: '$', value: 'symbol' },
    { label: 'Plain', value: 'plain' },
  ];
export const priceDecimalOptions: Array<{ label: string; value: PriceDecimalStyle }> = [
    { label: 'Auto', value: 'auto' },
    { label: 'Always', value: 'always' },
    { label: 'Trim', value: 'trim' },
  ];
export const descriptionIndentOptions: Array<{ label: string; value: DescriptionIndent }> = [
    { label: 'None', value: 'none' },
    { label: 'Slight', value: 'slight' },
    { label: 'Deep', value: 'deep' },
  ];
export const sectionBackgroundOptions: Array<{ label: string; value: SectionBackgroundStyle }> = [
    { label: 'None', value: 'none' },
    { label: 'Tint', value: 'tint' },
    { label: 'Box', value: 'box' },
  ];
  // Static hex palette (not Tailwind oklch) so badge chips survive html2canvas image/PDF export.
export const badgeColorStyles: Record<BadgeColorKey, { bg: string; text: string; border: string }> = {
    green: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
    amber: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    red: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
    blue: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
    purple: { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' },
    slate: { bg: '#e2e8f0', text: '#334155', border: '#cbd5e1' },
  };
export const badgeColorOptions: Array<{ label: string; value: BadgeColorKey }> = [
    { label: 'Green', value: 'green' },
    { label: 'Amber', value: 'amber' },
    { label: 'Red', value: 'red' },
    { label: 'Blue', value: 'blue' },
    { label: 'Purple', value: 'purple' },
    { label: 'Slate', value: 'slate' },
  ];
export const itemImageShapeOptions: Array<{ label: string; value: ItemImageShape }> = [
    { label: 'Square', value: 'square' },
    { label: 'Rounded', value: 'rounded' },
    { label: 'Circle', value: 'circle' },
    { label: 'Wide', value: 'wide' },
  ];
export const sizeDisplayOptions: Array<{ label: string; value: SizeDisplay }> = [
    { label: 'Stacked', value: 'stacked' },
    { label: 'Inline', value: 'inline' },
  ];
export const modifierDisplayOptions: Array<{ label: string; value: ModifierDisplay }> = [
    { label: 'List', value: 'list' },
    { label: 'Inline', value: 'inline' },
  ];
export const builtInBadges: ItemBadge[] = [
    { id: 'vegan', label: 'Vegan', shortCode: 'VG', color: 'green' },
    { id: 'vegetarian', label: 'Vegetarian', shortCode: 'V', color: 'green' },
    { id: 'gluten-free', label: 'Gluten-free', shortCode: 'GF', color: 'amber' },
    { id: 'dairy-free', label: 'Dairy-free', shortCode: 'DF', color: 'blue' },
    { id: 'nut-free', label: 'Nut-free', shortCode: 'NF', color: 'blue' },
    { id: 'spicy', label: 'Spicy', shortCode: 'S', color: 'red' },
    { id: 'popular', label: 'Popular', shortCode: 'POP', color: 'amber' },
    { id: 'new', label: 'New', shortCode: 'NEW', color: 'purple' },
    { id: 'chef-special', label: "Chef's special", shortCode: 'CHEF', color: 'purple' },
  ];
export const previewPixelsPerInch = 72;
export const editorPanels: Array<{ id: EditorPanelId; label: string; description: string }> = [
    { id: 'menu', label: 'Menu', description: 'Name, subtitle, and logo' },
    { id: 'sections', label: 'Items', description: 'Sections and menu items' },
    { id: 'design', label: 'Design', description: 'Visual presets' },
    { id: 'print', label: 'Print', description: 'Page setup' },
    { id: 'details', label: 'Details', description: 'Contact and QR details' },
  ];
export const wizardSteps: Array<{ id: WizardStep; label: string }> = [
    { id: 'basics', label: 'Basics' },
    { id: 'style', label: 'Style' },
    { id: 'logo', label: 'Logo' },
  ];

export const defaultDesignSettings = (): DesignSettings => ({
    accentColor: '',
    backgroundColor: '',
    textColor: '',
    mutedColor: '',
    ruleColor: '',
    headingFont: 'preset',
    bodyFont: 'preset',
    dividerStyle: 'preset',
    borderStyle: 'none',
    cornerStyle: 'none',
    headerFlair: 'none',
    watermarkStyle: 'none',
    paperTexture: 'none',
    titleScale: 100,
    sectionHeadingScale: 100,
    itemTextScale: 100,
    descriptionTextScale: 100,
    lineHeightScale: 100,
    headerSpacingScale: 100,
    sectionSpacingScale: 100,
    itemSpacingScale: 100,
    dividerWeightScale: 100,
    decorationScale: 100,
    headerAlign: 'center',
    sectionHeadingAlign: 'left',
    titleWeight: 'regular',
    subtitleWeight: 'regular',
    sectionHeadingWeight: 'semibold',
    itemNameWeight: 'semibold',
    descriptionWeight: 'regular',
    priceWeight: 'semibold',
    footerWeight: 'regular',
    sectionHeadingTransform: 'preset',
    itemNameTransform: 'none',
    titleLetterSpacingScale: 0,
    sectionLetterSpacingScale: 100,
    itemLayout: 'right-price',
    priceCurrencyStyle: 'symbol',
    priceDecimalStyle: 'always',
    descriptionIndent: 'none',
    sizeDisplay: 'stacked',
    modifierDisplay: 'list',
  });

export const headingFontStacks: Record<Exclude<HeadingFontChoice, 'preset'>, string> = {
    serif: 'Georgia, ui-serif, serif',
    sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
    display: '"Trebuchet MS", Inter, ui-sans-serif, system-ui, sans-serif',
  };

export const bodyFontStacks: Record<Exclude<BodyFontChoice, 'preset'>, string> = {
    sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
  };

export const fontWeightValues: Record<FontWeightChoice, number> = {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  };

export const textAlignJustifyValues: Record<TextAlignChoice, string> = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

export const designColorControls: Array<{
    description: string;
    label: string;
    setting: DesignColorSettingKey;
  }> = [
    { setting: 'accentColor', label: 'Accent', description: 'Used for highlights, icons, and small top text.' },
    { setting: 'backgroundColor', label: 'Paper', description: 'The printable menu background.' },
    { setting: 'textColor', label: 'Text', description: 'Main headings and item names.' },
    { setting: 'mutedColor', label: 'Details', description: 'Descriptions, contact details, and footer notes.' },
    { setting: 'ruleColor', label: 'Dividers', description: 'Section rules and separator lines.' },
  ];

export const headingFontOptions: Array<{ label: string; value: HeadingFontChoice }> = [
    { value: 'preset', label: 'Preset' },
    { value: 'serif', label: 'Serif' },
    { value: 'sans', label: 'Sans' },
    { value: 'display', label: 'Display' },
  ];

export const bodyFontOptions: Array<{ label: string; value: BodyFontChoice }> = [
    { value: 'preset', label: 'Preset' },
    { value: 'sans', label: 'Sans' },
    { value: 'serif', label: 'Serif' },
  ];

export const dividerStyleOptions: Array<{ label: string; value: DividerStyle }> = [
    { value: 'preset', label: 'Preset' },
    { value: 'line', label: 'Line' },
    { value: 'bold', label: 'Bold' },
    { value: 'double', label: 'Double' },
    { value: 'none', label: 'None' },
  ];

export const borderStyleOptions: Array<{ label: string; value: BorderStyle }> = [
    { value: 'none', label: 'None' },
    { value: 'line', label: 'Line' },
    { value: 'double', label: 'Double' },
    { value: 'dotted', label: 'Dots' },
    { value: 'ornate', label: 'Ornate' },
  ];

export const cornerStyleOptions: Array<{ label: string; value: CornerStyle }> = [
    { value: 'none', label: 'None' },
    { value: 'line', label: 'Line' },
    { value: 'flourish', label: 'Flourish' },
  ];

export const headerFlairOptions: Array<{ label: string; value: HeaderFlair }> = [
    { value: 'none', label: 'None' },
    { value: 'rule', label: 'Rule' },
    { value: 'ornament', label: 'Ornament' },
  ];

export const watermarkStyleOptions: Array<{ label: string; value: WatermarkStyle }> = [
    { value: 'none', label: 'None' },
    { value: 'botanical', label: 'Botanical' },
  ];

export const paperTextureOptions: Array<{ label: string; value: PaperTexture }> = [
    { value: 'none', label: 'Clean' },
    { value: 'warm', label: 'Warm' },
    { value: 'parchment', label: 'Parchment' },
    { value: 'sage', label: 'Sage' },
  ];

export const designControlGroups: Array<{
    title: string;
    controls: Array<{
      description: string;
      label: string;
      max: number;
      min: number;
      setting: DesignSettingKey;
      step: number;
      unit: '%';
    }>;
  }> = [
    {
      title: 'Type scale',
      controls: [
        {
          setting: 'titleScale',
          label: 'Menu title',
          description: 'Adjust the restaurant or menu name.',
          min: 80,
          max: 145,
          step: 5,
          unit: '%',
        },
        {
          setting: 'sectionHeadingScale',
          label: 'Section headings',
          description: 'Resize category names like Appetizers or Entrees.',
          min: 80,
          max: 140,
          step: 5,
          unit: '%',
        },
        {
          setting: 'itemTextScale',
          label: 'Item names',
          description: 'Resize menu item names and prices.',
          min: 85,
          max: 130,
          step: 5,
          unit: '%',
        },
        {
          setting: 'descriptionTextScale',
          label: 'Descriptions',
          description: 'Resize item descriptions and small details.',
          min: 80,
          max: 125,
          step: 5,
          unit: '%',
        },
        {
          setting: 'lineHeightScale',
          label: 'Line height',
          description: 'Tighten or relax multi-line descriptions.',
          min: 85,
          max: 130,
          step: 5,
          unit: '%',
        },
      ],
    },
    {
      title: 'Spacing',
      controls: [
        {
          setting: 'headerSpacingScale',
          label: 'Header gap',
          description: 'Space between the header and menu sections.',
          min: 70,
          max: 160,
          step: 5,
          unit: '%',
        },
        {
          setting: 'sectionSpacingScale',
          label: 'Section spacing',
          description: 'Space between section blocks.',
          min: 65,
          max: 170,
          step: 5,
          unit: '%',
        },
        {
          setting: 'itemSpacingScale',
          label: 'Item spacing',
          description: 'Space between menu items inside a section.',
          min: 60,
          max: 170,
          step: 5,
          unit: '%',
        },
        {
          setting: 'dividerWeightScale',
          label: 'Divider weight',
          description: 'Make section rules lighter or bolder.',
          min: 0,
          max: 250,
          step: 10,
          unit: '%',
        },
      ],
    },
    {
      title: 'Decoration',
      controls: [
        {
          setting: 'decorationScale',
          label: 'Flair scale',
          description: 'Resize decorative borders, corners, and ornaments.',
          min: 60,
          max: 150,
          step: 5,
          unit: '%',
        },
      ],
    },
  ];

export const stylePresets: StylePreset[] = [
    {
      id: 'simple',
      name: 'Simple',
      description: 'Clean, spacious, and easy to read.',
      swatch: '#16876f',
      previewClass: 'menu-style-simple',
      variables: {
        '--menu-bg': '#fffdf8',
        '--menu-text': '#172033',
        '--menu-muted': '#5f6b7a',
        '--menu-accent': '#16876f',
        '--menu-rule': '#cbd5e1',
        '--menu-heading-font': 'Georgia, ui-serif, serif',
        '--menu-body-font': 'Inter, ui-sans-serif, system-ui, sans-serif',
        '--menu-section-spacing': '2rem',
        '--menu-item-spacing': '1rem',
        '--menu-header-transform': 'uppercase',
        '--menu-heading-letter-spacing': '0.2em',
        '--menu-section-letter-spacing': '0.12em',
      },
    },
    {
      id: 'elegant',
      name: 'Elegant',
      description: 'Refined contrast with formal typography.',
      swatch: '#8f5c2f',
      previewClass: 'menu-style-elegant',
      variables: {
        '--menu-bg': '#fffaf2',
        '--menu-text': '#221b16',
        '--menu-muted': '#725f52',
        '--menu-accent': '#8f5c2f',
        '--menu-rule': '#d8c3aa',
        '--menu-heading-font': 'Georgia, "Times New Roman", serif',
        '--menu-body-font': 'Inter, ui-sans-serif, system-ui, sans-serif',
        '--menu-section-spacing': '2.25rem',
        '--menu-item-spacing': '1.1rem',
        '--menu-header-transform': 'uppercase',
        '--menu-heading-letter-spacing': '0.24em',
        '--menu-section-letter-spacing': '0.16em',
      },
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Structured, polished, and business-ready.',
      swatch: '#1e4f79',
      previewClass: 'menu-style-professional',
      variables: {
        '--menu-bg': '#f9fbfd',
        '--menu-text': '#111827',
        '--menu-muted': '#4b5563',
        '--menu-accent': '#1e4f79',
        '--menu-rule': '#b9c6d3',
        '--menu-heading-font': 'Inter, ui-sans-serif, system-ui, sans-serif',
        '--menu-body-font': 'Inter, ui-sans-serif, system-ui, sans-serif',
        '--menu-section-spacing': '1.75rem',
        '--menu-item-spacing': '0.85rem',
        '--menu-header-transform': 'none',
        '--menu-heading-letter-spacing': '0',
        '--menu-section-letter-spacing': '0.08em',
      },
    },
    {
      id: 'hometown',
      name: 'Hometown',
      description: 'Warm, friendly, and casual.',
      swatch: '#b5482d',
      previewClass: 'menu-style-hometown',
      variables: {
        '--menu-bg': '#fff8ec',
        '--menu-text': '#2d2118',
        '--menu-muted': '#6f5b4d',
        '--menu-accent': '#b5482d',
        '--menu-rule': '#dfb99c',
        '--menu-heading-font': 'Georgia, ui-serif, serif',
        '--menu-body-font': 'Inter, ui-sans-serif, system-ui, sans-serif',
        '--menu-section-spacing': '2rem',
        '--menu-item-spacing': '1rem',
        '--menu-header-transform': 'uppercase',
        '--menu-heading-letter-spacing': '0.16em',
        '--menu-section-letter-spacing': '0.1em',
      },
    },
  ];
