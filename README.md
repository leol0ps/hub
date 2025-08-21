# HUB

Configurações para ter acesso aos outros repositórios:  

Configurações para  utilizar:  
 - crie um teplate deste repositório.
 - Crie um [PAT](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)   
 - Crie um [secret](https://docs.github.com/pt/actions/security-guides/using-secrets-in-github-actions) neste repositório utilizando o PAT, o nome padrão do secret utilizado nas actions é token
 - Modifique o workflow nvm.yml colocando suas credenciais (utilizando o secret criado) e modifique o repo de soluções para o seu
 - coloque seu usuario e email no job "Commit individual para cada exercício" no nvm.yml
