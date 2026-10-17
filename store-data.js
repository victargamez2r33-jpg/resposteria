(function () {
  const STORAGE_KEY = 'chocomagiaStoreData';
  const CURRENCY = 'HNL';
  const USD_TO_HNL_RATE = 26.87;
  const DEFAULT_DATA = {
    products: [
      { id: 'classic-chocolate', name: 'Clásico de Chocolate', category: 'chocobanano', description: 'Bañado en chocolate oscuro crujiente.', price: 67.18, emoji: '🍌🍫', active: true },
      { id: 'choco-rosa', name: 'ChocoRosa & Chispas', category: 'chocobanano', description: 'Cobertura rosada con chispas de colores.', price: 67.18, emoji: '🍌💖', active: true },
      { id: 'choco-azul', name: 'ChocoAzul Celeste', category: 'chocobanano', description: 'Cobertura dulce sabor vainilla azul.', price: 67.18, emoji: '🍌💙', active: true },
      { id: 'mani-crujiente', name: 'Maní Crujiente', category: 'chocobanano', description: 'Chocolate con trocitos de maní tostado.', price: 67.18, emoji: '🍌🥜', active: true },
      { id: 'conflakes-chocolate', name: 'Conflakes & Chocolate', category: 'chocobanano', description: 'Bañado en chocolate con hojuelas de maíz.', price: 67.18, emoji: '🍌🥣', active: true },
      { id: 'choco-uva', name: 'ChocoUva Dulce', category: 'chocobanano', description: 'Cobertura especial sabor frutas.', price: 67.18, emoji: '🍌🟣', active: true },
      { id: 'coco-rayado', name: 'Coco Rayado', category: 'chocobanano', description: 'Chocolate con abundante coco rallado.', price: 67.18, emoji: '🍌🥥', active: true },
      { id: 'arcoiris-magico', name: 'Arcoíris Mágico', category: 'chocobanano', description: 'Mezcla multicolor de coberturas y dulces.', price: 67.18, emoji: '🍌🌈', active: true },
      { id: 'paleta-leche-conflex', name: 'Paleta de Leche con Conflex', category: 'paleta', description: 'Servida en vaso con leche fresca y cereal crujiente.', price: 94.05, emoji: '🥤🌾', active: true },
      { id: 'paleta-chocolate-leche', name: 'Paleta de Chocolate con Leche', category: 'paleta', description: 'Cremosa paleta sabor choco-leche servida en vaso.', price: 94.05, emoji: '🥤🍫', active: true },
      { id: 'paleta-coco', name: 'Paleta de Coco Cremoso', category: 'paleta', description: 'Paleta artesanal de coco con trozos naturales.', price: 94.05, emoji: '🥤🥥', active: true }
    ],
    settings: {
      whatsappNumber: '88173833',
      bankAccounts: {
        atlantida: { bank: 'Banco Atlántida', holder: '', number: '' },
        bac: { bank: 'BAC', holder: '', number: '' }
      },
      deliveryEnabled: true,
      deliveryFee: 0,
      deliveryArea: '',
      pickupEnabled: true,
      minimumOrder: 0,
      facebookUrl: '',
      instagramUrl: '',
      tiktokUrl: ''
    }
  };

  let memoryData = clone(DEFAULT_DATA);

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function convertDollarsToLempiras(value) {
    return Math.round((Number(value || 0) * USD_TO_HNL_RATE + Number.EPSILON) * 100) / 100;
  }

  function normalizeSettings(savedSettings = {}) {
    const settings = { ...DEFAULT_DATA.settings, ...savedSettings };
    const savedAccounts = savedSettings.bankAccounts || {};
    const bankAccounts = {
      atlantida: { ...DEFAULT_DATA.settings.bankAccounts.atlantida, ...(savedAccounts.atlantida || {}) },
      bac: { ...DEFAULT_DATA.settings.bankAccounts.bac, ...(savedAccounts.bac || {}) }
    };

    if (!savedSettings.bankAccounts && savedSettings.accountHolder && savedSettings.accountNumber) {
      const accountKey = savedSettings.accountBank === 'BAC' ? 'bac' : 'atlantida';
      bankAccounts[accountKey].holder = savedSettings.accountHolder;
      bankAccounts[accountKey].number = savedSettings.accountNumber;
    }

    settings.bankAccounts = bankAccounts;
    delete settings.accountBank;
    delete settings.accountHolder;
    delete settings.accountNumber;
    return settings;
  }

  function read() {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (!savedData) return clone(memoryData);

      const parsedData = JSON.parse(savedData);
      const isAlreadyLempiras = parsedData.currency === CURRENCY;
      const products = Array.isArray(parsedData.products) ? parsedData.products : clone(DEFAULT_DATA.products);
      const settings = normalizeSettings(parsedData.settings || {});
      const convertedData = {
        currency: CURRENCY,
        products: isAlreadyLempiras ? products : products.map(product => ({
          ...product,
          price: convertDollarsToLempiras(product.price)
        })),
        settings: isAlreadyLempiras ? settings : {
          ...settings,
          deliveryFee: convertDollarsToLempiras(settings.deliveryFee),
          minimumOrder: convertDollarsToLempiras(settings.minimumOrder)
        }
      };

      if (!isAlreadyLempiras) localStorage.setItem(STORAGE_KEY, JSON.stringify(convertedData));
      memoryData = convertedData;
      return convertedData;
    } catch {
      return clone(memoryData);
    }
  }

  function write(data) {
    memoryData = {
      currency: CURRENCY,
      products: Array.isArray(data.products) ? data.products : clone(DEFAULT_DATA.products),
      settings: normalizeSettings(data.settings || {})
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryData));
    } catch {
      return false;
    }

    return true;
  }

  window.ChocoStore = { read, write };
})();