const puppeteer = require('puppeteer')
const fs = require('fs')

async function searchOnTumblr(title, searchTerm) {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  await page.setRequestInterception(true)
  page.on('request', request => {
    if (request.resourceType() === 'image') request.abort()
    else request.continue()
  })

  const results = []
  for (let i = 0; i < 301; i++) {
    await page.goto(`https://${title}.tumblr.com/page/${i}`, { waitUntil: 'domcontentloaded' })
    const articles = await page.$$('article')
    for (const art of articles) {
      const artContent = await page.evaluate(el => el.innerText, art)
      if (artContent.includes(searchTerm)) {
        results.push(artContent)
        console.log(artContent)
        fs.writeFileSync('results.json', JSON.stringify(results))
      }
    }
  }
  await browser.close()
}
searchOnTumblr('jehova', 'index')
