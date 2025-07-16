import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

interface Submission {
  problemnumber: string;
  problemname: string;
  zipfile: string;
  language: string;
}

test('Submeter vários problemas com base no JSON', async ({ page }) => {
  const now = new Date();
  const brasilData = new Date(now.getTime() - 3.5 * 60 * 60 * 1000);
  const hours = brasilData.getUTCHours();
  const minutes = brasilData.getUTCMinutes();

  const submissions = JSON.parse(fs.readFileSync('submissoes.json', 'utf8')) as Submission[];

  // Login como system para ativar o contest
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

  // Login como admin para enviar problemas
  await page.goto('http://localhost:8000/boca/index.php');
  await page.locator('input[name="name"]').fill('admin');
  await page.locator('input[name="password"]').fill('boca');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'Problems' }).click();
  for (const sub of submissions) {
    await page.locator('input[name="problemnumber"]').fill(sub.problemnumber);
    await page.locator('input[name="problemname"]').fill(sub.problemname);
    await page.locator('input[name="probleminput"]').setInputFiles(sub.zipfile);
    page.once('dialog', async dialog => await dialog.accept());
    await page.getByRole('button', { name: 'Send' }).click();
  }

  // Importar usuários
  await page.getByRole('link', { name: 'Users' }).click();
  await page.locator('input[name="importfile"]').setInputFiles('user.txt');
  page.once('dialog', async dialog => await dialog.accept());
  await page.getByRole('button', { name: 'Import' }).click();

  // Ativar site
  await page.getByRole('link', { name: 'Site' }).click();
  await page.locator('input[name="startdateh"]').fill(String(hours));
  await page.locator('input[name="startdatemin"]').fill(String(minutes));
  await page.getByRole('cell', { name: '<- experimental' }).click();
  await page.locator('input[name="autojudge"]').check();
  page.once('dialog', async dialog => await dialog.accept());
  await page.getByRole('button', { name: 'Send' }).click();

  console.log('🕒 Aguardando o BOCA registrar os problemas...');
  await page.waitForTimeout(5000);
});

test('Submit solutions and get results', async ({ page }) => {
  test.setTimeout(180_000);

  const submissaoData = JSON.parse(await fs.promises.readFile('submissoes.json', 'utf8')) as Submission[];
  const exercises = (await fs.promises.readFile('exercises.txt', 'utf8'))
    .split('\n').map(x => x.trim()).filter(Boolean);

  // Login como bot
  await page.goto('http://localhost:8000/boca/');
  await page.locator('input[name="name"]').fill('bot');
  await page.locator('input[name="password"]').fill('boca');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Problems' }).click();
  await page.getByRole('link', { name: 'Runs' }).click();

  // Espera dinâmica até <select> com problemas estar disponível
  const maxRetries = 3;
  let ready = false;

  for (let i = 0; i < maxRetries; i++) {
    console.log(`🔁 Tentativa ${i + 1}`);
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.goto('http://localhost:8000/boca/');
    await page.locator('input[name="name"]').fill('bot');
    await page.locator('input[name="password"]').fill('boca');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'Problems' }).click();
    await page.getByRole('link', { name: 'Runs' }).click();
    try {
      const select = page.locator('select[name="problem"]');
      await select.waitFor({ timeout: 5000 });

      const optionCount = await select.locator('option:not([value="-1"])').count();
      if (optionCount > 0) {
        ready = true;
        console.log(`✅ ${optionCount} opção(ões) encontrada(s). Prosseguindo...`);
        break;
      }
      throw new Error('⚠️ Nenhuma opção válida encontrada.');
    } catch (e) {
      console.log(e.message);
      try {
        await page.getByRole('link', { name: 'Logout' }).click();
      } catch {
        console.log('⚠️ Logout falhou ou já estava deslogado');
      }
      await page.waitForTimeout(3000);
      await page.goto('http://localhost:8000/boca/index.php');
      await page.locator('input[name="name"]').fill('bot');
      await page.locator('input[name="password"]').fill('boca');
      await page.getByRole('button', { name: 'Login' }).click();
      await page.getByRole('link', { name: 'Problems' }).click();
      await page.getByRole('link', { name: 'Runs' }).click();
    }
  }

  if (!ready) {
    throw new Error('❌ Não foi possível encontrar problemas após várias tentativas.');
  }

  // Submete soluções
  for (const dirName of exercises) {
    const submissao = submissaoData.find(s => s.problemname === dirName);
    if (!submissao) {
      console.log(`⚠️ Submissão para ${dirName} não encontrada.`);
      continue;
    }

    const folder = path.join('problemas', dirName);
    const files = await fs.promises.readdir(folder);
    const cFile = files.find(f => f.endsWith('.c'));
    if (!cFile) {
      console.log(`⚠️ Nenhum .c encontrado em ${folder}`);
      continue;
    }

    console.log(`🚀 Submetendo ${dirName} (${cFile})`);

    await page.locator('select[name="problem"]').selectOption(submissao.problemnumber);
    await page.locator('select[name="language"]').selectOption(submissao.language);
    await page.locator('input[name="sourcefile"]').setInputFiles(path.join(folder, cFile));
    page.once('dialog', async dialog => await dialog.accept());
    await page.getByRole('button', { name: 'Send' }).click();
    await page.waitForTimeout(1000);
  }

  // Espera avaliação das submissões
  await page.goto('http://localhost:8000/boca/team/run.php');
  await page.waitForTimeout(10_000);

  let waiting = true;
  while (waiting) {
    try {
      await page.waitForSelector('text="Not answered yet"', { timeout: 2000 });
      console.log('⌛ Aguardando correção automática...');
    } catch {
      console.log('✅ Todas as submissões corrigidas.');
      waiting = false;
    }
    if (waiting) {
      await page.waitForTimeout(3000);
      await page.goto('http://localhost:8000/boca/team/run.php');
    }
  }

  // Coleta os resultados
  const results: string[] = [];
  for (let i = 0; i < exercises.length; i++) {
    const row = i + 2;
    try {
      const result = await page.locator(`table tr:nth-child(${row}) td:nth-child(5)`).innerText();
      results.push(result.trim());
    } catch {
      results.push('Resultado não encontrado');
    }
  }

  // Salva em resposta.txt
  for (let i = 0; i < exercises.length; i++) {
    const filePath = path.join('problemas', exercises[i], 'resposta.txt');
    await fs.promises.writeFile(filePath, results[i]);
    console.log(`📄 Resposta para ${exercises[i]} salva em ${filePath}`);
  }

  await page.getByRole('link', { name: 'Logout' }).click();
});
