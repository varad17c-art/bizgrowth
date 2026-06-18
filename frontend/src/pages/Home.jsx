import { Link } from 'react-router-dom'
import { useRef } from 'react'

export default function Home() {
  const servicesRef = useRef(null)

  const scrollServices = (direction) => {
    if (servicesRef.current) {
      const scrollAmount = 420
      servicesRef.current.scrollBy({
        left: direction === 'forward' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[921px] flex items-center overflow-hidden">
        {/* Background Graphic */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-surface-bright via-surface to-surface-container-low opacity-90 z-10"></div>
          <img
            alt="Hero Background"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDK8fM5XaAjKWUPLczBRnaVFRBDNWByK-izPLgmShj454ErKkfpUNGmmZVfc79OmH4MStjjbKb3RuJ-EX9n5be1G2WU6dGwWqWLKz4oHidkf9wnxDDBeLwKKz8hMp1ESYfWGtrwjAjBBW9ZAezQ_PmuNO_Jpesk4qNZTGibuRX7sKBlB7-vNgtwBTU7RWLoxjeHTprr9QlrfJCLBX4ZO-DwmG5XVijZmQ3d2VDNJbWRsgU7MRSAxVUmtQlD0_1QRcPQ18YEsuZqpA"
          />
        </div>
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop relative z-20 w-full grid md:grid-cols-12 gap-gutter items-center">
          <div className="md:col-span-7 lg:col-span-6 space-y-stack-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-container/10 text-primary border border-primary/10">
              <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
              <span className="font-label-md text-label-md uppercase tracking-wider">Global Networking Platform</span>
            </div>
            <h1 className="font-display-lg text-display-lg text-primary">
              Accelerating Business Growth Through Strategic Connections.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Empowering businesses, consultants, trade organizations, and governments to collaborate, innovate, and expand into local and global markets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/register"
                className="bg-primary text-on-primary font-label-md text-label-md px-8 py-4 rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Join BizGrowth
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link
                to="/ecosystem"
                className="bg-transparent border-2 border-primary text-primary font-label-md text-label-md px-8 py-4 rounded-lg hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
              >
                Explore Opportunities
              </Link>
            </div>
          </div>
          <div className="md:col-span-5 lg:col-span-6 hidden md:block">
            {/* Abstract Globe/Connection Visual */}
            <div className="relative w-full aspect-square">
              <div className="absolute inset-0 bg-primary rounded-full opacity-5 blur-3xl animate-pulse"></div>
              <img
                alt="Global Network"
                className="w-full h-full object-contain drop-shadow-2xl z-10 relative"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfwac94mT7oCdmZrdtNn7udShb8bxdKDjJaMDJjRNDLFBx3OFLbNrSMd6lqxIDck93iv13RiE-Uro19VWn7G9tYQggFWY2-6ce_9Ck7BwXkJNuyLZwvJL3G5I9J9fLY-eD3ab9K9c3g_TBTgr607W_x9xC9S0nNrefEW4-EJpPZWk2877r-_b8gY8DWXDL-7Ln5k2d6asGzvq_trMSf5dP9r2ZsSucUnQdKSK_XyaHUmAPXK9cokQMzJwVo-_PbOAte7PPzwcl2w"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section (Bento Grid) */}
      <section className="py-24 bg-surface-bright">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-headline-xl text-headline-xl text-primary">The Executive Advantage</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">A purpose-built ecosystem designed to foster high-value partnerships and drive measurable economic impact.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
            {/* Who We Are */}
            <div className="md:col-span-2 glass-panel rounded-2xl p-8 card-shadow hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between group">
              <div>
                <span className="material-symbols-outlined icon-fill text-tertiary-container text-4xl mb-6">corporate_fare</span>
                <h3 className="font-headline-lg text-headline-lg text-primary mb-4">Who We Are</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">BizGrowth is the premier digital nexus for enterprise leaders, institutional bodies, and elite consultants. We provide a curated environment where strategic intent meets actionable opportunity, transcending traditional networking to focus on tangible market expansion and collaborative innovation.</p>
              </div>
            </div>
            {/* Mission */}
            <div className="glass-panel rounded-2xl p-8 card-shadow hover:-translate-y-1 transition-transform duration-300 bg-primary text-on-primary">
              <span className="material-symbols-outlined icon-fill text-tertiary-fixed text-4xl mb-6">target</span>
              <h3 className="font-headline-md text-headline-md mb-4">Our Mission</h3>
              <p className="font-body-md text-body-md opacity-90">To dismantle barriers to entry in global markets by architecting a seamless, secure, and intelligent platform for cross-border enterprise collaboration.</p>
            </div>
            {/* Vision */}
            <div className="glass-panel rounded-2xl p-8 card-shadow hover:-translate-y-1 transition-transform duration-300 bg-surface-container-low border border-primary/5">
              <span className="material-symbols-outlined icon-fill text-primary text-4xl mb-6">visibility</span>
              <h3 className="font-headline-md text-headline-md text-primary mb-4">Our Vision</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">A synchronized global economy where businesses of all scales can instantly identify, vet, and engage with the precise partners needed to scale efficiently.</p>
            </div>
            {/* Decorative Image */}
            <div className="md:col-span-2 glass-panel rounded-2xl overflow-hidden card-shadow relative">
              <img
                alt="Executive Team"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNOP624W3Uoi54FWm1Qn6zvJCzbbqyLUXXj_W74csvSvMAL4n2rD85GoTuQ4evp7dx5n6tVodcbas-r4JA-97tYTdCXPvymvbwtqzIK8Ss602FLuWPOQLEUf_BLQWLLd7KWz83mhbaHFF5ZaqYv2iTXEj1AOPvItWRL1iQO36a4HNtcWuCEkovzQv8j5RgDXn1uwOh8w-gTRogHw7ZGPes52h-AEeLBjPcyi8tXlE1-Db3i1D6gniqj1qvG3C_ldUSfQ8zTZSSZA"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-8">
                <p className="font-headline-md text-headline-md text-on-primary">Fostering elite connections worldwide.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholder Value Proposition */}
      <section className="py-24 bg-surface relative">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="mb-16">
            <h2 className="font-headline-xl text-headline-xl text-primary mb-4">Stakeholder Ecosystem</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Tailored value propositions for every tier of the global business landscape.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Corporates */}
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 card-shadow hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                <span className="material-symbols-outlined text-primary group-hover:text-on-primary transition-colors">domain</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary mb-3">Corporates</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">Discover vetted enterprise partners, streamline supply chains, and access high-level strategic consultancy for sustained market dominance.</p>
              <a className="text-secondary font-label-md text-label-md flex items-center gap-1 group-hover:gap-2 transition-all" href="#">Explore Benefits <span className="material-symbols-outlined text-[16px]">arrow_forward</span></a>
            </div>
            {/* MSMEs */}
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 card-shadow hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                <span className="material-symbols-outlined text-primary group-hover:text-on-primary transition-colors">storefront</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary mb-3">MSMEs</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">Gain visibility among larger corporations, secure funding opportunities, and access enterprise-grade resources previously out of reach.</p>
              <a className="text-secondary font-label-md text-label-md flex items-center gap-1 group-hover:gap-2 transition-all" href="#">Explore Benefits <span className="material-symbols-outlined text-[16px]">arrow_forward</span></a>
            </div>
            {/* Consultants */}
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 card-shadow hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                <span className="material-symbols-outlined text-primary group-hover:text-on-primary transition-colors">support_agent</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary mb-3">Business Consultants</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">Showcase your expertise to a global audience of decision-makers. Build your portfolio with high-impact, international project engagements.</p>
              <a className="text-secondary font-label-md text-label-md flex items-center gap-1 group-hover:gap-2 transition-all" href="#">Explore Benefits <span className="material-symbols-outlined text-[16px]">arrow_forward</span></a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section (Horizontal Scroll/Asymmetric) */}
      <section className="py-24 bg-primary text-on-primary overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop mb-12 flex justify-between items-end">
          <div>
            <h2 className="font-headline-xl text-headline-xl mb-4 text-on-primary">Professional Services</h2>
            <p className="font-body-lg text-body-lg text-on-primary-container max-w-xl">Comprehensive strategic solutions designed to fortify and expand your enterprise architecture.</p>
          </div>
          <div className="hidden md:flex gap-4">
            <button
              onClick={() => scrollServices('back')}
              className="w-10 h-10 rounded-full border border-on-primary-container flex items-center justify-center hover:bg-on-primary-container/20 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button
              onClick={() => scrollServices('forward')}
              className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center hover:bg-tertiary-container/90 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
        {/* Service Cards Container */}
        <div
          ref={servicesRef}
          className="max-w-[1280px] mx-auto flex gap-6 overflow-x-auto pb-12 px-margin-mobile md:px-margin-desktop snap-x snap-mandatory scrollbar-hide"
          style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        >
          {/* Service Card 1 */}
          <div className="min-w-[300px] md:min-w-[400px] bg-primary-container rounded-2xl p-8 snap-start border border-white/5 hover:border-tertiary-container/50 transition-colors group cursor-pointer">
            <span className="material-symbols-outlined text-3xl text-tertiary-container mb-6 block">strategy</span>
            <h4 className="font-headline-md text-headline-md mb-3">Corporate Strategy</h4>
            <p className="font-body-sm text-body-sm text-on-primary-container mb-6 line-clamp-3">Data-driven frameworks to align organizational objectives with volatile market realities, ensuring resilient long-term growth and competitive advantage.</p>
            <div className="w-full h-[1px] bg-white/10 mb-6 group-hover:bg-tertiary-container/30 transition-colors"></div>
            <span className="font-label-md text-label-md text-tertiary-container uppercase tracking-widest">Learn More</span>
          </div>
          {/* Service Card 2 */}
          <div className="min-w-[300px] md:min-w-[400px] bg-primary-container rounded-2xl p-8 snap-start border border-white/5 hover:border-tertiary-container/50 transition-colors group cursor-pointer">
            <span className="material-symbols-outlined text-3xl text-tertiary-container mb-6 block">public</span>
            <h4 className="font-headline-md text-headline-md mb-3">Market Expansion</h4>
            <p className="font-body-sm text-body-sm text-on-primary-container mb-6 line-clamp-3">Comprehensive localization and globalization strategies, navigating regulatory landscapes and cultural nuances for successful market entry.</p>
            <div className="w-full h-[1px] bg-white/10 mb-6 group-hover:bg-tertiary-container/30 transition-colors"></div>
            <span className="font-label-md text-label-md text-tertiary-container uppercase tracking-widest">Learn More</span>
          </div>
          {/* Service Card 3 */}
          <div className="min-w-[300px] md:min-w-[400px] bg-primary-container rounded-2xl p-8 snap-start border border-white/5 hover:border-tertiary-container/50 transition-colors group cursor-pointer">
            <span className="material-symbols-outlined text-3xl text-tertiary-container mb-6 block">science</span>
            <h4 className="font-headline-md text-headline-md mb-3">R&amp;D Acceleration</h4>
            <p className="font-body-sm text-body-sm text-on-primary-container mb-6 line-clamp-3">Connecting enterprises with elite research institutions and specialized talent to accelerate product development and technological innovation.</p>
            <div className="w-full h-[1px] bg-white/10 mb-6 group-hover:bg-tertiary-container/30 transition-colors"></div>
            <span className="font-label-md text-label-md text-tertiary-container uppercase tracking-widest">Learn More</span>
          </div>
          {/* Service Card 4 */}
          <div className="min-w-[300px] md:min-w-[400px] bg-primary-container rounded-2xl p-8 snap-start border border-white/5 hover:border-tertiary-container/50 transition-colors group cursor-pointer">
            <span className="material-symbols-outlined text-3xl text-tertiary-container mb-6 block">security</span>
            <h4 className="font-headline-md text-headline-md mb-3">Cyber Security</h4>
            <p className="font-body-sm text-body-sm text-on-primary-container mb-6 line-clamp-3">Enterprise-grade security audits, infrastructure hardening, and threat intelligence sharing to protect vital intellectual property and operational continuity.</p>
            <div className="w-full h-[1px] bg-white/10 mb-6 group-hover:bg-tertiary-container/30 transition-colors"></div>
            <span className="font-label-md text-label-md text-tertiary-container uppercase tracking-widest">Learn More</span>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24 bg-surface-bright border-t border-outline-variant/20">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <h2 className="font-headline-xl text-headline-xl text-primary mb-16">Global Economic Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            <div className="space-y-2">
              <div className="font-display-lg text-display-lg text-primary">15k+</div>
              <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Businesses Connected</div>
            </div>
            <div className="space-y-2">
              <div className="font-display-lg text-display-lg text-primary">4.2k</div>
              <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Strategic Partnerships</div>
            </div>
            <div className="space-y-2">
              <div className="font-display-lg text-display-lg text-primary">850+</div>
              <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Consultants Onboarded</div>
            </div>
            <div className="space-y-2">
              <div className="font-display-lg text-display-lg text-primary">320</div>
              <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Global Events Hosted</div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
