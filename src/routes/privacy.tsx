import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl bg-background px-5 py-10 text-foreground">
      <Link to="/" className="text-sm text-primary">← Volver a Gym AI Coach</Link>
      <h1 className="mt-8 font-display text-3xl font-semibold">Política de privacidad</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última actualización: 16 de octubre de 2026</p>
      <section className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground">
        <div><h2 className="font-semibold text-foreground">Qué datos usamos</h2><p>Gym AI Coach puede usar tu nombre, correo electrónico, preferencias de entrenamiento, historial de sesiones y datos de perfil que tú introduzcas. Cuando utilizas la cámara, el análisis de postura se realiza para detectar el movimiento del ejercicio. No vendemos tus datos personales.</p></div>
        <div><h2 className="font-semibold text-foreground">Cámara y micrófono</h2><p>La cámara se utiliza únicamente para el análisis guiado del ejercicio. Los fotogramas de la cámara no se guardan como vídeos en Gym AI Coach. El micrófono solo se utiliza si activas las indicaciones de voz. Puedes revocar estos permisos desde los ajustes de Android.</p></div>
        <div><h2 className="font-semibold text-foreground">Cuenta y sesiones</h2><p>Usamos autenticación para proteger tu perfil e historial. Tus datos se utilizan para mostrar tu progreso, planes y sesiones. Los datos se transmiten mediante conexiones seguras cuando la aplicación se conecta a nuestros servicios.</p></div>
        <div><h2 className="font-semibold text-foreground">Suscripciones</h2><p>Las compras Premium se procesan mediante Google Play o App Store. Gym AI Coach no almacena los datos de tu tarjeta. RevenueCat puede procesar identificadores técnicos de compra para validar el acceso Premium.</p></div>
        <div><h2 className="font-semibold text-foreground">Conservación y eliminación</h2><p>Puedes solicitar la eliminación de tu cuenta desde Perfil → Eliminar mi cuenta. Al confirmar, eliminaremos el perfil, historial de entrenamientos, planes y registros corporales asociados a tu cuenta. Las compras se gestionan por la tienda correspondiente y deben cancelarse allí.</p></div>
        <div><h2 className="font-semibold text-foreground">Contacto</h2><p>Para preguntas sobre privacidad, contacta al propietario de Gym AI Coach mediante el correo de soporte que se publique en la ficha de Google Play.</p></div>
      </section>
      <p className="mt-10 text-xs text-muted-foreground">Esta información debe revisarse con asesoría legal antes de publicarla como política definitiva.</p>
    </main>
  );
}
