FROM node:22.14.0-alpine AS build

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY . .

RUN npm run build

FROM node:22.14.0-alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --chown=node:node --from=build /usr/src/app/package.json /usr/src/app/package-lock.json ./
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma

RUN npm ci --omit=dev && npm cache clean --force
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:migrate:prod"]