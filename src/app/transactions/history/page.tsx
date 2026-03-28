"use client";

import { useEffect, useState } from "react";

export default function TransactionHistory() {
  const [data, setData] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  const fetchData = async () => {
    let url = "/api/transactions";

    if (filter === "today") {
        const today = new Date();
        const start = new Date(today.setHours(0, 0, 0, 0));
        const end = new Date(today.setHours(23, 59, 59, 999));

        url += `?start=${start.toISOString()}&end=${end.toISOString()}`;
    }

    if (filter === "month") {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date();

        url += `?start=${start.toISOString()}&end=${end.toISOString()}`;
    }

    const res = await fetch(url);
    const json = await res.json();

    if (json.success) {
        setData(json.data);
    }
    };

    useEffect(() => {
    fetchData();
    }, [filter]);

    const getQueryParams = () => {
        if (filter === "today") {
            const today = new Date();
            const start = new Date(today.setHours(0, 0, 0, 0));
            const end = new Date(today.setHours(23, 59, 59, 999));

            return `?start=${start.toISOString()}&end=${end.toISOString()}`;
        }

        if (filter === "month") {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date();

            return `?start=${start.toISOString()}&end=${end.toISOString()}`;
        }

        return "";
        };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Transaction History
      </h1>

      {/* 🔥 TARUH DI SINI */}

    <div className="flex gap-2 mb-4">
        <button
            onClick={() => setFilter("all")}
            className="bg-gray-500 text-white px-3 py-1 rounded"
        >
            All
        </button>

        <button
            onClick={() => setFilter("today")}
            className="bg-blue-500 text-white px-3 py-1 rounded"
        >
            Today
        </button>

        <button
            onClick={() => setFilter("month")}
            className="bg-purple-500 text-white px-3 py-1 rounded"
        >
            This Month
        </button>
    </div>
        <button
            onClick={() =>
                window.open(
                "/api/export/transactions" + getQueryParams(),
                "_blank"
                )
            }
            className="mb-4 bg-green-600 text-white px-4 py-2 rounded"
            >
            Download Excel
        </button>

        <button
            onClick={() =>
                window.open(
                "/api/export/transactions-pdf" + getQueryParams(),
                "_blank"
                )
            }
            className="mb-4 ml-2 bg-red-600 text-white px-4 py-2 rounded"
            >
            Download PDF
        </button>

      {data.length === 0 ? (
        <p>No data</p>
      ) : (
        data.map((trx) => (
          <div
            key={trx.id}
            className="border p-4 rounded mb-4"
          >
            <div className="flex justify-between">
              <div>
                <p className="font-bold">
                  Rp {trx.totalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Profit: Rp{" "}
                  {trx.totalProfit.toLocaleString()}
                </p>
              </div>

              <div className="text-sm text-gray-400">
                {new Date(trx.date).toLocaleString()}
              </div>
            </div>

            <div className="mt-3">
              {trx.items.map((item: any) => (
                <div
                  key={item.id}
                  className="text-sm flex justify-between"
                >
                  <span>
                    {item.product.name} x {item.quantity}
                  </span>
                  <span>
                    Rp {item.subtotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}