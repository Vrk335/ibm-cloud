FROM node:18

WORKDIR /app

COPY backend/package.json ./backend/package.json
RUN cd backend && npm install

COPY backend ./backend
COPY frontend ./frontend

EXPOSE 3000

CMD ["node", "backend/app.js"]