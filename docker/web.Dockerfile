# Next.js dev server. Source is bind-mounted; node_modules lives in a named volume.
FROM node:22-bookworm-slim

WORKDIR /app
RUN mkdir -p /app/node_modules /app/.next && chown -R node:node /app
USER node

ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["sh", "-c", "[ -d node_modules/next ] || npm ci; exec npm run dev -- --hostname 0.0.0.0 --port 3000"]
