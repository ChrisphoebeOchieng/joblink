import { useCallback, useEffect, useState } from 'react'
import {
  LayoutDashboard, Users, Building2, BriefcaseBusiness,
  CheckCircle2, Clock3, ShieldCheck, LogOut, RefreshCw,
  Menu, X, ArrowUpRight
} from 'lucide-react'
import { apiRequest } from './api'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Employers', icon: Building2 },
  { label: 'Job approvals', icon: BriefcaseBusiness },
]

export default function AdminWorkspace({ user, onLogout }) {
  const [active, setActive] = useState('Overview')
  const [dashboard, setDashboard] = useState(null)
  const [employers, setEmployers] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [processing, setProcessing] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const loadData = useCallback(async () => {
    setError('')
    try {
      const [stats, employerRecords, jobRecords] = await Promise.all([
        apiRequest('/admin/dashboard'),
        apiRequest('/admin/employers'),
        apiRequest('/admin/jobs'),
      ])
      setDashboard(stats)
      setEmployers(employerRecords)
      setJobs(jobRecords)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    Promise.resolve().then(() => {
      if (active) loadData()
    })

    return () => {
      active = false
    }
  }, [loadData])

  async function verifyItem(type, id) {
    const key = `${type}-${id}`
    setProcessing(key)
    setMessage('')
    setError('')

    try {
      await apiRequest(`/admin/${type}/${id}/verify`, {
        method: 'PATCH',
      })
      setMessage(type === 'employers'
        ? 'Employer verified successfully.'
        : 'Job listing approved successfully.')
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing('')
    }
  }

  const pendingEmployers = employers.filter((item) => !item.verified)
  const pendingJobs = jobs.filter((item) => !item.verified)

  const stats = [
    { label: 'Total users', value: dashboard?.users ?? 0, icon: Users, note: 'Registered accounts' },
    { label: 'Employers', value: dashboard?.employers ?? 0, icon: Building2, note: 'Company profiles' },
    { label: 'Job listings', value: dashboard?.jobs ?? 0, icon: BriefcaseBusiness, note: 'Across the platform' },
    { label: 'Pending reviews', value: (dashboard?.pending_employers ?? 0) + (dashboard?.pending_jobs ?? 0), icon: Clock3, note: 'Awaiting approval' },
  ]

  async function refreshData() {
    setLoading(true)
    await loadData()
  }

  function changePage(page) {
    setActive(page)
    setMobileOpen(false)
    setMessage('')
  }

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#242124]">
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[258px] flex-col border-r border-gray-200 bg-white transition-transform lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-[76px] items-center gap-3 border-b border-gray-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#BC2132] text-white">
            <BriefcaseBusiness size={21} />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight">JobLink</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">Administration</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="ml-auto text-gray-400 lg:hidden">
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pb-3 pt-8">
          <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Workspace</p>
          <nav className="space-y-1">
            {navigation.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => changePage(label)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active === label
                    ? 'bg-[#FFF0F1] text-[#BC2132]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                {label}
                {label === 'Employers' && pendingEmployers.length > 0 && (
                  <span className="ml-auto rounded-full bg-[#FFF0F1] px-2 py-0.5 text-[10px] font-bold text-[#BC2132]">
                    {pendingEmployers.length}
                  </span>
                )}
                {label === 'Job approvals' && pendingJobs.length > 0 && (
                  <span className="ml-auto rounded-full bg-[#FFF0F1] px-2 py-0.5 text-[10px] font-bold text-[#BC2132]">
                    {pendingJobs.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-gray-100 p-5">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F9DDE0] text-sm font-bold text-[#8F1725]">
              {(user?.first_name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-[#BC2132]">
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-[258px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-gray-200 bg-white/95 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="text-gray-500 lg:hidden">
              <Menu size={22} />
            </button>
            <div>
              <p className="text-sm font-semibold">{active}</p>
              <p className="text-xs text-gray-400">JobLink administration</p>
            </div>
          </div>
          <button onClick={refreshData} disabled={loading} className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </header>

        <div className="mx-auto max-w-[1450px] space-y-7 px-5 py-7 sm:px-8 sm:py-9">
          <section className="relative overflow-hidden rounded-2xl bg-[#5C1019] p-6 text-white sm:p-9">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/65">
                <ShieldCheck size={16} /> Administration centre
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {active === 'Overview' ? 'Platform overview' : active}
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/70">
                {active === 'Overview'
                  ? 'Monitor platform activity, review employer registrations and keep job listings trustworthy.'
                  : active === 'Employers'
                    ? 'Review company profiles and approve employers before they can publish opportunities.'
                    : 'Review submitted opportunities and approve verified listings for job seekers.'}
              </p>
            </div>
            <div className="absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute -right-2 -top-14 h-52 w-52 rounded-full border border-white/10" />
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {active === 'Overview' && (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map(({ label, value, icon: Icon, note }) => (
                  <article key={label} className="rounded-2xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-500">{label}</p>
                      <div className="rounded-xl bg-[#FFF0F1] p-2.5 text-[#BC2132]">
                        <Icon size={18} />
                      </div>
                    </div>
                    <p className="mt-5 text-3xl font-bold tracking-tight">{loading ? '—' : value}</p>
                    <p className="mt-1 text-xs text-gray-400">{note}</p>
                  </article>
                ))}
              </section>

              <section className="grid gap-5 xl:grid-cols-2">
                <article className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold">Employer verification</h2>
                      <p className="mt-1 text-xs text-gray-400">Company profiles awaiting review</p>
                    </div>
                    <Building2 className="text-[#BC2132]" size={20} />
                  </div>
                  <p className="mt-5 text-3xl font-bold">{dashboard?.pending_employers ?? 0}</p>
                  <p className="mt-1 text-xs text-gray-400">Pending employer approvals</p>
                  <button onClick={() => changePage('Employers')} className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#BC2132] hover:underline">
                    Review employers <ArrowUpRight size={16} />
                  </button>
                </article>

                <article className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold">Job listing verification</h2>
                      <p className="mt-1 text-xs text-gray-400">Listings awaiting approval</p>
                    </div>
                    <BriefcaseBusiness className="text-[#BC2132]" size={20} />
                  </div>
                  <p className="mt-5 text-3xl font-bold">{dashboard?.pending_jobs ?? 0}</p>
                  <p className="mt-1 text-xs text-gray-400">Pending job approvals</p>
                  <button onClick={() => changePage('Job approvals')} className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#BC2132] hover:underline">
                    Review jobs <ArrowUpRight size={16} />
                  </button>
                </article>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-green-50 p-2.5 text-green-700"><CheckCircle2 size={20} /></div>
                  <div>
                    <h2 className="font-bold">Platform review centre</h2>
                    <p className="mt-1 text-xs text-gray-400">Keep employer profiles and job listings accurate and trustworthy.</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={() => changePage('Employers')} className="rounded-xl bg-[#BC2132] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#9F1C2A]">Review employers</button>
                  <button onClick={() => changePage('Job approvals')} className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">Review job listings</button>
                </div>
              </section>
            </>
          )}

          {active === 'Employers' && (
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 p-5 sm:p-6">
                <h2 className="font-bold">Employer accounts</h2>
                <p className="mt-1 text-xs text-gray-400">{employers.length} registered company profiles</p>
              </div>
              {loading ? (
                <p className="p-8 text-sm text-gray-400">Loading employer accounts...</p>
              ) : employers.length === 0 ? (
                <p className="p-8 text-sm text-gray-400">No employer profiles have been submitted yet.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {employers.map((item) => (
                    <div key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-gray-100 p-3 text-gray-500"><Building2 size={19} /></div>
                        <div>
                          <p className="font-semibold">{item.company_name}</p>
                          <p className="mt-1 text-xs text-gray-400">{item.location || 'Location not provided'}</p>
                          <p className="mt-2 text-[11px] text-gray-400">Employer ID: {item.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.verified ? (
                          <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                            <CheckCircle2 size={14} /> Verified
                          </span>
                        ) : (
                          <>
                            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">Pending review</span>
                            <button
                              disabled={processing === `employers-${item.id}`}
                              onClick={() => verifyItem('employers', item.id)}
                              className="rounded-xl bg-[#BC2132] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#9F1C2A] disabled:opacity-50"
                            >
                              {processing === `employers-${item.id}` ? 'Approving...' : 'Verify employer'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {active === 'Job approvals' && (
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 p-5 sm:p-6">
                <h2 className="font-bold">Job listings</h2>
                <p className="mt-1 text-xs text-gray-400">{jobs.length} submitted opportunities</p>
              </div>
              {loading ? (
                <p className="p-8 text-sm text-gray-400">Loading job listings...</p>
              ) : jobs.length === 0 ? (
                <p className="p-8 text-sm text-gray-400">No job listings have been submitted yet.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {jobs.map((item) => (
                    <div key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-gray-100 p-3 text-gray-500"><BriefcaseBusiness size={19} /></div>
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="mt-1 text-xs text-gray-400">{item.company}</p>
                          <p className="mt-2 text-[11px] text-gray-400">Listing ID: {item.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.verified ? (
                          <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                            <CheckCircle2 size={14} /> Approved
                          </span>
                        ) : (
                          <>
                            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">Pending review</span>
                            <button
                              disabled={processing === `jobs-${item.id}`}
                              onClick={() => verifyItem('jobs', item.id)}
                              className="rounded-xl bg-[#BC2132] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#9F1C2A] disabled:opacity-50"
                            >
                              {processing === `jobs-${item.id}` ? 'Approving...' : 'Approve job'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <footer className="flex flex-wrap justify-between gap-2 border-t border-gray-200 py-5 text-[11px] text-gray-400">
            <span>© 2026 JobLink. Administration workspace.</span>
            <span>Platform management</span>
          </footer>
        </div>
      </main>
    </div>
  )
}
