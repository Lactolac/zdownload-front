# Etapa 1: Construcción
FROM node:22.12.0-alpine AS build-stage

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el package.json y package-lock.json al directorio de trabajo
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto de los archivos de la aplicación al directorio de trabajo
COPY . .

# Compila la aplicación para producción
RUN npm run build

# Expone el puerto que usará la aplicación (ajusta según sea necesario)
EXPOSE 5173

# Comando para ejecutar la aplicación
CMD ["npm", "run", "serve"]