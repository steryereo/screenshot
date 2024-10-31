const { chromium } = require('playwright')
const { parseArgs } = require('node:util');
const { homedir } = require('node:os');

const SPL_VIEWPORTS = [
  { min: 1601, max: 9999, name: 'xl4' },
  { min: 1377, max: 1600, name: 'xl3' },
  { min: 1249, max: 1376, name: 'xl2' },
  { min: 1009, max: 1248, name: 'xl' },
  { min: 809, max: 1008, name: 'lg' },
  { min: 513, max: 808, name: 'md' },
  { min: 361, max: 512, name: 'sm' },
  { min: 320, max: 360, name: 'xs' },
]

  ; (async () => {


    const options = {
      user: {
        type: 'string',
      },
      pass: {
        type: 'string',
      },
      url: {
        type: 'string',
      },
    };

    const { values } = parseArgs({ options });

    const { user, pass, url } = values;


    const browser = await chromium.launch({ headless: false })
    const context = await browser.newContext({ httpCredentials: { username: user, password: pass } })

    // block ads
    context.route(/pub.network/, (route) => {
      console.log('Blocking request to ', route.request().url())
      route.abort()
    })

    const page = await context.newPage()

    console.log(`Navigating to ${url}...`)

    await page.goto(url)

    const closeOsano = await page.locator('.osano-cm-dialog__close')
    closeOsano.click()

    for (const { min, name } of SPL_VIEWPORTS) {
      console.log(`Taking screenshot for ${name}...`)

      await page.setViewportSize({ width: min, height: 800 })
      await page.waitForTimeout(1500)

      const dateString = new Date().toISOString().replace(/:/g, '').replace("T", "_").replace(/\.[\d]+Z/, '')
      await page.screenshot({ path: `${homedir()}/Desktop/screens/${dateString}-${min}-${name}-min.png` })
    }

    await context.close()
    await browser.close()
  })()
