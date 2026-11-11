import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, ArrowUpRight, Search, MapPin, BriefcaseBusiness,
  Bookmark, FileText, Bell, Menu, X, CheckCircle2,
  LogOut, Eye, EyeOff, Sparkles, Compass, Globe2
} from 'lucide-react'
import { apiRequest } from './api'
import EmployerWorkspace from './EmployerWorkspace'
import AdminWorkspace from './AdminWorkspace'

const categories = [
  { name: 'Technology', count: 'Software, IT & Data', search: 'software' },
  { name: 'Business', count: 'Operations & Strategy', search: 'business' },
  { name: 'Finance', count: 'Accounting & Banking', search: 'finance' },
  { name: 'Marketing', count: 'Brand & Communications', search: 'marketing' },
  { name: 'Design', count: 'Creative & Product', search: 'design' },
  { name: 'Customer service', count: 'Support & Experience', search: 'customer' },
]

const jobTypes = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship', 'Remote']

function Brand({ light = false }) {
  return (
    <a href="/" className={`inline-flex items-center gap-2.5 ${light ? 'text-white' : 'text-[#30251B]'}`}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl font-serif text-xl font-bold ${light ? 'bg-[#D8A44B] text-[#30251B]' : 'bg-[#81551E] text-[#FFF9EF]'}`}>J</span>
      <span className="font-serif text-[25px] font-bold tracking-tight">JobLink<span className="text-[#B7863E]">.</span></span>
    </a>
  )
}

function AuthScreen({ onAuthenticated, onClose }) {
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', role: 'job_seeker'
  })

  function update(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }))
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
        body: JSON.stringify({ email: form.email, password: form.password }),
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#241B12]/55 p-4 backdrop-blur-sm">
      <section className="relative grid w-full max-w-4xl overflow-hidden rounded-[28px] bg-[#FFFCF7] shadow-2xl md:grid-cols-[0.9fr_1.1fr]">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-[#766958] shadow-sm hover:bg-[#F4EBDD]">
          <X size={18} />
        </button>
        <div className="relative hidden min-h-[610px] flex-col justify-between overflow-hidden bg-[#4A3826] p-10 text-white md:flex">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(31,24,16,.2),rgba(31,24,16,.92)),url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1100&q=85')] bg-cover bg-center" />
          <div className="relative"><Brand light /></div>
          <div className="relative">
            <span className="eyebrow text-[#E8C78D]">A better way to work</span>
            <h2 className="mt-4 max-w-sm font-serif text-4xl leading-tight">Your next chapter begins with the right connection.</h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/75">Discover meaningful opportunities and connect with employers shaping Kenya's future.</p>
          </div>
          <p className="relative text-xs text-white/55">© 2026 JobLink · Built for opportunity in Kenya.</p>
        </div>
        <div className="flex items-center px-7 py-12 sm:px-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 md:hidden"><Brand /></div>
            <p className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Join the community'}</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-[#30251B]">{mode === 'login' ? 'Sign in to JobLink' : 'Create your account'}</h2>
            <p className="mt-2 text-sm leading-6 text-[#887B6B]">{mode === 'login' ? 'Pick up where your career journey left off.' : 'Build your profile and find your next opportunity.'}</p>
            <form onSubmit={submit} className="mt-8 space-y-4">
              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="field-label">First name<input required name="first_name" value={form.first_name} onChange={update} placeholder="First name" className="field-input" /></label>
                    <label className="field-label">Last name<input required name="last_name" value={form.last_name} onChange={update} placeholder="Last name" className="field-input" /></label>
                  </div>
                  <label className="field-label">I am joining as
                    <select name="role" value={form.role} onChange={update} className="field-input">
                      <option value="job_seeker">Job seeker</option>
                      <option value="employer">Employer</option>
                    </select>
                  </label>
                </>
              )}
              <label className="field-label">Email address<input required type="email" name="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" className="field-input" /></label>
              <label className="field-label">Password
                <div className="relative">
                  <input required minLength={8} type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={update} placeholder="At least 8 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="field-input pr-12" />
                  <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B8D7B]">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
              </label>
              {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <button disabled={loading} className="btn-primary w-full justify-center py-3.5">{loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></button>
            </form>
            <p className="mt-7 text-center text-sm text-[#887B6B]">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }} className="ml-1 font-semibold text-[#81551E] hover:underline">{mode === 'login' ? 'Create one' : 'Sign in'}</button>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function PublicSite({ onAuth, jobs, loading, search, setSearch, location, setLocation }) {
  const filtered = useMemo(() => jobs.filter(job => {
    const q = search.toLowerCase()
    const place = location.toLowerCase()
    return (!q || `${job.title} ${job.company} ${job.description} ${(job.skills || []).join(' ')}`.toLowerCase().includes(q))
      && (!place || (job.location || '').toLowerCase().includes(place))
  }), [jobs, search, location])

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#30251B]">
      <header className="site-header">
        <div className="page-shell flex h-[82px] items-center justify-between">
          <Brand />
          <nav className="hidden items-center gap-9 md:flex">
            <a href="#opportunities" className="nav-link">Find jobs</a>
            <a href="#categories" className="nav-link">Explore careers</a>
            <a href="#employers" className="nav-link">For employers</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => onAuth('login')} className="hidden px-3 py-2 text-sm font-semibold text-[#5E4A34] hover:text-[#9A6B2D] sm:block">Log in</button>
            <button onClick={() => onAuth('register')} className="btn-primary !px-5 !py-2.5">Get started <ArrowUpRight size={15} /></button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-wrap">
          <div className="hero-photo" />
          <div className="page-shell relative z-10 grid min-h-[590px] items-center gap-10 py-16 lg:grid-cols-[1.05fr_.95fr]">
            <div className="max-w-2xl text-white">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[.17em] text-[#F3D9A9] backdrop-blur">
                <Sparkles size={14} /> Your career, thoughtfully connected
              </span>
              <h1 className="mt-7 font-serif text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-[68px]">Find work that <span className="italic text-[#E9C78F]">moves you.</span></h1>
              <p className="mt-6 max-w-lg text-base leading-8 text-white/80">Discover verified opportunities, connect with ambitious companies and take your next step with confidence.</p>
              <div className="mt-9 flex flex-wrap gap-5 text-xs text-white/75">
                <span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#E9C78F]" /> Verified employers</span>
                <span className="flex items-center gap-2"><Globe2 size={15} className="text-[#E9C78F]" /> Opportunities across Kenya</span>
              </div>
            </div>
            <div className="rounded-[25px] border border-white/50 bg-[#FFFCF7] p-5 shadow-[0_25px_80px_rgba(0,0,0,.25)] sm:p-7">
              <p className="eyebrow">Start your search</p>
              <h2 className="mt-2 font-serif text-2xl font-bold">The right opportunity is out there.</h2>
              <p className="mt-2 text-sm text-[#8B7C6A]">Search roles that match your skills and ambition.</p>
              <form onSubmit={event => { event.preventDefault(); document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' }) }} className="mt-6 space-y-3">
                <label className="search-field"><Search size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Job title, skill or company" /></label>
                <label className="search-field"><MapPin size={18} /><input value={location} onChange={event => setLocation(event.target.value)} placeholder="City, county or remote" /></label>
                <button className="btn-primary w-full justify-center py-3.5">Explore opportunities <ArrowRight size={16} /></button>
              </form>
              <p className="mt-4 text-center text-[11px] text-[#9A8D7C]">Find your next role, one search at a time.</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#FBF7F0] to-transparent" />
        </section>

        <section className="page-shell -mt-1 py-12">
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#E9DFD0] bg-[#F5EBDD] p-5 sm:grid-cols-4 sm:p-7">
            {[
              ['A considered search', 'Find roles that fit your goals'],
              ['Trusted listings', 'Opportunities from reviewed employers'],
              ['Career visibility', 'Keep your applications organised'],
              ['Local opportunity', 'Built around the Kenyan market'],
            ].map(([title, detail]) => <div key={title} className="px-2 py-2"><p className="font-serif text-lg font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-[#8B7C6A]">{detail}</p></div>)}
          </div>
        </section>

        <section id="categories" className="page-shell py-14">
          <div className="section-heading">
            <div><p className="eyebrow">Explore your path</p><h2 className="section-title">Find your field.</h2><p className="section-copy">Explore opportunities across the industries shaping tomorrow.</p></div>
            <a href="#opportunities" className="text-sm font-semibold text-[#81551E]">Browse all jobs <ArrowRight size={15} className="ml-1 inline" /></a>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((item, index) => (
              <button key={item.name} onClick={() => { setSearch(item.search); document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' }) }} className="category-card text-left">
                <span className="text-[11px] font-semibold tracking-widest text-[#B18A53]">0{index + 1}</span>
                <span className="mt-5 block font-serif text-xl font-bold">{item.name}</span>
                <span className="mt-1 block text-xs text-[#958675]">{item.count}</span>
                <ArrowUpRight className="absolute right-5 top-5 text-[#A9854F]" size={18} />
              </button>
            ))}
          </div>
        </section>

        <section id="opportunities" className="bg-[#F2E9DC] py-16">
          <div className="page-shell">
            <div className="section-heading">
              <div><p className="eyebrow">Curated opportunities</p><h2 className="section-title">Roles worth exploring.</h2><p className="section-copy">Discover opportunities posted by verified employers.</p></div>
              <span className="text-xs text-[#8C7A64]">{filtered.length} opportunities</span>
            </div>
            <div className="mt-7 grid gap-4 lg:grid-cols-2">
              {loading ? <div className="surface-card p-8 text-sm text-[#8C7A64]">Loading opportunities…</div> : filtered.length === 0 ? (
                <div className="surface-card p-10 text-center lg:col-span-2"><BriefcaseBusiness className="mx-auto text-[#B18A53]" size={28} /><h3 className="mt-3 font-serif text-xl font-bold">No matching opportunities yet</h3><p className="mt-2 text-sm text-[#8C7A6A]">Try another search or check back soon.</p></div>
              ) : filtered.slice(0, 6).map(job => (
                <article key={job.id} className="surface-card p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F0E4D1] font-serif text-lg font-bold text-[#81551E]">{job.company?.[0]?.toUpperCase() || 'J'}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><h3 className="font-serif text-lg font-bold">{job.title}</h3><span className="verified-pill"><CheckCircle2 size={12} /> Verified</span></div>
                      <p className="mt-1 text-sm text-[#806F5C]">{job.company}</p>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#91816E]">
                        {job.location && <span><MapPin size={13} className="mr-1 inline" />{job.location}</span>}
                        {job.job_type && <span><BriefcaseBusiness size={13} className="mr-1 inline" />{job.job_type}</span>}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#857765]">{job.description}</p>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEE5D9] pt-4">
                    <span className="text-sm font-semibold text-[#72501F]">{job.salary_range || 'Salary not disclosed'}</span>
                    <button onClick={() => onAuth('login')} className="btn-outline">View opportunity <ArrowRight size={14} /></button>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-8 text-center"><button onClick={() => onAuth('register')} className="btn-primary">Create an account to apply <ArrowRight size={15} /></button></div>
          </div>
        </section>

        <section id="employers" className="page-shell py-16">
          <div className="relative overflow-hidden rounded-[28px] bg-[#4A3826] px-7 py-12 text-white sm:px-12 sm:py-14">
            <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/10" />
            <div className="relative max-w-2xl">
              <p className="eyebrow !text-[#E7C58C]">For employers</p>
              <h2 className="mt-3 font-serif text-3xl font-bold leading-tight sm:text-4xl">Meet the people who will move your business forward.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">Build your company presence, publish opportunities and manage applications in one place.</p>
              <button onClick={() => onAuth('register', 'employer')} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#D9AA61] px-5 py-3 text-sm font-bold text-[#382819] hover:bg-[#E8C78F]">Find your next hire <ArrowRight size={16} /></button>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-[#E9DFD1] bg-[#F7F0E6]">
        <div className="page-shell flex flex-col justify-between gap-5 py-8 sm:flex-row sm:items-center"><div><Brand /><p className="mt-2 text-xs text-[#978875]">Connecting talent with opportunity across Kenya.</p></div><p className="text-xs text-[#978875]">© 2026 JobLink. All rights reserved.</p></div>
      </footer>
    </div>
  )
}

function JobSeekerWorkspace({ user, onLogout }) {
  const [active, setActive] = useState('Overview')
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [saved, setSaved] = useState([])
  const [notifications, setNotifications] = useState([])
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('All')
  const [selectedJob, setSelectedJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [jobData, applicationData, savedData, notificationData] = await Promise.all([
        apiRequest('/jobs/'),
        apiRequest('/applications/mine'),
        apiRequest('/saved-jobs/'),
        apiRequest('/notifications/'),
      ])
      setJobs(jobData)
      setApplications(applicationData)
      setSaved(savedData)
      setNotifications(notificationData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (active) load()
    })
    return () => { active = false }
  }, [load])

  const filteredJobs = useMemo(() => jobs.filter(job => {
    const q = search.toLowerCase()
    const place = location.toLowerCase()
    const matchesText = !q || `${job.title} ${job.company} ${job.description} ${(job.skills || []).join(' ')}`.toLowerCase().includes(q)
    const matchesLocation = !place || (job.location || '').toLowerCase().includes(place)
    const matchesType = type === 'All' || (job.job_type || '').toLowerCase().includes(type.toLowerCase())
    return matchesText && matchesLocation && matchesType
  }), [jobs, search, location, type])

  const visibleJobs = active === 'Saved jobs' ? filteredJobs.filter(job => saved.includes(job.id)) : filteredJobs
  const appliedIds = new Set(applications.map(item => item.job_id))

  async function toggleSaved(id) {
    try {
      if (saved.includes(id)) {
        await apiRequest(`/saved-jobs/${id}`, { method: 'DELETE' })
        setSaved(current => current.filter(item => item !== id))
        setNotice('Removed from your saved jobs.')
      } else {
        await apiRequest(`/saved-jobs/${id}`, { method: 'POST' })
        setSaved(current => [...current, id])
        setNotice('Opportunity saved to your shortlist.')
      }
    } catch (err) { setError(err.message) }
  }

  async function apply(id) {
    setApplying(id)
    setError('')
    try {
      await apiRequest('/applications/', { method: 'POST', body: JSON.stringify({ job_id: id }) })
      setNotice('Your application has been submitted.')
      await load()
    } catch (err) { setError(err.message) } finally { setApplying(null) }
  }

  async function markRead(id) {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' })
      setNotifications(current => current.map(item => item.id === id ? { ...item, is_read: true } : item))
    } catch (err) { setError(err.message) }
  }

  const nav = [
    ['Overview', Compass], ['Find jobs', Search], ['Applications', FileText],
    ['Saved jobs', Bookmark], ['Notifications', Bell],
  ]

  return (
    <div className="workspace">
      {mobileOpen && <button aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-[#21180F]/40 lg:hidden" />}
      <aside className={`workspace-sidebar ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-6 pb-8 pt-7"><Brand /><p className="mt-2 pl-1 text-[10px] font-semibold uppercase tracking-[.18em] text-[#A18F78]">Career workspace</p></div>
        <p className="sidebar-label">Workspace</p>
        <nav className="space-y-1 px-3">
          {nav.map(([label, Icon]) => <button key={label} onClick={() => { setActive(label); setMobileOpen(false); setNotice('') }} className={`sidebar-link ${active === label ? 'sidebar-link-active' : ''}`}><Icon size={17} />{label}{label === 'Notifications' && notifications.some(item => !item.is_read) && <span className="ml-auto h-2 w-2 rounded-full bg-[#B7863E]" />}</button>)}
        </nav>
        <div className="mx-5 mt-9 rounded-2xl bg-[#F1E6D6] p-4">
          <Sparkles size={18} className="text-[#956A2E]" />
          <p className="mt-3 font-serif text-base font-bold">A new opportunity awaits.</p>
          <p className="mt-1 text-xs leading-5 text-[#8D7A63]">Explore roles from employers across Kenya.</p>
          <button onClick={() => setActive('Find jobs')} className="mt-3 text-xs font-bold text-[#81551E]">Explore jobs <ArrowRight size={13} className="ml-1 inline" /></button>
        </div>
        <div className="mt-auto border-t border-[#EDE4D8] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-[#F7F1E8] p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DCC49E] font-serif font-bold text-[#60451F]">{user.first_name?.[0]}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.first_name} {user.last_name}</p><p className="text-xs text-[#988875]">Job seeker</p></div><button onClick={onLogout} aria-label="Sign out" className="text-[#8F806D] hover:text-[#81551E]"><LogOut size={17} /></button></div>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="workspace-topbar">
          <div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-[#75634F] lg:hidden"><Menu size={20} /></button><div><p className="text-[11px] text-[#9B8A76]">{new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p><p className="mt-0.5 text-sm font-semibold">Welcome back, {user.first_name}</p></div></div>
          <button onClick={() => setActive('Notifications')} className="relative rounded-xl border border-[#E9DFD2] bg-white p-2.5 text-[#806C53]"><Bell size={17} />{notifications.some(item => !item.is_read) && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#B7863E]" />}</button>
        </header>
        <div className="workspace-content">
          {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {notice && <div role="status" className="mb-5 rounded-xl border border-[#E6D4B7] bg-[#F8F0E3] p-3 text-sm text-[#775523]">{notice}</div>}

          {active === 'Overview' && <>
            <section className="workspace-hero">
              <div className="relative z-10 max-w-2xl"><p className="eyebrow !text-[#E8C991]">Your career journey</p><h1 className="mt-4 font-serif text-3xl font-bold leading-tight sm:text-4xl">Make room for your <span className="italic text-[#E7C58C]">next chapter.</span></h1><p className="mt-3 max-w-lg text-sm leading-7 text-white/70">Discover meaningful work, follow your applications and keep promising opportunities close.</p><button onClick={() => setActive('Find jobs')} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#D9AA61] px-5 py-3 text-sm font-bold text-[#382819]">Explore opportunities <ArrowRight size={15} /></button></div>
              <div className="absolute -right-10 -top-20 h-72 w-72 rounded-full border border-white/10" />
            </section>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['Applications', applications.length, FileText, 'Your active journey'],
                ['Available roles', jobs.length, BriefcaseBusiness, 'Verified opportunities'],
                ['Saved roles', saved.length, Bookmark, 'Your shortlist'],
              ].map(([label, value, Icon, detail]) => <article key={label} className="metric-card"><div className="flex items-center justify-between"><span className="text-sm text-[#887865]">{label}</span><span className="metric-icon"><Icon size={17} /></span></div><p className="mt-5 font-serif text-3xl font-bold">{value}</p><p className="mt-1 text-xs text-[#A0917F]">{detail}</p></article>)}
            </div>
            <section><div className="section-heading"><div><p className="eyebrow">Explore by interest</p><h2 className="section-title">Where would you like to grow?</h2></div></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{categories.map(item => <button key={item.name} onClick={() => { setSearch(item.search); setActive('Find jobs') }} className="category-card !min-h-[130px] text-left"><span className="font-serif text-lg font-bold">{item.name}</span><span className="mt-2 text-xs text-[#958675]">{item.count}</span><ArrowUpRight className="absolute right-4 top-4 text-[#A9854F]" size={17} /></button>)}</div></section>
            <JobList jobs={jobs.slice(0, 3)} saved={saved} appliedIds={appliedIds} onSave={toggleSaved} onApply={apply} onSelect={setSelectedJob} applying={applying} />
          </>}

          {active === 'Applications' && <section><p className="eyebrow">Your career journey</p><h1 className="section-title mt-2">Application tracker</h1><p className="section-copy">Keep up with every opportunity you've pursued.</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{[['All applications', applications.length], ['Under review', applications.filter(item => item.status === 'Under Review').length], ['Shortlisted', applications.filter(item => item.status === 'Shortlisted').length]].map(([label, value]) => <div className="metric-card" key={label}><p className="text-sm text-[#887865]">{label}</p><p className="mt-3 font-serif text-3xl font-bold">{value}</p></div>)}</div><div className="mt-6 space-y-3">{applications.length ? applications.map(item => <article key={item.id} className="surface-card flex flex-wrap items-center justify-between gap-4 p-5"><div><h3 className="font-serif text-lg font-bold">{item.job_title}</h3><p className="mt-1 text-sm text-[#887865]">{item.company}</p><p className="mt-2 text-xs text-[#A0917F]">Applied {new Date(item.applied_at).toLocaleDateString('en-KE')}</p></div><span className="status-pill">{item.status}</span></article>) : <EmptyState title="Your story starts with an application." detail="When you apply for a role, you can follow its progress here." action="Find jobs" onAction={() => setActive('Find jobs')} />}</div></section>}

          {(active === 'Find jobs' || active === 'Saved jobs') && <>
            <p className="eyebrow">{active === 'Saved jobs' ? 'Your shortlist' : 'Discover opportunities'}</p><h1 className="section-title mt-2">{active === 'Saved jobs' ? 'Saved opportunities' : 'Find your next role.'}</h1><p className="section-copy">Search opportunities from verified employers across Kenya.</p>
            <div className="surface-card mt-6 p-4 sm:p-5"><div className="grid gap-3 md:grid-cols-[1.4fr_1fr]"><label className="search-field"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Role, skill or company" /></label><label className="search-field"><MapPin size={17} /><input value={location} onChange={event => setLocation(event.target.value)} placeholder="Town, county or remote" /></label></div><div className="mt-4 flex flex-wrap gap-2">{jobTypes.map(item => <button key={item} onClick={() => setType(item)} className={`filter-chip ${type === item ? 'filter-chip-active' : ''}`}>{item}</button>)}</div></div>
            <JobList jobs={visibleJobs} saved={saved} appliedIds={appliedIds} onSave={toggleSaved} onApply={apply} onSelect={setSelectedJob} applying={applying} loading={loading} />
          </>}

          {active === 'Notifications' && <section><p className="eyebrow">Stay informed</p><h1 className="section-title mt-2">Notifications</h1><p className="section-copy">Updates about your applications and activity.</p><div className="mt-6 space-y-3">{notifications.length ? notifications.map(item => <article key={item.id} className={`surface-card flex items-start gap-4 p-5 ${!item.is_read ? 'border-[#D8BD91]' : ''}`}><span className="metric-icon"><Bell size={17} /></span><div className="min-w-0 flex-1"><p className="text-sm leading-6">{item.message}</p><p className="mt-2 text-xs text-[#A0917F]">{new Date(item.created_at).toLocaleString('en-KE')}</p></div>{!item.is_read && <button onClick={() => markRead(item.id)} className="text-xs font-semibold text-[#81551E]">Mark read</button>}</article>) : <EmptyState title="You're all caught up." detail="New updates will appear here." />}</div></section>}
          <footer className="mt-12 flex flex-wrap justify-between gap-3 border-t border-[#E9DFD2] py-5 text-[11px] text-[#A0917F]"><span>© 2026 JobLink</span><span>Connecting talent with opportunity across Kenya.</span></footer>
        </div>
      </main>

      {selectedJob && <JobModal job={selectedJob} saved={saved.includes(selectedJob.id)} applied={appliedIds.has(selectedJob.id)} applying={applying === selectedJob.id} onClose={() => setSelectedJob(null)} onSave={() => toggleSaved(selectedJob.id)} onApply={() => apply(selectedJob.id)} />}
    </div>
  )
}

function JobList({ jobs, saved, appliedIds, onSave, onApply, onSelect, applying, loading }) {
  return <section className="mt-8"><div className="section-heading"><div><p className="eyebrow">Verified listings</p><h2 className="section-title">Opportunities to explore.</h2></div><span className="text-xs text-[#9A8A76]">{jobs.length} roles</span></div><div className="mt-5 grid gap-4 lg:grid-cols-2">{loading ? <div className="surface-card p-8 text-sm text-[#8C7A64]">Loading opportunities…</div> : jobs.length ? jobs.map(job => <article key={job.id} className="surface-card p-5 transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F0E4D1] font-serif text-lg font-bold text-[#81551E]">{job.company?.[0]?.toUpperCase() || 'J'}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><button onClick={() => onSelect(job)} className="text-left font-serif text-lg font-bold hover:text-[#81551E]">{job.title}</button><span className="verified-pill"><CheckCircle2 size={12} /> Verified</span></div><p className="mt-1 text-sm text-[#806F5C]">{job.company}</p><div className="mt-3 flex flex-wrap gap-3 text-xs text-[#91816E]">{job.location && <span><MapPin size={13} className="mr-1 inline" />{job.location}</span>}{job.job_type && <span><BriefcaseBusiness size={13} className="mr-1 inline" />{job.job_type}</span>}</div></div><button aria-label="Save job" onClick={() => onSave(job.id)} className={`rounded-lg border p-2 ${saved.includes(job.id) ? 'border-[#C5A16B] bg-[#F6EBDD] text-[#81551E]' : 'border-[#E9DFD2] text-[#9A8A76]'}`}><Bookmark size={16} fill={saved.includes(job.id) ? 'currentColor' : 'none'} /></button></div><p className="mt-4 line-clamp-2 text-sm leading-6 text-[#857765]">{job.description}</p>{job.skills?.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{job.skills.slice(0, 4).map(skill => <span key={skill} className="skill-chip">{skill}</span>)}</div>}<div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEE5D9] pt-4"><span className="text-sm font-semibold text-[#72501F]">{job.salary_range || 'Salary not disclosed'}</span><div className="flex gap-2"><button onClick={() => onSelect(job)} className="btn-outline">Details</button><button disabled={appliedIds.has(job.id) || applying === job.id} onClick={() => onApply(job.id)} className="btn-primary !px-4 !py-2.5 disabled:opacity-50">{appliedIds.has(job.id) ? 'Applied' : applying === job.id ? 'Applying…' : 'Apply'}</button></div></div></article>) : <div className="surface-card p-10 text-center lg:col-span-2"><BriefcaseBusiness className="mx-auto text-[#B18A53]" size={28} /><h3 className="mt-3 font-serif text-xl font-bold">No opportunities to show</h3><p className="mt-2 text-sm text-[#8C7A64]">Try adjusting your filters or check back later.</p></div>}</div></section>
}

function JobModal({ job, saved, applied, applying, onClose, onSave, onApply }) {
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#241B12]/60 p-4 backdrop-blur-sm" onClick={onClose}><section role="dialog" aria-modal="true" onClick={event => event.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[25px] bg-[#FFFCF7] p-6 shadow-2xl sm:p-8"><div className="flex justify-between gap-4"><div><p className="eyebrow">Verified opportunity</p><h2 className="mt-2 font-serif text-2xl font-bold">{job.title}</h2><p className="mt-1 text-sm text-[#887865]">{job.company}</p></div><button onClick={onClose} className="h-fit rounded-lg border border-[#E9DFD2] p-2 text-[#887865]"><X size={18} /></button></div><div className="mt-6 grid gap-3 rounded-xl bg-[#F3EBDD] p-4 sm:grid-cols-3"><div><p className="eyebrow">Location</p><p className="mt-1 text-sm font-semibold">{job.location || 'Not specified'}</p></div><div><p className="eyebrow">Employment</p><p className="mt-1 text-sm font-semibold">{job.job_type || 'Not specified'}</p></div><div><p className="eyebrow">Salary</p><p className="mt-1 text-sm font-semibold">{job.salary_range || 'Not disclosed'}</p></div></div><h3 className="mt-7 font-serif text-lg font-bold">About this role</h3><p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#766957]">{job.description}</p>{job.skills?.length > 0 && <><h3 className="mt-6 font-serif text-lg font-bold">Skills and requirements</h3><div className="mt-3 flex flex-wrap gap-2">{job.skills.map(skill => <span className="skill-chip" key={skill}>{skill}</span>)}</div></>}<div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-[#E9DFD2] pt-5"><button onClick={onSave} className="btn-outline">{saved ? 'Remove saved job' : 'Save opportunity'}</button><button disabled={applied || applying} onClick={onApply} className="btn-primary disabled:opacity-50">{applied ? 'Already applied' : applying ? 'Submitting…' : 'Apply for this role'} <ArrowRight size={15} /></button></div></section></div>
}

function EmptyState({ title, detail, action, onAction }) {
  return <div className="surface-card px-6 py-14 text-center"><Compass className="mx-auto text-[#B18A53]" size={28} /><h2 className="mt-3 font-serif text-xl font-bold">{title}</h2><p className="mt-2 text-sm text-[#8C7A64]">{detail}</p>{action && <button onClick={onAction} className="btn-primary mt-5">{action}</button>}</div>
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('joblink_user')) } catch { return null }
  })
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    let mounted = true
    apiRequest('/jobs/').then(data => { if (mounted) setJobs(data) }).catch(() => {}).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  function openAuth(mode = 'login', role) {
    setAuthMode(mode)
    setAuthOpen(true)
    if (role) window.setTimeout(() => {
      const select = document.querySelector('select[name="role"]')
      if (select) select.value = role
    }, 0)
  }

  function logout() {
    localStorage.removeItem('joblink_token')
    localStorage.removeItem('joblink_user')
    setUser(null)
  }

  if (user?.role === 'employer') return <EmployerWorkspace user={user} onLogout={logout} />
  if (user?.role === 'admin') return <AdminWorkspace user={user} onLogout={logout} />
  if (user?.role === 'job_seeker') return <JobSeekerWorkspace user={user} onLogout={logout} />

  return <>
    <PublicSite onAuth={openAuth} jobs={jobs} loading={loading} search={search} setSearch={setSearch} location={location} setLocation={setLocation} />
    {authOpen && <AuthScreen onAuthenticated={setUser} onClose={() => setAuthOpen(false)} initialMode={authMode} />}
  </>
}
