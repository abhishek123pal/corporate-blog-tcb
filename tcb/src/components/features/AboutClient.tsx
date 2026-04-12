"use client"

import { motion, Variants } from "framer-motion"
import { Github, Linkedin, Mail, Zap, Shield, Globe, Database, Layers, Wind } from "lucide-react"
import { useState } from "react"

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const TECH_STACK = [
  { name: "Next.js 15",        icon: <Layers   size={18} />, color: "text-white/60",       why: "App Router, ISR, Server Components — unified full-stack."    },
  { name: "TypeScript",        icon: <Shield   size={18} />, color: "text-blue-400/70",    why: "End-to-end type safety. Catch bugs at compile time."         },
  { name: "Prisma + Neon",     icon: <Database size={18} />, color: "text-emerald-400/70", why: "Serverless Postgres with auto-scaling."                      },
  { name: "Tailwind CSS",      icon: <Wind     size={18} />, color: "text-teal-400/70",    why: "Utility-first CSS — design systems at scale."               },
  { name: "Upstash Redis",     icon: <Zap      size={18} />, color: "text-amber-400/70",   why: "Edge-compatible caching + rate limiting."                    },
  { name: "Vercel + Cloudflare", icon: <Globe  size={18} />, color: "text-purple-400/70",  why: "Global edge distribution and DDoS protection."              },
]

const STATS = [
  { value: "99+",  label: "Lighthouse score"   },
  { value: "1M+",  label: "DAU ready"          },
  { value: "15+",  label: "Tech integrations"  },
  { value: "100%", label: "Type-safe codebase" },
]

function ContactForm() {
  const [sent, setSent]       = useState(false)
  const [email, setEmail]     = useState("")
  const [message, setMessage] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-10 gap-3 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Mail size={20} className="text-emerald-400" />
        </div>
        <p className="text-white/70 font-medium text-sm">Message sent successfully!</p>
        <p className="text-white/30 text-xs">We will get back to you soon.</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
      />
      <textarea
        required
        placeholder="Your message..."
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all resize-none"
      />
      <button
        type="submit"
        className="self-start px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
      >
        Send message
      </button>
    </form>
  )
}

// ✅ githubUrl + linkedinUrl props se aate hain
interface AboutClientProps {
  githubUrl:   string
  linkedinUrl: string
}

export default function AboutClient({ githubUrl, linkedinUrl }: AboutClientProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 flex flex-col gap-28">

      <motion.section variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-6">
        <motion.p variants={fadeUp} className="text-xs tracking-widest uppercase text-white/25">The Corporate Blog</motion.p>
        <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-medium text-white/85 leading-tight">
          Built for engineers <br />
          <span className="text-white/25">who ship at scale.</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="text-white/35 text-lg leading-relaxed max-w-xl">
          TCB is a high-performance publishing platform engineered for 1M+ daily active users.
          Every architectural decision is made with production in mind.
        </motion.p>
      </motion.section>

      <motion.section variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp} className="rounded-2xl border border-white/8 bg-white/2 p-6 flex flex-col gap-1 hover:bg-white/4 transition-colors">
            <p className="text-3xl font-medium text-white/75">{stat.value}</p>
            <p className="text-xs text-white/25 leading-snug">{stat.label}</p>
          </motion.div>
        ))}
      </motion.section>

      <motion.section variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-col gap-8">
        <motion.div variants={fadeUp}>
          <p className="text-xs tracking-widest uppercase text-white/25 mb-2">Technology</p>
          <h2 className="text-2xl font-medium text-white/70">The stack behind TCB</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TECH_STACK.map((tech) => (
            <motion.div key={tech.name} variants={fadeUp} className="rounded-xl border border-white/8 bg-white/2 p-5 flex gap-4 hover:border-white/12 transition-colors group">
              <div className={"mt-0.5 shrink-0 transition-colors " + tech.color}>{tech.icon}</div>
              <div>
                <p className="text-sm font-medium text-white/60 mb-1">{tech.name}</p>
                <p className="text-xs text-white/25 leading-relaxed">{tech.why}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-col gap-8">
        <motion.div variants={fadeUp}>
          <p className="text-xs tracking-widest uppercase text-white/25 mb-2">Creator</p>
          <h2 className="text-2xl font-medium text-white/70">The person behind it</h2>
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-2xl border border-white/8 bg-white/2 p-8 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-16 h-16 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0 text-white/40 font-medium text-2xl">A</div>
          <div className="flex flex-col gap-3 flex-1">
            <div>
              <p className="text-base font-medium text-white/70">Abhishek Pal</p>
              <p className="text-sm text-white/30 italic">SDE Intern — Full Stack Engineer</p>
            </div>
            <p className="text-sm text-white/25 leading-relaxed">
              Building production-grade web applications with a focus on performance,
              scalability, and developer experience.
            </p>
            <div className="flex items-center gap-4 pt-1">
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/25 hover:text-white/50 transition-colors">
                <Github size={14} /> GitHub
              </a>
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/25 hover:text-white/50 transition-colors">
                <Linkedin size={14} /> LinkedIn
              </a>
            </div>
          </div>
        </motion.div>
      </motion.section>

      <motion.section variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-col gap-8">
        <motion.div variants={fadeUp}>
          <p className="text-xs tracking-widest uppercase text-white/25 mb-2">Contact</p>
          <h2 className="text-2xl font-medium text-white/70">Get in touch</h2>
          <p className="text-sm text-white/25 mt-2">Have a question or want to collaborate?</p>
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-2xl border border-white/8 bg-white/2 p-8 max-w-lg">
          <ContactForm />
        </motion.div>
      </motion.section>

    </div>
  )
}