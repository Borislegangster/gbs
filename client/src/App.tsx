import { NotificationProvider } from "./contexts/NotificationContext"

// Entourer l'application avec NotificationProvider
function App() {
  return <NotificationProvider>{/* Reste du contenu existant */}</NotificationProvider>
}

export default App
