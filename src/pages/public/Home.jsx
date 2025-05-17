import React from 'react';
import { motion } from 'framer-motion';
import heroImage from '../../assets/coconut.jpg';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-16 lg:py-24 max-w-7xl mx-auto">
        <motion.div
          className="md:w-1/2 space-y-6 md:pr-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-green-900 leading-tight">
            Nature's Sports Drink <span className="text-green-600">🌴</span>
          </h1>
          <p className="text-lg text-green-800">
            Welcome to <span className="font-semibold text-green-700">Coconut Tender</span> – your premier source for wholesale tender coconut water, packed with natural electrolytes and nutrients.
          </p>
        </motion.div>

        <motion.div
          className="md:w-1/2 mt-10 md:mt-0 flex justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative">
            <img
              src={heroImage}
              alt="Fresh Coconut"
              className="rounded-2xl shadow-2xl w-full max-w-md border-8 border-white transform rotate-1 hover:rotate-0 transition duration-500"
            />
            <div className="absolute -bottom-4 -right-4 bg-yellow-100 px-4 py-2 rounded-lg shadow-md border border-yellow-200">
              <span className="font-medium text-yellow-800">100% Natural</span>
            </div>
          </div>
        </motion.div>
      </section>


      <section className="bg-white py-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-green-800 mb-6">
            The Science Behind Coconut Water
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <motion.div 
              className="bg-green-50 p-6 rounded-xl border border-green-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold text-green-700 mb-3">🌊 Natural Hydration</h3>
              <p className="text-green-800">
                Coconut water is 94% water and contains natural electrolytes like potassium, sodium, and magnesium, making it more effective than commercial sports drinks for rehydration.
              </p>
            </motion.div>
            <motion.div 
              className="bg-green-50 p-6 rounded-xl border border-green-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold text-green-700 mb-3">🔬 Research Backed</h3>
              <p className="text-green-800">
                Recent studies show that coconut water's unique composition of minerals and antioxidants can help reduce oxidative stress and support heart health, making it a preferred choice for health-conscious consumers.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-green-700 py-16 px-6 md:px-12 text-white">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose Our Coconuts?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: '🥥',
              title: 'Farm Fresh',
              text: 'Harvested at peak freshness from sustainable farms in coastal regions for maximum nutritional value.',
            },
            {
              icon: '🚚',
              title: 'Fast Delivery',
              text: 'Temperature-controlled logistics ensure your coconuts arrive fresh within 24-48 hours of harvest.',
            },
            {
              icon: '📊',
              title: 'Bulk Discounts',
              text: 'Competitive wholesale pricing with volume discounts for regular orders.',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="bg-green-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition hover:bg-green-900"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
            >
              <span className="text-4xl mb-4 block">{item.icon}</span>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p>{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Nutritional Info */}
      <section className="bg-white py-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-green-800 text-center mb-8">
            Nutritional Powerhouse
          </h2>
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6 md:p-8 shadow-sm">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-green-700 mb-4">Per 100ml Serving:</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between border-b border-yellow-200 pb-2">
                    <span>Calories</span>
                    <span className="font-medium">19 kcal</span>
                  </li>
                  <li className="flex justify-between border-b border-yellow-200 pb-2">
                    <span>Potassium</span>
                    <span className="font-medium">250mg</span>
                  </li>
                  <li className="flex justify-between border-b border-yellow-200 pb-2">
                    <span>Magnesium</span>
                    <span className="font-medium">6% DV</span>
                  </li>
                  <li className="flex justify-between border-b border-yellow-200 pb-2">
                    <span>Vitamin C</span>
                    <span className="font-medium">10% DV</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-700 mb-4">Unique Benefits:</h3>
                <ul className="space-y-3 list-disc pl-5 text-green-800">
                  <li>Contains cytokinins - plant hormones with anti-aging properties</li>
                  <li>Naturally fat-free and cholesterol-free</li>
                  <li>Rich in amino acids and antioxidants</li>
                  <li>Helps regulate blood sugar levels</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="bg-green-50 py-16 px-6 md:px-12">
        <h2 className="text-3xl font-bold text-green-800 text-center mb-12">
          Trusted by Businesses
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              name: 'Ravi Traders',
              role: 'Wholesale Distributor',
              feedback:
                'The consistent quality and reliable delivery have helped us expand our coconut water business by 40% this year.',
            },
            {
              name: 'FreshMart Chain',
              role: 'Retail Supermarkets',
              feedback:
                'Customers specifically ask for coconuts from Coconut Tender - the freshness is unmatched in the market.',
            },
            {
              name: 'Healthify Juice Bar',
              role: 'Beverage Business',
              feedback:
                "'We've reduced our preparation time significantly as the coconuts arrive ready-to-serve with perfect sweetness.'",
            },
          ].map((review, i) => (
            <motion.div
              key={i}
              className="bg-white p-6 rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition transform hover:-translate-y-1"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start mb-4">
                <div className="bg-green-100 text-green-800 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mr-4">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-green-900">{review.name}</h4>
                  <p className="text-sm text-green-600">{review.role}</p>
                </div>
              </div>
              <p className="text-green-700 italic">"{review.feedback}"</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="bg-green-900 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Coconut Tender</h3>
            <p className="text-green-300">
              Bringing nature's perfect hydration to your business since 2024.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-green-300">
              <li><a href="/about" className="hover:text-white">About Us</a></li>
              <li><a href="/contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-green-300">
              <li>info@coconutender.com</li>
              <li>+91 9594219463</li>
              <li>Mumbai</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              {[
                { icon: <FaFacebookF size={20} />, name: 'Facebook', link: '#' },
                { icon: <FaInstagram size={20} />, name: 'Instagram', link: '#' },
                { icon: <FaTwitter size={20} />, name: 'Twitter', link: '#' },
                { icon: <FaLinkedinIn size={20} />, name: 'LinkedIn', link: '#' }
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.link}
                  className="bg-green-800 hover:bg-green-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-green-800 mt-8 pt-8 text-center text-green-400">
          <p>© 2025 Coconut Tender. All rights reserved. | Sustainable Farming Initiative</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;