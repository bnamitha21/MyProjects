import { useContext, useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';
import { AuthContext } from '../../context/AuthContext';
import { logBehaviorEvent } from '../../utils/behaviorTracker';

const SectionCard = ({ title, children, actions }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{title}</p>
      </div>
      {actions}
    </div>
    {children}
  </div>
);

const CaseStudyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const role = user?.role || 'worker';

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizResponses, setQuizResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [hasLoggedView, setHasLoggedView] = useState(false);
  const [hasLoggedVideoStart, setHasLoggedVideoStart] = useState(false);
  const videoProgressRef = useRef({ lastTime: 0 });

  const isPrivileged = useMemo(
    () => ['supervisor', 'admin', 'dgms_officer'].includes(role),
    [role],
  );

  const fetchCaseStudy = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/cases/${id}`, {
        params: { role },
      });
      setCaseData(response.data?.data);
    } catch (error) {
      console.error('Failed to fetch case study', error);
      toast.error('Unable to load case study');
      navigate('/case-studies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseStudy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, role]);

  useEffect(() => {
    if (caseData && !hasLoggedView) {
      api.post(`/cases/${id}/engagement`, { action: 'view' }).catch(() => null);
      setHasLoggedView(true);
    }
  }, [caseData, hasLoggedView, id]);

  const logCompletion = async (score) => {
    try {
      setSubmitting(true);
      await api.post(`/cases/${id}/engagement`, {
        action: 'complete',
        quizScore: typeof score === 'number' ? score : undefined,
      });
      toast.success('Completion logged');
      fetchCaseStudy();
    } catch (error) {
      console.error('Failed to log completion', error);
      toast.error('Unable to log completion');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    try {
      await api.post(`/cases/${id}/approve`);
      toast.success('Case study approved and published');
      fetchCaseStudy();
    } catch (error) {
      console.error('Failed to approve case study', error);
      toast.error('Approval failed');
    }
  };

  const handleMicroVideoPlay = () => {
    if (!caseData || hasLoggedVideoStart) return;
    logBehaviorEvent('video_started', {
      source: 'case_study',
      caseId: id,
      title: caseData.title,
    });
    setHasLoggedVideoStart(true);
  };

  const handleMicroVideoTimeUpdate = (event) => {
    if (!caseData) return;
    const currentTime = event.target.currentTime || 0;
    const lastTime = videoProgressRef.current.lastTime || 0;
    const deltaSeconds = Math.max(0, currentTime - lastTime);

    if (deltaSeconds >= 15) {
      logBehaviorEvent('video_progress', {
        source: 'case_study',
        caseId: id,
        title: caseData.title,
        deltaSeconds,
        positionSeconds: currentTime,
      });
    }

    videoProgressRef.current.lastTime = currentTime;
  };

  const handleMicroVideoEnded = (event) => {
    if (!caseData) return;
    const durationSeconds = Math.round(event.target.duration || event.target.currentTime || 0);
    logBehaviorEvent('video_completed', {
      source: 'case_study',
      caseId: id,
      title: caseData.title,
      durationSeconds,
    });
  };

  const handleQuizSubmit = (event) => {
    event.preventDefault();
    if (!caseData?.quiz?.length) {
      logCompletion();
      return;
    }
    const answered = Object.keys(quizResponses).length;
    if (answered !== caseData.quiz.length) {
      toast.error('Please answer all quiz questions');
      return;
    }
    const correctAnswers = caseData.quiz.reduce((score, question, index) => (
      question.correctOption === Number(quizResponses[index]) ? score + 1 : score
    ), 0);
    const percentage = Math.round((correctAnswers / caseData.quiz.length) * 100);
    logCompletion(percentage);
  };

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!caseData) {
    return null;
  }

  const workerChecklist = caseData.checklist || caseData.workerChecklist || [];
  const supervisorChecklist = caseData.supervisorChecklist || [];

  return (
    <div className="space-y-8 mt-20">
      <div className="rounded-3xl border border-slate-200 bg-white p-1 shadow-xl shadow-slate-300/60">
        <div className="rounded-[28px] bg-gradient-to-br from-white via-slate-50 to-slate-100 p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Case study</p>
              <h1 className="mt-3 text-3xl font-black text-slate-900">{caseData.title}</h1>
              <p className="mt-3 text-base text-slate-600">{caseData.quickSummary}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                <span>{new Date(caseData.date).toLocaleDateString()}</span>
                <span>•</span>
                <span>{caseData.location}</span>
                <span>•</span>
                <span className="uppercase tracking-widest text-slate-700">{caseData.severity}</span>
                {caseData.tags?.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span>Status</span>
                <span className={`rounded-full px-3 py-1 font-semibold ${caseData.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {caseData.status}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Views</span>
                <strong className="text-slate-900">{caseData.engagementStats?.views ?? 0}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Completions</span>
                <strong className="text-slate-900">{caseData.engagementStats?.completions ?? 0}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Avg quiz score</span>
                <strong className="text-slate-900">
                  {caseData.engagementStats?.averageQuizScore ?? 0}%
                </strong>
              </div>
              {isPrivileged && caseData.status !== 'published' && (
                <button
                  type="button"
                  onClick={handleApprove}
                  className="rounded-xl bg-slate-900 py-2 font-semibold text-white shadow"
                >
                  Approve & Publish
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {caseData.microVideo?.url && (
        <SectionCard title="Micro video">
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-black">
            <video
              controls
              poster={caseData.microVideo.thumbnail}
              className="h-full w-full object-cover"
              onPlay={handleMicroVideoPlay}
              onTimeUpdate={handleMicroVideoTimeUpdate}
              onEnded={handleMicroVideoEnded}
            >
              <source src={caseData.microVideo.url} type="video/mp4" />
            </video>
          </div>
        </SectionCard>
      )}

      {!isPrivileged && (
        <section className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="3-step checklist">
            <ol className="space-y-4 text-slate-700">
              {workerChecklist.length ? workerChecklist.map((item, index) => (
                <li key={item.text || index} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                    {index + 1}
                  </span>
                  <p className="text-base">{item.text || item}</p>
                </li>
              )) : <p className="text-sm text-slate-400">Checklist coming soon.</p>}
            </ol>
          </SectionCard>

          <SectionCard title="Quick summary">
            <p className="text-base text-slate-600">{caseData.quickSummary || 'Summary coming soon.'}</p>
          </SectionCard>
        </section>
      )}

      {isPrivileged && (
        <section className="space-y-6">
          <SectionCard title="Timeline">
            <div className="space-y-4">
              {caseData.timeline?.length ? caseData.timeline.map((entry) => (
                <div key={`${entry.timestampLabel}-${entry.description}`} className="flex gap-4">
                  <div className="min-w-[120px] text-sm font-semibold text-blue-600">{entry.timestampLabel}</div>
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-slate-700">{entry.description}</div>
                </div>
              )) : <p className="text-sm text-slate-400">Timeline coming soon.</p>}
            </div>
          </SectionCard>

          <SectionCard title="Root causes & actions">
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Root causes</h4>
                <ul className="mt-3 space-y-3">
                  {caseData.rootCauses?.length ? caseData.rootCauses.map((root) => (
                    <li key={`${root.type}-${root.description}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-widest text-slate-500">{root.type}</p>
                      <p className="mt-2 text-slate-700">{root.description}</p>
                    </li>
                  )) : <p className="text-sm text-slate-400">Root cause analysis pending.</p>}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Corrective actions</h4>
                <ul className="mt-3 space-y-3">
                  {caseData.immediateActions?.length ? caseData.immediateActions.map((action) => (
                    <li key={`${action.title}-${action.description}`} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-sm font-semibold text-emerald-800">{action.title}</p>
                      <p className="mt-2 text-emerald-700">{action.description}</p>
                      {action.responsibleRole && (
                        <p className="mt-2 text-xs uppercase tracking-widest text-emerald-600">
                          Owner: {action.responsibleRole}
                        </p>
                      )}
                    </li>
                  )) : <p className="text-sm text-slate-400">Add corrective actions to brief crews.</p>}
                </ul>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Supervisor checklist">
            <ul className="space-y-3">
              {supervisorChecklist.length ? supervisorChecklist.map((item, index) => (
                <li key={item.text || index} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <span className="mt-1 h-3 w-3 rounded-full bg-emerald-500"></span>
                  <div>
                    <p className="text-slate-700">{item.text || item}</p>
                    {item.role && <p className="text-xs uppercase tracking-widest text-slate-500">{item.role}</p>}
                  </div>
                </li>
              )) : <p className="text-sm text-slate-400">Supervisor checklist pending.</p>}
            </ul>
          </SectionCard>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Quiz & assignment">
          <form className="space-y-6" onSubmit={handleQuizSubmit}>
            {caseData.quiz?.length ? caseData.quiz.map((question, index) => (
              <div key={question.question} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">{question.question}</p>
                <div className="mt-3 space-y-2">
                  {question.options?.map((option, optionIndex) => (
                    <label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={optionIndex}
                        checked={Number(quizResponses[index]) === optionIndex}
                        onChange={(e) => setQuizResponses((prev) => ({ ...prev, [index]: e.target.value }))}
                        className="h-4 w-4"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-400">Quiz coming soon. You can still log completion.</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit & Mark Complete'}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Related references">
          <ul className="space-y-4 text-sm text-slate-600">
            {caseData.relatedReferences?.length ? caseData.relatedReferences.map((reference) => (
              <li key={reference.url} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="font-semibold text-slate-800">{reference.label}</p>
                <a
                  href={reference.url}
                  className="mt-2 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open document
                  <span aria-hidden>↗</span>
                </a>
              </li>
            )) : (
              <li className="text-slate-400">No supporting references added.</li>
            )}
          </ul>
        </SectionCard>
      </section>
    </div>
  );
};

export default CaseStudyDetail;

