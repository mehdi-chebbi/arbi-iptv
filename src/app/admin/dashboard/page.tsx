'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Store,
  BarChart3,
  Users,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface Order {
  id: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: any[];
  total: number;
  date: string;
  status: string;
}

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  topProducts: { name: string; quantity: number }[];
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'telecommandes',
    price: 0,
    stock: 0,
    image: '',
    featured: false
  });

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      router.push('/admin');
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [productsRes, ordersRes, statsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/stats')
      ]);

      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();
      const statsData = await statsRes.json();

      setProducts(productsData);
      setOrders(ordersData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    router.push('/');
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      category: 'telecommandes',
      price: 0,
      stock: 0,
      image: '',
      featured: false
    });
    setIsProductDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image: product.image,
      featured: product.featured
    });
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    try {
      const url = editingProduct 
        ? `/api/products/${editingProduct.id}`
        : '/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productForm),
      });

      if (response.ok) {
        setIsProductDialogOpen(false);
        loadData();
      } else {
        alert('Erreur lors de la sauvegarde du produit');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde du produit');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadData();
      } else {
        alert('Erreur lors de la suppression du produit');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du produit');
    }
  };

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        loadData();
      } else {
        alert('Erreur lors de la mise à jour de la commande');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour de la commande');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Store className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Administration
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
                Boutique
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Commandes</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} TND</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produits Populaires</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {stats.topProducts.length > 0 ? stats.topProducts[0].name : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="products" className="text-xs sm:text-sm py-2 px-1">Produits</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs sm:text-sm py-2 px-1">Commandes</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm py-2 px-1">Analytiques</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold">Gestion des Produits</h2>
              <Button onClick={handleAddProduct} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            </div>
            
            <div className="grid gap-4">
              {products.map(product => (
                <Card key={product.id}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm sm:text-base">{product.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{product.description}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-xs sm:text-sm font-medium">{product.price.toFixed(2)} TND</span>
                            <Badge variant={product.stock > 10 ? 'default' : 'secondary'} className="text-xs">
                              Stock: {product.stock}
                            </Badge>
                            <Badge variant={product.featured ? 'default' : 'outline'} className="text-xs">
                              {product.featured ? 'Vedette' : 'Normal'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-xl font-semibold">Gestion des Commandes</h2>
            
            <div className="grid gap-4">
              {orders.map(order => (
                <Card key={order.id}>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-lg">Commande #{order.id}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {new Date(order.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Badge variant={order.status === 'vendue' ? 'default' : 'secondary'}>
                          {order.status === 'en attente' ? (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              En attente
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Vendue
                            </>
                          )}
                        </Badge>
                        {order.status === 'en attente' && (
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateOrderStatus(order.id, 'vendue')}
                            className="w-full sm:w-auto"
                          >
                            Marquer comme vendue
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <p><strong>Client:</strong> {order.customerInfo.name}</p>
                        <p><strong>Email:</strong> {order.customerInfo.email}</p>
                        <p><strong>Téléphone:</strong> {order.customerInfo.phone}</p>
                        <p><strong>Adresse:</strong> {order.customerInfo.address}</p>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between">
                            <span className="text-sm">{item.name} x{item.quantity}</span>
                            <span className="text-sm font-medium">{(item.price * item.quantity).toFixed(2)} TND</span>
                          </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>{order.total.toFixed(2)} TND</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <h2 className="text-xl font-semibold">Analytiques & Statistiques</h2>
            
            {stats && (
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Vue d'ensemble
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">{stats.totalProducts}</div>
                        <p className="text-sm text-gray-600">Produits au catalogue</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{stats.totalOrders}</div>
                        <p className="text-sm text-gray-600">Commandes totales</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{stats.totalRevenue.toFixed(2)} TND</div>
                        <p className="text-sm text-gray-600">Chiffre d'affaires</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {stats.topProducts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Produits les plus vendus
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stats.topProducts.map((product, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-purple-600">
                                {index + 1}
                              </div>
                              <span className="font-medium">{product.name}</span>
                            </div>
                            <Badge variant="outline">{product.quantity} vendus</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du produit</Label>
              <Input
                id="name"
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                placeholder="Nom du produit"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                placeholder="Description du produit"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select 
                value={productForm.category} 
                onValueChange={(value) => setProductForm({...productForm, category: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="telecommandes">Télécommandes</SelectItem>
                  <SelectItem value="abonnements">Abonnements IPTV</SelectItem>
                  <SelectItem value="recepteurs">Récepteurs</SelectItem>
                  <SelectItem value="accessoires">Accessoires TV & Électroniques</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Prix (TND)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({...productForm, stock: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="image">URL de l'image</Label>
              <Input
                id="image"
                value={productForm.image}
                onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={productForm.featured}
                onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                className="h-4 w-4"
              />
              <Label htmlFor="featured">Produit vedette</Label>
            </div>
            <Button onClick={handleSaveProduct} className="w-full">
              {editingProduct ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}