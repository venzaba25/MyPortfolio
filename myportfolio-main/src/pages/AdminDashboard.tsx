"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Save, LogOut, LayoutDashboard, Image as ImageIcon,
  Link as LinkIcon, Globe, Search, ChevronDown, ChevronUp, X,
  Tag, List, GripVertical, RefreshCw, Wifi, WifiOff, Upload,
  FolderOpen, Loader2, Mail, Lock, ShieldCheck
} from 'lucide-react'
import staticProjectsData from '@/data/projects.json'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import {
  fetchProjects as fetchProjectsFromDb,
  replaceAllProjects,
  deleteProject as deleteProjectFromDb,
  type Project,
} from '@/lib/projectsApi'

export default function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const isAuthenticated = !!session
  const [projects, setProjects] = useState<Project[]>(staticProjectsData.projects)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'title' | 'featured' | 'id'>('id')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [expandedProject, setExpandedProject] = useState<number | null>(null)
  const [newTechInputs, setNewTechInputs] = useState<Record<number, string>>({})
  const [newFeatureInputs, setNewFeatureInputs] = useState<Record<number, string>>({})
  const [apiConnected, setApiConnected] = useState(false)

  // Image upload state
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadTarget, setUploadTarget] = useState<{ projectId: number; type: 'cover' | 'gallery' } | null>(null)
  const [uploadFolder, setUploadFolder] = useState('')
  const [availableFolders, setAvailableFolders] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // New project modal state
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false)
  const [newProjectData, setNewProjectData] = useState<Project>({
    id: 0,
    title: '',
    description: '',
    image: '',
    images: [],
    technologies: [],
    features: [],
    liveUrl: '',
    githubUrl: '',
    featured: false
  })
  const [newProjectTechInput, setNewProjectTechInput] = useState('')
  const [newProjectFeatureInput, setNewProjectFeatureInput] = useState('')

  const fetchProjects = useCallback(async () => {
    try {
      const rows = await fetchProjectsFromDb()
      setProjects(rows.length > 0 ? rows : staticProjectsData.projects)
      setApiConnected(true)
    } catch (err) {
      setApiConnected(false)
      setProjects(staticProjectsData.projects)
      const msg = err instanceof Error ? err.message : 'Unknown error'
      showMessage(`Supabase offline — loaded from static file. (${msg})`, 'error')
    }
  }, [])

  const fetchFolders = useCallback(async () => {
    try {
      const res = await axios.get('/api/folders', { timeout: 3000 })
      setAvailableFolders(res.data.folders || [])
    } catch {
      // Silently fail - folders just won't show
    }
  }, [])

  // Initialize Supabase session and listen for auth changes
  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session ?? null)
      setAuthChecking(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects()
      fetchFolders()
    }
  }, [isAuthenticated, fetchProjects, fetchFolders])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) {
        setAuthError(error.message)
      } else {
        setPassword('')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed. Please try again.'
      setAuthError(msg)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  const handleSave = useCallback(async (updatedProjects: Project[]) => {
    setIsLoading(true)
    try {
      await replaceAllProjects(updatedProjects)
      setProjects(updatedProjects)
      showMessage('Saved to Supabase successfully!')
    } catch (err) {
      console.error(err)
      const msg = err instanceof Error ? err.message : 'Save failed'
      showMessage(`Failed to save: ${msg}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteProject = async (id: number) => {
    if (!window.confirm('Delete this project? This will permanently remove it from Supabase.')) return
    try {
      await deleteProjectFromDb(id)
      setProjects(prev => prev.filter(p => p.id !== id))
      showMessage('Project deleted.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Delete failed'
      showMessage(`Failed to delete: ${msg}`, 'error')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateProject = (id: number, field: keyof Project, value: any) => {
    const updated = projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    setProjects(updated)
  }

  const addTechnology = (projectId: number) => {
    const tech = newTechInputs[projectId]?.trim()
    if (!tech) return
    const project = projects.find(p => p.id === projectId)
    if (!project) return
    if (project.technologies.includes(tech)) {
      showMessage('Technology already exists', 'error')
      return
    }
    updateProject(projectId, 'technologies', [...project.technologies, tech])
    setNewTechInputs(prev => ({ ...prev, [projectId]: '' }))
  }

  const removeTechnology = (projectId: number, tech: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return
    updateProject(projectId, 'technologies', project.technologies.filter(t => t !== tech))
  }

  const addFeature = (projectId: number) => {
    const feature = newFeatureInputs[projectId]?.trim()
    if (!feature) return
    const project = projects.find(p => p.id === projectId)
    if (!project) return
    updateProject(projectId, 'features', [...project.features, feature])
    setNewFeatureInputs(prev => ({ ...prev, [projectId]: '' }))
  }

  const removeFeature = (projectId: number, feature: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return
    updateProject(projectId, 'features', project.features.filter(f => f !== feature))
  }

  const removeImage = (projectId: number, url: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return
    updateProject(projectId, 'images', (project.images || []).filter(img => img !== url))
  }

  // --- Image Upload Functions ---

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !uploadTarget) return

    const folder = uploadFolder || newFolderName || 'uploads'
    setIsUploading(true)
    setUploadProgress('Uploading...')

    try {
      const uploadedUrls: string[] = []

      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('folder', folder)
        formData.append('image', file)

        const res = await axios.post('http://localhost:5174/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000
        })

        if (res.data.url) {
          uploadedUrls.push(res.data.url)
        }
      }

      if (uploadedUrls.length > 0) {
        const project = projects.find(p => p.id === uploadTarget.projectId)
        if (project) {
          if (uploadTarget.type === 'cover') {
            updateProject(uploadTarget.projectId, 'image', uploadedUrls[0])
            showMessage(`Cover image uploaded to /${folder}/`)
          } else {
            const currentImages = project.images || []
            updateProject(uploadTarget.projectId, 'images', [...currentImages, ...uploadedUrls])
            showMessage(`${uploadedUrls.length} image(s) uploaded to /${folder}/`)
          }
        }
        fetchFolders()
      }
    } catch (err) {
      console.error(err)
      showMessage('Upload failed. Make sure admin-api is running.', 'error')
    } finally {
      setIsUploading(false)
      setUploadProgress('')
      setUploadModalOpen(false)
      setUploadTarget(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const filteredProjects = projects
    .filter(p => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.technologies.some(t => t.toLowerCase().includes(q))
      )
    })
    .sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.featured && !b.featured) return sortDir === 'asc' ? -1 : 1
        if (!a.featured && b.featured) return sortDir === 'asc' ? 1 : -1
        return 0
      }
      if (sortBy === 'title') {
        return sortDir === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      }
      return sortDir === 'asc' ? a.id - b.id : b.id - a.id
    })

  const toggleSort = (field: 'title' | 'featured' | 'id') => {
    if (sortBy === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir(field === 'id' ? 'desc' : 'asc')
    }
  }

  const addNewProject = () => {
    setNewProjectData({
      id: Date.now(),
      title: '',
      description: '',
      image: '',
      images: [],
      technologies: [],
      features: [],
      liveUrl: '',
      githubUrl: '',
      featured: false
    })
    setNewProjectTechInput('')
    setNewProjectFeatureInput('')
    setNewProjectFolder('')
    setNewProjectNewFolder('')
    setNewProjectModalOpen(true)
  }

  const [newProjectFolder, setNewProjectFolder] = useState('')
  const [newProjectNewFolder, setNewProjectNewFolder] = useState('')

  const saveNewProject = () => {
    if (!newProjectData.title.trim()) {
      showMessage('Project title is required', 'error')
      return
    }
    const updated = [{ ...newProjectData }, ...projects]
    setProjects(updated)
    setNewProjectModalOpen(false)
    if (apiConnected) {
      handleSave(updated)
    } else {
      showMessage('Project added locally. Start admin-api to persist changes.', 'error')
    }
  }

  const addNewProjectTech = () => {
    const tech = newProjectTechInput.trim()
    if (!tech || newProjectData.technologies.includes(tech)) return
    setNewProjectData(prev => ({ ...prev, technologies: [...prev.technologies, tech] }))
    setNewProjectTechInput('')
  }

  const removeNewProjectTech = (tech: string) => {
    setNewProjectData(prev => ({ ...prev, technologies: prev.technologies.filter(t => t !== tech) }))
  }

  const addNewProjectFeature = () => {
    const feature = newProjectFeatureInput.trim()
    if (!feature) return
    setNewProjectData(prev => ({ ...prev, features: [...prev.features, feature] }))
    setNewProjectFeatureInput('')
  }

  const removeNewProjectFeature = (feature: string) => {
    setNewProjectData(prev => ({ ...prev, features: prev.features.filter(f => f !== feature) }))
  }

  const removeNewProjectImage = (url: string) => {
    setNewProjectData(prev => ({ ...prev, images: (prev.images || []).filter(img => img !== url) }))
  }

  if (authChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#030014] text-neutral-300">
        <Loader2 className="h-6 w-6 animate-spin mr-3" />
        <span className="text-sm">Checking session…</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#030014] p-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

          <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 mx-auto mb-4">
            <ShieldCheck className="h-6 w-6 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 text-center">Admin Login</h2>
          <p className="text-neutral-500 text-center mb-8 text-sm">
            Sign in with your Supabase admin account
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 uppercase tracking-widest px-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full p-4 pl-10 bg-neutral-800/50 border border-neutral-700 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 uppercase tracking-widest px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full p-4 pl-10 bg-neutral-800/50 border border-neutral-700 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {authError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-neutral-600 mt-6">
            Authenticated by Supabase · Sessions persist in this browser
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030014] text-[#e8ebff] font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold flex items-center gap-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              <LayoutDashboard className="text-blue-400 h-8 w-8" /> Deployment Manager
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-neutral-400 text-center sm:text-left">Central hub to update live projects and records</p>
              <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${
                apiConnected
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
              }`}>
                {apiConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                {apiConnected ? 'API Online' : 'API Offline'}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={addNewProject}
              className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-white font-bold transition-all shadow-lg shadow-green-600/20"
              title="Add new project"
            >
              <Plus size={18} /> Add New
            </button>
            <button
              onClick={fetchProjects}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-300 transition-all border border-neutral-700"
              title="Reload from API / static file"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => handleSave(projects)}
              disabled={isLoading || !apiConnected}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all shadow-lg disabled:opacity-50 ${
                apiConnected
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                  : 'bg-neutral-700 cursor-not-allowed shadow-none'
              }`}
              title={apiConnected ? 'Save changes to projects.json' : 'Start admin-api to enable saving'}
            >
              {isLoading ? 'Saving...' : <><Save size={18} /> Push Updates</>}
            </button>
            <div className="flex items-center gap-2 px-4 py-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs text-neutral-400">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="hidden md:inline">{session?.user?.email ?? 'Admin'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-300 transition-all border border-neutral-700"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </header>

        {/* Status Message */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-2xl text-center font-medium border ${
                message.type === 'error'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-green-500/10 border-green-500/30 text-green-400'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input
              type="text"
              placeholder="Search projects by title, description, or technology..."
              className="w-full pl-12 pr-4 py-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 outline-none focus:border-blue-500/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(['id', 'title', 'featured'] as const).map((field) => (
              <button
                key={field}
                onClick={() => toggleSort(field)}
                className={`flex items-center gap-1 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                  sortBy === field
                    ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
                {sortBy === field && (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
              </button>
            ))}
          </div>
        </div>

        {/* Project Count */}
        <p className="text-neutral-500 text-sm mb-6">
          Showing {filteredProjects.length} of {projects.length} projects
        </p>

        {/* Projects Grid */}
        <div className="grid gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-neutral-900/40 border border-neutral-800 rounded-3xl overflow-hidden hover:border-neutral-700/50 transition-all group"
            >
              {/* Collapsed Header */}
              <div
                className="flex items-center gap-4 p-6 cursor-pointer"
                onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
              >
                <GripVertical className="text-neutral-600 flex-shrink-0" size={20} />
                {project.image && (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-16 h-10 object-cover rounded-lg border border-neutral-700 flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">{project.title}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <span key={tech} className="text-xs px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded-full">{tech}</span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="text-xs text-neutral-500">+{project.technologies.length - 3}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {project.featured && (
                    <span className="text-xs px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-full">Featured</span>
                  )}
                  {project.liveUrl ? (
                    <span className="text-xs px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full">Live</span>
                  ) : (
                    <span className="text-xs px-3 py-1 bg-neutral-800 border border-neutral-700 text-neutral-500 rounded-full">No URL</span>
                  )}
                  {expandedProject === project.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedProject === project.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-neutral-800 p-6 sm:p-8">
                      <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                          <div>
                            <label className="text-xs text-neutral-500 uppercase tracking-widest block mb-2 px-1">Project Title</label>
                            <input
                              className="text-xl font-bold bg-neutral-800/30 border border-transparent focus:border-blue-500/50 rounded-xl p-3 w-full outline-none transition-all"
                              value={project.title}
                              onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-neutral-500 uppercase tracking-widest block mb-2 px-1">Description</label>
                            <textarea
                              className="text-neutral-400 text-sm bg-neutral-800/30 border border-transparent focus:border-blue-500/50 rounded-xl p-4 w-full h-32 resize-none outline-none leading-relaxed"
                              value={project.description}
                              onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                            />
                          </div>

                          {/* Technologies */}
                          <div>
                            <label className="text-xs text-neutral-500 uppercase tracking-widest block mb-2 px-1 flex items-center gap-2">
                              <Tag size={12} /> Technologies
                            </label>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {project.technologies.map((tech) => (
                                <span
                                  key={tech}
                                  className="flex items-center gap-1 text-sm px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-full"
                                >
                                  {tech}
                                  <button
                                    onClick={() => removeTechnology(project.id, tech)}
                                    className="hover:text-red-400 transition-colors ml-1"
                                  >
                                    <X size={12} />
                                  </button>
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <input
                                className="flex-1 text-sm bg-neutral-800/30 border border-neutral-700 focus:border-blue-500/50 rounded-xl p-3 outline-none transition-all"
                                placeholder="Add technology..."
                                value={newTechInputs[project.id] || ''}
                                onChange={(e) => setNewTechInputs(prev => ({ ...prev, [project.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology(project.id))}
                              />
                              <button
                                onClick={() => addTechnology(project.id)}
                                className="px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl transition-all"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Features */}
                          <div>
                            <label className="text-xs text-neutral-500 uppercase tracking-widest block mb-2 px-1 flex items-center gap-2">
                              <List size={12} /> Features
                            </label>
                            <div className="space-y-2 mb-3">
                              {project.features.map((feature, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2 text-sm px-3 py-2 bg-neutral-800/40 border border-neutral-700/50 rounded-xl"
                                >
                                  <span className="text-neutral-300 flex-1">{feature}</span>
                                  <button
                                    onClick={() => removeFeature(project.id, feature)}
                                    className="text-neutral-500 hover:text-red-400 transition-colors"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <input
                                className="flex-1 text-sm bg-neutral-800/30 border border-neutral-700 focus:border-blue-500/50 rounded-xl p-3 outline-none transition-all"
                                placeholder="Add feature..."
                                value={newFeatureInputs[project.id] || ''}
                                onChange={(e) => setNewFeatureInputs(prev => ({ ...prev, [project.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature(project.id))}
                              />
                              <button
                                onClick={() => addFeature(project.id)}
                                className="px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl transition-all"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                          {/* Cover Image */}
                          <div>
                            <label className="text-xs text-neutral-500 uppercase tracking-widest block mb-2 px-1 flex items-center gap-2">
                              <ImageIcon size={12} /> Cover Image
                            </label>
                            <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-neutral-700 hover:border-green-500/50 rounded-xl cursor-pointer text-neutral-400 hover:text-green-400 transition-colors">
                              <Upload size={18} /> Click to upload cover image
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0]
                                  if (!file) return
                                  try {
                                    const res = await axios.post('/api/upload', file, { 
                                      headers: { 
                                        'Content-Type': file.type,
                                        'x-filename': file.name 
                                      }, 
                                      timeout: 60000 
                                    })
                                    if (res.data.url) {
                                      updateProject(project.id, 'image', res.data.url)
                                      showMessage('Cover image uploaded to Vercel Blob')
                                    }
                                  } catch (err) {
                                    console.error('Upload error:', err)
                                    showMessage('Upload failed. Check Vercel Blob configuration.', 'error')
                                  }
                                  e.target.value = ''
                                }}
                              />
                            </label>
                            {project.image && (
                              <div className="mt-3 rounded-xl overflow-hidden border border-neutral-700 bg-neutral-900/60 p-2 relative group">
                                <img src={project.image} alt="Cover preview" className="w-full h-32 object-cover object-top rounded-lg" />
                                <span className="absolute bottom-2 left-2 text-xs text-green-400 bg-black/60 px-2 py-1 rounded">{project.image.split('/').pop()}</span>
                                <button
                                  onClick={() => updateProject(project.id, 'image', '')}
                                  className="absolute top-2 right-2 p-1 bg-red-600/80 hover:bg-red-500 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Gallery Images */}
                          <div>
                            <label className="text-xs text-neutral-500 uppercase tracking-widest block mb-2 px-1 flex items-center gap-2">
                              <ImageIcon size={12} /> Gallery Images
                            </label>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              {(project.images || []).map((img, i) => (
                                <div key={i} className="relative group rounded-lg overflow-hidden border border-neutral-700 bg-neutral-900/60">
                                  <img src={img} alt="" className="w-full h-20 object-cover" />
                                  <span className="absolute bottom-0 left-0 right-0 text-[10px] text-neutral-300 bg-black/60 px-1 py-0.5 truncate">{img.split('/').pop()}</span>
                                  <button
                                    onClick={() => removeImage(project.id, img)}
                                    className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-500 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-neutral-700 hover:border-green-500/50 rounded-xl cursor-pointer text-neutral-400 hover:text-green-400 transition-colors">
                              <Upload size={16} /> Upload gallery images
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={async (e) => {
                                  const files = e.target.files
                                  if (!files || files.length === 0) return
                                  const uploadedUrls: string[] = []
                                  for (const file of Array.from(files)) {
                                    try {
                                      const res = await axios.post('/api/upload', file, { 
                                        headers: { 
                                          'Content-Type': file.type,
                                          'x-filename': file.name 
                                        }, 
                                        timeout: 60000 
                                      })
                                      if (res.data.url) uploadedUrls.push(res.data.url)
                                    } catch (err) { 
                                      console.error('Gallery item upload failed:', err) 
                                    }
                                  }
                                  if (uploadedUrls.length > 0) {
                                    const currentImages = project.images || []
                                    updateProject(project.id, 'images', [...currentImages, ...uploadedUrls])
                                    showMessage(`${uploadedUrls.length} image(s) uploaded successfully to Vercel Blob`)
                                  } else {
                                    showMessage('Upload failed. Check Vercel Blob configuration.', 'error')
                                  }
                                  e.target.value = ''
                                }}
                              />
                            </label>
                          </div>

                          {/* URLs */}
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-neutral-500 uppercase tracking-widest block mb-2 px-1 flex items-center gap-2">
                                <Globe size={12} /> Live URL
                              </label>
                              <input
                                className="text-xs font-mono bg-neutral-800/30 p-4 rounded-xl w-full border border-neutral-700 focus:border-blue-500 outline-none"
                                value={project.liveUrl || ''}
                                onChange={(e) => updateProject(project.id, 'liveUrl', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-neutral-500 uppercase tracking-widest block mb-2 px-1 flex items-center gap-2">
                                <LinkIcon size={12} /> GitHub Link
                              </label>
                              <input
                                className="text-xs font-mono bg-neutral-800/30 p-4 rounded-xl w-full border border-neutral-700 focus:border-blue-500 outline-none"
                                value={project.githubUrl || ''}
                                onChange={(e) => updateProject(project.id, 'githubUrl', e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Featured Toggle & Delete */}
                          <div className="flex items-center justify-between pt-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <button
                                type="button"
                                onClick={() => updateProject(project.id, 'featured', !project.featured)}
                                className={`w-12 h-7 rounded-full relative cursor-pointer ${project.featured ? 'bg-blue-600' : 'bg-neutral-700'}`}
                              >
                                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white ${project.featured ? 'left-6' : 'left-1'}`} />
                              </button>
                              <span className="text-sm font-semibold text-white">Featured Project</span>
                            </label>
                            <button
                              onClick={() => deleteProject(project.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-xl"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Add New Project */}
          <button
            onClick={addNewProject}
            className="mt-4 flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed border-neutral-800 rounded-[32px] text-neutral-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-500/5 transition-all group"
          >
            <div className="bg-neutral-800 p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Plus size={32} />
            </div>
            <span className="font-bold tracking-wide uppercase text-sm">Add New Project Record</span>
            {!apiConnected && <span className="text-xs text-yellow-500/60 mt-1">API offline — changes won't persist</span>}
          </button>
        </div>
      </div>

      {/* New Project Modal */}
      {newProjectModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-5 overflow-y-auto"
          onClick={() => setNewProjectModalOpen(false)}
        >
          <div
            className="bg-[#030014] border border-neutral-800 rounded-3xl w-full max-w-6xl my-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  Create New Project
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={saveNewProject}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-white font-bold transition-colors shadow-lg shadow-green-600/20"
                  >
                    <Save size={18} /> Save Project
                  </button>
                  <button
                    onClick={() => setNewProjectModalOpen(false)}
                    className="flex items-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-300 transition-colors border border-neutral-700"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-widest block mb-2 px-1">Project Title *</label>
                    <input
                      className="text-xl font-bold bg-neutral-800/30 border border-transparent focus:border-blue-500/50 rounded-xl p-3 w-full outline-none text-white"
                      placeholder="Enter project title"
                      value={newProjectData.title}
                      onChange={(e) => setNewProjectData(prev => ({ ...prev, title: e.target.value }))}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-widest block mb-2 px-1">Description</label>
                    <textarea
                      className="text-neutral-400 text-sm bg-neutral-800/30 border border-transparent focus:border-blue-500/50 rounded-xl p-4 w-full h-40 resize-none outline-none leading-relaxed"
                      placeholder="Describe your project..."
                      value={newProjectData.description}
                      onChange={(e) => setNewProjectData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  {/* Technologies */}
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-widest block mb-2 px-1 flex items-center gap-2">
                      <Tag size={12} /> Technologies
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {newProjectData.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="flex items-center gap-1 text-sm px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-full"
                        >
                          {tech}
                          <button onClick={() => removeNewProjectTech(tech)} className="hover:text-red-400 ml-1">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 text-sm bg-neutral-800/30 border border-neutral-700 focus:border-blue-500/50 rounded-xl p-3 outline-none text-white"
                        placeholder="Add technology..."
                        value={newProjectTechInput}
                        onChange={(e) => setNewProjectTechInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewProjectTech())}
                      />
                      <button onClick={addNewProjectTech} className="px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-widest block mb-2 px-1 flex items-center gap-2">
                      <List size={12} /> Features
                    </label>
                    <div className="space-y-2 mb-3">
                      {newProjectData.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm px-3 py-2 bg-neutral-800/40 border border-neutral-700/50 rounded-xl">
                          <span className="text-neutral-300 flex-1">{feature}</span>
                          <button onClick={() => removeNewProjectFeature(feature)} className="text-neutral-500 hover:text-red-400">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 text-sm bg-neutral-800/30 border border-neutral-700 focus:border-blue-500/50 rounded-xl p-3 outline-none text-white"
                        placeholder="Add feature..."
                        value={newProjectFeatureInput}
                        onChange={(e) => setNewProjectFeatureInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewProjectFeature())}
                      />
                      <button onClick={addNewProjectFeature} className="px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Upload Folder for New Project */}
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-widest block mb-2 px-1 flex items-center gap-2">
                      <FolderOpen size={12} /> Upload Folder
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={newProjectFolder}
                        onChange={(e) => { setNewProjectFolder(e.target.value); setNewProjectNewFolder('') }}
                        className="flex-1 p-3 bg-neutral-800/30 border border-neutral-700 rounded-xl text-white text-sm outline-none focus:border-blue-500"
                      >
                        <option value="">-- Select folder --</option>
                        {availableFolders.map(f => (
                          <option key={f} value={f}>/{f}/</option>
                        ))}
                      </select>
                      <input
                        className="flex-1 text-sm bg-neutral-800/30 border border-neutral-700 focus:border-blue-500/50 rounded-xl p-3 outline-none text-white"
                        placeholder="Or create new folder..."
                        value={newProjectNewFolder}
                        onChange={(e) => { setNewProjectNewFolder(e.target.value); setNewProjectFolder('') }}
                      />
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-1 px-1">Default: /images/</p>
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-widest block mb-2 px-1 flex items-center gap-2">
                      <ImageIcon size={12} /> Cover Image
                    </label>
                    <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-neutral-700 hover:border-green-500/50 rounded-xl cursor-pointer text-neutral-400 hover:text-green-400">
                      <Upload size={18} /> Click to upload cover image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          try {
                            const res = await axios.post('/api/upload', file, { 
                              headers: { 
                                'Content-Type': file.type,
                                'x-filename': file.name 
                              }, 
                              timeout: 60000 
                            })
                            if (res.data.url) {
                              setNewProjectData(prev => ({ ...prev, image: res.data.url }))
                              showMessage('Cover image uploaded to Vercel Blob')
                            }
                          } catch (err) {
                            console.error('Upload error:', err)
                            showMessage('Upload failed. Check Vercel Blob configuration.', 'error')
                          }
                          e.target.value = ''
                        }}
                      />
                    </label>
                    {newProjectData.image && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-neutral-700 bg-neutral-900/60 p-2 relative group">
                        <img src={newProjectData.image} alt="Cover preview" className="w-full h-32 object-cover object-top rounded-lg" />
                        <span className="absolute bottom-2 left-2 text-xs text-green-400 bg-black/60 px-2 py-1 rounded">{newProjectData.image.split('/').pop()}</span>
                        <button
                          onClick={() => setNewProjectData(prev => ({ ...prev, image: '' }))}
                          className="absolute top-2 right-2 p-1 bg-red-600/80 hover:bg-red-500 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Gallery Images */}
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-widest block mb-2 px-1 flex items-center gap-2">
                      <ImageIcon size={12} /> Gallery Images
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {(newProjectData.images || []).map((img, i) => (
                        <div key={i} className="relative group rounded-lg overflow-hidden border border-neutral-700 bg-neutral-900/60">
                          <img src={img} alt="" className="w-full h-20 object-cover" />
                          <span className="absolute bottom-0 left-0 right-0 text-[10px] text-neutral-300 bg-black/60 px-1 py-0.5 truncate">{img.split('/').pop()}</span>
                          <button
                            onClick={() => removeNewProjectImage(img)}
                            className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-500 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-neutral-700 hover:border-green-500/50 rounded-xl cursor-pointer text-neutral-400 hover:text-green-400">
                      <Upload size={16} /> Upload gallery images
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const files = e.target.files
                          if (!files || files.length === 0) return
                          const uploadedUrls: string[] = []
                          for (const file of Array.from(files)) {
                            try {
                              const res = await axios.post('/api/upload', file, { 
                                headers: { 
                                  'Content-Type': file.type,
                                  'x-filename': file.name 
                                }, 
                                timeout: 60000 
                              })
                              if (res.data.url) uploadedUrls.push(res.data.url)
                            } catch (err) { 
                              console.error('Gallery item upload failed:', err) 
                            }
                          }
                          if (uploadedUrls.length > 0) {
                            setNewProjectData(prev => ({ ...prev, images: [...(prev.images || []), ...uploadedUrls] }))
                            showMessage(`${uploadedUrls.length} image(s) uploaded successfully to Vercel Blob`)
                          } else {
                            showMessage('Upload failed. Check Vercel Blob configuration.', 'error')
                          }
                          e.target.value = ''
                        }}
                      />
                    </label>
                  </div>

                  {/* URLs */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-neutral-500 uppercase tracking-widest block mb-2 px-1 flex items-center gap-2">
                        <Globe size={12} /> Live URL
                      </label>
                      <input
                        className="text-xs font-mono bg-neutral-800/30 p-4 rounded-xl w-full border border-neutral-700 focus:border-blue-500 outline-none text-white"
                        placeholder="https://example.com"
                        value={newProjectData.liveUrl || ''}
                        onChange={(e) => setNewProjectData(prev => ({ ...prev, liveUrl: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500 uppercase tracking-widest block mb-2 px-1 flex items-center gap-2">
                        <LinkIcon size={12} /> GitHub Link
                      </label>
                      <input
                        className="text-xs font-mono bg-neutral-800/30 p-4 rounded-xl w-full border border-neutral-700 focus:border-blue-500 outline-none text-white"
                        placeholder="https://github.com/..."
                        value={newProjectData.githubUrl || ''}
                        onChange={(e) => setNewProjectData(prev => ({ ...prev, githubUrl: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Featured Toggle */}
                  <div className="flex items-center gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setNewProjectData(prev => ({ ...prev, featured: !prev.featured }))}
                      className={`w-12 h-7 rounded-full relative cursor-pointer ${newProjectData.featured ? 'bg-blue-600' : 'bg-neutral-700'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white ${newProjectData.featured ? 'left-6' : 'left-1'}`} />
                    </button>
                    <span className="text-sm font-semibold text-white">Featured Project</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => { setUploadModalOpen(false); setUploadTarget(null) }}
        >
          <div
            className="bg-neutral-900 border border-neutral-700 rounded-3xl p-8 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Upload size={20} className="text-green-400" />
                Upload {uploadTarget?.type === 'cover' ? 'Cover Image' : 'Gallery Images'}
              </h3>
              <button
                onClick={() => { setUploadModalOpen(false); setUploadTarget(null) }}
                className="text-neutral-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Folder Selection */}
            <div className="mb-6">
              <label className="text-xs text-neutral-400 uppercase tracking-widest block mb-2 flex items-center gap-2">
                <FolderOpen size={12} /> Target Folder
              </label>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white outline-none focus:border-blue-500"
              >
                <option value="">-- Select existing folder --</option>
                {availableFolders.map(f => (
                  <option key={f} value={f}>/{f}/</option>
                ))}
              </select>
              <div className="flex gap-2 mt-3">
                <input
                  className="flex-1 p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm outline-none focus:border-blue-500"
                  placeholder="Or type new folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
              </div>
            </div>

            {/* File Input */}
            <div className="mb-6">
              <label className="text-xs text-neutral-400 uppercase tracking-widest block mb-2">Select File{uploadTarget?.type === 'gallery' ? 's (up to 10)' : ''}</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={uploadTarget?.type === 'gallery'}
                onChange={handleFileUpload}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-medium file:cursor-pointer"
              />
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">{uploadProgress}</span>
              </div>
            )}

            {/* Target info */}
            <p className="text-xs text-neutral-500 mt-4">
              Uploaded to: <span className="text-neutral-400 font-mono">/{uploadFolder || newFolderName || 'uploads'}/</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
