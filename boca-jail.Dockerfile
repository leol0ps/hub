FROM ghcr.io/joaofazolo/boca-docker/boca-jail:latest

USER root

# Instala gcc e ferramentas
RUN apt-get update && apt-get install -y gcc g++ make libc6-dev && apt-get clean && rm -rf /var/lib/apt/lists/*

# Cria diretórios dentro da jail
RUN mkdir -p /bocajail/usr/bin /bocajail/usr/lib/gcc/x86_64-linux-gnu/11 /bocajail/lib64

# Cria links simbólicos para os binários e libs dentro da jail apontando para o sistema real
RUN ln -sf /usr/bin/gcc /bocajail/usr/bin/gcc && \
    ln -sf /usr/bin/gcc-11 /bocajail/usr/bin/gcc-11 && \
    ln -sf /usr/bin/as /bocajail/usr/bin/as && \
    ln -sf /usr/bin/ld /bocajail/usr/bin/ld && \
    ln -sf /usr/lib/gcc/x86_64-linux-gnu/11/cc1 /bocajail/usr/lib/gcc/x86_64-linux-gnu/11/cc1 && \
    ln -sf /lib64/ld-linux-x86-64.so.2 /bocajail/lib64/ld-linux-x86-64.so.2

# Pega as libs usadas por gcc, cc1, as, ld e cria links para dentro da jail
RUN for bin in /usr/bin/gcc /usr/lib/gcc/x86_64-linux-gnu/11/cc1 /usr/bin/as /usr/bin/ld; do \
      ldd $bin | grep "=> /" | awk '{print $3}' | xargs -I '{}' ln -sf '{}' /bocajail'{}'; \
    done


