"use client";

import { useEffect, useState } from "react";
import { fetcher } from "@/lib/fetcher";

export default function HistoryPage() {
  const [data, setData] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [methodFilter, setMethodFilter] = useState("");
  const [methods, setMethods] = useState<any[]>([]);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);

    const res = await fetcher("/api/transactions");
    const methodRes = await fetcher("/api/payment-methods");

    setData(res);
    setFiltered(res);
    setMethods(methodRes);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🔍 FILTER
  useEffect(() => {
    let temp = [...data];

    if (methodFilter) {
      temp = temp.filter(
        (trx) => trx.paymentMethodId === methodFilter
      );
    }

    setFiltered(temp);
  }, [methodFilter, data]);

  // ❌ DELETE (FIXED)
  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Hapus transaksi ini?");
    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
        credentials: "include", // 🔥 WAJIB
      });

      const result = await res.json();

      if (!res.ok) {
        console.error(result);
        alert(result.error || "Gagal hapus");
        return;
      }

      await loadData();
    } catch (err) {
      console.error(err);
      alert("Terjadi error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        Transaction History
      </h1>

      {/* FILTER */}
      <div className="mb-4 flex gap-4">
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="border p-2"
        >
          <option value="">All Payment</option>
          {methods.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Items</th>
                <th className="p-2">Total</th>
                <th className="p-2">Profit</th>
                <th className="p-2">Payment</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((trx) => (
                <tr key={trx.id} className="border-t">
                  <td className="p-2">
                    {new Date(trx.date).toLocaleString()}
                  </td>

                  <td className="p-2">
                    {trx.items.map((i: any) => (
                      <div key={i.id}>
                        {i.product?.name} x{i.quantity}
                      </div>
                    ))}
                  </td>

                  <td className="p-2 text-center">
                    Rp {trx.totalAmount.toLocaleString()}
                  </td>

                  <td className="p-2 text-center">
                    Rp {trx.totalProfit.toLocaleString()}
                  </td>

                  <td className="p-2 text-center">
                    {trx.paymentMethod?.name || "-"}
                  </td>

                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleDelete(trx.id)}
                      disabled={deletingId === trx.id}
                      className="text-red-500"
                    >
                      {deletingId === trx.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center p-4 text-gray-500"
                  >
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}