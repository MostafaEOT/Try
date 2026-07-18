"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProductRecord {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  inStock: boolean;
}

interface OrderItem {
  quantity: number;
  unitPrice: number;
  product: { name: string; unit: string };
}

interface MaterialOrder {
  id: string;
  status: string;
  totalCost: number;
  notes: string;
  createdAt: string;
  booking: { id: string; service: string };
  worker: { id: string; name: string };
  items: OrderItem[];
}

interface ShopProfile {
  id: string;
  name: string;
  description: string;
  location: string;
  phone: string;
  specialties: string[];
  online: boolean;
}

type Tab = "orders" | "products" | "earnings" | "profile";

export default function ShopDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  const [orders, setOrders] = useState<MaterialOrder[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [shop, setShop] = useState<ShopProfile | null>(null);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", unit: "unit", category: "" });
  const [addingProduct, setAddingProduct] = useState(false);

  const [editShop, setEditShop] = useState({ name: "", description: "", location: "", phone: "" });
  const [shopSaving, setShopSaving] = useState(false);
  const [shopMsg, setShopMsg] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "shop")) router.replace("/login");
  }, [user, loading, router]);

  const fetchOrders = useCallback(async () => {
    if (!user?.shopId) return;
    const data = await fetch(`/api/material-requests?shopId=${user.shopId}`).then((r) => r.json()).catch(() => []);
    setOrders(Array.isArray(data) ? data : []);
  }, [user]);

  const fetchProducts = useCallback(async () => {
    if (!user?.shopId) return;
    const data = await fetch(`/api/products?shopId=${user.shopId}`).then((r) => r.json()).catch(() => []);
    setProducts(Array.isArray(data) ? data : []);
  }, [user]);

  const fetchShop = useCallback(async () => {
    if (!user?.shopId) return;
    const data = await fetch(`/api/shops/${user.shopId}`).then((r) => r.json()).catch(() => null);
    if (data && !data.error) {
      setShop(data);
      setEditShop({ name: data.name, description: data.description, location: data.location, phone: data.phone });
    }
  }, [user]);

  useEffect(() => {
    if (user?.shopId) {
      fetchOrders();
      fetchProducts();
      fetchShop();
    }
  }, [user, fetchOrders, fetchProducts, fetchShop]);

  const markDelivered = async (orderId: string) => {
    await fetch(`/api/material-requests/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "delivered" }),
    }).catch(() => {});
    fetchOrders();
  };

  const addProduct = async () => {
    if (!user?.shopId || !newProduct.name || !newProduct.price) return;
    setAddingProduct(true);
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newProduct, shopId: user.shopId, price: Number(newProduct.price) }),
    }).catch(() => {});
    setAddingProduct(false);
    setShowAddProduct(false);
    setNewProduct({ name: "", description: "", price: "", unit: "unit", category: "" });
    fetchProducts();
  };

  const toggleStock = async (product: ProductRecord) => {
    await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inStock: !product.inStock }),
    }).catch(() => {});
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" }).catch(() => {});
    fetchProducts();
  };

  const saveShop = async () => {
    if (!user?.shopId) return;
    setShopSaving(true);
    await fetch(`/api/shops/${user.shopId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editShop),
    }).catch(() => {});
    setShopSaving(false);
    setShopMsg("Shop profile updated!");
    setTimeout(() => setShopMsg(""), 3000);
    fetchShop();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user.shopId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Shop profile not found</h2>
          <p className="text-gray-500">Your account is not linked to a shop. Please contact support.</p>
        </div>
      </div>
    );
  }

  const incomingOrders = orders.filter((o) => o.status === "approved");
  const deliveredOrders = orders.filter((o) => o.status === "delivered");
  const totalRevenue = deliveredOrders.reduce((s, o) => s + o.totalCost, 0);

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "orders", label: "Orders", badge: incomingOrders.length || undefined },
    { key: "products", label: "Products" },
    { key: "earnings", label: "Earnings" },
    { key: "profile", label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shop Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {user.name.split(" ")[0]}!</p>
          </div>
          {shop && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold ${shop.online ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
              <span className={`w-2 h-2 rounded-full ${shop.online ? "bg-green-500" : "bg-gray-400"}`} />
              {shop.online ? "Open" : "Closed"}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Incoming Orders", value: incomingOrders.length, icon: "📦" },
            { label: "Delivered", value: deliveredOrders.length, icon: "✅" },
            { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: "💰" },
            { label: "Products Listed", value: products.length, icon: "🏷️" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === t.key ? "text-blue-600 border-b-2 border-blue-600 -mb-px" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
                {t.badge ? (
                  <span className="bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{t.badge}</span>
                ) : null}
              </button>
            ))}
          </div>

          {/* Orders */}
          {activeTab === "orders" && (
            <div className="p-5">
              {incomingOrders.length > 0 && (
                <>
                  <h3 className="font-semibold text-gray-900 mb-3">Incoming Orders</h3>
                  <div className="space-y-4 mb-6">
                    {incomingOrders.map((order) => (
                      <div key={order.id} className="border border-orange-100 rounded-xl p-4 bg-orange-50">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-900">{order.booking.service}</p>
                            <p className="text-sm text-gray-500">Worker: {order.worker.name}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">${order.totalCost.toFixed(2)}</p>
                            <button
                              onClick={() => markDelivered(order.id)}
                              className="mt-2 px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                            >
                              Mark Delivered
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-xs text-gray-600">
                              <span>{item.product.name} × {item.quantity} {item.product.unit}</span>
                              <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        {order.notes && (
                          <p className="text-xs text-gray-500 italic mt-2">&quot;{order.notes}&quot;</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {deliveredOrders.length > 0 && (
                <>
                  <h3 className="font-semibold text-gray-900 mb-3">Delivered Orders</h3>
                  <div className="space-y-3">
                    {deliveredOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{order.booking.service}</p>
                          <p className="text-xs text-gray-500">{order.worker.name} · {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-700">${order.totalCost.toFixed(2)}</p>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Delivered</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {orders.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📦</div>
                  <p className="text-gray-500">No orders yet. Add products so workers can request them.</p>
                </div>
              )}
            </div>
          )}

          {/* Products */}
          {activeTab === "products" && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Product Catalog</h3>
                <button
                  onClick={() => setShowAddProduct(!showAddProduct)}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl"
                >
                  + Add Product
                </button>
              </div>

              {showAddProduct && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">New Product</h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      placeholder="Product name *"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      placeholder="Category (e.g. Plumbing)"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Price ($) *"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      placeholder="Unit (e.g. piece, meter, kg)"
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct((p) => ({ ...p, unit: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <input
                    placeholder="Description (optional)"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addProduct}
                      disabled={addingProduct || !newProduct.name || !newProduct.price}
                      className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg"
                    >
                      {addingProduct ? "Adding..." : "Add Product"}
                    </button>
                    <button onClick={() => setShowAddProduct(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {products.length === 0 && !showAddProduct ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🏷️</div>
                  <p className="text-gray-500">No products yet. Add your first product above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {products.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                          {p.category && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.category}</span>}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {p.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>
                        {p.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{p.description}</p>}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <p className="font-bold text-gray-900 text-sm">${p.price.toFixed(2)}<span className="text-xs text-gray-400 font-normal">/{p.unit}</span></p>
                        <button
                          onClick={() => toggleStock(p)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {p.inStock ? "Mark Out" : "Mark In"}
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="text-xs text-red-500 hover:text-red-600 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Earnings */}
          {activeTab === "earnings" && (
            <div className="p-5">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}` },
                  { label: "Orders Fulfilled", value: deliveredOrders.length },
                  { label: "Avg Order Value", value: deliveredOrders.length ? `$${(totalRevenue / deliveredOrders.length).toFixed(2)}` : "–" },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Delivered Orders</h3>
              {deliveredOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No delivered orders yet.</p>
              ) : (
                <div className="space-y-2">
                  {deliveredOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{o.booking.service}</p>
                        <p className="text-xs text-gray-500">{o.worker.name} · {new Date(o.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="font-bold text-green-700">${o.totalCost.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile */}
          {activeTab === "profile" && (
            <div className="p-5 max-w-lg">
              <h3 className="font-semibold text-gray-900 mb-5">Shop Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                  <input
                    value={editShop.name}
                    onChange={(e) => setEditShop((s) => ({ ...s, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editShop.description}
                    onChange={(e) => setEditShop((s) => ({ ...s, description: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    value={editShop.location}
                    onChange={(e) => setEditShop((s) => ({ ...s, location: e.target.value }))}
                    placeholder="e.g. 123 Main St, City"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    value={editShop.phone}
                    onChange={(e) => setEditShop((s) => ({ ...s, phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Shop Status</p>
                    <p className="text-xs text-gray-500">{shop?.online ? "Currently accepting orders" : "Not accepting orders"}</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!user.shopId || !shop) return;
                      const next = !shop.online;
                      await fetch(`/api/shops/${user.shopId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ online: next }),
                      }).catch(() => {});
                      setShop({ ...shop, online: next });
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      shop?.online ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {shop?.online ? "Open" : "Closed"}
                  </button>
                </div>
                <button
                  onClick={saveShop}
                  disabled={shopSaving}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-xl transition-colors"
                >
                  {shopSaving ? "Saving..." : "Save Profile"}
                </button>
                {shopMsg && <p className="text-sm text-green-600 text-center">{shopMsg}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
