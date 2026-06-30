import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShoppingBag, Layers, ShieldCheck, Heart, AlertCircle, 
  ExternalLink, Play, Star, Sparkles, BookOpen, Clock, Mail, Phone, 
  Check, Globe, ChevronRight, MessageSquare, Send, CheckCircle2, RotateCcw,
  Gauge, RefreshCw, Smartphone, Monitor, ChevronLeft
} from 'lucide-react';
import { Product, Blog, Category, Review, MediaItem, TrashItem, SiteSettings, CurrencyCode, CURRENCY_CONFIG, formatCurrency } from './types.ts';
import { Database as DB, adminCredentials, getAdminAuth, setAdminAuth, incrementVisitorStats, getVisitorStats } from './lib/db.ts';

// Component imports
import PWAInstaller from './components/PWAInstaller.tsx';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import ProductCard from './components/ProductCard.tsx';
import BlogCard from './components/BlogCard.tsx';

export default function App() {
  // --- CORE DATABASE STATES ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DB.getSettings());
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [trash, setTrash] = useState<TrashItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [visitorStats, setVisitorStats] = useState<any>({});

  // --- NAVIGATION & ROUTER STATES ---
  const [currentTab, setCurrentTab] = useState<string>('home'); // home, products, blog, about, contact, admin
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // --- SHOPPING BAG STATE ---
  const [cart, setCart] = useState<Product[]>([]);

  // --- ADMIN LOGIN STATE ---
  const [isAdmin, setIsAdmin] = useState<boolean>(getAdminAuth());
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- TOAST & UNDO NOTIFICATIONS STATE ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showUndoButton, setShowUndoButton] = useState<boolean>(false);

  // --- CURRENCY STATE ---
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  // --- DYNAMIC DEMO STATES (Satisfying interactive Demo System) ---
  const [activeDemoId, setActiveDemoId] = useState<string | null>(null);
  // Demo states for simulator logs
  const [demoWaterSales, setDemoWaterSales] = useState<{ id: number; name: string; type: string; paid: boolean }[]>([
    { id: 1, name: 'Main Road Bakeries', type: 'Refilled Slim 5G', paid: true },
    { id: 2, name: 'Alice Smith Residence', type: 'New Round 5G Bottle', paid: false },
    { id: 3, name: 'St. Mary Hospital Lobby', type: 'Refilled Round 5G', paid: true },
  ]);
  const [newWaterCustomer, setNewWaterCustomer] = useState('');
  const [newWaterType, setNewWaterType] = useState('Refilled Slim 5G');

  const [demoGasShiftSales, setDemoGasShiftSales] = useState<{ id: number; fuel: string; liters: number; total: number }[]>([
    { id: 1, fuel: 'Premium Gasoline', liters: 45.2, total: 61.02 },
    { id: 2, fuel: 'Diesel', liters: 120.5, total: 144.60 },
  ]);
  const [newGasFuel, setNewGasFuel] = useState('Premium Gasoline');
  const [newGasLiters, setNewGasLiters] = useState('20');

  const [demoFinanceExpenses, setDemoFinanceExpenses] = useState<{ id: number; item: string; cat: string; amount: number }[]>([
    { id: 1, item: 'Hosting & Server Sub', cat: 'Software', amount: 15.00 },
    { id: 2, item: 'Aistudio API Usage', cat: 'APIs', amount: 45.00 },
    { id: 3, item: 'Office Brew Pack', cat: 'Office', amount: 12.50 },
  ]);
  const [newExpenseItem, setNewExpenseItem] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // --- CONTACT STATE ---
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  // --- INITIAL LOAD ---
  useEffect(() => {
    // Increment total views on start
    incrementVisitorStats('totalVisitors');
    incrementVisitorStats('viewsTotal');

    // Load data from DB
    setProducts(DB.getProducts());
    setCategories(DB.getCategories());
    setBlogs(DB.getBlogs());
    setSettings(DB.getSettings());
    setMedia(DB.getMedia());
    setTrash(DB.getTrash());
    setReviews(DB.getReviews());
    setVisitorStats(getVisitorStats());

    // Sync body theme primary color dynamically
    const primary = DB.getSettings().primaryColor || '#2563eb';
    document.documentElement.style.setProperty('--color-brand-600', primary);
  }, []);

  // Sync state modifications
  const refreshDatabaseStates = () => {
    setProducts(DB.getProducts());
    setBlogs(DB.getBlogs());
    setCategories(DB.getCategories());
    setSettings(DB.getSettings());
    setMedia(DB.getMedia());
    setTrash(DB.getTrash());
    setReviews(DB.getReviews());
    setVisitorStats(getVisitorStats());
    
    const primary = DB.getSettings().primaryColor || '#2563eb';
    document.documentElement.style.setProperty('--color-brand-600', primary);
  };

  // --- TRIGGER TOASTS ---
  const triggerUndoToast = (message: string) => {
    setToastMessage(message);
    setShowUndoButton(true);
    setTimeout(() => {
      setToastMessage(null);
      setShowUndoButton(false);
    }, 6000);
  };

  const triggerSimpleToast = (message: string) => {
    setToastMessage(message);
    setShowUndoButton(false);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleUndoAction = () => {
    const res = DB.undoLastDelete();
    if (res.success) {
      refreshDatabaseStates();
      triggerSimpleToast(`Restored ${res.name || res.type}!`);
    } else {
      triggerSimpleToast('Nothing to undo.');
    }
  };

  // --- SHOPPING ACTIONS ---
  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (cart.find(p => p.id === product.id)) {
      setCart(cart.filter(p => p.id !== product.id));
      triggerSimpleToast('Removed from Shopping Bag.');
    } else {
      setCart([...cart, product]);
      triggerSimpleToast(`Added ${product.name} to Shopping Bag!`);
    }
  };

  // --- ADMIN LOGIN CONTROL ---
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail === adminCredentials.email && loginPassword === adminCredentials.password) {
      setAdminAuth(true);
      setIsAdmin(true);
      setLoginError('');
      setCurrentTab('admin');
      triggerSimpleToast('Workspace Admin session authenticated!');
    } else {
      setLoginError('Invalid credentials. Access Denied.');
    }
  };

  const handleAdminLogout = () => {
    setAdminAuth(false);
    setIsAdmin(false);
    setCurrentTab('home');
    triggerSimpleToast('Logged out of Admin panel.');
  };

  // --- SIMULATED DEMO ACTIONS ---
  const handleAddWaterRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWaterCustomer.trim()) return;
    const records = [...demoWaterSales];
    if (records.length >= 10) records.shift(); // Max 10 records limit for Demo Version
    records.push({
      id: Date.now(),
      name: newWaterCustomer,
      type: newWaterType,
      paid: Math.random() > 0.3
    });
    setDemoWaterSales(records);
    setNewWaterCustomer('');
  };

  const handleAddGasRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGasLiters || isNaN(Number(newGasLiters))) return;
    const records = [...demoGasShiftSales];
    if (records.length >= 10) records.shift(); // Max 10 records limit for Demo Version
    const rate = newGasFuel === 'Premium Gasoline' ? 1.35 : 1.20;
    records.push({
      id: Date.now(),
      fuel: newGasFuel,
      liters: Number(newGasLiters),
      total: Number(newGasLiters) * rate
    });
    setDemoGasShiftSales(records);
    setNewGasLiters('20');
  };

  const handleAddFinanceRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseItem || isNaN(Number(newExpenseAmount))) return;
    const records = [...demoFinanceExpenses];
    if (records.length >= 10) records.shift(); // Max 10 records limit for Demo Version
    records.push({
      id: Date.now(),
      item: newExpenseItem,
      cat: 'Local Ops',
      amount: Number(newExpenseAmount)
    });
    setDemoFinanceExpenses(records);
    setNewExpenseItem('');
    setNewExpenseAmount('');
  };

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) return;
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 4000);
  };

  // --- DETAILED RENDER SELECTION ---
  const activeProduct = products.find(p => p.id === selectedProductId);
  const activeBlog = blogs.find(b => b.slug === selectedBlogSlug);

  return (
    <div id="cozy-sheets-root" className="min-h-screen flex flex-col justify-between">
      
      {/* Top Floating PWA Banner */}
      <PWAInstaller />

      {/* Main Header / Navigation */}
      <Navbar
        settings={settings}
        currentTab={currentTab}
        setTab={setCurrentTab}
        setSelectedProductId={setSelectedProductId}
        setSelectedCategorySlug={setSelectedCategorySlug}
        setSelectedBlogSlug={setSelectedBlogSlug}
        cart={cart}
        removeFromCart={(id) => setCart(cart.filter(p => p.id !== id))}
        clearCart={() => setCart([])}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        isLoggedIn={isAdmin}
        currency={currency}
        setCurrency={setCurrency}
      />

      {/* Dynamic Main Body Content */}
      <div className="flex-1">
        
        {/* VIEW: HOME PAGE */}
        {currentTab === 'home' && (
          <div className="space-y-8 pb-10">
            {/* Announcements ribbon */}
            <div className="bg-amber-50 border-b border-amber-100 text-amber-900 py-1.5 px-4 text-center text-[10.5px] font-mono tracking-wide">
              🔥 SPECIAL RELEASE: PWA versions of AquaFlow POS and PetroGas calibration dashboards are live. Try the real in-browser demo now!
            </div>

            {/* Small Compact Hero Section (Information Density over Whitespace) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <div className="bg-white border border-gray-100 rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
                <div className="space-y-3 max-w-xl">
                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 py-1 px-2.5 rounded text-[10px] font-mono font-bold w-fit border border-blue-100">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Senior Designer Curated Software
                  </div>
                  <h1 className="font-display font-bold text-lg md:text-xl text-slate-950 tracking-tight leading-tight">
                    Premium Progressive Web Apps & Automated Business Ledgers.
                  </h1>
                  <p className="text-xs text-slate-500 leading-normal font-sans">
                    {settings.aboutText}
                  </p>
                  <div className="flex gap-2 text-xs">
                    <button 
                      onClick={() => setCurrentTab('products')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded shadow-xs cursor-pointer transition-colors"
                    >
                      Browse Digital Catalog
                    </button>
                    <button 
                      onClick={() => setCurrentTab('blog')}
                      className="border border-gray-200 text-slate-700 hover:bg-slate-50 font-medium py-1.5 px-3 rounded cursor-pointer transition-colors"
                    >
                      Read Systems Guides
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-4 rounded-md border border-gray-100 w-full md:w-auto flex-none">
                  <div className="bg-white p-2 border border-gray-100 rounded">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wide block">AquaFlow POS</span>
                    <span className="text-xs font-bold text-slate-900 block mt-0.5">{formatCurrency(149, currency)}</span>
                    <span className="text-[8.5px] text-emerald-600 font-bold block mt-0.5">✔ PWA Install</span>
                  </div>
                  <div className="bg-white p-2 border border-gray-100 rounded">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wide block">PetroGas Audit</span>
                    <span className="text-xs font-bold text-slate-900 block mt-0.5">{formatCurrency(299, currency)}</span>
                    <span className="text-[8.5px] text-emerald-600 font-bold block mt-0.5">✔ Offline Sync</span>
                  </div>
                  <div className="bg-white p-2 border border-gray-100 rounded">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wide block">LedgerPro Sheet</span>
                    <span className="text-xs font-bold text-slate-900 block mt-0.5">{formatCurrency(34, currency)}</span>
                    <span className="text-[8.5px] text-slate-400 block mt-0.5">Excel / Sheets</span>
                  </div>
                  <div className="bg-white p-2 border border-gray-100 rounded flex flex-col justify-between">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wide block">Total Catalog</span>
                    <span className="text-xs font-bold text-slate-900 block mt-0.5">{products.length} Products</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Categories browse block */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-display font-bold text-xs text-slate-400 uppercase tracking-wider font-mono">Browse operational categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mt-2">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCategorySlug(c.slug);
                      setCurrentTab('products');
                    }}
                    className="bg-white hover:bg-slate-50 border border-gray-100 hover:border-blue-200 p-2 text-center rounded transition-all cursor-pointer shadow-xs"
                  >
                    <span className="text-[11px] font-medium text-slate-700 block truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Core Product Catalog Sections (Featured / New Releases / Popular) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* Left 2 Cols: Catalog Display */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h2 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                    <Layers className="h-4 w-4 text-blue-600" />
                    Featured Business PWAs & Toolkits
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                    {products
                      .filter(p => p.status === 'Published')
                      .slice(0, 4)
                      .map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          categories={categories}
                          currency={currency}
                          onSelect={(id) => {
                            setSelectedProductId(id);
                            setCurrentTab('product-details');
                            incrementVisitorStats(id === 'prod-1' ? 'viewsProduct1' : id === 'prod-2' ? 'viewsProduct2' : 'viewsProduct3');
                          }}
                          onAddToCart={handleAddToCart}
                          isInCart={!!cart.find(item => item.id === product.id)}
                        />
                      ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Mini Blogs & Reviews list */}
              <div className="space-y-6">
                {/* Latest blogs */}
                <div className="bg-white border border-gray-100 p-4 rounded-md shadow-xs space-y-3">
                  <h3 className="font-display font-bold text-xs text-slate-900 uppercase tracking-wide border-b border-gray-50 pb-2 flex items-center justify-between">
                    <span>Latest Guides & Manuals</span>
                    <button 
                      onClick={() => setCurrentTab('blog')}
                      className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                    >
                      All
                    </button>
                  </h3>
                  <div className="space-y-2.5">
                    {blogs.slice(0, 2).map((post) => (
                      <div 
                        key={post.id}
                        onClick={() => {
                          setSelectedBlogSlug(post.slug);
                          setCurrentTab('blog-details');
                        }}
                        className="group flex gap-2 cursor-pointer"
                      >
                        <img src={post.featuredImage} alt="blog" className="h-10 w-14 rounded object-cover flex-none border border-gray-100" />
                        <div className="min-w-0">
                          <h4 className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                            {post.title}
                          </h4>
                          <span className="text-[9.5px] font-mono text-slate-400 block mt-0.5">{post.createdAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testimonials (Reviews carousel) */}
                <div className="bg-slate-900 text-slate-300 p-4 rounded-md shadow-xs space-y-3 border border-slate-800">
                  <h3 className="font-display font-bold text-xs text-white uppercase tracking-wide border-b border-slate-800 pb-2">
                    Verified Customer Reviews
                  </h3>
                  <div className="space-y-3.5">
                    {reviews.slice(0, 3).map((rev) => (
                      <div key={rev.id} className="space-y-1 text-[11px] leading-relaxed">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-slate-400">{rev.userName}</span>
                          <div className="flex text-amber-400">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="h-2.5 w-2.5 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-300 italic font-sans">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </section>

          </div>
        )}

        {/* VIEW: PRODUCTS CATALOG PAGE */}
        {currentTab === 'products' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-150 pb-3">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 tracking-tight">Digital Systems & Spreadsheet Templates</h2>
                <p className="text-xs text-slate-500">Fully compatible, installable PWAs and calculators built for small businesses.</p>
              </div>

              {/* Reset category or filters bar */}
              {selectedCategorySlug && (
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 py-1 px-2.5 rounded text-[11px] font-mono font-bold w-fit">
                  Category: {categories.find(c => c.slug === selectedCategorySlug)?.name}
                  <button 
                    onClick={() => setSelectedCategorySlug(null)}
                    className="p-0.5 hover:bg-blue-100 rounded text-red-500 font-sans"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              
              {/* Left Column: Filter panel */}
              <div className="space-y-4">
                <div className="bg-white border border-gray-100 rounded p-3.5 shadow-xs space-y-3.5 text-xs">
                  <h3 className="font-display font-bold text-slate-900 uppercase text-[10px] tracking-wider block">Operational filters</h3>
                  
                  {/* Category select */}
                  <div className="space-y-1.5">
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wide block">Filter by Category</span>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setSelectedCategorySlug(null)}
                        className={`w-full text-left py-1 px-2 rounded font-mono ${!selectedCategorySlug ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        All Categories
                      </button>
                      {categories.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCategorySlug(c.slug)}
                          className={`w-full text-left py-1 px-2 rounded font-mono truncate ${selectedCategorySlug === c.slug ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 text-slate-300 rounded p-4 border border-slate-800 text-[11px] leading-relaxed">
                  <span className="font-display font-bold text-white text-xs block mb-1">PWA Standard Offline</span>
                  Our templates contain integrated offline synchronization protocols so you don't lose records when cellular coverage drops.
                </div>
              </div>

              {/* Right Columns: Products list */}
              <div className="md:col-span-3">
                {products.filter(p => p.status === 'Published').length === 0 ? (
                  <div className="bg-white border border-gray-150 rounded p-12 text-center text-xs text-slate-400">
                    <AlertCircle className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    No products published in directory.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products
                      .filter(p => p.status === 'Published')
                      .filter(p => {
                        if (!selectedCategorySlug) return true;
                        const catId = categories.find(c => c.slug === selectedCategorySlug)?.id;
                        return p.category === catId;
                      })
                      .filter(p => {
                        if (!searchQuery) return true;
                        return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
                      })
                      .map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          categories={categories}
                          currency={currency}
                          onSelect={(id) => {
                            setSelectedProductId(id);
                            setCurrentTab('product-details');
                            incrementVisitorStats(id === 'prod-1' ? 'viewsProduct1' : id === 'prod-2' ? 'viewsProduct2' : 'viewsProduct3');
                          }}
                          onAddToCart={handleAddToCart}
                          isInCart={!!cart.find(item => item.id === product.id)}
                        />
                      ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* VIEW: PRODUCT DETAILS PAGE */}
        {currentTab === 'product-details' && activeProduct && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            
            {/* Back to Products */}
            <button
              onClick={() => {
                setCurrentTab('products');
                setActiveDemoId(null);
              }}
              className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Systems Catalog
            </button>

            {/* Layout grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Side: Thumbnail & Features & Changelog */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Main Product Title & cover */}
                <div className="bg-white border border-gray-150 rounded-lg overflow-hidden shadow-xs p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-50 pb-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                        {categories.find(c => c.id === activeProduct.category)?.name || 'Digital Tools'}
                      </span>
                      <h1 className="font-display font-bold text-base md:text-lg text-slate-900 leading-tight">
                        {activeProduct.name}
                      </h1>
                    </div>
                    <div className="flex flex-col text-right font-mono">
                      <span className="text-[9px] text-slate-400">LICENSE PRICE</span>
                      <span className="text-sm font-bold text-slate-950">{formatCurrency(activeProduct.price, currency)}</span>
                    </div>
                  </div>

                  {/* Screenshots gallery */}
                  <div className="space-y-2">
                    <div className="aspect-video w-full rounded overflow-hidden bg-slate-50 border border-gray-100">
                      <img
                        src={activeProduct.thumbnail}
                        alt="cover"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {activeProduct.screenshots && activeProduct.screenshots.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {activeProduct.screenshots.map((screen, idx) => (
                          <div key={idx} className="aspect-video rounded overflow-hidden border border-gray-150">
                            <img src={screen} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product description */}
                  <div className="space-y-2 text-xs text-slate-600 leading-relaxed font-sans border-t border-gray-50 pt-4">
                    <h3 className="font-display font-bold text-slate-900 text-xs">Functional System Specifications</h3>
                    <p>{activeProduct.description}</p>
                  </div>
                </div>

                {/* Features & Modules checklist */}
                <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-xs space-y-3 text-xs">
                  <h3 className="font-display font-bold text-slate-900 text-xs">Integrated Operations Modules</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans text-slate-600">
                    {activeProduct.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded border border-gray-50">
                        <Check className="h-3.5 w-3.5 text-blue-600 flex-none mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive LIVE DEMO SIMULATOR Block */}
                {activeProduct.demoLink && (
                  <div className="bg-white border-2 border-emerald-500 rounded-lg p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                        <h3 className="font-display font-bold text-xs text-emerald-900 font-mono tracking-wide uppercase">
                          Demo Version LIVE: Interactive System Sandbox
                        </h3>
                      </div>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded font-bold">
                        MAX 10 RECORDS LIMIT
                      </span>
                    </div>

                    <p className="text-[11.5px] text-emerald-700 leading-relaxed font-sans">
                      Test driving the core logic in real-time. Add records below to see calculations update in the browser local memory.
                    </p>

                    {/* RENDER WATER POS SIMULATOR */}
                    {activeProduct.id === 'prod-1' && (
                      <div className="space-y-4 text-xs font-mono bg-slate-50 p-4 rounded border border-gray-200">
                        <div className="flex justify-between items-center bg-white p-2 border border-gray-150 rounded shadow-xs text-[11px]">
                          <span>Active Log Count: <strong>{demoWaterSales.length} / 10</strong></span>
                          <span className="text-emerald-600"><strong>Queue: Ready</strong></span>
                        </div>

                        {/* Record Entry form */}
                        <form onSubmit={handleAddWaterRecord} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Customer Name/Store"
                            value={newWaterCustomer}
                            onChange={(e) => setNewWaterCustomer(e.target.value)}
                            className="bg-white border border-gray-200 p-1.5 rounded outline-none focus:border-blue-500 text-[11px]"
                          />
                          <select
                            value={newWaterType}
                            onChange={(e) => setNewWaterType(e.target.value)}
                            className="bg-white border border-gray-200 p-1.5 rounded outline-none focus:border-blue-500 text-[11px]"
                          >
                            <option value="Refilled Slim 5G">Refilled Slim 5G ($2.50)</option>
                            <option value="Refilled Round 5G">Refilled Round 5G ($3.00)</option>
                            <option value="New Round 5G Bottle">New Round 5G Bottle ($12.00)</option>
                          </select>
                          <button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] py-1 cursor-pointer"
                          >
                            Add POS Invoice
                          </button>
                        </form>

                        {/* Simulated table */}
                        <div className="bg-white rounded border border-gray-200 overflow-hidden">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-slate-100 text-slate-500 text-[10px]">
                              <tr>
                                <th className="p-1.5">Invoice ID</th>
                                <th className="p-1.5">Account / Client</th>
                                <th className="p-1.5">Load Type</th>
                                <th className="p-1.5 text-right">Payment</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {demoWaterSales.map((item, index) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                  <td className="p-1.5">#INV-{1024 + index}</td>
                                  <td className="p-1.5 font-bold text-slate-800">{item.name}</td>
                                  <td className="p-1.5">{item.type}</td>
                                  <td className="p-1.5 text-right">
                                    <span className={`inline-block font-bold text-[9px] px-1.5 rounded ${item.paid ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                      {item.paid ? 'PAID ✓' : 'UNPAID'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* RENDER GAS POS SIMULATOR */}
                    {activeProduct.id === 'prod-2' && (
                      <div className="space-y-4 text-xs font-mono bg-slate-50 p-4 rounded border border-gray-200">
                        <div className="flex justify-between items-center bg-white p-2 border border-gray-150 rounded text-[11px]">
                          <span>Active Readings: <strong>{demoGasShiftSales.length} / 10</strong></span>
                          <span>Shift Manager: <strong>Shift A (06:00 - 14:00)</strong></span>
                        </div>

                        {/* Record Entry Form */}
                        <form onSubmit={handleAddGasRecord} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <select
                            value={newGasFuel}
                            onChange={(e) => setNewGasFuel(e.target.value)}
                            className="bg-white border border-gray-200 p-1.5 rounded outline-none focus:border-blue-500 text-[11px]"
                          >
                            <option value="Premium Gasoline">Premium Gasoline ($1.35/L)</option>
                            <option value="Regular Gasoline">Regular Gasoline ($1.25/L)</option>
                            <option value="Diesel">Diesel ($1.20/L)</option>
                          </select>
                          <input
                            type="number"
                            placeholder="Liters loaded"
                            value={newGasLiters}
                            onChange={(e) => setNewGasLiters(e.target.value)}
                            className="bg-white border border-gray-200 p-1.5 rounded outline-none focus:border-blue-500 text-[11px]"
                          />
                          <button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] py-1 cursor-pointer"
                          >
                            Log Reading
                          </button>
                        </form>

                        {/* Table */}
                        <div className="bg-white rounded border border-gray-200 overflow-hidden">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-slate-100 text-slate-500 text-[10px]">
                              <tr>
                                <th className="p-1.5">Nozzle ID</th>
                                <th className="p-1.5">Fuel Classification</th>
                                <th className="p-1.5">Volume Charged</th>
                                <th className="p-1.5 text-right">Value USD</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {demoGasShiftSales.map((item, index) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                  <td className="p-1.5 font-bold">NZ-{10 + index}</td>
                                  <td className="p-1.5">{item.fuel}</td>
                                  <td className="p-1.5">{item.liters.toFixed(1)} Liters</td>
                                  <td className="p-1.5 text-right font-bold text-slate-900">{formatCurrency(item.total, currency)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* RENDER LEDGER FINANCE SIMULATOR */}
                    {activeProduct.id === 'prod-3' && (
                      <div className="space-y-4 text-xs font-mono bg-slate-50 p-4 rounded border border-gray-200">
                        <div className="flex justify-between items-center bg-white p-2 border border-gray-150 rounded text-[11px]">
                          <span>Active Expenses logged: <strong>{demoFinanceExpenses.length} / 10</strong></span>
                          <span>Total Cash Burn: <strong className="text-red-600">{formatCurrency(demoFinanceExpenses.reduce((sum, item) => sum + item.amount, 0), currency)}</strong></span>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleAddFinanceRecord} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Expense description"
                            required
                            value={newExpenseItem}
                            onChange={(e) => setNewExpenseItem(e.target.value)}
                            className="bg-white border border-gray-200 p-1.5 rounded outline-none focus:border-blue-500 text-[11px]"
                          />
                          <input
                            type="number"
                            placeholder="Amount USD"
                            required
                            value={newExpenseAmount}
                            onChange={(e) => setNewExpenseAmount(e.target.value)}
                            className="bg-white border border-gray-200 p-1.5 rounded outline-none focus:border-blue-500 text-[11px]"
                          />
                          <button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] py-1 cursor-pointer"
                          >
                            Add Expense Row
                          </button>
                        </form>

                        <div className="bg-white rounded border border-gray-200 overflow-hidden">
                          <table className="w-full text-left text-[11px]">
                            <tbody className="divide-y divide-gray-100">
                              {demoFinanceExpenses.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                  <td className="p-1.5 font-bold text-slate-800">A{item.id}</td>
                                  <td className="p-1.5">{item.item}</td>
                                  <td className="p-1.5 text-slate-400">({item.cat})</td>
                                  <td className="p-1.5 text-right font-bold text-red-600">-{formatCurrency(item.amount, currency)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Changelogs notes */}
                <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-xs space-y-3 text-xs">
                  <h3 className="font-display font-bold text-slate-900 text-xs">System Changelog History</h3>
                  <div className="space-y-3.5 font-sans">
                    {activeProduct.changelog && activeProduct.changelog.map((log, lIdx) => (
                      <div key={lIdx} className="space-y-1 bg-slate-50/50 p-3 rounded border border-gray-50">
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="font-bold text-slate-800">v{log.version}</span>
                          <span className="text-slate-400">{log.date}</span>
                        </div>
                        <ul className="list-disc ml-4 space-y-0.5 text-slate-500 text-[11px]">
                          {log.changes.map((ch, cIdx) => (
                            <li key={cIdx}>{ch}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Side: Quick facts & cart buttons */}
              <div className="space-y-4">
                
                {/* Meta details */}
                <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-xs space-y-3 text-xs">
                  <h3 className="font-display font-bold text-slate-900 text-xs">Technical Requisites</h3>
                  
                  <div className="space-y-2 font-mono text-[10.5px]">
                    <div className="flex justify-between border-b border-gray-50 pb-1.5">
                      <span className="text-slate-400">Current version:</span>
                      <span className="text-slate-800 font-bold">v{activeProduct.version}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1.5">
                      <span className="text-slate-400">PWA Manifest:</span>
                      <span className="text-emerald-600 font-bold">COMPLIANT</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1.5">
                      <span className="text-slate-400">Offline Caching:</span>
                      <span className="text-emerald-600 font-bold">ACTIVE ✓</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-1.5">
                      <span className="text-slate-400">Hosting:</span>
                      <span className="text-slate-800">Vercel, Netlify</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Stripe Gateway:</span>
                      <span className="text-slate-800">Preconfigured</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                    <button
                      onClick={(e) => handleAddToCart(activeProduct, e)}
                      className={`w-full py-2 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                        cart.find(p => p.id === activeProduct.id)
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {cart.find(p => p.id === activeProduct.id) ? 'Item inside bag ✓' : 'Add license to bag'}
                    </button>
                    
                    <a
                      href={activeProduct.buyLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-slate-900 text-amber-400 py-2 rounded text-xs font-mono font-bold text-center hover:bg-slate-800 transition-colors cursor-pointer inline-block"
                    >
                      Instant Purchase via Stripe
                    </a>
                  </div>
                </div>

                {/* Related products */}
                <div className="bg-white border border-gray-150 rounded-lg p-4 shadow-xs space-y-3 text-xs">
                  <h3 className="font-display font-bold text-slate-900 text-xs">Similar Systems</h3>
                  <div className="space-y-3">
                    {products
                      .filter(p => p.id !== activeProduct.id && p.status === 'Published')
                      .slice(0, 2)
                      .map((p) => (
                        <div 
                          key={p.id}
                          onClick={() => {
                            setSelectedProductId(p.id);
                            incrementVisitorStats(p.id === 'prod-1' ? 'viewsProduct1' : p.id === 'prod-2' ? 'viewsProduct2' : 'viewsProduct3');
                          }}
                          className="flex gap-2.5 cursor-pointer hover:opacity-85"
                        >
                          <img src={p.thumbnail} alt="thumb" className="h-10 w-10 rounded object-cover border border-gray-100" />
                          <div className="min-w-0">
                            <h4 className="text-[11px] font-bold text-slate-800 truncate">{p.name}</h4>
                            <span className="text-[10px] font-mono font-bold text-slate-500">{formatCurrency(p.price, currency)}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* VIEW: BLOG ARTICLES DIRECTORY */}
        {currentTab === 'blog' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="border-b border-gray-150 pb-3">
              <h2 className="font-display text-lg font-bold text-slate-900 tracking-tight">Marketplace Operations Blog</h2>
              <p className="text-xs text-slate-500 font-sans">Read our senior designer manuals on scaling water stations, gas audits, and formula workbooks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blogs
                .filter(b => b.status === 'Published')
                .map((post) => (
                  <BlogCard
                    key={post.id}
                    blog={post}
                    onSelect={(slug) => {
                      setSelectedBlogSlug(slug);
                      setCurrentTab('blog-details');
                    }}
                  />
                ))}
            </div>
          </div>
        )}

        {/* VIEW: BLOG POST DETAIL PAGE */}
        {currentTab === 'blog-details' && activeBlog && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
            <button
              onClick={() => setSelectedBlogSlug(null) || setCurrentTab('blog')}
              className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Articles Index
            </button>

            <article className="bg-white border border-gray-150 rounded-lg overflow-hidden shadow-xs p-6 space-y-4">
              <div className="space-y-2 border-b border-gray-50 pb-3">
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 py-0.5 px-2 rounded-full font-bold">
                  {activeBlog.category}
                </span>
                <h1 className="font-display font-bold text-base md:text-lg text-slate-900 leading-snug">
                  {activeBlog.title}
                </h1>
                <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Published: {activeBlog.createdAt}</span>
                </div>
              </div>

              <div className="aspect-video w-full rounded overflow-hidden bg-slate-50 border border-gray-100">
                <img src={activeBlog.featuredImage} alt={activeBlog.title} className="h-full w-full object-cover" />
              </div>

              {/* Fast Inline Markdown Renderer */}
              <div className="markdown-body space-y-3 font-sans leading-relaxed text-xs">
                {activeBlog.content.split('\n\n').map((block, index) => {
                  if (block.startsWith('### ')) {
                    return <h3 key={index} className="text-slate-950 font-display font-bold text-xs mt-3">{block.replace('### ', '')}</h3>;
                  }
                  if (block.startsWith('1. ') || block.startsWith('- ')) {
                    return (
                      <ul key={index} className="list-disc pl-4 space-y-1">
                        {block.split('\n').map((li, lIdx) => (
                          <li key={lIdx}>{li.replace(/^\d+\.\s+/, '').replace(/^-\s+/, '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={index}>{block}</p>;
                })}
              </div>
            </article>
          </div>
        )}

        {/* VIEW: ABOUT PAGE */}
        {currentTab === 'about' && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
            <div className="bg-white border border-gray-150 rounded-lg p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
                <img
                  src={settings.logo}
                  alt="Logo"
                  referrerPolicy="no-referrer"
                  className="h-14 w-14 rounded-md object-cover border border-gray-200"
                />
                <div>
                  <h1 className="font-display font-bold text-base text-slate-900 tracking-tight">{settings.siteName}</h1>
                  <span className="font-mono text-[10px] text-slate-400 block mt-0.5">ESTABLISHED 2026 • CODING ENGINE</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed font-sans space-y-3">
                <p>{settings.aboutText}</p>
                <h3 className="font-display font-bold text-slate-900 text-xs">Engineered Operational Frameworks</h3>
                <p>
                  Rather than deploying complex, heavy cloud databases and paying heavy dynamic subscription rates, our systems utilize localized client engines. We allow manual download options, instant Excel worksheets, and direct Stripe checkout integrations, giving small businesses complete ownership over their files and operations logs.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50 text-[11px] font-mono text-slate-500">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Support channels:</span>
                  <span className="font-bold text-slate-800">{settings.contactDetails.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Primary office line:</span>
                  <span className="font-bold text-slate-800">{settings.contactDetails.phone}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: CONTACT PAGE */}
        {currentTab === 'contact' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Support channels left card */}
              <div className="bg-white border border-gray-150 rounded-lg p-4 shadow-xs space-y-4 text-xs">
                <h2 className="font-display font-bold text-slate-900 text-xs border-b border-gray-50 pb-2">Support Hotlines</h2>
                <div className="space-y-3 font-sans text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4.5 w-4.5 text-blue-600 flex-none" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">SUPPORT EMAIL</span>
                      <a href={`mailto:${settings.contactDetails.email}`} className="font-bold hover:underline">{settings.contactDetails.email}</a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4.5 w-4.5 text-blue-600 flex-none" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">TELEPHONE LINE</span>
                      <span className="font-mono font-bold">{settings.contactDetails.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="h-4.5 w-4.5 text-blue-600 flex-none" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">MESSENGER CHAT</span>
                      <a href={settings.contactDetails.messenger} target="_blank" rel="noreferrer" className="font-bold text-blue-600 hover:underline">m.me/cozysheets</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact form */}
              <div className="bg-white border border-gray-150 rounded-lg p-5 shadow-xs md:col-span-2 text-xs">
                <h2 className="font-display font-bold text-slate-900 text-xs border-b border-gray-50 pb-2 mb-3">Custom Integrations Query</h2>

                {contactSuccess ? (
                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-md border border-emerald-150 space-y-2 text-center font-sans">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                    <h3 className="font-bold text-xs">Query Dispatched Successfully</h3>
                    <p className="text-[11px] leading-relaxed">Our design desk has received your integration specs. We will reply within 12 business hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactFormSubmit} className="space-y-3 font-sans">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. Maria Clara"
                          className="w-full rounded border border-gray-200 p-2 outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="clara@example.com"
                          className="w-full rounded border border-gray-200 p-2 outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Message Description</label>
                      <textarea
                        rows={4}
                        required
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Detail any custom calculation rows, branding requirements, or offline installation needs..."
                        className="w-full rounded border border-gray-200 p-2 outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-mono font-bold text-[10.5px] cursor-pointer"
                    >
                      DISPATCH TICKET
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        )}

        {/* VIEW: ADMIN LOGIN OR ACTIVE WORKSPACE */}
        {currentTab === 'admin' && (
          <div>
            {!isAdmin ? (
              <div className="max-w-sm mx-auto my-12 bg-white border border-gray-150 p-6 rounded-lg shadow-xs text-xs">
                <div className="text-center space-y-1.5 border-b border-gray-50 pb-4 mb-4">
                  <ShieldCheck className="h-9 w-9 text-blue-600 mx-auto" />
                  <h1 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wide">Administrator Login</h1>
                  <p className="text-[11px] text-slate-400">Restricted operational workspace. Credentials required.</p>
                </div>

                <form onSubmit={handleAdminLoginSubmit} className="space-y-3 font-sans">
                  {loginError && (
                    <div className="bg-red-50 text-red-700 p-2.5 rounded border border-red-150 font-medium text-[11px]">
                      {loginError}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="admin@cozysheets.com"
                      className="w-full rounded border border-gray-200 p-2 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded border border-gray-200 p-2 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded font-mono font-bold tracking-wide cursor-pointer"
                  >
                    AUTHENTICATE SESSION
                  </button>

                  <div className="bg-slate-50 p-2.5 rounded border border-slate-100 font-mono text-[9.5px] text-slate-400 mt-2 space-y-0.5">
                    <div>DEMO LOGIN FOR AUDITORS:</div>
                    <div>Email: <span className="text-slate-800 font-bold">admin@cozysheets.com</span></div>
                    <div>Pass: <span className="text-slate-800 font-bold">admin</span></div>
                  </div>
                </form>
              </div>
            ) : (
              <AdminPanel
                products={products}
                categories={categories}
                blogs={blogs}
                settings={settings}
                media={media}
                trash={trash}
                visitorStats={visitorStats}
                currency={currency}
                onUpdateProducts={setProducts}
                onUpdateBlogs={setBlogs}
                onUpdateCategories={setCategories}
                onUpdateSettings={setSettings}
                onUpdateMedia={setMedia}
                onUpdateTrash={setTrash}
                triggerUndoToast={triggerUndoToast}
                onLogout={handleAdminLogout}
              />
            )}
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      {currentTab !== 'admin' && (
        <Footer settings={settings} setTab={setCurrentTab} isLoggedIn={isAdmin} />
      )}

      {/* FLOATING UNDO & TOAST NOTIFICATION WINDOW */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-950 text-white py-2 px-3.5 rounded shadow-lg flex items-center gap-3.5 text-xs font-mono border border-slate-800">
          <span>{toastMessage}</span>
          {showUndoButton && (
            <button
              onClick={handleUndoAction}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-0.5 px-2 rounded cursor-pointer transition-colors flex items-center gap-1 text-[10.5px]"
            >
              <RotateCcw className="h-3 w-3" /> UNDO
            </button>
          )}
        </div>
      )}

    </div>
  );
}
