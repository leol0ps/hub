FROM ghcr.io/joaofazolo/boca-docker/boca-jail:latest

RUN apt-get update && apt-get install -y \
    gcc g++ make libc6-dev binutils libc-dev libisl23 libmpc3 libmpfr6 libgomp1 libquadmath0 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Opcional: conferir versão do gcc pra garantir que está instalado
RUN gcc --version
