"use client";

import { useEffect, useState } from "react";
import { fetcher } from "@/lib/fetcher";

export default function ExpensePage() {
  const [data, setData] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    const res = await fetcher("/api/expenses");
    setData(res);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async () => {
    if (!amount) return;

    await fetch("/api/expenses", {
      method: "POST",
      body: JSON.stringify({
        amount: Number(amount),
        description,
      }),
    });

    setAmount("");
    setDescription("");
    load();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Expenses
          </h1>
          <p className="text-sm text-gray-500">
            Track your spending
          </p>
        </div>

        {/* FORM */}
        <div className="bg-white p-6 rounded-2xl shadow space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Add Expense
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
            />

            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="bg-red-500 hover:bg-red-600 transition text-white px-5 py-2 rounded-lg"
          >
            Add Expense
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {data.map((e) => (
                <tr
                  key={e.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3">
                    {new Date(e.date).toLocaleString()}
                  </td>
                  <td className="p-3">
                    {e.description || "-"}
                  </td>
                  <td className="p-3 text-right font-medium">
                    Rp {e.amount.toLocaleString()}
                  </td>
                </tr>
              ))}

              {data.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="p-6 text-center text-gray-400"
                  >
                    No expense yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}