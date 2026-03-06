import { NextResponse } from 'next/server';
import { chromium } from 'playwright';
import { generateObject } from 'ai';
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { z } from 'zod';

export const maxDuration = 60; // Allow API route to run up to 60 seconds (useful for headless browsers)

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Launch a headless browser configuration
        const browser = await chromium.launch({ headless: true });

        // Create a context that masks automation
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        });

        const page = await context.newPage();

        // Go to the URL with a more resilient wait condition.
        // `networkidle` is often too strict for modern SPAs that constantly poll analytics or connections.
        // We catch the timeout so it doesn't fail the whole request, allowing us to still try to extract what rendered.
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
            // add a small explicit wait to let React/Vue hydration finish rendering elements
            await page.waitForTimeout(2500);
        } catch (e: any) {
            console.log(`Navigation timeout or error caught: ${e.message}. Proceeding to scrape available DOM.`);
        }

        // Extract basic page properties
        const title = await page.title() || '';

        // Use fallback methods to query the rendered DOM inside the page execution context
        const descriptionMeta = await page.evaluate(() => {
            const meta = document.querySelector('meta[name="description"]');
            return meta ? meta.getAttribute('content') : '';
        });

        // Attempt to guess company name and job title from the page title
        let companyName = "Unknown Company";
        let jobTitle = title;

        if (title.includes(' @ ')) {
            // Handle formats like "Software Engineer @ General Motors | Simplify Jobs"
            const parts = title.split(' @ ');
            jobTitle = parts[0].trim();
            companyName = parts[1].split('|')[0].trim();
        } else if (title.includes(' at ')) {
            const parts = title.split(' at ');
            jobTitle = parts[0].trim();
            companyName = parts[1].split(/[-|]/)[0].trim();
        } else if (title.includes('-')) {
            const parts = title.split('-');
            jobTitle = parts[0].trim();
            companyName = parts.length > 1 ? parts[1].trim() : "Unknown Company";
        }

        // Extract inner text of the body to get the actual visible content after JS renders
        const bodyTextRaw = await page.evaluate(() => document.body.innerText) || '';
        // Increase limit to 20,000 characters to capture the full job description
        const bodyText = bodyTextRaw.replace(/\s+/g, ' ').trim().slice(0, 20000);

        await browser.close();

        // If descriptionMeta is very short (less than 100 chars), it's probably useless SEO.
        // Prefer the full body text in that case so the user gets the actual job description.
        const finalDescription = (descriptionMeta && descriptionMeta.length > 100)
            ? descriptionMeta + '\n\n' + bodyText
            : bodyText;

        console.log("Extracted raw text. Sending to AWS Bedrock for structured parsing...");

        // Use Claude 3 Haiku for fast, cheap, and accurate JSON extraction
        const { object: structuredData } = await generateObject({
            model: bedrock('anthropic.claude-3-haiku-20240307-v1:0'),
            system: `You are an expert technical recruiter and data extractor. 
You will be given the raw text scraped from a job application web page.
Your job is to extract and categorize the key information into a structured JSON format.
Be concise but comprehensive. Extract actual sentences from the text where possible for requirements and responsibilities.`,
            prompt: `
Job Title context: ${jobTitle}
Company context: ${companyName}

Raw Page Text:
${finalDescription}
`,
            schema: z.object({
                company_name: z.string().describe("The name of the company hiring."),
                job_title: z.string().describe("The official job title."),
                description: z.string().describe("A brief 2-3 sentence summary of the role and company."),
                responsibilities: z.array(z.string()).describe("A list of key day-to-day responsibilities or 'what you will do'."),
                requirements: z.array(z.string()).describe("A list of hard requirements, degrees, or qualifications."),
                skills: z.array(z.object({
                    name: z.string().describe("Name of the skill, e.g., 'React', 'TypeScript', 'Communication'"),
                    type: z.enum(['Hard', 'Soft', 'Technology']).describe("Categorize the skill")
                })).describe("A list of specific skills mentioned in the posting."),
                category: z.string().describe("A general category like 'Software Engineering', 'Data', 'Marketing', etc.")
            })
        });

        console.log("Bedrock extraction complete.");

        return NextResponse.json(structuredData);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
