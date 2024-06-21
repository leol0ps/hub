import { test, expect } from '@playwright/test';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 5 * 60 * 2000,
});
const now = new Date();
const hours = now.getHours();
const minutes = now.getMinutes();
var check = "Not answered yet"
var tst = true
const selectors = ['YES', 'NO - Compilation error', 'NO - Runtime error', 'NO - Time limit exceeded', 'NO - Presentation error', 'NO - Wrong answer', 'NO - Contact staff']
test('test', async ({ page }) => {
  test.setTimeout(150_000);
  await page.goto('https://demo.playwright.dev/todomvc/');
  await page.goto('https://demo.playwright.dev/todomvc/#/');
  await page.goto('http://localhost:8000/boca/');
  await page.locator('input[name="name"]').click();
  await page.locator('input[name="name"]').fill('system');
  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill('boca');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Contest' }).click();
  await page.getByRole('combobox').selectOption('new');
  await page.locator('input[name="startdateh"]').click();
  await page.locator('input[name="startdateh"]').fill(String(hours));
  await page.locator('input[name="startdatemin"]').click();
  await page.locator('input[name="startdatemin"]').fill(String(minutes));
  page.once('dialog', async dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.accept();

  });
  await page.getByRole('button', { name: 'Activate' }).click();

  await page.goto('http://localhost:8000/boca/index.php');
  await page.locator('input[name="name"]').fill('admin');
  await page.locator('input[name="name"]').press('Tab');
  await page.locator('input[name="password"]').fill('boca');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Problems' }).click();
  await page.locator('input[name="problemnumber"]').click();
  await page.locator('input[name="problemnumber"]').fill('5');
  await page.locator('input[name="problemname"]').click();
  await page.locator('input[name="problemname"]').fill('das');
  await page.locator('input[name="probleminput"]').click();
  await page.locator('input[name="probleminput"]').setInputFiles('L1.zip');
  page.once('dialog', async dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.accept();

  });
  await page.getByRole('button', { name: 'Send' }).click();
  await page.getByRole('link', { name: 'Users' }).click();
  await page.locator('input[name="importfile"]').click();
  await page.locator('input[name="importfile"]').setInputFiles('user.txt');
  page.once('dialog', async dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Import' }).click();
  await page.getByRole('link', { name: 'Site' }).click();
  await page.locator('input[name="startdateh"]').click();
  await page.locator('input[name="startdateh"]').fill(String(hours));
  await page.locator('input[name="startdatemin"]').click();
  await page.locator('input[name="startdatemin"]').fill(String(minutes));
  await page.getByRole('cell', { name: '<- experimental' }).click();
  await page.locator('input[name="autojudge"]').check();
  page.once('dialog', async dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Send' }).click();
  await page.goto('http://localhost:8000/boca/index.php');
  await page.locator('input[name="name"]').click();
  await page.locator('input[name="name"]').fill('bot');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('cell', { name: 'Runs' }).click();
  await page.locator('select[name="problem"]').selectOption('5');
  await page.locator('select[name="language"]').selectOption('1');
  await page.getByRole('textbox').click();
  await page.getByRole('textbox').setInputFiles('ans.c');
  page.once('dialog', async dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Send' }).click();
  while (tst) {
    try {
      const z = await page.waitForSelector('text="Not answered yet"', { timeout: 2000 }) //locator('Not answered yet').first();
    } catch (error) {
      tst = false
    }
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.goto('http://localhost:8000/boca/team/run.php');
  }
  try {
    await page.waitForSelector('text="NO - Contact staff" ', { timeout: 1000 });
    console.log(`Found "NO - Contact staff" on the page.`);
  } catch (error) {
  
  }
  try {
    await page.waitForSelector('text="NO - Wrong answer" ', { timeout: 1000 });
    console.log(`Found "NO - Wrong answer" on the page.`);
  } catch (error) {
  
  }
  try {
    await page.waitForSelector('text="NO - Compilation error" ', { timeout: 1000 });
    console.log(`Found "NO - Compilation error" on the page.`);
  } catch (error) {
  }
  try {
    await page.waitForSelector('text="YES" ', { timeout: 1000 });
    console.log(`Found "YES" on the page.`);
  } catch (error) {
  }
  try {
    await page.waitForSelector('text="NO - Time limit exceeded" ', { timeout: 1000 });
    console.log(`Found "NO - Time limit exceeded" on the page.`);
  } catch (error) {
  }
  try {
    await page.waitForSelector('text="NO - Runtime error" ', { timeout: 1000 });
    console.log(`Found "NO - Runtime error" on the page.`);
  } catch (error) {
  }
  try {
    await page.waitForSelector('text="NO - Presentation error" ', { timeout: 1000 });
    console.log(`Found "NO - Presentation error" on the page.`);
  } catch (error) {
  }
  // for (const selector of selectors){
  //   try {
  //     await page.waitForSelector(`'text= ${selector}'`, {timeout: 1000 });
  //     console.log(`Found "${selector}" on the page.`);
  // } catch (error) {
  //     console.log(`"${selector}" not found on the page within timeout.`);
  // }

  // }

  await page.getByRole('link', { name: 'Logout' }).click();
});



// 1 YES
// 2 NO - Compilation error
// 3 NO - Runtime error
// 4 NO - Time limit exceeded
// 5 NO - Presentation error
// 6 NO - Wrong answer
// 7 NO - Contact staff