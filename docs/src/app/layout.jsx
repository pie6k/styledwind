import 'nextra-theme-docs/style.css'

import { Banner, Head } from 'nextra/components'
/* eslint-env node */
import { Footer, Layout, Navbar } from 'nextra-theme-docs'

import { getPageMap } from 'nextra/page-map'

export const metadata = {
  metadataBase: new URL('https://nextra.site'),
  title: {
    template: '%s - Nextra'
  },
  description: 'Nextra: the Next.js site builder',
  applicationName: 'Nextra',
  generator: 'Next.js',
  appleWebApp: {
    title: 'Nextra'
  },
  other: {
    'msapplication-TileImage': '/ms-icon-144x144.png',
    'msapplication-TileColor': '#fff'
  },
  twitter: {
    site: 'https://nextra.site'
  }
}

export default async function RootLayout({ children }) {
  const navbar = (
    <Navbar
      logo={
        <div>
          <b>styledwind</b>
        </div>
      }
      projectLink="https://github.com/pie6k/styledwind"

    />
  )
  const pageMap = await getPageMap()
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="✦" />
      <body>
        <Layout
          // banner={<Banner storageKey="Nextra 2">Nextra 2 Alpha</Banner>}
          navbar={navbar}
          footer={<Footer>MIT {new Date().getFullYear()} © styledwind.</Footer>}
          editLink="Edit this page on GitHub"
          docsRepositoryBase="https://github.com/pie6k/styledwind/blob/main/docs"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          pageMap={pageMap}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
