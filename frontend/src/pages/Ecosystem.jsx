import { Link } from 'react-router-dom'

export default function Ecosystem() {
  return (
    <>
      <main className="flex-grow pt-24 pb-32 relative overflow-hidden">
        {/* Ambient Lighting Elements */}
        <div className="ambient-glow bg-primary-fixed w-[600px] h-[600px] top-0 left-[-200px]" style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.5, pointerEvents: 'none', zIndex: 0 }}></div>
        <div className="ambient-glow bg-secondary-fixed w-[800px] h-[800px] top-[20%] right-[-300px]" style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.5, pointerEvents: 'none', zIndex: 0 }}></div>
        <div className="ambient-glow bg-tertiary-fixed w-[500px] h-[500px] bottom-[10%] left-[10%]" style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.5, pointerEvents: 'none', zIndex: 0 }}></div>

        {/* Hero Section */}
        <section className="hero-pattern pt-20 pb-24 border-b border-outline-variant/20 relative z-10">
          <div className="max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop relative z-10 text-center">
            <h1 className="font-display-lg text-display-lg text-primary mb-6 max-w-4xl mx-auto drop-shadow-sm">
              The Global Business <span className="gradient-text bg-gradient-to-r from-[#000615] to-[#2c57c1] bg-clip-text text-transparent">Ecosystem</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
              Connect with strategic partners, discover enterprise-grade opportunities, and engage with top-tier consultants in our curated network designed for high-growth businesses.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/marketplace"
                className="bg-secondary text-on-secondary font-label-md text-label-md px-8 py-4 rounded-lg hover:bg-on-secondary-fixed hover:text-on-secondary transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1"
              >
                Explore Marketplace
              </Link>
              <Link
                to="/consultants"
                className="bg-surface-container-lowest/80 backdrop-blur-sm text-primary border border-outline-variant font-label-md text-label-md px-8 py-4 rounded-lg hover:bg-surface-container-low transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                Find a Consultant
              </Link>
            </div>
          </div>
        </section>

        {/* Ecosystem Visualization */}
        <section className="py-32 relative z-10">
          <div className="max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center mb-16 relative z-20">
              <h2 className="font-headline-xl text-headline-xl text-primary mb-4 drop-shadow-sm">The Strategic Network</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
                A dynamic, interconnected environment fostering high-value collaborations across the corporate spectrum.
              </p>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-16">
              <img
                alt="Abstract 3D business ecosystem visualization"
                className="w-full h-[300px] md:h-[600px] object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCs1z1IOhYpbTggvE8pjEv3QvLLRp_EpPjTy_boh_MavV5Oo22xwCt2e5PaKBWB9eQ0TB0tMLCmK5DqsgP-DaVNrq5ZsSyOw6DW5B4ESQ_5PYjaFICP9BbmpyswAwtBYmftQGiqkYRdxyECglxv0nvJ_kSFxE3Hoifa4illLeZn8V5gkxRPTX2v-0GUFxGh04jdrAEqEi797DyiGhFGeCR2BevM24CaMxNyQEVh3M0EHeagY_A0LVK2QhQXCr_Aoa_fP-8fueUAjw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"></div>
              <div className="relative md:absolute md:bottom-0 md:left-0 w-full p-6 md:p-12 flex flex-col items-center bg-primary/80 md:bg-transparent">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl">
                  {/* Corporates & Enterprises (Partnership Showcase) */}
                  <div className="glass-card bg-white/70 backdrop-blur-md border border-white/50 shadow-lg p-8 rounded-xl text-center group hover:shadow-xl hover:border-tertiary-container/30 hover:-translate-y-2 transition-all duration-300">
                    <span className="material-symbols-outlined text-5xl text-secondary mb-4 icon-fill group-hover:scale-110 transition-transform duration-300">domain</span>
                    <h3 className="font-headline-md text-headline-md text-primary mb-2">Corporates &amp; Enterprises</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Seeking innovation, scale, and strategic alliances.</p>
                  </div>
                  {/* MSMEs & Innovators (Marketplace Opportunities) */}
                  <div className="glass-card bg-white/70 backdrop-blur-md border border-white/50 border-t-4 border-t-tertiary-container shadow-lg p-8 rounded-xl text-center group hover:shadow-xl hover:border-tertiary-container/30 hover:-translate-y-2 transition-all duration-300 md:transform md:-translate-y-5">
                    <span className="material-symbols-outlined text-5xl text-tertiary-container mb-4 icon-fill group-hover:scale-110 transition-transform duration-300">storefront</span>
                    <h3 className="font-headline-md text-headline-md text-primary mb-2">MSMEs &amp; Innovators</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Driving agility, specialized solutions, and niche market growth.</p>
                  </div>
                  {/* Consultants & Advisors (Consultant Ecosystem) */}
                  <div className="glass-card bg-white/70 backdrop-blur-md border border-white/50 shadow-lg p-8 rounded-xl text-center group hover:shadow-xl hover:border-tertiary-container/30 hover:-translate-y-2 transition-all duration-300">
                    <span className="material-symbols-outlined text-5xl text-primary mb-4 icon-fill group-hover:scale-110 transition-transform duration-300">groups</span>
                    <h3 className="font-headline-md text-headline-md text-primary mb-2">Consultants &amp; Advisors</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Providing strategic guidance, market insights, and execution frameworks.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* B2B Marketplace Bento Grid */}
        <section className="py-24 relative z-10">
          <div className="max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-headline-xl text-headline-xl text-primary mb-2 drop-shadow-sm">Premium B2B Marketplace</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Curated opportunities for growth and partnership.</p>
              </div>
              <Link
                to="/marketplace"
                className="hidden md:flex items-center gap-2 text-secondary font-label-md text-label-md hover:underline bg-surface-container-low px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all"
              >
                View All Categories <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 md:auto-rows-[280px]">
              {/* Large Feature Card (Partnership Showcase) */}
              <div className="md:col-span-2 md:row-span-2 glass-card bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-10 relative overflow-hidden group cursor-pointer flex flex-col justify-between hover:shadow-xl hover:border-tertiary-container/30 hover:-translate-y-2 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/40 via-transparent to-secondary-fixed/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                <div className="relative z-10 flex justify-between items-start mb-6">
                  <span className="bg-primary text-on-primary px-4 py-2 rounded-full font-label-md text-label-md text-xs uppercase tracking-wider shadow-sm">Strategic Partnerships</span>
                  <span className="material-symbols-outlined text-on-surface-variant bg-surface-container-lowest/80 p-2 rounded-full backdrop-blur-sm group-hover:text-primary transition-colors">bookmark_border</span>
                </div>
                <div className="relative z-10 mt-auto">
                  <h3 className="font-display-lg text-4xl text-primary mb-4 leading-tight group-hover:text-secondary transition-colors duration-300">Global Supply Chain Integration Initiative</h3>
                  <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 line-clamp-2 max-w-xl">Seeking tier-1 logistics partners for comprehensive APAC expansion. Minimum revenue requirement: $50M.</p>
                  <div className="flex items-center gap-4 bg-surface-container-lowest/60 p-4 rounded-xl backdrop-blur-sm border border-outline-variant/20 inline-flex">
                    <div className="w-12 h-12 rounded-full bg-surface-dim overflow-hidden shadow-inner">
                      <img
                        alt="Corporate office building showing modern architecture and business environment."
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFXmjH8eEME6jM5KmfjCZNdYgwZRbQYn-VWbUffCgcfO0QM_hzN2fxAeUwKcDozBKn_x280uFfEDI0nB9Rzqb05F2Rr7-WudosKRdYtplDLjqrw-SmS22HluRXlNu-g91SILmTZgVrZIx3nvfNHI-1tlldKSQCQZLTOzcmQbaJjDey6Q_ZylpffDdHssMdA2DUZjxPw5uUUNwUp6enM9kj0246gsJKvkyCwJjC5UAravNHSgh-ejly4w7iP3PwckE7ofuOeBB92w"
                      />
                    </div>
                    <div>
                      <div className="font-headline-md text-lg text-primary leading-tight">Nexus Global Corp</div>
                      <div className="font-body-sm text-sm text-outline">Manufacturing &amp; Logistics</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Standard Card 1 (Business Opportunities / Marketplace Opportunities) */}
              <div className="md:col-span-1 md:row-span-1 glass-card bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-8 relative overflow-hidden group cursor-pointer flex flex-col justify-between hover:shadow-xl hover:border-tertiary-container/30 hover:-translate-y-2 transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">Business Opportunities</span>
                  <span className="material-symbols-outlined text-outline text-sm bg-surface-container-lowest/50 p-1.5 rounded-full backdrop-blur-sm group-hover:bg-secondary group-hover:text-on-secondary transition-colors">open_in_new</span>
                </div>
                <div className="mt-auto">
                  <h4 className="font-headline-lg text-2xl text-primary mb-3 leading-tight group-hover:text-secondary transition-colors">Series B Funding for FinTech Startup</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-6">Raising $15M for European market penetration.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-surface-container-high/80 backdrop-blur-sm border border-outline-variant/30 text-on-surface px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm">Finance</span>
                    <span className="bg-surface-container-high/80 backdrop-blur-sm border border-outline-variant/30 text-on-surface px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm">Europe</span>
                  </div>
                </div>
              </div>

              {/* Standard Card 2 (Supplier Discovery) */}
              <div className="md:col-span-1 md:row-span-1 glass-card bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-8 relative overflow-hidden group cursor-pointer flex flex-col justify-between hover:shadow-xl hover:border-tertiary-container/30 hover:-translate-y-2 transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-xs font-bold text-tertiary-container uppercase tracking-wider">Supplier Discovery</span>
                  <span className="material-symbols-outlined text-outline text-sm bg-surface-container-lowest/50 p-1.5 rounded-full backdrop-blur-sm group-hover:bg-tertiary-container group-hover:text-on-tertiary transition-colors">open_in_new</span>
                </div>
                <div className="mt-auto">
                  <h4 className="font-headline-lg text-2xl text-primary mb-3 leading-tight group-hover:text-tertiary-container transition-colors">Sustainable Packaging Solutions</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-6">FMCG giant seeking eco-friendly packaging alternatives.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-surface-container-high/80 backdrop-blur-sm border border-outline-variant/30 text-on-surface px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm">Retail</span>
                    <span className="bg-surface-container-high/80 backdrop-blur-sm border border-outline-variant/30 text-on-surface px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm">ESG</span>
                  </div>
                </div>
              </div>

              {/* Wide Card (Project-Based Engagements) */}
              <div className="md:col-span-2 md:row-span-1 glass-card bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-8 relative overflow-hidden group cursor-pointer flex flex-col justify-center border-l-4 border-l-secondary bg-gradient-to-r from-surface-container-lowest/90 to-surface/40 hover:shadow-xl hover:border-tertiary-container/30 hover:-translate-y-2 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider mb-3 block">Project-Based Engagements</span>
                    <h4 className="font-headline-xl text-3xl text-primary mb-3 group-hover:text-secondary transition-colors">Digital Transformation Architecture</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-lg">Immediate requirement for enterprise cloud architecture restructuring. 6-month contract.</p>
                  </div>
                  <div className="hidden sm:block">
                    <button className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center text-primary group-hover:bg-secondary group-hover:text-on-secondary transition-all duration-300 shadow-md group-hover:shadow-xl group-hover:scale-110">
                      <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Strategic Events Section (Events Section) */}
        <section className="py-24 relative z-10 border-t border-outline-variant/20">
          <div className="max-w-container-max-width mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-headline-xl text-headline-xl text-primary mb-2 drop-shadow-sm">Upcoming Strategic Forums</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Closed-door C-suite summits and physical networking events.</p>
              </div>
              <Link
                to="/events"
                className="hidden md:flex items-center gap-2 text-secondary font-label-md text-label-md hover:underline bg-surface-container-low px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all"
              >
                Request Invitation <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Event 1 */}
              <div className="glass-card bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-8 relative overflow-hidden group cursor-pointer flex flex-col justify-between hover:shadow-xl hover:border-tertiary-container/30 hover:-translate-y-2 transition-all duration-300">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full font-label-md text-[10px] uppercase tracking-wider shadow-sm">Closed-Door</span>
                    <div className="flex items-center gap-1.5 text-secondary font-semibold text-xs">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      June 24, 2026
                    </div>
                  </div>
                  <h3 className="font-headline-md text-2xl text-primary mb-3 leading-tight group-hover:text-secondary transition-colors">Global Trade &amp; Supply Chain Summit</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">An exclusive briefing for enterprise logistics directors navigating APAC regulatory developments.</p>
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4">
                  <span className="font-body-sm text-xs text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span> Singapore
                  </span>
                  <span className="text-secondary font-label-md text-xs uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">Register Interest <span className="material-symbols-outlined text-xs">arrow_forward</span></span>
                </div>
              </div>

              {/* Event 2 */}
              <div className="glass-card bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-8 relative overflow-hidden group cursor-pointer flex flex-col justify-between hover:shadow-xl hover:border-tertiary-container/30 hover:-translate-y-2 transition-all duration-300">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="bg-primary text-on-primary px-3 py-1 rounded-full font-label-md text-[10px] uppercase tracking-wider shadow-sm">Premium Forum</span>
                    <div className="flex items-center gap-1.5 text-secondary font-semibold text-xs">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      July 18, 2026
                    </div>
                  </div>
                  <h3 className="font-headline-md text-2xl text-primary mb-3 leading-tight group-hover:text-secondary transition-colors">FinTech Innovation &amp; Venture Summit</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">Connecting high-growth startups with sovereign funds and enterprise capital networks.</p>
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4">
                  <span className="font-body-sm text-xs text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span> Zurich, CH
                  </span>
                  <span className="text-secondary font-label-md text-xs uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">Register Interest <span className="material-symbols-outlined text-xs">arrow_forward</span></span>
                </div>
              </div>

              {/* Event 3 */}
              <div className="glass-card bg-white/70 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl p-8 relative overflow-hidden group cursor-pointer flex flex-col justify-between hover:shadow-xl hover:border-tertiary-container/30 hover:-translate-y-2 transition-all duration-300">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="bg-secondary text-on-secondary px-3 py-1 rounded-full font-label-md text-[10px] uppercase tracking-wider shadow-sm">Executive Summit</span>
                    <div className="flex items-center gap-1.5 text-secondary font-semibold text-xs">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      August 05, 2026
                    </div>
                  </div>
                  <h3 className="font-headline-md text-2xl text-primary mb-3 leading-tight group-hover:text-secondary transition-colors">ESG Strategy &amp; Sustainable Growth</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">Collaborative panels sharing framework innovations for cross-border sustainability policies.</p>
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4">
                  <span className="font-body-sm text-xs text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span> London, UK
                  </span>
                  <span className="text-secondary font-label-md text-xs uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">Register Interest <span className="material-symbols-outlined text-xs">arrow_forward</span></span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
