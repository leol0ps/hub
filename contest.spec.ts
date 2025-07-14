import { test } from '@playwright/test';

test('Submit problem and configure contest', async ({ page }) => {
  const now = new Date();
  const brasilData = new Date(now.getTime() - 3.5 * 60 * 60 * 1000);
  const hours = brasilData.getUTCHours();
  const minutes = brasilData.getUTCMinutes() ;

  await page.goto('http://localhost:8000/boca/');
  await page.locator('input[name="name"]').fill('system');
  await page.locator('input[name="password"]').fill('boca');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'Contest' }).click();
  await page.getByRole('combobox').selectOption('new');
  await page.locator('input[name="startdateh"]').fill(String(hours));
  await page.locator('input[name="startdatemin"]').fill(String(minutes));
  page.once('dialog', async dialog => await dialog.accept());
  await page.getByRole('button', { name: 'Activate' }).click();

  await page.goto('http://localhost:8000/boca/index.php');
  await page.locator('input[name="name"]').fill('admin');
  await page.locator('input[name="password"]').fill('boca');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'Problems' }).click();
  await page.locator('input[name="problemnumber"]').fill('1');
  await page.locator('input[name="problemname"]').fill('L1_2');
  await page.locator('input[name="probleminput"]').setInputFiles('L1_2.zip');
  page.once('dialog', async dialog => await dialog.accept());
  await page.getByRole('button', { name: 'Send' }).click();

  await page.getByRole('link', { name: 'Users' }).click();
  await page.locator('input[name="importfile"]').setInputFiles('user.txt');
  page.once('dialog', async dialog => await dialog.accept());
  await page.getByRole('button', { name: 'Import' }).click();

  await page.getByRole('link', { name: 'Site' }).click();
  await page.locator('input[name="startdateh"]').fill(String(hours));
  await page.locator('input[name="startdatemin"]').fill(String(minutes));
  await page.getByRole('cell', { name: '<- experimental' }).click();
  await page.locator('input[name="autojudge"]').check();
  page.once('dialog', async dialog => await dialog.accept());
  await page.getByRole('button', { name: 'Send' }).click();
});
test('Submit solution and check result', async ({ page }) => {
    test.setTimeout(120_000);
    const now = new Date();
    const brasilData = new Date(now.getTime() - 3.5 * 60 * 60 * 1000);
    const hours = brasilData.getUTCHours();
    const minutes = brasilData.getUTCMinutes() ;
    const selectors = [
      'YES',
      'NO - Compilation error',
      'NO - Runtime error',
      'NO - Time limit exceeded',
      'NO - Presentation error',
      'NO - Wrong answer',
      'NO - Contact staff'
    ];


    await page.goto('http://localhost:8000/boca/');
    await page.locator('input[name="name"]').fill('bot');
    await page.locator('input[name="password"]').fill('boca');
    await page.getByRole('button', { name: 'Login' }).click();
  
    await page.getByRole('link', { name: 'Problems' }).click();
    await page.getByRole('cell', { name: 'Runs' }).click();
    await page.goto('http://localhost:8000/boca/index.php');
    await page.locator('input[name="name"]').fill('admin');
    await page.locator('input[name="password"]').fill('boca');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'Contest' }).click();
    await page.locator('input[name="startdateh"]').fill(String(hours));
    await page.locator('input[name="startdatemin"]').fill('00');
    page.once('dialog', async dialog => await dialog.accept());
    await page.getByRole('button', { name: 'Update Contest and All Sites' }).click();
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.goto('http://localhost:8000/boca/');
    await page.locator('input[name="name"]').fill('bot');
    await page.locator('input[name="password"]').fill('boca');
    await page.getByRole('button', { name: 'Login' }).click();
  
    await page.getByRole('link', { name: 'Problems' }).click();
    await page.getByRole('cell', { name: 'Runs' }).click();
    await page.waitForTimeout(1000);
    await page.goto('http://localhost:8000/boca/team/run.php');
    await page.getByRole('link', { name: 'Logout' }).click();
  
    
    await page.goto('http://localhost:8000/boca/');
    await page.locator('input[name="name"]').fill('bot');
    await page.locator('input[name="password"]').fill('boca');
    await page.getByRole('button', { name: 'Login' }).click();
  
    await page.getByRole('link', { name: 'Problems' }).click();
    await page.getByRole('cell', { name: 'Runs' }).click();
    

    let problemOptionVisible = false;
    const maxRetries = 50;
    let retries = 0;

    while (!problemOptionVisible && retries < maxRetries) {
      console.log(`Retry attempt: ${retries + 1}`);

      
      await page.goto('http://localhost:8000/boca/index.php');

      
      await page.locator('input[name="name"]').fill('bot');
      await page.locator('input[name="password"]').fill('boca');
      await page.getByRole('button', { name: 'Login' }).click();

     
      await page.getByRole('link', { name: 'Problems' }).click();
      await page.getByRole('cell', { name: 'Runs' }).click();

      
      try {
        await page.locator('select[name="problem"]').selectOption('1', { timeout: 5000 })
        //await page.waitForSelector('select[name="problem"] > option[value="1"]', { timeout: 5000 });
        problemOptionVisible = true;
        console.log('Problem option found!');
      } catch (error) {
        console.log('Problem option not found, retrying...');
        // Logout before retrying
        try {
          await page.getByRole('link', { name: 'Logout' }).click();
        } catch {
          console.log('Logout failed or already logged out');
        }
        await page.waitForTimeout(3000); // wait before retrying
        retries++;
      }
    }

    if (!problemOptionVisible) {
      throw new Error('Failed to find problem option after multiple retries');
    }

    






    await page.locator('select[name="problem"]').selectOption('1');
    await page.locator('select[name="language"]').selectOption('1');
    await page.locator('input[name="sourcefile"]').setInputFiles('ans.c');
  
    
    page.once('dialog', async dialog => await dialog.accept());
    await page.getByRole('button', { name: 'Send' }).click();
  
    await page.goto('http://localhost:8000/boca/team/run.php');
  
    
    let stillWaiting = true;
    while (stillWaiting) {
      try {
        await page.waitForSelector('text="Not answered yet"', { timeout: 2000 });
      } catch (error) {
        stillWaiting = false;
      }
      await page.waitForTimeout(3000);
      await page.goto('http://localhost:8000/boca/team/run.php');
    }
    await page.screenshot({ path: 'screenshot.png' });
    for (const selector of selectors) {
      try {
        await page.waitForSelector(`text="${selector}"`, { timeout: 500 });
        console.log(`Found "${selector}"`);
      } catch (error) {
        console.log(`"${selector}" not found`);
      }
    }
  
    await page.getByRole('link', { name: 'Logout' }).click();
  });
  
