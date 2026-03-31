import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// 🔥 tentukan halaman yang diproteksi
export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/products",
    "/transactions",
    "/transactions/history",
    "/cashflow",
  ],
};