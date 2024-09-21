import { test, expect } from '@playwright/test';

const VIDEO_TEST_LINK = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // :3

// Before each test, open the page (/) in the browser and wait for the
// page to load.
test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
});

// Test the branding of the page.
test('branding', async ({ page }) => {
    // Page has a tile of "cobalt"
    const title = await page.title();
    expect(title).toBe('cobalt');

    /*
     * Check if the omnibar is present on the page and has correct branding.
     * IDs: omnibox, meowbalt (branding), cobalt-save (root main tag)
     */
    const requiredOmniBarElements = ['omnibox', 'cobalt-save'];
    for (const element of requiredOmniBarElements) {
        expect(await page.isVisible(`#${element}`)).toBe(true);
    }

    // Make sure meowbalt is in the correct default state (visible, class set to "meowbalt smile")
    // note: meowbalt is a class, not an id
    const meowbalt = await page.$('.meowbalt');
    expect(await meowbalt?.isVisible()).toBe(true);
    expect(await meowbalt?.getAttribute('class')).toContain('meowbalt smile');
    expect(await meowbalt?.getAttribute('src')).toBe('/meowbalt/smile.png');

    // Aria-hidden attribute is set to true, alt = "meowbalt"
    expect(await meowbalt?.getAttribute('aria-hidden')).toBe('true');
    expect(await meowbalt?.getAttribute('alt')).toBe('meowbalt');
});

// Omnibar related tests
test('omnibar', async ({ page }) => {
    // Check if the omnibar is present on the page
    expect(await page.isVisible('#omnibox')).toBe(true);

    // Input field is present and has the correct placeholder
    const input = await page.$('#omnibox input');
    expect(await input?.isVisible()).toBe(true);
    expect(await input?.getAttribute('placeholder')).toBe(
        'paste the link here',
    );

    // Check that all buttons can be clicked #action-container (besides the first one and the last one)
    const buttons = await (
        await page.$$('#action-container button')
    ).slice(1, -1);
    for (const button of buttons) {
        await button.click();

        // Check if the button has the "selected" class after clicking
        expect(await button.getAttribute('class')).toContain('active');

        // Make sure the aria-pressed attribute is set to true
        expect(await button.getAttribute('aria-pressed')).toBe('true');
    }
});

test('supported services', async ({ page }) => {
    // Check if the supported services are present on the page
    expect(await page.isVisible('#supported-services')).toBe(true);

    // Click the services-button and expect the dropdown to be visible (services-popover)
    // Visibility of the popover is when the popover has the "expanded" class
    const servicesButton = await page.$('#services-button');
    const servicesPopover = await page.$('#services-popover');
    await servicesButton?.click();

    // Check if the services popover is visible
    expect(await servicesPopover?.getAttribute('class')).toContain('expanded');
    await servicesButton?.click();
    expect(await servicesPopover?.getAttribute('class')).not.toContain(
        'expanded',
    );

    // Now open the services popover and ensure skeleton is present
    await servicesButton?.click();

    // Get all the skeleton elements
    const skeletonElements = await page.$$('#services-popover .skeleton');
    expect(skeletonElements.length).toBeGreaterThan(0);

    // Now wait for the services to load and ensure the skeleton is gone (max of 10 seconds)
    await page.waitForSelector('#services-popover .service-item', {
        state: 'attached',
        timeout: 10000,
    });
});

test('download example', async ({ page }) => {
    // Get the input field and set the value to the test link
    const input = await page.$('#omnibox input');
    await input?.fill(VIDEO_TEST_LINK);

    // Click the download button
    const downloadButton = await page.$('#download-button');
    await downloadButton?.click();

    // Wait for the network request to api.cobalt.tools to finish
    const req = await page.waitForRequest('**/api.cobalt.tools/');
    const rsp = await req.response();
    expect(rsp).not.toBe(null);

    // Ensure we have a 200 OK and a valid JSON response
    expect(rsp!.status()).toBe(200);
    const json = await rsp!.json();

    // Json should contain the following keys: "status", "url", "and filename"
    const props = ['status', 'url', 'filename'];
    for (const prop of props) {
        expect(json).toHaveProperty(prop);
    }
});
