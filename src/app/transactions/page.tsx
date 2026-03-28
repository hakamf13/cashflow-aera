"use client";

import { useEffect, useState } from "react";

export default function TransactionPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState("");

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const json = await res.json();
    if (json.success) setProducts(json.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1 }]);
  };

  const updateItem = (index: number, key: string, value: any) => {
    const newItems = [...items];
    newItems[index][key] = value;
    setItems(newItems);
  };

  const getTotal = () => {
    let total = 0;

    for (const item of items) {
      const product = products.find(
        (p) => p.id === item.productId
      );
      if (product) {
        total += product.priceSell * item.quantity;
      }
    }

    return total;
  };

  const handleSubmit = async () => {
    await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items,
        paymentMethodId: "cash",
      }),
    });

    setItems([]);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Transaction
      </h1>

      <button
        onClick={addItem}
        className="bg-green-500 text-white px-4 py-2 mb-4 rounded"
      >
        + Add Item
      </button>

      {items.map((item, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <select
            value={item.productId}
            onChange={(e) =>
              updateItem(index, "productId", e.target.value)
            }
            className="border p-2"
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={item.quantity}
            onChange={(e) =>
              updateItem(index, "quantity", Number(e.target.value))
            }
            className="border p-2 w-20"
          />
        </div>
      ))}

      <div className="mt-4">
        <p className="font-bold">
          Total: Rp {getTotal().toLocaleString()}
        </p>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Submit Transaction
      </button>
    </div>
  );
}