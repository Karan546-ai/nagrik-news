import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ArticleDetail from "./pages/ArticleDetail";
import CMSDashboard from "./pages/CMSDashboard_fixed";
import Login from "./pages/Login";
import FAQs from "./pages/FAQs";
import TrendingSidebar from "./components/TrendingSidebar";
import { DarkModeProvider } from "./context/DarkModeContext";

function App() {
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col pt-16 bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8 flex gap-8">
            <div className="flex-1 max-w-5xl">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/article/:id" element={<ArticleDetail />} />
                <Route path="/cms" element={<CMSDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/faqs" element={<FAQs />} />
              </Routes>
            </div>
            <div className="hidden lg:block w-80">
              <TrendingSidebar />
            </div>
          </main>
          
          {/* Footer */}
          <footer className="bg-gray-900 dark:bg-gray-950 text-white py-8 mt-12 text-center border-t border-gray-200 dark:border-gray-800">
            <p>© {new Date().getFullYear()} NAGRIK NEWS. AI से समाचार की भविष्य।</p>
          </footer>
        </div>
      </BrowserRouter>
    </DarkModeProvider>
  );
}

export default App;
