import { test, expect } from '@playwright/test';
const now = new Date();
const hours = now.getHours();
const minutes = now.getMinutes() + 1;


test('test', async ({ page }) => {
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
  await page.locator('input[name="probleminput"]').setInputFiles('/home/leo/abacaxipath/abacaxi.zip');
  page.once('dialog', async dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.accept();
  
  });
  await page.getByRole('button', { name: 'Send' }).click();
  await page.getByRole('link', { name: 'Users' }).click();
  await page.locator('input[name="importfile"]').click();
  await page.locator('input[name="importfile"]').setInputFiles('/home/leo/abacaxipath/user.txt');
  page.once('dialog', async dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Import' }).click();
  //await page.getByRole('link', { name: 'Logout' }).click();
});