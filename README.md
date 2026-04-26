# Carimbai — App Mobile

Aplicativo Android de cartão fidelidade digital. Permite que clientes acumulem carimbos e resgatem recompensas, e que lojistas gerenciem seus programas de fidelidade pelo celular.

Parte do ecossistema Carimbai junto ao backend (Spring Boot) e ao painel web (React).

---

## Pré-requisitos

Conclua o guia [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) antes de continuar.

---

## Desenvolvimento

### 1. Iniciar o Metro

```sh
npm start
```

### 2. Rodar no emulador ou dispositivo (via USB)

```sh
npm run android
```

---

## Build de release

Gera um APK para instalar diretamente no celular, sem precisar de cabo ou emulador:

```sh
cd android
./gradlew assembleRelease
```

O APK fica em:

```
android/app/build/outputs/apk/release/app-release.apk
```

Transfira o arquivo para o celular (WhatsApp, Google Drive, cabo, etc.) e instale. Ative "Instalar apps de fontes desconhecidas" nas configurações do dispositivo caso necessário.

---

## Estrutura principal

```
src/
  context/       # CustomerContext e StaffContext (AsyncStorage)
  navigation/    # AppNavigator (stack root)
  screens/       # Telas de cliente e lojista
    staff/       # Dashboard com tabs de scan, clientes e configurações
  utils/         # Constantes de cores e formatadores
```

---

## Troubleshooting

Consulte a página de [Troubleshooting](https://reactnative.dev/docs/troubleshooting) do React Native.

---

© Lucas Diniz. Todos os direitos reservados.
