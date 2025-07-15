FROM ghcr.io/joaofazolo/boca-docker/boca-jail:latest

RUN apt-get update && \
    apt-get install -y gcc g++ make libc6-dev libisl-dev binutils && \
    apt-get clean && rm -rf /var/lib/apt/lists/*


RUN mkdir -p /bocajail/usr/bin && \
    cp -v /usr/bin/gcc /bocajail/usr/bin/ && \
    cp -v /usr/bin/gcc-11 /bocajail/usr/bin/ && \
    cp -v /usr/bin/as /bocajail/usr/bin/ && \
    cp -v /usr/bin/ld /bocajail/usr/bin/ || true


RUN CC1=$(gcc -print-prog-name=cc1) && \
    mkdir -p /bocajail$(dirname $CC1) && \
    cp -v $CC1 /bocajail$CC1


RUN ldd /usr/bin/gcc | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp --parents '{}' /bocajail/ && \
    ldd $(gcc -print-prog-name=cc1) | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp --parents '{}' /bocajail/ || true


RUN cp -rv /usr/include /bocajail/usr/ && \
    cp -rv /usr/lib/gcc /bocajail/usr/lib/


RUN mkdir -p /bocajail/lib64 && \
    cp -v /lib64/ld-linux-x86-64.so.2 /bocajail/lib64/
