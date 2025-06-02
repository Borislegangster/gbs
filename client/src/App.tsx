import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"
import { Header } from "./components/Header"
import { Footer } from "./components/Footer"
import { Home } from "./pages/Home"
import { About } from "./pages/About"
import { Services } from "./pages/Services"
import { ServiceDetail } from "./pages/ServiceDetail"
import { Projects } from "./pages/Projects"
import { ProjectDetail } from "./pages/ProjectDetail"
import { Blog } from "./pages/Blog"
import { BlogPost } from "./pages/BlogPost"
import { Contact } from "./pages/Contact"
import { FAQ } from "./pages/FAQ"
import { Login } from "./pages/auth/Login"
import { Register } from "./pages/auth/Register"
import { ForgotPassword } from "./pages/auth/ForgotPassword"
import { PasswordReset } from "./pages/auth/PasswordReset"
import { Profile } from "./pages/Profile"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Terms } from "./pages/Terms"
import { Privacy } from "./pages/Privacy"
import { Cookies } from "./pages/Cookies"
import { Help } from "./pages/Help"
import { NotificationProvider } from "./contexts/NotificationContext"
import { AuthProvider } from "./contexts/AuthContext"

export function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:slug" element={<ServiceDetail />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:slug" element={<ProjectDetail />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<PasswordReset />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/help" element={<Help />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App