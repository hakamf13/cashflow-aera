"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Products", href: "/products" },
    { name: "Transaction", href: "/transactions" },
    { name: "History", href: "/transactions/history" },
    { name: "Expenses", href: "/expenses" },
  ];

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex gap-6">
      {menu.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.name}
        </Link>
      ))}

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="ml-auto bg-red-500 px-3 py-1 rounded"
      >
        Logout
      </button>
    </nav>
  );
}