FROM resin/raspberrypi3-node:7

ENTRYPOINT ["/usr/local/bin/npm"]
CMD ["start"]

WORKDIR /src
COPY package.json /src/package.json
RUN npm install

COPY app.js .
COPY app2.js .
COPY app3.js .

