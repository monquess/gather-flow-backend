FROM node:22.11.0-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY . .

RUN npm run build

FROM node:22.11.0-alpine AS production

WORKDIR /app

ENV NODE_ENV production

COPY --chown=node:node --from=build /app/package.json /app/package-lock.json ./
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/prisma ./prisma

RUN npx prisma generate
RUN npm ci --omit=dev && npm cache clean --force

EXPOSE 3000

CMD ["npm", "run", "start:migrate:prod"]