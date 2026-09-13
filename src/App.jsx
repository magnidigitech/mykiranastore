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
  Menu,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Truck,
  ArrowRight,
  ZoomIn
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

  // Live Google Reviews state
  const [googleReviewsData, setGoogleReviewsData] = useState({
    placeName: "My Kirana Store",
    rating: 4.7,
    totalReviews: 106,
    googleMapsUrl: "https://maps.app.goo.gl/CcYCfES5xPNcnS6w7",
    lastSynced: null,
    reviews: []
  });
  const [syncingReviews, setSyncingReviews] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Live Instagram Feed state
  const [instagramFeedData, setInstagramFeedData] = useState({
    username: "mykiranastore_ca",
    name: "mykiranastore",
    bio: "Indian grocery store in Calgary • Weekly in-store deals & fresh arrivals",
    profileUrl: "https://www.instagram.com/mykiranastore_ca/",
    followers: "859+ followers",
    posts: []
  });
  const [syncingInstagram, setSyncingInstagram] = useState(false);
  const [instagramSyncMsg, setInstagramSyncMsg] = useState(null);
  const [activeFlyerIndex, setActiveFlyerIndex] = useState(null);

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

  // Always reset scroll position to top whenever route changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    let title = "Indian Grocery Store in Calgary NE | My Kirana Store";
    let metaDesc = "Visit My Kirana Store at 6520 36 St NE, Unit 1125, Calgary. Explore our grocery selection, check current offers, and find store hours and directions.";

    if (currentPath === '/location') {
      title = "Location & Store Hours | My Kirana Store Calgary NE";
      metaDesc = "Find directions, store hours, holiday hours, storefront details, and contact information for My Kirana Store at 6520 36 St NE Unit 1125, Calgary.";
    } else if (currentPath === '/offers') {
      title = "Weekly Grocery Offers & Deals | My Kirana Store Calgary";
      metaDesc = "Browse current weekly grocery deals, flyer promotions, and special in-store offers at My Kirana Store in Calgary, Alberta.";
    } else if (currentPath === '/products') {
      title = "Indian Grocery Products & Catalogue | My Kirana Store Calgary";
      metaDesc = "Browse basmati rice, authentic atta flour, Indian spices, snacks, frozen foods, and puja items at My Kirana Store in Calgary NE.";
    } else if (currentPath === '/contact') {
      title = "Contact Us & Directions | My Kirana Store Calgary NE";
      metaDesc = "Get in touch with My Kirana Store at 6520 36 St NE Unit 1125, Calgary. Call +1 (403) 497-2777 or send us a message.";
    } else if (currentPath === '/mylist') {
      title = "My Shopping List | My Kirana Store Calgary";
      metaDesc = "View your saved Indian grocery shopping list for My Kirana Store in Calgary NE.";
    }

    document.title = title;
    const metaTag = document.querySelector('meta[name="description"]');
    if (metaTag) {
      metaTag.setAttribute('content', metaDesc);
    }
  }, [currentPath]);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // Helper to filter and navigate to products while guaranteeing scroll-to-top
  const applyProductFilter = (term = '', category = 'All', brand = 'All') => {
    setSearchTerm(term);
    setSelectedCategory(category);
    setSelectedBrand(brand);
    setCurrentPage(1);
    setSelectedProductIds([]);
    navigateTo('/products');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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
    try {
      if (isInitial) setLoading(true);
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
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      if (response.ok) {
        const data = await response.json();
        setGoogleReviewsData(data);
      }
    } catch (err) {
      console.error('Error fetching Google reviews:', err);
    }
  };

  const handleSyncGoogleReviews = async () => {
    setSyncingReviews(true);
    setSyncMessage('Syncing live reviews with Google Maps...');
    try {
      const response = await fetch('/api/reviews/sync', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setGoogleReviewsData(result.data);
          setSyncMessage('Successfully synced with Google profile!');
          setTimeout(() => setSyncMessage(null), 4000);
        }
      } else {
        setSyncMessage('Sync temporarily unavailable. Using cached Google reviews.');
        setTimeout(() => setSyncMessage(null), 4000);
      }
    } catch (err) {
      console.error('Error syncing reviews:', err);
      setSyncMessage('Error syncing with Google. Using cached reviews.');
      setTimeout(() => setSyncMessage(null), 4000);
    } finally {
      setSyncingReviews(false);
    }
  };

  const fetchInstagramFeed = async () => {
    try {
      const response = await fetch('/api/instagram');
      if (response.ok) {
        const data = await response.json();
        setInstagramFeedData(data);
      }
    } catch (err) {
      console.error('Error fetching Instagram feed:', err);
    }
  };

  const handleSyncInstagram = async () => {
    setSyncingInstagram(true);
    setInstagramSyncMsg('Syncing latest posts with Instagram...');
    try {
      const response = await fetch('/api/instagram/sync', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setInstagramFeedData(result.data);
          setInstagramSyncMsg('Successfully synced with @mykiranastore_ca!');
          setTimeout(() => setInstagramSyncMsg(null), 4000);
        }
      } else {
        setInstagramSyncMsg('Instagram sync busy. Using cached feed.');
        setTimeout(() => setSyncMessage(null), 4000);
      }
    } catch (err) {
      console.error('Error syncing Instagram:', err);
      setInstagramSyncMsg('Using cached Instagram feed.');
      setTimeout(() => setInstagramSyncMsg(null), 4000);
    } finally {
      setSyncingInstagram(false);
    }
  };

  useEffect(() => {
    fetchProducts(true);
    fetchReviews();
    fetchInstagramFeed();
  }, []);

  // Keyboard navigation & scroll locking for Instagram Flyer Lightbox Modal
  useEffect(() => {
    if (activeFlyerIndex === null) return;
    const handleKeyDown = (e) => {
      const count = instagramFeedData.posts?.length || 0;
      if (count === 0) return;
      if (e.key === 'Escape') {
        setActiveFlyerIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setActiveFlyerIndex(prev => (prev > 0 ? prev - 1 : count - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveFlyerIndex(prev => (prev < count - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activeFlyerIndex, instagramFeedData.posts]);

  // Helper for flexible category matching (handles exact tags, aliases, composite tags & multi-word filters)
  const isCategoryMatch = (productCategories, targetCategory) => {
    if (!targetCategory || targetCategory === 'All') return true;
    if (!Array.isArray(productCategories) || productCategories.length === 0) return false;

    const target = targetCategory.toLowerCase().trim();

    return productCategories.some(c => {
      const cat = c.toLowerCase().trim();
      if (cat === target) return true;
      if (target.includes(cat) || cat.includes(target)) return true;

      // Smart category aliases for department cards & popular search chips
      if ((target.includes('rice') || target.includes('staple')) && (cat.includes('rice') || cat.includes('atta') || cat.includes('dal') || cat.includes('flour') || cat.includes('lentil'))) return true;
      if ((target.includes('spice') || target.includes('masala')) && (cat.includes('spice') || cat.includes('masala') || cat.includes('chili') || cat.includes('powder'))) return true;
      if ((target.includes('snack') || target.includes('sweet') || target.includes('namkeen')) && (cat.includes('snack') || cat.includes('sweet') || cat.includes('namkeen') || cat.includes('tea') || cat.includes('biscuit') || cat.includes('farsan'))) return true;
      if ((target.includes('frozen') || target.includes('import') || target.includes('pooja')) && (cat.includes('frozen') || cat.includes('pooja') || cat.includes('pickle') || cat.includes('paneer') || cat.includes('specialty'))) return true;

      return false;
    });
  };

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
      : products.filter(p => isCategoryMatch(p.categories, selectedCategory));
    const allBrands = new Set(productsInSelectedCategory.map(p => p.brand).filter(Boolean));
    return ['All', ...Array.from(allBrands).sort()];
  }, [products, selectedCategory]);

  // 3. Shop View: Filtered & Paginated Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !searchTerm.trim() || (
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.categories && p.categories.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())))
      );
      const matchesCategory = isCategoryMatch(p.categories, selectedCategory);
      const matchesBrand = selectedBrand === 'All' || (p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase());

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

  // Reset pagination when filters change and scroll to top
  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setSelectedBrand('All');
    setCurrentPage(1);
    setSelectedProductIds([]);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setCurrentPage(1);
    setSelectedProductIds([]);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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

  // Scroll to top when page changes in products catalogue
  useEffect(() => {
    if (currentPage > 1) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

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

      {/* Mobile Search Bar Container (only shown on non-landing pages on mobile) */}
      {!isAdminPath && currentPath !== '/' && (
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
                className={`mobile-menu-nav-link ${currentPath === '/offers' ? 'active' : ''}`}
                onClick={() => navigateTo('/offers')}
              >
                <Sparkles size={20} />
                <span>Weekly Offers</span>
              </button>
              <button
                className={`mobile-menu-nav-link ${currentPath === '/location' ? 'active' : ''}`}
                onClick={() => navigateTo('/location')}
              >
                <MapPin size={20} />
                <span>Location & Hours</span>
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
                6520 36 St NE Unit 1125, Calgary, AB T3J 2L3
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
            className={`sub-nav-link ${currentPath === '/offers' ? 'active' : ''}`}
            onClick={() => navigateTo('/offers')}
          >
            <Sparkles size={16} />
            <span>Weekly Offers</span>
          </button>
          <button
            className={`sub-nav-link ${currentPath === '/location' ? 'active' : ''}`}
            onClick={() => navigateTo('/location')}
          >
            <MapPin size={16} />
            <span>Location</span>
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

      {/* FULL SCREEN LOADER OVERLAY */}
      {loading && (
        <div className="full-screen-loader">
          <div className="loader-card">
            <div className="loader-logo-wrap">
              <img
                src="/logo-icon.png"
                alt="My Kirana Store Logo"
                className="loader-logo-icon"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <img
                src="/logo-text.png"
                alt="My Kirana Store Text"
                className="loader-logo-text"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div className="loader-spinner-bar">
              <div className="loader-progress-fill"></div>
            </div>
            <span className="loader-caption">
              Loading Calgary's Indian Store Catalogue...
            </span>
          </div>
        </div>
      )}

      <>
        {/* ==================== ADMIN HOME LANDING PAGE ==================== */}
        {currentPath === '/' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Hero Banner Section */}
            <section className="landing-hero-pro">
              <div className="landing-hero-pro-container">
                {/* Left Column: Hero Content & Search */}
                <div className="hero-pro-content">
                  {/* Location & Google rating badge */}
                  <div className="hero-trust-pill">
                    <span className="hero-trust-city">
                      <MapPin size={14} className="hero-pin-icon" /> Calgary, Alberta
                    </span>
                    <span className="hero-trust-divider">•</span>
                    <a
                      href={googleReviewsData.googleMapsUrl || 'https://maps.app.goo.gl/CcYCfES5xPNcnS6w7'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hero-trust-rating"
                      title="View Google Maps Profile"
                    >
                      <div className="hero-stars-mini">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
                        ))}
                      </div>
                      <strong>{googleReviewsData.rating || 4.7}</strong>
                      <span>({googleReviewsData.totalReviews || 106}+ Google Reviews)</span>
                    </a>
                  </div>

                  {/* Main Headline */}
                  <h1 className="hero-pro-title">
                    Authentic Indian Groceries,
                    <span className="hero-pro-highlight"> Spices & Fresh Produce</span>
                    <span className="hero-pro-city"> Right in Calgary</span>
                  </h1>

                  {/* Description */}
                  <p className="hero-pro-desc">
                    Your trusted neighbourhood Indian supermarket in Calgary for premium basmati rice, hand-ground spices, traditional atta flours, organic lentils, homestyle pickles, snacks, and fresh produce.
                  </p>

                  {/* Live Hero Search Bar */}
                  <div className="hero-search-wrapper">
                    <form
                      className="hero-search-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        applyProductFilter(searchTerm, 'All', 'All');
                      }}
                    >
                      <Search size={19} className="hero-search-icon" />
                      <input
                        type="text"
                        placeholder="Search basmati rice, atta, MDH spices, pickles, snacks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="hero-search-input"
                      />
                      <button type="submit" className="hero-search-btn">
                        <span>Search</span>
                        <ArrowRight size={15} />
                      </button>
                    </form>

                    {/* Trending Chips */}
                    <div className="hero-quick-chips">
                      <span className="chips-label">Popular:</span>
                      {['Basmati Rice', 'Atta Flour', 'MDH Spices', 'Pickles', 'Sweets'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className="chip-tag-btn"
                          onClick={() => applyProductFilter(tag, 'All', 'All')}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary CTAs */}
                  <div className="hero-action-row">
                    <button
                      className="btn-hero-primary"
                      onClick={() => applyProductFilter('', 'All', 'All')}
                    >
                      <ShoppingBag size={18} />
                      <span>Browse 500+ Products</span>
                    </button>

                    <button
                      className="btn-hero-secondary"
                      onClick={() => navigateTo('/contact')}
                    >
                      <Clock size={18} />
                      <span>Hours & Directions</span>
                    </button>
                  </div>

                  {/* Trust Highlights Strip */}
                  <div className="hero-feature-pills">
                    <div className="hero-feat-item">
                      <ShieldCheck size={18} className="feat-icon" />
                      <div>
                        <strong>100% Authentic</strong>
                        <span>Direct Indian Brands</span>
                      </div>
                    </div>
                    <div className="hero-feat-item">
                      <Sparkles size={18} className="feat-icon" />
                      <div>
                        <strong>Fresh Arrivals</strong>
                        <span>Weekly Vegetables</span>
                      </div>
                    </div>
                    <div className="hero-feat-item">
                      <Truck size={18} className="feat-icon" />
                      <div>
                        <strong>Free Delivery</strong>
                        <span>In Calgary Area</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Visual Showcase Collage with Floating Badges */}
                <div className="hero-pro-visual">
                  <div className="hero-visual-card-main">
                    <div className="hero-showcase-grid">
                      <div
                        className="hero-showcase-item item-daawat"
                        onClick={() => applyProductFilter('Basmati Rice', 'All', 'All')}
                      >
                        <img src="/images/DAAWAT%20TRADITIONAL%20BASMATI%20RICE%2010LBS.jpg" alt="Daawat Traditional Basmati Rice" />
                        <span className="item-label">Aged Basmati Rice</span>
                      </div>

                      <div
                        className="hero-showcase-item item-aashirvaad"
                        onClick={() => applyProductFilter('Atta', 'All', 'All')}
                      >
                        <img src="/images/AASHIRVAAD%20WHOLE%20WHEAT%20FLOUR%2020LBS.jpg" alt="Aashirvaad Whole Wheat Atta" />
                        <span className="item-label">Chakki Atta</span>
                      </div>

                      <div
                        className="hero-showcase-item item-mdh"
                        onClick={() => applyProductFilter('Masala', 'All', 'All')}
                      >
                        <img src="/images/MDH%20Garam%20Masala%20100g.jpg" alt="MDH Garam Masala" />
                        <span className="item-label">Authentic Masalas</span>
                      </div>

                      <div
                        className="hero-showcase-item item-haldiram"
                        onClick={() => applyProductFilter('Soan Papdi', 'All', 'All')}
                      >
                        <img src="/images/Haldirams%20Soan%20Papdi%20-%20Blended%20with%20Natural%20Cardamom,%20250g%20Pack.jpg" alt="Haldiram's Soan Papdi" />
                        <span className="item-label">Indian Sweets</span>
                      </div>
                    </div>

                    {/* Floating Badge: Google Rating */}
                    <div className="floating-badge badge-google">
                      <div className="badge-google-header">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                        </svg>
                        <div className="badge-stars">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />
                          ))}
                        </div>
                      </div>
                      <div className="badge-rating-text">
                        <strong>{googleReviewsData.rating || 4.7} / 5.0 Rating</strong>
                        <span>Verified by {googleReviewsData.totalReviews || 106}+ Calgary shoppers</span>
                      </div>
                    </div>

                    {/* Floating Badge: In-Store Inventory */}
                    <div className="floating-badge badge-store-status">
                      <div className="live-dot-green"></div>
                      <div>
                        <strong>Open 7 Days a Week</strong>
                        <span>6520 36 St NE, Calgary</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Core Features / Departments Section */}
            <section className="landing-features">
              <div className="section-header">
                <div className="departments-pill-badge">
                  <Sparkles size={16} />
                  <span>Curated Indian Grocery Selection</span>
                </div>
                <h2 className="section-title">Our Store Departments</h2>
                <p className="section-desc">We stock over 500+ premium authentic imports to bring you the rich tastes of home</p>
              </div>

              <div className="features-grid">
                <div className="feature-card" onClick={() => applyProductFilter('', 'Atta, Rice & Dals')} style={{ cursor: 'pointer' }}>
                  <div className="feature-card-header">
                    <div className="feature-icon-wrapper icon-staples">
                      <ShoppingBag size={26} />
                    </div>
                    <span className="feature-tag-badge">50+ Rice & Dals</span>
                  </div>
                  <h3 className="feature-title">Premium Staples & Atta</h3>
                  <p className="feature-desc">High-quality Royal & Sher Basmati rice, organic dals, premium lentils, and traditional chakki fresh wheat flours for daily home cooking.</p>
                  <div className="feature-card-footer">
                    <span className="feature-link-text">Browse Staples & Flours ➔</span>
                  </div>
                </div>

                <div className="feature-card" onClick={() => applyProductFilter('', 'Spices & Masalas')} style={{ cursor: 'pointer' }}>
                  <div className="feature-card-header">
                    <div className="feature-icon-wrapper icon-spices">
                      <Sparkles size={26} />
                    </div>
                    <span className="feature-tag-badge tag-spices">Pure & Aromatic</span>
                  </div>
                  <h3 className="feature-title">Authentic Spices & Masalas</h3>
                  <p className="feature-desc">Pure whole and ground spices, authentic MDH & Everest masalas, Kashmiri chili, turmeric, and aromatic blends to elevate your dishes.</p>
                  <div className="feature-card-footer">
                    <span className="feature-link-text">Browse Spices & Blends ➔</span>
                  </div>
                </div>

                <div className="feature-card" onClick={() => applyProductFilter('', 'Snacks & Sweets')} style={{ cursor: 'pointer' }}>
                  <div className="feature-card-header">
                    <div className="feature-icon-wrapper icon-snacks">
                      <Layers size={26} />
                    </div>
                    <span className="feature-tag-badge tag-snacks">Fresh & Crispy</span>
                  </div>
                  <h3 className="feature-title">Snacks & Namkeen</h3>
                  <p className="feature-desc">Haldiram's bhujia, crispy South Indian murukku, Gujarati farsan, sweets, biscuits, and authentic masala chai teas.</p>
                  <div className="feature-card-footer">
                    <span className="feature-link-text">Browse Snacks & Sweets ➔</span>
                  </div>
                </div>

                <div className="feature-card" onClick={() => applyProductFilter('', 'Frozen & Specialty')} style={{ cursor: 'pointer' }}>
                  <div className="feature-card-header">
                    <div className="feature-icon-wrapper icon-imports">
                      <Truck size={26} />
                    </div>
                    <span className="feature-tag-badge tag-imports">Frozen & Pooja</span>
                  </div>
                  <h3 className="feature-title">Frozen & Traditional Imports</h3>
                  <p className="feature-desc">Homestyle spicy pickles, fresh paneer, frozen parathas, samosas, sweets, gulab jamun, and traditional pooja essentials.</p>
                  <div className="feature-card-footer">
                    <span className="feature-link-text">Browse Frozen & Specialty ➔</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Instagram Feed Section (Placed Above Reviews) */}
            <section className="instagram-section">
              <div className="section-header">
                <div className="instagram-pill-badge">
                  <svg className="instagram-gradient-icon" viewBox="0 0 24 24" width="18" height="18">
                    <defs>
                      <radialGradient id="ig-pill-grad" r="150%" cx="30%" cy="107%">
                        <stop stopColor="#fdf497" offset="0%" />
                        <stop stopColor="#fdf497" offset="5%" />
                        <stop stopColor="#fd5949" offset="45%" />
                        <stop stopColor="#d6249f" offset="60%" />
                        <stop stopColor="#285AEB" offset="90%" />
                      </radialGradient>
                    </defs>
                    <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#ig-pill-grad)" />
                    <circle cx="12" cy="12" r="4.2" stroke="#fff" strokeWidth="1.8" fill="none" />
                    <circle cx="17.2" cy="6.8" r="1.1" fill="#fff" />
                  </svg>
                  <span>@mykiranastore_ca</span>
                  <span className="ig-followers-tag">{instagramFeedData.followers || '859+ followers'}</span>
                </div>

                <h2 className="section-title">Weekly In-Store Deals & Updates</h2>
                <p className="section-desc">
                  Follow our official Instagram for weekly grocery flyers, festive specials, and fresh arrivals
                </p>

                <div className="instagram-action-bar">
                  <a
                    href={instagramFeedData.profileUrl || 'https://www.instagram.com/mykiranastore_ca/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-follow-instagram"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <span>Follow @mykiranastore_ca</span>
                    <ExternalLink size={14} />
                  </a>

                  <button
                    onClick={handleSyncInstagram}
                    disabled={syncingInstagram}
                    className="btn-sync-instagram"
                    title="Sync latest posts from Instagram"
                  >
                    <RefreshCw size={14} className={syncingInstagram ? "spin-sync-icon" : ""} />
                    <span>{syncingInstagram ? "Syncing..." : "Sync Instagram"}</span>
                  </button>
                </div>

                {instagramSyncMsg && (
                  <div className="instagram-sync-alert">
                    {instagramSyncMsg}
                  </div>
                )}
              </div>

              <div className="instagram-grid">
                {(instagramFeedData.posts && instagramFeedData.posts.length > 0
                  ? instagramFeedData.posts
                  : []
                ).map((post, idx) => (
                  <div
                    key={post.id || idx}
                    className="instagram-post-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveFlyerIndex(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveFlyerIndex(idx);
                      }
                    }}
                    aria-label={`View flyer: ${post.caption || 'Weekly deal'}`}
                  >
                    <div className="instagram-img-wrapper">
                      <img
                        src={post.imageUrl}
                        alt={post.caption || "Instagram update from My Kirana Store"}
                        loading="lazy"
                        onError={(e) => {
                          if (post.originalImageUrl && e.currentTarget.src !== post.originalImageUrl) {
                            e.currentTarget.src = post.originalImageUrl;
                          }
                        }}
                      />
                      <div className="instagram-card-overlay">
                        <div className="instagram-overlay-icon">
                          <ZoomIn size={24} color="white" />
                        </div>
                        <span className="instagram-overlay-text">Click to View Image</span>
                      </div>
                    </div>
                    <div className="instagram-card-caption">
                      <p className="instagram-caption-text">
                        {post.caption ? (post.caption.length > 85 ? post.caption.slice(0, 85) + '...' : post.caption) : 'Weekly In-Store Deal'}
                      </p>
                      <div className="instagram-card-footer">
                        <span className="instagram-view-cta">View Full Image ↗</span>
                        <span className="instagram-post-badge">In-Store Deal</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Customer Google Reviews Section */}
            <section className="testimonials-section google-reviews-section">
              <div className="section-header">
                <div className="google-pill-badge">
                  <svg className="google-g-icon" viewBox="0 0 24 24" width="18" height="18">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                  <span>Google Business Reviews</span>
                  <span className="live-pulse-indicator">
                    <span className="live-pulse-dot"></span> Live Synced
                  </span>
                </div>

                <h2 className="section-title">Loved by the Calgary Community</h2>
                <p className="section-desc">
                  Verified customer feedback live from our Google Maps profile
                </p>

                <div className="google-rating-banner">
                  <div className="google-score-block">
                    <span className="google-score-number">{googleReviewsData.rating || 4.7}</span>
                    <div className="google-score-stars-wrap">
                      <div className="google-stars-row">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />
                        ))}
                      </div>
                      <span className="google-score-subtext">
                        Based on <strong>{googleReviewsData.totalReviews || 106}+</strong> Google reviews
                      </span>
                    </div>
                  </div>

                  <div className="google-banner-actions">
                    <a
                      href={googleReviewsData.googleMapsUrl || 'https://maps.app.goo.gl/CcYCfES5xPNcnS6w7'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-review-google"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                      </svg>
                      <span>Review Us on Google</span>
                      <ExternalLink size={14} />
                    </a>

                    <button
                      onClick={handleSyncGoogleReviews}
                      disabled={syncingReviews}
                      className="btn-sync-reviews"
                      title="Sync with Google Maps profile"
                    >
                      <RefreshCw size={14} className={syncingReviews ? "spin-sync-icon" : ""} />
                      <span>{syncingReviews ? "Syncing..." : "Sync Live Reviews"}</span>
                    </button>
                  </div>
                </div>

                {syncMessage && (
                  <div className="google-sync-alert">
                    {syncMessage}
                  </div>
                )}
              </div>

              <div className="testimonials-grid google-reviews-grid">
                {(showAllReviews
                  ? (googleReviewsData.reviews || [])
                  : (googleReviewsData.reviews || []).slice(0, 6)
                ).map((rev, idx) => (
                  <div key={rev.id || idx} className="testimonial-card google-review-card">
                    <div className="google-review-header">
                      <div className="google-review-profile">
                        {rev.authorPhotoUrl ? (
                          <img
                            src={rev.authorPhotoUrl}
                            alt={rev.authorName}
                            className="google-reviewer-img"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="google-reviewer-initial">
                            {(rev.authorName || 'C').charAt(0)}
                          </div>
                        )}
                        <div className="google-reviewer-meta">
                          <div className="testimonial-author">
                            {rev.authorName}
                            {rev.isLocalGuide && (
                              <span className="local-guide-badge">Local Guide</span>
                            )}
                          </div>
                          <span className="review-timestamp">{rev.relativeTime}</span>
                        </div>
                      </div>

                      <svg className="google-card-badge-icon" viewBox="0 0 24 24" width="20" height="20" title="Google Verified">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                      </svg>
                    </div>

                    <div className="testimonial-stars">
                      {[...Array(Math.round(rev.rating || 5))].map((_, starIdx) => (
                        <Star key={starIdx} size={16} fill="currentColor" />
                      ))}
                    </div>

                    <p className="testimonial-text">"{rev.text}"</p>
                  </div>
                ))}
              </div>

              <div className="google-reviews-footer-actions">
                {googleReviewsData.reviews && googleReviewsData.reviews.length > 6 && (
                  <button
                    className="btn-toggle-reviews"
                    onClick={() => setShowAllReviews(!showAllReviews)}
                  >
                    {showAllReviews
                      ? "Show Less"
                      : `Show All Synced Reviews (${googleReviewsData.reviews.length})`}
                  </button>
                )}
                <a
                  href={googleReviewsData.googleMapsUrl || 'https://maps.app.goo.gl/CcYCfES5xPNcnS6w7'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-view-all-google"
                >
                  <span>Read all {googleReviewsData.totalReviews || 106}+ reviews on Google Maps</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </section>

            {/* Premium Interactive Promo Banner */}
            <section className="promo-banner">
              <div className="promo-banner-backdrop-glow"></div>
              <div className="promo-banner-inner">
                <div className="promo-badge">
                  <MapPin size={16} />
                  <span>Northeast Calgary • 6520 36 St NE Unit 1125</span>
                </div>
                
                <h2 className="promo-title">Visit Us In-Store Today</h2>
                
                <p className="promo-desc">
                  Experience a clean, organized, and friendly shopping environment. Check out our physical storefront in Calgary NE for fresh arrivals, weekly in-store specials, and daily savings on all your Indian grocery essentials!
                </p>

                <div className="promo-features-row">
                  <div className="promo-feature-item">
                    <Clock size={18} />
                    <span>Open 7 Days a Week</span>
                  </div>
                  <div className="promo-feature-divider"></div>
                  <div className="promo-feature-item">
                    <Sparkles size={18} />
                    <span>Fresh Stock Received Weekly</span>
                  </div>
                  <div className="promo-feature-divider"></div>
                  <div className="promo-feature-item">
                    <Phone size={18} />
                    <span>(403) 497-2777</span>
                  </div>
                </div>

                <div className="promo-actions">
                  <button 
                    className="promo-primary-btn" 
                    onClick={() => navigateTo('/location')}
                  >
                    <MapPin size={18} />
                    <span>Get Store Directions & Hours</span>
                    <ArrowRight size={18} />
                  </button>

                  <button 
                    className="promo-secondary-btn" 
                    onClick={() => navigateTo('/offers')}
                  >
                    <Sparkles size={18} />
                    <span>View Weekly Offers</span>
                  </button>
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
                    <span className="contact-item-value">support@mykiranstore.ca</span>
                  </div>
                </div>

                <div className="contact-item-row">
                  <Clock className="contact-item-icon" size={20} style={{ minWidth: '20px' }} />
                  <div className="contact-item-details">
                    <span className="contact-item-label">Store Hours</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem', color: 'hsl(var(--color-text-dark))', marginTop: '0.35rem' }}>
                      <span style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem' }}>
                        <strong>Mon - Thu, Sun:</strong> <span>10:30 AM - 9:00 PM</span>
                      </span>
                      <span style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem' }}>
                        <strong>Fri & Sat:</strong> <span>10:30 AM - 10:00 PM</span>
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
                                  loading="lazy"
                                  decoding="async"
                                  onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                                />
                                <span className="badge-brand">{product.brand}</span>
                                <span className={`badge-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </div>

                              <div className="card-content">
                                <span className="product-category">{product.categories.join(', ')}</span>
                                <h3 className="product-name" title={product.name}>{product.name}</h3>
                                <div className="card-footer" style={{
                                  borderTop: '1px solid hsl(var(--color-border) / 0.5)',
                                  paddingTop: '0.75rem',
                                  marginTop: '0.5rem',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  width: '100%'
                                }}>
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
                                    style={{ width: '100%', justifyContent: 'center' }}
                                  >
                                    {isAdded ? <Check size={16} /> : <Plus size={16} />}
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
                  <div className="lightbox-swipe-pill">
                    <span className="swipe-arrow-left">‹</span>
                    <span className="swipe-hand-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                        <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" />
                        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                        <path d="M18 8a2 2 0 0 1 2 2v4a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6v-1.5" />
                      </svg>
                    </span>
                    <span>Swipe left or right to view items</span>
                    <span className="swipe-arrow-right">›</span>
                  </div>

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

        {/* ==================== LOCATION & HOURS PAGE ==================== */}
        {currentPath === '/location' && (
          <div className="location-page-layout" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%' }}>
            <div className="location-header" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'hsl(var(--color-success-bg))',
                color: 'hsl(var(--color-success))',
                fontWeight: '700',
                fontSize: '0.85rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                marginBottom: '0.75rem'
              }}>
                <MapPin size={16} /> Northeast Calgary Storefront
              </span>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'hsl(var(--color-text-dark))', fontFamily: 'var(--font-family-title)' }}>
                Visit My Kirana Store in Northeast Calgary
              </h1>
              <p style={{ fontSize: '1.05rem', color: 'hsl(var(--color-text-muted))', maxWidth: '680px', margin: '0.75rem auto 0 auto', lineHeight: '1.6' }}>
                Your local destination at 6520 36 St NE, Unit 1125 for authentic Indian groceries, fresh produce, basmati rice, flours, hand-ground spices, and daily staples.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem', marginBottom: '3rem' }}>
              {/* Store Address Card */}
              <div style={{ background: 'white', border: '1px solid hsl(var(--color-border))', borderRadius: '16px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <MapPin size={24} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'hsl(var(--color-text-dark))', marginBottom: '0.75rem' }}>Store Address</h2>
                <p style={{ fontSize: '0.95rem', color: 'hsl(var(--color-text-muted))', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  <strong>My Kirana Store</strong><br />
                  6520 36 St NE Unit 1125<br />
                  Calgary, AB T3J 2L3<br />
                  Canada
                </p>
                <a
                  href="https://maps.app.goo.gl/CcYCfES5xPNcnS6w7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.65rem 1.25rem', fontSize: '0.9rem', borderRadius: '10px', fontWeight: 700 }}
                >
                  Get Driving Directions <ExternalLink size={16} />
                </a>
              </div>

              {/* Store Hours Card */}
              <div style={{ background: 'white', border: '1px solid hsl(var(--color-border))', borderRadius: '16px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Clock size={24} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'hsl(var(--color-text-dark))', marginBottom: '0.75rem' }}>Store Hours & Holidays</h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.92rem', color: 'hsl(var(--color-text-dark))' }}>
                  <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.35rem' }}>
                    <span>Mon - Thu, Sun:</span> <strong>10:30 AM - 9:00 PM</strong>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Fri & Sat:</span> <strong>10:30 AM - 10:00 PM</strong>
                  </li>
                </ul>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.825rem', color: 'hsl(var(--color-text-muted))', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <Calendar size={16} style={{ color: '#0369a1', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Open 7 Days a Week.</strong> We remain open during standard operating hours on statutory holidays unless noted.</span>
                </div>
              </div>

              {/* Store Contact Card */}
              <div style={{ background: 'white', border: '1px solid hsl(var(--color-border))', borderRadius: '16px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Phone size={24} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'hsl(var(--color-text-dark))', marginBottom: '0.75rem' }}>Contact & Socials</h2>
                <p style={{ fontSize: '0.95rem', color: 'hsl(var(--color-text-dark))', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Phone size={16} style={{ color: '#b45309' }} /> <a href="tel:+14034972777" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>+1 (403) 497-2777</a>
                </p>
                <p style={{ fontSize: '0.95rem', color: 'hsl(var(--color-text-dark))', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Mail size={16} style={{ color: '#b45309' }} /> <a href="mailto:support@mykiranstore.ca" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>support@mykiranstore.ca</a>
                </p>
                <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
                  <a href="https://www.instagram.com/mykiranastore_ca/?hl=en" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#fdf2f8', color: '#db2777', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.825rem', fontWeight: 700, textDecoration: 'none' }}>
                    Instagram ↗
                  </a>
                  <a href="https://www.facebook.com/mykiranastoreca/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.825rem', fontWeight: 700, textDecoration: 'none' }}>
                    Facebook ↗
                  </a>
                </div>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.825rem', color: '#92400e', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>In-Store Shopping & Phone Inquiry Available. Online delivery is not offered at this location.</span>
                </div>
              </div>
            </div>

            {/* Interactive Map Embed Container */}
            <div style={{ background: 'white', border: '1px solid hsl(var(--color-border))', borderRadius: '20px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'hsl(var(--color-text-dark))', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={20} style={{ color: 'hsl(var(--color-primary))' }} /> Interactive Google Maps Location
              </h2>
              <div style={{ borderRadius: '14px', overflow: 'hidden' }}>
                <iframe
                  title="My Kirana Store Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2506.12604812345!2d-113.9837743234125!3d51.11084197957134!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x537165eb920f10cb%3A0xd8e2b5de9b599ea4!2sMy%20Kirana%20Store!5e0!3m2!1sen!2sca!4v1700000000000!5m2!1sen!2sca"
                  width="100%"
                  height="420"
                  style={{ border: 0, borderRadius: '14px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        )}

        {/* ==================== WEEKLY OFFERS PAGE ==================== */}
        {currentPath === '/offers' && (
          <div className="offers-page-layout" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem', width: '100%' }}>
            <div className="offers-header" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#fef3c7',
                color: '#b45309',
                fontWeight: '700',
                fontSize: '0.85rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                marginBottom: '0.75rem'
              }}>
                <Sparkles size={16} /> In-Store Specials & Promotions
              </span>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'hsl(var(--color-text-dark))', fontFamily: 'var(--font-family-title)' }}>
                Weekly Grocery Offers & Deals
              </h1>
              <p style={{ fontSize: '1.05rem', color: 'hsl(var(--color-text-muted))', maxWidth: '680px', margin: '0.75rem auto 0 auto', lineHeight: '1.6' }}>
                Browse active weekly flyer promotions and special in-store rollbacks at My Kirana Store in Calgary NE (6520 36 St NE Unit 1125).
              </p>
            </div>

            {instagramFeedData.posts && instagramFeedData.posts.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                {instagramFeedData.posts.map((post, idx) => (
                  <div key={post.id || idx} style={{ background: 'white', border: '1px solid hsl(var(--color-border))', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
                    <div
                      style={{ position: 'relative', aspectRatio: '4/5', background: '#f8fafc', cursor: 'pointer', overflow: 'hidden' }}
                      onClick={() => setActiveFlyerIndex(idx)}
                    >
                      <img
                        src={post.imageUrl}
                        alt={post.caption || 'Weekly Offer Flyer'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                        loading="lazy"
                      />
                      <span style={{ position: 'absolute', top: '0.85rem', left: '0.85rem', background: 'rgba(21, 128, 61, 0.9)', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.65rem', borderRadius: '9999px', boxShadow: 'var(--shadow-sm)' }}>
                        Weekly Flyer Deal
                      </span>
                    </div>
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))', fontWeight: 600 }}>
                        <Calendar size={14} /> <span>{post.date || 'In-Store Promotion'}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-dark))', lineHeight: 1.5, margin: 0, flex: 1 }}>
                        {post.caption}
                      </p>
                      <button
                        className="btn-primary"
                        onClick={() => setActiveFlyerIndex(idx)}
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.6rem', fontSize: '0.85rem', borderRadius: '10px', marginTop: '0.5rem', fontWeight: 700 }}
                      >
                        View Full Flyer <ZoomIn size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: 'white', border: '1px solid hsl(var(--color-border))', borderRadius: '20px', padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', maxWidth: '560px', margin: '0 auto' }}>
                <Sparkles size={52} style={{ color: '#b45309' }} />
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'hsl(var(--color-text-dark))' }}>No Active Promotional Flyer Today</h3>
                <p style={{ fontSize: '0.95rem', color: 'hsl(var(--color-text-muted))', lineHeight: 1.6 }}>
                  We currently have no active promotional flyer posted. Visit us in-store at 6520 36 St NE Unit 1125 for daily rollbacks and everyday low prices on Indian groceries!
                </p>
                <button className="btn-primary" onClick={() => navigateTo('/location')} style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem', borderRadius: '12px', fontWeight: 700 }}>
                  Get Store Directions & Hours
                </button>
              </div>
            )}
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
                <span className="footer-link" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                  <span>Mon - Thu, Sun: 10:30 AM - 9:00 PM</span>
                  <span>Fri & Sat: 10:30 AM - 10:00 PM</span>
                </span>
                <span className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', fontWeight: 600 }}>
                  <Calendar size={15} /> Open 7 Days a week
                </span>
              </div>

              <div className="footer-links-col">
                <span className="footer-links-title">Store Contact & Socials</span>
                <a
                  href="https://maps.app.goo.gl/CcYCfES5xPNcnS6w7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <MapPin size={15} style={{ flexShrink: 0 }} /> <span>Unit 1125, 6520 36 St NE, Calgary</span>
                </a>
                <a
                  href="tel:+14034972777"
                  className="footer-link"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Phone size={15} style={{ flexShrink: 0 }} /> <span>+1 (403) 497-2777</span>
                </a>
                <a
                  href="mailto:support@mykiranstore.ca"
                  className="footer-link"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Mail size={15} style={{ flexShrink: 0 }} /> <span>support@mykiranstore.ca</span>
                </a>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <a
                    href="https://www.instagram.com/mykiranastore_ca/?hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link"
                    style={{ color: '#db2777', fontWeight: 700 }}
                  >
                    Instagram ↗
                  </a>
                  <a
                    href="https://www.facebook.com/mykiranastoreca/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link"
                    style={{ color: '#3b82f6', fontWeight: 700 }}
                  >
                    Facebook ↗
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <span>© {new Date().getFullYear()} Kiran Store. All rights reserved.</span>
            </div>

            <div className="footer-credits-wrap">
              <span className="credits-label">Designed & Developed by</span>
              <a
                href="https://magnidigitech.com"
                target="_blank"
                rel="noopener noreferrer"
                className="magni-credits-btn"
                title="Magni Digitech - Professional Web Design & Digital Solutions"
              >
                <img
                  src="/images/magni-digitech-logo.png"
                  alt="Magni Digitech"
                  className="magni-credits-img"
                />
              </a>
            </div>

            <div className="footer-bottom-right">
              <span>Made with ❤️ for Calgary's Indian Community</span>
            </div>
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

      {/* Instagram Image Viewer / Lightbox Modal */}
      {activeFlyerIndex !== null && instagramFeedData.posts && instagramFeedData.posts[activeFlyerIndex] && (() => {
        const currentFlyer = instagramFeedData.posts[activeFlyerIndex];
        const totalFlyers = instagramFeedData.posts.length;

        return (
          <div
            className="insta-modal-backdrop"
            onClick={() => setActiveFlyerIndex(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="insta-modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Bar */}
              <div className="insta-modal-header">
                <div className="insta-modal-badge">
                  <span className="insta-modal-counter">
                    Flyer {activeFlyerIndex + 1} of {totalFlyers}
                  </span>
                  <span className="insta-modal-tag">Weekly Special</span>
                </div>
                <button
                  className="insta-modal-close"
                  onClick={() => setActiveFlyerIndex(null)}
                  title="Close (Esc)"
                  aria-label="Close flyer viewer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Image Area with Navigation Buttons */}
              <div className="insta-modal-media-wrap">
                {totalFlyers > 1 && (
                  <button
                    className="insta-nav-btn prev"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFlyerIndex(prev => (prev > 0 ? prev - 1 : totalFlyers - 1));
                    }}
                    title="Previous Flyer"
                    aria-label="Previous flyer"
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}

                <div className="insta-modal-img-box">
                  <img
                    src={currentFlyer.imageUrl}
                    alt={currentFlyer.caption || "My Kirana Store Flyer"}
                    className="insta-modal-img"
                    onError={(e) => {
                      if (currentFlyer.originalImageUrl && e.currentTarget.src !== currentFlyer.originalImageUrl) {
                        e.currentTarget.src = currentFlyer.originalImageUrl;
                      }
                    }}
                  />
                </div>

                {totalFlyers > 1 && (
                  <button
                    className="insta-nav-btn next"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFlyerIndex(prev => (prev < totalFlyers - 1 ? prev + 1 : 0));
                    }}
                    title="Next Flyer"
                    aria-label="Next flyer"
                  >
                    <ChevronRight size={24} />
                  </button>
                )}
              </div>

              {/* Modal Footer Info */}
              <div className="insta-modal-footer">
                <div className="insta-modal-info">
                  <p className="insta-modal-caption">
                    {currentFlyer.caption || "Weekly in-store Indian grocery deals & fresh arrivals"}
                  </p>
                  <span className="insta-modal-subtext">
                    <MapPin size={13} /> Available at 6520 36 St NE, Calgary • (403) 497-2777
                  </span>
                </div>

                <div className="insta-modal-actions">
                  {currentFlyer.postUrl && (
                    <a
                      href={currentFlyer.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-insta-modal-ext"
                    >
                      <span>View on Instagram</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
