import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-slate-950 to-black text-white">
      {/* Top bar: logo + simple auth links */}
      <header className="container-fluid pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-md opacity-70" />
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-gray-400 uppercase">Mine Safety</p>
            <p className="text-lg font-extrabold gradient-text-primary leading-tight">Mine Safety Companion</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-sm">
          <Link
            to="/login"
            className="btn btn-primary px-4 py-2 text-xs sm:text-sm rounded-lg"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="btn btn-secondary px-4 py-2 text-xs sm:text-sm rounded-lg hidden xs:inline-flex"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Main content: hero + big icon actions */}
      <main className="flex-1 flex items-center justify-center pb-10">
        <div className="container-fluid max-w-5xl">
          <div
            className={`glass-card responsive-card mb-6 sm:mb-10 transition-all duration-700 ${
              isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-6'
            }`}
          >
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Left: short, simple hero text */}
              <div className="flex-1 text-center lg:text-left space-y-3 sm:space-y-4">
                <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-blue-300">Safety for every worker</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-shadow-lg">
                  <span className="gradient-text-primary">Simple</span> &amp; 
                  <span className="gradient-text-secondary"> Safe</span>
                </h1>
                <p className="responsive-text-lg text-gray-200 max-w-xl mx-auto lg:mx-0">
                  Big buttons. Clear pictures. One tap to report a hazard or start your daily safety checklist.
                </p>
              </div>

              {/* Right: worker-first quick panel */}
              <div className="flex-1 w-full">
                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl">
                  <p className="text-xs sm:text-sm uppercase tracking-wide text-gray-300 mb-2">
                    For Workers
                  </p>
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">
                    Tap what you need
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <Link
                      to="/hazard-reporting"
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 p-3 sm:p-4 hover-lift focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                    >
                      <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/20 text-white text-2xl">
                        !
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-center">Hazard</span>
                    </Link>

                    <Link
                      to="/daily-checklist"
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-3 sm:p-4 hover-lift focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400"
                    >
                      <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/20 text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-center">Checklist</span>
                    </Link>

                    <Link
                      to="/video-library"
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-3 sm:p-4 hover-lift focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400"
                    >
                      <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/20 text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-center">Videos</span>
                    </Link>

                    <Link
                      to="/incident-library"
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 p-3 sm:p-4 hover-lift focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400"
                    >
                      <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/20 text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-center">Incidents</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role tiles for supervisors and admins */}
          <div className="responsive-grid-lg mt-4 sm:mt-6">
            <div className="glass-card hover-lift p-5 sm:p-6 bg-white/5">
              <p className="text-xs uppercase tracking-wide text-gray-300 mb-2">Supervisors</p>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Team &amp; hazards</h3>
              <p className="text-sm text-gray-300 mb-4">
                View worker dashboards, open hazards and incident history.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/supervisor-dashboard" className="btn btn-primary px-4 py-2 text-xs sm:text-sm">
                  Open supervisor panel
                </Link>
              </div>
            </div>

            <div className="glass-card hover-lift p-5 sm:p-6 bg-white/5">
              <p className="text-xs uppercase tracking-wide text-gray-300 mb-2">Admins &amp; Safety Officers</p>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Full control</h3>
              <p className="text-sm text-gray-300 mb-4">
                Manage users, reports and compliance from a single place.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/admin-dashboard" className="btn btn-secondary px-4 py-2 text-xs sm:text-sm">
                  Admin dashboard
                </Link>
                <Link to="/admin/user-management" className="btn btn-primary px-4 py-2 text-xs sm:text-sm">
                  Users
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="py-4 text-center text-xs text-gray-400 bg-black/40 border-t border-white/10">
        <p>
          &copy; {new Date().getFullYear()} Mine Safety Companion · Helping every miner get home safe.
        </p>
      </footer>
    </div>
  );
};

export default Home;
