import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const lastUpdated = '14 de abril de 2026';

  const sections = [
    {
      id: 'informacion-recopilamos',
      title: '1. Informacion que Recopilamos',
      subsections: [
        {
          subtitle: '1.1 Datos Personales',
          content: [
            'Cuando usted se registra, realiza una compra o se comunica con nosotros, recopilamos la siguiente informacion personal:',
            '- Nombre y apellido',
            '- Direccion de correo electronico',
            '- Numero de telefono',
            '- Direccion de envio y facturacion',
            '- Informacion de pago (procesada de forma segura por terceros)',
          ],
        },
        {
          subtitle: '1.2 Datos de Navegacion',
          content: [
            'Automaticamente recopilamos informacion cuando usted navega por nuestro sitio:',
            '- Direccion IP y tipo de navegador',
            '- Paginas visitadas y tiempo de permanencia',
            '- Dispositivo y sistema operativo utilizado',
            '- Referencia de acceso (sitio web desde el que llego)',
            '- Cookies y tecnologias similares (ver seccion de Cookies)',
          ],
        },
      ],
    },
    {
      id: 'uso-informacion',
      title: '2. Como Utilizamos su Informacion',
      content: [
        'Utilizamos la informacion recopilada para los siguientes fines:',
        '- Procesar y gestionar sus pedidos y pagos',
        '- Enviar confirmaciones de pedido y actualizaciones de envio',
        '- Comunicarnos con usted respecto a consultas, reclamos o soporte',
        '- Enviar ofertas, novedades y contenido relevante (solo con su consentimiento previo)',
        '- Mejorar nuestro sitio web, productos y experiencia de usuario',
        '- Prevenir fraudes y garantizar la seguridad de nuestras operaciones',
        '- Cumplir con obligaciones legales aplicables',
      ],
    },
    {
      id: 'proteccion-datos',
      title: '3. Medidas de Proteccion de Datos',
      content: [
        'Nos comprometemos a proteger su informacion personal mediante medidas tecnicas y organizativas adecuadas:',
        '- Todos los datos se transmiten mediante cifrado SSL/TLS',
        '- Los datos de pago son procesados por proveedores certificados PCI DSS; no almacenamos informacion de tarjetas de credito en nuestros servidores',
        '- Acceso restringido a datos personales solo para personal autorizado',
        '- Revisiones periodicas de seguridad y actualizaciones de nuestros sistemas',
        '- Almacenamiento de datos en servidores con medidas de seguridad fisicas y logicas',
        '- Copias de seguridad regulares para prevenir perdida de datos',
      ],
    },
    {
      id: 'cookies',
      title: '4. Politica de Cookies',
      content: [
        'Utilizamos cookies y tecnologias similares para mejorar su experiencia de navegacion:',
        '- Cookies esenciales: necesarias para el funcionamiento del sitio (sesion de usuario, carrito de compras)',
        '- Cookies analiticas: nos ayudan a entender como los visitantes interactuan con el sitio',
        '- Cookies de preferencias: recuerdan sus configuraciones (idioma, region)',
        '- Cookies de marketing: utilizadas para mostrar contenido relevante (solo con su consentimiento)',
        'Puede configurar su navegador para rechazar cookies o para que le avise cuando se envia una cookie. Sin embargo, algunas funcionalidades del sitio podrian no funcionar correctamente.',
      ],
    },
    {
      id: 'servicios-terceros',
      title: '5. Servicios de Terceros',
      content: [
        'Podemos compartir su informacion con terceros proveedores de servicios que nos ayudan a operar nuestro negocio:',
        '- Procesadores de pago (para gestionar transacciones de forma segura)',
        '- Empresas de logistica y envio (para entregar sus pedidos)',
        '- Servicios de analisis web (para mejorar la experiencia del sitio)',
        '- Plataformas de email marketing (para enviar comunicaciones)',
        'Estos terceros tienen acceso limitado a su informacion personal y estan obligados contractualmente a proteger sus datos y utilizarlos unicamente para los servicios que nos prestan. No vendemos ni compartimos su informacion personal con terceros para fines de marketing.',
      ],
    },
    {
      id: 'sus-derechos',
      title: '6. Sus Derechos',
      content: [
        'Usted tiene los siguientes derechos respecto a sus datos personales:',
        '- Acceso: solicitar una copia de los datos personales que tenemos sobre usted',
        '- Rectificacion: solicitar la correccion de datos inexactos o incompletos',
        '- Supresion: solicitar la eliminacion de sus datos personales cuando ya no sean necesarios',
        '- Portabilidad: recibir sus datos en un formato estructurado y de uso comun',
        '- Oposicion: oponerse al tratamiento de sus datos para fines de marketing directo',
        '- Limitacion: solicitar la limitacion del tratamiento de sus datos en determinadas circunstancias',
        'Para ejercer cualquiera de estos derechos, contactenos utilizando la informacion proporcionada al final de esta politica. Responderemos a su solicitud en un plazo maximo de 30 dias.',
      ],
    },
    {
      id: 'contacto-datos',
      title: '7. Contacto para Solicitudes de Datos',
      content: [
        'Si tiene preguntas sobre esta Politica de Privacidad o desea ejercer sus derechos, puede contactarnos a traves de:',
        'Email: admin@maxlimpieza.com',
        'Asunto del email: [Solicitud de Privacidad] + su pedido o motivo',
        'WhatsApp: disponible a traves del boton de contacto en nuestro sitio web',
        'Horario de atencion: lunes a viernes de 9:00 a 18:00 hs',
        'Nos comprometemos a responder todas las solicitudes de privacidad de manera oportuna y a resolver cualquier inquietud que pueda tener respecto al tratamiento de sus datos personales.',
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero section */}
        <div className="bg-gradient-to-br from-sky-500 to-emerald-500 text-white py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sky-100 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Politica de Privacidad</h1>
            <p className="text-sky-50">
              Ultima actualizacion: {lastUpdated}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Introduction */}
            <div className="mb-10 p-6 bg-sky-50 rounded-lg border border-sky-100">
              <p className="text-gray-700 leading-relaxed">
                En MAX Limpieza nos tomamos muy en serio la proteccion de sus datos personales. Esta Politica de Privacidad describe como recopilamos, usamos, almacenamos y protegemos su informacion cuando utiliza nuestro sitio web y nuestros servicios. Al utilizar nuestro sitio, usted acepta las practicas descritas en esta politica.
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-10">
              {sections.map((section) => (
                <section key={section.id} id={section.id}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                  <div className="space-y-4">
                    {'subsections' in section &&
                      section.subsections?.map((sub, subIndex) => (
                        <div key={subIndex} className="mt-4">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">{sub.subtitle}</h3>
                          <div className="space-y-2">
                            {sub.content.map((paragraph, pIndex) => (
                              <p key={pIndex} className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    {'content' in section && section.content &&
                      section.content.map((paragraph, index) => {
                        const isContactLine =
                          section.id === 'contacto-datos' && index > 0 && index < 5;
                        return (
                          <p
                            key={index}
                            className={`text-gray-700 leading-relaxed whitespace-pre-line ${isContactLine
                                ? 'pl-6 border-l-4 border-sky-400 font-medium text-gray-800'
                                : ''
                              }`}
                          >
                            {paragraph}
                          </p>
                        );
                      })}
                  </div>
                </section>
              ))}
            </div>

            {/* Divider */}
            <hr className="my-12 border-gray-200" />

            {/* CTA */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                ¿Tiene preguntas sobre nuestra politica de privacidad?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contacto"
                  className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-8 py-3 rounded-md transition"
                >
                  Contactanos
                </Link>
                <Link
                  href="/terminos"
                  className="bg-white border-2 border-sky-600 text-sky-600 hover:bg-sky-50 font-semibold px-8 py-3 rounded-md transition"
                >
                  Terminos y Condiciones
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
