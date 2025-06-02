import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import { Layout } from "./components/Layout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Login } from "./pages/auth/Login"
import { Dashboard } from "./pages/Dashboard"
import { Users } from "./pages/Users"
import { Projects } from "./pages/Projects"
import { Services } from "./pages/Services"
import { Blog } from "./pages/Blog"
import { Contacts } from "./pages/Contacts"
import { Media } from "./pages/Media"
import { Testimonials } from "./pages/Testimonials"
import { FAQ } from "./pages/FAQ"
import { Newsletter } from "./pages/Newsletter"
import { HomeContent } from "./pages/HomeContent"
import { StaticPages } from "./pages/StaticPages"
import { Settings } from "./pages/Settings"
import { Profile } from "./pages/Profile"
import "./App.css"

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/contacts" element={<Contacts />} />
                      <Route path="/media" element={<Media />} />
                      <Route path="/testimonials" element={<Testimonials />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/newsletter" element={<Newsletter />} />
                      <Route path="/home-content" element={<HomeContent />} />
                      <Route path="/static-pages" element={<StaticPages />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/profile" element={<Profile />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
