import { chromium } from 'playwright'

const base = process.env.UI_CHECK_BASE ?? 'http://127.0.0.1:5174'
const siteUrl = 'https://biau.playlab.eu.cc'

const routes = [
  { path: '/', title: 'BIAU PORT', nav: '所有项目', canonical: '/' },
  { path: '/projects', title: '项目集', nav: '回主页', canonical: '/projects' },
  { path: '/blog', title: '知识库', nav: '回主页', canonical: '/blog' },
  { path: '/projects/legal-rag', title: 'Legal RAG', nav: '回主页', canonical: '/projects/legal-rag' },
  {
    path: '/blog/ai-fullstack-day-01-rag-overview',
    title: 'RAG 系统入门',
    nav: '回主页',
    canonical: '/blog/ai-fullstack-day-01-rag-overview',
  },
  { path: '/missing-route-for-ui-check', title: '页面没有靠岸', nav: '回主页', canonical: '/missing-route-for-ui-check' },
]

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 900 },
]

const failures = []
const browser = await chromium.launch({ headless: true })

for (const viewport of viewports) {
  for (const route of routes) {
    const page = await browser.newPage({ viewport })
    const logs = []

    page.on('console', (message) => {
      if (['error', 'warning'].includes(message.type())) {
        logs.push(`${message.type()}: ${message.text()}`)
      }
    })
    page.on('pageerror', (error) => logs.push(`pageerror: ${error.message}`))

    await page.goto(`${base}${route.path}`, { waitUntil: 'networkidle' })

    const titleText = await page.locator('h1, .hero-title-main').first().innerText().catch(() => '')
    const navCount = await page.locator('.nav-all-tools').count()
    const navText = navCount > 0 ? (await page.locator('.nav-all-tools').innerText()).trim() : 'hidden'
    const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')

    if (!titleText.includes(route.title)) {
      failures.push(`${viewport.name} ${route.path}: expected title containing "${route.title}", got "${titleText}"`)
    }

    if (viewport.name === 'desktop' && navText !== route.nav) {
      failures.push(`${viewport.name} ${route.path}: expected nav "${route.nav}", got "${navText}"`)
    }

    if (overflowX) {
      failures.push(`${viewport.name} ${route.path}: horizontal overflow detected`)
    }

    if (viewport.name === 'desktop' && canonical !== `${siteUrl}${route.canonical}`) {
      failures.push(`${viewport.name} ${route.path}: expected canonical "${siteUrl}${route.canonical}", got "${canonical}"`)
    }

    if (viewport.name === 'desktop' && (!description || description.length < 20)) {
      failures.push(`${viewport.name} ${route.path}: missing useful meta description`)
    }

    if (viewport.name === 'desktop' && (!ogTitle || ogTitle.length < 8)) {
      failures.push(`${viewport.name} ${route.path}: missing useful og:title`)
    }

    if (logs.length > 0) {
      failures.push(`${viewport.name} ${route.path}: ${logs.join(' | ')}`)
    }

    await page.close()
  }
}

const interactionPage = await browser.newPage({ viewport: viewports[0] })
await interactionPage.goto(`${base}/blog`, { waitUntil: 'networkidle' })
const initialCards = await interactionPage.locator('.blog-card').count()
if (initialCards !== 12) {
  failures.push(`/blog pagination: expected 12 cards on first page, got ${initialCards}`)
}
await interactionPage.locator('.blog-search').fill('RAG')
await interactionPage.waitForTimeout(100)
const searchedCards = await interactionPage.locator('.blog-card').count()
const resultMeta = await interactionPage.locator('.blog-result-meta').innerText()
if (searchedCards === 0 || !resultMeta.includes('篇文章')) {
  failures.push('/blog search: expected visible search results and result meta')
}
await interactionPage.close()

await browser.close()

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`UI check passed for ${routes.length} routes across ${viewports.length} viewports at ${base}`)
