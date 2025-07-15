FROM ghcr.io/joaofazolo/boca-docker/boca-jail:latest

USER root

# Instala compiladores e ferramentas essenciais
RUN apt-get update && apt-get install -y gcc g++ make libc6-dev binutils && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Cria estrutura de diretórios esperada dentro da jail
RUN mkdir -p /bocajail/usr/bin \
             /bocajail/usr/lib \
             /bocajail/usr/lib/gcc/x86_64-linux-gnu/11 \
             /bocajail/lib \
             /bocajail/lib64 \
             /bocajail/tmp

# Copia os binários principais para a jail
RUN cp -v /usr/bin/gcc /usr/bin/gcc-11 /usr/bin/as /usr/bin/ld /bocajail/usr/bin/

# Copia o `cc1` para o mesmo caminho relativo dentro da jail
RUN cp -v $(gcc -print-prog-name=cc1) /bocajail$(dirname $(gcc -print-prog-name=cc1))/

# Copia o loader dinâmico (ld-linux) se ainda não existir
RUN [ ! -e /bocajail/lib64/ld-linux-x86-64.so.2 ] && \
    cp /lib64/ld-linux-x86-64.so.2 /bocajail/lib64/ || \
    echo "ld-linux already present"

# Copia TODAS as libs necessárias dos binários principais
RUN for bin in /usr/bin/gcc /usr/bin/gcc-11 /usr/bin/as /usr/bin/ld $(gcc -print-prog-name=cc1); do \
      echo "Copying libs for $bin"; \
      ldd $bin | grep "=> /" | awk '{print $3}' | \
        xargs -I '{}' cp --parents '{}' /bocajail/; \
    done

# Copia cabeçalhos padrão do sistema (ex: stdio.h, math.h, stddef.h)
RUN cp -r /usr/include /bocajail/usr/

# Garante permissões mínimas para execução
RUN chmod -R 755 /bocajail
