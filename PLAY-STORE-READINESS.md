# Gym AI Coach — estado de publicación en Google Play

## Listo en el proyecto

- Identificador Android: `com.gymia.app`.
- Nombre visible: `Gym AI Coach`.
- `versionCode`: `2`.
- `versionName`: `1.1.0`.
- `compileSdkVersion`: `36`.
- `targetSdkVersion`: `36`.
- Permisos declarados: Internet, cámara y micrófono.
- Pantalla pública de privacidad: `/privacy`.
- Eliminación de cuenta dentro de Perfil, con eliminación del perfil, entrenamientos, planes, registros corporales y sesiones de autenticación.
- Integración móvil de RevenueCat preparada para el entitlement `premium`, producto `premium_monthly` y precio de referencia `$9.99 / mes`.
- APK debug compilado correctamente.
- AAB release compilado correctamente.

Google Play exige que las apps nuevas y sus actualizaciones apunten a Android 16 / API 36 desde el 31 de agosto de 2026 [1]. El proyecto ya cumple ese requisito.

## Pendiente de tu cuenta de Google Play

1. Crear o abrir la ficha de la aplicación en Play Console con el paquete exacto `com.gymia.app`.
2. Configurar Play App Signing y conservar de forma segura la clave de subida. El AAB generado aquí no está firmado con una clave de producción porque no tenemos tu keystore existente [2].
3. Crear la suscripción `premium_monthly`, plan base mensual y precio local equivalente a USD 9.99 en Play Console. La aplicación ya tiene el identificador preparado, pero la oferta real se activa desde RevenueCat y Google Play.
4. Añadir la clave pública Android de RevenueCat en `VITE_REVENUECAT_ANDROID_API_KEY` y configurar en RevenueCat el entitlement `premium` y el producto `premium_monthly`.
5. Publicar la política de privacidad en una URL activa, por ejemplo `https://gym-ai-coach.vercel.app/privacy`, después de desplegar esta versión. Google Play exige una política dentro de la aplicación y en la ficha cuando se solicitan permisos sensibles [3].
6. Completar Data safety con los datos reales de la aplicación y de sus SDK. Google Play exige la declaración incluso cuando una app no recopila datos [4].
7. Completar clasificación de contenido, público objetivo, anuncios, acceso de revisores y ficha de tienda.
8. Subir el AAB a una pista de prueba interna, instalarlo en un dispositivo real y probar cámara, micrófono, autenticación, compra, restauración, cancelación y eliminación de cuenta.

Google Play Billing requiere usar Billing Library 8 o posterior para nuevas apps y actualizaciones desde el 31 de agosto de 2026 [5]. RevenueCat debe estar configurado con productos compatibles con esa política.

## Artefactos generados

- `android/app/build/outputs/apk/debug/app-debug.apk`: APK debug para instalar y probar.
- `android/app/build/outputs/bundle/release/app-release.aab`: AAB release para subir después de firmarlo con la clave de subida correcta.

## Referencias oficiales

[1]: https://developer.android.com/google/play/requirements/target-sdk "Google Play target API level requirement"
[2]: https://developer.android.com/studio/publish/app-signing "Sign your app for release"
[3]: https://support.google.com/googleplay/android-developer/answer/9859455?hl=en "Prepare your app for review"
[4]: https://support.google.com/googleplay/android-developer/answer/10787469?hl=en "Google Play Data safety"
[5]: https://developer.android.com/google/play/billing/subscriptions "Google Play subscriptions and Billing Library"
