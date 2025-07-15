FROM ghcr.io/joaofazolo/boca-docker/boca-jail:latest


RUN apt-get update && \
    apt-get install -y gcc g++ make libc6-dev && \
    apt-get clean && rm -rf /var/lib/apt/lists/*


RUN mkdir -p /bocajail/usr/bin /bocajail/usr/lib/gcc/x86_64-linux-gnu/11 && \
    cp -v /usr/bin/gcc /bocajail/usr/bin/ && \
    cp -v /usr/bin/gcc-11 /bocajail/usr/bin/ && \
    cp -v /usr/lib/gcc/x86_64-linux-gnu/11/cc1 /bocajail/usr/lib/gcc/x86_64-linux-gnu/11/

RUN ldd /usr/bin/gcc | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp --parents '{}' /bocajail/ && \
    ldd /usr/lib/gcc/x86_64-linux-gnu/11/cc1 | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp --parents '{}' /bocajail/


RUN cp --parents /lib64/ld-linux-x86-64.so.2 /bocajail/ || true
