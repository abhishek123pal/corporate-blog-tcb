"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useSession,signOut } from "next-auth/react"
import { User, Globe, Share2, AlertTriangle, Save, Loader2, Check, X } from "lucide-react"
import { updateProfile, updateSiteSettings, updateSocialLinks, deleteAccount } from "@/services/settings.service"

type Tab = "profile" | "site" | "social" | "danger"

interface ToastState {
  type:    "success" | "error"
  message: string
}

const inputClass = "w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all"

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/35 uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-white/20">{hint}</p>}
    </div>
  )
}

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  return (
    <div className={"fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm shadow-2xl " + (toast.type === "success" ? "bg-[#111] border-emerald-500/20 text-emerald-400" : "bg-[#111] border-red-500/20 text-red-400")}>
      {toast.type === "success" ? <Check size={14} /> : <X size={14} />}
      {toast.message}
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100"><X size={12} /></button>
    </div>
  )
}

function ProfilePanel({ onToast }: { onToast: (t: ToastState) => void }) {
  const { data: session } = useSession()
  const [isPending, startTransition] = useTransition()
  const [name,  setName]  = useState(session?.user?.name  ?? "")
  const [image, setImage] = useState(session?.user?.image ?? "")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await updateProfile({ name, image })
      onToast(res.success
        ? { type: "success", message: "Profile updated successfully" }
        : { type: "error",   message: res.error }
      )
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg">
      <div className="mb-2">
        <h2 className="text-base font-medium text-white/70">Profile</h2>
        <p className="text-xs text-white/30 mt-0.5">Update your display name and avatar.</p>
      </div>

      <Field label="Display name">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClass} />
      </Field>

      <Field label="Avatar URL" hint="Paste a direct image URL">
        <input type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className={inputClass} />
      </Field>

      {image && (
        <div className="flex items-center gap-3">
          <img src={image} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-white/10" />
          <p className="text-xs text-white/25">Avatar preview</p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2 border-t border-white/8">
        <p className="text-xs text-white/20 flex-1">Logged in as {session?.user?.email}</p>
        <button type="submit" disabled={isPending} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/8 border border-white/10 text-sm text-white/60 hover:text-white transition-all disabled:opacity-50">
          {isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Save profile
        </button>
      </div>
    </form>
  )
}

function SitePanel({ onToast }: { onToast: (t: ToastState) => void }) {
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ siteTitle: "The Corporate Blog", description: "", keywords: "" })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await updateSiteSettings(form)
      onToast(res.success
        ? { type: "success", message: "Site settings saved" }
        : { type: "error",   message: res.error }
      )
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg">
      <div className="mb-2">
        <h2 className="text-base font-medium text-white/70">Site Settings</h2>
        <p className="text-xs text-white/30 mt-0.5">Configure your blog title and SEO metadata.</p>
      </div>

      <Field label="Site title">
        <input type="text" value={form.siteTitle} onChange={(e) => setForm((p) => ({ ...p, siteTitle: e.target.value }))} className={inputClass} />
      </Field>

      <Field label="Meta description" hint="Shown in Google search results (max 300 chars)">
        <textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="A short description of your blog..." className={inputClass + " resize-none"} />
      </Field>

      <Field label="SEO keywords" hint="Comma separated — blog, tech, nextjs">
        <input type="text" value={form.keywords} onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))} placeholder="blog, technology, nextjs" className={inputClass} />
      </Field>

      <div className="pt-2 border-t border-white/8">
        <button type="submit" disabled={isPending} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/8 border border-white/10 text-sm text-white/60 hover:text-white transition-all disabled:opacity-50">
          {isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Save settings
        </button>
      </div>
    </form>
  )
}

function SocialPanel({ onToast }: { onToast: (t: ToastState) => void }) {
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ githubUrl: "", twitterUrl: "", linkedinUrl: "" })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await updateSocialLinks(form)
      onToast(res.success
        ? { type: "success", message: "Social links updated" }
        : { type: "error",   message: res.error }
      )
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg">
      <div className="mb-2">
        <h2 className="text-base font-medium text-white/70">Social Links</h2>
        <p className="text-xs text-white/30 mt-0.5">
          These links appear on your About page and author cards — GitHub, Twitter, LinkedIn profiles.
        </p>
      </div>

      {[
        { key: "githubUrl",   label: "GitHub URL",   placeholder: "https://github.com/username"      },
        { key: "twitterUrl",  label: "Twitter URL",  placeholder: "https://twitter.com/username"     },
        { key: "linkedinUrl", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/username" },
      ].map(({ key, label, placeholder }) => (
        <Field key={key} label={label}>
          <input
            type="url"
            value={form[key as keyof typeof form]}
            onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
            placeholder={placeholder}
            className={inputClass}
          />
        </Field>
      ))}

      <div className="pt-2 border-t border-white/8">
        <button type="submit" disabled={isPending} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/8 border border-white/10 text-sm text-white/60 hover:text-white transition-all disabled:opacity-50">
          {isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Save links
        </button>
      </div>
    </form>
  )
}

function DangerPanel({ onToast }: { onToast: (t: ToastState) => void }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [input, setInput] = useState("")
//handle delete
function handleDelete() {
  if (input !== "DELETE") {
    onToast({ type: "error", message: "Type DELETE to confirm" })
    return
  }
  startTransition(async () => {
    const res = await deleteAccount()
    if (res.success) {
      await signOut({ callbackUrl: "/" })  // ✅ Sign out + redirect
    } else {
      onToast({ type: "error", message: res.error })
    }
  })
}
 
  return (
    <div className="max-w-lg flex flex-col gap-4">
      <div className="mb-2">
        <h2 className="text-base font-medium text-red-400/70">Danger Zone</h2>
        <p className="text-xs text-white/30 mt-0.5">
          These actions are permanent and cannot be undone. Your account, all posts, and settings will be permanently deleted.
        </p>
      </div>

      <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-400/70 shrink-0" />
          <div>
            <p className="text-sm font-medium text-white/60">Delete Account</p>
            <p className="text-xs text-white/25 mt-0.5">All your posts, comments, and settings will be wiped permanently.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs text-white/30">
            Type <span className="text-red-400/70 font-mono font-medium">DELETE</span> to confirm:
          </p>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="DELETE"
            className="w-full px-3 py-2 rounded-lg border border-red-500/20 bg-white/2 text-sm text-white/60 placeholder:text-white/15 focus:outline-none focus:border-red-500/30 transition-all font-mono"
          />
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="self-start flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:bg-red-500/15 transition-all disabled:opacity-30"
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <AlertTriangle size={12} />}
            Permanently Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile",       icon: <User          size={14} /> },
  { id: "site",    label: "Site settings", icon: <Globe         size={14} /> },
  { id: "social",  label: "Social links",  icon: <Share2        size={14} /> },
  { id: "danger",  label: "Danger zone",   icon: <AlertTriangle size={14} /> },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [toast, setToast]         = useState<ToastState | null>(null)

  function showToast(t: ToastState) {
    setToast(t)
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-medium text-white/80">Settings</h1>
        <p className="text-sm text-white/30 mt-0.5">Manage your profile and site configuration.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-44 shrink-0">
          <nav className="flex flex-row md:flex-col gap-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={"flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left w-full " + (
                  activeTab === tab.id
                    ? "bg-white/8 text-white/70"
                    : "text-white/30 hover:text-white/55 hover:bg-white/5"
                ) + (tab.id === "danger" ? " md:mt-4 text-red-400/50 hover:text-red-400/70" : "")}
              >
                {tab.icon}
                <span className="text-xs">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 rounded-xl border border-white/8 bg-[#111] p-6">
          {activeTab === "profile" && <ProfilePanel onToast={showToast} />}
          {activeTab === "site"    && <SitePanel    onToast={showToast} />}
          {activeTab === "social"  && <SocialPanel  onToast={showToast} />}
          {activeTab === "danger"  && <DangerPanel  onToast={showToast} />}
        </div>
      </div>

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  )
}