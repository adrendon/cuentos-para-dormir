#!/bin/bash
set -e

# Config
SERVIDOR="129.153.66.26"
USUARIO="opc"
PEM="$HOME/Downloads/Codigo/alexisrendon.pem"
RUTA_REMOTA="/usr/share/nginx/html/wordpress/upload/repository/"
APK_NAME="cuentos-para-dormir.apk"
APK_SOURCE="./android/app/build/outputs/apk/release/app-release.apk"
APK_LOCAL="./$APK_NAME"

echo "🔨 Compilando APK..."
export ANDROID_HOME=~/Library/Android/sdk

# Prebuild si no existe android/
if [ ! -d "./android" ]; then
  npx expo prebuild --platform android --no-install
fi

# Build release APK
cd android
./gradlew assembleRelease
cd ..

# Verificar que se generó
if [ ! -f "$APK_SOURCE" ]; then
  echo "❌ No se generó la APK en $APK_SOURCE"
  exit 1
fi

# Copiar con nombre final
cp "$APK_SOURCE" "$APK_LOCAL"
echo "✅ APK generada: $APK_LOCAL ($(du -h "$APK_LOCAL" | cut -f1))"

# Subir al servidor
echo "📦 Subiendo a $USUARIO@$SERVIDOR:$RUTA_REMOTA"
scp -o ConnectTimeout=30 -i "$PEM" "$APK_LOCAL" "$USUARIO@$SERVIDOR:$RUTA_REMOTA$APK_NAME"

if [ $? -eq 0 ]; then
  echo "✅ APK subida exitosamente"
  echo "🔗 URL: http://$SERVIDOR/wordpress/upload/repository/$APK_NAME"
else
  echo "❌ Error al subir la APK"
  exit 1
fi
