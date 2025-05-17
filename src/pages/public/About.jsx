import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen bg-green-50 p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">
          About Our Coconut Journey
        </h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-md border border-green-100"
            >
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                Premium Wholesale Coconut Supply
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We specialize in supplying <span className="font-medium text-green-800">high-quality tender coconuts</span> to vendors across the region. Our coconuts are handpicked at the perfect stage of maturity to ensure optimal sweetness and nutritional value.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 rounded-xl shadow-md border border-green-100"
            >
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                Our Sourcing Regions
              </h2>
              <p className="text-gray-700 mb-4">
                We source directly from the finest coconut-growing regions:
              </p>
              <ul className="grid grid-cols-2 gap-2 text-gray-700">
                {[
                  'Karnataka (Mysore)',
                  'Kerala (Thrissur)',
                  'Tamil Nadu (Pollachi)',
                  'Andhra Pradesh',
                  'Goa',
                  'Maharashtra'
                ].map((region, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    {region}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-md border border-green-100"
            >
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                Coconut Varieties We Supply
              </h2>
              <div className="space-y-4">
                {[
                  {
                    name: 'West Coast Tall',
                    desc: 'Known for abundant water content and sweet taste',
                    regions: 'Kerala, Karnataka'
                  },
                  {
                    name: 'Chowghat Orange Dwarf',
                    desc: 'Smaller nuts with distinct flavor',
                    regions: 'Kerala'
                  },
                  {
                    name: 'Tiptur Tall',
                    desc: 'Famous for thick, sweet water',
                    regions: 'Karnataka'
                  },
                  {
                    name: 'Pollachi Hybrid',
                    desc: 'High yield with consistent quality',
                    regions: 'Tamil Nadu'
                  }
                ].map((variety, index) => (
                  <div key={index} className="border-b border-green-100 pb-3">
                    <h3 className="font-medium text-green-800">{variety.name}</h3>
                    <p className="text-sm text-gray-600">{variety.desc}</p>
                    <p className="text-xs text-gray-500 mt-1">Sourced from: {variety.regions}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-md border border-green-100"
            >
              <h2 className="text-2xl font-semibold text-green-700 mb-4">
                Our Quality Promise
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="flex items-start">
                  <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-3">1</span>
                  Direct from farms to ensure freshness
                </p>
                <p className="flex items-start">
                  <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-3">2</span>
                  Strict quality checks at every stage
                </p>
                <p className="flex items-start">
                  <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-3">3</span>
                  Competitive wholesale pricing
                </p>
                <p className="flex items-start">
                  <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-3">4</span>
                  Reliable supply chain network
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-green-100 border border-green-200 rounded-xl p-8 text-center"
        >
          <h3 className="text-xl font-medium text-green-800 mb-3">
            Partnering with Local Farmers
          </h3>
          <p className="text-gray-700 max-w-3xl mx-auto">
            We work directly with coconut farmers across South India to bring you the freshest produce while ensuring fair prices for growers. Our sustainable sourcing practices help maintain the ecological balance of coconut plantations.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default About;