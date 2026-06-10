import React from 'react';
const Footer: React.FC = () => {
  return <footer className="bg-navy text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-teal-500">BOLDVAN</h3>
            <p className="text-sm text-white">Your trusted destination for premium products across all categories.</p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="hover:text-teal-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="hover:text-teal-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-teal-400 transition-colors text-white">Electronics</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors text-white">Beauty, Fashion & Sports</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors text-white">Home & Living</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors text-white">Eco-Friendly, and Power</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors text-white">Foodstuff</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white">Customer Service</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-teal-400 transition-colors text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors text-white">Track Order</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors text-white">Returns</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors text-white">Shipping Info</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors text-white">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Newsletter</h4>
            <p className="text-sm mb-4 text-white">Subscribe for exclusive deals!</p>
            <form className="flex flex-col gap-2">
              <input type="email" placeholder="Your email" className="px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <button className="bg-teal-600 px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-white">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p className="text-white">© 2025 BOLDVAN. All rights reserved.</p>
        </div>
      </div>
    </footer>;
};
export default Footer;