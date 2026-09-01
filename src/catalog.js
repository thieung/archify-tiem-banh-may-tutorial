export const catalogItems = [
  {
    id: 'banh-mi-may',
    name: 'Bánh mì Mây',
    price: 32000,
    stock: 12,
  },
  {
    id: 'croissant-bo',
    name: 'Croissant bơ',
    price: 45000,
    stock: 8,
  },
  {
    id: 'tra-dao',
    name: 'Trà đào',
    price: 28000,
    stock: 16,
  },
];

export function createCatalogStore(seedItems = catalogItems) {
  const items = new Map(seedItems.map((item) => [item.id, { ...item }]));

  return {
    list() {
      return [...items.values()].map((item) => ({ ...item }));
    },

    find(itemId) {
      const item = items.get(itemId);
      return item ? { ...item } : null;
    },

    reserve(lineItems) {
      for (const lineItem of lineItems) {
        const item = items.get(lineItem.itemId);
        if (!item || item.stock < lineItem.quantity) {
          return { ok: false, reason: 'SOLD_OUT', itemId: lineItem.itemId };
        }
      }

      for (const lineItem of lineItems) {
        const item = items.get(lineItem.itemId);
        item.stock -= lineItem.quantity;
      }

      return { ok: true };
    },
  };
}
