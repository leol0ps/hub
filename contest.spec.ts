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

  // Lê o JSON contendo as submissões
  const submissions = JSON.parse(fs.readFileSync('submissoes.json', 'utf8'));

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

  // Login como admin para inserir os problemas
  await page.goto('http://localhost:8000/boca/index.php');
  await page.locator('input[name="name"]').fill('admin');
  await page.locator('input[name="password"]').fill('boca');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'Problems' }).click();

  // Envia os problemas conforme o JSON
  for (const sub of submissions) {
    await page.locator('input[name="problemnumber"]').fill(sub.problemnumber);
    await page.locator('input[name="problemname"]').fill(sub.problemname);
    await page.locator('input[name="probleminput"]').setInputFiles(sub.zipfile);
    page.once('dialog', async dialog => await dialog.accept());
    await page.getByRole('button', { name: 'Send' }).click();
  }

  // Importa os usuários
  await page.getByRole('link', { name: 'Users' }).click();
  await page.locator('input[name="importfile"]').setInputFiles('user.txt');
  page.once('dialog', async dialog => await dialog.accept());
  await page.getByRole('button', { name: 'Import' }).click();

  // Ativa o site
  await page.getByRole('link', { name: 'Site' }).click();
  await page.locator('input[name="startdateh"]').fill(String(hours));
  await page.locator('input[name="startdatemin"]').fill(String(minutes));
  await page.getByRole('cell', { name: '<- experimental' }).click();
  await page.locator('input[name="autojudge"]').check();
  page.once('dialog', async dialog => await dialog.accept());
  await page.getByRole('button', { name: 'Send' }).click();
});




interface Language {
  name: string;
  extension: string;
  id: string;
}

test('Submit solutions and get results', async ({ page }) => {
  test.setTimeout(180_000);

  const configPath = path.join('config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as { languages: Language[] };

  // Lê json de submissões
  const submissaoData = JSON.parse(await fs.promises.readFile('submissoes.json', 'utf-8')) as Submission[];

  // Lê arquivos modificados (com caminho completo)
  const changedFiles = (await fs.promises.readFile('changed_files.txt', 'utf-8'))
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Login no BOCA
  await page.goto('http://localhost:8000/boca/');
  await page.locator('input[name="name"]').fill('bot');
  await page.locator('input[name="password"]').fill('boca');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'Problems' }).click();
  await page.getByRole('link', { name: 'Runs' }).click();
  await page.waitForSelector('form[action="run.php"]', { timeout: 5000 });
  await page.waitForSelector('select[name="problem"]', { timeout: 5000 });

  let problemOptionVisible = false;
  const maxRetries = 2;
  let retries = 0;

  while (!problemOptionVisible && retries < maxRetries) {
    console.log(`🔁 Tentativa ${retries + 1}`);
    try {
      await page.goto('http://localhost:8000/boca/index.php');
      await page.locator('input[name="name"]').fill('bot');
      await page.locator('input[name="password"]').fill('boca');
      await page.getByRole('button', { name: 'Login' }).click();

      await page.getByRole('link', { name: 'Problems' }).click();
      await page.getByRole('cell', { name: 'Runs' }).click();

      const select = page.locator('select[name="problem"]');
      await select.waitFor({ timeout: 5000 });

      const optionCount = await select.locator('option:not([value="-1"])').count();
      if (optionCount > 0) {
        problemOptionVisible = true;
        console.log(`✅ ${optionCount} opção(ões) encontrada(s). Prosseguindo...`);
      } else {
        throw new Error('⚠️ Nenhuma opção encontrada no <select>.');
      }
    } catch (err) {
      console.log(`⚠️ ${err.message}`);
      try {
        await page.getByRole('link', { name: 'Logout' }).click();
      } catch {
        console.log('⚠️ Logout falhou ou não era necessário.');
      }
      await page.waitForTimeout(3000);
      retries++;
    }
  }

  if (!problemOptionVisible) {
    throw new Error('❌ Não foi possível encontrar nenhuma opção de problema após várias tentativas.');
  }

  const exercises: string[] = [];

  for (const filepath of changedFiles) {
    const filename = path.basename(filepath); // ans.py
    const extension = path.extname(filename).slice(1); // py
    const dirName = path.basename(path.dirname(filepath)); // L1_3
    const submissao = submissaoData.find(s => s.problemname === dirName);
    const linguagem = config.languages.find(l => l.extension === extension);

    if (!submissao || !linguagem) {
      console.log(`⚠️ Dados insuficientes para submeter ${filename}`);
      continue;
    }

    console.log(`🚀 Submetendo ${filename} com linguagem ID ${linguagem.id}`);
    await page.locator('select[name="problem"]').selectOption(submissao.problemnumber);
    await page.locator('select[name="language"]').selectOption(linguagem.id);
    await page.locator('input[name="sourcefile"]').setInputFiles(filepath);

    page.once('dialog', async dialog => await dialog.accept());
    await page.getByRole('button', { name: 'Send' }).click();
    await page.waitForTimeout(1000);

    exercises.push(dirName);
  }

  // Esperar BOCA julgar
  await page.goto('http://localhost:8000/boca/team/run.php');
  await page.waitForTimeout(10_000);
  await page.goto('http://localhost:8000/boca/team/run.php');

  let stillWaiting = true;
  while (stillWaiting) {
    try {
      await page.waitForSelector('text="Not answered yet"', { timeout: 2000 });
      console.log('⌛ Ainda aguardando autojudge...');
    } catch {
      stillWaiting = false;
      console.log('✅ Todas as submissões foram julgadas.');
    }
    if (stillWaiting) {
      await page.waitForTimeout(3000);
      await page.goto('http://localhost:8000/boca/team/run.php');
    }
  }

  // Lê os resultados (assumindo que estão em ordem)
  const runsCount = await page.locator('table tr').count();
  const results: string[] = [];
  for (let i = 0; i < exercises.length; i++) {
    const row = i + 2; // pula cabeçalho
    try {
      const text = await page.locator(`table tr:nth-child(${row}) td:nth-child(5)`).innerText();
      results.push(text.trim());
    } catch {
      results.push('Resultado não encontrado');
    }
  }

  // Salva cada resultado em resposta.txt
  for (let i = 0; i < exercises.length; i++) {
    const filePath = path.join('problemas', exercises[i], 'resposta.txt');
    await fs.promises.writeFile(filePath, results[i]);
    console.log(`📄 Resultado salvo em ${filePath}`);
  }
});
