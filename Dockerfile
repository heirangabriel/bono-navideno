FROM nginx:alpine

# Copia TODO lo que está en la carpeta actual
COPY . /usr/share/nginx/html/

# Copia tu configuración personalizada de nginx si existe
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

