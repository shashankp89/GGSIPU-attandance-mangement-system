import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer bg-ggsipu-navy text-white p-6 mt-auto print:hidden">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="GGSIPU logo" className="logo" />
          <div>
            <div className="font-semibold text-white">Guru Gobind Singh Indraprastha University</div>
            <div className="text-sm text-gray-300">Academic Management Portal</div>
          </div>
        </div>

        <div className="text-sm text-gray-300">&copy; {currentYear} All Rights Reserved.</div>

        <div className="flex space-x-4">
          <a href="#" className="text-yellow-400 hover:text-yellow-300">Privacy</a>
          <a href="#" className="text-yellow-400 hover:text-yellow-300">Terms</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
