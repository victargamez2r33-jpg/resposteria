const DEMO_ADMIN = {
  email: 'admin@chocomagia.demo',
  password: 'Dulce2026!'
};

const DEMO_SESSION_KEY = 'chocomagiaAdminDemo';
let storeData;

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('adminEmail').value.trim().toLowerCase();
    const password = document.getElementById('adminPassword').value;
    const loginError = document.getElementById('loginError');

    if (email !== DEMO_ADMIN.email || password !== DEMO_ADMIN.password) {
      loginError.hidden = false;
      return;
    }

    sessionStorage.setItem(DEMO_SESSION_KEY, 'true');
    window.location.href = 'admin.html';
  });
}

if (document.body.dataset.requiresAdmin === 'true' && sessionStorage.getItem(DEMO_SESSION_KEY) !== 'true') {
  window.location.replace('login.html');
}

const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
    window.location.href = 'login.html';
  });
}

if (document.getElementById('productTableBody') && window.ChocoStore) {
  storeData = window.ChocoStore.read();

  const productTableBody = document.getElementById('productTableBody');
  const productForm = document.getElementById('productForm');
  const settingsForm = document.getElementById('storeSettingsForm');
  const productMessage = document.getElementById('productMessage');
  const settingsMessage = document.getElementById('settingsMessage');

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function formatPrice(value) {
    return `Lps ${Number(value).toFixed(2)}`;
  }

  function showMessage(element, text, isError = false) {
    element.textContent = text;
    element.hidden = false;
    element.classList.toggle('is-error', isError);
  }

  function persist(messageElement, successMessage) {
    if (!window.ChocoStore.write(storeData)) {
      showMessage(messageElement, 'No se pudieron guardar los cambios en este navegador.', true);
      return false;
    }

    showMessage(messageElement, successMessage);
    return true;
  }

  function renderProducts() {
    const products = storeData.products;
    document.getElementById('productCount').textContent = `${products.length} productos`;

    productTableBody.innerHTML = products.map(product => `
      <tr data-product-id="${escapeHTML(product.id)}">
        <td><span class="product-admin-name">${escapeHTML(product.emoji || '')} ${escapeHTML(product.name)}</span><span class="product-admin-description">${escapeHTML(product.description || '')}</span></td>
        <td>${product.category === 'paleta' ? 'Paleta en vaso' : 'Chocobanano'}</td>
        <td>${formatPrice(product.price)}</td>
        <td><label class="admin-checkbox"><input data-product-active type="checkbox" ${product.active !== false ? 'checked' : ''}> Disponible</label></td>
        <td class="admin-row-actions"><button type="button" class="admin-secondary-button" data-edit-product>Editar</button><button type="button" class="admin-danger-button" data-delete-product>Eliminar</button></td>
      </tr>
    `).join('');
  }

  function resetProductForm() {
    productForm.reset();
    document.getElementById('productId').value = '';
    document.getElementById('productActive').checked = true;
    document.getElementById('productFormTitle').textContent = 'Agregar producto';
    document.getElementById('saveProductButton').innerHTML = '<i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Guardar producto';
    document.getElementById('cancelProductEdit').hidden = true;
  }

  function fillSettingsForm() {
    const settings = storeData.settings;
    document.getElementById('settingWhatsapp').value = settings.whatsappNumber || '';
    document.getElementById('settingDeliveryFee').value = Number(settings.deliveryFee) || 0;
    document.getElementById('settingMinimumOrder').value = Number(settings.minimumOrder) || 0;
    document.getElementById('settingDeliveryArea').value = settings.deliveryArea || '';
    document.getElementById('settingDeliveryEnabled').checked = settings.deliveryEnabled !== false;
    document.getElementById('settingPickupEnabled').checked = settings.pickupEnabled !== false;
    document.getElementById('settingAtlantidaHolder').value = settings.bankAccounts.atlantida.holder || '';
    document.getElementById('settingAtlantidaNumber').value = settings.bankAccounts.atlantida.number || '';
    document.getElementById('settingBacHolder').value = settings.bankAccounts.bac.holder || '';
    document.getElementById('settingBacNumber').value = settings.bankAccounts.bac.number || '';
    document.getElementById('settingFacebook').value = settings.facebookUrl || '';
    document.getElementById('settingInstagram').value = settings.instagramUrl || '';
    document.getElementById('settingTiktok').value = settings.tiktokUrl || '';
  }

  document.querySelectorAll('[data-admin-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-admin-tab]').forEach(otherTab => {
        const isSelected = otherTab === tab;
        otherTab.setAttribute('aria-selected', String(isSelected));
        document.getElementById(otherTab.dataset.adminTab === 'products' ? 'productsPanel' : 'settingsPanel').hidden = !isSelected;
      });
    });
  });

  productForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(productForm);
    const productId = String(formData.get('productId') || '');
    const name = String(formData.get('name') || '').trim();
    const price = Number(formData.get('price'));
    if (!name || !Number.isFinite(price) || price < 0) return;

    const slug = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const product = {
      id: productId || `${slug || 'producto'}-${Date.now().toString(36)}`,
      name,
      category: formData.get('category') === 'paleta' ? 'paleta' : 'chocobanano',
      description: String(formData.get('description') || '').trim(),
      price,
      emoji: String(formData.get('emoji') || '').trim(),
      active: formData.has('active')
    };

    const existingIndex = storeData.products.findIndex(item => item.id === product.id);
    if (existingIndex >= 0) storeData.products[existingIndex] = product;
    else storeData.products.push(product);

    if (persist(productMessage, 'Producto guardado. Se verá en la tienda al volver a cargarla.')) {
      renderProducts();
      resetProductForm();
    }
  });

  document.getElementById('cancelProductEdit').addEventListener('click', resetProductForm);

  productTableBody.addEventListener('click', event => {
    const row = event.target.closest('tr[data-product-id]');
    if (!row) return;
    const product = storeData.products.find(item => item.id === row.dataset.productId);
    if (!product) return;

    if (event.target.closest('[data-edit-product]')) {
      document.getElementById('productId').value = product.id;
      document.getElementById('productName').value = product.name;
      document.getElementById('productCategory').value = product.category;
      document.getElementById('productPrice').value = product.price;
      document.getElementById('productEmoji').value = product.emoji || '';
      document.getElementById('productDescription').value = product.description || '';
      document.getElementById('productActive').checked = product.active !== false;
      document.getElementById('productFormTitle').textContent = 'Editar producto';
      document.getElementById('saveProductButton').textContent = 'Guardar cambios';
      document.getElementById('cancelProductEdit').hidden = false;
      document.getElementById('productName').focus();
    }

    if (event.target.closest('[data-delete-product]')) {
      storeData.products = storeData.products.filter(item => item.id !== product.id);
      if (persist(productMessage, 'Producto eliminado del catálogo.')) renderProducts();
    }
  });

  productTableBody.addEventListener('change', event => {
    const checkbox = event.target.closest('[data-product-active]');
    if (!checkbox) return;
    const row = checkbox.closest('tr[data-product-id]');
    const product = storeData.products.find(item => item.id === row.dataset.productId);
    if (!product) return;
    product.active = checkbox.checked;
    persist(productMessage, 'Disponibilidad actualizada.');
  });

  settingsForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(settingsForm);
    const deliveryEnabled = formData.has('deliveryEnabled');
    const pickupEnabled = formData.has('pickupEnabled');
    if (!deliveryEnabled && !pickupEnabled) {
      showMessage(settingsMessage, 'Mantén activa al menos una opción: entrega o recoger.', true);
      return;
    }

    storeData.settings = {
      ...storeData.settings,
      whatsappNumber: String(formData.get('whatsappNumber') || '').replace(/\D/g, ''),
      deliveryFee: Math.max(0, Number(formData.get('deliveryFee')) || 0),
      minimumOrder: Math.max(0, Number(formData.get('minimumOrder')) || 0),
      deliveryArea: String(formData.get('deliveryArea') || '').trim(),
      deliveryEnabled,
      pickupEnabled,
      bankAccounts: {
        atlantida: {
          bank: 'Banco Atlántida',
          holder: String(formData.get('atlantidaHolder') || '').trim(),
          number: String(formData.get('atlantidaNumber') || '').trim()
        },
        bac: {
          bank: 'BAC',
          holder: String(formData.get('bacHolder') || '').trim(),
          number: String(formData.get('bacNumber') || '').trim()
        }
      },
      facebookUrl: String(formData.get('facebookUrl') || '').trim(),
      instagramUrl: String(formData.get('instagramUrl') || '').trim(),
      tiktokUrl: String(formData.get('tiktokUrl') || '').trim()
    };

    persist(settingsMessage, 'Configuración guardada. Se aplicará en la tienda al volver a cargarla.');
  });

  renderProducts();
  fillSettingsForm();
}
