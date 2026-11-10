import { useCallback, useEffect, useState } from 'react'
import {
  LayoutDashboard, Building2, BriefcaseBusiness, Users,
  LogOut, Menu, Clock3, MapPin, Plus, RefreshCw,
  ArrowUpRight, ShieldCheck, X, CheckCircle2,
  AlertCircle, ChevronRight, Search
} from 'lucide-react'
import { apiRequest } from './api'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Company profile', icon: Building2 },
  { label: 'Post a job', icon: Plus },
  { label: 'My jobs', icon: BriefcaseBusiness },
  { label: 'Applicants', icon: Users },
]

const initialProfile = {
  company_name: '',
  location: '',
  description: '',
}

const initialJob = {
  title: '',
  description: '',
  location: '',
  type: 'Full-time',
  salary: '',
  skills: '',
}

const statuses = ['Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Accepted']

function StatusPill({ verified }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
      verified
        ? 'bg-emerald-50 text-emerald-700'
        : 'bg-amber-50 text-amber-700'
    }`}>
      {verified ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
      {verified ? 'Verified' : 'Pending verification'}
    </span>
  )
}

function MetricCard({ label, value, icon: Icon, description }) {
  return (
    <article className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(20,20,20,0.025)] transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0F1] text-[#BC2132]">
          <Icon size={17} strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </article>
  )
}

function Field({ label, children, hint }) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {children}
      {hint && <span className="mt-1.5 block text-xs font-normal text-gray-400">{hint}</span>}
    </label>
  )
}

function EmployerWorkspace({ user, onLogout }) {
  const [active, setActive] = useState('Overview')
  const [profile, setProfile] = useState(null)
  const [profileForm, setProfileForm] = useState(initialProfile)
  const [jobForm, setJobForm] = useState(initialJob)
  const [jobs, setJobs] = useState([])
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [applicantSearch, setApplicantSearch] = useState('')

  const loadWorkspace = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      let currentProfile = null

      try {
        currentProfile = await apiRequest('/employers/profile')
      } catch (err) {
        if (!err.message.toLowerCase().includes('profile not found')) {
          throw err
        }
      }

      setProfile(currentProfile)

      if (currentProfile) {
        setProfileForm({
          company_name: currentProfile.company_name || '',
          location: currentProfile.location || '',
          description: currentProfile.description || '',
        })

        const [jobsData, applicantsData] = await Promise.all([
          apiRequest('/jobs/mine'),
          apiRequest('/applications/employer'),
        ])

        setJobs(jobsData)
        setApplicants(applicantsData)
      } else {
        setJobs([])
        setApplicants([])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const request = Promise.resolve().then(loadWorkspace)
    return () => {
      request.catch(() => {})
    }
  }, [loadWorkspace])

  async function createProfile(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      await apiRequest('/employers/profile', {
        method: 'POST',
        body: JSON.stringify(profileForm),
      })
      setMessage('Company profile created. It is now awaiting verification.')
      await loadWorkspace()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function postJob(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const skills = jobForm.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)

      const result = await apiRequest('/jobs/', {
        method: 'POST',
        body: JSON.stringify({
          title: jobForm.title,
          description: jobForm.description,
          location: jobForm.location,
          type: jobForm.type,
          salary: jobForm.salary,
          skills,
        }),
      })

      setMessage(result.message || 'Job submitted for verification.')
      setJobForm(initialJob)
      await loadWorkspace()
      setActive('My jobs')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function updateApplicantStatus(applicationId, status) {
    setError('')
    setMessage('')

    try {
      await apiRequest(`/applications/${applicationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setApplicants((current) =>
        current.map((applicant) =>
          applicant.id === applicationId
            ? { ...applicant, status }
            : applicant
        )
      )
      setMessage('Applicant status updated.')
    } catch (err) {
      setError(err.message)
    }
  }

  function navigate(label) {
    setActive(label)
    setMobileOpen(false)
    setError('')
    setMessage('')
  }

  const verifiedJobs = jobs.filter((job) => job.is_verified).length
  const filteredApplicants = applicants.filter((applicant) => {
    const query = applicantSearch.toLowerCase()
    return (
      applicant.applicant?.toLowerCase().includes(query) ||
      applicant.email?.toLowerCase().includes(query) ||
      applicant.job_title?.toLowerCase().includes(query)
    )
  })

  const sidebar = (
    <aside className="flex h-full flex-col bg-white px-4 py-6">
      <div className="mb-10 flex items-center gap-3 px-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#BC2132] text-lg font-bold text-white shadow-sm shadow-red-200">
          J
        </div>
        <div>
          <div className="text-xl font-bold tracking-tight text-gray-900">
            joblink<span className="text-[#BC2132]">.</span>
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-[1.8px] text-gray-400">
            Employer workspace
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto rounded-lg p-2 text-gray-400 hover:bg-gray-100 lg:hidden"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.7px] text-gray-400">
        Workspace
      </p>
      <nav className="space-y-1">
        {navigation.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => navigate(label)}
            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
              active === label
                ? 'bg-[#FFF0F1] text-[#BC2132]'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon size={18} strokeWidth={1.8} />
            {label}
            {label === 'Applicants' && applicants.length > 0 && (
              <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                active === label ? 'bg-white text-[#BC2132]' : 'bg-gray-100 text-gray-500'
              }`}>
                {applicants.length}
              </span>
            )}
            {active === label && <ChevronRight className="ml-auto" size={15} />}
          </button>
        ))}
      </nav>

      <div className="mt-9 border-t border-gray-100 pt-6">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.7px] text-gray-400">
          Account
        </p>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-500 transition hover:bg-gray-50 hover:text-[#BC2132]"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>

      <div className="mt-auto border-t border-gray-100 pt-5">
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F9DDE0] text-sm font-bold text-[#BC2132]">
            {user.first_name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-gray-400">Employer account</p>
          </div>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-gray-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <div className="hidden w-[250px] shrink-0 border-r border-gray-200/70 lg:block">
          {sidebar}
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-gray-950/40 backdrop-blur-[2px]"
            />
            <div className="relative h-full w-[285px] shadow-2xl">
              {sidebar}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-gray-200/70 bg-white/90 px-5 backdrop-blur-xl md:px-9">
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={21} />
              </button>
              <div>
                <p className="text-xs text-gray-400">
                  {new Date().toLocaleDateString('en-KE', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-gray-800">
                  Welcome back, {user.first_name}
                </p>
              </div>
            </div>
            <button
              onClick={loadWorkspace}
              aria-label="Refresh workspace"
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-medium text-gray-500 transition hover:border-gray-300 hover:bg-gray-50"
            >
              <RefreshCw size={15} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </header>

          <div className="mx-auto max-w-[1250px] space-y-6 p-5 md:p-9">
            {error && (
              <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 shrink-0" size={17} />
                {error}
              </div>
            )}
            {message && (
              <div role="status" className="flex items-start gap-3 rounded-xl border border-[#F6D9DD] bg-[#FFF5F6] p-4 text-sm text-[#9D1C2B]">
                <CheckCircle2 className="mt-0.5 shrink-0" size={17} />
                {message}
              </div>
            )}

            {loading ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                <RefreshCw className="mx-auto mb-3 animate-spin text-[#BC2132]" size={22} />
                <p className="text-sm text-gray-500">Loading employer workspace...</p>
              </div>
            ) : !profile ? (
              <section className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-9">
                <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0F1] text-[#BC2132]">
                  <Building2 size={22} />
                </div>
                <p className="text-xs font-bold uppercase tracking-[1.8px] text-[#BC2132]">
                  Company registration
                </p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">
                  Set up your company profile
                </h1>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Add your company details to begin the verification process. Verified companies can publish job opportunities on JobLink.
                </p>

                <form onSubmit={createProfile} className="mt-8 space-y-5">
                  <Field label="Company name">
                    <input
                      required
                      maxLength={150}
                      value={profileForm.company_name}
                      onChange={(event) => setProfileForm({ ...profileForm, company_name: event.target.value })}
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#BC2132] focus:ring-4 focus:ring-[#BC2132]/10"
                      placeholder="Your registered company name"
                    />
                  </Field>
                  <Field label="Location">
                    <input
                      value={profileForm.location}
                      onChange={(event) => setProfileForm({ ...profileForm, location: event.target.value })}
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#BC2132] focus:ring-4 focus:ring-[#BC2132]/10"
                      placeholder="e.g. Nairobi, Kenya"
                    />
                  </Field>
                  <Field label="Company description">
                    <textarea
                      rows={5}
                      value={profileForm.description}
                      onChange={(event) => setProfileForm({ ...profileForm, description: event.target.value })}
                      className="mt-2 w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#BC2132] focus:ring-4 focus:ring-[#BC2132]/10"
                      placeholder="Tell job seekers about your company..."
                    />
                  </Field>
                  <button
                    disabled={saving}
                    className="w-full rounded-xl bg-[#BC2132] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9F1C2A] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? 'Creating profile...' : 'Create company profile'}
                  </button>
                </form>
              </section>
            ) : (
              <>
                {active === 'Overview' && (
                  <section className="space-y-6">
                    <div className="relative overflow-hidden rounded-3xl bg-[#5C1019] px-7 py-8 text-white shadow-sm md:px-10 md:py-10">
                      <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border border-white/10" />
                      <div className="pointer-events-none absolute -bottom-40 right-28 h-80 w-80 rounded-full bg-[#BC2132]/50 blur-3xl" />
                      <div className="relative z-10 max-w-2xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[1.7px] text-white/80">
                          <BriefcaseBusiness size={13} />
                          Employer workspace
                        </span>
                        <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-[40px] md:leading-[1.15]">
                          Build your next great team.
                        </h1>
                        <p className="mt-3 max-w-lg text-sm leading-6 text-white/70">
                          Manage your company profile, discover talent and bring the right people into your team.
                        </p>
                        <button
                          onClick={() => navigate('Post a job')}
                          disabled={!profile.is_verified}
                          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#8F1725] transition hover:bg-[#FFF0F1] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Post a job <ArrowUpRight size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <MetricCard
                        label="Total job listings"
                        value={jobs.length}
                        icon={BriefcaseBusiness}
                        description="Jobs submitted by your company"
                      />
                      <MetricCard
                        label="Verified listings"
                        value={verifiedJobs}
                        icon={ShieldCheck}
                        description="Approved and published jobs"
                      />
                      <MetricCard
                        label="Applications received"
                        value={applicants.length}
                        icon={Users}
                        description="Candidates who have applied"
                      />
                    </div>

                    <article className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(20,20,20,0.025)] md:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-400">Company verification</p>
                            <h2 className="mt-1 text-base font-semibold text-gray-900">{profile.company_name}</h2>
                            {profile.location && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                <MapPin size={12} /> {profile.location}
                              </p>
                            )}
                          </div>
                        </div>
                        <StatusPill verified={profile.is_verified} />
                      </div>
                      <div className="mt-5 border-t border-gray-100 pt-4">
                        {profile.is_verified ? (
                          <p className="flex items-center gap-2 text-sm text-emerald-700">
                            <CheckCircle2 size={16} />
                            Your company is verified. You can now submit job listings.
                          </p>
                        ) : (
                          <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4">
                            <Clock3 className="mt-0.5 shrink-0 text-amber-600" size={17} />
                            <p className="text-sm leading-6 text-amber-800">
                              Your company profile is awaiting administrator verification. Job posting will become available once your company is approved.
                            </p>
                          </div>
                        )}
                      </div>
                    </article>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold text-gray-900">Keep your workspace up to date</h2>
                        <p className="mt-1 text-sm text-gray-500">Manage your company information and recruitment activity.</p>
                      </div>
                      <button
                        onClick={() => navigate('Company profile')}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                      >
                        View company profile <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </section>
                )}

                {active === 'Company profile' && (
                  <section className="max-w-3xl space-y-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[1.7px] text-[#BC2132]">Your organisation</p>
                      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">Company profile</h1>
                      <p className="mt-1 text-sm text-gray-500">Your registered company information.</p>
                    </div>
                    <article className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_2px_10px_rgba(20,20,20,0.025)]">
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 p-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF0F1] text-[#BC2132]">
                            <Building2 size={22} />
                          </div>
                          <div>
                            <h2 className="font-semibold text-gray-900">{profile.company_name}</h2>
                            <p className="mt-1 text-xs text-gray-400">Company account</p>
                          </div>
                        </div>
                        <StatusPill verified={profile.is_verified} />
                      </div>
                      <div className="grid gap-6 p-6 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium text-gray-400">Company name</p>
                          <p className="mt-2 text-sm font-semibold text-gray-800">{profile.company_name}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-400">Location</p>
                          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                            <MapPin size={14} className="text-gray-400" />
                            {profile.location || 'Not provided'}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs font-medium text-gray-400">Company description</p>
                          <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-700">
                            {profile.description || 'No company description provided.'}
                          </p>
                        </div>
                      </div>
                      <div className="border-t border-gray-100 bg-gray-50/70 px-6 py-4">
                        <p className="text-xs leading-5 text-gray-500">
                          Company profile editing is not currently available. Contact the JobLink administrator if your company details need to be corrected.
                        </p>
                      </div>
                    </article>
                  </section>
                )}

                {active === 'Post a job' && (
                  <section className="max-w-3xl space-y-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[1.7px] text-[#BC2132]">Recruitment</p>
                      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">Post a job</h1>
                      <p className="mt-1 text-sm text-gray-500">Provide clear details about the opportunity.</p>
                    </div>

                    {!profile.is_verified ? (
                      <article className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                          <ShieldCheck size={22} />
                        </div>
                        <h2 className="mt-4 text-base font-semibold text-gray-900">Company verification required</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-500">
                          Your company must be verified by an administrator before you can publish job listings. This helps keep opportunities on JobLink trustworthy.
                        </p>
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3">
                          <span className="text-xs font-medium text-amber-800">Verification status</span>
                          <StatusPill verified={false} />
                        </div>
                      </article>
                    ) : (
                      <form onSubmit={postJob} className="space-y-6 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_2px_10px_rgba(20,20,20,0.025)] md:p-8">
                        <div className="border-b border-gray-100 pb-5">
                          <h2 className="font-semibold text-gray-900">Job details</h2>
                          <p className="mt-1 text-xs text-gray-400">Fields marked as required must be completed.</p>
                        </div>
                        <Field label="Job title">
                          <input
                            required
                            maxLength={150}
                            value={jobForm.title}
                            onChange={(event) => setJobForm({ ...jobForm, title: event.target.value })}
                            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#BC2132] focus:ring-4 focus:ring-[#BC2132]/10"
                            placeholder="e.g. Backend Software Engineer"
                          />
                        </Field>
                        <Field label="Job description">
                          <textarea
                            required
                            rows={6}
                            value={jobForm.description}
                            onChange={(event) => setJobForm({ ...jobForm, description: event.target.value })}
                            className="mt-2 w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#BC2132] focus:ring-4 focus:ring-[#BC2132]/10"
                            placeholder="Describe the role, responsibilities and requirements..."
                          />
                        </Field>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <Field label="Location">
                            <input
                              value={jobForm.location}
                              onChange={(event) => setJobForm({ ...jobForm, location: event.target.value })}
                              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#BC2132] focus:ring-4 focus:ring-[#BC2132]/10"
                              placeholder="e.g. Nairobi / Remote"
                            />
                          </Field>
                          <Field label="Employment type">
                            <select
                              value={jobForm.type}
                              onChange={(event) => setJobForm({ ...jobForm, type: event.target.value })}
                              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#BC2132] focus:ring-4 focus:ring-[#BC2132]/10"
                            >
                              <option>Full-time</option>
                              <option>Part-time</option>
                              <option>Contract</option>
                              <option>Internship</option>
                              <option>Freelance</option>
                            </select>
                          </Field>
                        </div>
                        <Field label="Salary range" hint="Include the currency and payment period where possible.">
                          <input
                            value={jobForm.salary}
                            onChange={(event) => setJobForm({ ...jobForm, salary: event.target.value })}
                            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#BC2132] focus:ring-4 focus:ring-[#BC2132]/10"
                            placeholder="e.g. KES 50,000 – 70,000 per month"
                          />
                        </Field>
                        <Field label="Required skills" hint="Separate skills with commas.">
                          <input
                            value={jobForm.skills}
                            onChange={(event) => setJobForm({ ...jobForm, skills: event.target.value })}
                            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#BC2132] focus:ring-4 focus:ring-[#BC2132]/10"
                            placeholder="Python, Flask, PostgreSQL"
                          />
                        </Field>
                        <div className="border-t border-gray-100 pt-5">
                          <button
                            disabled={saving}
                            className="w-full rounded-xl bg-[#BC2132] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9F1C2A] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                          >
                            {saving ? 'Submitting...' : 'Submit job for verification'}
                          </button>
                        </div>
                      </form>
                    )}
                  </section>
                )}

                {active === 'My jobs' && (
                  <section className="space-y-5">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[1.7px] text-[#BC2132]">Recruitment</p>
                        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">My job listings</h1>
                        <p className="mt-1 text-sm text-gray-500">Track the jobs submitted by your company.</p>
                      </div>
                      <button
                        onClick={() => navigate('Post a job')}
                        disabled={!profile.is_verified}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#BC2132] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#9F1C2A] disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        <Plus size={15} /> Post a job
                      </button>
                    </div>

                    {jobs.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                          <BriefcaseBusiness size={25} />
                        </div>
                        <h2 className="mt-4 font-semibold text-gray-800">No job listings yet</h2>
                        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-gray-400">
                          Your submitted jobs will appear here once you start recruiting with JobLink.
                        </p>
                        {!profile.is_verified && (
                          <p className="mt-3 text-xs font-medium text-amber-700">Company verification is required before posting.</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {jobs.map((job) => (
                          <article key={job.id} className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(20,20,20,0.025)] transition hover:shadow-md md:p-6">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h2 className="text-base font-semibold text-gray-900">{job.title}</h2>
                                <p className="mt-1 text-xs text-gray-500">{job.job_type || 'Not specified'}</p>
                                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-400">
                                  {job.location && (
                                    <span className="inline-flex items-center gap-1.5">
                                      <MapPin size={13} /> {job.location}
                                    </span>
                                  )}
                                  {job.created_at && (
                                    <span className="inline-flex items-center gap-1.5">
                                      <Clock3 size={13} /> {new Date(job.created_at).toLocaleDateString('en-KE')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <StatusPill verified={job.is_verified} />
                            </div>
                            {job.salary_range && (
                              <p className="mt-4 text-sm font-semibold text-[#BC2132]">{job.salary_range}</p>
                            )}
                            {job.description && (
                              <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{job.description}</p>
                            )}
                            {job.skills?.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {job.skills.map((skill) => (
                                  <span key={skill} className="rounded-lg bg-gray-50 px-3 py-1.5 text-[11px] font-medium text-gray-600">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {active === 'Applicants' && (
                  <section className="space-y-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[1.7px] text-[#BC2132]">Talent management</p>
                      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">Applicants</h1>
                      <p className="mt-1 text-sm text-gray-500">Review applications and update candidate progress.</p>
                    </div>

                    {applicants.length > 0 && (
                      <div className="relative max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                        <input
                          value={applicantSearch}
                          onChange={(event) => setApplicantSearch(event.target.value)}
                          placeholder="Search applicants or job titles..."
                          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#BC2132] focus:ring-4 focus:ring-[#BC2132]/10"
                        />
                      </div>
                    )}

                    {applicants.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                          <Users size={25} />
                        </div>
                        <h2 className="mt-4 font-semibold text-gray-800">No applications received yet</h2>
                        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-gray-400">
                          Applications for your job listings will appear here.
                        </p>
                      </div>
                    ) : filteredApplicants.length === 0 ? (
                      <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                        No applicants match your search.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredApplicants.map((applicant) => (
                          <article key={applicant.id} className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(20,20,20,0.025)] md:p-6">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex min-w-0 items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF0F1] text-sm font-bold text-[#BC2132]">
                                  {applicant.applicant?.[0]?.toUpperCase() || 'A'}
                                </div>
                                <div className="min-w-0">
                                  <h2 className="font-semibold text-gray-900">{applicant.applicant}</h2>
                                  <p className="mt-1 truncate text-sm text-gray-500">{applicant.email}</p>
                                  <p className="mt-3 text-sm font-medium text-gray-700">{applicant.job_title}</p>
                                  <p className="mt-1 text-xs text-gray-400">
                                    Applied {new Date(applicant.applied_at).toLocaleDateString('en-KE')}
                                  </p>
                                </div>
                              </div>
                              <label className="block shrink-0 text-xs font-medium text-gray-500">
                                Application status
                                <select
                                  value={applicant.status}
                                  onChange={(event) => updateApplicantStatus(applicant.id, event.target.value)}
                                  className="mt-2 block w-full min-w-[180px] rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#BC2132] focus:ring-4 focus:ring-[#BC2132]/10"
                                >
                                  <option value="Submitted" disabled>Submitted</option>
                                  {statuses.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                  ))}
                                </select>
                              </label>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </>
            )}

            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200/80 py-5 text-[11px] text-gray-400">
              <span>© 2026 JobLink. Your next chapter starts here.</span>
              <span>Built for opportunity in Kenya.</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}

export default EmployerWorkspace
