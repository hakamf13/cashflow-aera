"use client";

import { useEffect, useState } from "react";
import { fetcher } from "@/lib/fetcher";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
  fetcher("/api/dashboard").then((res) => {
    if (res.success) {
      setData(res.data);
    }
  });
}, []);

  if (!data) return <p className="p-6">Loading...</p>;

  const chartData = [
    { name: "Income", value: data.income || 0 },
    { name: "Expense", value: data.expense || 0 },
    { name: "Profit", value: data.profit || 0 },
    { name: "Sharing", value: data.sharing || 0 },
  ];

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID").format(num);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Dashboard
      </h1>

      {/* 🔥 TODAY SUMMARY */}
      <div className="grid grid-cols-3 gap-4">
        <Card title="Revenue Today" value={data.totalRevenue} />
        <Card title="Profit Today" value={data.totalProfit} />
        <Card
          title="Transactions Today"
          value={data.totalTransactions}
          isNumber
        />
      </div>

      {/* 🔥 FINANCIAL */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card title="Income" value={data.income} />
        <Card title="Expense" value={data.expense} />
        <Card title="Profit" value={data.profit} />
        <Card title="Sharing (5%)" value={data.sharing} />
        <Card title="Net Profit" value={data.netProfit} />
      </div>

      {/* 🔥 CHART */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="mb-4 font-semibold text-gray-700">
          Financial Overview
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <Tooltip />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Card({ title, value, isNumber = false }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-lg font-bold text-gray-800">
        {isNumber
          ? value || 0
          : `Rp ${(value || 0).toLocaleString()}`}
      </h2>
    </div>
  );
}