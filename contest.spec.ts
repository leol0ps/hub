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
test('Submit solutions and get results', async ({ page }) => {
  test.setTimeout(180_000);

  // Ler json de submissões do prof
  const submissaoData = JSON.parse(await fs.promises.readFile('submissoes.json', 'utf-8')) as Submission[];

  // Ler lista de exercícios alterados no último commit
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
  let problemOptionVisible = false;
  const maxRetries = 30; // Tenta por até 1 minuto
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
  throw new Error('❌ Não foi possível encontrar o problema 1 após várias tentativas');
}
  // Submeter soluções em loop
  for (const dirName of exercises) {
    // Encontrar submissão que tem o mesmo problemname
    const submissao = submissaoData.find(s => s.problemname === dirName);
    if (!submissao) {
      console.log(`Submissão para problema ${dirName} não encontrada no submissoes.json`);
      continue;
    }

    const sourceFilePath = path.join('problemas', dirName, '*.c');

    // Como não dá para usar wildcard no playwright para setInputFiles, vamos procurar o arquivo .c dentro da pasta
    const files = await fs.promises.readdir(path.join('problemas', dirName));
    const cFile = files.find(f => f.endsWith('.c'));
    if (!cFile) {
      console.log(`Arquivo .c não encontrado na pasta problema/${dirName}`);
      continue;
    }

    console.log(`Submetendo exercício ${dirName} usando arquivo ${cFile}`);

    await page.locator('select[name="problem"]').selectOption(submissao.problemnumber);
    await page.locator('select[name="language"]').selectOption(submissao.language);
    await page.locator('input[name="sourcefile"]').setInputFiles(path.join('problemas', dirName, cFile));

    page.once('dialog', async dialog => await dialog.accept());
    await page.getByRole('button', { name: 'Send' }).click();

    // Pequena espera para não sobrecarregar o BOCA
    await page.waitForTimeout(1000);
  }

  // Esperar todas as runs aparecerem (tempo arbitrário ou pode fazer espera inteligente)
  await page.goto('http://localhost:8000/boca/team/run.php');
  await page.waitForTimeout(10_000);
  await page.goto('http://localhost:8000/boca/team/run.php');

// Espera todos os "Not answered yet" desaparecerem
let stillWaiting = true;
while (stillWaiting) {
  try {
    await page.waitForSelector('text="Not answered yet"', { timeout: 2000 });
    console.log('Still waiting for autojudge...');
  } catch (error) {
    stillWaiting = false;
    console.log('All runs judged.');
  }
  if (stillWaiting) {
    await page.waitForTimeout(3000);
    await page.goto('http://localhost:8000/boca/team/run.php');
  }
}
  // Ler resultados da tabela runs
  const runsCount = await page.locator('table tr').count();

  // Mapeia resultado pela ordem da tabela, pulando o header (linha 1)
  const results: string[] = [];
  for (let i = 0; i < exercises.length; i++) {
    const runRow = i + 2; // run 1 na linha 2, run 2 linha 3...
    try {
      const text = await page.locator(`table tr:nth-child(${runRow}) td:nth-child(5)`).innerText();
      results.push(text.trim());
    } catch {
      results.push('Resultado não encontrado');
    }
  }

  // Gravar resultado em resposta.txt dentro da pasta de cada exercício
  for (let i = 0; i < exercises.length; i++) {
    const filePath = path.join('problemas', exercises[i], 'resposta.txt');
    await fs.promises.writeFile(filePath, results[i]);
    console.log(`Resposta para ${exercises[i]} salva em ${filePath}`);
  }

  // Logout
  await page.getByRole('link', { name: 'Logout' }).click();
});
