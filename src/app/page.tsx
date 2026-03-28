"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<any>(null);

  const fetchDashboard = async () => {
    const res = await fetch("/api/dashboard");
    const json = await res.json();
    setData(json.data);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Dashboard
      </h1>

      {!data ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Card title="Income" value={data.income} />
          <Card title="Profit" value={data.profit} />
          <Card title="Expense" value={data.expense} />
          <Card title="Balance" value={data.balance} />
        </div>
      )}
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="p-4 border rounded-xl shadow">
      <h2 className="text-sm text-gray-500">{title}</h2>
      <p className="text-xl font-bold">
        Rp {value.toLocaleString()}
      </p>
    </div>
  );
}