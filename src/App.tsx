import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, Package, Blocks, Tag, ShoppingCart } from 'lucide-react';
import { parseCSV } from './utils/csvParser';
import type { Product } from './types';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await parseCSV('/data.csv');
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All', ...Array.from(cats)].sort();
  }, [products]);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All', ...Array.from(cats)].sort();
  }, [products]);

  const maxProductPrice = useMemo(() => {
    if (products.length === 0) return 25000;
    return Math.max(...products.map(p => p.discountedPrice || p.price));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      
      const price = product.discountedPrice || product.price;
      const matchesMinPrice = minPrice === '' || price >= Number(minPrice);
      const matchesMaxPrice = maxPrice === '' || price <= Number(maxPrice);
      
      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
    });
  }, [products, searchQuery, selectedCategory, minPrice, maxPrice]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-color)' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--lego-red)', animation: 'bounce 1s infinite' }}></div>
          <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--lego-blue)', animation: 'bounce 1s infinite 0.2s' }}></div>
          <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--lego-yellow)', animation: 'bounce 1s infinite 0.4s' }}></div>
        </div>
        <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'var(--lego-red)', 
        color: 'white', 
        padding: '15px 30px',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {/* Left Side: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
          <Blocks size={32} />
          <h1 style={{ fontSize: '1.5rem', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>BricksKingdom - Catalogue</h1>
        </div>
        
        {/* Center: Search */}
        <div style={{ display: 'flex', justifyContent: 'center', flex: 2 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
            <input 
              type="text" 
              placeholder="Search sets or SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 15px 10px 40px',
                borderRadius: '20px',
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                boxSizing: 'border-box'
              }}
            />
            <Search size={20} color="#666" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          </div>
        </div>

        {/* Right Side: Empty to balance flex layout */}
        <div style={{ flex: 1 }}></div>
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, padding: '20px', gap: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Sidebar (Filters) */}
        <aside className="glass-panel" style={{ 
          width: '280px', 
          padding: '20px',
          flexShrink: 0,
          position: 'sticky',
          top: '90px',
          height: 'fit-content'
        }}>
          <div>
            <h2 style={{ borderBottom: '3px solid var(--lego-blue)', paddingBottom: '10px', marginBottom: '20px' }}>Filters</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: 'var(--lego-dark)' }}>Category</h3>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #ddd', fontSize: '1rem' }}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: 'var(--lego-dark)' }}>Price Range (₹)</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '0.9rem', color: 'var(--lego-dark)', fontWeight: 'bold' }}>Min Price</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                    <input 
                      type="range" 
                      min="0" 
                      max={maxProductPrice} 
                      value={minPrice === '' ? 0 : minPrice} 
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      style={{ flex: 1 }}
                    />
                    <input 
                      type="number" 
                      placeholder="0"
                      value={minPrice} 
                      onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.9rem', color: 'var(--lego-dark)', fontWeight: 'bold' }}>Max Price</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                    <input 
                      type="range" 
                      min="0" 
                      max={maxProductPrice} 
                      value={maxPrice === '' ? maxProductPrice : maxPrice} 
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      style={{ flex: 1 }}
                    />
                    <input 
                      type="number" 
                      placeholder={maxProductPrice.toString()}
                      value={maxPrice} 
                      onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              className="btn-lego" 
              style={{ width: '100%' }}
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setMinPrice(''); setMaxPrice(''); }}
            >
              Reset Filters
            </button>
          </div>
        </aside>

        {/* Product Grid */}
        <main style={{ flex: 1 }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: 'var(--lego-dark)' }}>Showing {filteredProducts.length} Sets</h2>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '20px' 
          }}>
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                className="glass-panel"
                onClick={() => setSelectedProduct(product)}
                style={{ 
                  padding: '15px', 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'; }}
              >
                <div style={{ 
                  height: '220px', 
                  backgroundColor: '#fff', 
                  borderRadius: '8px', 
                  marginBottom: '15px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                  padding: '10px'
                }}>
                  <img 
                    src={product.imageLinks[0] || 'https://via.placeholder.com/220?text=No+Image'} 
                    alt={product.name} 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/220?text=Image+Not+Found'; }}
                  />
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ color: 'var(--lego-blue)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>
                    {product.category}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 10px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.name}
                  </h3>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      {product.price > 0 ? (
                        product.discountedPrice > 0 ? (
                          <>
                            <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9rem' }}>₹{product.price}</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--lego-red)' }}>₹{product.discountedPrice}</div>
                          </>
                        ) : (
                          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--lego-dark)' }}>₹{product.price}</div>
                        )
                      ) : (
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--lego-dark)', fontStyle: 'italic' }}>Price on Request</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredProducts.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#666' }}>
                <Blocks size={64} color="#ccc" style={{ marginBottom: '20px' }} />
                <h3>No sets found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          padding: '20px'
        }} onClick={() => setSelectedProduct(null)}>
          <div 
            className="animate-pop-in glass-panel"
            style={{ 
              backgroundColor: 'white',
              width: '100%', 
              maxWidth: '900px', 
              maxHeight: '90vh',
              overflow: 'auto',
              display: 'flex', 
              flexDirection: 'column',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedProduct(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={28} color="#333" />
            </button>
            
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {/* Image Gallery Side */}
              <div style={{ flex: '1 1 400px', backgroundColor: '#f9f9f9', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img 
                  src={selectedProduct.imageLinks[0] || 'https://via.placeholder.com/400?text=No+Image'} 
                  alt={selectedProduct.name}
                  style={{ width: '100%', maxWidth: '400px', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400?text=Image+Not+Found'; }}
                />
                
                {selectedProduct.imageLinks.length > 1 && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px', overflowX: 'auto', width: '100%', paddingBottom: '10px' }}>
                    {selectedProduct.imageLinks.slice(1, 5).map((img, idx) => (
                      <img key={idx} src={img} alt={`Thumbnail ${idx}`} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: '2px solid #ddd' }} />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Details Side */}
              <div style={{ flex: '1 1 400px', padding: '40px 30px' }}>
                <div style={{ color: 'var(--lego-blue)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>
                  {selectedProduct.category}
                </div>
                
                <h2 style={{ fontSize: '2rem', marginBottom: '20px', lineHeight: 1.2 }}>{selectedProduct.name}</h2>
                
                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f0f0f0', padding: '8px 15px', borderRadius: '20px' }}>
                    <Tag size={18} color="var(--lego-red)" />
                    <span style={{ fontWeight: 'bold' }}>SKU: {selectedProduct.sku}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f0f0f0', padding: '8px 15px', borderRadius: '20px' }}>
                    <Package size={18} color="var(--lego-blue)" />
                    <span style={{ fontWeight: 'bold' }}>{selectedProduct.pieces} Pieces</span>
                  </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                  {selectedProduct.price > 0 ? (
                    selectedProduct.discountedPrice > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--lego-red)' }}>₹{selectedProduct.discountedPrice}</span>
                        <span style={{ fontSize: '1.2rem', textDecoration: 'line-through', color: '#999' }}>₹{selectedProduct.price}</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--lego-dark)' }}>₹{selectedProduct.price}</div>
                    )
                  ) : (
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--lego-dark)', fontStyle: 'italic' }}>Price on Request</div>
                  )}
                </div>

                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ marginBottom: '10px', fontSize: '1.2rem' }}>About this set</h3>
                  <div 
                    style={{ lineHeight: 1.6, color: '#555' }}
                    dangerouslySetInnerHTML={{ __html: selectedProduct.description }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
