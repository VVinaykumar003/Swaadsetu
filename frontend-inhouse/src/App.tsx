// App.tsx
import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SwaadsetuLanding from "./pages/webpage/pages/swaadsetu-landing";
// import MenuScreenShoot from "./pages/webpage/component/MenuScreenShot";
import  About  from "./pages/webpage/pages/About";
import TabbedCarouselLayout from "./pages/webpage/pages/Features";
import BlogsPage from "./pages/webpage/pages/Blogs";
// Lazy load main pages
const Landing = lazy(() => import("./pages/HomePage"));

// Login Pages
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const StaffLogin = lazy(() => import("./pages/StaffLogin"));

// Dashboards
const AdminDashboard = lazy(
  () => import("./pages/AdminDashboard/AdminDashboard")
);
const StaffDashboard = lazy(
  () => import("./pages/StaffDashboard/StaffDashboard")
);

// Admin Subpages
const MenuManagement = lazy(
  () => import("./pages/AdminDashboard/components/Layout/MenuPage")
);
const OrdersManagement = lazy(
  () => import("./pages/AdminDashboard/components/Layout/OrderPage")
);
const TableManagementPage = lazy(
  () => import("./pages/AdminDashboard/components/Layout/TableManagement")
);
const CreateMenu = lazy(
  () => import("./pages/AdminDashboard/components/Layout/CreateMenu")
);
const EditMenu = lazy(
  () => import("./pages/AdminDashboard/components/Layout/EditMenu")
);

// Loader
const LoadingScreen = () => (
  <div className="w-full h-screen flex items-center justify-center text-lg font-semibold text-gray-600">
    Loading...
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/home" element={<Landing />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/staff-login" element={<StaffLogin />} />

        {/* 🧭 Admin Routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/menu" element={<MenuManagement />} />
        <Route path="/menu/create" element={<CreateMenu />} />
        <Route path="/menu/edit" element={<EditMenu />} />
        <Route path="/orders" element={<OrdersManagement />} />
        <Route path="/tables" element={<TableManagementPage />} />

        {/* wbe Page  */}

      

   
      
          <Route path="/" element={<SwaadsetuLanding />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<TabbedCarouselLayout/>} />
          <Route path="/blogs" element={<BlogsPage/>} />
       
      
      

        {/* 👨‍🍳 Staff Routes */}
        <Route path="/staff-dashboard" element={<StaffDashboard />} />

        {/* 🚧 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
