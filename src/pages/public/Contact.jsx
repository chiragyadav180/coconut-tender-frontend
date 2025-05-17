import React from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Contact = () => {
  return (
    <div className="min-h-screen bg-green-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">Contact Us</h1>
          <p className="text-xl text-green-700 max-w-2xl">
            Get in touch with us for any inquiries about our coconut products.
          </p>
        </motion.div>

       
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-xl shadow-md border border-green-100 max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-semibold text-green-700 mb-6">Contact Information</h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FiMail className="text-green-700 text-xl" />
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Email</h3>
                <p className="text-gray-600">info@coconutender.com</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FiPhone className="text-green-700 text-xl" />
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Phone</h3>
                <p className="text-gray-600">+91 9594219463</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FiMapPin className="text-green-700 text-xl" />
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Address</h3>
                <p className="text-gray-600">Mumbai</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;