const products = [
  { id: 1, brand: 'ROKH', name: 'Leather Officer Cap', category: '액세서리', price: 128000, original: 160000, discount: 20, art: 0, badge: 'NEW' },
  { id: 2, brand: 'LOW CLASSIC', name: 'Mandarin Denim Top', category: '상의', price: 168000, original: 0, discount: 0, art: 1, badge: 'BEST' },
  { id: 3, brand: 'RECTO', name: 'Military Band Jacket', category: '아우터', price: 428000, original: 0, discount: 0, art: 2, badge: 'NEW' },
  { id: 4, brand: 'AMOMENTO', name: 'Studded Wide Denim', category: '하의', price: 238000, original: 280000, discount: 15, art: 3, badge: 'SALE' },
  { id: 5, brand: 'MARGESHERWOOD', name: 'Layered Chain Necklace', category: '액세서리', price: 156000, original: 0, discount: 0, art: 4, badge: 'NEW' },
  { id: 6, brand: 'ROKH', name: 'Platform Trek Sneakers', category: '신발', price: 348000, original: 390000, discount: 11, art: 5, badge: 'BEST' }
];

const state = {
  brand: 'all', category: 'all', query: '', sort: 'recommended', saleOnly: false, wishOnly: false,
  wishlist: new Set(JSON.parse(localStorage.getItem('mybrand-wishlist') || '[]')),
  cart: JSON.parse(localStorage.getItem('mybrand-cart') || '[]'), activeProduct: null
};

const grid = document.querySelector('#productGrid');
const empty = document.querySelector('.empty-state');
const toast = document.querySelector('.toast');
const money = value => `₩${value.toLocaleString('ko-KR')}`;

function getProducts() {
  let list = products.filter(product =>
    (state.brand === 'all' || product.brand === state.brand) &&
    (state.category === 'all' || product.category === state.category) &&
    (!state.saleOnly || product.discount > 0) &&
    (!state.wishOnly || state.wishlist.has(product.id)) &&
    `${product.brand} ${product.name}`.toLowerCase().includes(state.query.toLowerCase())
  );
  if (state.sort === 'low') list.sort((a, b) => a.price - b.price);
  if (state.sort === 'high') list.sort((a, b) => b.price - a.price);
  if (state.sort === 'new') list.sort((a, b) => b.id - a.id);
  return list;
}

function productCard(product) {
  const wished = state.wishlist.has(product.id);
  return `<article class="product-card" data-id="${product.id}">
    <div class="product-art quadrant-${product.art}" tabindex="0" role="button" aria-label="${product.name} 상세 보기">
      <span class="product-badge">${product.badge}</span>
      <button class="wish-button ${wished ? 'active' : ''}" aria-label="${wished ? '찜 해제' : '찜하기'}">${wished ? '♥' : '♡'}</button>
      <div class="product-sprite"></div>
    </div>
    <div class="product-info">
      <p class="product-brand">${product.brand}</p>
      <p class="product-name">${product.name}</p>
      <div class="price-row">
        ${product.discount ? `<span class="discount">${product.discount}%</span>` : ''}
        <span class="price">${money(product.price)}</span>
        ${product.original ? `<span class="original">${money(product.original)}</span>` : ''}
        <button class="card-add" aria-label="장바구니 담기">＋</button>
      </div>
    </div>
  </article>`;
}

function render() {
  const list = getProducts();
  grid.innerHTML = list.map(productCard).join('');
  document.querySelector('#resultCount').textContent = list.length;
  empty.hidden = Boolean(list.length);
  updateCounts();
}

function persist() {
  localStorage.setItem('mybrand-wishlist', JSON.stringify([...state.wishlist]));
  localStorage.setItem('mybrand-cart', JSON.stringify(state.cart));
  updateCounts();
}

function updateCounts() {
  document.querySelectorAll('.wishlist-count').forEach(el => el.textContent = state.wishlist.size);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = state.cart.length);
}

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function addCart(id) {
  state.cart.push(id);
  persist();
  renderCart();
  notify('장바구니에 담았어요.');
}

function toggleWish(id) {
  state.wishlist.has(id) ? state.wishlist.delete(id) : state.wishlist.add(id);
  persist();
  render();
  notify(state.wishlist.has(id) ? '찜 목록에 저장했어요.' : '찜 목록에서 삭제했어요.');
}

function openModal(product) {
  state.activeProduct = product;
  const modal = document.querySelector('#productModal');
  modal.querySelector('.modal-product-image').className = `modal-product-image product-art quadrant-${product.art}`;
  modal.querySelector('.modal-brand').textContent = product.brand;
  modal.querySelector('.modal-name').textContent = product.name;
  modal.querySelector('.modal-price').textContent = money(product.price);
  modal.showModal();
}

function renderCart() {
  const wrap = document.querySelector('#cartItems');
  if (!state.cart.length) {
    wrap.innerHTML = '<div class="cart-empty"><p>장바구니가 비어 있어요.</p><small>오늘의 셀렉션에서 마음에 드는 상품을 담아보세요.</small></div>';
  } else {
    wrap.innerHTML = state.cart.map((id, index) => {
      const product = products.find(item => item.id === id);
      return `<div class="cart-row">
        <div class="cart-thumb quadrant-${product.art}"><div class="product-sprite"></div></div>
        <div><p class="small">${product.brand}</p><p class="name">${product.name}</p><p class="money">${money(product.price)}</p></div>
        <button class="remove-item" data-index="${index}" aria-label="삭제">×</button>
      </div>`;
    }).join('');
  }
  const total = state.cart.reduce((sum, id) => sum + products.find(product => product.id === id).price, 0);
  document.querySelector('#cartTotal').textContent = money(total);
}

function openDrawer() {
  renderCart();
  document.querySelector('.drawer').classList.add('open');
  document.querySelector('.drawer').setAttribute('aria-hidden', 'false');
  document.querySelector('.drawer-backdrop').hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  document.querySelector('.drawer').classList.remove('open');
  document.querySelector('.drawer').setAttribute('aria-hidden', 'true');
  document.querySelector('.drawer-backdrop').hidden = true;
  document.body.style.overflow = '';
}

function resetFilters() {
  state.brand = 'all'; state.category = 'all'; state.query = ''; state.saleOnly = false; state.wishOnly = false;
  document.querySelector('#searchInput').value = '';
  document.querySelectorAll('.brand-pill, .category-tab').forEach(item => item.classList.remove('active'));
  document.querySelector('[data-brand="all"]').classList.add('active');
  document.querySelector('[data-category="all"]').classList.add('active');
  render();
}

document.addEventListener('click', event => {
  const card = event.target.closest('.product-card');
  if (event.target.closest('.wish-button') && card) { toggleWish(+card.dataset.id); return; }
  if (event.target.closest('.card-add') && card) { addCart(+card.dataset.id); return; }
  if (event.target.closest('.product-art') && card) { openModal(products.find(p => p.id === +card.dataset.id)); return; }

  const brand = event.target.closest('.brand-pill');
  if (brand) {
    if (brand.dataset.brand === 'add') { notify('브랜드 추가 기능은 다음 버전에서 만나요.'); return; }
    document.querySelectorAll('.brand-pill').forEach(item => item.classList.remove('active'));
    brand.classList.add('active'); state.brand = brand.dataset.brand; state.wishOnly = false; render();
  }

  const category = event.target.closest('.category-tab');
  if (category) {
    document.querySelectorAll('.category-tab').forEach(item => item.classList.remove('active'));
    category.classList.add('active'); state.category = category.dataset.category; render();
  }

  if (event.target.closest('.cart-open')) openDrawer();
  if (event.target.closest('.drawer-close') || event.target.closest('.drawer-backdrop')) closeDrawer();
  if (event.target.closest('.search-toggle')) {
    document.querySelector('.search-panel').classList.add('open');
    document.querySelector('.search-panel').setAttribute('aria-hidden', 'false');
    setTimeout(() => document.querySelector('#searchInput').focus(), 100);
  }
  if (event.target.closest('.search-close')) {
    document.querySelector('.search-panel').classList.remove('open');
    document.querySelector('.search-panel').setAttribute('aria-hidden', 'true');
  }
  if (event.target.closest('[data-scroll-products]')) document.querySelector('#products').scrollIntoView();
  if (event.target.closest('.modal-close')) document.querySelector('#productModal').close();
  if (event.target.closest('.modal-add')) { addCart(state.activeProduct.id); document.querySelector('#productModal').close(); }
  if (event.target.closest('.remove-item')) { state.cart.splice(+event.target.closest('.remove-item').dataset.index, 1); persist(); renderCart(); }
  if (event.target.closest('.drawer-footer .checkout-button')) notify('데모에서는 결제 직전 단계까지만 제공돼요.');
  if (event.target.closest('.wishlist-open')) {
    state.wishOnly = true; state.saleOnly = false; state.brand = 'all'; state.category = 'all'; render();
    document.querySelector('#products').scrollIntoView(); notify(`찜한 상품 ${state.wishlist.size}개를 표시했어요.`);
  }
  if (event.target.closest('.reset-filter')) resetFilters();
});

document.addEventListener('keydown', event => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.product-art')) {
    openModal(products.find(p => p.id === +event.target.closest('.product-card').dataset.id));
  }
  if (event.key === 'Escape') closeDrawer();
});

document.querySelector('#searchInput').addEventListener('input', event => { state.query = event.target.value; render(); });
document.querySelector('#sortSelect').addEventListener('change', event => { state.sort = event.target.value; render(); });
document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => {
  document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
  link.classList.add('active'); state.saleOnly = link.dataset.view === 'sale'; state.wishOnly = false;
  if (link.dataset.view === 'new') { state.sort = 'new'; document.querySelector('#sortSelect').value = 'new'; }
  if (link.dataset.view === 'for-you') { state.sort = 'recommended'; document.querySelector('#sortSelect').value = 'recommended'; }
  render(); document.querySelector('#products').scrollIntoView();
}));

render();
renderCart();
