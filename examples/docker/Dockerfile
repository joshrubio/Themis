FROM node:latest

ENV DATABASE_PASSWORD=sup3rSecret!
ENV STRIPE_SECRET_KEY=sk_live_51H8xxxxxxxxxxxxxxxxxxxx

WORKDIR /app
COPY . .
RUN npm install --production

EXPOSE 3000

CMD ["node", "server.js"]
