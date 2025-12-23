import { useContext, useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import LanguageSwitcher from '../../components/layout/LanguageSwitcher';
import { LANGUAGE_OPTIONS } from '../../i18n/config';
import { fetchMyBehaviorSnapshot } from '../../utils/behaviorTracker';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const [behaviorSnapshot, setBehaviorSnapshot] = useState({
    loading: true,
    data: null,
    error: null,
  });

  const roleKey = user?.role || 'employee';
  const roleCopy = t(`profile.roles.${roleKey}`, { returnObjects: true });
  const highlights = roleCopy?.highlights || [];
  const actions = roleCopy?.actions || [];

  const activeLanguage = useMemo(() => {
    const fallback = LANGUAGE_OPTIONS[0];
    if (!user?.preferredLanguage) return fallback;
    return LANGUAGE_OPTIONS.find((option) => option.preference === user.preferredLanguage) || fallback;
  }, [user?.preferredLanguage]);

  useEffect(() => {
    let isMounted = true;
    const loadBehavior = async () => {
      try {
        const data = await fetchMyBehaviorSnapshot(10);
        if (isMounted) {
          setBehaviorSnapshot({ loading: false, data, error: null });
        }
      } catch (error) {
        console.error('Failed to load behavior snapshot', error);
        if (isMounted) {
          setBehaviorSnapshot({
            loading: false,
            data: null,
            error: 'Unable to load engagement analytics right now.',
          });
        }
      }
    };
    if (user?._id) {
      loadBehavior();
    }
    return () => {
      isMounted = false;
    };
  }, [user?._id]);

  if (!user) {
    return null;
  }

  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—';

  const profileFields = [
    { label: t('profile.overviewFields.name'), value: user.name },
    { label: t('profile.overviewFields.email'), value: user.email },
    { label: t('profile.overviewFields.role'), value: <span className="capitalize font-bold text-primary-600">{user.role.replace('_', ' ')}</span> },
    { label: t('profile.overviewFields.joined'), value: joinedDate },
    { label: t('profile.overviewFields.language'), value: `${activeLanguage.nativeLabel} (${activeLanguage.label})` },
  ];

  const latestSnapshot = behaviorSnapshot.data?.latest;
  const trend = behaviorSnapshot.data?.trend || [];

  const riskColorMap = {
    low: 'text-green-500 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-red-500 bg-red-100',
  };

  return (
    <div className="space-y-8 mt-20">
      <motion.div
        className="rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-gray-900 text-white p-8 shadow-2xl relative overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_45%)]" />
        <div className="relative flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.4em] text-white/70">{t('nav.profile')}</p>
          <h1 className="text-3xl md:text-4xl font-extrabold">{t('profile.heroTitle')}</h1>
          <p className="text-white/80 max-w-2xl">{t('profile.heroSubtitle')}</p>
          <div className="flex flex-wrap gap-4 text-xs uppercase tracking-wide text-white/70">
            <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20">{roleCopy?.title}</span>
            <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20">{activeLanguage.nativeLabel}</span>
          </div>
        </div>
      </motion.div>

      {behaviorSnapshot.error && (
        <div className="p-4 rounded-2xl border border-yellow-200 bg-yellow-50 text-yellow-800">
          {behaviorSnapshot.error}
        </div>
      )}

      {latestSnapshot && (
        <motion.div
          className="grid gap-5 md:grid-cols-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="rounded-2xl bg-white shadow-lg border border-gray-100 p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">{t('profile.insightCard.title')}</p>
            <h3 className="text-4xl font-extrabold text-gray-900 mt-3">{latestSnapshot.complianceScore}</h3>
            <p className="text-sm text-gray-500 mb-4">Safety Compliance Score</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${riskColorMap[latestSnapshot.riskLevel] || 'bg-gray-100 text-gray-600'}`}>
              {latestSnapshot.riskLevel || 'medium'} risk
            </span>
          </div>
          <div className="rounded-2xl bg-white shadow-lg border border-gray-100 p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">Streak</p>
            <h3 className="text-4xl font-extrabold text-gray-900 mt-3">{latestSnapshot.streakCount || 0}<span className="text-xl font-semibold text-gray-500 ml-1">days</span></h3>
            <p className="text-sm text-gray-500">Continuous compliance above 80%</p>
          </div>
          <div className="rounded-2xl bg-white shadow-lg border border-gray-100 p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">Engagement Trend</p>
            <div className="mt-4 flex items-end gap-2 h-24">
              {trend.slice(-7).map((point) => {
                const value = point.complianceScore ?? point.averageScore ?? 0;
                const height = Math.min(Math.max(value, 5), 100);
                return (
                  <div key={point.date} className="flex-1">
                    <div
                      className="w-full rounded-full bg-gradient-to-t from-blue-200 to-blue-500 transition-all"
                      style={{ height: `${height}%` }}
                    ></div>
                  <p className="text-[10px] text-gray-400 mt-2 text-center">
                    {new Date(point.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </p>
                  </div>
                );
              })}
              {!trend.length && (
                <p className="text-sm text-gray-500">No historical data yet.</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-12">
        <motion.div
          className="md:col-span-8 rounded-3xl bg-white shadow-xl border border-gray-100 p-6 space-y-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">{t('profile.overviewTitle')}</p>
              <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold">
              {user.name?.charAt(0)}
            </div>
          </div>
          <dl className="grid md:grid-cols-2 gap-4">
            {profileFields.map((field) => (
              <div key={field.label} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <dt className="text-xs uppercase tracking-wider text-gray-500 mb-1">{field.label}</dt>
                <dd className="text-base font-semibold text-gray-900 break-words">{field.value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          className="md:col-span-4 rounded-3xl bg-gray-900 text-white p-6 border border-white/10 space-y-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div>
            <p className="text-xs uppercase tracking-wide text-white/60">{t('profile.languageCard.title')}</p>
            <h3 className="text-xl font-semibold mt-2">{activeLanguage.nativeLabel}</h3>
            <p className="text-white/70 text-sm mt-2">{t('profile.languageCard.description')}</p>
          </div>
          <LanguageSwitcher variant="mobile" />
          <p className="text-xs text-white/60">{t('profile.languageCard.helper')}</p>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          className="rounded-3xl bg-white border border-gray-100 p-6 shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs uppercase tracking-wide text-gray-500">{t('profile.roleHighlightsTitle')}</p>
          <h3 className="text-xl font-semibold text-gray-900 mt-2">{roleCopy?.tagline}</h3>
          <ul className="mt-4 space-y-3">
            {highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-gray-700">{highlight}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="rounded-3xl bg-gray-900 text-white p-6 border border-white/10 shadow-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <p className="text-xs uppercase tracking-wide text-white/60">{t('profile.actionsTitle')}</p>
          <h3 className="text-xl font-semibold mt-2">{roleCopy?.title}</h3>
          <ul className="mt-4 space-y-3">
            {actions.map((action) => (
              <li key={action} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-purple-400" />
                <span className="text-white/80">{action}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;

