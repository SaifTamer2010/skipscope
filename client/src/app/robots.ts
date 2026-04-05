import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app/dashboard/', '/app/settings/', '/app/history/'],
    },
    sitemap: 'https://skipscope.ai/sitemap.xml',
  }
}
