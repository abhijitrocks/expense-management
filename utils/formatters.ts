
export const formatCurrency = (amountCents: number, currency: string, locale: string = 'en-US'): string => {
  const amount = amountCents / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (dateString: string, locale: string = 'en-US'): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};
