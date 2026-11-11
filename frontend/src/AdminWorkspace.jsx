import { useCallback, useEffect, useState } from 'react'
import {
  LayoutDashboard, Users, Building2, BriefcaseBusiness, CheckCircle2,
  Clock3, LogOut, RefreshCw, Menu, X,
  AlertCircle, Search, FileCheck2, MapPin, ChevronRight
} from 'lucide-react'
import { apiRequest } from './api'
import ThemeToggle from './ThemeToggle'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Employers', icon: Building2 },
  { label: 'Job approvals', icon: BriefcaseBusiness },
]

function Panel({ children, className = '' }) {
  return <section className={`rounded-2xl border border-[#EAE4DA] bg-white p-5 shadow-[0_4px_24px_rgba(56,40,25,0.035)] sm:p-6 ${className}`}>{children}</section>
}

function Metric({ label, value, note, icon: Icon }) {
  return (
    <Panel>
      <div className="flex items-start justify-between">
        <div><p className="text-sm text-[#887D71]">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight text-[#342A22]">{value}</p><p className="mt-1 text-xs text-[#A1978B]">{note}</p></div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5EFE5] text-[#967344]"><Icon size={19} strokeWidth={1.7} /></span>
      </div>
    </Panel>
  )
}

function Status({ verified }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>{verified ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}{verified ? 'Verified' : 'Pending review'}</span>
}

function AdminWorkspace({ user, onLogout }) {
  const [active, setActive] = useState('Overview')
  const [dashboard, setDashboard] = useState(null)
  const [employers, setEmployers] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [processing, setProcessing] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [employerSearch, setEmployerSearch] = useState('')
  const [jobSearch, setJobSearch] = useState('')

  const loadData = useCallback(async () => {
    setError('')
    try {
      const [stats, employerRecords, jobRecords] = await Promise.all([
        apiRequest('/admin/dashboard'),
        apiRequest('/admin/employers'),
        apiRequest('/admin/jobs'),
      ])
      setDashboard(stats)
      setEmployers(Array.isArray(employerRecords) ? employerRecords : employerRecords.employers || [])
      setJobs(Array.isArray(jobRecords) ? jobRecords : jobRecords.jobs || [])
    } catch (err) {
      setError(err.message || 'Unable to load administration data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let activeEffect = true
    Promise.resolve().then(() => {
      if (activeEffect) loadData()
    })
    return () => { activeEffect = false }
  }, [loadData])

  async function verifyItem(type, id) {
    const key = `${type}-${id}`
    setProcessing(key)
    setMessage('')
    setError('')
    try {
      await apiRequest(`/admin/${type}/${id}/verify`, { method: 'PATCH' })
      setMessage(type === 'employers' ? 'Employer verified successfully.' : 'Job listing approved successfully.')
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing('')
    }
  }

  async function refreshData() {
    setLoading(true)
    await loadData()
  }

  function changePage(page) {
    setActive(page)
    setMobileOpen(false)
    setMessage('')
    setError('')
  }

  const pendingEmployers = employers.filter((item) => !item.verified)
  const pendingJobs = jobs.filter((item) => !item.verified)
  const stats = [
    { label: 'Total users', value: dashboard?.users ?? 0, icon: Users, note: 'Registered accounts' },
    { label: 'Employers', value: dashboard?.employers ?? 0, icon: Building2, note: 'Company profiles' },
    { label: 'Job listings', value: dashboard?.jobs ?? 0, icon: BriefcaseBusiness, note: 'Across the platform' },
    { label: 'Pending reviews', value: (dashboard?.pending_employers ?? 0) + (dashboard?.pending_jobs ?? 0), icon: Clock3, note: 'Awaiting approval' },
  ]

  const visibleEmployers = employers.filter((item) => `${item.company_name || ''} ${item.location || ''}`.toLowerCase().includes(employerSearch.toLowerCase()))
  const visibleJobs = jobs.filter((item) => `${item.title || ''} ${item.company || ''}`.toLowerCase().includes(jobSearch.toLowerCase()))

  function SidebarContent() {
    return (
      <>
        <div className="border-b border-[#EAE4DA] px-6 py-7">
          <a href="/" className="font-serif text-2xl font-semibold tracking-tight text-[#3C2E24]">JobLink<span className="text-[#A9824D]">.</span></a>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A39789]">Administration</p>
        </div>
        <div className="px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A39789]">Platform management</p>
          <nav className="space-y-1">{navigation.map(({ label, icon: Icon }) => (
            <button key={label} onClick={() => changePage(label)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${active === label ? 'bg-[#F2EBDD] font-semibold text-[#61472C]' : 'text-[#766B60] hover:bg-[#F8F5F0]'}`}>
              <Icon size={18} strokeWidth={1.7} />{label}{active === label && <ChevronRight className="ml-auto" size={16} />}
            </button>
          ))}</nav>
        </div>
        <div className="mt-auto border-t border-[#EAE4DA] p-4">
          <div className="mb-4 rounded-xl bg-[#F8F5F0] p-3"><p className="text-sm font-semibold text-[#49392D]">{user.first_name} {user.last_name || ''}</p><p className="mt-1 truncate text-xs text-[#958A7D]">{user.email}</p></div>
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#887D71] hover:bg-[#F8F5F0] hover:text-[#49392D]"><LogOut size={17} />Sign out</button>
        </div>
      </>
    )
  }

  function Header() {
    return (
      <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#EAE4DA] bg-[#FBF9F5]/95 px-5 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3"><button className="rounded-lg p-2 text-[#66594D] lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={21} /></button><div><p className="font-serif text-xl text-[#3C2E24]">{active}</p><p className="hidden text-xs text-[#9B9084] sm:block">Monitor and manage the JobLink platform</p></div></div>
        <div className="flex items-center gap-3"><ThemeToggle /><span className="hidden text-sm text-[#82766A] sm:block">Administrator</span><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDE3D4] text-sm font-semibold text-[#755632]">{(user.first_name || 'A').charAt(0).toUpperCase()}</span></div>
      </header>
    )
  }

  function Alerts() {
    return (
      <>
        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}
        {message && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
            {message}
          </div>
        )}
      </>
    )
  }

  function Empty({ text }) {
    return <div className="py-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F5EFE5] text-[#987447]"><FileCheck2 size={20} /></span><p className="mt-3 text-sm text-[#887D71]">{text}</p></div>
  }

  function Overview() {
    return (
      <div className="space-y-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A1845C]">Platform overview</p><h1 className="mt-2 font-serif text-3xl text-[#3C2E24] sm:text-4xl">Good evening, {user.first_name}.</h1><p className="mt-2 text-sm text-[#887D71]">Here is what is happening across JobLink.</p></div><button onClick={refreshData} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5DCCF] bg-white px-4 py-3 text-sm font-semibold text-[#6D5942] hover:bg-[#F8F5F0]"><RefreshCw size={16} /> Refresh data</button></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <Metric key={stat.label} {...stat} />)}</div>
        <div className="grid gap-5 xl:grid-cols-2">
          <Panel>
            <div className="flex items-center justify-between"><div><h2 className="font-serif text-xl text-[#49372A]">Employer verification</h2><p className="mt-1 text-xs text-[#9B9084]">Companies awaiting review</p></div><button onClick={() => changePage('Employers')} className="text-xs font-semibold text-[#987447] hover:underline">Review all</button></div>
            {pendingEmployers.length === 0 ? Empty({ text: "All employer profiles have been reviewed." }) : <div className="mt-4 divide-y divide-[#F0EBE4]">{pendingEmployers.slice(0, 4).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 py-4"><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#49372A]">{item.company_name}</p><p className="mt-1 text-xs text-[#94897D]">{item.location || 'Location not provided'}</p></div><Status verified={false} /></div>)}</div>}
          </Panel>
          <Panel>
            <div className="flex items-center justify-between"><div><h2 className="font-serif text-xl text-[#49372A]">Job listing approvals</h2><p className="mt-1 text-xs text-[#9B9084]">Listings awaiting review</p></div><button onClick={() => changePage('Job approvals')} className="text-xs font-semibold text-[#987447] hover:underline">Review all</button></div>
            {pendingJobs.length === 0 ? Empty({ text: "There are no job listings awaiting approval." }) : <div className="mt-4 divide-y divide-[#F0EBE4]">{pendingJobs.slice(0, 4).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 py-4"><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#49372A]">{item.title}</p><p className="mt-1 text-xs text-[#94897D]">{item.company || 'Company not provided'}</p></div><Status verified={false} /></div>)}</div>}
          </Panel>
        </div>
      </div>
    )
  }

  function Employers() {
    return (
      <div className="space-y-6">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A1845C]">Company accounts</p><h1 className="mt-2 font-serif text-3xl text-[#3C2E24]">Employer verification</h1><p className="mt-2 text-sm text-[#887D71]">Review company profiles before they can publish job opportunities.</p></div>
        <Panel>
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A39789]" size={17} /><input value={employerSearch} onChange={(e) => setEmployerSearch(e.target.value)} placeholder="Search company or location" className="w-full rounded-xl border border-[#E8E1D7] bg-[#FFFEFC] py-3 pl-10 pr-4 text-sm text-[#342A22] outline-none focus:border-[#A9824D]" /></div>
          {visibleEmployers.length === 0 ? Empty({ text: "No employer profiles found." }) : <div className="mt-5 divide-y divide-[#F0EBE4]">{visibleEmployers.map((item) => <article key={item.id} className="flex flex-col justify-between gap-4 py-5 first:pt-0 sm:flex-row sm:items-center"><div className="flex min-w-0 gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1E9DD] text-[#8A6A43]"><Building2 size={18} /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#49372A]">{item.company_name}</p><p className="mt-1 flex items-center gap-1 text-xs text-[#94897D]"><MapPin size={12} />{item.location || 'Location not provided'}</p></div></div><div className="flex items-center gap-3"><Status verified={Boolean(item.verified)} />{!item.verified && <button disabled={processing === `employers-${item.id}`} onClick={() => verifyItem('employers', item.id)} className="rounded-lg bg-[#49372A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#624A37] disabled:opacity-50">{processing === `employers-${item.id}` ? 'Approving...' : 'Verify employer'}</button>}</div></article>)}</div>}
        </Panel>
      </div>
    )
  }

  function JobApprovals() {
    return (
      <div className="space-y-6">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A1845C]">Listing moderation</p><h1 className="mt-2 font-serif text-3xl text-[#3C2E24]">Job approvals</h1><p className="mt-2 text-sm text-[#887D71]">Review job listings before they become visible to candidates.</p></div>
        <Panel>
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A39789]" size={17} /><input value={jobSearch} onChange={(e) => setJobSearch(e.target.value)} placeholder="Search job title or company" className="w-full rounded-xl border border-[#E8E1D7] bg-[#FFFEFC] py-3 pl-10 pr-4 text-sm text-[#342A22] outline-none focus:border-[#A9824D]" /></div>
          {visibleJobs.length === 0 ? Empty({ text: "No job listings found." }) : <div className="mt-5 divide-y divide-[#F0EBE4]">{visibleJobs.map((item) => <article key={item.id} className="flex flex-col justify-between gap-4 py-5 first:pt-0 sm:flex-row sm:items-center"><div className="flex min-w-0 gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1E9DD] text-[#8A6A43]"><BriefcaseBusiness size={18} /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#49372A]">{item.title}</p><p className="mt-1 text-xs text-[#94897D]">{item.company || 'Company not provided'}</p></div></div><div className="flex items-center gap-3"><Status verified={Boolean(item.verified)} />{!item.verified && <button disabled={processing === `jobs-${item.id}`} onClick={() => verifyItem('jobs', item.id)} className="rounded-lg bg-[#49372A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#624A37] disabled:opacity-50">{processing === `jobs-${item.id}` ? 'Approving...' : 'Approve listing'}</button>}</div></article>)}</div>}
        </Panel>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#342A22]">
      {mobileOpen && <div className="fixed inset-0 z-40 bg-[#211910]/40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[258px] flex-col border-r border-[#EAE4DA] bg-[#FFFEFC] lg:flex">{SidebarContent()}</aside>
      {mobileOpen && <aside className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-[#EAE4DA] bg-[#FFFEFC] lg:hidden"><div className="flex justify-end p-3"><button onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>{SidebarContent()}</aside>}
      <div className="lg:pl-[258px]">{Header()}<main className="mx-auto max-w-[1440px] p-5 sm:p-8">{Alerts()}{loading ? <div className="flex min-h-[55vh] items-center justify-center text-sm text-[#8E8275]"><RefreshCw className="mr-2 animate-spin" size={18} />Loading administration workspace...</div> : <>{active === 'Overview' && Overview()}{active === 'Employers' && Employers()}{active === 'Job approvals' && JobApprovals()}</>}</main></div>
    </div>
  )
}

export default AdminWorkspace
