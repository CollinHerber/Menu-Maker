<script lang="ts">
  import QRCode from 'qrcode';
  import { Button, Modal } from 'flowbite-svelte';
  import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Clock,
    Download,
    DollarSign,
    Eye,
    FileSpreadsheet,
    FileText,
    Globe,
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
    Trash2,
    Upload,
    Utensils,
    X,
  } from '@lucide/svelte';

  type LogoPlacement = 'above-eyebrow' | 'below-eyebrow' | 'left-eyebrow' | 'right-eyebrow';
  type SectionColumnSpan = 1 | 2;
  type StylePresetId = 'simple' | 'elegant' | 'professional' | 'hometown';
  type PrintPageSize = 'letter' | 'a4';
  type PrintOrientation = 'portrait' | 'landscape';
  type PrintMargin = 'compact' | 'standard' | 'wide';
  type PrintDensity = 'comfortable' | 'compact';
  type EditorPanelId = 'menu' | 'sections' | 'design' | 'print' | 'details';

  type PrintSettings = {
    pageSize: PrintPageSize;
    orientation: PrintOrientation;
    margin: PrintMargin;
    columns: SectionColumnSpan;
    density: PrintDensity;
  };

  type MenuItem = {
    id: string;
    name: string;
    description: string;
    price: string;
  };

  type MenuSection = {
    id: string;
    name: string;
    columnSpan: SectionColumnSpan;
    items: MenuItem[];
  };

  type MenuDraft = {
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
    logoDataUrl: string;
    logoName: string;
    logoPlacement: LogoPlacement;
    sections: MenuSection[];
  };

  type MenuDraftFile = {
    app: 'MenuMaker';
    schemaVersion: 1;
    exportedAt: string;
    draft: MenuDraft;
  };

  type TemplateMenuItem = Omit<MenuItem, 'id'>;

  type TemplateSection = {
    name: string;
    columnSpan?: SectionColumnSpan;
    items: TemplateMenuItem[];
  };

  type MenuTemplate = {
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

  type StylePreset = {
    id: StylePresetId;
    name: string;
    description: string;
    swatch: string;
    previewClass: string;
    variables: Record<string, string>;
  };

  type CsvImportMode = 'append' | 'replace';

  type CsvPreviewRow = {
    rowNumber: number;
    section: string;
    name: string;
    description: string;
    price: string;
  };

  type CsvPreviewSectionSummary = {
    section: string;
    itemCount: number;
  };

  const storageKey = 'menumaker:draft:v1';
  const draftFileSchemaVersion = 1;

  const defaultPrintSettings = (): PrintSettings => ({
    pageSize: 'letter',
    orientation: 'portrait',
    margin: 'standard',
    columns: 2,
    density: 'comfortable',
  });

  const printPageSizes: Record<PrintPageSize, { label: string; width: number; height: number; cssSize: string }> = {
    letter: { label: 'Letter', width: 8.5, height: 11, cssSize: 'letter' },
    a4: { label: 'A4', width: 8.27, height: 11.69, cssSize: 'A4' },
  };

  const printMargins: Record<PrintMargin, { label: string; value: string; previewPadding: string }> = {
    compact: { label: 'Compact', value: '0.35in', previewPadding: '1rem' },
    standard: { label: 'Standard', value: '0.5in', previewPadding: '1.5rem' },
    wide: { label: 'Wide', value: '0.75in', previewPadding: '2rem' },
  };

  const printDensities: Record<PrintDensity, { label: string; itemSpacing: string; sectionSpacing: string }> = {
    comfortable: { label: 'Comfortable', itemSpacing: '1rem', sectionSpacing: '2rem' },
    compact: { label: 'Compact', itemSpacing: '0.7rem', sectionSpacing: '1.35rem' },
  };
  const printPageSizeOptions: PrintPageSize[] = ['letter', 'a4'];
  const printOrientationOptions: PrintOrientation[] = ['portrait', 'landscape'];
  const printMarginOptions: PrintMargin[] = ['compact', 'standard', 'wide'];
  const printDensityOptions: PrintDensity[] = ['comfortable', 'compact'];
  const printColumnOptions: SectionColumnSpan[] = [1, 2];
  const editorPanels: Array<{ id: EditorPanelId; label: string; description: string }> = [
    { id: 'menu', label: 'Menu', description: 'Name, subtitle, and logo' },
    { id: 'sections', label: 'Items', description: 'Sections and menu items' },
    { id: 'design', label: 'Design', description: 'Visual presets' },
    { id: 'print', label: 'Print', description: 'Page setup' },
    { id: 'details', label: 'Details', description: 'Contact and QR details' },
  ];

  const stylePresets: StylePreset[] = [
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

  const createId = () => crypto.randomUUID();

  const createItem = (overrides: Partial<MenuItem> = {}): MenuItem => ({
    id: createId(),
    name: '',
    description: '',
    price: '',
    ...overrides,
  });

  const defaultSectionColumnSpan = (name: string): SectionColumnSpan =>
    name === 'Burgers' || name === 'Sandwiches & Wraps' ? 1 : 2;

  const createSection = (name = 'New Section', columnSpan: SectionColumnSpan = 2): MenuSection => ({
    id: createId(),
    name,
    columnSpan,
    items: [],
  });

  const starterMenu = (): MenuDraft => ({
    name: 'Main Street Grill',
    subtitle: 'Small town favorites served fresh',
    eyebrow: "Today's Menu",
    address: '123 Main Street, Yourtown, USA',
    phone: '(555) 123-4567',
    website: 'mainstreetgrill.example',
    hours: 'Open daily 11 AM - 9 PM',
    socialHandle: '@mainstreetgrill',
    footerNote: 'Ask about our daily specials and catering options.',
    disclaimer: 'Consuming raw or undercooked meats may increase your risk of foodborne illness.',
    qrCodeUrl: 'https://example.com/order',
    qrCodeLabel: 'Scan for online ordering',
    stylePresetId: 'simple',
    printSettings: defaultPrintSettings(),
    logoDataUrl: '',
    logoName: '',
    logoPlacement: 'above-eyebrow',
    sections: [
      {
        id: createId(),
        name: 'Appetizers',
        columnSpan: 2,
        items: [
          createItem({
            name: 'Onion Rings',
            description: 'Thick-cut rings, fried crisp and served with ranch',
            price: '8.99',
          }),
          createItem({
            name: 'Cheese Curds',
            description: 'Golden-fried Wisconsin-style curds with marinara',
            price: '9.99',
          }),
          createItem({
            name: 'Loaded Potato Skins',
            description: 'Bacon, cheddar, green onion, and sour cream',
            price: '10.99',
          }),
        ],
      },
      {
        id: createId(),
        name: 'Burgers',
        columnSpan: 1,
        items: [
          createItem({
            name: 'Classic Beef Burger',
            description: 'Hand-pattied beef, lettuce, tomato, onion, and pickle',
            price: '12.99',
          }),
          createItem({
            name: 'Bacon Cheeseburger',
            description: 'Cheddar, smoked bacon, and house burger sauce',
            price: '14.49',
          }),
          createItem({
            name: 'Mushroom Swiss Burger',
            description: 'Sauteed mushrooms, Swiss cheese, and mayo',
            price: '14.99',
          }),
        ],
      },
      {
        id: createId(),
        name: 'Sandwiches & Wraps',
        columnSpan: 1,
        items: [
          createItem({
            name: 'Crispy Chicken Wrap',
            description: 'Crispy chicken, lettuce, cheddar, tomato, and ranch',
            price: '12.49',
          }),
          createItem({
            name: 'Grilled Chicken Bacon Ranch Wrap',
            description: 'Grilled chicken, bacon, cheddar, lettuce, and ranch',
            price: '12.99',
          }),
          createItem({
            name: 'BLT Sandwich',
            description: 'Bacon, lettuce, tomato, and mayo on toasted bread',
            price: '10.99',
          }),
        ],
      },
      {
        id: createId(),
        name: 'Pizza',
        columnSpan: 2,
        items: [
          createItem({
            name: 'Cheese Pizza',
            description: 'House sauce and mozzarella on a crisp crust',
            price: '12.99',
          }),
          createItem({
            name: 'Pepperoni Pizza',
            description: 'Mozzarella, house sauce, and plenty of pepperoni',
            price: '14.99',
          }),
          createItem({
            name: 'Meat Lovers Pizza',
            description: 'Sausage, pepperoni, bacon, and hamburger',
            price: '16.99',
          }),
        ],
      },
      {
        id: createId(),
        name: 'Entrees',
        columnSpan: 2,
        items: [
          createItem({
            name: 'Chicken Fried Steak',
            description: 'Country gravy, mashed potatoes, and green beans',
            price: '15.99',
          }),
          createItem({
            name: 'Hot Beef Plate',
            description: 'Open-faced roast beef, mashed potatoes, and gravy',
            price: '15.49',
          }),
          createItem({
            name: 'Walleye Dinner',
            description: 'Lightly breaded walleye with fries and coleslaw',
            price: '17.99',
          }),
        ],
      },
    ],
  });

  const menuTemplates: MenuTemplate[] = [
    {
      id: 'diner',
      name: 'Classic diner',
      description: 'A familiar all-day layout with breakfast, burgers, plates, and sides.',
      bestFor: 'diners, grills, cafes with broad menus',
      defaultName: 'Main Street Diner',
      subtitle: 'All-day favorites made fresh',
      eyebrow: "Today's Menu",
      footerNote: 'Ask your server about daily soups, pies, and blue plate specials.',
      sections: [
        {
          name: 'Breakfast Classics',
          columnSpan: 2,
          items: [
            {
              name: 'Two Egg Breakfast',
              description: 'Two eggs, breakfast potatoes, toast, and choice of bacon or sausage',
              price: '10.99',
            },
            {
              name: 'Buttermilk Pancakes',
              description: 'Three pancakes with whipped butter and maple syrup',
              price: '9.99',
            },
          ],
        },
        {
          name: 'Burgers & Sandwiches',
          columnSpan: 1,
          items: [
            {
              name: 'Diner Cheeseburger',
              description: 'American cheese, lettuce, tomato, onion, pickle, and house sauce',
              price: '12.99',
            },
            {
              name: 'Turkey Club',
              description: 'Roasted turkey, bacon, lettuce, tomato, and mayo on toast',
              price: '11.99',
            },
          ],
        },
        {
          name: 'Plates & Sides',
          columnSpan: 1,
          items: [
            {
              name: 'Chicken Fried Steak',
              description: 'Country gravy, mashed potatoes, and green beans',
              price: '15.99',
            },
            {
              name: 'Crispy Fries',
              description: 'Basket of golden fries with house seasoning',
              price: '4.99',
            },
          ],
        },
      ],
    },
    {
      id: 'cafe',
      name: 'Neighborhood cafe',
      description: 'Coffee, bakery, breakfast, and light lunch sections for a relaxed cafe.',
      bestFor: 'coffee shops, bakeries, lunch cafes',
      defaultName: 'Corner Cafe',
      subtitle: 'Coffee, pastries, and simple comforts',
      eyebrow: 'Cafe Menu',
      footerNote: 'Milk alternatives and gluten-free options available on request.',
      sections: [
        {
          name: 'Coffee & Espresso',
          columnSpan: 1,
          items: [
            {
              name: 'Latte',
              description: 'Espresso with steamed milk and a light layer of foam',
              price: '4.75',
            },
            {
              name: 'Cold Brew',
              description: 'Slow-steeped coffee served over ice',
              price: '4.50',
            },
          ],
        },
        {
          name: 'Bakery',
          columnSpan: 1,
          items: [
            {
              name: 'Blueberry Muffin',
              description: 'House-baked muffin with fresh blueberries',
              price: '3.99',
            },
            {
              name: 'Cinnamon Roll',
              description: 'Soft roll with cream cheese icing',
              price: '4.99',
            },
          ],
        },
        {
          name: 'Breakfast & Lunch',
          columnSpan: 2,
          items: [
            {
              name: 'Avocado Toast',
              description: 'Sourdough, smashed avocado, tomato, herbs, and lemon',
              price: '9.99',
            },
            {
              name: 'Chicken Salad Croissant',
              description: 'House chicken salad, lettuce, and tomato on a butter croissant',
              price: '11.49',
            },
          ],
        },
      ],
    },
    {
      id: 'bar',
      name: 'Bar & grill',
      description: 'Shareables, handhelds, cocktails, and beer-friendly menu structure.',
      bestFor: 'bars, pubs, taverns, sports grills',
      defaultName: 'The Local Tap',
      subtitle: 'Shareables, handhelds, and cold drinks',
      eyebrow: 'Bar Menu',
      footerNote: 'Happy hour specials available Monday through Friday.',
      sections: [
        {
          name: 'Shareables',
          columnSpan: 2,
          items: [
            {
              name: 'Loaded Nachos',
              description: 'Tortilla chips, queso, jalapenos, pico, sour cream, and salsa',
              price: '12.99',
            },
            {
              name: 'Wings',
              description: 'Crispy wings tossed in buffalo, barbecue, or garlic parmesan',
              price: '13.99',
            },
          ],
        },
        {
          name: 'Burgers & Handhelds',
          columnSpan: 1,
          items: [
            {
              name: 'Pub Burger',
              description: 'Cheddar, onion jam, lettuce, tomato, and pub sauce',
              price: '14.99',
            },
            {
              name: 'Fish Tacos',
              description: 'Beer-battered fish, slaw, crema, and lime',
              price: '13.49',
            },
          ],
        },
        {
          name: 'Cocktails',
          columnSpan: 1,
          items: [
            {
              name: 'House Old Fashioned',
              description: 'Bourbon, bitters, sugar, orange, and cherry',
              price: '10.00',
            },
            {
              name: 'Spicy Margarita',
              description: 'Tequila, lime, orange liqueur, and jalapeno',
              price: '11.00',
            },
          ],
        },
      ],
    },
    {
      id: 'pizza-shop',
      name: 'Pizza shop',
      description: 'Pizza-forward template with starters, salads, specialty pies, and add-ons.',
      bestFor: 'pizzerias, carryout shops, family restaurants',
      defaultName: "Tony's Pizza",
      subtitle: 'Hand-tossed pies and neighborhood favorites',
      eyebrow: 'Pizza Menu',
      footerNote: 'Build your own pizza with your favorite toppings.',
      sections: [
        {
          name: 'Starters',
          columnSpan: 1,
          items: [
            {
              name: 'Garlic Knots',
              description: 'Baked knots tossed with garlic butter and parmesan',
              price: '6.99',
            },
            {
              name: 'Mozzarella Sticks',
              description: 'Fried mozzarella served with marinara',
              price: '8.99',
            },
          ],
        },
        {
          name: 'Specialty Pizzas',
          columnSpan: 2,
          items: [
            {
              name: 'Margherita',
              description: 'Fresh mozzarella, tomato, basil, and olive oil',
              price: '15.99',
            },
            {
              name: 'Supreme',
              description: 'Pepperoni, sausage, peppers, onions, mushrooms, and olives',
              price: '18.99',
            },
          ],
        },
        {
          name: 'Salads & Sides',
          columnSpan: 1,
          items: [
            {
              name: 'House Salad',
              description: 'Mixed greens, tomato, cucumber, onion, and house dressing',
              price: '7.99',
            },
            {
              name: 'Extra Toppings',
              description: 'Pepperoni, sausage, mushrooms, peppers, onions, olives, or jalapenos',
              price: '1.50',
            },
          ],
        },
      ],
    },
    {
      id: 'food-truck',
      name: 'Food truck',
      description: 'Compact, fast-moving layout for signature items, sides, and drinks.',
      bestFor: 'food trucks, pop-ups, festivals, quick service',
      defaultName: 'Rolling Kitchen',
      subtitle: 'Fast, fresh, and made to order',
      eyebrow: 'Truck Menu',
      footerNote: 'Follow us online for weekly stops and limited specials.',
      sections: [
        {
          name: 'Street Tacos',
          columnSpan: 2,
          items: [
            {
              name: 'Carne Asada Taco',
              description: 'Grilled steak, onion, cilantro, salsa verde, and lime',
              price: '4.50',
            },
            {
              name: 'Crispy Fish Taco',
              description: 'Fried fish, slaw, chipotle crema, and pico',
              price: '4.75',
            },
          ],
        },
        {
          name: 'Handhelds',
          columnSpan: 1,
          items: [
            {
              name: 'Smash Burger',
              description: 'Double patty, American cheese, pickles, and truck sauce',
              price: '11.99',
            },
            {
              name: 'Chicken Rice Bowl',
              description: 'Grilled chicken, rice, beans, salsa, and crema',
              price: '12.49',
            },
          ],
        },
        {
          name: 'Sides & Drinks',
          columnSpan: 1,
          items: [
            {
              name: 'Elote Cup',
              description: 'Street corn, cotija, crema, chili, and lime',
              price: '5.99',
            },
            {
              name: 'Agua Fresca',
              description: 'Rotating seasonal fruit drink',
              price: '3.99',
            },
          ],
        },
      ],
    },
    {
      id: 'fine-dining',
      name: 'Fine dining',
      description: 'Minimal, polished sections for starters, entrees, desserts, and pairings.',
      bestFor: 'upscale restaurants, prix fixe menus, date-night venues',
      defaultName: 'Atelier Table',
      subtitle: 'Seasonal dining with thoughtful pairings',
      eyebrow: 'Dinner Menu',
      footerNote: 'Wine pairings are available for each course.',
      sections: [
        {
          name: 'Starters',
          columnSpan: 2,
          items: [
            {
              name: 'Burrata',
              description: 'Roasted tomatoes, basil oil, aged balsamic, and grilled bread',
              price: '15.00',
            },
            {
              name: 'Seared Scallops',
              description: 'Cauliflower puree, brown butter, capers, and herbs',
              price: '18.00',
            },
          ],
        },
        {
          name: 'Entrees',
          columnSpan: 2,
          items: [
            {
              name: 'Braised Short Rib',
              description: 'Potato puree, glazed carrots, pearl onions, and red wine jus',
              price: '34.00',
            },
            {
              name: 'Pan-Roasted Salmon',
              description: 'Lemon risotto, asparagus, dill, and beurre blanc',
              price: '29.00',
            },
          ],
        },
        {
          name: 'Desserts',
          columnSpan: 2,
          items: [
            {
              name: 'Chocolate Torte',
              description: 'Dark chocolate, espresso cream, and toasted hazelnut',
              price: '11.00',
            },
            {
              name: 'Lemon Panna Cotta',
              description: 'Vanilla cream, lemon curd, and shortbread crumble',
              price: '10.00',
            },
          ],
        },
      ],
    },
    {
      id: 'brunch',
      name: 'Brunch',
      description: 'Weekend-friendly template with savory plates, sweet griddle items, and drinks.',
      bestFor: 'brunch spots, cafes, event menus',
      defaultName: 'Sunday Brunch Co.',
      subtitle: 'Late mornings, fresh coffee, and weekend plates',
      eyebrow: 'Brunch Menu',
      footerNote: 'Brunch served Saturday and Sunday until 2 PM.',
      sections: [
        {
          name: 'Brunch Plates',
          columnSpan: 2,
          items: [
            {
              name: 'Eggs Benedict',
              description: 'Poached eggs, ham, English muffin, hollandaise, and potatoes',
              price: '14.99',
            },
            {
              name: 'Veggie Hash',
              description: 'Seasonal vegetables, potatoes, eggs, and herb sauce',
              price: '13.49',
            },
          ],
        },
        {
          name: 'Sweet Griddle',
          columnSpan: 1,
          items: [
            {
              name: 'French Toast',
              description: 'Brioche, cinnamon custard, berries, and maple syrup',
              price: '12.49',
            },
            {
              name: 'Lemon Ricotta Pancakes',
              description: 'Fluffy pancakes with lemon curd and powdered sugar',
              price: '12.99',
            },
          ],
        },
        {
          name: 'Brunch Drinks',
          columnSpan: 1,
          items: [
            {
              name: 'Mimosa',
              description: 'Sparkling wine and orange juice',
              price: '8.00',
            },
            {
              name: 'Bloody Mary',
              description: 'Vodka, tomato, spice blend, and house garnish',
              price: '9.00',
            },
          ],
        },
      ],
    },
    {
      id: 'drinks',
      name: 'Drinks menu',
      description: 'Dedicated drinks layout for coffee, cocktails, beer, wine, and zero-proof options.',
      bestFor: 'bars, cafes, beverage menus, event drink lists',
      defaultName: 'The Pour List',
      subtitle: 'Coffee, cocktails, beer, wine, and zero-proof sips',
      eyebrow: 'Drinks',
      footerNote: 'Ask about seasonal pours and rotating taps.',
      sections: [
        {
          name: 'Coffee & Tea',
          columnSpan: 1,
          items: [
            {
              name: 'Americano',
              description: 'Espresso and hot water',
              price: '3.75',
            },
            {
              name: 'Chai Latte',
              description: 'Spiced tea concentrate with steamed milk',
              price: '4.75',
            },
          ],
        },
        {
          name: 'Cocktails',
          columnSpan: 1,
          items: [
            {
              name: 'Cucumber Collins',
              description: 'Gin, cucumber, lemon, soda, and mint',
              price: '11.00',
            },
            {
              name: 'Maple Whiskey Sour',
              description: 'Whiskey, lemon, maple, bitters, and egg white',
              price: '12.00',
            },
          ],
        },
        {
          name: 'Beer & Wine',
          columnSpan: 2,
          items: [
            {
              name: 'Local Draft',
              description: 'Rotating selection from nearby breweries',
              price: '7.00',
            },
            {
              name: 'House Red or White',
              description: 'Ask for today\'s pour',
              price: '9.00',
            },
          ],
        },
      ],
    },
    {
      id: 'desserts',
      name: 'Dessert menu',
      description: 'Sweet-focused template for cakes, pies, frozen treats, and dessert drinks.',
      bestFor: 'bakeries, dessert shops, restaurants with dessert cards',
      defaultName: 'Sweet Finish',
      subtitle: 'Desserts, coffee, and after-dinner treats',
      eyebrow: 'Desserts',
      footerNote: 'Whole cakes and catering trays are available with advance notice.',
      sections: [
        {
          name: 'Cakes & Pies',
          columnSpan: 2,
          items: [
            {
              name: 'Carrot Cake',
              description: 'Spiced cake, cream cheese frosting, and toasted walnuts',
              price: '7.99',
            },
            {
              name: 'Key Lime Pie',
              description: 'Graham crust, tart lime filling, and whipped cream',
              price: '6.99',
            },
          ],
        },
        {
          name: 'Frozen Treats',
          columnSpan: 1,
          items: [
            {
              name: 'Vanilla Bean Sundae',
              description: 'Vanilla ice cream, chocolate sauce, whipped cream, and cherry',
              price: '6.49',
            },
            {
              name: 'Seasonal Sorbet',
              description: 'Refreshing fruit sorbet made with seasonal flavors',
              price: '5.99',
            },
          ],
        },
        {
          name: 'Dessert Drinks',
          columnSpan: 1,
          items: [
            {
              name: 'Espresso',
              description: 'Fresh-pulled single or double shot',
              price: '3.50',
            },
            {
              name: 'Hot Chocolate',
              description: 'Rich cocoa with whipped cream',
              price: '4.50',
            },
          ],
        },
      ],
    },
  ];

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

  const normalizeLogoPlacement = (placement: unknown): LogoPlacement => {
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

  const normalizeStylePresetId = (presetId: unknown): StylePresetId => {
    if (stylePresets.some((preset) => preset.id === presetId)) return presetId as StylePresetId;
    return 'simple';
  };

  const normalizePrintSettings = (value: unknown): PrintSettings => {
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

  const normalizeSectionColumnSpan = (span: unknown, sectionName: string): SectionColumnSpan => {
    if (span === 1 || span === 2) return span;
    return defaultSectionColumnSpan(sectionName);
  };

  const normalizeTextField = (value: unknown) => (typeof value === 'string' ? value : '');

  const sanitizeFileName = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);

  const optionalDetailFields = [
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

  const createDraftFromTemplate = (template: MenuTemplate): MenuDraft => ({
    name: template.defaultName,
    subtitle: template.subtitle,
    eyebrow: template.eyebrow,
    address: '',
    phone: '',
    website: '',
    hours: '',
    socialHandle: '',
    footerNote: template.footerNote ?? '',
    disclaimer: '',
    qrCodeUrl: '',
    qrCodeLabel: '',
    stylePresetId: 'simple',
    printSettings: defaultPrintSettings(),
    logoDataUrl: '',
    logoName: '',
    logoPlacement: 'above-eyebrow',
    sections: template.sections.map((section) => ({
      id: createId(),
      name: section.name,
      columnSpan: section.columnSpan ?? defaultSectionColumnSpan(section.name),
      items: section.items.map((item) => createItem(item)),
    })),
  });

  const templateItemCount = (template: MenuTemplate) =>
    template.sections.reduce((count, section) => count + section.items.length, 0);

  const templateSectionSummary = (template: MenuTemplate) =>
    template.sections.map((section) => section.name).join(', ');

  const parseCsvRows = (text: string) => {
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

  const parseCsvImport = (text: string): CsvPreviewRow[] => {
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

  const sectionsFromCsvRows = (rows: CsvPreviewRow[]): MenuSection[] => {
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

  const summarizeCsvRows = (rows: CsvPreviewRow[]): CsvPreviewSectionSummary[] => {
    const sectionCounts = new Map<string, number>();

    rows.forEach((row) => {
      sectionCounts.set(row.section, (sectionCounts.get(row.section) ?? 0) + 1);
    });

    return Array.from(sectionCounts, ([section, itemCount]) => ({ section, itemCount }));
  };

  const normalizeImportedItem = (value: unknown, itemIndex: number, sectionIndex: number): MenuItem => {
    if (!isRecord(value)) {
      throw new Error(`Item ${itemIndex + 1} in section ${sectionIndex + 1} is invalid.`);
    }

    return {
      id: normalizeTextField(value.id) || createId(),
      name: normalizeTextField(value.name),
      description: normalizeTextField(value.description),
      price: normalizeTextField(value.price),
    };
  };

  const normalizeImportedSection = (value: unknown, sectionIndex: number): MenuSection => {
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
      items: value.items.map((item, itemIndex) => normalizeImportedItem(item, itemIndex, sectionIndex)),
    };
  };

  const normalizeImportedDraft = (value: unknown): MenuDraft => {
    if (!isRecord(value)) {
      throw new Error('Draft data is missing or invalid.');
    }

    if (!Array.isArray(value.sections) || value.sections.length === 0) {
      throw new Error('Draft must include at least one section.');
    }

    const importedMenu: MenuDraft = {
      ...starterMenu(),
      name: normalizeTextField(value.name),
      subtitle: normalizeTextField(value.subtitle),
      eyebrow: normalizeTextField(value.eyebrow),
      logoDataUrl: normalizeTextField(value.logoDataUrl),
      logoName: normalizeTextField(value.logoName),
      logoPlacement: normalizeLogoPlacement(value.logoPlacement),
      stylePresetId: normalizeStylePresetId(value.stylePresetId),
      printSettings: normalizePrintSettings(value.printSettings),
      sections: value.sections.map(normalizeImportedSection),
    };

    optionalDetailFields.forEach((field) => {
      importedMenu[field] = normalizeTextField(value[field]);
    });

    return importedMenu;
  };

  const parseDraftFile = (value: unknown): MenuDraft => {
    if (!isRecord(value)) {
      throw new Error('Choose a valid MenuMaker draft JSON file.');
    }

    if (value.app !== 'MenuMaker' || value.schemaVersion !== draftFileSchemaVersion) {
      throw new Error('This draft file is missing a supported MenuMaker schema version.');
    }

    return normalizeImportedDraft(value.draft);
  };

  const loadMenu = () => {
    if (typeof localStorage === 'undefined') return starterMenu();

    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return starterMenu();

      const parsedMenu = JSON.parse(saved) as Partial<MenuDraft> & { logoPlacement?: unknown };
      const loadedMenu: MenuDraft = {
        ...starterMenu(),
        ...parsedMenu,
      };
      loadedMenu.logoPlacement = normalizeLogoPlacement(parsedMenu.logoPlacement);
      loadedMenu.stylePresetId = normalizeStylePresetId(parsedMenu.stylePresetId);
      loadedMenu.printSettings = normalizePrintSettings(parsedMenu.printSettings);
      optionalDetailFields.forEach((field) => {
        loadedMenu[field] = normalizeTextField(parsedMenu[field]);
      });
      loadedMenu.sections = loadedMenu.sections.map((section) => ({
        ...section,
        columnSpan: normalizeSectionColumnSpan(section.columnSpan, section.name),
      }));

      return loadedMenu;
    } catch {
      return starterMenu();
    }
  };

  const initialMenu = loadMenu();

  let menu = $state<MenuDraft>(initialMenu);
  let mobileView = $state<'editor' | 'preview'>('editor');
  let selectedSectionId = $state(initialMenu.sections[0]?.id ?? '');
  let activeEditorPanel = $state<EditorPanelId>('menu');
  let newSectionName = $state('');
  let sectionModalOpen = $state(false);
  let templateModalOpen = $state(false);
  let csvImportModalOpen = $state(false);
  let pendingTemplateId = $state('');
  let previewElement = $state<HTMLDivElement | null>(null);
  let qrCodeDataUrl = $state('');
  let qrCodeError = $state('');
  let draftFileStatus = $state('');
  let draftFileError = $state('');
  let csvFileName = $state('');
  let csvImportError = $state('');
  let csvImportMode = $state<CsvImportMode>('append');
  let csvPreviewRows = $state<CsvPreviewRow[]>([]);

  let selectedSection = $derived(
    menu.sections.find((section) => section.id === selectedSectionId) ?? menu.sections[0],
  );

  let itemCount = $derived(menu.sections.reduce((count, section) => count + section.items.length, 0));
  let hasMenuContent = $derived(menu.sections.some((section) => section.items.length > 0));
  let canCreateSection = $derived(newSectionName.trim().length > 0);
  let hasTopText = $derived(menu.eyebrow.trim().length > 0);
  let hasLogo = $derived(menu.logoDataUrl.length > 0);
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
  let hasMenuFooter = $derived(hasFooterDetails || hasQrCodeUrl);
  let qrCodeCaption = $derived(menu.qrCodeLabel.trim() || 'Scan for more');
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
  let selectedPrintPageSize = $derived(printPageSizes[menu.printSettings.pageSize]);
  let selectedPrintMargin = $derived(printMargins[menu.printSettings.margin]);
  let selectedPrintDensity = $derived(printDensities[menu.printSettings.density]);
  let printPageWidth = $derived(
    menu.printSettings.orientation === 'portrait' ? selectedPrintPageSize.width : selectedPrintPageSize.height,
  );
  let printPageHeight = $derived(
    menu.printSettings.orientation === 'portrait' ? selectedPrintPageSize.height : selectedPrintPageSize.width,
  );
  let printSetupVariables = $derived(
    [
      `--print-preview-aspect: ${printPageWidth} / ${printPageHeight};`,
      `--print-preview-padding: ${selectedPrintMargin.previewPadding};`,
      `--print-grid-columns: ${menu.printSettings.columns};`,
      `--menu-item-spacing: ${selectedPrintDensity.itemSpacing};`,
      `--menu-section-spacing: ${selectedPrintDensity.sectionSpacing};`,
    ].join(' '),
  );
  let previewStyleVariables = $derived(`${activeStyleVariables} ${printSetupVariables}`);
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

  $effect(() => {
    localStorage.setItem(storageKey, JSON.stringify(menu));
  });

  const formatPrice = (price: string) => {
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice)) return price.trim();

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numericPrice);
  };

  const selectSection = (sectionId: string) => {
    selectedSectionId = sectionId;
    activeEditorPanel = 'sections';
  };

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
    activeEditorPanel = 'sections';
    newSectionName = '';
    sectionModalOpen = false;
  };

  const removeSection = (sectionId: string) => {
    if (menu.sections.length === 1) return;

    const sectionIndex = menu.sections.findIndex((section) => section.id === sectionId);
    menu.sections = menu.sections.filter((section) => section.id !== sectionId);

    if (selectedSectionId === sectionId) {
      selectedSectionId = menu.sections[Math.max(0, sectionIndex - 1)]?.id ?? menu.sections[0]?.id ?? '';
    }
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

  const addItem = (section: MenuSection) => {
    section.items.push(createItem({ name: `Item ${section.items.length + 1}` }));
  };

  const removeItem = (section: MenuSection, itemId: string) => {
    section.items = section.items.filter((item) => item.id !== itemId);
  };

  const moveItem = (section: MenuSection, itemId: string, direction: -1 | 1) => {
    const itemIndex = section.items.findIndex((item) => item.id === itemId);
    const nextIndex = itemIndex + direction;

    if (itemIndex < 0 || nextIndex < 0 || nextIndex >= section.items.length) return;

    const items = [...section.items];
    [items[itemIndex], items[nextIndex]] = [items[nextIndex], items[itemIndex]];
    section.items = items;
  };

  const handleLogoUpload = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result !== 'string') return;

      menu.logoDataUrl = reader.result;
      menu.logoName = file.name;
      input.value = '';
    });
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    menu.logoDataUrl = '';
    menu.logoName = '';
  };

  const exportDraft = () => {
    const draftFile: MenuDraftFile = {
      app: 'MenuMaker',
      schemaVersion: draftFileSchemaVersion,
      exportedAt: new Date().toISOString(),
      draft: $state.snapshot(menu),
    };
    const serializedDraft = JSON.stringify(draftFile, null, 2);
    const blob = new Blob([serializedDraft], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    const fileName = `${sanitizeFileName(menu.name) || 'menu'}-menumaker-draft.json`;

    downloadLink.href = downloadUrl;
    downloadLink.download = fileName;
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(downloadUrl);

    draftFileError = '';
    draftFileStatus = `Exported ${fileName}.`;
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
    pendingTemplateId = '';
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
        <div class="editor-command-group grid w-full max-w-full grid-cols-6 gap-2 sm:flex sm:flex-wrap sm:justify-end">
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
    class={`app-layout grid min-h-0 flex-1 gap-3 overflow-hidden p-3 xl:grid-cols-[4.75rem_minmax(360px,440px)_minmax(0,1fr)] xl:grid-rows-1 xl:gap-0 xl:p-0 ${
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
                <div class="flex h-24 w-32 items-center justify-center rounded-lg border border-slate-200 bg-white p-3">
                  <img class="max-h-full max-w-full object-contain" src={menu.logoDataUrl} alt={menu.logoName || 'Menu logo'} />
                </div>

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
              onclick={() => (menu.stylePresetId = preset.id)}
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
        </div>
      </div>

      {:else if activeEditorPanel === 'sections'}
      <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 class="text-xl font-semibold text-slate-950">Sections</h2>
            <p class="mt-1 text-sm text-slate-600">Choose a section to edit its menu items.</p>
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

        <div class="flex gap-3 overflow-x-auto pb-2">
          {#each menu.sections as section, sectionIndex (section.id)}
            <div
              class={`flex min-w-fit items-center gap-1 rounded-lg border p-1 transition ${
                selectedSection?.id === section.id
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <button
                aria-label={`Move ${section.name || 'section'} left`}
                class="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-35"
                disabled={sectionIndex === 0}
                title="Move left"
                type="button"
                onclick={() => moveSection(section.id, -1)}
              >
                <ArrowLeft class="h-4 w-4" />
              </button>

              <button
                aria-pressed={selectedSection?.id === section.id}
                class={`min-h-10 rounded-md px-3 py-2 text-sm font-medium transition ${
                  selectedSection?.id === section.id
                    ? 'text-brand-800'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
                type="button"
                onclick={() => selectSection(section.id)}
              >
                {section.name || 'Untitled section'}
              </button>

              <button
                aria-label={`Move ${section.name || 'section'} right`}
                class="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-35"
                disabled={sectionIndex === menu.sections.length - 1}
                title="Move right"
                type="button"
                onclick={() => moveSection(section.id, 1)}
              >
                <ArrowRight class="h-4 w-4" />
              </button>
            </div>
          {/each}
        </div>
      </div>

      {#if selectedSection}
        <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-end">
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

            <div class="flex gap-2">
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

          <div class="space-y-4">
            {#each selectedSection.items as item, itemIndex (item.id)}
              <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_7rem_auto_auto]">
                  <label class="block">
                    <span class="text-sm font-medium text-slate-700">Item name</span>
                    <input
                      class="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                      bind:value={item.name}
                      placeholder="Menu item"
                    />
                  </label>

                  <label class="block">
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

                  <div class="flex items-end gap-1">
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
                  </div>

                  <div class="flex items-end">
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

                <label class="mt-3 block">
                  <span class="text-sm font-medium text-slate-700">Description</span>
                  <textarea
                    class="mt-2 block min-h-20 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                    bind:value={item.description}
                    placeholder="Optional item details"
                  ></textarea>
                </label>
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
          <div
            bind:this={previewElement}
            class={`menu-print-preview ${activeStylePreset.previewClass} min-h-full w-full rounded-lg border border-slate-200 bg-[#fffdf8] p-6 shadow-sm sm:p-8`}
            style={previewStyleVariables}
          >
          <div class="menu-print-header relative border-b border-slate-300 pb-6 text-center">
            {#if hasLogo && menu.logoPlacement === 'left-eyebrow'}
              <img
                class="mx-auto mb-4 max-h-24 max-w-48 object-contain sm:absolute sm:left-0 sm:top-0 sm:mx-0 sm:mb-0 sm:max-h-20 sm:max-w-32"
                src={menu.logoDataUrl}
                alt={menu.logoName || 'Menu logo'}
              />
            {/if}

            {#if hasLogo && menu.logoPlacement === 'right-eyebrow'}
              <img
                class="mx-auto mb-4 max-h-24 max-w-48 object-contain sm:absolute sm:right-0 sm:top-0 sm:mx-0 sm:mb-0 sm:max-h-20 sm:max-w-32"
                src={menu.logoDataUrl}
                alt={menu.logoName || 'Menu logo'}
              />
            {/if}

            {#if hasLogo && menu.logoPlacement === 'above-eyebrow'}
              <img
                class="mx-auto mb-4 max-h-24 max-w-48 object-contain"
                src={menu.logoDataUrl}
                alt={menu.logoName || 'Menu logo'}
              />
            {/if}

            {#if hasTopText}
              <p class="text-sm font-medium uppercase tracking-[0.2em] text-brand-700">{menu.eyebrow}</p>
            {/if}

            {#if hasLogo && menu.logoPlacement === 'below-eyebrow'}
              <img
                class="mx-auto mt-4 max-h-24 max-w-48 object-contain"
                src={menu.logoDataUrl}
                alt={menu.logoName || 'Menu logo'}
              />
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

          <div
            class="menu-print-grid mt-6 grid gap-x-8 gap-y-8"
            style={`grid-template-columns: repeat(${menu.printSettings.columns}, minmax(0, 1fr));`}
          >
            {#each menu.sections as section (section.id)}
              <section
                class="menu-print-section"
                style={`--section-column-span: ${Math.min(section.columnSpan, menu.printSettings.columns)};`}
              >
                <h4
                  class="menu-print-section-heading mb-4 flex items-center gap-3 text-lg font-semibold uppercase tracking-[0.12em] text-slate-900"
                >
                  <span>{section.name || 'Untitled section'}</span>
                  <span class="menu-print-section-rule flex-1"></span>
                </h4>

                <div class="space-y-4">
                  {#each section.items as item (item.id)}
                    <article class="menu-print-item">
                      <div class="flex items-baseline justify-between gap-4">
                        <h5 class="font-semibold text-slate-950">{item.name || 'Untitled item'}</h5>
                        <p class="shrink-0 font-semibold text-slate-900">
                          {item.price ? formatPrice(item.price) : ''}
                        </p>
                      </div>
                      {#if item.description}
                        <p class="mt-1 max-w-prose text-sm leading-6 text-slate-600">{item.description}</p>
                      {/if}
                    </article>
                  {/each}

                  {#if section.items.length === 0}
                    <p class="menu-print-empty-section text-sm italic text-slate-500">No items yet.</p>
                  {/if}
                </div>
              </section>
            {/each}

            {#if !hasMenuContent}
              <p
                class="menu-print-empty-state rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600"
              >
                Add a menu item to see it here.
              </p>
            {/if}
          </div>

          {#if hasMenuFooter}
            <div class="menu-print-footer mt-8 border-t border-slate-300 pt-5">
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
            </div>
          {/if}
        </div>
      </div>
      </div>
    </aside>
  </div>
</main>
