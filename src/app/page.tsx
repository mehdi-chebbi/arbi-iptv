'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Plus, Minus, Trash2, Package, Star, Menu, X, Search, Filter, User, Store } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  featured: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

interface Order {
  id: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: CartItem[];
  total: number;
  date: string;
  status: string;
}

const categories = [
  { id: 'all', name: 'Tous les produits' },
  { id: 'telecommandes', name: 'Télécommandes' },
  { id: 'abonnements', name: 'Abonnements IPTV' },
  { id: 'recepteurs', name: 'Récepteurs' },
  { id: 'accessoires', name: 'Accessoires TV & Électroniques' }
];

export default function EcommerceSite() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showOrders, setShowOrders] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [showAddToCartPopup, setShowAddToCartPopup] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<string>('');
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadCart();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(Array.isArray(parsedCart) ? parsedCart : []);
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
        setCart([]);
      }
    } else {
      setCart([]);
    }
  };

  const saveCart = (cartItems: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    setCart(cartItems);
  };

  const addToCart = (product: Product) => {
    const currentCart = Array.isArray(cart) ? cart : [];
    const existingItem = currentCart.find(item => item.id === product.id);
    let newCart: CartItem[];
    
    if (existingItem) {
      newCart = currentCart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...currentCart, { ...product, quantity: 1 }];
    }
    
    saveCart(newCart);
    setLastAddedItem(product.name);
    setShowAddToCartPopup(true);
    setTimeout(() => {
      setShowAddToCartPopup(false);
    }, 3000);
  };

  const removeFromCart = (productId: number) => {
    const currentCart = Array.isArray(cart) ? cart : [];
    const newCart = currentCart.filter(item => item.id !== productId);
    saveCart(newCart);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const currentCart = Array.isArray(cart) ? cart : [];
    const newCart = currentCart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    saveCart(newCart);
  };

  const getTotalPrice = () => {
    return Array.isArray(cart) ? cart.reduce((total, item) => total + (item.price * item.quantity), 0) : 0;
  };

  const getTotalItems = () => {
    return Array.isArray(cart) ? cart.reduce((total, item) => total + item.quantity, 0) : 0;
  };

  const handleCheckout = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      alert('Veuillez remplir tous les champs du formulaire');
      return;
    }

    try {
      const order = {
        customerInfo,
        items: cart,
        total: getTotalPrice()
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (response.ok) {
        alert('Commande passée avec succès !');
        saveCart([]);
        setCustomerInfo({ name: '', email: '', phone: '', address: '' });
        setIsCheckoutOpen(false);
        loadOrders();
      } else {
        alert('Erreur lors de la passation de la commande');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la passation de la commande');
    }
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const searchedProducts = searchQuery 
    ? filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredProducts;

  const sortedProducts = [...searchedProducts].sort((a, b) => {
    if (priceFilter === 'desc') {
      return b.price - a.price;
    } else if (priceFilter === 'asc') {
      return a.price - b.price;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-glass border-b shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-purple-50 p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="animate-float">
                <h1 className="text-xl sm:text-2xl font-bold text-gradient">
                  Électronique TV
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdminLogin(true)}
                className="hidden sm:flex hover:bg-purple-50 hover:border-purple-300 transition-colors"
              >
                <User className="h-4 w-4 mr-2" />
                Admin
              </Button>
              
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="relative hover:bg-purple-50 hover:border-purple-300 transition-colors p-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {getTotalItems() > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs animate-scale-in bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md bg-glass">
                  <SheetHeader>
                    <SheetTitle className="text-gradient">Votre Panier</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    {cart.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">Votre panier est vide</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map(item => (
                          <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg bg-white/50 hover:bg-white/70 transition-colors">
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-500">{item.price.toFixed(2)} TND</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="hover:bg-red-50 hover:border-red-300"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="hover:bg-green-50 hover:border-green-300"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromCart(item.id)}
                                className="hover:bg-red-50 hover:border-red-300"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Total:</span>
                          <span className="font-bold text-lg text-gradient">{getTotalPrice().toFixed(2)} TND</span>
                        </div>
                        <Button 
                          className="w-full btn-gradient text-white border-0 animate-slide-up"
                          onClick={() => setIsCheckoutOpen(true)}
                        >
                          Finaliser la commande
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Side Menu */}
      <div className={`fixed inset-0 z-50 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
          <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Menu</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="p-4 space-y-6 overflow-y-auto h-full pb-32">
            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Catégories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category.id 
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-bold' 
                        : 'text-gray-600 hover:bg-purple-50'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Recherche</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-900">Filtrer par prix</h3>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Trier par prix" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les prix</SelectItem>
                  <SelectItem value="asc">Prix croissant</SelectItem>
                  <SelectItem value="desc">Prix décroissant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowOrders(!showOrders);
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                <Package className="h-4 w-4 mr-2" />
                Mes Commandes
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setShowAdminLogin(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start sm:hidden"
              >
                <User className="h-4 w-4 mr-2" />
                Admin
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.href = '/admin'}
                className="w-full justify-start"
              >
                <Store className="h-4 w-4 mr-2" />
                Aller à l'administration
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Cart Popup */}
      <div className={`fixed top-20 right-4 z-50 transition-all duration-300 ${showAddToCartPopup ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <Card className="bg-green-50 border-green-200 shadow-lg">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                {lastAddedItem} ajouté au panier
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsCartOpen(true);
                setShowAddToCartPopup(false);
              }}
              className="text-green-600 border-green-300 hover:bg-green-100"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 scroll-smooth">
        {showOrders ? (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-bold text-gradient">Mes Commandes</h2>
              <Button variant="outline" onClick={() => setShowOrders(false)} className="hover:bg-purple-50">
                Retour à la boutique
              </Button>
            </div>
            
            {orders.length === 0 ? (
              <Card className="bg-glass">
                <CardContent className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Vous n'avez pas encore de commandes</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {orders.map((order, index) => (
                  <Card key={order.id} className="bg-glass card-hover animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Commande #{order.id}</CardTitle>
                          <p className="text-sm text-gray-500">
                            {new Date(order.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <Badge variant={order.status === 'vendue' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p><strong>Client:</strong> {order.customerInfo.name}</p>
                        <p><strong>Email:</strong> {order.customerInfo.email}</p>
                        <p><strong>Téléphone:</strong> {order.customerInfo.phone}</p>
                        <p><strong>Adresse:</strong> {order.customerInfo.address}</p>
                        <Separator />
                        <div className="space-y-2">
                          {order.items.map(item => (
                            <div key={item.id} className="flex justify-between">
                              <span>{item.name} x{item.quantity}</span>
                              <span>{(item.price * item.quantity).toFixed(2)} TND</span>
                            </div>
                          ))}
                          <Separator />
                          <div className="flex justify-between font-bold">
                            <span>Total:</span>
                            <span className="text-gradient">{order.total.toFixed(2)} TND</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-glass p-4 rounded-lg">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Trier par prix" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les prix</SelectItem>
                    <SelectItem value="asc">Prix croissant</SelectItem>
                    <SelectItem value="desc">Prix décroissant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Featured Products */}
            {selectedCategory === 'all' && sortedProducts.filter(product => product.featured).length > 0 && (
              <section className="animate-fade-in">
                <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center">
                  <Star className="h-6 w-6 mr-2 text-yellow-500 animate-float" />
                  Produits Vedettes
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {sortedProducts.filter(product => product.featured).map((product, index) => (
                    <div key={product.id} style={{ animationDelay: `${index * 0.1}s` }}>
                      <ProductCard product={product} onAddToCart={addToCart} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* All Products */}
            <section className="animate-fade-in">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">
                {categories.find(c => c.id === selectedCategory)?.name}
                {searchQuery && ` (${sortedProducts.length} résultat${sortedProducts.length > 1 ? 's' : ''})`}
              </h2>
              {sortedProducts.length === 0 ? (
                <Card className="bg-glass">
                  <CardContent className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Aucun produit trouvé</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {sortedProducts.map((product, index) => (
                    <div key={product.id} style={{ animationDelay: `${index * 0.1}s` }}>
                      <ProductCard product={product} onAddToCart={addToCart} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border shadow-xl">
          <DialogHeader>
            <DialogTitle>Finaliser la commande</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                placeholder="Votre nom"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                placeholder="+216 XX XXX XXX"
              />
            </div>
            <div>
              <Label htmlFor="address">Adresse de livraison</Label>
              <Textarea
                id="address"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                placeholder="Votre adresse complète"
                rows={3}
              />
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total à payer:</span>
              <span className="font-bold text-lg">{getTotalPrice().toFixed(2)} TND</span>
            </div>
            <Button onClick={handleCheckout} className="w-full">
              Confirmer la commande
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Login Dialog */}
      <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border shadow-xl">
          <DialogHeader>
            <DialogTitle>Connexion Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-username">Nom d'utilisateur</Label>
              <Input
                id="admin-username"
                type="text"
                placeholder="admin"
                defaultValue="admin"
              />
            </div>
            <div>
              <Label htmlFor="admin-password">Mot de passe</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                defaultValue="arbi2025"
              />
            </div>
            <Button 
              onClick={() => {
                window.location.href = '/admin';
              }}
              className="w-full"
            >
              Se connecter
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowAdminLogin(false)}
              className="w-full"
            >
              Annuler
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (product: Product) => void }) {
  return (
    <Card className="group card-hover overflow-hidden animate-fade-in bg-white/95 backdrop-blur-sm">
      <div className="aspect-square overflow-hidden relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.featured && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <Star className="h-3 w-3 mr-1" />
              Vedette
            </Badge>
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1 group-hover:text-purple-600 transition-colors">
          {product.name}
        </CardTitle>
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-gradient">{product.price.toFixed(2)} TND</span>
          <Badge 
            variant={product.stock > 10 ? 'default' : 'secondary'}
            className={product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
          >
            {product.stock > 10 ? '✓ En stock' : `⚠ Plus que ${product.stock}`}
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onAddToCart(product)}
          className="w-full btn-gradient text-white border-0"
          disabled={product.stock === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
        </Button>
      </CardFooter>
    </Card>
  );
}