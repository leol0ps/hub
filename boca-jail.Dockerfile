FROM ghcr.io/joaofazolo/boca-docker/boca-jail:latest
RUN apt-get update && apt-get install -y gcc g++ make libc6-dev && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /bocajail
# Copia executáveis para dentro do jail
RUN cp -v /usr/bin/gcc /bocajail/usr/bin/ && \
    cp -v /usr/bin/gcc-11 /bocajail/usr/bin/ && \
    cp -v /usr/bin/as /bocajail/usr/bin/ && \
    cp -v /usr/bin/ld /bocajail/usr/bin/ || true

RUN cp -v $(gcc -print-prog-name=cc1) /bocajail$(dirname $(gcc -print-prog-name=cc1))
RUN ldd /usr/bin/gcc | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp --parents '{}' /bocajail/ && \
    ldd $(gcc -print-prog-name=cc1) | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp --parents '{}' /bocajail/ && \
    ldd /usr/bin/as | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp --parents '{}' /bocajail/ && \
    ldd /usr/bin/ld | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp --parents '{}' /bocajail/

RUN mkdir -p /bocajail/lib64 && \
    cp -v /lib64/ld-linux-x86-64.so.2 /bocajail/lib64/ || true && \
    cp -v /lib/x86_64-linux-gnu/ld-*.so* /bocajail/lib/x86_64-linux-gnu/ || true


RUN mkdir -p /bocajail/usr/include && \
    cp -r /usr/include/* /bocajail/usr/include/


RUN ldd /usr/bin/gcc | grep "ld-linux" || true


RUN cp -r /lib/x86_64-linux-gnu /bocajail/lib/ || true && \
    cp -r /usr/lib/x86_64-linux-gnu /bocajail/usr/lib/ || true


RUN rm -rf /var/lib/apt/lists/*

