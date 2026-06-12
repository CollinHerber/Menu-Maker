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
    Globe,
    Image,
    LayoutTemplate,
    MapPin,
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

  const storageKey = 'menumaker:draft:v1';
  const draftFileSchemaVersion = 1;

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
  let selectedSectionId = $state(initialMenu.sections[0]?.id ?? '');
  let newSectionName = $state('');
  let sectionModalOpen = $state(false);
  let templateModalOpen = $state(false);
  let pendingTemplateId = $state('');
  let previewElement = $state<HTMLDivElement | null>(null);
  let qrCodeDataUrl = $state('');
  let qrCodeError = $state('');
  let draftFileStatus = $state('');
  let draftFileError = $state('');

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
    templateModalOpen = false;
    pendingTemplateId = '';
    draftFileError = '';
    draftFileStatus = `Applied ${template.name} template.`;
  };

  const openSectionModal = () => {
    newSectionName = '';
    sectionModalOpen = true;
  };

  const addSection = () => {
    const sectionName = newSectionName.trim();
    if (!sectionName) return;

    const section = createSection(sectionName);
    menu.sections.push(section);
    selectedSectionId = section.id;
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
    newSectionName = '';
    sectionModalOpen = false;
    templateModalOpen = false;
    pendingTemplateId = '';
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

<main class="app-shell min-h-screen px-4 py-5 sm:px-6 lg:px-8">
  <div class="app-layout mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
    <section class="menu-editor space-y-5">
      <div class="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white/90 p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div class="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-brand-700">
            <Utensils class="h-4 w-4" />
            MenuMaker
          </div>
          <h1 class="text-3xl font-semibold text-slate-950 sm:text-4xl">Menu builder</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Create sections, add items, set prices, and watch the printable preview update immediately.
          </p>
        </div>
        <div class="flex flex-col gap-2 sm:items-end">
          <div class="flex flex-wrap items-end gap-2">
            <Button color="light" onclick={openTemplateModal}>
              <LayoutTemplate class="mr-2 h-4 w-4" />
              Templates
            </Button>
            <Button color="light" onclick={exportDraft}>
              <Download class="mr-2 h-4 w-4" />
              Export draft
            </Button>
            <label
              class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100 focus-within:ring-4 focus-within:ring-brand-200"
            >
              <Upload class="mr-2 h-4 w-4" />
              Import draft
              <input class="sr-only" type="file" accept=".json,application/json" onchange={handleDraftImport} />
            </label>
            <Button color="light" onclick={resetMenu}>
              <RotateCcw class="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>

          {#if draftFileError || draftFileStatus}
            <p
              class={`max-w-sm text-left text-sm sm:text-right ${
                draftFileError ? 'text-red-700' : 'text-slate-600'
              }`}
              aria-live="polite"
            >
              {draftFileError || draftFileStatus}
            </p>
          {/if}
        </div>
      </div>

      <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
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
              <p class="mt-3 text-sm text-red-700">{qrCodeError}</p>
            {/if}
          </div>
        </div>
      </div>

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
                class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-35"
                disabled={sectionIndex === 0}
                title="Move left"
                type="button"
                onclick={() => moveSection(section.id, -1)}
              >
                <ArrowLeft class="h-4 w-4" />
              </button>

              <button
                class={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
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
                class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-35"
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
    </section>

    <aside class="menu-preview-column xl:sticky xl:top-5 xl:self-start">
      <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-center justify-between gap-3">
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

        <div
          bind:this={previewElement}
          class="menu-print-preview rounded-lg border border-slate-200 bg-[#fffdf8] p-6 shadow-inner sm:p-8"
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

          <div class="menu-print-grid mt-6 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
            {#each menu.sections as section (section.id)}
              <section class="menu-print-section" style={`--section-column-span: ${section.columnSpan};`}>
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
    </aside>
  </div>
</main>
