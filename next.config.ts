import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental:{
    serverActions:{
      bodySizeLimit:'100MB',
    }
  },
  typescript:{
    ignoreBuildErrors:true,
      },
      eslint:{
        ignoreDuringBuilds:true,
      },
      images:{
          domains: ['cdn.pixabay.com','cloud.appwrite.io'], // Add 'cdn.pixabay.com' as a trusted domain
      }
};

export default nextConfig;
