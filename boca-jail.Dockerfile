
FROM ghcr.io/joaofazolo/boca-docker/boca-jail:latest


RUN apt-get update && \
    apt-get install -y gcc g++ libc6-dev make && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


WORKDIR /bocajail


