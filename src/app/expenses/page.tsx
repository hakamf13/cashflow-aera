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
      <h1 className="text-xl font-bold">Expenses</h1>

      {/* FORM */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          className="border p-2 w-full"
        />

        <button
          onClick={handleSubmit}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Add Expense
        </button>
      </div>

      {/* LIST */}
      <div className="bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Date</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {data.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-2">
                  {new Date(e.date).toLocaleString()}
                </td>
                <td>{e.description}</td>
                <td>
                  Rp {e.amount.toLocaleString()}
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center">
                  No expense yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}