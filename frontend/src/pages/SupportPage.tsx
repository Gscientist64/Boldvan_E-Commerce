import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, X } from 'lucide-react';

const SupportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [chatOpen, setChatOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqs = [
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 3-5 business days. Express shipping is available for 1-2 day delivery.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy on all items. Products must be unused and in original packaging.'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to over 100 countries worldwide. Shipping costs vary by location.'
    },
    {
      question: 'How can I track my order?',
      answer: 'You can track your order using the tracking number sent to your email or visit our Track Order page.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, bank transfer, Paystack, and Flutterwave.'
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for contacting us! We will respond within 24 hours.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Customer Support</h1>
          <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
            We're here to help. Reach out through any channel below and we'll get back to you fast.
          </p>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold text-navy text-lg mb-3">Email Support</h3>
            <p className="text-gray-600 text-sm mb-3 break-all">BOLDVANresourcesng@gmail.com</p>
            <p className="text-xs text-gray-400 bg-indigo-50 inline-block px-3 py-1 rounded-full">Response within 24 hours</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-200">
              <Phone className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold text-navy text-lg mb-3">Phone Support</h3>
            <p className="text-gray-600 text-sm mb-3 font-mono">234-8060850469</p>
            <p className="text-xs text-gray-400 bg-teal-50 inline-block px-3 py-1 rounded-full">Mon-Fri 8AM-6PM WAT</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-200">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold text-navy text-lg mb-3">Live Chat</h3>
            <button
              onClick={() => setChatOpen(true)}
              className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm mb-3 underline underline-offset-2"
            >
              Start Chat
            </button>
            <p className="text-xs text-gray-400 bg-purple-50 inline-block px-3 py-1 rounded-full">Available 24/7</p>
          </div>
        </div>
      </div>

      {/* Tabbed FAQ / Contact Section */}
      <div className="max-w-4xl mx-auto px-4 mt-12 mb-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex-1 py-5 font-semibold text-sm uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'faq'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Frequently Asked Questions
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex-1 py-5 font-semibold text-sm uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'contact'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Contact Form
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'faq' && (
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <details key={index} className="group border border-gray-100 rounded-xl overflow-hidden">
                    <summary className="cursor-pointer font-semibold text-navy py-4 px-6 bg-gray-50 hover:bg-indigo-50 transition-colors list-none flex justify-between items-center">
                      {faq.question}
                      <span className="text-indigo-400 group-open:rotate-180 transition-transform ml-4">▼</span>
                    </summary>
                    <p className="mt-0 px-6 py-4 text-gray-600 bg-white border-t border-gray-100">{faq.answer}</p>
                  </details>
                ))}
              </div>
            )}

            {activeTab === 'contact' && (
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                    <input
                      type="text"
                      placeholder="Your Name"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      placeholder="Your Email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                  <input
                    type="text"
                    placeholder="Subject"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                  <textarea
                    placeholder="Your Message"
                    required
                    rows={6}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Live Chat Widget */}
      {chatOpen && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-4">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-bold">BOLDVAN Support</h3>
            </div>
            <button onClick={() => setChatOpen(false)} aria-label="Close chat" title="Close chat" className="text-white/80 hover:text-white transition-colors">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="p-4 h-64 overflow-y-auto bg-gray-50 space-y-3">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-800">
                Hello 👋! How can we help you today?
              </p>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              <button title="Send message" aria-label="Send chat message" className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;
