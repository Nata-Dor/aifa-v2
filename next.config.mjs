// next.config.mjs

export default () => {
  /**
   * @type {import('next').NextConfig}
   */
  const nextConfig = {
    turbopack: {
    },

    async headers() {
      return [
        {
          
          source: '/:path*',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN',
            },
            
            
          ],
        },
      ];
    },
    

  };

  return nextConfig;
};
