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
import ProtectedRoute from '@/components/ProtectedRoute'
import BrandRoute from '@/components/BrandRoute'

const base = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <BrowserRouter basename={base}>
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
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}
