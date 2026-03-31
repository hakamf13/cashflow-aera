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
    fetcher("/api/dashboard").then(setData);
  }, []);

  if (!data) return <p className="p-6">Loading...</p>;

  const chartData = [
    { name: "Income", value: data.income },
    { name: "Expense", value: data.expense },
    { name: "Profit", value: data.profit },
    { name: "Sharing", value: data.sharing },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Dashboard
      </h1>

      {/* CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card title="Income" value={data.income} />
        <Card title="Expense" value={data.expense} />
        <Card title="Profit" value={data.profit} />
        <Card title="Sharing (5%)" value={data.sharing} />
        <Card title="Net Profit" value={data.netProfit} />
      </div>

      {/* CHART */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="mb-4 font-semibold text-gray-700">
          Financial Overview
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-lg font-bold text-gray-800">
        Rp {value.toLocaleString()}
      </h2>
    </div>
  );
}