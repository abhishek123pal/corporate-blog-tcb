"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { createPost, updatePost } from "@/services/post.service"
import { Loader2, Save, Eye, Image as ImageIcon, Hash, Layout, Tag as TagIcon, XCircle } from "lucide-react"
import type { PostWithAuthorAndCategory } from "@/types/post.types"
import type { PostStatus, Tag } from "@prisma/client"

// ─────────────────────────────────────────
// TYPES & VARIANTS
// ─────────────────────────────────────────

interface PostFormProps {
  authorId: string
  tags: Tag[]
  post?: PostWithAuthorAndCategory
}

interface FormState {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  status: PostStatus
  tagIds: string[]
}

const containerVars = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const itemVars = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")
}

function Field({ label, required, children, hint, icon: Icon }: any) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={12} className="text-white/20" />}
        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">
          {label} {required && <span className="text-red-500/50">*</span>}
        </label>
      </div>
      {children}
      {hint && <p className="text-[10px] text-white/20 italic">{hint}</p>}
    </div>
  )
}

const inputClass = "w-full px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-sm text-white/80 placeholder:text-white/10 focus:outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all duration-200"

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────

export function PostForm({ authorId, tags, post }: PostFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeButton, setActiveButton] = useState<PostStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    coverImage: post?.coverImage ?? "",
    status: post?.status ?? "DRAFT",
    tagIds: post?.tags?.map((t) => t.id) ?? [],
  })

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleTitleChange(value: string) {
    update("title", value)
    if (!post) update("slug", generateSlug(value))
  }

  function toggleTag(tagId: string) {
    setForm(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId) ? prev.tagIds.filter(id => id !== tagId) : [...prev.tagIds, tagId]
    }))
  }

  function handleSubmit(submitStatus: PostStatus) {
    if (isPending) return
    setError(null)
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      setError("Please fill in all required fields.")
      return
    }

    setActiveButton(submitStatus)
    startTransition(async () => {
      const response = post 
        ? await updatePost({ ...form, status: submitStatus, id: post.id })
        : await createPost({ ...form, status: submitStatus }, authorId)
      
      if (!response.success) setError(response.error)
      else {
        router.push("/admin/posts")
        router.refresh()
      }
      setActiveButton(null)
    })
  }

  return (
    <motion.div 
      initial="hidden" animate="visible" variants={containerVars}
      className="w-full max-w-350 mx-auto flex flex-col gap-8 pb-24"
    >
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">{post ? 'Edit Post' : 'New Post'}</h1>
        <p className="text-sm text-white/40">Draft and publish your thoughts to the world.</p>
      </div>

      <AnimatePresence mode="popLayout">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400">
            <XCircle size={16} /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <motion.div variants={itemVars} className="space-y-6">
            <Field label="Title" required icon={Layout}>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="The Future of Web Development..."
                className={`${inputClass} text-xl font-medium py-5 border-white/10`}
              />
            </Field>

            <Field label="Slug" required icon={Hash} hint="This will be the URL of your post.">
              <input
                type="text"
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Excerpt" icon={Layout}>
              <textarea
                value={form.excerpt}
                onChange={(e) => update("excerpt", e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="A short summary..."
              />
            </Field>

            <Field label="Content" required icon={Layout}>
              <textarea
                value={form.content}
                onChange={(e) => update("content", e.target.value)}
                rows={20}
                className={`${inputClass} font-mono text-xs leading-relaxed`}
                placeholder="Write your markdown here..."
              />
            </Field>
          </motion.div>
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Status Card */}
          <motion.div variants={itemVars} className="p-6 rounded-2xl border border-white/5 bg-white/1">
            <Field label="Visibility" icon={Eye}>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {["DRAFT", "PUBLISHED", "ARCHIVED"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update("status", s as PostStatus)}
                    className={`px-4 py-2.5 rounded-lg border text-xs font-medium transition-all text-left ${
                      form.status === s ? "bg-white/10 border-white/20 text-white" : "border-transparent text-white/30 hover:text-white/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>
          </motion.div>

          {/* Cover Image Card */}
          <motion.div variants={itemVars} className="p-6 rounded-2xl border border-white/5 bg-white/1">
            <Field label="Cover Image" icon={ImageIcon}>
              <input
                type="url"
                value={form.coverImage}
                onChange={(e) => update("coverImage", e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className={inputClass}
              />
              <AnimatePresence>
                {form.coverImage && (
                  <motion.img 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    src={form.coverImage} className="mt-4 w-full aspect-video object-cover rounded-xl border border-white/10" 
                  />
                )}
              </AnimatePresence>
            </Field>
          </motion.div>

          {/* Tags Card */}
          <motion.div variants={itemVars} className="p-6 rounded-2xl border border-white/5 bg-white/1">
            <Field label="Tags" icon={TagIcon}>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                      form.tagIds.includes(tag.id) ? "bg-white text-black border-white" : "border-white/10 text-white/30 hover:border-white/20"
                    }`}
                  >
                    {tag.name.toUpperCase()}
                  </button>
                ))}
              </div>
            </Field>
          </motion.div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <motion.div variants={itemVars} className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl z-50">
        <button
          onClick={() => handleSubmit("PUBLISHED")}
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-white/90 transition-all disabled:opacity-50"
        >
          {activeButton === "PUBLISHED" ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
          Publish
        </button>
        <button
          onClick={() => handleSubmit("DRAFT")}
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 transition-all disabled:opacity-50"
        >
          {activeButton === "DRAFT" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Draft
        </button>
        <div className="w-px h-4 bg-white/10 mx-2" />
        <button onClick={() => router.back()} className="text-xs text-white/20 hover:text-white/50">Cancel</button>
      </motion.div>
    </motion.div>
  )
}











//  "use client"

// import { useState, useTransition } from "react"
// import { useRouter } from "next/navigation"
// import { createPost, updatePost } from "@/services/post.service"
// import { Loader2, Save, Eye } from "lucide-react"
// import type { PostWithAuthorAndCategory } from "@/types/post.types"
// import type { PostStatus, Tag } from "@prisma/client"

// // ─────────────────────────────────────────
// // TYPES
// // ─────────────────────────────────────────

// interface PostFormProps {
//   authorId:    string
//   tags:        Tag[]
//   post?:       PostWithAuthorAndCategory  // edit mode ke liye
// }

// interface FormState {
//   title:       string
//   slug:        string
//   excerpt:     string
//   content:     string
//   coverImage:  string
//   status:      PostStatus
//   tagIds:      string[]
// }

// // ─────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────

// function generateSlug(title: string): string {
//   return title
//     .toLowerCase()
//     .replace(/[^a-z0-9\s-]/g, "")
//     .trim()
//     .replace(/\s+/g, "-")
// }

// // ─────────────────────────────────────────
// // FIELD COMPONENTS
// // ─────────────────────────────────────────

// interface FieldProps {
//   label:    string
//   required?: boolean
//   children: React.ReactNode
//   hint?:    string
// }

// function Field({ label, required, children, hint }: FieldProps) {
//   return (
//     <div className="flex flex-col gap-1.5">
//       <label className="text-xs font-medium text-white/40 uppercase tracking-wide">
//         {label}
//         {required && <span className="text-red-400/60 ml-1">*</span>}
//       </label>
//       {children}
//       {hint && <p className="text-[11px] text-white/20">{hint}</p>}
//     </div>
//   )
// }

// const inputClass =
//   "w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.05] transition-all"

// // ─────────────────────────────────────────
// // MAIN FORM
// // ─────────────────────────────────────────

// export function PostForm({ authorId, tags, post }: PostFormProps) {
//   const router     = useRouter()
//   const [isPending, startTransition] = useTransition()
//    const [activeButton, setActiveButton] = useState<PostStatus | null>(null)
//   const [error, setError] = useState<string | null>(null)

//   const [form, setForm] = useState<FormState>({
//     title:      post?.title      ?? "",
//     slug:       post?.slug       ?? "",
//     excerpt:    post?.excerpt    ?? "",
//     content:    post?.content    ?? "",
//     coverImage: post?.coverImage ?? "",
//     status:     post?.status     ?? "DRAFT",
//     tagIds:     post?.tags?.map((t) => t.id) ?? [],
//   })

//   function update<K extends keyof FormState>(key: K, value: FormState[K]) {
//     setForm((prev) => ({ ...prev, [key]: value }))
//   }

//   function handleTitleChange(value: string) {
//     update("title", value)
//     if (!post) {
//       update("slug", generateSlug(value))
//     }
//   }

//   function toggleTag(tagId: string) {
//     setForm((prev) => ({
//       ...prev,
//       tagIds: prev.tagIds.includes(tagId)
//         ? prev.tagIds.filter((id) => id !== tagId)
//         : [...prev.tagIds, tagId],
//     }))
//   }

//   function handleSubmit(submitStatus: PostStatus) {
//   setError(null)

//   // ✅ Agar already processing hai to block karo
//   if (isPending) return

//   if (!form.title.trim()) {
//     setError("Title is required.")
//     return
//   }
//   if (!form.slug.trim()) {
//     setError("Slug is required.")
//     return
//   }
//   if (!form.content.trim()) {
//     setError("Content is required.")
//     return
//   }

//   setActiveButton(submitStatus)

//   startTransition(async () => {
//     const input = { ...form, status: submitStatus }

//     const response = post
//       ? await updatePost({ ...input, id: post.id })
//       : await createPost(input, authorId)

//     setActiveButton(null)

//     if (!response.success) {
//       setError(response.error)
//       return
//     }

//     router.push("/admin/posts")
//     router.refresh()
//   })
// }
//  

//   return (
//     <div className="flex flex-col gap-6">

//       {/* Error */}
//       {error && (
//         <div className="px-4 py-3 rounded-lg border border-red-500/20 bg-red-500/10 text-sm text-red-400">
//           {error}
//         </div>
//       )}

//       {/* Two column layout */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//         {/* Left — Main content */}
//         <div className="lg:col-span-2 flex flex-col gap-5">

//           <Field label="Title" required>
//             <input
//               type="text"
//               value={form.title}
//               onChange={(e) => handleTitleChange(e.target.value)}
//               placeholder="Enter post title..."
//               className={inputClass}
//             />
//           </Field>

//           <Field
//             label="Slug"
//             required
//             hint="URL: /blog/your-slug-here"
//           >
//             <input
//               type="text"
//               value={form.slug}
//               onChange={(e) => update("slug", e.target.value)}
//               placeholder="post-slug-here"
//               className={inputClass}
//             />
//           </Field>

//           <Field label="Excerpt" hint="Short description for SEO and cards.">
//             <textarea
//               value={form.excerpt}
//               onChange={(e) => update("excerpt", e.target.value)}
//               placeholder="Brief summary of the post..."
//               rows={2}
//               className={`${inputClass} resize-none`}
//             />
//           </Field>

//           <Field label="Content" required>
//             <textarea
//               value={form.content}
//               onChange={(e) => update("content", e.target.value)}
//               placeholder="Write your post content here..."
//               rows={16}
//               className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
//             />
//           </Field>

//         </div>

//         {/* Right — Sidebar */}
//         <div className="flex flex-col gap-5">

//           {/* Status */}
//           <div className="rounded-xl border border-white/8 bg-[#111] p-5 flex flex-col gap-4">
//             <h3 className="text-xs font-medium text-white/40 uppercase tracking-wide">
//               Status
//             </h3>
//             <div className="flex flex-col gap-2">
//               {(["DRAFT", "PUBLISHED", "ARCHIVED"] as PostStatus[]).map((s) => (
//                 <label
//                   key={s}
//                   className="flex items-center gap-3 cursor-pointer group"
//                 >
//                   <input
//                     type="radio"
//                     name="status"
//                     value={s}
//                     checked={form.status === s}
//                     onChange={() => update("status", s)}
//                     className="accent-white/60"
//                   />
//                   <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors capitalize">
//                     {s.toLowerCase()}
//                   </span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* Cover Image */}
//           <div className="rounded-xl border border-white/8 bg-[#111] p-5 flex flex-col gap-4">
//             <h3 className="text-xs font-medium text-white/40 uppercase tracking-wide">
//               Cover Image
//             </h3>
//             <input
//               type="url"
//               value={form.coverImage}
//               onChange={(e) => update("coverImage", e.target.value)}
//               placeholder="https://..."
//               className={inputClass}
//             />
//             {form.coverImage && (
//               <img
//                 src={form.coverImage}
//                 alt="Cover preview"
//                 className="w-full aspect-video object-cover rounded-lg opacity-60"
//               />
//             )}
//           </div>

//           {/* Tags */}
//           <div className="rounded-xl border border-white/8 bg-[#111] p-5 flex flex-col gap-4">
//             <h3 className="text-xs font-medium text-white/40 uppercase tracking-wide">
//               Tags
//             </h3>
//             <div className="flex flex-wrap gap-2">
//               {tags.map((tag) => {
//                 const selected = form.tagIds.includes(tag.id)
//                 return (
//                   <button
//                     key={tag.id}
//                     type="button"
//                     onClick={() => toggleTag(tag.id)}
//                     className={`px-3 py-1 rounded-full text-xs border transition-all ${
//                       selected
//                         ? "bg-white/10 border-white/25 text-white/70"
//                         : "border-white/8 text-white/30 hover:border-white/15 hover:text-white/50"
//                     }`}
//                   >
//                     {tag.name}
//                   </button>
//                 )
//               })}
//             </div>
//           </div>

//         </div>
//       </div>

//       {/* Action buttons */}
//       <div className="flex items-center gap-3 pt-2 border-t border-white/8">
//        {/* Publish button */}
// <button
//   onClick={() => handleSubmit("PUBLISHED")}
//   disabled={isPending}
//   className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 border border-white/15 text-sm text-white/70 hover:text-white hover:bg-white/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
// >
//   {activeButton === "PUBLISHED" ? (
//     <Loader2 size={14} className="animate-spin" />
//   ) : (
//     <Eye size={14} />
//   )}
//   {activeButton === "PUBLISHED" ? "Publishing..." : "Publish"}
// </button>

// {/* Draft button */}
// <button
//   onClick={() => handleSubmit("DRAFT")}
//   disabled={isPending}
//   className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/8 text-sm text-white/40 hover:text-white/60 hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
// >
//   {activeButton === "DRAFT" ? (
//     <Loader2 size={14} className="animate-spin" />
//   ) : (
//     <Save size={14} />
//   )}
//   {activeButton === "DRAFT" ? "Saving..." : "Save Draft"}
// </button>
//         <button
//           onClick={() => router.back()}
//           disabled={isPending}
//           className="ml-auto text-sm text-white/20 hover:text-white/40 transition-colors"
//         >
//           Cancel
//         </button>
//       </div>

//     </div>
//   )
// }  

















//  "use client"

// import { useState, useTransition } from "react"
// import { useRouter } from "next/navigation"
// import { createPost, updatePost } from "@/services/post.service"
// import { Loader2, Save, Eye } from "lucide-react"
// import type { PostWithAuthorAndCategory } from "@/types/post.types"
// import type { PostStatus, Tag } from "@prisma/client"

// // ─────────────────────────────────────────
// // TYPES
// // ─────────────────────────────────────────

// interface PostFormProps {
//   authorId:    string
//   tags:        Tag[]
//   post?:       PostWithAuthorAndCategory  // edit mode ke liye
// }

// interface FormState {
//   title:       string
//   slug:        string
//   excerpt:     string
//   content:     string
//   coverImage:  string
//   status:      PostStatus
//   tagIds:      string[]
// }

// // ─────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────

// function generateSlug(title: string): string {
//   return title
//     .toLowerCase()
//     .replace(/[^a-z0-9\s-]/g, "")
//     .trim()
//     .replace(/\s+/g, "-")
// }

// // ─────────────────────────────────────────
// // FIELD COMPONENTS
// // ─────────────────────────────────────────

// interface FieldProps {
//   label:    string
//   required?: boolean
//   children: React.ReactNode
//   hint?:    string
// }

// function Field({ label, required, children, hint }: FieldProps) {
//   return (
//     <div className="flex flex-col gap-1.5">
//       <label className="text-xs font-medium text-white/40 uppercase tracking-wide">
//         {label}
//         {required && <span className="text-red-400/60 ml-1">*</span>}
//       </label>
//       {children}
//       {hint && <p className="text-[11px] text-white/20">{hint}</p>}
//     </div>
//   )
// }

// const inputClass =
//   "w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.05] transition-all"

// // ─────────────────────────────────────────
// // MAIN FORM
// // ─────────────────────────────────────────

// export function PostForm({ authorId, tags, post }: PostFormProps) {
//   const router     = useRouter()
//   const [isPending, startTransition] = useTransition()
//    const [activeButton, setActiveButton] = useState<PostStatus | null>(null)
//   const [error, setError] = useState<string | null>(null)

//   const [form, setForm] = useState<FormState>({
//     title:      post?.title      ?? "",
//     slug:       post?.slug       ?? "",
//     excerpt:    post?.excerpt    ?? "",
//     content:    post?.content    ?? "",
//     coverImage: post?.coverImage ?? "",
//     status:     post?.status     ?? "DRAFT",
//     tagIds:     post?.tags?.map((t) => t.id) ?? [],
//   })

//   function update<K extends keyof FormState>(key: K, value: FormState[K]) {
//     setForm((prev) => ({ ...prev, [key]: value }))
//   }

//   function handleTitleChange(value: string) {
//     update("title", value)
//     if (!post) {
//       update("slug", generateSlug(value))
//     }
//   }

//   function toggleTag(tagId: string) {
//     setForm((prev) => ({
//       ...prev,
//       tagIds: prev.tagIds.includes(tagId)
//         ? prev.tagIds.filter((id) => id !== tagId)
//         : [...prev.tagIds, tagId],
//     }))
//   }

//   function handleSubmit(submitStatus: PostStatus) {
//   setError(null)

//   // ✅ Agar already processing hai to block karo
//   if (isPending) return

//   if (!form.title.trim()) {
//     setError("Title is required.")
//     return
//   }
//   if (!form.slug.trim()) {
//     setError("Slug is required.")
//     return
//   }
//   if (!form.content.trim()) {
//     setError("Content is required.")
//     return
//   }

//   setActiveButton(submitStatus)

//   startTransition(async () => {
//     const input = { ...form, status: submitStatus }

//     const response = post
//       ? await updatePost({ ...input, id: post.id })
//       : await createPost(input, authorId)

//     setActiveButton(null)

//     if (!response.success) {
//       setError(response.error)
//       return
//     }

//     router.push("/admin/posts")
//     router.refresh()
//   })
// }
//  

//   return (
//     <div className="flex flex-col gap-6">

//       {/* Error */}
//       {error && (
//         <div className="px-4 py-3 rounded-lg border border-red-500/20 bg-red-500/10 text-sm text-red-400">
//           {error}
//         </div>
//       )}

//       {/* Two column layout */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//         {/* Left — Main content */}
//         <div className="lg:col-span-2 flex flex-col gap-5">

//           <Field label="Title" required>
//             <input
//               type="text"
//               value={form.title}
//               onChange={(e) => handleTitleChange(e.target.value)}
//               placeholder="Enter post title..."
//               className={inputClass}
//             />
//           </Field>

//           <Field
//             label="Slug"
//             required
//             hint="URL: /blog/your-slug-here"
//           >
//             <input
//               type="text"
//               value={form.slug}
//               onChange={(e) => update("slug", e.target.value)}
//               placeholder="post-slug-here"
//               className={inputClass}
//             />
//           </Field>

//           <Field label="Excerpt" hint="Short description for SEO and cards.">
//             <textarea
//               value={form.excerpt}
//               onChange={(e) => update("excerpt", e.target.value)}
//               placeholder="Brief summary of the post..."
//               rows={2}
//               className={`${inputClass} resize-none`}
//             />
//           </Field>

//           <Field label="Content" required>
//             <textarea
//               value={form.content}
//               onChange={(e) => update("content", e.target.value)}
//               placeholder="Write your post content here..."
//               rows={16}
//               className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
//             />
//           </Field>

//         </div>

//         {/* Right — Sidebar */}
//         <div className="flex flex-col gap-5">

//           {/* Status */}
//           <div className="rounded-xl border border-white/8 bg-[#111] p-5 flex flex-col gap-4">
//             <h3 className="text-xs font-medium text-white/40 uppercase tracking-wide">
//               Status
//             </h3>
//             <div className="flex flex-col gap-2">
//               {(["DRAFT", "PUBLISHED", "ARCHIVED"] as PostStatus[]).map((s) => (
//                 <label
//                   key={s}
//                   className="flex items-center gap-3 cursor-pointer group"
//                 >
//                   <input
//                     type="radio"
//                     name="status"
//                     value={s}
//                     checked={form.status === s}
//                     onChange={() => update("status", s)}
//                     className="accent-white/60"
//                   />
//                   <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors capitalize">
//                     {s.toLowerCase()}
//                   </span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* Cover Image */}
//           <div className="rounded-xl border border-white/8 bg-[#111] p-5 flex flex-col gap-4">
//             <h3 className="text-xs font-medium text-white/40 uppercase tracking-wide">
//               Cover Image
//             </h3>
//             <input
//               type="url"
//               value={form.coverImage}
//               onChange={(e) => update("coverImage", e.target.value)}
//               placeholder="https://..."
//               className={inputClass}
//             />
//             {form.coverImage && (
//               <img
//                 src={form.coverImage}
//                 alt="Cover preview"
//                 className="w-full aspect-video object-cover rounded-lg opacity-60"
//               />
//             )}
//           </div>

//           {/* Tags */}
//           <div className="rounded-xl border border-white/8 bg-[#111] p-5 flex flex-col gap-4">
//             <h3 className="text-xs font-medium text-white/40 uppercase tracking-wide">
//               Tags
//             </h3>
//             <div className="flex flex-wrap gap-2">
//               {tags.map((tag) => {
//                 const selected = form.tagIds.includes(tag.id)
//                 return (
//                   <button
//                     key={tag.id}
//                     type="button"
//                     onClick={() => toggleTag(tag.id)}
//                     className={`px-3 py-1 rounded-full text-xs border transition-all ${
//                       selected
//                         ? "bg-white/10 border-white/25 text-white/70"
//                         : "border-white/8 text-white/30 hover:border-white/15 hover:text-white/50"
//                     }`}
//                   >
//                     {tag.name}
//                   </button>
//                 )
//               })}
//             </div>
//           </div>

//         </div>
//       </div>

//       {/* Action buttons */}
//       <div className="flex items-center gap-3 pt-2 border-t border-white/8">
//        {/* Publish button */}
// <button
//   onClick={() => handleSubmit("PUBLISHED")}
//   disabled={isPending}
//   className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 border border-white/15 text-sm text-white/70 hover:text-white hover:bg-white/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
// >
//   {activeButton === "PUBLISHED" ? (
//     <Loader2 size={14} className="animate-spin" />
//   ) : (
//     <Eye size={14} />
//   )}
//   {activeButton === "PUBLISHED" ? "Publishing..." : "Publish"}
// </button>

// {/* Draft button */}
// <button
//   onClick={() => handleSubmit("DRAFT")}
//   disabled={isPending}
//   className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/8 text-sm text-white/40 hover:text-white/60 hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
// >
//   {activeButton === "DRAFT" ? (
//     <Loader2 size={14} className="animate-spin" />
//   ) : (
//     <Save size={14} />
//   )}
//   {activeButton === "DRAFT" ? "Saving..." : "Save Draft"}
// </button>
//         <button
//           onClick={() => router.back()}
//           disabled={isPending}
//           className="ml-auto text-sm text-white/20 hover:text-white/40 transition-colors"
//         >
//           Cancel
//         </button>
//       </div>

//     </div>
//   )
// }  