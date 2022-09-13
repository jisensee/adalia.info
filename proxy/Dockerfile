FROM nginx:1.21.6

LABEL org.opencontainers.image.source="https://github.com/jisensee/adalia.info"

COPY ./default.conf /etc/nginx/templates/default.conf.template

COPY cert-dev.pem /etc/dev-certs/cert.pem
COPY key-dev.pem /etc/dev-certs/key.pem