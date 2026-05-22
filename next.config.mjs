/** @type {import('next').NextConfig} */
const nextConfig = {
  serverActions: {
    bodySizeLimit: '5mb', // Membesarkan limit dari 1MB menjadi 5MB
  },
};

export default nextConfig;