FROM ghcr.io/joaofazolo/boca-docker/boca-jail:latest


RUN apt-get update && \
    apt-get install -y gcc g++ make libc6-dev && \
    apt-get clean && rm -rf /var/lib/apt/lists/*


RUN ldd /usr/bin/gcc | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp --parents '{}' /bocajail/ || true


RUN cp -v /usr/bin/gcc /bocajail/usr/bin/ || true


RUN cp -v /usr/bin/gcc-11 /bocajail/usr/bin/ || true


RUN cp -v /lib64/ld-linux-x86-64.so.2 /bocajail/lib64/ || true


RUN chmod -R a+rX /bocajail


RUN ls -lR /bocajail/usr/bin/
RUN ls -lR /bocajail/lib64/
