"use client";

import { useEffect, useState } from "react";
import { fetcher } from "@/lib/fetcher";

export default function TransactionPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [methods, setMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const productRes = await fetcher("/api/products");
    const methodRes = await fetcher("/api/payment-methods");

    setProducts(productRes);
    setMethods(methodRes);

    if (methodRes.length > 0) {
      setSelectedMethod(methodRes[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🛒 ADD TO CART (cek stock)
  const addToCart = (product: any) => {
    const exist = cart.find((c) => c.id === product.id);

    if (exist) {
      if (exist.qty >= product.stock) {
        alert("Stock habis!");
        return;
      }

      setCart(
        cart.map((c) =>
          c.id === product.id ? { ...c, qty: c.qty + 1 } : c
        )
      );
    } else {
      if (product.stock <= 0) {
        alert("Stock habis!");
        return;
      }

      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  // ❌ REMOVE ITEM
  const removeItem = (id: string) => {
    setCart(cart.filter((c) => c.id !== id));
  };

  // ➕➖ UPDATE QTY
  const updateQty = (id: string, delta: number) => {
    setCart(
      cart
        .map((c) => {
          if (c.id === id) {
            const newQty = c.qty + delta;

            if (newQty <= 0) return null;
            if (newQty > c.stock) return c;

            return { ...c, qty: newQty };
          }
          return c;
        })
        .filter(Boolean)
    );
  };

  // 💰 CALCULATION
  const total = cart.reduce(
    (acc, item) => acc + item.priceSell * item.qty,
    0
  );

  const profit = cart.reduce(
    (acc, item) =>
      acc + (item.priceSell - item.priceCost) * item.qty,
    0
  );

  const sharing = profit * 0.05;

  // 💳 CHECKOUT
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart kosong!");
      return;
    }

    if (!selectedMethod) {
      alert("Pilih metode pembayaran!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          items: cart.map((c) => ({
            productId: c.id,
            quantity: c.qty,
          })),
          paymentMethodId: selectedMethod,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        alert(result.message);
        return;
      }

      // 🔥 RESET TANPA RELOAD
      setCart([]);

      // 🔥 REFRESH PRODUCT (stock update)
      await loadData();

      alert("Transaction success!");
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 grid grid-cols-2 gap-6">
      {/* PRODUCT */}
      <div>
        <h2 className="font-bold mb-4">Products</h2>

        <div className="grid grid-cols-2 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-white p-3 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
            >
              <p className="font-semibold">{p.name}</p>
              <p>Rp {p.priceSell.toLocaleString()}</p>
              <p className="text-sm text-gray-500">
                Stock: {p.stock}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CART */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-bold mb-4">Cart</h2>

        {cart.length === 0 ? (
          <p>Empty</p>
        ) : (
          <>
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center mb-2"
              >
                <div>
                  <p className="font-medium">{item.name}</p>

                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="px-2 bg-gray-200"
                    >
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="px-2 bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p>
                    Rp{" "}
                    {(item.priceSell * item.qty).toLocaleString()}
                  </p>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 text-sm"
                  >
                    remove
                  </button>
                </div>
              </div>
            ))}

            <hr className="my-3" />

            <p>Total: Rp {total.toLocaleString()}</p>
            <p>Profit: Rp {profit.toLocaleString()}</p>
            <p>Sharing (5%): Rp {sharing.toLocaleString()}</p>

            {/* 💳 PAYMENT */}
            <div className="mt-4">
              <p className="mb-1">Payment Method</p>
              <select
                value={selectedMethod}
                onChange={(e) =>
                  setSelectedMethod(e.target.value)
                }
                className="border p-2 w-full"
              >
                {methods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-4 w-full bg-black text-white py-2 rounded disabled:opacity-50"
            >
              {loading ? "Processing..." : "Checkout"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}