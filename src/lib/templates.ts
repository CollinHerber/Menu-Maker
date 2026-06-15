import type { MenuDraft, MenuTemplate } from './types';
import { defaultDesignSettings, defaultPrintSettings } from './constants';
import { createId, createItem, createItemImageSettings, createVariantFromMenu, defaultSectionColumnSpan } from './factories';

export const starterMenu = (): MenuDraft => {
    const variantId = createId();
    const draft: MenuDraft = {
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
      designSettings: defaultDesignSettings(),
      logoDataUrl: '',
      logoName: '',
      logoAlt: '',
      logoFit: 'contain',
      logoScale: 100,
      logoOffsetX: 0,
      logoOffsetY: 0,
      logoPlacement: 'above-eyebrow',
      customBadges: [],
      showBadgeLegend: false,
      activeVariantId: variantId,
      variants: [],
      sections: [
      {
        id: createId(),
        name: 'Appetizers',
        columnSpan: 2,
        imageLayout: 'none',
        note: '',
        headingAlign: 'preset',
        dividerStyle: 'preset',
        backgroundStyle: 'none',
        itemLayout: 'preset',
        imageDefaults: createItemImageSettings(),
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
        imageLayout: 'none',
        note: '',
        headingAlign: 'preset',
        dividerStyle: 'preset',
        backgroundStyle: 'none',
        itemLayout: 'preset',
        imageDefaults: createItemImageSettings(),
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
        imageLayout: 'none',
        note: '',
        headingAlign: 'preset',
        dividerStyle: 'preset',
        backgroundStyle: 'none',
        itemLayout: 'preset',
        imageDefaults: createItemImageSettings(),
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
        imageLayout: 'none',
        note: '',
        headingAlign: 'preset',
        dividerStyle: 'preset',
        backgroundStyle: 'none',
        itemLayout: 'preset',
        imageDefaults: createItemImageSettings(),
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
        imageLayout: 'none',
        note: '',
        headingAlign: 'preset',
        dividerStyle: 'preset',
        backgroundStyle: 'none',
        itemLayout: 'preset',
        imageDefaults: createItemImageSettings(),
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
    };

    draft.variants = [createVariantFromMenu(draft, variantId)];

    return draft;
  };

export const menuTemplates: MenuTemplate[] = [
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

export const createDraftFromTemplate = (template: MenuTemplate): MenuDraft => {
    const variantId = createId();
    const draft: MenuDraft = {
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
      designSettings: defaultDesignSettings(),
      logoDataUrl: '',
      logoName: '',
      logoAlt: '',
      logoFit: 'contain',
      logoScale: 100,
      logoOffsetX: 0,
      logoOffsetY: 0,
      logoPlacement: 'above-eyebrow',
      customBadges: [],
      showBadgeLegend: false,
      activeVariantId: variantId,
      variants: [],
      sections: template.sections.map((section) => ({
        id: createId(),
        name: section.name,
        columnSpan: section.columnSpan ?? defaultSectionColumnSpan(section.name),
        imageLayout: section.imageLayout ?? 'none',
        note: section.note ?? '',
        headingAlign: section.headingAlign ?? 'preset',
        dividerStyle: section.dividerStyle ?? 'preset',
        backgroundStyle: section.backgroundStyle ?? 'none',
        itemLayout: section.itemLayout ?? 'preset',
        imageDefaults: createItemImageSettings(),
        items: section.items.map((item) => createItem(item)),
      })),
    };

    draft.variants = [createVariantFromMenu(draft, variantId)];

    return draft;
  };

export const templateItemCount = (template: MenuTemplate) =>
    template.sections.reduce((count, section) => count + section.items.length, 0);

export const templateSectionSummary = (template: MenuTemplate) =>
    template.sections.map((section) => section.name).join(', ');
