// Configuración de temas para Tailwind CSS vía CDN
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#FF2E93',
          cyan: '#00C9C8',
          yellow: '#FFC83B',
          brown: '#4A2311',
          cream: '#FFF9EF',
          softPink: '#FFEAF3',
          softCyan: '#E6FAFA'
        }
      },
      fontFamily: {
        fredoka: ['Fredoka', 'sans-serif'],
        quicksand: ['Quicksand', 'sans-serif'],
      }
    }
  }
};

let cart = [];
const storeState = window.ChocoStore ? window.ChocoStore.read() : {
  products: [],
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
const BUSINESS_WHATSAPP_NUMBER = storeState.settings.whatsappNumber;
const BUSINESS_WHATSAPP_WEB_URL = 'https://web.whatsapp.com/';
const BUSINESS_BANK_ACCOUNTS = storeState.settings.bankAccounts;
const PENDING_CART_KEY = 'chocomagiaPendingCart';
const BUSINESS_SOCIAL_PROFILES = {
  facebook: storeState.settings.facebookUrl,
  instagram: storeState.settings.instagramUrl,
  tiktok: storeState.settings.tiktokUrl
};

document.querySelectorAll('[data-social-profile]').forEach(link => {
  const profileUrl = BUSINESS_SOCIAL_PROFILES[link.dataset.socialProfile];
  if (profileUrl) {
    link.href = profileUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.removeAttribute('aria-disabled');
  } else {
    link.setAttribute('aria-disabled', 'true');
    link.addEventListener('click', event => event.preventDefault());
  }
});

function buildWhatsAppUrl(message) {
  const phone = BUSINESS_WHATSAPP_NUMBER.replace(/\D/g, '');
  const url = new URL('send', BUSINESS_WHATSAPP_WEB_URL);
  url.searchParams.set('phone', phone);
  url.searchParams.set('text', message);
  return url.toString();
}

function formatPrice(amount) {
  return `Lps ${Number(amount).toFixed(2)}`;
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

function addToCart(title, price, event, productId = '') {
  cart.push({ id: productId, title, price });
  updateCartUI();
  
  if (event && event.currentTarget) {
    const button = event.currentTarget;
    const originalText = button.innerText;
    button.innerText = '¡Agregado!';
    button.classList.add('bg-brand-pink');
    setTimeout(() => {
      button.innerText = originalText;
      button.classList.remove('bg-brand-pink');
    }, 1000);
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function renderProductCard(product, compact = false) {
  const categoryClass = product.category === 'paleta' ? 'paleta' : 'chocobanano';
  const layoutClass = compact
    ? 'bg-[#FFF9EF] rounded-3xl p-4 border border-brand-brown/10 shadow-md'
    : 'rounded-xl border border-brand-brown/10 bg-white p-4 shadow-sm';
  const iconHeight = compact ? 'h-28' : 'h-32';
  const nameSize = compact ? 'text-xl' : 'text-lg';

  return `<article class="product-card ${categoryClass} flex flex-col justify-between ${layoutClass}">
    <div class="${iconHeight} flex items-center justify-center rounded-lg bg-brand-softPink text-5xl" aria-hidden="true">${escapeHTML(product.emoji || '🍌🍦')}</div>
    <h3 class="mt-3 font-title ${nameSize} font-bold text-brand-brown">${escapeHTML(product.name)}</h3>
    <p class="mt-1 flex-grow text-sm text-brand-brown/65">${escapeHTML(product.description || '')}</p>
    <div class="mt-4 flex items-center justify-between gap-2">
      <span class="font-title text-xl font-bold text-brand-pink">${formatPrice(product.price)}</span>
      <button type="button" data-add-product data-product-id="${escapeHTML(product.id)}" data-product-name="${escapeHTML(product.name)}" data-product-price="${Number(product.price)}" class="rounded-full bg-brand-cyan px-4 py-2 text-sm font-bold text-white hover:opacity-90">Añadir</button>
    </div>
  </article>`;
}

function renderProductGrid(container, products, compact = false) {
  if (!container) return;
  container.innerHTML = products.map(product => renderProductCard(product, compact)).join('');
  container.querySelectorAll('[data-add-product]').forEach(button => {
    button.addEventListener('click', event => {
      addToCart(button.dataset.productName, Number(button.dataset.productPrice), event, button.dataset.productId);
    });
  });
}

function renderContactProductRows() {
  const chocobananoList = document.getElementById('chocobananoOrderItems');
  const paletaList = document.getElementById('paletaOrderItems');
  const activeProducts = storeState.products.filter(product => product.active !== false);

  function rowMarkup(product) {
    const safeName = escapeHTML(product.name);
    return `<label class="flex items-center justify-between gap-4 py-3">
      <span class="min-w-0"><span class="block font-semibold">${safeName}</span><span class="text-sm text-brand-brown/60">${formatPrice(product.price)} cada uno</span></span>
      <input data-order-item data-product-id="${escapeHTML(product.id)}" data-product-name="${safeName}" data-product-price="${Number(product.price)}" type="number" min="0" max="99" step="1" value="0" aria-label="Cantidad de ${safeName}" class="w-20 rounded-md border border-brand-brown/20 bg-white px-2 py-2 text-center">
    </label>`;
  }

  if (chocobananoList) {
    chocobananoList.innerHTML = activeProducts.filter(product => product.category === 'chocobanano').map(rowMarkup).join('');
  }
  if (paletaList) {
    paletaList.innerHTML = activeProducts.filter(product => product.category === 'paleta').map(rowMarkup).join('');
  }
}

renderProductGrid(document.getElementById('productsGrid'), storeState.products.filter(product => product.active !== false), true);
renderProductGrid(document.getElementById('chocobananoGrid'), storeState.products.filter(product => product.category === 'chocobanano' && product.active !== false));
renderProductGrid(document.getElementById('paletaGrid'), storeState.products.filter(product => product.category === 'paleta' && product.active !== false));
renderContactProductRows();

function updateCartUI() {
  const countEl = document.getElementById('cartCount');
  const container = document.getElementById('cartItemsContainer');
  const totalEl = document.getElementById('cartTotal');
  
  if (countEl) countEl.innerText = cart.length;

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<p class="text-center text-brand-brown/60 py-8">Tu carrito está vacío 🍌🍦</p>';
    if (totalEl) totalEl.innerText = formatPrice(0);
    return;
  }

  let html = '';
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;
    html += `
      <div class="flex items-center justify-between bg-brand-cream p-3 rounded-xl border border-brand-brown/10">
        <div>
          <h4 class="font-bold text-sm text-brand-brown">${item.title}</h4>
          <span class="text-xs font-bold text-brand-pink">${formatPrice(item.price)}</span>
        </div>
        <button onclick="removeFromCart(${index})" class="text-red-400 hover:text-red-600 p-1">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
  if (totalEl) totalEl.innerText = formatPrice(total);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function openCart() {
  const modal = document.getElementById('cartModal');
  if (modal) modal.classList.remove('hidden');
}

function closeCart() {
  const modal = document.getElementById('cartModal');
  if (modal) modal.classList.add('hidden');
}

function toggleFavorite(btn) {
  const icon = btn.querySelector('i');
  if (icon) {
    if (icon.classList.contains('fa-regular')) {
      icon.classList.remove('fa-regular');
      icon.classList.add('fa-solid');
    } else {
      icon.classList.remove('fa-solid');
      icon.classList.add('fa-regular');
    }
  }
}

function filterCategory(category, event) {
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.remove('bg-brand-pink', 'text-white');
    btn.classList.add('bg-brand-softPink', 'text-brand-brown');
  });

  if (event && event.currentTarget) {
    event.currentTarget.classList.add('bg-brand-pink', 'text-white');
  }

  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    if (category === 'all' || card.classList.contains(category)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

function checkout() {
  if (cart.length === 0) return;

  sessionStorage.setItem(PENDING_CART_KEY, JSON.stringify(cart));
  window.location.href = 'contacto.html?pedido=carrito';
}

function sendWhatsAppMessage(message) {
  window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
}

const contactWhatsAppLink = document.querySelector('[data-whatsapp-link]');
if (contactWhatsAppLink) {
  contactWhatsAppLink.href = buildWhatsAppUrl('Hola, quiero hacer un pedido en ChocoMagia.');
}

const contactOrderForm = document.getElementById('contactOrderForm');
if (contactOrderForm) {
  const deliveryType = document.getElementById('deliveryType');
  const addressField = document.getElementById('deliveryAddress');
  const paymentMethod = document.getElementById('paymentMethod');
  const bankAccountDetails = document.getElementById('bankAccountDetails');
  const bankAccountInfo = document.getElementById('bankAccountInfo');
  const bankAccountSetupMessage = document.getElementById('bankAccountSetupMessage');
  const paymentValidationMessage = document.getElementById('paymentValidationMessage');
  const pendingCartNotice = document.getElementById('pendingCartNotice');
  const deliverySettingsInfo = document.getElementById('deliverySettingsInfo');
  const deliveryValidationMessage = document.getElementById('deliveryValidationMessage');
  const availableBankAccounts = Object.entries(BUSINESS_BANK_ACCOUNTS)
    .filter(([, account]) => account.bank.trim() && account.holder.trim() && account.number.trim());
  const accountIsConfigured = availableBankAccounts.length > 0;
  const deliveryOption = deliveryType.querySelector('option[value="delivery"]');
  const pickupOption = deliveryType.querySelector('option[value="pickup"]');
  const deliveryIsAvailable = storeState.settings.deliveryEnabled !== false;
  const pickupIsAvailable = storeState.settings.pickupEnabled !== false;
  const deliveryFee = Math.max(0, Number(storeState.settings.deliveryFee) || 0);
  const minimumOrder = Math.max(0, Number(storeState.settings.minimumOrder) || 0);

  deliveryOption.hidden = !deliveryIsAvailable;
  pickupOption.hidden = !pickupIsAvailable;
  if (!pickupIsAvailable && deliveryIsAvailable) deliveryType.value = 'delivery';
  if (!deliveryIsAvailable && pickupIsAvailable) deliveryType.value = 'pickup';
  deliverySettingsInfo.textContent = deliveryIsAvailable
    ? `Costo de entrega: ${formatPrice(deliveryFee)}${storeState.settings.deliveryArea ? ` · Zona: ${storeState.settings.deliveryArea}` : ''}`
    : 'Solo disponible para recoger.';

  if (!accountIsConfigured) paymentMethod.value = 'cash';

  try {
    const pendingCart = JSON.parse(sessionStorage.getItem(PENDING_CART_KEY) || '[]');
    if (Array.isArray(pendingCart) && pendingCart.length > 0) {
      const productInputs = Array.from(contactOrderForm.querySelectorAll('[data-order-item]'));
      const productAliases = {
        'Chocobanano Clásico': 'Clásico de Chocolate',
        'Paleta Leche y Conflakes': 'Paleta de Leche con Conflex'
      };
      let loadedQuantity = 0;

      pendingCart.forEach(item => {
        const productName = productAliases[item.title] || item.title;
        const productInput = productInputs.find(input => item.id && input.dataset.productId === item.id)
          || productInputs.find(input => input.dataset.productName === productName);
        if (!productInput) return;

        productInput.value = String(Math.min(99, Number(productInput.value) + 1));
        loadedQuantity += 1;
      });

      if (loadedQuantity > 0) {
        pendingCartNotice.textContent = `Se cargaron ${loadedQuantity} productos del carrito. Completa tus datos para continuar.`;
        pendingCartNotice.hidden = false;
      }
    }
  } catch {
    sessionStorage.removeItem(PENDING_CART_KEY);
  }

  function updateBankAccountDetails() {
    const usesTransfer = paymentMethod.value === 'transfer';
    bankAccountDetails.hidden = !usesTransfer;
    bankAccountInfo.hidden = availableBankAccounts.length === 0;
    bankAccountSetupMessage.hidden = availableBankAccounts.length > 0;
    paymentValidationMessage.hidden = true;
  }

  availableBankAccounts.forEach(([accountKey, account], index) => {
    const label = document.createElement('label');
    label.className = 'flex cursor-pointer items-start gap-3 rounded-md border border-brand-brown/15 bg-white p-3';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'depositBank';
    radio.value = accountKey;
    radio.required = true;
    radio.checked = index === 0;
    radio.className = 'mt-1 accent-pink-600';

    const accountDetails = document.createElement('span');
    accountDetails.className = 'grid gap-1 text-sm';
    const bankName = document.createElement('strong');
    bankName.textContent = account.bank;
    const accountHolder = document.createElement('span');
    accountHolder.textContent = `Titular: ${account.holder}`;
    const accountNumber = document.createElement('span');
    accountNumber.textContent = `Número de cuenta: ${account.number}`;
    accountDetails.append(bankName, accountHolder, accountNumber);
    label.append(radio, accountDetails);
    bankAccountChoices.append(label);
  });

  function updateDeliveryAddress() {
    const needsAddress = deliveryType.value === 'delivery';
    addressField.required = needsAddress;
    addressField.closest('.address-field').classList.toggle('hidden', !needsAddress);
  }

  deliveryType.addEventListener('change', updateDeliveryAddress);
  paymentMethod.addEventListener('change', updateBankAccountDetails);
  updateDeliveryAddress();
  updateBankAccountDetails();

  contactOrderForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(contactOrderForm);
    const selectedItems = Array.from(contactOrderForm.querySelectorAll('[data-order-item]'))
      .map(input => ({
        name: input.dataset.productName,
        price: Number(input.dataset.productPrice),
        quantity: Math.min(99, Math.max(0, Number.parseInt(input.value, 10) || 0))
      }))
      .filter(item => item.quantity > 0);
    const reference = String(formData.get('orderReference') || '').trim();
    const validationMessage = document.getElementById('orderValidationMessage');
    const usesTransfer = formData.get('paymentMethod') === 'transfer';
    const selectedBankAccount = usesTransfer ? BUSINESS_BANK_ACCOUNTS[String(formData.get('depositBank') || '')] : null;
    const hasAccountDetails = selectedBankAccount
      && selectedBankAccount.bank.trim()
      && selectedBankAccount.holder.trim()
      && selectedBankAccount.number.trim();

    if (selectedItems.length === 0 && !reference) {
      validationMessage.hidden = false;
      return;
    }
    if (usesTransfer && !hasAccountDetails) {
      paymentValidationMessage.hidden = false;
      return;
    }

    validationMessage.hidden = true;
    const usesDelivery = formData.get('deliveryType') === 'delivery';
    const currentDeliveryFee = usesDelivery ? deliveryFee : 0;
    const deliveryLabel = usesDelivery ? 'A domicilio' : 'Para recoger';
    const paymentLabel = usesTransfer ? 'Depósito o transferencia' : 'Efectivo al recibir (pago físico)';
    const orderLines = selectedItems.map(item => {
      const subtotal = item.price * item.quantity;
      return `- ${item.quantity} x ${item.name}: ${formatPrice(subtotal)}`;
    });
    const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (minimumOrder > 0 && total < minimumOrder) {
      deliveryValidationMessage.textContent = `El pedido mínimo es de ${formatPrice(minimumOrder)}.`;
      deliveryValidationMessage.hidden = false;
      return;
    }
    deliveryValidationMessage.hidden = true;

    const message = [
      'Hola, quiero realizar un pedido en ChocoMagia:',
      `Nombre: ${formData.get('customerName')}`,
      `Teléfono: ${formData.get('customerPhone')}`,
      'Productos:',
      ...orderLines,
      selectedItems.length > 0 ? `Subtotal: ${formatPrice(total)}` : '',
      usesDelivery ? `Costo de envío: ${formatPrice(currentDeliveryFee)}` : '',
      selectedItems.length > 0 ? `Total estimado: ${formatPrice(total + currentDeliveryFee)}` : '',
      reference ? `Referencia o personalización: ${reference}` : '',
      `Entrega: ${deliveryLabel}`,
      `Forma de pago: ${paymentLabel}`,
      usesTransfer ? `Banco: ${selectedBankAccount.bank}` : '',
      usesTransfer ? `Titular: ${selectedBankAccount.holder}` : '',
      usesTransfer ? `Número de cuenta: ${selectedBankAccount.number}` : '',
      formData.get('deliveryAddress') ? `Dirección: ${formData.get('deliveryAddress')}` : '',
      storeState.settings.deliveryArea && usesDelivery ? `Zona de entrega: ${storeState.settings.deliveryArea}` : '',
      formData.get('orderNotes') ? `Nota: ${formData.get('orderNotes')}` : ''
    ].filter(Boolean).join('\n');

    sessionStorage.removeItem(PENDING_CART_KEY);
    sendWhatsAppMessage(message);
  });
}
