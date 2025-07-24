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

  // Lê o config.json com mapeamento de linguagens
  const config = JSON.parse(await fs.promises.readFile('config.json', 'utf-8'));
  const languageMap: Record<string, string> = {};
  config.languages.forEach((lang: Language) => {
    languageMap[lang.extension] = lang.id;
  });

  // Lê a lista de exercícios modificados
  const exercises = (await fs.promises.readFile('exercises.txt', 'utf-8'))
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

  const select = page.locator('select[name="problem"]');
  await select.waitFor({ timeout: 5000 });

  const optionCount = await select.locator('option:not([value="-1"])').count();
  if (optionCount === 0) throw new Error('❌ Nenhuma opção de problema disponível.');

  // Submete uma solução por exercício
  for (const dirName of exercises) {
    const pasta = path.join('problemas', dirName);
    const arquivos = await fs.promises.readdir(pasta);
    const arquivoFonte = arquivos.find(a => a.includes('.') && !a.endsWith('.txt'));

    if (!arquivoFonte) {
      console.log(`⚠️ Nenhum arquivo-fonte encontrado na pasta ${pasta}`);
      continue;
    }

    const ext = path.extname(arquivoFonte).slice(1); // remove o ponto (ex: .c → c)
    const languageId = languageMap[ext];

    if (!languageId) {
      console.log(`⚠️ Extensão .${ext} não suportada no config.json – pulando ${arquivoFonte}`);
      continue;
    }

    console.log(`🚀 Submetendo ${arquivoFonte} com linguagem ID ${languageId}`);

    await page.locator('select[name="problem"]').selectOption({ index: 0 }); // assume problema 1, ajustável se necessário
    await page.locator('select[name="language"]').selectOption(languageId);
    await page.locator('input[name="sourcefile"]').setInputFiles(path.join(pasta, arquivoFonte));

    page.once('dialog', async dialog => await dialog.accept());
    await page.getByRole('button', { name: 'Send' }).click();

    await page.waitForTimeout(1000); // breve pausa entre submissões
  }

  // Aguardando a correção automática
  await page.goto('http://localhost:8000/boca/team/run.php');

  let stillWaiting = true;
  while (stillWaiting) {
    try {
      await page.waitForSelector('text="Not answered yet"', { timeout: 2000 });
      console.log('⌛ Aguardando autojudge...');
    } catch {
      stillWaiting = false;
      console.log('✅ Todas as submissões foram julgadas.');
    }

    if (stillWaiting) {
      await page.waitForTimeout(3000);
      await page.goto('http://localhost:8000/boca/team/run.php');
    }
  }

  // Lê resultados da tabela e grava no resposta.txt de cada exercício
  const results: string[] = [];
  const runCount = await page.locator('table tr').count();

  for (let i = 2; i < runCount + 1; i++) {
    try {
      const status = await page.locator(`table tr:nth-child(${i}) td:nth-child(5)`).innerText();
      results.push(status.trim());
    } catch {
      results.push('Resultado não encontrado');
    }
  }

  for (let i = 0; i < exercises.length; i++) {
    const filePath = path.join('problemas', exercises[i], 'resposta.txt');
    await fs.promises.writeFile(filePath, results[i] || 'Resultado não encontrado');
    console.log(`📄 Resultado salvo em ${filePath}`);
  }

});
