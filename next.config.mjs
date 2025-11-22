const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  // Disable the built-in image optimizer to avoid occasional 400s from the proxy.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
