# Étape 1 : build de l'application Vue/Vite
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Variables Vite nécessaires AU MOMENT DU BUILD (pas au runtime)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_STRIPE_PUBLIC_KEY
ARG VITE_APP_URL
ARG VITE_VAPID_PUBLIC_KEY
ARG VITE_MAINTENANCE_MODE=false

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY
ENV VITE_MAINTENANCE_MODE=$VITE_MAINTENANCE_MODE

RUN node node_modules/vite/bin/vite.js build

# Étape 2 : servir les fichiers buildés avec Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80