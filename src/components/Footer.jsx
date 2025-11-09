import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full text-center py-6 text-sm text-gray-600">
      <p>© {year} HireLens. Crafted with care.</p>
    </footer>
  );
};

export default Footer;
