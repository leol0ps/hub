FROM ghcr.io/joaofazolo/boca-docker/boca-jail:latest


RUN apt-get update && \
    apt-get install -y \
      gcc g++ make libc6-dev libisl-dev binutils && \
    apt-get clean && rm -rf /var/lib/apt/lists/*


RUN cp -v /usr/bin/gcc /bocajail/usr/bin/ && \
    cp -v /usr/bin/gcc-11 /bocajail/usr/bin/ || true && \
    cp -v /usr/bin/as /bocajail/usr/bin/ && \
    cp -v /usr/bin/ld /bocajail/usr/bin/ || true && \
    cp -v $(gcc -print-prog-name=cc1) /bocajail$(dirname $(gcc -print-prog-name=cc1))/


RUN ldd /usr/bin/gcc | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp --parents '{}' /bocajail/ && \
    ldd /usr/bin/as | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp --parents '{}' /bocajail/ && \
    ldd /usr/bin/ld | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp --parents '{}' /bocajail/ && \
    ldd $(gcc -print-prog-name=cc1) | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp --parents '{}' /bocajail/ || true


RUN cp -r /usr/include /bocajail/usr/ && \
    cp -r /usr/lib/gcc /bocajail/usr/lib/ && \
    cp -r /lib/x86_64-linux-gnu /bocajail/lib/ && \
    cp -r /usr/lib/x86_64-linux-gnu /bocajail/usr/lib/


RUN cp -v /lib64/ld-linux-x86-64.so.2 /bocajail/lib64/ || true
