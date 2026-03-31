"use client";

import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [priceSell, setPriceSell] = useState("");
  const [priceCost, setPriceCost] = useState("");
  const [stock, setStock] = useState("");

  const fetchProducts = async () => {
    const res = await fetch("/api/products", {
      headers: {
        "x-user-id": localStorage.getItem("userId") || "",
      },
    });

    const json = await res.json();

    if (json.success) {
      setProducts(json.data);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = async () => {
    await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": localStorage.getItem("userId") || "",
      },
      body: JSON.stringify({
        name,
        priceSell: Number(priceSell),
        priceCost: Number(priceCost),
        stock: Number(stock),
      }),
    });

    setName("");
    setPriceSell("");
    setPriceCost("");
    setStock("");

    fetchProducts();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      {/* FORM */}
      <div className="mb-6 space-y-2">
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          placeholder="Price Sell"
          value={priceSell}
          onChange={(e) => setPriceSell(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          placeholder="Price Cost"
          value={priceCost}
          onChange={(e) => setPriceCost(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="border p-2 w-full"
        />

        <button
          onClick={handleAdd}
          className="bg-black text-white px-4 py-2"
        >
          Add Product
        </button>
      </div>

      {/* LIST */}
      {products.length === 0 ? (
        <p>No products</p>
      ) : (
        products.map((p) => (
          <div
            key={p.id}
            className="border p-3 mb-2 rounded"
          >
            <p className="font-bold">{p.name}</p>
            <p>Stock: {p.stock}</p>
            <p>Sell: Rp {p.priceSell}</p>
          </div>
        ))
      )}
    </div>
  );
}