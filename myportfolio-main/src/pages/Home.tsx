import {
  Hero,
  About,
  Services,
  Navbar,
  Projects,
  AIAutomation,
  Testimonials,
  Contact,
  Footer,
  ChatBot,
} from '../components'
import ConstellationBackground from '../components/ui/ConstellationBackground'

function Home() {
  return (
    <>
      <ConstellationBackground />
      <main className="relative z-10 min-h-screen overflow-hidden font-sans text-[#e8ebff]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),transparent)]" />
        <Navbar />
        <Hero name="Venz" />
        <About />
        <Services />
        <Projects />
        <AIAutomation />
        <Testimonials />
        <Contact />
        <Footer />
        <ChatBot />
      </main>
    </>
  )
}

export default Home
