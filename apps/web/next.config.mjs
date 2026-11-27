const base = process.env.BASE_PATH ?? '';
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  basePath: base,
  assetPrefix: base || undefined,
  images: { unoptimized: true },
  transpilePackages: ['@brigether/ui'],
  env: { NEXT_PUBLIC_BASE_PATH: base },
};
export default nextConfig;