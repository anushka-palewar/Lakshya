import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container-max">
        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Content */}
        <div className="footer-content">
          {/* Copyright */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="footer-copyright"
          >
            © 2026 Sankalp AI — Design Your Destiny
          </motion.p>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="footer-security"
          >
            <span className="security-badge">🔐 JWT Encrypted</span>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
