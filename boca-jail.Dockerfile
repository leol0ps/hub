FROM ghcr.io/joaofazolo/boca-docker/boca-jail:latest

RUN apt-get update && apt-get install -y gcc g++ make libc6-dev


RUN cp /usr/bin/as /bocajail/usr/bin/ || true


RUN cp /usr/bin/gcc /bocajail/usr/bin/ || true
RUN cp /usr/bin/gcc-11 /bocajail/usr/bin/ || true


RUN mkdir -p /bocajail/usr/lib/gcc/x86_64-linux-gnu/11
RUN cp /usr/lib/gcc/x86_64-linux-gnu/11/cc1 /bocajail/usr/lib/gcc/x86_64-linux-gnu/11/

RUN ldd /usr/bin/gcc | grep "=>" | awk '{print $3}' | xargs -I '{}' cp --parents '{}' /bocajail/
