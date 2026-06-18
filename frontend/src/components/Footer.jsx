import { Link } from 'react-router-dom'

export default function Footer() {
  const handleSubmit = (e) => {
    e.preventDefault()
    // Subscribe briefing action placeholder
  }

  return (
    <footer className="bg-primary-container dark:bg-surface-container-lowest w-full relative border-t border-outline-variant/20 shadow-none z-10">
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="col-span-1 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined icon-fill text-on-primary-container dark:text-primary" style={{ fontSize: '24px' }}>public</span>
            <span className="font-headline-md text-headline-md font-bold text-on-primary-container dark:text-primary">BizGrowth</span>
          </div>
          <p className="font-body-sm text-body-sm text-outline-variant dark:text-outline mt-2 leading-relaxed">
            Accelerating global business growth through strategic, high-value connections.
          </p>
        </div>

        {/* Links Column 1: Platform */}
        <div className="col-span-1 flex flex-col gap-3">
          <h4 className="font-label-md text-label-md text-on-primary-container dark:text-on-surface font-semibold mb-2 uppercase tracking-wider">Platform</h4>
          <Link to="/" className="font-body-sm text-body-sm text-outline-variant dark:text-outline hover:text-white dark:hover:text-primary transition-colors hover:underline">
            Home
          </Link>
          <Link to="/ecosystem" className="font-body-sm text-body-sm text-outline-variant dark:text-outline hover:text-white dark:hover:text-primary transition-colors hover:underline">
            Ecosystem
          </Link>
          <Link to="/resources" className="font-body-sm text-body-sm text-outline-variant dark:text-outline hover:text-white dark:hover:text-primary transition-colors hover:underline">
            Resources
          </Link>
        </div>

        {/* Links Column 2: Legal */}
        <div className="col-span-1 flex flex-col gap-3">
          <h4 className="font-label-md text-label-md text-on-primary-container dark:text-on-surface font-semibold mb-2 uppercase tracking-wider">Legal</h4>
          <a href="#" className="font-body-sm text-body-sm text-outline-variant dark:text-outline hover:text-white dark:hover:text-primary transition-colors hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="font-body-sm text-body-sm text-outline-variant dark:text-outline hover:text-white dark:hover:text-primary transition-colors hover:underline">
            Terms of Service
          </a>
          <a href="#" className="font-body-sm text-body-sm text-outline-variant dark:text-outline hover:text-white dark:hover:text-primary transition-colors hover:underline">
            Contact Support
          </a>
        </div>

        {/* Subscribe Column */}
        <div className="col-span-1 flex flex-col gap-3">
          <h4 className="font-label-md text-label-md text-on-primary-container dark:text-on-surface font-semibold mb-2 uppercase tracking-wider">Subscribe</h4>
          <p className="font-body-sm text-body-sm text-outline-variant dark:text-outline mb-1">
            Sign up for our exclusive monthly C-suite briefing.
          </p>
          <form onSubmit={handleSubmit} className="flex">
            <input 
              type="email" 
              placeholder="Executive Briefing" 
              className="bg-surface/10 border border-outline-variant/30 rounded-l-md px-3 py-2 text-body-sm focus:outline-none focus:border-tertiary-container text-white w-full placeholder:text-outline-variant/75"
              required
            />
            <button 
              type="submit" 
              className="bg-tertiary-container text-on-tertiary-container px-4 py-2 rounded-r-md hover:bg-tertiary-container/90 transition-colors flex items-center justify-center"
              aria-label="Submit subscribe request"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>

        {/* Copyright Indicator */}
        <div className="col-span-1 md:col-span-4 mt-8 pt-8 border-t border-outline-variant/10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body-sm text-body-sm text-outline-variant dark:text-outline">
            © 2026 BizGrowth Enterprise. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-outline-variant hover:text-white transition-colors" aria-label="Language selection">
              <span className="material-symbols-outlined">language</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
