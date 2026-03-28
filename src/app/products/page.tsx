"use client";

import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    priceSell: "",
    priceCost: "",
    stock: "",
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const json = await res.json();

      if (json.success) {
        setProducts(json.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          priceSell: Number(form.priceSell),
          priceCost: Number(form.priceCost),
          stock: Number(form.stock),
        }),
      });

      setForm({
        name: "",
        priceSell: "",
        priceCost: "",
        stock: "",
      });

      fetchProducts();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Products
      </h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 space-y-2"
      >
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          className="border p-2 rounded w-full"
        />

        <input
          placeholder="Price Sell"
          value={form.priceSell}
          onChange={(e) =>
            setForm({ ...form, priceSell: e.target.value })
          }
          className="border p-2 rounded w-full"
        />

        <input
          placeholder="Price Cost"
          value={form.priceCost}
          onChange={(e) =>
            setForm({ ...form, priceCost: e.target.value })
          }
          className="border p-2 rounded w-full"
        />

        <input
          placeholder="Stock"
          value={form.stock}
          onChange={(e) =>
            setForm({ ...form, stock: e.target.value })
          }
          className="border p-2 rounded w-full"
        />

        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Product
        </button>
      </form>

      {/* TABLE */}
      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th>Name</th>
            <th>Sell</th>
            <th>Cost</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center p-4">
                No data
              </td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p.id} className="text-center border-b">
                <td>{p.name}</td>
                <td>Rp {p.priceSell?.toLocaleString()}</td>
                <td>Rp {p.priceCost?.toLocaleString()}</td>
                <td>{p.stock}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}