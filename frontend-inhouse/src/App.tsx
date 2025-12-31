// App.tsx
import { Suspense, lazy } from "react";
import { Navigate, Route, Routes} from "react-router-dom";
import SwaadsetuLanding from "./pages/webpage/pages/swaadsetu-landing";
import About from "./pages/webpage/pages/About";
import TabbedCarouselLayout from "./pages/webpage/pages/Features";
import BlogsPage from "./pages/webpage/pages/Blogs";
import FAQ from "./pages/webpage/pages/FAQ";
import NewSection from "./pages/webpage/pages/NewSection";
import PrivatePolicy from "./pages/webpage/pages/PrivatePolicy";
 

// Lazy pages
const Landing = lazy(() => import("./pages/HomePage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const StaffLogin = lazy(() => import("./pages/StaffLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard/AdminDashboard"));
const StaffDashboard = lazy(() => import("./pages/StaffDashboard/StaffDashboard"));
const MenuManagement = lazy(() => import("./pages/AdminDashboard/components/Layout/MenuPage"));
const OrdersManagement = lazy(() => import("./pages/AdminDashboard/components/Layout/OrderPage"));
const TableManagementPage = lazy(() => import("./pages/AdminDashboard/components/Layout/TableManagement"));
const CreateMenu = lazy(() => import("./pages/AdminDashboard/components/Layout/CreateMenu"));
const EditMenu = lazy(() => import("./pages/AdminDashboard/components/Layout/EditMenu"));

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
          <Route path="/" element={<SwaadsetuLanding />} />
          <Route path="/home" element={<Landing />} />  
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<TabbedCarouselLayout />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/faq" element ={<FAQ/>}/>
          <Route path="/hero" element={<NewSection/>}/>
          <Route path="/termsandcondition" element={<PrivatePolicy/>}/>
          
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/staff-login" element={<StaffLogin />} />

          {/* 🧭 Admin Routes */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/menu" element={<MenuManagement />} />
          <Route path="/menu/create" element={<CreateMenu/>} />
          <Route path="/menu/edit" element={<EditMenu />} />
          <Route path="/orders" element={<OrdersManagement />} />
          <Route path="/tables" element={<TableManagementPage />} />

          {/* 👨‍🍳 Staff Routes */}
          <Route path="/staff-dashboard" element={<StaffDashboard />} />

          {/* 🚧 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
  );
}

export default App;
