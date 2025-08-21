# HUB

Configurações para ter acesso aos outros repositórios:  

Configurações para  utilizar:  
 - crie um teplate deste repositório.
 - Crie um [PAT](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)   
 - Crie um [secret](https://docs.github.com/pt/actions/security-guides/using-secrets-in-github-actions) neste repositório utilizando o PAT, o nome padrão do secret utilizado nas actions é token
 - Modifique o workflow nvm.yml colocando suas credenciais (utilizando o secret criado) e modifique o repo de soluções para o seu, abaixo segue detalhamente as mudanças necessárias no arquivo nvm.yml:

   - linha 19: mudar secrets.token para secrets.NOME_DO_SEU_TOKEN
   - linha 30: mude 'leol0ps/backup-tcc' para seu repositório de soluções exemplo 'conta-professor/repositorio-professor'
   - linha 31: mudar secrets.BASE_REPO para secrets.NOME_DO_SEU_TOKEN
   - linha 137: inserir seu usuario
   - linha 138: inserir seu email
   - linha 139: mudar secrets.token para secrets.NOME_DO_SEU_TOKEN


