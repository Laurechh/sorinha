import { Routes, Route } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LanguageProvider } from "./contexts/LanguageContext";
import { BackgroundProvider } from "./contexts/BackgroundContext";
import "./App.css";

function App() {
  return (
    <LanguageProvider>
      <BackgroundProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />}>
              <Route path="/playlist/:id" element={<Index />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </BackgroundProvider>
    </LanguageProvider>
  );
}

export default App;