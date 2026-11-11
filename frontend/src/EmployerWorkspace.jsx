import { useCallback, useEffect, useState } from 'react'
import {
  LayoutDashboard, Building2, BriefcaseBusiness, Users, LogOut,
  Menu, MapPin, Plus, RefreshCw, ArrowUpRight, ShieldCheck,
  X, CheckCircle2, Clock3, Search, FileText, ChevronRight,
  AlertCircle, Send, UserRound
} from 'lucide-react'
import { apiRequest } from './api'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Company profile', icon: Building2 },
  { label: 'Post a job', icon: Plus },
  { label: 'My jobs', icon: BriefcaseBusiness },
  { label: 'Applicants', icon: Users },
]

const emptyProfile = { company_name: '', location: '', description: '' }
const emptyJob = {
  title: '', description: '', location: '', type: 'Full-time',
  salary: '', skills: '',
}
const statuses = ['Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Accepted']

function StatusPill({ verified }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
      verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
    }`}>
      {verified ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
      {verified ? 'Verified' : 'Pending verification'}
    </span>
  )
}

function Panel({ children, className = '' }) {
  return <section className={`rounded-2xl border border-[#EAE4DA] bg-white p-5 shadow-[0_4px_24px_rgba(56,40,25,0.035)] sm:p-6 ${className}`}>{children}</section>
}

function Field({ label, children, hint }) {
  return (
    <label className="block text-sm font-medium text-[#51483F]">
      {label}
      <div className="mt-2">{children}</div>
      {hint && <span className="mt-1.5 block text-xs font-normal text-[#958A7D]">{hint}</span>}
    </label>
  )
}

function Input({ className = '', ...props }) {
  return <input {...props} className={`w-full rounded-xl border border-[#E8E1D7] bg-[#FFFEFC] px-4 py-3 text-sm text-[#342A22] outline-none transition placeholder:text-[#B1A79B] focus:border-[#A9824D] focus:ring-2 focus:ring-[#A9824D]/10 ${className}`} />
}

function Textarea({ className = '', ...props }) {
  return <textarea {...props} className={`w-full rounded-xl border border-[#E8E1D7] bg-[#FFFEFC] px-4 py-3 text-sm text-[#342A22] outline-none transition placeholder:text-[#B1A79B] focus:border-[#A9824D] focus:ring-2 focus:ring-[#A9824D]/10 ${className}`} />
}

function Metric({ label, value, note, icon: Icon }) {
  return (
    <Panel>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#887D71]">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#342A22]">{value}</p>
          <p className="mt-1 text-xs text-[#A1978B]">{note}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5EFE5] text-[#967344]">
          <Icon size={19} strokeWidth={1.7} />
        </span>
      </div>
    </Panel>
  )
}

function EmployerWorkspace({ user, onLogout }) {
  const [active, setActive] = useState('Overview')
  const [profile, setProfile] = useState(null)
  const [profileForm, setProfileForm] = useState(emptyProfile)
  const [jobForm, setJobForm] = useState(emptyJob)
  const [jobs, setJobs] = useState([])
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [applicantSearch, setApplicantSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const loadWorkspace = useCallback(async () => {
    setError('')
    try {
      let currentProfile = null
      try {
        currentProfile = await apiRequest('/employers/profile')
      } catch (err) {
        if (!/not found|404/i.test(err.message)) throw err
      }

      setProfile(currentProfile)
      if (currentProfile) {
        setProfileForm({
          company_name: currentProfile.company_name || '',
          location: currentProfile.location || '',
          description: currentProfile.description || '',
        })
      }

      const [jobRecords, applicantRecords] = await Promise.all([
        apiRequest('/jobs/mine'),
        apiRequest('/applications/employer'),
      ])
      setJobs(Array.isArray(jobRecords) ? jobRecords : jobRecords.jobs || [])
      setApplicants(Array.isArray(applicantRecords) ? applicantRecords : applicantRecords.applications || [])
    } catch (err) {
      setError(err.message || 'Unable to load your workspace.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let activeEffect = true
    Promise.resolve().then(() => {
      if (activeEffect) loadWorkspace()
    })
    return () => { activeEffect = false }
  }, [loadWorkspace])

  function changePage(page) {
    setActive(page)
    setMobileOpen(false)
    setError('')
    setMessage('')
  }

  async function saveProfile(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const result = await apiRequest('/employers/profile', {
        method: 'POST',
        body: JSON.stringify(profileForm),
      })
      setProfile(result.profile || result)
      setMessage('Company profile submitted successfully. It will be reviewed by the JobLink team.')
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
      await apiRequest('/jobs/', {
        method: 'POST',
        body: JSON.stringify({
          title: jobForm.title,
          description: jobForm.description,
          location: jobForm.location,
          type: jobForm.type,
          salary: jobForm.salary,
          skills: jobForm.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
        }),
      })
      setJobForm(emptyJob)
      setMessage('Your job listing has been submitted for approval.')
      setActive('My jobs')
      await loadWorkspace()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function updateApplicant(applicationId, status) {
    setError('')
    setMessage('')
    try {
      await apiRequest(`/applications/${applicationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setApplicants((current) => current.map((item) =>
        item.id === applicationId ? { ...item, status } : item
      ))
      setMessage('Applicant status updated.')
    } catch (err) {
      setError(err.message)
    }
  }

  const visibleApplicants = applicants.filter((item) => {
    const name = `${item.applicant || ''} ${item.email || ''} ${item.job_title || ''}`.toLowerCase()
    return name.includes(applicantSearch.toLowerCase()) &&
      (statusFilter === 'All' || item.status === statusFilter)
  })

  const verifiedJobs = jobs.filter((job) => job.is_verified || job.verified).length
  const pendingJobs = jobs.length - verifiedJobs

  function SidebarContent() {
    return (
      <>
        <div className="border-b border-[#EAE4DA] px-6 py-7">
          <a href="/" className="font-serif text-2xl font-semibold tracking-tight text-[#3C2E24]">JobLink<span className="text-[#A9824D]">.</span></a>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A39789]">Employer workspace</p>
        </div>
        <div className="px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A39789]">Workspace</p>
          <nav className="space-y-1">
            {navigation.map(({ label, icon: Icon }) => (
              <button key={label} onClick={() => changePage(label)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                  active === label ? 'bg-[#F2EBDD] font-semibold text-[#61472C]' : 'text-[#766B60] hover:bg-[#F8F5F0]'
                }`}>
                <Icon size={18} strokeWidth={1.7} />{label}
                {active === label && <ChevronRight className="ml-auto" size={16} />}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto border-t border-[#EAE4DA] p-4">
          <div className="mb-4 rounded-xl bg-[#F8F5F0] p-3">
            <p className="truncate text-sm font-semibold text-[#49392D]">{profile?.company_name || user.first_name}</p>
            <p className="mt-1 truncate text-xs text-[#958A7D]">{user.email}</p>
          </div>
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#887D71] hover:bg-[#F8F5F0] hover:text-[#49392D]">
            <LogOut size={17} />Sign out
          </button>
        </div>
      </>
    )
  }

  function Header() {
    return (
      <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#EAE4DA] bg-[#FBF9F5]/95 px-5 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          <button className="rounded-lg p-2 text-[#66594D] lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div>
            <p className="font-serif text-xl text-[#3C2E24]">{active}</p>
            <p className="hidden text-xs text-[#9B9084] sm:block">Manage your company and recruitment activity</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-[#82766A] sm:block">Welcome, {user.first_name}</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDE3D4] text-sm font-semibold text-[#755632]">
            {(user.first_name || 'E').charAt(0).toUpperCase()}
          </span>
        </div>
      </header>
    )
  }

  function Alerts() {
    return (
      <>
        {error && <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</div>}
        {message && <div className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><CheckCircle2 size={17} className="mt-0.5 shrink-0" />{message}</div>}
      </>
    )
  }

  function Overview() {
    return (
      <div className="space-y-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A1845C]">Your recruitment hub</p>
            <h1 className="mt-2 font-serif text-3xl text-[#3C2E24] sm:text-4xl">Good to have you back.</h1>
            <p className="mt-2 text-sm text-[#887D71]">Here is an overview of your hiring activity.</p>
          </div>
          <button onClick={() => changePage('Post a job')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#49372A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#624A37]">
            <Plus size={17} /> Post a job
          </button>
        </div>

        {!profile && (
          <div className="rounded-2xl border border-[#E7D8BE] bg-[#F5EFE4] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-serif text-xl text-[#49372A]">Complete your company profile</p>
                <p className="mt-1 max-w-xl text-sm leading-6 text-[#796B5B]">Add your company details and submit them for verification before publishing job opportunities.</p>
              </div>
              <button onClick={() => changePage('Company profile')} className="shrink-0 rounded-xl bg-[#49372A] px-4 py-2.5 text-sm font-semibold text-white">Set up profile</button>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total job listings" value={jobs.length} note="All your submitted listings" icon={BriefcaseBusiness} />
          <Metric label="Approved listings" value={verifiedJobs} note="Visible to job seekers" icon={CheckCircle2} />
          <Metric label="Pending approval" value={pendingJobs} note="Awaiting platform review" icon={Clock3} />
          <Metric label="Applications" value={applicants.length} note="Candidates who applied" icon={Users} />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <Panel>
            <div className="flex items-center justify-between">
              <div><h2 className="font-serif text-xl text-[#49372A]">Recent job listings</h2><p className="mt-1 text-xs text-[#9B9084]">Your latest recruitment activity</p></div>
              <button onClick={() => changePage('My jobs')} className="text-xs font-semibold text-[#987447] hover:underline">View all</button>
            </div>
            {jobs.length === 0 ? <Empty text="You have not posted any jobs yet." /> : (
              <div className="mt-5 divide-y divide-[#F0EBE4]">
                {jobs.slice(0, 4).map((job) => (
                  <div key={job.id} className="flex items-center justify-between gap-3 py-4">
                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-[#49372A]">{job.title}</p><p className="mt-1 text-xs text-[#94897D]">{job.location || 'Location not specified'} · {job.job_type || job.type || 'Role'}</p></div>
                    <StatusPill verified={Boolean(job.is_verified || job.verified)} />
                  </div>
                ))}
              </div>
            )}
          </Panel>
          <Panel>
            <h2 className="font-serif text-xl text-[#49372A]">Company status</h2>
            <p className="mt-1 text-xs text-[#9B9084]">Your profile verification</p>
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#F8F5F0] p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDE3D4] text-[#8C6A3E]"><ShieldCheck size={21} /></span>
              <div><p className="text-sm font-semibold text-[#49372A]">{profile?.company_name || 'Profile not submitted'}</p><p className="mt-1 text-xs text-[#8F8478]">{profile ? 'Company verification' : 'Complete your company details'}</p></div>
            </div>
            <div className="mt-4"><StatusPill verified={Boolean(profile?.is_verified)} /></div>
            {profile?.location && <p className="mt-4 flex items-center gap-2 text-xs text-[#8F8478]"><MapPin size={14} />{profile.location}</p>}
            <button onClick={() => changePage('Company profile')} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#987447]">View company profile <ArrowUpRight size={15} /></button>
          </Panel>
        </div>
      </div>
    )
  }

  function CompanyProfile() {
    return (
      <div className="max-w-3xl space-y-6">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A1845C]">Company details</p><h1 className="mt-2 font-serif text-3xl text-[#3C2E24]">Your company profile</h1><p className="mt-2 text-sm text-[#887D71]">Tell job seekers about the organisation behind the opportunity.</p></div>
        {profile && <div className="rounded-xl bg-[#F5EFE4] p-4"><StatusPill verified={profile.is_verified} /><p className="mt-2 text-xs leading-5 text-[#796B5B]">{profile.is_verified ? 'Your company is verified and can publish job listings.' : 'Your profile is awaiting review. You can submit your details, but job posting will be available after verification.'}</p></div>}
        <Panel>
          <form onSubmit={saveProfile} className="space-y-5">
            <Field label="Company name"><Input required value={profileForm.company_name} onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })} placeholder="e.g. Acme Technologies" /></Field>
            <Field label="Company location"><Input value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} placeholder="e.g. Nairobi, Kenya" /></Field>
            <Field label="About your company"><Textarea rows={6} value={profileForm.description} onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })} placeholder="Describe your organisation, its work and what makes it a great place to work." /></Field>
            <button disabled={saving} className="rounded-xl bg-[#49372A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#624A37] disabled:opacity-60">{saving ? 'Submitting...' : profile ? 'Resubmit company details' : 'Submit company profile'}</button>
          </form>
        </Panel>
      </div>
    )
  }

  function PostJob() {
    return (
      <div className="max-w-3xl space-y-6">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A1845C]">Recruitment</p><h1 className="mt-2 font-serif text-3xl text-[#3C2E24]">Create a job listing</h1><p className="mt-2 text-sm text-[#887D71]">Share a clear opportunity with qualified candidates.</p></div>
        {!profile?.is_verified && <div className="flex gap-3 rounded-xl border border-[#E7D8BE] bg-[#F5EFE4] p-4 text-sm text-[#796B5B]"><ShieldCheck size={19} className="shrink-0" /><p>Your company must have a verified profile before you can publish a job listing. Complete your company profile and wait for approval.</p></div>}
        <Panel>
          <form onSubmit={postJob} className="space-y-5">
            <Field label="Job title"><Input required value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} placeholder="e.g. Junior Backend Developer" /></Field>
            <Field label="Job description"><Textarea required rows={6} value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} placeholder="Describe the role, responsibilities and requirements." /></Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Location"><Input required value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} placeholder="e.g. Nairobi / Remote" /></Field>
              <Field label="Employment type"><select value={jobForm.type} onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })} className="w-full rounded-xl border border-[#E8E1D7] bg-[#FFFEFC] px-4 py-3 text-sm text-[#342A22] outline-none focus:border-[#A9824D]"><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Remote</option></select></Field>
            </div>
            <Field label="Salary range" hint="Use a clear range, for example KES 40,000 - 60,000 per month."><Input value={jobForm.salary} onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })} placeholder="e.g. KES 40,000 - 60,000" /></Field>
            <Field label="Required skills" hint="Separate each skill with a comma."><Input value={jobForm.skills} onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })} placeholder="Python, Flask, PostgreSQL, Git" /></Field>
            <button disabled={saving || !profile?.is_verified} className="inline-flex items-center gap-2 rounded-xl bg-[#49372A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#624A37] disabled:cursor-not-allowed disabled:opacity-50"><Send size={16} />{saving ? 'Submitting...' : 'Submit for approval'}</button>
          </form>
        </Panel>
      </div>
    )
  }

  function MyJobs() {
    return (
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A1845C]">Your listings</p><h1 className="mt-2 font-serif text-3xl text-[#3C2E24]">My jobs</h1><p className="mt-2 text-sm text-[#887D71]">Track your published and pending opportunities.</p></div><button onClick={() => changePage('Post a job')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#49372A] px-4 py-3 text-sm font-semibold text-white"><Plus size={16} /> New listing</button></div>
        <Panel className="overflow-hidden">
          {jobs.length === 0 ? <Empty text="No job listings yet. Your next hire starts here." /> : (
            <div className="divide-y divide-[#F0EBE4]">
              {jobs.map((job) => (
                <article key={job.id} className="flex flex-col justify-between gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                  <div className="min-w-0"><h3 className="font-semibold text-[#49372A]">{job.title}</h3><p className="mt-1 text-xs text-[#94897D]">{job.location} · {job.job_type || job.type} {job.salary_range || job.salary ? `· ${job.salary_range || job.salary}` : ''}</p><p className="mt-2 line-clamp-2 text-sm leading-6 text-[#82776B]">{job.description}</p></div>
                  <div className="shrink-0"><StatusPill verified={Boolean(job.is_verified || job.verified)} /></div>
                </article>
              ))}
            </div>
          )}
        </Panel>
      </div>
    )
  }

  function Applicants() {
    return (
      <div className="space-y-6">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A1845C]">Candidate management</p><h1 className="mt-2 font-serif text-3xl text-[#3C2E24]">Applicants</h1><p className="mt-2 text-sm text-[#887D71]">Review candidates and update their application progress.</p></div>
        <Panel>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A39789]" size={17} /><Input className="pl-10" value={applicantSearch} onChange={(e) => setApplicantSearch(e.target.value)} placeholder="Search candidates or job titles" /></div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-[#E8E1D7] bg-[#FFFEFC] px-4 py-3 text-sm text-[#51483F] outline-none focus:border-[#A9824D]"><option>All</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
          </div>
          {visibleApplicants.length === 0 ? <Empty text="No applicants match your search yet." /> : (
            <div className="mt-5 divide-y divide-[#F0EBE4]">
              {visibleApplicants.map((applicant) => (
                <div key={applicant.id} className="flex flex-col justify-between gap-4 py-5 first:pt-0 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1E9DD] text-[#8A6A43]"><UserRound size={18} /></span>
                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-[#49372A]">{applicant.applicant || 'Candidate'}</p><p className="mt-1 truncate text-xs text-[#94897D]">{applicant.email}</p><p className="mt-1 text-xs text-[#A1845C]">Applied for: {applicant.job_title}</p></div>
                  </div>
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <span className="hidden rounded-full bg-[#F5EFE5] px-3 py-1.5 text-xs text-[#796B5B] md:inline-flex">{applicant.status || 'Under Review'}</span>
                    <select aria-label={`Update status for ${applicant.applicant || 'applicant'}`} value={applicant.status || 'Under Review'} onChange={(e) => updateApplicant(applicant.id, e.target.value)} className="max-w-[170px] rounded-lg border border-[#E8E1D7] bg-white px-3 py-2 text-xs text-[#51483F] outline-none focus:border-[#A9824D]">{statuses.map((status) => <option key={status}>{status}</option>)}</select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    )
  }

  function Empty({ text }) {
    return <div className="py-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F5EFE5] text-[#987447]"><FileText size={20} /></span><p className="mt-3 text-sm text-[#887D71]">{text}</p></div>
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#342A22]">
      {mobileOpen && <div className="fixed inset-0 z-40 bg-[#211910]/40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[258px] flex-col border-r border-[#EAE4DA] bg-[#FFFEFC] lg:flex"><SidebarContent /></aside>
      {mobileOpen && <aside className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-[#EAE4DA] bg-[#FFFEFC] lg:hidden"><div className="flex justify-end p-3"><button onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button></div><SidebarContent /></aside>}
      <div className="lg:pl-[258px]"><Header /><main className="mx-auto max-w-[1440px] p-5 sm:p-8">
        <Alerts />
        {loading ? <div className="flex min-h-[55vh] items-center justify-center text-sm text-[#8E8275]"><RefreshCw className="mr-2 animate-spin" size={18} />Loading your workspace...</div> : (
          <>
            {active === 'Overview' && <Overview />}
            {active === 'Company profile' && <CompanyProfile />}
            {active === 'Post a job' && <PostJob />}
            {active === 'My jobs' && <MyJobs />}
            {active === 'Applicants' && <Applicants />}
          </>
        )}
      </main></div>
    </div>
  )
}

export default EmployerWorkspace
