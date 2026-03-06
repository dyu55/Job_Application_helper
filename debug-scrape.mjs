import { chromium } from 'playwright';

(async () => {
    console.log("Starting debug script...");
    const browser = await chromium.launch({ headless: true });
    try {
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        });
        const page = await context.newPage();

        console.log("Navigating...");
        try {
            await page.goto("https://simplify.jobs/p/7f07b83f-6b6f-4722-9fc9-391681b0c844/Software-Engineer--Early-Career?utm_source=GHList", { waitUntil: 'domcontentloaded', timeout: 15000 });
            await page.waitForTimeout(2500);
        } catch (e) {
            console.log("Goto error caught:", e.message);
        }

        const title = await page.title();
        console.log("--- TITLE ---");
        console.log(title);

        const text = await page.evaluate(() => document.body.innerText);
        console.log("--- TEXT CONTENT ---");
        console.log(text.slice(0, 500));
    } catch (err) {
        console.error("Master Error:", err);
    } finally {
        await browser.close();
    }
})();
