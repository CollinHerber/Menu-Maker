<script lang="ts">
  import { Badge, Button, Modal } from 'flowbite-svelte';
  import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    DollarSign,
    Eye,
    Image,
    Plus,
    Printer,
    RotateCcw,
    Trash2,
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
    logoDataUrl: string;
    logoName: string;
    logoPlacement: LogoPlacement;
    sections: MenuSection[];
  };

  const storageKey = 'menumaker:draft:v1';

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

  const loadMenu = () => {
    if (typeof localStorage === 'undefined') return starterMenu();

    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return starterMenu();

      const parsedMenu = JSON.parse(saved) as Partial<MenuDraft> & { logoPlacement?: unknown };
      const loadedMenu = {
        ...starterMenu(),
        ...parsedMenu,
      };
      loadedMenu.logoPlacement = normalizeLogoPlacement(parsedMenu.logoPlacement);
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
  let previewElement = $state<HTMLDivElement | null>(null);

  let selectedSection = $derived(
    menu.sections.find((section) => section.id === selectedSectionId) ?? menu.sections[0],
  );

  let itemCount = $derived(menu.sections.reduce((count, section) => count + section.items.length, 0));
  let hasMenuContent = $derived(menu.sections.some((section) => section.items.length > 0));
  let canCreateSection = $derived(newSectionName.trim().length > 0);
  let hasTopText = $derived(menu.eyebrow.trim().length > 0);
  let hasLogo = $derived(menu.logoDataUrl.length > 0);
  let hasHeaderTopContent = $derived(hasTopText || hasLogo);

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

  const resetMenu = () => {
    const defaultMenu = starterMenu();
    menu = defaultMenu;
    selectedSectionId = defaultMenu.sections[0]?.id ?? '';
    newSectionName = '';
    sectionModalOpen = false;
  };

  const printMenu = () => {
    if (!previewElement) return;

    window.print();
  };
</script>

<svelte:head>
  <title>{menu.name || 'MenuMaker'}</title>
</svelte:head>

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
        <div class="flex flex-wrap items-end gap-2">
          <Button color="light" onclick={resetMenu}>
            <RotateCcw class="mr-2 h-4 w-4" />
            Reset
          </Button>
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
        </div>
      </div>
    </aside>
  </div>
</main>
