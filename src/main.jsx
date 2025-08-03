import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "./index.css"
import App from "./App.jsx"
import { ThemeProvider } from "./contexts/ThemeContext.jsx" // Import ThemeProvider from its new location

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {/* ThemeProvider now wraps the entire App, making theme context available globally */}
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
