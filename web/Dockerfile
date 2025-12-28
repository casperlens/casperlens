FROM oven/bun:1.3 AS builder

WORKDIR /app

COPY bun.lock package.json tsconfig.json ./
COPY . .

RUN bun install --frozen-lockfile
RUN bun run build

FROM oven/bun:1.3 AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/* ./

EXPOSE 3000
CMD ["bun", "start"]