import { NavLink, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Classifier from './pages/Classifier';
import About from './pages/About';

export default function App() {
  const baseTab ="px-4 py-2 rounded-2xl text-sm font-medium transition";
  const active = "bg-black text-white shadow";
  const idle   = "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50";

  return (
    <div className="items-center justify-center ">
      <div className="relative min-h-screen bg-[#fafcff]">
           <svg
            className="fixed inset-0 w-full h-full opacity-10"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            >
            <defs>
            <pattern
                id="network"
                width="200"
                height="200"
                patternUnits="userSpaceOnUse"
            >
                <circle cx="20" cy="20" r="2" fill="black" />
                <circle cx="180" cy="180" r="2" fill="black" />
                <line x1="20" y1="20" x2="180" y2="180" stroke="black" strokeWidth="0.5" />
                <line x1="180" y1="20" x2="20" y2="180" stroke="black" strokeWidth="0.5" />
                <line x1="100" y1="0" x2="100" y2="200" stroke="black" strokeWidth="0.5" />
                <line x1="0" y1="100" x2="200" y2="100" stroke="black" strokeWidth="0.5" />
            </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#network)" />
        </svg>
      <div className="relative z-10 flex items-center justify-center px-4 py-8 hover:shadow-xl ">
        <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden min-h-[90vh]">
          <header className="bg-gradient-to-r from-blue-50 via-blue-185 to-blue-50 border-b border-blue-200">
            <div className="px-4 md:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={"/eth_logo_kurz_pos.svg"} alt="Logo" className="w-35 h-35" />
                <span className="text-lg font-semibold text-gray-800">ADAMMA LOGO</span>
              </div>
              <nav className="flex gap-2">
                <NavLink to="/" end
                  className={({ isActive }) =>
                    `${baseTab} ${isActive ? active : idle}`
                  }>
                  Landing
                </NavLink>
                <NavLink to="/classifier"
                  className={({ isActive }) =>
                    `${baseTab} ${isActive ? active : idle}`
                  }>
                  Classifier
                </NavLink>
                <NavLink to="/about"
                  className={({ isActive }) =>
                    `${baseTab} ${isActive ? active : idle}`
                  }>
                  About
                </NavLink>
              </nav>
            </div>
          </header>

          {/* Page content */}
          <main className="px-4 md:px-6 py-6 md:py-8">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/classifier" element={<Classifier />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <section className="text-gray-700">
      <h1 className="text-2xl font-semibold mb-2">404 – Not found</h1>
      <p>Diese Seite gibt’s hier nicht.</p>
    </section>
  );
}
