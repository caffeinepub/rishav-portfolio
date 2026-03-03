import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { ScrollProgressBar } from "./components/ScrollProgressBar";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { PortfolioPage } from "./pages/PortfolioPage";

// ─── Root layout ─────────────────────────────────────────────────────────────

function RootLayout() {
  return (
    <>
      <ScrollProgressBar />
      <Outlet />
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.1 0.005 240 / 0.9)",
            border: "1px solid oklch(0.82 0.22 193 / 0.3)",
            color: "oklch(0.92 0.01 240)",
            backdropFilter: "blur(12px)",
          },
        }}
      />
    </>
  );
}

// ─── Routes ───────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: PortfolioPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLoginPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/dashboard",
  component: AdminDashboardPage,
  beforeLoad: () => {
    // We'll handle auth guard inside the component
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  adminRoute,
  adminDashboardRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return <RouterProvider router={router} />;
}
