FROM node:16.14 AS builder

WORKDIR /usr/src/app

COPY . .

RUN npm install
RUN npm run build

FROM node:16.14-alpine AS runner

COPY --from=builder /usr/src/app/build ./build/
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/public ./public

ENV VERSION=0.0.6

ENTRYPOINT [ "node", "build/index.js" ]
