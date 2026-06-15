import type { DesignSettings } from './types';

export const formatPrice = (price: string, design: DesignSettings) => {
  const trimmedPrice = price.trim();
  const numericPrice = Number(trimmedPrice.replace(/[$,]/g, ''));

  if (!trimmedPrice || Number.isNaN(numericPrice)) return trimmedPrice;

  const minimumFractionDigits =
    design.priceDecimalStyle === 'always' || (!Number.isInteger(numericPrice) && design.priceDecimalStyle === 'auto')
      ? 2
      : 0;
  const maximumFractionDigits = design.priceDecimalStyle === 'trim' ? 2 : Math.max(2, minimumFractionDigits);
  const formattedPrice = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits,
    minimumFractionDigits,
    style: design.priceCurrencyStyle === 'symbol' ? 'currency' : 'decimal',
  }).format(numericPrice);

  return design.priceDecimalStyle === 'trim'
    ? formattedPrice.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '')
    : formattedPrice;
};

export const formatAddonPrice = (price: string, design: DesignSettings) => {
  const trimmed = price.trim();
  if (!trimmed) return '';
  const unsigned = trimmed.replace(/^[+-]/, '');
  const numeric = Number(unsigned.replace(/[$,]/g, ''));
  if (Number.isNaN(numeric)) return formatPrice(trimmed, design);
  return `${trimmed.startsWith('-') ? '-' : '+'}${formatPrice(unsigned, design)}`;
};
