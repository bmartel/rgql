const withPwa = require('next-pwa')

/** @type {import('next').NextConfig} */
module.exports = withPwa({
  reactStrictMode: true,
  // For configuration options @see https://github.com/shadowwalker/next-pwa
  pwa: {
    disable: process.env.NODE_ENV === 'development',
  },
})
