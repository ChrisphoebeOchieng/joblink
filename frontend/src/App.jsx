import { useCallback, useEffect, useState } from 'react'
import {
  LayoutDashboard, Search, Bookmark, FileText, Bell,
  MapPin, Clock3, ArrowUpRight, Sparkles, Menu, CircleCheck,
  LogOut, BriefcaseBusiness, Eye, EyeOff, SlidersHorizontal
} from 'lucide-react'
import { apiRequest } from './api'
import EmployerWorkspace from './EmployerWorkspace'
import AdminWorkspace from './AdminWorkspace'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Find jobs', icon: Search },
  { label: 'Applications', icon: FileText },
  { label: 'Saved jobs', icon: Bookmark },
]

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'job_seeker',
  })

  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify(form),
        })
      }

      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      })

      localStorage.setItem('joblink_token', result.access_token)
      localStorage.setItem('joblink_user', JSON.stringify(result.user))
      onAuthenticated(result.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen bg-white">
      <section className="hidden w-1/2 flex-col justify-between overflow-hidden bg-[#5C1019] p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-bold text-[#BC2132]">J</div>
          <span className="text-2xl font-bold tracking-tight">joblink<span className="text-pink-300">.</span></span>
        </div>
        <div className="relative z-10 max-w-lg">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-pink-100">
            <Sparkles size={14} /> OPPORTUNITY STARTS HERE
          </span>
          <h1 className="text-5xl font-semibold leading-tight tracking-tight">
            Your next chapter begins with one connection.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/65">
            Discover opportunities, connect with employers and take the next step in your career.
          </p>
        </div>
        <div className="relative">
          <div className="absolute -bottom-40 -right-20 h-80 w-80 rounded-full border border-white/10" />
          <p className="text-xs text-white/45">© 2026 JobLink · Built for opportunity in Kenya.</p>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#BC2132] font-bold text-white">J</div>
              <span className="text-2xl font-bold">joblink<span className="text-[#BC2132]">.</span></span>
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[2px] text-[#BC2132]">
            {mode === 'login' ? 'Welcome back' : 'Get started'}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
            {mode === 'login' ? 'Sign in to JobLink' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {mode === 'login'
              ? 'Continue your career journey.'
              : 'Join Kenya’s growing professional network.'}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-medium text-gray-600">
                    First name
                    <input required name="first_name" value={form.first_name} onChange={update} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#BC2132]" placeholder="First name" />
                  </label>
                  <label className="text-xs font-medium text-gray-600">
                    Last name
                    <input required name="last_name" value={form.last_name} onChange={update} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#BC2132]" placeholder="Last name" />
                  </label>
                </div>
                <label className="block text-xs font-medium text-gray-600">
                  Account type
                  <select name="role" value={form.role} onChange={update} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#BC2132]">
                    <option value="job_seeker">Job seeker</option>
                    <option value="employer">Employer</option>
                  </select>
                </label>
              </>
            )}

            <label className="block text-xs font-medium text-gray-600">
              Email address
              <input required type="email" name="email" value={form.email} onChange={update} autoComplete="email" className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#BC2132]" placeholder="you@example.com" />
            </label>

            <label className="block text-xs font-medium text-gray-600">
              Password
              <div className="mt-2 flex items-center rounded-xl border border-gray-200 px-4 focus-within:border-[#BC2132]">
                <input required minLength={8} type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={update} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="w-full py-3 text-sm outline-none" placeholder="At least 8 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400" aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <button disabled={loading} className="w-full rounded-xl bg-[#BC2132] py-3.5 text-sm font-semibold text-white transition hover:bg-[#5C1019] disabled:opacity-60">
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-500">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }} className="ml-1 font-semibold text-[#BC2132] hover:underline">
              {mode === 'login' ? 'Create account' : 'Sign in'}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('joblink_user'))
    } catch {
      return null
    }
  })
  const [active, setActive] = useState('Overview')
  const [search, setSearch] = useState('')
  const [locationSearch, setLocationSearch] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [applying, setApplying] = useState(null)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const jobsData = await apiRequest('/jobs/')
      setJobs(jobsData)

      if (user?.role === 'job_seeker') {
        const applicationData = await apiRequest('/applications/mine')
        setApplications(applicationData)

        const savedData = await apiRequest('/saved-jobs/')
        setSaved(savedData)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!localStorage.getItem('joblink_token')) return

    let cancelled = false

    apiRequest('/auth/me')
      .then((currentUser) => {
        if (cancelled) return
        localStorage.setItem('joblink_user', JSON.stringify(currentUser))
        setUser(currentUser)
      })
      .catch(() => {
        localStorage.removeItem('joblink_token')
        localStorage.removeItem('joblink_user')
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!user) return
    const request = Promise.resolve().then(() => loadDashboard())
    return () => {
      request.catch(() => {})
    }
  }, [user, loadDashboard])

  function logout() {
    localStorage.removeItem('joblink_token')
    localStorage.removeItem('joblink_user')
    setUser(null)
    setJobs([])
    setApplications([])
    setSaved([])
  }

  async function toggleSavedJob(jobId) {
    setActionMessage('')

    try {
      if (saved.includes(jobId)) {
        await apiRequest(`/saved-jobs/${jobId}`, { method: 'DELETE' })
        setSaved((current) => current.filter((id) => id !== jobId))
        setActionMessage('Job removed from your saved opportunities.')
      } else {
        await apiRequest(`/saved-jobs/${jobId}`, { method: 'POST' })
        setSaved((current) => current.includes(jobId) ? current : [...current, jobId])
        setActionMessage('Job saved successfully.')
      }
    } catch (err) {
      setActionMessage(err.message)
    }
  }

  async function applyToJob(jobId) {
    setApplying(jobId)
    setActionMessage('')
    try {
      await apiRequest('/applications/', {
        method: 'POST',
        body: JSON.stringify({ job_id: jobId }),
      })
      setActionMessage('Your application has been submitted.')
      await loadDashboard()
    } catch (err) {
      setActionMessage(err.message)
    } finally {
      setApplying(null)
    }
  }

  if (!user) {
    return <AuthScreen onAuthenticated={setUser} />
  }

  if (user.role === 'employer') {
    return <EmployerWorkspace user={user} onLogout={logout} />
  }

  if (user.role === 'admin') {
    return <AdminWorkspace user={user} onLogout={logout} />
  }

  const filteredJobs = jobs.filter((job) => {
    const searchable = `${job.title} ${job.company} ${job.location || ''} ${(job.skills || []).join(' ')}`.toLowerCase()
    return searchable.includes(search.toLowerCase())
      && (job.location || '').toLowerCase().includes(locationSearch.toLowerCase())
      && (selectedType === 'All' || job.job_type === selectedType)
  })

  const jobTypes = [...new Set(jobs.map((job) => job.job_type).filter(Boolean))]

  const appliedJobIds = new Set(applications.map((application) => application.job_id))
  const visibleJobs = active === 'Saved jobs'
    ? filteredJobs.filter((job) => saved.includes(job.id))
    : filteredJobs


  const sidebar = (
    <aside className="flex h-full flex-col bg-white px-4 py-6">
      <div className="mb-10 flex items-center gap-3 px-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#BC2132] text-lg font-bold text-white">J</div>
        <div>
          <div className="text-xl font-bold tracking-tight text-gray-900">joblink<span className="text-[#BC2132]">.</span></div>
          <div className="text-[10px] font-semibold uppercase tracking-[1.8px] text-gray-400">Career workspace</div>
        </div>
        <button onClick={() => setMobileOpen(false)} className="ml-auto rounded-lg p-2 text-gray-400 hover:bg-gray-100 lg:hidden" aria-label="Close menu">
          <span className="text-lg">×</span>
        </button>
      </div>

      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.7px] text-gray-400">Workspace</p>
      <nav className="space-y-1">
        {navigation.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => { setActive(label); setMobileOpen(false); setError(''); setActionMessage('') }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
              active === label
                ? 'bg-[#FFF0F1] text-[#BC2132]'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon size={18} strokeWidth={1.8} />
            {label}
            {label === 'Applications' && applications.length > 0 && (
              <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${active === label ? 'bg-white text-[#BC2132]' : 'bg-gray-100 text-gray-500'}`}>
                {applications.length}
              </span>
            )}
            {active === label && <ArrowUpRight className="ml-auto" size={15} />}
          </button>
        ))}
      </nav>

      <div className="mt-9 rounded-2xl bg-[#5C1019] p-4 text-white">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
          <Sparkles size={17} />
        </div>
        <p className="text-sm font-semibold">Your next opportunity awaits.</p>
        <p className="mt-1 text-xs leading-5 text-white/65">Explore verified opportunities from employers across Kenya.</p>
        <button onClick={() => { setActive('Find jobs'); setMobileOpen(false) }} className="mt-3 text-xs font-bold text-white hover:text-pink-200">
          Explore jobs <ArrowUpRight className="ml-1 inline" size={13} />
        </button>
      </div>

      <div className="mt-auto border-t border-gray-100 pt-5">
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F9DDE0] text-sm font-bold text-[#BC2132]">
            {user.first_name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-800">{user.first_name} {user.last_name}</p>
            <p className="text-xs capitalize text-gray-400">{user.role?.replace('_', ' ')}</p>
          </div>
          <button onClick={logout} aria-label="Sign out" className="rounded-lg p-2 text-gray-400 transition hover:bg-white hover:text-[#BC2132]">
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  )

  const pageTitles = {
    Overview: ['Your career starts here', 'Discover opportunities that move you forward.'],
    'Find jobs': ['Find your next opportunity', 'Explore verified jobs from employers across Kenya.'],
    Applications: ['Your applications', 'Keep track of the opportunities you have applied for.'],
    'Saved jobs': ['Your saved opportunities', 'Keep interesting roles close while you decide your next move.'],
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-gray-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <div className="hidden w-[250px] shrink-0 border-r border-gray-200/70 lg:block">
          {sidebar}
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-gray-950/40 backdrop-blur-[2px]" />
            <div className="relative h-full w-[285px] shadow-2xl">{sidebar}</div>
          </div>
        )}

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-gray-200/70 bg-white/90 px-5 backdrop-blur-xl md:px-9">
            <div className="flex items-center gap-3">
              <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                <Menu size={21} />
              </button>
              <div>
                <p className="text-xs text-gray-400">
                  {new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-gray-800">Welcome back, {user.first_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={loadDashboard} aria-label="Refresh dashboard" className="rounded-xl border border-gray-200 p-2.5 text-gray-500 transition hover:bg-gray-50 hover:text-[#BC2132]">
                <Bell size={18} />
              </button>
              <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-[#F9DDE0] text-sm font-bold text-[#BC2132] sm:flex">
                {user.first_name?.[0]?.toUpperCase()}
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1250px] space-y-7 p-5 md:p-9">
            {error && (
              <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>
            )}
            {actionMessage && (
              <div role="status" className="rounded-xl border border-[#F6D9DD] bg-[#FFF5F6] p-4 text-sm text-[#9D1C2B]">{actionMessage}</div>
            )}

            {active === 'Overview' && (
              <>
                <section className="relative overflow-hidden rounded-3xl bg-[#5C1019] px-7 py-9 text-white shadow-sm md:px-10 md:py-11">
                  <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border border-white/10" />
                  <div className="pointer-events-none absolute -bottom-40 right-28 h-80 w-80 rounded-full bg-[#BC2132]/50 blur-3xl" />
                  <div className="relative z-10 max-w-2xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[1.7px] text-white/80">
                      <Sparkles size={13} /> Opportunity starts here
                    </span>
                    <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight md:text-[42px]">
                      Find a job that moves you forward.
                    </h1>
                    <p className="mt-3 max-w-lg text-sm leading-7 text-white/70">
                      Discover verified opportunities, connect with employers and take the next step in your career.
                    </p>
                    <button onClick={() => setActive('Find jobs')} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#8F1725] transition hover:bg-[#FFF0F1]">
                      Explore jobs <ArrowUpRight size={16} />
                    </button>
                  </div>
                  <div className="pointer-events-none absolute bottom-4 right-8 hidden text-[120px] font-black leading-none text-white/[0.06] lg:block">J.</div>
                </section>

                <section className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: 'Applications sent', value: applications.length, icon: FileText, detail: 'Your submitted applications' },
                    { label: 'Available opportunities', value: jobs.length, icon: BriefcaseBusiness, detail: 'Verified job listings' },
                    { label: 'Saved opportunities', value: saved.length, icon: Bookmark, detail: 'Jobs in your shortlist' },
                  ].map(({ label, value, icon: Icon, detail }) => (
                    <article key={label} className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(20,20,20,0.025)]">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">{label}</span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0F1] text-[#BC2132]"><Icon size={17} /></span>
                      </div>
                      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
                      <p className="mt-1 text-xs text-gray-400">{detail}</p>
                    </article>
                  ))}
                </section>

                <section className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[1.8px] text-[#BC2132]">Explore by field</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight">Discover opportunities by interest</h2>
                    <p className="mt-1 text-sm text-gray-500">Choose an area to find relevant roles.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {[
                      { name: 'Technology', term: 'software' },
                      { name: 'Finance', term: 'finance' },
                      { name: 'Marketing', term: 'marketing' },
                      { name: 'Sales', term: 'sales' },
                      { name: 'Administration', term: 'admin' },
                      { name: 'Customer service', term: 'customer' },
                    ].map((category) => (
                      <button key={category.name} onClick={() => { setSearch(category.term); setSelectedType('All'); setActive('Find jobs') }}
                        className="group rounded-2xl border border-gray-200/80 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#BC2132]/40 hover:shadow-md">
                        <span className="block text-sm font-semibold text-gray-800 transition group-hover:text-[#BC2132]">{category.name}</span>
                        <span className="mt-2 block text-[11px] text-gray-400">Explore roles →</span>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            {active === 'Applications' ? (
              <section className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[1.7px] text-[#BC2132]">Your career journey</p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight">{pageTitles[active][0]}</h1>
                  <p className="mt-1 text-sm text-gray-500">{pageTitles[active][1]}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <article className="rounded-2xl border border-gray-200 bg-white p-5">
                    <p className="text-xs text-gray-500">Total applications</p>
                    <p className="mt-3 text-3xl font-semibold">{applications.length}</p>
                  </article>
                  <article className="rounded-2xl border border-gray-200 bg-white p-5">
                    <p className="text-xs text-gray-500">Under review</p>
                    <p className="mt-3 text-3xl font-semibold">{applications.filter((item) => item.status === 'Under Review').length}</p>
                  </article>
                  <article className="rounded-2xl border border-gray-200 bg-white p-5">
                    <p className="text-xs text-gray-500">Shortlisted</p>
                    <p className="mt-3 text-3xl font-semibold">{applications.filter((item) => item.status === 'Shortlisted').length}</p>
                  </article>
                </div>

                {applications.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
                    <FileText className="mx-auto mb-3 text-gray-300" size={30} />
                    <h2 className="font-semibold text-gray-800">No applications yet</h2>
                    <p className="mt-1 text-sm text-gray-400">When you apply for a job, it will appear here.</p>
                    <button onClick={() => setActive('Find jobs')} className="mt-5 rounded-xl bg-[#BC2132] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#9F1C2A]">Find jobs</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map((application) => (
                      <article key={application.id} className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(20,20,20,0.025)] md:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0F1] text-[#BC2132]"><BriefcaseBusiness size={19} /></div>
                            <div>
                              <h2 className="font-semibold text-gray-900">{application.job_title || 'Job application'}</h2>
                              <p className="mt-1 text-sm text-gray-500">{application.company}</p>
                              <p className="mt-2 text-xs text-gray-400">Applied {new Date(application.applied_at).toLocaleDateString('en-KE')}</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-[#FFF0F1] px-3 py-1.5 text-xs font-semibold text-[#BC2132]">{application.status}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <>
                {active !== 'Overview' && (
                  <section>
                    <p className="text-xs font-semibold uppercase tracking-[1.7px] text-[#BC2132]">
                      {active === 'Saved jobs' ? 'Your shortlist' : 'Job search'}
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight">{pageTitles[active][0]}</h1>
                    <p className="mt-1 text-sm text-gray-500">{pageTitles[active][1]}</p>
                  </section>
                )}

                <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(20,20,20,0.025)] md:p-7">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[1.8px] text-[#BC2132]">JobLink opportunities</p>
                      <h2 className="mt-1 text-lg font-semibold tracking-tight">
                        {active === 'Saved jobs' ? 'Your saved opportunities' : 'Search jobs across Kenya'}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">Search by role, company, skill or location.</p>
                    </div>
                    <button onClick={loadDashboard} className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-600 transition hover:border-[#DDA0A8] hover:text-[#BC2132]">
                      <SlidersHorizontal size={14} /> Refresh
                    </button>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
                    <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3.5 transition focus-within:border-[#BC2132] focus-within:ring-4 focus-within:ring-[#BC2132]/5">
                      <Search size={18} className="shrink-0 text-[#BC2132]" />
                      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Job title, company or skill" className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400" />
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3.5 transition focus-within:border-[#BC2132] focus-within:ring-4 focus-within:ring-[#BC2132]/5">
                      <MapPin size={18} className="shrink-0 text-[#BC2132]" />
                      <input value={locationSearch} onChange={(event) => setLocationSearch(event.target.value)} placeholder="Town, county or remote" className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400" />
                    </label>
                  </div>

                  {jobTypes.length > 0 && (
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <span className="mr-1 text-xs font-semibold text-gray-500">Job type</span>
                      {['All', ...jobTypes].map((type) => (
                        <button key={type} onClick={() => setSelectedType(type)}
                          className={`rounded-full border px-3.5 py-2 text-xs font-medium transition ${
                            selectedType === type
                              ? 'border-[#BC2132] bg-[#FFF0F1] text-[#BC2132]'
                              : 'border-gray-200 text-gray-500 hover:border-[#DDA0A8] hover:text-[#BC2132]'
                          }`}>{type}</button>
                      ))}
                    </div>
                  )}
                </section>

                <section className="space-y-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[1.8px] text-[#BC2132]">
                        {active === 'Saved jobs' ? 'Your shortlist' : 'Verified listings'}
                      </p>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight">
                        {active === 'Saved jobs' ? 'Saved opportunities' : active === 'Overview' ? 'Opportunities to explore' : 'Available opportunities'}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">Explore roles posted by verified employers.</p>
                    </div>
                    <span className="text-xs text-gray-400">{visibleJobs.length} opportunities</span>
                  </div>

                  {loading ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">Loading opportunities...</div>
                  ) : visibleJobs.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
                      <BriefcaseBusiness className="mx-auto mb-3 text-gray-300" size={30} />
                      <h3 className="font-semibold text-gray-800">
                        {active === 'Saved jobs' ? 'No saved jobs yet' : 'No matching opportunities found'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-400">
                        {active === 'Saved jobs' ? 'Save interesting jobs to find them here.' : 'Try adjusting your search or filters.'}
                      </p>
                      {active === 'Saved jobs' && (
                        <button onClick={() => setActive('Find jobs')} className="mt-5 rounded-xl bg-[#BC2132] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#9F1C2A]">Explore jobs</button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {visibleJobs.map((job) => (
                        <article key={job.id} className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(20,20,20,0.025)] transition hover:border-[#E9B9BF] hover:shadow-md md:p-6">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0F1] text-lg font-bold text-[#BC2132]">
                              {job.company?.[0]?.toUpperCase() || 'J'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                                  <CircleCheck size={11} /> Verified
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">{job.company} <span className="px-1.5 text-gray-300">·</span> {job.job_type || 'Not specified'}</p>
                              <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
                                {job.location && <span className="flex items-center gap-1"><MapPin size={13} />{job.location}</span>}
                                {job.created_at && <span className="flex items-center gap-1"><Clock3 size={13} />{new Date(job.created_at).toLocaleDateString('en-KE')}</span>}
                              </div>
                              {job.description && <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">{job.description}</p>}
                              {job.skills?.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {job.skills.map((skill) => <span key={skill} className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-[11px] text-gray-600">{skill}</span>)}
                                </div>
                              )}
                              {job.salary_range && <p className="mt-4 text-sm font-semibold text-[#BC2132]">{job.salary_range}</p>}
                            </div>
                            <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                              <button aria-label={saved.includes(job.id) ? 'Remove saved job' : 'Save job'} onClick={() => toggleSavedJob(job.id)}
                                className={`rounded-xl border p-2.5 transition ${
                                  saved.includes(job.id)
                                    ? 'border-[#BC2132] bg-[#FFF0F1] text-[#BC2132]'
                                    : 'border-gray-200 text-gray-400 hover:border-[#BC2132] hover:text-[#BC2132]'
                                }`}>
                                <Bookmark size={17} fill={saved.includes(job.id) ? 'currentColor' : 'none'} />
                              </button>
                              <button disabled={appliedJobIds.has(job.id) || applying === job.id} onClick={() => applyToJob(job.id)}
                                className="rounded-xl bg-[#BC2132] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#9F1C2A] disabled:cursor-not-allowed disabled:bg-gray-300">
                                {appliedJobIds.has(job.id) ? 'Applied' : applying === job.id ? 'Applying...' : 'Apply now'}
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
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

export default App
