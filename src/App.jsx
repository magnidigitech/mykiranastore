import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Info,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Upload,
  ArrowLeft,
  FileSpreadsheet,
  Layers,
  Database,
  SlidersHorizontal,
  Home,
  ShoppingBag,
  Star,
  ClipboardList,
  Check,
  Share2,
  Copy,
  Undo,
  Menu
} from 'lucide-react';

const ITEMS_PER_PAGE = 24;

export default function App() {
  // Products and active states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // PWA Shopping List States
  const [shoppingList, setShoppingList] = useState(() => {
    try {
      const saved = localStorage.getItem('kiranstore_shopping_list');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [toast, setToast] = useState(null);
  const [cardSwipeId, setCardSwipeId] = useState(null);
  const [cardSwipeOffset, setCardSwipeOffset] = useState(0);

  const cardTouchStart = React.useRef({ x: 0, y: 0 });
  const cardSwipeActive = React.useRef(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Routing & Authentication states
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminPath, setIsAdminPath] = useState(window.location.pathname === '/admin');
  const [isLoggedIn, setIsLoggedIn] = useState(sessionStorage.getItem('isAdminLoggedIn') === 'true');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  // Contact Form states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // Sync window.location.pathname
  useEffect(() => {
    const handleLocationChange = () => {
      const isPathAdmin = window.location.pathname === '/admin';
      setIsAdminPath(isPathAdmin);
      setCurrentPath(window.location.pathname);
      if (!isPathAdmin) {
        setLoginUsername('');
        setLoginPassword('');
        setLoginError(null);
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
    setIsMobileMenuOpen(false);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginUsername === 'mykiranastore' && loginPassword === 'mykirana@2929') {
      sessionStorage.setItem('isAdminLoggedIn', 'true');
      setIsLoggedIn(true);
      setLoginError(null);
    } else {
      setLoginError('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    setIsLoggedIn(false);
    setLoginUsername('');
    setLoginPassword('');
    navigateTo('/');
  };

  // Shop View filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Admin View state
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);
  const [adminSelectedCategory, setAdminSelectedCategory] = useState('All');
  const [adminItemsPerPage, setAdminItemsPerPage] = useState(25);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [bulkCategorySearchTerm, setBulkCategorySearchTerm] = useState('');

  // Admin Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeProductToEdit, setActiveProductToEdit] = useState(null);
  
  // Form fields
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCategories, setFormCategories] = useState([]);
  const [formInStock, setFormInStock] = useState(true);
  const [formImage, setFormImage] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);

  // Bulk selection states
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [isBulkCatOpen, setIsBulkCatOpen] = useState(false);
  const [bulkCategories, setBulkCategories] = useState([]);
  const [isBulkStockOpen, setIsBulkStockOpen] = useState(false);
  const [bulkInStock, setBulkInStock] = useState(true);

  // 1. Fetch products from API on mount
  const fetchProducts = async (isInitial = false) => {
    const startTime = Date.now();
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to load products');
      }
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Could not fetch products. Make sure the backend server is running.');
    } finally {
      if (isInitial) {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 3000 - elapsedTime);
        setTimeout(() => {
          setLoading(false);
        }, remainingTime);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProducts(true);
  }, []);

  // 2. Compute unique categories and brands (cached)
  const categories = useMemo(() => {
    const allCats = new Set();
    products.forEach(p => {
      if (Array.isArray(p.categories)) {
        p.categories.forEach(c => allCats.add(c));
      }
    });
    return ['All', ...Array.from(allCats).sort()];
  }, [products]);

  const brands = useMemo(() => {
    const productsInSelectedCategory = selectedCategory === 'All'
      ? products
      : products.filter(p => p.categories && p.categories.includes(selectedCategory));
    const allBrands = new Set(productsInSelectedCategory.map(p => p.brand).filter(Boolean));
    return ['All', ...Array.from(allBrands).sort()];
  }, [products, selectedCategory]);

  // 3. Shop View: Filtered & Paginated Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (p.categories && p.categories.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesCategory = selectedCategory === 'All' || (p.categories && p.categories.includes(selectedCategory));
      const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
      
      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [products, searchTerm, selectedCategory, selectedBrand]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  // 4. Admin View: Filtered & Paginated Products
  const adminFilteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
                            (p.brand && p.brand.toLowerCase().includes(adminSearchTerm.toLowerCase())) ||
                            (p.categories && p.categories.some(c => c.toLowerCase().includes(adminSearchTerm.toLowerCase())));
      const matchesCategory = adminSelectedCategory === 'All' || (p.categories && p.categories.includes(adminSelectedCategory));
      return matchesSearch && matchesCategory;
    });
  }, [products, adminSearchTerm, adminSelectedCategory]);

  const adminPaginatedProducts = useMemo(() => {
    const start = (adminCurrentPage - 1) * adminItemsPerPage;
    return adminFilteredProducts.slice(start, start + adminItemsPerPage);
  }, [adminFilteredProducts, adminCurrentPage, adminItemsPerPage]);

  const adminTotalPages = Math.ceil(adminFilteredProducts.length / adminItemsPerPage);

  // Reset pagination when filters change
  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setSelectedBrand('All');
    setCurrentPage(1);
    setSelectedProductIds([]);
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setCurrentPage(1);
    setSelectedProductIds([]);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    setSelectedProductIds([]);
    if (window.location.pathname !== '/products') {
      navigateTo('/products');
    }
  };

  // --- PWA SHOPPING LIST METHODS & GESTURES ---

  const isItemInList = (id) => shoppingList.some(item => item.id === id);

  const addProductToList = (product) => {
    const previousList = [...shoppingList];
    const existingIndex = shoppingList.findIndex(item => item.id === product.id);
    let newList;
    if (existingIndex >= 0) {
      newList = shoppingList.map((item, idx) => 
        idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newList = [
        ...shoppingList,
        {
          id: product.id,
          name: product.name,
          brand: product.brand,
          image: product.image,
          inStock: product.inStock,
          checked: false,
          quantity: 1
        }
      ];
    }
    
    setShoppingList(newList);
    localStorage.setItem('kiranstore_shopping_list', JSON.stringify(newList));
    
    setToast({
      message: `Added "${product.name}" to your shopping list.`,
      actionText: 'Undo',
      onAction: () => {
        setShoppingList(previousList);
        localStorage.setItem('kiranstore_shopping_list', JSON.stringify(previousList));
        setToast(null);
      }
    });
  };

  const removeProductFromList = (id) => {
    const previousList = [...shoppingList];
    const itemToRemove = shoppingList.find(item => item.id === id);
    if (!itemToRemove) return;

    const newList = shoppingList.filter(item => item.id !== id);
    setShoppingList(newList);
    localStorage.setItem('kiranstore_shopping_list', JSON.stringify(newList));

    setToast({
      message: `Removed "${itemToRemove.name}" from your shopping list.`,
      actionText: 'Undo',
      onAction: () => {
        setShoppingList(previousList);
        localStorage.setItem('kiranstore_shopping_list', JSON.stringify(previousList));
        setToast(null);
      }
    });
  };

  const toggleProductChecked = (id) => {
    const newList = shoppingList.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setShoppingList(newList);
    localStorage.setItem('kiranstore_shopping_list', JSON.stringify(newList));
  };

  const updateProductQuantity = (id, change) => {
    const newList = shoppingList.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setShoppingList(newList);
    localStorage.setItem('kiranstore_shopping_list', JSON.stringify(newList));
  };

  const clearCheckedItems = () => {
    const previousList = [...shoppingList];
    const newList = shoppingList.filter(item => !item.checked);
    if (newList.length === shoppingList.length) return;

    setShoppingList(newList);
    localStorage.setItem('kiranstore_shopping_list', JSON.stringify(newList));

    setToast({
      message: 'Cleared checked items.',
      actionText: 'Undo',
      onAction: () => {
        setShoppingList(previousList);
        localStorage.setItem('kiranstore_shopping_list', JSON.stringify(previousList));
        setToast(null);
      }
    });
  };

  const clearAllItems = () => {
    if (shoppingList.length === 0) return;
    if (!window.confirm('Are you sure you want to clear your entire shopping list?')) return;

    const previousList = [...shoppingList];
    setShoppingList([]);
    localStorage.setItem('kiranstore_shopping_list', JSON.stringify([]));

    setToast({
      message: 'Cleared all items.',
      actionText: 'Undo',
      onAction: () => {
        setShoppingList(previousList);
        localStorage.setItem('kiranstore_shopping_list', JSON.stringify(previousList));
        setToast(null);
      }
    });
  };

  // Card Touch Swipe Gestures for Mobile Add to List
  const handleCardTouchStart = (e, product) => {
    if (e.touches.length !== 1) return;
    cardTouchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    cardSwipeActive.current = false;
    setCardSwipeId(product.id);
    setCardSwipeOffset(0);
  };

  const handleCardTouchMove = (e) => {
    if (!cardTouchStart.current || e.touches.length !== 1) return;
    const diffX = e.touches[0].clientX - cardTouchStart.current.x;
    const diffY = e.touches[0].clientY - cardTouchStart.current.y;

    if (!cardSwipeActive.current) {
      if (Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY)) {
        cardSwipeActive.current = true;
      }
    }

    if (cardSwipeActive.current) {
      if (e.cancelable) e.preventDefault();
      const offset = Math.max(0, Math.min(diffX, 150));
      setCardSwipeOffset(offset);
    }
  };

  const handleCardTouchEnd = (e, product) => {
    const isSwipeTriggered = cardSwipeActive.current;
    const currentOffset = cardSwipeOffset;

    cardTouchStart.current = null;
    cardSwipeActive.current = false;
    setCardSwipeId(null);
    setCardSwipeOffset(0);

    if (isSwipeTriggered && currentOffset > 80) {
      addProductToList(product);
    }
  };

  // 5. Lightbox Nav
  const openLightbox = (product) => {
    const idx = filteredProducts.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      setLightboxIndex(idx);
    }
  };

  const navigateLightbox = (direction) => {
    if (lightboxIndex === null) return;
    const n = filteredProducts.length;
    let nextIdx = (lightboxIndex + direction) % n;
    if (nextIdx < 0) {
      nextIdx = n - 1;
    }
    setLightboxIndex(nextIdx);
  };

  // Swipe Touch Navigation for Lightbox
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartX = React.useRef(0);
  const touchEndX = React.useRef(0);
  const isSwiping = React.useRef(false);
  const isTransitionDisabled = React.useRef(false);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
    isSwiping.current = false;
    isTransitionDisabled.current = false;
    setSwipeOffset(0);
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === 0) return;
    touchEndX.current = e.targetTouches[0].clientX;
    const diffX = touchEndX.current - touchStartX.current;
    
    // Set offset for swipe tracking
    setSwipeOffset(diffX);

    if (Math.abs(diffX) > 10) {
      isSwiping.current = true;
    }
  };

  const triggerSwipeTransition = (direction) => {
    // 1. Enable transitions
    touchStartX.current = 0;
    isTransitionDisabled.current = false;
    
    // 2. Animate old card out (direction 1 = swipe left, card goes left)
    const slideOutOffset = direction === 1 ? -600 : 600;
    setSwipeOffset(slideOutOffset);
    
    setTimeout(() => {
      // 3. Increment/decrement product index
      const n = filteredProducts.length;
      let nextIdx = (lightboxIndex + direction) % n;
      if (nextIdx < 0) nextIdx = n - 1;
      setLightboxIndex(nextIdx);
      
      // 4. Instantly teleport new card to opposite side (disable transition)
      isTransitionDisabled.current = true;
      const slideInOffset = direction === 1 ? 600 : -600;
      setSwipeOffset(slideInOffset);
      
      // 5. In next tick, enable transitions and slide back to center (0px)
      setTimeout(() => {
        isTransitionDisabled.current = false;
        setSwipeOffset(0);
      }, 50);
    }, 200);
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === 0) return;
    const diffX = touchEndX.current - touchStartX.current;
    const threshold = 80;
    
    if (diffX < -threshold) {
      triggerSwipeTransition(1);
    } else if (diffX > threshold) {
      triggerSwipeTransition(-1);
    } else {
      // Snap back to center
      setSwipeOffset(0);
      touchStartX.current = 0;
    }
  };

  const handleOverlayClick = (e) => {
    if (!isSwiping.current) {
      setLightboxIndex(null);
    }
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
      if (e.key === 'Escape') setLightboxIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredProducts]);

  const activeLightboxProduct = useMemo(() => {
    if (lightboxIndex === null) return null;
    return filteredProducts[lightboxIndex];
  }, [lightboxIndex, filteredProducts]);

  // 6. Admin Actions
  const handleOpenAddForm = () => {
    setActiveProductToEdit(null);
    setFormName('');
    setFormBrand('Kiran Store');
    setFormCategories([]);
    setCategorySearchTerm('');
    setFormInStock(true);
    setFormImage('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (product) => {
    setActiveProductToEdit(product);
    setFormName(product.name);
    setFormBrand(product.brand || '');
    setFormCategories(product.categories ? [...product.categories] : []);
    setCategorySearchTerm('');
    setFormInStock(product.inStock);
    setFormImage(product.image || '');
    setIsFormOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    // Pass name hint for clean filename naming
    formData.append('productName', formName || 'product');

    try {
      setIsUploading(true);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setFormImage(data.imageUrl);
    } catch (err) {
      console.error(err);
      alert('Failed to upload image. Make sure server is running.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Product name is required');
      return;
    }

    const payload = {
      name: formName.trim(),
      brand: formBrand.trim() || 'Kiran Store',
      categories: formCategories.filter(Boolean),
      inStock: formInStock,
      image: formImage || '/images/placeholder.png'
    };

    try {
      let res;
      if (activeProductToEdit) {
        res = await fetch(`/api/products/${activeProductToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error('Failed to save product');
      
      setIsFormOpen(false);
      fetchProducts(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Failed to save product information.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action will permanently remove it from the catalogue.')) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      fetchProducts(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Failed to delete product.');
    }
  };

  // Bulk selection operations
  const toggleSelectProduct = (id) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedProductIds(prev => [...prev, id]);
    }
  };

  const toggleSelectAll = () => {
    const visibleIds = adminPaginatedProducts.map(p => p.id);
    const allSelected = visibleIds.every(id => selectedProductIds.includes(id));
    if (allSelected) {
      setSelectedProductIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedProductIds(prev => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete the ${selectedProductIds.length} selected products?`)) {
      return;
    }

    try {
      const res = await fetch('/api/products/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedProductIds })
      });
      if (!res.ok) throw new Error('Bulk delete failed');
      setSelectedProductIds([]);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to delete selected products.');
    }
  };

  const handleBulkCategoryUpdate = async (e) => {
    e.preventDefault();
    if (selectedProductIds.length === 0) return;

    try {
      const res = await fetch('/api/products/bulk-update-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedProductIds,
          categories: bulkCategories
        })
      });
      if (!res.ok) throw new Error('Bulk category update failed');
      setIsBulkCatOpen(false);
      setBulkCategories([]);
      setSelectedProductIds([]);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to update categories for selected products.');
    }
  };

  const handleBulkStockUpdate = async (e) => {
    e.preventDefault();
    if (selectedProductIds.length === 0) return;

    try {
      const res = await fetch('/api/products/bulk-update-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedProductIds,
          inStock: bulkInStock
        })
      });
      if (!res.ok) throw new Error('Bulk stock update failed');
      setIsBulkStockOpen(false);
      setSelectedProductIds([]);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to update stock status for selected products.');
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = products.length;
    const outOfStock = products.filter(p => !p.inStock).length;
    const activeBrands = new Set(products.map(p => p.brand).filter(Boolean)).size;
    const activeCats = categories.length - 1; // Subtract 'All'
    return { total, outOfStock, activeBrands, activeCats };
  }, [products, categories]);

  return (
    <div className="app-container">
      {/* Top Info Bar */}
      <div className="top-info-bar" style={{
        background: 'linear-gradient(90deg, #15803d, #22c55e)',
        color: 'white',
        fontSize: '0.825rem',
        fontWeight: '600',
        padding: '0.5rem 1rem',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        <Info size={14} />
        <span>In-Store Shopping Only | Visit us in Calgary or Call (403) 497-2777 to check real-time stock availability</span>
      </div>

      {/* Dynamic Header */}
      <header className="header">
        <div className="header-inner">
          <div 
            className="logo-container" 
            onClick={() => { navigateTo('/'); setSelectedCategory('All'); setSelectedBrand('All'); setSearchTerm(''); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <img 
              src="/logo-icon.png" 
              alt="Logo Icon" 
              style={{ height: '45px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <img 
              src="/logo-text.png" 
              alt="Logo Text" 
              style={{ height: '42px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Search bar (desktop header version) */}
          {!isAdminPath && (
            <div className="search-container header-search-desktop">
              <Search className="search-icon-left" size={18} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search 500+ premium Indian spices, rices, lentils..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          )}

          {/* Actions */}
          <div className="header-actions" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {isAdminPath ? (
              <button className="cart-button-trigger" onClick={() => navigateTo('/')}>
                <ArrowLeft size={16} />
                <span>Back to Catalogue</span>
              </button>
            ) : (
              <>
                <a href="tel:+14034972777" className="header-phone-desktop" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                  color: 'hsl(var(--color-text-dark))',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>
                  <Phone size={18} style={{ color: 'hsl(var(--color-primary-dark))' }} />
                  <span>+1 (403) 497-2777</span>
                </a>
                <button 
                  className="hamburger-menu-btn"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Toggle navigation menu"
                  style={{
                    display: 'none',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    color: 'hsl(var(--color-text-dark))'
                  }}
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search Bar Container */}
      {!isAdminPath && (
        <div className="mobile-search-bar-container">
          <div className="search-container mobile-search">
            <Search className="search-icon-left" size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search 500+ premium Indian spices, rices, lentils..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {!isAdminPath && isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span className="mobile-menu-title">My Kiranastore</span>
              <button className="mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <nav className="mobile-menu-nav">
              <button 
                className={`mobile-menu-nav-link ${currentPath === '/' ? 'active' : ''}`}
                onClick={() => navigateTo('/')}
              >
                <Home size={20} />
                <span>Home</span>
              </button>
              <button 
                className={`mobile-menu-nav-link ${currentPath === '/products' ? 'active' : ''}`}
                onClick={() => navigateTo('/products')}
              >
                <ShoppingBag size={20} />
                <span>Products</span>
              </button>
              <button 
                className={`mobile-menu-nav-link ${currentPath === '/contact' ? 'active' : ''}`}
                onClick={() => navigateTo('/contact')}
              >
                <Phone size={20} />
                <span>Contact Us</span>
              </button>
              <button 
                className={`mobile-menu-nav-link ${currentPath === '/mylist' ? 'active' : ''}`}
                onClick={() => navigateTo('/mylist')}
                style={{ position: 'relative' }}
              >
                <ClipboardList size={20} />
                <span>My Shopping List</span>
                {shoppingList.length > 0 && (
                  <span className="mobile-badge-list-count">{shoppingList.length}</span>
                )}
              </button>
            </nav>

            <div className="mobile-menu-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--color-text-dark))', fontWeight: '700', marginBottom: '0.5rem' }}>
                <Phone size={16} />
                <span>+1 (403) 497-2777</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))' }}>
                Unit 1125, 6520 36 St NE, Calgary, AB
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Navigation Bar for storefront views */}
      {!isAdminPath && (
        <nav className="sub-nav">
          <button 
            className={`sub-nav-link ${currentPath === '/' ? 'active' : ''}`}
            onClick={() => navigateTo('/')}
          >
            <Home size={16} />
            <span>Home</span>
          </button>
          <button 
            className={`sub-nav-link ${currentPath === '/products' ? 'active' : ''}`}
            onClick={() => navigateTo('/products')}
          >
            <ShoppingBag size={16} />
            <span>Products</span>
          </button>
          <button 
            className={`sub-nav-link ${currentPath === '/contact' ? 'active' : ''}`}
            onClick={() => navigateTo('/contact')}
          >
            <Phone size={16} />
            <span>Contact</span>
          </button>
          <button 
            className={`sub-nav-link ${currentPath === '/mylist' ? 'active' : ''}`}
            onClick={() => navigateTo('/mylist')}
            style={{ position: 'relative' }}
          >
            <ClipboardList size={16} />
            <span>My List</span>
            {shoppingList.length > 0 && (
              <span className="badge-list-count">{shoppingList.length}</span>
            )}
          </button>
        </nav>
      )}

      {/* ERROR MESSAGE IF SERVER DISCONNECTED */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          borderBottom: '1px solid #fee2e2',
          color: '#ef4444',
          padding: '0.75rem 1rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          {error}
        </div>
      )}

      {/* LOADING STATE */}
      {loading ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '5rem 0',
          gap: '1.25rem',
          color: 'hsl(var(--color-text-muted))'
        }}>
          <img 
            src="/logo-icon.png" 
            alt="Loading..." 
            className="loader-logo-animation"
            style={{ height: '70px', objectFit: 'contain' }}
            onError={(e) => { e.target.src = '/logo.png'; }}
          />
          <span style={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '-0.2px' }}>
            Loading Calgary's Indian Store Catalogue...
          </span>
        </div>
      ) : (
        <>
          {/* ==================== ADMIN HOME LANDING PAGE ==================== */}
          {currentPath === '/' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Hero Banner Section */}
              <section className="landing-hero">
                <div className="landing-hero-inner">
                  <span className="landing-badge">Grocery & General Store</span>
                  <h1 className="landing-title">Authentic Indian Groceries <span>Right in Calgary</span></h1>
                  <p className="landing-desc">
                    Explore Calgary's premier shopping destination for high-quality Indian foods. We import premium basmati rices, hand-ground spices, traditional flours (atta), homestyle pickles, sweets, and essential kitchen dry goods.
                  </p>
                  <div className="landing-ctas">
                    <button className="btn-primary" onClick={() => navigateTo('/products')}>
                      Explore Products
                    </button>
                    <button className="btn-secondary" onClick={() => navigateTo('/contact')}>
                      Contact Us
                    </button>
                  </div>
                </div>
              </section>

              {/* Core Features / Departments Section */}
              <section className="landing-features">
                <div className="section-header">
                  <h2 className="section-title">Our Store Departments</h2>
                  <p className="section-desc">We stock over 500+ premium imports to bring you authentic tastes of home</p>
                </div>
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon-wrapper">
                      <ShoppingBag size={24} />
                    </div>
                    <h3 className="feature-title">Premium Staples</h3>
                    <p className="feature-desc">High-quality basmati rice, organic dals, premium lentils, and traditional wheat flours (atta) for daily home cooking.</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon-wrapper">
                      <SlidersHorizontal size={24} />
                    </div>
                    <h3 className="feature-title">Authentic Spices</h3>
                    <p className="feature-desc">Pure, aromatic whole and ground spices, authentic masalas, and condiments to elevate your dishes.</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon-wrapper">
                      <Info size={24} />
                    </div>
                    <h3 className="feature-title">Traditional Imports</h3>
                    <p className="feature-desc">Homestyle spicy pickles, traditional sweets, tea leaves, pooja essentials, and frozen Indian food specialties.</p>
                  </div>
                </div>
              </section>

              {/* Promo Banner */}
              <section className="promo-banner">
                <div className="promo-banner-inner">
                  <h2 className="promo-title">Visit Us In-Store Today</h2>
                  <p className="promo-desc">
                    We offer a clean, organized, and friendly shopping environment. Check out our physical store location in Calgary, Alberta, for all your daily grocery essentials!
                  </p>
                  <button className="btn-secondary" style={{ border: 'none', background: 'white', color: 'hsl(var(--color-primary-dark))', marginTop: '0.5rem' }} onClick={() => navigateTo('/contact')}>
                    Get Directions & Hours
                  </button>
                </div>
              </section>

              {/* Customer Testimonials Section */}
              <section className="testimonials-section">
                <div className="section-header">
                  <h2 className="section-title">Loved by the Calgary Community</h2>
                  <p className="section-desc">Here is what our shoppers have to say about their experience</p>
                </div>
                <div className="testimonials-grid">
                  <div className="testimonial-card">
                    <div className="testimonial-stars">
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                    </div>
                    <p className="testimonial-text">"The absolute best place in Calgary to find authentic Indian brands. Excellent selection of flours and rice, and the stock is always fresh. Staff is incredibly helpful!"</p>
                    <div className="testimonial-author">
                      Amrit Singh
                      <span>Calgary Shopper</span>
                    </div>
                  </div>
                  <div className="testimonial-card">
                    <div className="testimonial-stars">
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                    </div>
                    <p className="testimonial-text">"Very clean and well-organized store. I can always find my favorite brands of pickles and spices here. Highly recommended for daily grocery shopping!"</p>
                    <div className="testimonial-author">
                      Priya Patel
                      <span>Regular Customer</span>
                    </div>
                  </div>
                  <div className="testimonial-card">
                    <div className="testimonial-stars">
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                    </div>
                    <p className="testimonial-text">"Amazing selection and very fair prices. Having real-time catalogue updates makes planning my store visits so much easier. Love shopping here!"</p>
                    <div className="testimonial-author">
                      Rajesh Kumar
                      <span>Calgary Resident</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ==================== CONTACT PAGE ==================== */}
          {currentPath === '/contact' && (
            <div className="contact-layout">
              {/* Left Column: Info Card */}
              <div className="contact-info-col">
                <div className="contact-card-info">
                  <h2 className="feature-title" style={{ fontSize: '1.4rem', borderBottom: '2px solid hsl(var(--color-primary) / 0.15)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Store Information</h2>
                  
                  <div className="contact-item-row">
                    <MapPin className="contact-item-icon" size={20} />
                    <div className="contact-item-details">
                      <span className="contact-item-label">Location Address</span>
                      <span className="contact-item-value">6520 36 St NE Unit 1125, Calgary, AB T3J 2L3, Canada</span>
                    </div>
                  </div>

                  <div className="contact-item-row">
                    <Phone className="contact-item-icon" size={20} />
                    <div className="contact-item-details">
                      <span className="contact-item-label">Phone Helpline</span>
                      <span className="contact-item-value">+1 (403) 497-2777</span>
                    </div>
                  </div>

                  <div className="contact-item-row">
                    <Mail className="contact-item-icon" size={20} />
                    <div className="contact-item-details">
                      <span className="contact-item-label">Email Support</span>
                      <span className="contact-item-value">support@kiranstore.ca</span>
                    </div>
                  </div>

                  <div className="contact-item-row">
                    <Clock className="contact-item-icon" size={20} style={{ minWidth: '20px' }} />
                    <div className="contact-item-details">
                      <span className="contact-item-label">Store Hours</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem', color: 'hsl(var(--color-text-dark))', marginTop: '0.35rem' }}>
                        <span style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem' }}>
                          <strong>Thu, Sun - Tue:</strong> <span>10:30 AM - 9:00 PM</span>
                        </span>
                        <span style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem' }}>
                          <strong>Fri & Sat:</strong> <span>10:30 AM - 10:00 PM</span>
                        </span>
                        <span style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem' }}>
                          <strong>Wednesday:</strong> <span>11:00 AM - 9:00 PM</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="contact-item-row">
                    <Calendar className="contact-item-icon" size={20} />
                    <div className="contact-item-details">
                      <span className="contact-item-label">Availability</span>
                      <span className="contact-item-value">Open 7 days a week</span>
                    </div>
                  </div>
                </div>

                {/* Embedded Live Google Map */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <iframe 
                    src="https://maps.google.com/maps?q=6520%2036%20St%20NE%20Unit%201125,%20Calgary,%20AB%20T3J%202L3&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                    width="100%" 
                    height="280" 
                    style={{ border: 0, borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }} 
                    allowFullScreen="" 
                    loading="lazy"
                    title="Google Maps Location"
                  ></iframe>
                  
                  <a 
                    href="https://maps.app.goo.gl/mjEDAobe9SAdxDKy7" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      padding: '0.65rem 1rem',
                      fontWeight: 700
                    }}
                  >
                    <MapPin size={16} style={{ color: 'hsl(var(--color-primary-dark))' }} />
                    <span>Open in Google Maps App</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Contact form */}
              <div className="contact-form-card">
                <h2 className="feature-title" style={{ fontSize: '1.4rem', borderBottom: '2px solid hsl(var(--color-primary) / 0.15)', paddingBottom: '0.5rem' }}>Send Us a Message</h2>
                <p style={{ fontSize: '0.875rem', color: 'hsl(var(--color-text-muted))', marginTop: '-0.75rem' }}>
                  Have questions about product availability or bulk orders? Leave your details below and we will contact you.
                </p>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  alert(`Thank you, ${contactName}! Your message has been sent. We will get back to you shortly.`);
                  setContactName('');
                  setContactEmail('');
                  setContactMessage('');
                }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-input-text" 
                      placeholder="Enter your name" 
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-input-text" 
                      placeholder="Enter your email" 
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea 
                      className="form-textarea" 
                      placeholder="Type your message here..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ height: '46px', width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.95rem' }}
                  >
                    Submit Message
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ==================== SHOP FRONT VIEW ==================== */}
          {currentPath === '/products' && (
            <>
              {/* Hero Banner */}
              <section className="hero-banner">
                <h1 className="hero-title">Browse Our <span>Product Catalogue</span></h1>
                <p className="hero-desc">
                  Explore Calgary's best selection of authentic Indian flours, premium basmati rices, hand-ground spices, traditional pickles, and frozen delicacies. Click any product to view its image in full-screen size.
                </p>
              </section>

              {/* Shop Layout Two-Column Container */}
              <div className="shop-layout-container">
                {/* Left Sidebar Filter Column */}
                <aside className="shop-sidebar">
                  {/* Categories List */}
                  <div>
                    <h3 className="sidebar-section-title">Categories</h3>
                    <div className="sidebar-category-list">
                      {categories.map(cat => (
                        <button 
                          key={cat} 
                          className={`sidebar-category-btn ${selectedCategory === cat ? 'active' : ''}`}
                          onClick={() => handleCategorySelect(cat)}
                        >
                          <span>{cat === 'All' ? '🌟 All Items' : cat}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brand Filter */}
                  <div>
                    <h3 className="sidebar-section-title">Filter by Brand</h3>
                    <div className="sidebar-category-list" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                      {brands.map(b => (
                        <button 
                          key={b} 
                          className={`sidebar-category-btn ${selectedBrand === b ? 'active' : ''}`}
                          onClick={() => handleBrandSelect(b)}
                        >
                          <span>{b === 'All' ? '🏷️ All Brands' : b}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </aside>

                {/* Right Content Column */}
                <main className="shop-content">
                  {/* Results Header */}
                  <div className="results-header">
                    <div className="results-title">
                      {selectedCategory === 'All' ? 'All Products' : selectedCategory}
                      <span>({filteredProducts.length} items found)</span>
                    </div>
                  </div>

                {/* Product Grid */}
                {filteredProducts.length > 0 ? (
                  <>
                    <div className="product-grid">
                      {paginatedProducts.map(product => {
                        const isAdded = isItemInList(product.id);
                        return (
                          <div className="product-card-container" key={product.id}>
                            {/* Swipe background behind card */}
                            {cardSwipeId === product.id && cardSwipeOffset > 0 && (
                              <div className="card-swipe-bg">
                                <Plus size={24} style={{
                                  transform: `scale(${Math.min(1.5, 0.5 + cardSwipeOffset / 100)})`,
                                  transition: 'transform 0.1s ease-out'
                                }} />
                                <span style={{ marginLeft: '0.75rem', fontWeight: '600' }}>Add to List</span>
                              </div>
                            )}
                            <article 
                              className="product-card" 
                              onClick={() => {
                                if (!cardSwipeActive.current) {
                                  openLightbox(product);
                                }
                              }}
                              onTouchStart={(e) => handleCardTouchStart(e, product)}
                              onTouchMove={handleCardTouchMove}
                              onTouchEnd={(e) => handleCardTouchEnd(e, product)}
                              style={{
                                transform: cardSwipeId === product.id ? `translateX(${cardSwipeOffset}px)` : 'translateX(0)',
                                transition: cardSwipeId === product.id ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                position: 'relative',
                                zIndex: 2,
                                backgroundColor: 'white'
                              }}
                            >
                              <div className="card-img-container">
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="card-img"
                                  onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                                />
                                <span className="badge-brand">{product.brand}</span>
                                {!product.inStock && <span className="badge-stock">Out of Stock</span>}
                              </div>

                              <div className="card-content">
                                <span className="product-category">{product.categories.join(', ')}</span>
                                <h3 className="product-name" title={product.name}>{product.name}</h3>
                                <div className="card-footer" style={{ 
                                  borderTop: '1px solid hsl(var(--color-border) / 0.5)', 
                                  paddingTop: '0.75rem', 
                                  marginTop: '0.5rem', 
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  width: '100%'
                                }}>
                                  <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    color: product.inStock ? 'hsl(var(--color-success))' : '#ef4444',
                                    background: product.inStock ? 'hsl(var(--color-success-bg))' : '#fee2e2',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: 'var(--radius-sm)'
                                  }}>
                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isAdded) {
                                        removeProductFromList(product.id);
                                      } else {
                                        addProductToList(product);
                                      }
                                    }}
                                    className={`btn-add-list ${isAdded ? 'added' : ''}`}
                                  >
                                    {isAdded ? <Check size={14} /> : <Plus size={14} />}
                                    <span>{isAdded ? 'Added' : 'Add to List'}</span>
                                  </button>
                                </div>
                              </div>
                            </article>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="pagination">
                        <button 
                          className="page-btn" 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          &lt;
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                          .map((p, idx, arr) => {
                            const elements = [];
                            if (idx > 0 && arr[idx - 1] !== p - 1) {
                              elements.push(<span key={`dots-${p}`} style={{ color: 'hsl(var(--color-text-muted))' }}>...</span>);
                            }
                            elements.push(
                              <button 
                                key={p} 
                                className={`page-btn ${currentPage === p ? 'active' : ''}`}
                                onClick={() => setCurrentPage(p)}
                              >
                                {p}
                              </button>
                            );
                            return elements;
                          })}
                        <button 
                          className="page-btn" 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          &gt;
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="empty-state">
                    <Search size={48} style={{ color: 'hsl(var(--color-text-muted))' }} />
                    <h3 className="empty-title">No products found</h3>
                    <p className="empty-desc">We couldn't find anything matching your search. Try checking spelling or using different keywords.</p>
                  </div>
                )}
              </main>

              {/* Mobile Bottom Filter Action Bar */}
              <div className="mobile-bottom-bar">
                <button className="mobile-filter-btn" onClick={() => setIsMobileFilterOpen(true)}>
                  <SlidersHorizontal size={16} />
                  <span>FILTER & SORT</span>
                </button>
              </div>

              {/* Mobile Filter Bottom Sheet */}
              {isMobileFilterOpen && (
                <div className="bottom-sheet-overlay" onClick={() => setIsMobileFilterOpen(false)}>
                  <div className="bottom-sheet-container" onClick={(e) => e.stopPropagation()}>
                    <div className="bottom-sheet-header">
                      <span className="bottom-sheet-title">Filter & Sort</span>
                      <button className="bottom-sheet-close" onClick={() => setIsMobileFilterOpen(false)}>
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div className="bottom-sheet-body">
                      {/* Categories List */}
                      <div style={{ marginBottom: '1.75rem' }}>
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'hsl(var(--color-text-muted))', marginBottom: '0.75rem', fontWeight: 800, letterSpacing: '0.5px' }}>Categories</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '240px', overflowY: 'auto' }}>
                          {categories.map(cat => (
                            <button 
                              key={cat} 
                              className={`sidebar-category-btn ${selectedCategory === cat ? 'active' : ''}`}
                              onClick={() => { handleCategorySelect(cat); setIsMobileFilterOpen(false); }}
                            >
                              <span>{cat === 'All' ? '🌟 All Items' : cat}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Brand List */}
                      <div>
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'hsl(var(--color-text-muted))', marginBottom: '0.75rem', fontWeight: 800, letterSpacing: '0.5px' }}>Filter by Brand</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '200px', overflowY: 'auto' }}>
                          {brands.map(b => (
                            <button 
                              key={b} 
                              className={`sidebar-category-btn ${selectedBrand === b ? 'active' : ''}`}
                              onClick={() => { handleBrandSelect(b); setIsMobileFilterOpen(false); }}
                            >
                              <span>{b === 'All' ? '🏷️ All Brands' : b}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bottom-sheet-footer">
                      <button className="admin-btn admin-btn-primary" style={{ width: '100%', height: '44px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setIsMobileFilterOpen(false)}>
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
              </div>

              {/* Full-Screen Lightbox Modal */}
              {activeLightboxProduct && (
                <div 
                  className="lightbox-overlay" 
                  onClick={handleOverlayClick}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <button className="lightbox-close" onClick={() => setLightboxIndex(null)}>
                    <X size={24} />
                  </button>
                  
                  <button 
                    className="lightbox-arrow left" 
                    onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
                    title="Previous Image (Left Arrow)"
                  >
                    <ChevronLeft size={36} />
                  </button>

                  <div 
                    className="lightbox-content" 
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.05}deg)`,
                      transition: (touchStartX.current !== 0 || isTransitionDisabled.current) 
                        ? 'none' 
                        : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s',
                      opacity: Math.max(0.4, 1 - Math.abs(swipeOffset) / 450)
                    }}
                  >
                    <div className="lightbox-img-wrapper">
                      <img 
                        src={activeLightboxProduct.image} 
                        alt={activeLightboxProduct.name} 
                        className="lightbox-img"
                        onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                      />
                    </div>
                    
                    <div className="lightbox-details">
                      <span className="lightbox-meta">
                        {activeLightboxProduct.brand} | {activeLightboxProduct.categories.join(', ')}
                      </span>
                      <h2 className="lightbox-title">{activeLightboxProduct.name}</h2>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          color: activeLightboxProduct.inStock ? 'hsl(var(--color-success))' : '#ef4444'
                        }}>
                          {activeLightboxProduct.inStock ? '● Available In-Store' : '● Temporarily Out of Stock'}
                        </span>
                        <button
                          onClick={() => {
                            const isAdded = isItemInList(activeLightboxProduct.id);
                            if (isAdded) {
                              removeProductFromList(activeLightboxProduct.id);
                            } else {
                              addProductToList(activeLightboxProduct);
                            }
                          }}
                          className={`btn-add-list ${isItemInList(activeLightboxProduct.id) ? 'added' : ''}`}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                          {isItemInList(activeLightboxProduct.id) ? <Check size={16} /> : <Plus size={16} />}
                          <span>{isItemInList(activeLightboxProduct.id) ? 'Added to List' : 'Add to List'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    className="lightbox-arrow right" 
                    onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
                    title="Next Image (Right Arrow)"
                  >
                    <ChevronRight size={36} />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ==================== SHOPPING LIST VIEW ==================== */}
          {currentPath === '/mylist' && (
            <div className="mylist-layout">
              {/* Header Card */}
              <div className="mylist-header-card">
                <div className="mylist-title-row">
                  <h1 className="mylist-title">
                    <ClipboardList size={32} style={{ color: 'hsl(var(--color-primary))' }} />
                    <span>My Shopping List</span>
                  </h1>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: 'white',
                    background: 'hsl(var(--color-primary))',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    {shoppingList.length} {shoppingList.length === 1 ? 'Item' : 'Items'}
                  </span>
                </div>
                <p className="mylist-subtitle">
                  Build your checklist offline before visiting us in Calgary. Check off items as you drop them in your basket. Your list is saved automatically.
                </p>
              </div>

              {shoppingList.length > 0 ? (
                <>
                  {/* Share & Clear Action Card */}
                  <div className="mylist-actions-card">
                    <div className="mylist-share-group">
                      <button 
                        className="btn-share btn-share-copy" 
                        onClick={() => {
                          const listText = shoppingList
                            .map(item => `${item.checked ? '[x]' : '[ ]'} ${item.quantity}x ${item.name} (${item.brand})`)
                            .join('\n');
                          const fullText = `My Kiranastore Shopping List:\n\n${listText}\n\nBuild your list offline at: ${window.location.origin}/mylist`;
                          navigator.clipboard.writeText(fullText)
                            .then(() => {
                              setToast({ message: 'List copied to clipboard!' });
                            })
                            .catch(err => {
                              console.error('Failed to copy: ', err);
                            });
                        }}
                      >
                        <Copy size={16} />
                        <span>Copy List</span>
                      </button>
                      <button 
                        className="btn-share btn-share-email"
                        onClick={() => {
                          const listText = shoppingList
                            .map(item => `${item.checked ? '[x]' : '[ ]'} ${item.quantity}x ${item.name} (${item.brand})`)
                            .join('%0D%0A');
                          const subject = encodeURIComponent('My Kiranastore Shopping List');
                          const body = encodeURIComponent('Here is my shopping list for My Kiranastore:\n\n') + listText;
                          window.location.href = `mailto:?subject=${subject}&body=${body}`;
                        }}
                      >
                        <Mail size={16} />
                        <span>Email List</span>
                      </button>
                    </div>

                    <div className="btn-clear-group">
                      <button 
                        className="btn-clear btn-clear-checked"
                        onClick={clearCheckedItems}
                        disabled={!shoppingList.some(item => item.checked)}
                      >
                        Clear Checked
                      </button>
                      <button 
                        className="btn-clear btn-clear-all"
                        onClick={clearAllItems}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Checklist Grid */}
                  <div className="mylist-card">
                    <div className="mylist-items-list">
                      {shoppingList.map(item => (
                        <div className={`mylist-item ${item.checked ? 'checked' : ''}`} key={item.id}>
                          <div className="mylist-checkbox-wrapper">
                            <input 
                              type="checkbox" 
                              className="mylist-checkbox"
                              checked={item.checked}
                              onChange={() => toggleProductChecked(item.id)}
                            />
                          </div>

                          <div className="mylist-item-img-container">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="mylist-item-img"
                              onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                            />
                          </div>

                          <div className="mylist-item-details">
                            <span className="mylist-item-brand">{item.brand}</span>
                            <span className="mylist-item-name">{item.name}</span>
                            {!item.inStock && (
                              <span className="badge-stock-warning">
                                Temporarily Out of Stock
                              </span>
                            )}
                          </div>

                          <div className="mylist-qty-selector">
                            <button 
                              className="qty-btn" 
                              onClick={() => updateProductQuantity(item.id, -1)}
                            >
                              -
                            </button>
                            <span className="qty-value">{item.quantity}</span>
                            <button 
                              className="qty-btn" 
                              onClick={() => updateProductQuantity(item.id, 1)}
                            >
                              +
                            </button>
                          </div>

                          <button 
                            className="btn-remove-item"
                            onClick={() => removeProductFromList(item.id)}
                            title="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-list-state">
                  <div className="empty-list-icon-wrapper">
                    <ClipboardList size={40} />
                  </div>
                  <h2 className="empty-list-title">Your list is empty</h2>
                  <p className="empty-list-desc">
                    Browse our collection of 500+ premium Indian spices, rices, flours, and frozen delicacies to build your shopping checklist.
                  </p>
                  <button 
                    className="btn-primary" 
                    onClick={() => navigateTo('/products')}
                    style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
                  >
                    Start Browsing
                  </button>
                </div>
              )}

              {/* Offline note */}
              <div className="mylist-offline-note">
                <Info size={18} />
                <span>This list is saved locally. It will remain accessible inside the store even if you lose network connection.</span>
              </div>
            </div>
          )}

          {/* ==================== ADMIN LOGIN PAGE ==================== */}
          {isAdminPath && !isLoggedIn && (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6rem 2rem',
              background: 'hsl(var(--color-bg-main))'
            }}>
              <div style={{
                background: 'white',
                border: '1px solid hsl(var(--color-border))',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem 2rem',
                width: '100%',
                maxWidth: '400px',
                boxShadow: 'var(--shadow-premium)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.75rem'
              }}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <img 
                    src="/logo-icon.png" 
                    alt="Store Icon" 
                    style={{ height: '54px', objectFit: 'contain' }}
                  />
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'hsl(var(--color-text-dark))', marginTop: '0.5rem' }}>Admin Dashboard</h2>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--color-text-muted))' }}>Sign in to manage products & stock availability</p>
                </div>

                {loginError && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem 1rem',
                    color: '#ef4444',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}>
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input 
                      type="text" 
                      className="form-input-text" 
                      placeholder="Enter username" 
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input 
                      type="password" 
                      className="form-input-text" 
                      placeholder="Enter password" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="admin-btn admin-btn-primary" 
                    style={{ height: '46px', width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.95rem' }}
                  >
                    Log In
                  </button>
                </form>

                <button 
                  type="button" 
                  onClick={() => navigateTo('/')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'hsl(var(--color-text-muted))',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    textAlign: 'center',
                    marginTop: '-0.5rem'
                  }}
                >
                  Cancel and Return to Catalog
                </button>
              </div>
            </div>
          )}

          {/* ==================== BACKEND ADMIN VIEW ==================== */}
          {isAdminPath && isLoggedIn && (
            <div className="admin-dashboard">
              <div className="admin-header-bar">
                <div className="admin-title">
                  <span>Backoffice Panel</span>
                  Catalogue Manager
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="admin-btn admin-btn-primary" onClick={handleOpenAddForm}>
                    <Plus size={18} />
                    <span>Add New Product</span>
                  </button>
                  <button 
                    className="admin-btn admin-btn-secondary" 
                    onClick={handleLogout}
                    style={{ background: 'white', color: 'hsl(var(--color-text-dark))', border: '1px solid hsl(var(--color-border))' }}
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Overview Stats Cards */}
              <div className="admin-stats">
                <div className="admin-stat-card">
                  <div className="admin-stat-icon"><FileSpreadsheet size={22} /></div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-value">{stats.total}</span>
                    <span className="admin-stat-label">Total Products</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ color: '#ef4444', background: '#fee2e2' }}><X size={22} /></div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-value">{stats.outOfStock}</span>
                    <span className="admin-stat-label">Out of Stock</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ color: '#2563eb', background: '#eff6ff' }}><Layers size={22} /></div>
                  <div className="admin-stat-info">
                    <span className="admin-stat-value">{stats.activeCats}</span>
                    <span className="admin-stat-label">Active Categories</span>
                  </div>
                </div>
              </div>

              {/* Actions Bar: Search & Filters */}
              <div className="admin-actions-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '700px', flexWrap: 'wrap' }}>
                  {/* Search Input */}
                  <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--color-text-muted))' }} size={16} />
                    <input 
                      type="text" 
                      className="form-input-text" 
                      placeholder="Search admin list..." 
                      value={adminSearchTerm}
                      onChange={(e) => { setAdminSearchTerm(e.target.value); setAdminCurrentPage(1); setSelectedProductIds([]); }}
                      style={{ width: '100%', paddingLeft: '2.5rem' }}
                    />
                  </div>

                  {/* Category Filter Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'hsl(var(--color-text-muted))' }}>Category:</label>
                    <select 
                      value={adminSelectedCategory} 
                      onChange={(e) => { setAdminSelectedCategory(e.target.value); setAdminCurrentPage(1); setSelectedProductIds([]); }}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid hsl(var(--color-border))',
                        backgroundColor: 'white',
                        fontFamily: 'var(--font-family-body)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Page Limit Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'hsl(var(--color-text-muted))' }}>Show:</label>
                    <select 
                      value={adminItemsPerPage} 
                      onChange={(e) => { setAdminItemsPerPage(Number(e.target.value)); setAdminCurrentPage(1); }}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid hsl(var(--color-border))',
                        backgroundColor: 'white',
                        fontFamily: 'var(--font-family-body)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {[25, 50, 75, 100].map(limit => (
                        <option key={limit} value={limit}>{limit} per page</option>
                      ))}
                    </select>
                  </div>
                </div>

                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(var(--color-text-muted))' }}>
                  Showing {adminFilteredProducts.length} of {products.length} products
                </span>
              </div>

              {/* Bulk Operations Toolbar */}
              {selectedProductIds.length > 0 && (
                <div style={{
                  background: '#eff6ff',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.95rem' }}>
                    ⚡ {selectedProductIds.length} products selected
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      className="admin-btn admin-btn-primary" 
                      onClick={() => { setBulkCategories([]); setBulkCategorySearchTerm(''); setIsBulkCatOpen(true); }}
                      style={{ background: '#2563eb' }}
                    >
                      Change Categories
                    </button>
                    <button 
                      className="admin-btn admin-btn-primary" 
                      onClick={() => { setBulkInStock(true); setIsBulkStockOpen(true); }}
                      style={{ background: '#10b981' }}
                    >
                      Update Stock
                    </button>
                    <button 
                      className="admin-btn admin-btn-delete" 
                      onClick={handleBulkDelete}
                      style={{ background: '#dc2626', color: 'white' }}
                    >
                      Delete Selected
                    </button>
                    <button 
                      className="admin-btn admin-btn-secondary" 
                      onClick={() => setSelectedProductIds([])}
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
              )}

              {/* Products Admin Table */}
              {adminFilteredProducts.length > 0 ? (
                <>
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40px', paddingRight: 0 }}>
                            <input 
                              type="checkbox" 
                              className="form-checkbox"
                              checked={adminPaginatedProducts.length > 0 && adminPaginatedProducts.every(p => selectedProductIds.includes(p.id))}
                              onChange={toggleSelectAll}
                            />
                          </th>
                          <th>Product details</th>
                          <th>Brand</th>
                          <th>Categories</th>
                          <th>Availability</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminPaginatedProducts.map(product => (
                          <tr key={product.id} className={selectedProductIds.includes(product.id) ? 'selected-row' : ''} style={{ background: selectedProductIds.includes(product.id) ? '#f8fafc' : '' }}>
                            <td style={{ paddingRight: 0 }}>
                              <input 
                                type="checkbox" 
                                className="form-checkbox"
                                checked={selectedProductIds.includes(product.id)}
                                onChange={() => toggleSelectProduct(product.id)}
                              />
                            </td>
                            <td>
                              <div className="admin-product-row-info">
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="admin-product-thumb"
                                  onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                                />
                                <div className="admin-product-name" title={product.name}>
                                  {product.name}
                                </div>
                              </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>{product.brand}</td>
                            <td>{product.categories.join(', ')}</td>
                            <td>
                              <span style={{
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                color: product.inStock ? 'hsl(var(--color-success))' : '#dc2626',
                                background: product.inStock ? 'hsl(var(--color-success-bg))' : '#fef2f2'
                              }}>
                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button className="admin-btn admin-btn-edit" onClick={() => handleOpenEditForm(product)}>
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button className="admin-btn admin-btn-delete" onClick={() => handleDeleteProduct(product.id)}>
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Admin Pagination */}
                  {adminTotalPages > 1 && (
                    <div className="pagination" style={{ marginTop: '1.5rem' }}>
                      <button 
                        className="page-btn" 
                        onClick={() => setAdminCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={adminCurrentPage === 1}
                      >
                        &lt;
                      </button>
                      {Array.from({ length: adminTotalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === adminTotalPages || Math.abs(p - adminCurrentPage) <= 2)
                        .map((p, idx, arr) => {
                          const elements = [];
                          if (idx > 0 && arr[idx - 1] !== p - 1) {
                            elements.push(<span key={`dots-admin-${p}`} style={{ color: 'hsl(var(--color-text-muted))' }}>...</span>);
                          }
                          elements.push(
                            <button 
                              key={p} 
                              className={`page-btn ${adminCurrentPage === p ? 'active' : ''}`}
                              onClick={() => setAdminCurrentPage(p)}
                            >
                              {p}
                            </button>
                          );
                          return elements;
                        })}
                      <button 
                        className="page-btn" 
                        onClick={() => setAdminCurrentPage(prev => Math.min(prev + 1, adminTotalPages))}
                        disabled={adminCurrentPage === adminTotalPages}
                      >
                        &gt;
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <FileSpreadsheet size={48} style={{ color: 'hsl(var(--color-text-muted))' }} />
                  <h3 className="empty-title">No matching products</h3>
                  <p className="empty-desc">No products fit your search criteria in the admin catalog list.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ==================== CREATE / EDIT MODAL ==================== */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <span className="modal-title">
                {activeProductToEdit ? 'Edit Product Details' : 'Add New Product'}
              </span>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--color-text-muted))' }} 
                onClick={() => setIsFormOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className="modal-body">
                {/* 1. Product Name */}
                <div className="form-group">
                  <label className="form-label">Product Title *</label>
                  <input 
                    type="text" 
                    className="form-input-text" 
                    placeholder="Enter product title (e.g. Basmati Rice)" 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                {/* 2. Brand */}
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input 
                    type="text" 
                    className="form-input-text" 
                    placeholder="Brand name (default: Kiran Store)" 
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                  />
                </div>

                {/* 3. Categories Multi-Select List */}
                <div className="form-group">
                  <label className="form-label">Categories (Select one or more) *</label>
                  
                  {/* Category Search Input */}
                  <input 
                    type="text"
                    className="form-input-text"
                    placeholder="🔍 Filter categories list..."
                    value={categorySearchTerm}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', marginBottom: '0.5rem' }}
                  />

                  <div style={{
                    border: '1px solid hsl(var(--color-border))',
                    borderRadius: 'var(--radius-sm)',
                    maxHeight: '130px',
                    overflowY: 'auto',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    background: 'hsl(var(--color-bg-main) / 0.2)'
                  }}>
                    {categories
                      .filter(c => c !== 'All')
                      .filter(cat => cat.toLowerCase().includes(categorySearchTerm.toLowerCase()))
                      .map(cat => (
                        <label key={cat} className="form-checkbox-row" style={{ gap: '0.5rem', fontSize: '0.875rem' }}>
                          <input 
                            type="checkbox" 
                            className="form-checkbox"
                            checked={formCategories.includes(cat)}
                            onChange={() => {
                              if (formCategories.includes(cat)) {
                                setFormCategories(formCategories.filter(x => x !== cat));
                              } else {
                                setFormCategories([...formCategories, cat]);
                              }
                            }}
                          />
                          <span>{cat}</span>
                        </label>
                    ))}
                  </div>

                  {/* Create New Category Field */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input 
                      type="text" 
                      className="form-input-text" 
                      placeholder="Or create new category name..." 
                      id="new-category-input"
                      style={{ flex: 1, padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.target.value.trim();
                          if (val && !formCategories.includes(val)) {
                            setFormCategories([...formCategories, val]);
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-secondary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                      onClick={() => {
                        const input = document.getElementById('new-category-input');
                        const val = input.value.trim();
                        if (val && !formCategories.includes(val)) {
                          setFormCategories([...formCategories, val]);
                          input.value = '';
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* 4. Availability checkbox */}
                <label className="form-checkbox-row">
                  <input 
                    type="checkbox" 
                    className="form-checkbox" 
                    checked={formInStock}
                    onChange={(e) => setFormInStock(e.target.checked)}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Mark as In Stock</span>
                </label>

                {/* 5. Image Upload and preview */}
                <div className="form-group">
                  <label className="form-label">Product Image</label>
                  
                  <div className="form-image-preview-box">
                    {formImage ? (
                      <>
                        <img 
                          src={formImage} 
                          alt="Form Preview" 
                          className="form-image-preview"
                          onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                        />
                        <button 
                          type="button" 
                          className="admin-btn admin-btn-secondary"
                          onClick={() => setFormImage('')}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          Remove Image
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload size={24} style={{ color: 'hsl(var(--color-text-muted))' }} />
                        <span style={{ fontSize: '0.825rem', color: 'hsl(var(--color-text-muted))' }}>
                          Upload an image file (Recommended)
                        </span>
                        
                        <input 
                          type="file" 
                          accept="image/*" 
                          id="file-upload" 
                          style={{ display: 'none' }} 
                          onChange={handleFileUpload} 
                          disabled={isUploading}
                        />
                        <label 
                          htmlFor="file-upload" 
                          className="admin-btn admin-btn-primary" 
                          style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                          {isUploading ? 'Uploading...' : 'Choose File'}
                        </label>
                        
                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid hsl(var(--color-border))' }} />
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--color-text-muted))' }}>OR</span>
                          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid hsl(var(--color-border))' }} />
                        </div>
                        
                        <input 
                          type="text" 
                          className="form-input-text" 
                          placeholder="Or paste image URL here..." 
                          value={formImage}
                          onChange={(e) => setFormImage(e.target.value)}
                          style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem' }}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="admin-btn admin-btn-secondary" 
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="admin-btn admin-btn-primary"
                  disabled={isUploading}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== BULK CATEGORIES UPDATE MODAL ==================== */}
      {isBulkCatOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <span className="modal-title">Bulk Update Categories</span>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--color-text-muted))' }} 
                onClick={() => setIsBulkCatOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBulkCategoryUpdate}>
              <div className="modal-body">
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid hsl(var(--color-border))',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  fontSize: '0.9rem',
                  color: 'hsl(var(--color-text-muted))',
                  lineHeight: 1.5
                }}>
                  You are setting categories for <strong>{selectedProductIds.length} selected products</strong>. 
                  This will replace their current categories with the selection below.
                                <div className="form-group">
                  <label className="form-label">Select Categories *</label>
                  
                  {/* Bulk Category Search Input */}
                  <input 
                    type="text"
                    className="form-input-text"
                    placeholder="🔍 Filter categories list..."
                    value={bulkCategorySearchTerm}
                    onChange={(e) => setBulkCategorySearchTerm(e.target.value)}
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', marginBottom: '0.5rem' }}
                  />

                  <div style={{
                    border: '1px solid hsl(var(--color-border))',
                    borderRadius: 'var(--radius-sm)',
                    maxHeight: '135px',
                    overflowY: 'auto',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    background: 'white'
                  }}>
                    {categories
                      .filter(c => c !== 'All')
                      .filter(cat => cat.toLowerCase().includes(bulkCategorySearchTerm.toLowerCase()))
                      .map(cat => (
                        <label key={cat} className="form-checkbox-row" style={{ gap: '0.5rem', fontSize: '0.875rem' }}>
                          <input 
                            type="checkbox" 
                            className="form-checkbox"
                            checked={bulkCategories.includes(cat)}
                            onChange={() => {
                              if (bulkCategories.includes(cat)) {
                                setBulkCategories(bulkCategories.filter(x => x !== cat));
                              } else {
                                setBulkCategories([...bulkCategories, cat]);
                              }
                            }}
                          />
                          <span>{cat}</span>
                        </label>
                    ))}
                  </div>   </div>

                  {/* Bulk Create Category option */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input 
                      type="text" 
                      className="form-input-text" 
                      placeholder="Or create new category name..." 
                      id="bulk-new-category-input"
                      style={{ flex: 1, padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.target.value.trim();
                          if (val && !bulkCategories.includes(val)) {
                            setBulkCategories([...bulkCategories, val]);
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-secondary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                      onClick={() => {
                        const input = document.getElementById('bulk-new-category-input');
                        const val = input.value.trim();
                        if (val && !bulkCategories.includes(val)) {
                          setBulkCategories([...bulkCategories, val]);
                          input.value = '';
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="admin-btn admin-btn-secondary" 
                  onClick={() => setIsBulkCatOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="admin-btn admin-btn-primary"
                  style={{ background: '#2563eb' }}
                >
                  Apply Categories
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== BULK STOCK UPDATE MODAL ==================== */}
      {isBulkStockOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <span className="modal-title">Bulk Update Stock Status</span>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--color-text-muted))' }} 
                onClick={() => setIsBulkStockOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBulkStockUpdate}>
              <div className="modal-body">
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid hsl(var(--color-border))',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  fontSize: '0.9rem',
                  color: 'hsl(var(--color-text-muted))',
                  lineHeight: 1.5,
                  marginBottom: '0.5rem'
                }}>
                  Update stock status for <strong>{selectedProductIds.length} selected products</strong>.
                </div>

                <div className="form-group">
                  <label className="form-label">Availability Status</label>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                    <label className="form-checkbox-row" style={{ cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="bulk-stock" 
                        className="form-checkbox" 
                        checked={bulkInStock === true}
                        onChange={() => setBulkInStock(true)}
                        style={{ width: '20px', height: '20px' }}
                      />
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'hsl(var(--color-success))' }}>In Stock (Available)</span>
                    </label>

                    <label className="form-checkbox-row" style={{ cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="bulk-stock" 
                        className="form-checkbox" 
                        checked={bulkInStock === false}
                        onChange={() => setBulkInStock(false)}
                        style={{ width: '20px', height: '20px' }}
                      />
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#dc2626' }}>Out of Stock</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="admin-btn admin-btn-secondary" 
                  onClick={() => setIsBulkStockOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="admin-btn admin-btn-primary"
                  style={{ background: '#10b981' }}
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Premium Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="logo-container" style={{ cursor: 'default', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img 
                  src="/logo-icon.png" 
                  alt="Logo Icon" 
                  style={{ height: '40px', objectFit: 'contain' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <img 
                  src="/logo-text.png" 
                  alt="Logo Text" 
                  style={{ height: '38px', objectFit: 'contain' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <p className="footer-brand-desc">
                Calgary's premier shopping destination for high-quality Indian foods, authentic flours, premium grains, spices, pickles, and dry goods.
              </p>
            </div>

            <div className="footer-links-group">
              <div className="footer-links-col">
                <span className="footer-links-title">Store Hours</span>
                <span className="footer-link" style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', fontSize: '0.8rem' }}>
                  <span>Thu, Sun - Tue: 10:30 AM - 9:00 PM</span>
                  <span>Fri & Sat: 10:30 AM - 10:00 PM</span>
                  <span>Wednesday: 11:00 AM - 9:00 PM</span>
                </span>
                <span className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <Calendar size={14} /> Open 7 Days a week
                </span>
              </div>
              
              <div className="footer-links-col">
                <span className="footer-links-title">Store Contact & Location</span>
                <span className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={14} /> Unit 1125, 6520 36 St NE, Calgary
                </span>
                <span className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={14} /> +1 (403) 497-2777
                </span>
                <span className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={14} /> support@kiranstore.ca
                </span>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Kiran Store. All rights reserved.</span>
            <span>Made with ❤️ for Calgary's Indian Community</span>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div className="toast-notification">
          <div className="toast-content">
            <span className="toast-message">{toast.message}</span>
            {toast.actionText && toast.onAction && (
              <button 
                className="toast-action-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  toast.onAction();
                }}
              >
                {toast.actionText}
              </button>
            )}
            <button className="toast-close-btn" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
