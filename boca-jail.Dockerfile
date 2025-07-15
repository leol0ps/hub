# Dockerfile que estende a imagem boca-jail oficial
FROM ghcr.io/joaofazolo/boca-docker/boca-jail:latest

# Copia gcc e libs do sistema para dentro do ambiente chroot (/bocajail)
RUN apt-get update && \
    apt-get install -y gcc libstdc++6 libc6 && \
    mkdir -p /bocajail/usr/bin /bocajail/lib /bocajail/lib64 /bocajail/usr/lib && \
    cp -v /usr/bin/gcc* /bocajail/usr/bin/ && \
    cp -v /lib/x86_64-linux-gnu/libc.so.6 /bocajail/lib/ || true && \
    cp -v /lib64/ld-linux-x86-64.so.2 /bocajail/lib64/ || true && \
    cp -v /usr/lib/x86_64-linux-gnu/libstdc++.so.6 /bocajail/usr/lib/ || true
