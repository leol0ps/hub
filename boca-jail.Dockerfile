FROM ghcr.io/joaofazolo/boca-docker/boca-jail:latest

# Instala gcc, g++, make e libc6-dev (caso não estejam)
RUN apt-get update && \
    apt-get install -y gcc g++ make libc6-dev && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Cria diretórios necessários
RUN mkdir -p /bocajail/usr/bin /bocajail/usr/lib/gcc/x86_64-linux-gnu/11 /bocajail/usr/lib/x86_64-linux-gnu /bocajail/lib64

# Copia executáveis principais para /bocajail
RUN cp -v /usr/bin/gcc /bocajail/usr/bin/ && \
    cp -v /usr/bin/gcc-11 /bocajail/usr/bin/ && \
    cp -v /usr/bin/as /bocajail/usr/bin/ || true && \
    cp -v /usr/bin/ld /bocajail/usr/bin/ || true

# Copia cc1 do gcc
RUN cp -v $(gcc -print-prog-name=cc1) /bocajail$(dirname $(gcc -print-prog-name=cc1))

# Copia bibliotecas do gcc e cc1
RUN ldd /usr/bin/gcc | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp --parents '{}' /bocajail/ && \
    ldd $(gcc -print-prog-name=cc1) | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp --parents '{}' /bocajail/

# Copia bibliotecas do assembler (as)
RUN ldd /usr/bin/as | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp --parents '{}' /bocajail/ || true

# Copia a biblioteca dinâmica do loader (libc)
RUN cp -v /lib64/ld-linux-x86-64.so.2 /bocajail/lib64/ || true

