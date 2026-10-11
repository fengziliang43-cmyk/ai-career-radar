import type { NextConfig } from 'next';

const nextConfig: NextConfig = { basePath: process.env.RADAR_BASE_PATH ?? '' };

export default nextConfig;
