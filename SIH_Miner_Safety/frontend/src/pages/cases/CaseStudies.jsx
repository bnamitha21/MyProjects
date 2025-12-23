import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/axiosConfig';

const severityTokens = {
  fatal: {
    label: 'Fatal',
    badge: 'bg-red-600 text-white',
    accent: 'border-red-400/60 shadow-red-900/20',
  },
  major: {
    label: 'Major',
    badge: 'bg-amber-500 text-slate-900',
    accent: 'border-amber-300/60 shadow-amber-900/20',
  },
  minor: {
    label: 'Minor',
    badge: 'bg-lime-400 text-slate-900',
    accent: 'border-lime-300/60 shadow-lime-900/20',
  },
  near_miss: {
    label: 'Near miss',
    badge: 'bg-sky-500 text-white',
    accent: 'border-sky-400/60 shadow-sky-900/20',
  },
};

const EmptyState = ({ headline = 'No case studies yet', body = 'Once DGMS or internal reports are uploaded, they’ll appear here.' }) => (
  <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-10 text-center text-slate-500">
    <p className="text-lg font-semibold text-slate-800">{headline}</p>
    <p className="mt-2 text-sm">{body}</p>
  </div>
);

const CaseCard = ({ item, role }) => {
  const severity = severityTokens[item.severity] || severityTokens.near_miss;
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-white p-5 text-slate-700 shadow-xl ${severity.accent}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.3em] text-slate-400">
        <span>{new Date(item.date).toLocaleDateString()}</span>
        <span>{item.location || 'Confidential'}</span>
      </div>
      <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-800">
        <span className={`rounded-full px-4 py-1 text-[10px] ${severity.badge}`}>
          {severity.label}
        </span>
        <span className="text-[11px] text-slate-400">#{item.tags?.[0] || 'safety'}</span>
      </div>
      <h3 className="mt-4 text-2xl font-black text-slate-900">{item.title}</h3>
      <p className="mt-3 text-sm text-slate-600 line-clamp-3">
        {item.quickSummary || 'Summary coming soon.'}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
        {item.tags?.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1">#{tag}</span>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
        <span>{role === 'worker' ? 'Checklist • Quiz' : 'Timeline • Actions'}</span>
        <Link
          to={`/case-studies/${item.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-400/40 transition hover:bg-black"
        >
          Open
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
};

const FilterChip = ({ label, icon, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-500">
      {icon}
      {label}
    </p>
    {children}
  </div>
);

const CaseStudies = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role || 'worker';
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: 'all',
    tag: 'all',
    search: '',
  });

  const fetchCases = async (isSearch = false) => {
    try {
      if (!isSearch) {
        setLoading(true);
      }
      const params = { role };
      if (filters.severity !== 'all') params.severity = filters.severity;
      if (filters.tag !== 'all') params.tags = filters.tag;
      if (filters.search) params.search = filters.search;
      const response = await api.get('/cases', { params });
      setCases(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch case studies', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, filters.severity, filters.tag]);

  const featuredCase = cases[0];
  const recommended = useMemo(() => cases.slice(1, 4), [cases]);
  const uniqueTags = useMemo(() => {
    const tagSet = new Set();
    cases.forEach((item) => item.tags?.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [cases]);

  return (
    <div className="space-y-10 mt-20">
      <section className="relative overflow-hidden rounded-[40px] border border-slate-200 bg-white p-1 shadow-2xl shadow-slate-300/60">
        <div className="relative rounded-[36px] bg-gradient-to-br from-white via-slate-50 to-slate-100 p-8 md:p-12">
          <div className="relative z-10 grid gap-10 lg:grid-cols-[2fr,1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.7em] text-slate-500">
                Incident knowledge hub
              </p>
              <h1 className="mt-4 text-4xl font-black text-slate-900 sm:text-5xl">
                Learn from real mine accidents, faster.
              </h1>
              <p className="mt-4 max-w-2xl text-base text-slate-600">
                Curated DGMS investigations, internal reports, testimonials, and CCTV clips transformed into micro lessons for every role.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 bg-white">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Worker-ready checklist
                </span>
                <span className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 bg-white">
                  <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                  Supervisor timeline & RCA
                </span>
                <span className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 bg-white">
                  <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                  Micro quiz + badge
                </span>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Filters</p>
              <div className="mt-4 space-y-3">
                <FilterChip label="Severity" icon="⚠️">
                  <select
                    value={filters.severity}
                    onChange={(e) => setFilters((prev) => ({ ...prev, severity: e.target.value }))}
                    className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">All severities</option>
                    <option value="fatal">Fatal</option>
                    <option value="major">Major</option>
                    <option value="minor">Minor</option>
                    <option value="near_miss">Near miss</option>
                  </select>
                </FilterChip>
                <FilterChip label="Hazard tag" icon="🏷️">
                  <select
                    value={filters.tag}
                    onChange={(e) => setFilters((prev) => ({ ...prev, tag: e.target.value }))}
                    className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">All hazards</option>
                    {uniqueTags.map((tag) => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </FilterChip>
                <FilterChip label="Search" icon="🔎">
                  <div className="mt-3 flex items-center rounded-2xl border border-slate-300 bg-white px-3">
                    <input
                      type="text"
                      placeholder="Type DGMS ID, hazard, location..."
                      value={filters.search}
                      onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && fetchCases(true)}
                      className="w-full border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => fetchCases(true)}
                      className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow"
                    >
                      Go
                    </button>
                  </div>
                </FilterChip>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {featuredCase ? (
            <section className="grid gap-6 xl:grid-cols-[2fr,1fr]">
              <motion.div
                layout
                className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-1 shadow-2xl shadow-slate-300/50"
              >
                <div className="grid gap-6 rounded-[28px] bg-gradient-to-br from-white via-slate-50 to-white p-8 lg:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.6em] text-blue-500">Case of the day</p>
                    <h2 className="mt-4 text-3xl font-black text-slate-900">{featuredCase.title}</h2>
                    <p className="mt-3 text-sm text-slate-600">{featuredCase.quickSummary}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>{new Date(featuredCase.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{featuredCase.location || 'Confidential'}</span>
                      {featuredCase.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">#{tag}</span>
                      ))}
                    </div>
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
                      {role === 'worker'
                        ? 'Watch the 45-second recap, follow the 3-step checklist and pass the micro quiz to keep your streak alive.'
                        : 'Review the minute-by-minute timeline, root causes, and assign corrective actions to your crews.'}
                    </div>
                    <Link
                      to={`/case-studies/${featuredCase.id}`}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 font-semibold text-white shadow-lg shadow-slate-400/40"
                    >
                      Open lesson
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow">
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Engagement</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
                        <p className="text-sm text-emerald-700">Views</p>
                        <p className="text-3xl font-black text-emerald-800">{featuredCase.engagementStats?.views ?? 0}</p>
                      </div>
                      <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100">
                        <p className="text-sm text-amber-700">Completions</p>
                        <p className="text-3xl font-black text-amber-800">{featuredCase.engagementStats?.completions ?? 0}</p>
                      </div>
                      <div className="rounded-2xl bg-indigo-50 p-4 border border-indigo-100">
                        <p className="text-sm text-indigo-700">Avg quiz</p>
                        <p className="text-3xl font-black text-indigo-800">
                          {featuredCase.engagementStats?.averageQuizScore ?? 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">What’s inside</p>
                <ul className="mt-4 space-y-4 text-sm text-slate-600">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-slate-400"></span>
                    20–45s micro video: animated re-enactment with voice-over in local language.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-slate-400"></span>
                    Worker summary + 3-step checklist designed for pre-task briefings.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-slate-400"></span>
                    Supervisor detail pack: timeline, root causes, corrective actions, references.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-slate-400"></span>
                    Micro quiz + streak badge to tie into Safety Behavior Score.
                  </li>
                </ul>
              </div>
            </section>
          ) : (
            <EmptyState />
          )}

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Recommended for you</h3>
              <span className="text-sm text-slate-500">{recommended.length} cases</span>
            </div>
            {recommended.length ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {recommended.map((item) => (
                  <CaseCard key={item.id} item={item} role={role} />
                ))}
              </div>
            ) : (
              <EmptyState headline="No personalized picks yet" body="Once you start viewing or logging hazards, we will recommend similar cases." />
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">All case studies</h3>
              <span className="text-sm text-slate-500">{cases.length} total</span>
            </div>
            {cases.length ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {cases.map((item) => (
                  <CaseCard key={item.id} item={item} role={role} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default CaseStudies;

