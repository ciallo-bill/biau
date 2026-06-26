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
const previousButton = interactionPage.getByRole('button', { name: '上一页' })
const previousDisabled = await previousButton.isDisabled()
const previousAriaDisabled = await previousButton.getAttribute('aria-disabled')
if (!previousDisabled || previousAriaDisabled !== 'true') {
  failures.push('/blog pagination: previous button should be disabled with aria-disabled on first page')
}
await interactionPage.locator('.blog-search').fill('RAG')
await interactionPage.waitForTimeout(100)
const searchedCards = await interactionPage.locator('.blog-card').count()
const resultMeta = await interactionPage.locator('.blog-result-meta').innerText()
if (searchedCards === 0 || !resultMeta.includes('篇文章')) {
  failures.push('/blog search: expected visible search results and result meta')
}
await interactionPage.locator('.blog-search').fill('no-result-for-ui-check')
await interactionPage.waitForTimeout(100)
if (!(await interactionPage.locator('.blog-empty').isVisible())) {
  failures.push('/blog empty state: expected empty state for unmatched search')
}
await interactionPage.close()

const keyboardPage = await browser.newPage({ viewport: viewports[0] })
await keyboardPage.goto(`${base}/projects`, { waitUntil: 'networkidle' })
for (let index = 0; index < 20; index += 1) {
  const focusedProject = await keyboardPage.evaluate(() => document.activeElement?.classList.contains('project-card'))
  if (focusedProject) break
  await keyboardPage.keyboard.press('Tab')
}
const focusedProject = await keyboardPage.evaluate(() => document.activeElement?.classList.contains('project-card'))
if (!focusedProject) {
  failures.push('/projects keyboard: expected Tab to reach a project card')
} else {
  await keyboardPage.keyboard.press('Enter')
  await keyboardPage.waitForURL(/\/projects\/[^/]+$/, { timeout: 5000 }).catch(() => {
    failures.push('/projects keyboard: Enter on focused project card did not navigate to detail page')
  })
}
await keyboardPage.close()

const imagePage = await browser.newPage({ viewport: viewports[1] })
await imagePage.goto(`${base}/projects/legal-rag`, { waitUntil: 'networkidle' })
const imageOk = await imagePage.locator('.detail-hero-image img').evaluate((image) => {
  const img = image instanceof HTMLImageElement ? image : null
  if (!img || img.naturalWidth === 0 || img.naturalHeight === 0) return false
  const rect = img.getBoundingClientRect()
  return rect.left >= -1 && rect.right <= document.documentElement.clientWidth + 1
})
const webpSource = await imagePage.locator('.detail-hero-image source[type="image/webp"]').getAttribute('srcset')
if (!imageOk) {
  failures.push('/projects/legal-rag image: detail image did not load or overflowed horizontally')
}
if (!webpSource?.endsWith('.webp')) {
  failures.push('/projects/legal-rag image: expected webp source fallback picture')
}
await imagePage.close()

await browser.close()

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`UI check passed for ${routes.length} routes across ${viewports.length} viewports at ${base}`)
