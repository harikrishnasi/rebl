import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LandingPage from '@/pages/LandingPage'
import AuthPage from '@/pages/AuthPage'
import BrandSignup from '@/pages/BrandSignup'
import CollectorProfile from '@/pages/CollectorProfile'
import Vault from '@/pages/Vault'
import AddItem from '@/pages/AddItem'
import Dashboard from '@/pages/Dashboard'
import TribePage from '@/pages/TribePage'
import BrandPage from '@/pages/BrandPage'
import BrandDashboard from '@/pages/BrandDashboard'
import BrandSubdomainPage from '@/pages/BrandSubdomainPage'
import PostPurchase from '@/pages/PostPurchase'
import Blog from '@/pages/Blog'
import BlogPost from '@/pages/BlogPost'
import About from '@/pages/About'
import Privacy from '@/pages/Privacy'
import Terms from '@/pages/Terms'
import Demo from '@/pages/Demo'
import NotFound from '@/pages/not-found'
import DropsHome from '@/pages/drops/DropsHome'
import ProductPage from '@/pages/drops/ProductPage'
import Checkout from '@/pages/drops/Checkout'
import BrandsLanding from '@/pages/brands/BrandsLanding'
import BrandCreate from '@/pages/brands/BrandCreate'
import BrandSupport from '@/pages/BrandSupport'
import Waitlist from '@/pages/Waitlist'
import ProtectedRoute from '@/components/ProtectedRoute'
import BrandRoute from '@/components/BrandRoute'
import CartDrawer from '@/components/CartDrawer'
import ScrollToTop from '@/components/ScrollToTop'
import { CartProvider } from '@/context/CartContext'

const base = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter basename={base}>
        <ScrollToTop />
        <CartDrawer />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/brand/signup" element={<BrandSignup />} />
          <Route path="/profile/:username" element={<CollectorProfile />} />
          <Route path="/vault/:username" element={<Vault />} />
          <Route path="/brand/:slug" element={<BrandPage />} />
          <Route path="/s/:brandSlug" element={<BrandSubdomainPage />} />
          <Route path="/post-purchase/:id" element={<PostPurchase />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/drops" element={<DropsHome />} />
          <Route path="/drops/product/:productId" element={<ProductPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/brands" element={<BrandsLanding />} />
          <Route path="/brand/create" element={<BrandCreate />} />
          <Route path="/brand-support" element={<BrandSupport />} />
          <Route path="/waitlist" element={<Waitlist />} />
          <Route
            path="/add-item"
            element={
              <ProtectedRoute>
                <AddItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tribe"
            element={
              <ProtectedRoute>
                <TribePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brand-dashboard"
            element={
              <BrandRoute>
                <BrandDashboard />
              </BrandRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </CartProvider>
  )
}
