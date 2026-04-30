import { Hero, Navbar, Projects, Contact, Footer, ChatBot } from '../components'
import ConstellationBackground from '../components/ui/ConstellationBackground'

function Home() {
  return (
    <>
      <ConstellationBackground />
      <main className="relative z-10 min-h-screen overflow-hidden font-sans text-[#e8ebff]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),transparent)]" />
        <Navbar />
        <Hero 
          name="Venz Aba"
          description="Inspired to create polished, functional, and user-first digital experiences with modern technologies."
        />
        <Projects />
        <Contact />
        <Footer />
        <ChatBot />
      </main>
    </>
  )
}

export default Home
