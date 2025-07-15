FROM ghcr.io/joaofazolo/boca-docker/boca-jail:latest

USER root

RUN apt-get update && apt-get install -y gcc g++ make libc6-dev && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /bocajail/usr/bin /bocajail/usr/lib/gcc/x86_64-linux-gnu/11 /bocajail/lib64

# Copia binários
RUN cp /usr/bin/gcc /bocajail/usr/bin/ && \
    cp /usr/bin/gcc-11 /bocajail/usr/bin/ && \
    cp /usr/bin/as /bocajail/usr/bin/ && \
    cp /usr/bin/ld /bocajail/usr/bin/ && \
    cp /usr/lib/gcc/x86_64-linux-gnu/11/cc1 /bocajail/usr/lib/gcc/x86_64-linux-gnu/11/

# Copia bibliotecas do gcc, cc1, as, ld para dentro do chroot com estrutura de diretórios
RUN ldd /usr/bin/gcc | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp -v --parents '{}' /bocajail/ && \
    ldd /usr/lib/gcc/x86_64-linux-gnu/11/cc1 | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp -v --parents '{}' /bocajail/ && \
    ldd /usr/bin/as | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp -v --parents '{}' /bocajail/ && \
    ldd /usr/bin/ld | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp -v --parents '{}' /bocajail/

# Copia o loader (ld-linux) também
RUN cp /lib64/ld-linux-x86-64.so.2 /bocajail/lib64/

# Ajusta permissões se necessário
RUN chmod -R 755 /bocajail

