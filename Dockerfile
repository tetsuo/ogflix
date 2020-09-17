FROM node:12-alpine

RUN apk update && \
    apk add nginx && \
    apk add bash && \
    apk add libtool && \
    apk add autoconf && \
    apk add automake && \
    apk add gcc && \
    apk add g++ && \
    apk add libgcc && \
    apk add make && \
    apk add python && \
    rm -rf /var/cache/apk/* && \
    rm -rf /tmp/*

ADD /etc/nginx /etc/nginx
ADD public /public

RUN mkdir -p /run/nginx
RUN echo "sed -i -e 's/host\.docker\.internal/127\.0\.0\.1/g' /etc/nginx/nginx.conf && [ ! -z \"\$PORT\" ] && sed -i -e 's/[[:digit:]]\\+ default_server/'\"\$PORT\"' default_server/g' /etc/nginx/nginx.conf && NODE_ENV=production PORT=8000 nohup node /app/index.js > /app.out & nginx -g 'pid /nginx.pid; daemon off;'" > /start
RUN chmod +x /start

ENV NODE_ENV production
ADD ./lib/server /app
COPY package.json /app/package.json
RUN npm --silent --prefix /app --production install

CMD ["/bin/bash", "-c", "/start"]
