import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const lastUpdated = '14 de abril de 2026';

  const sections = [
    {
      id: 'condiciones-generales',
      title: '1. Condiciones Generales de Uso',
      content: [
        'Bienvenido a MAX Limpieza. Al acceder y utilizar nuestro sitio web, usted acepta cumplir con estos Terminos y Condiciones. Le recomendamos leerlos cuidadosamente antes de realizar cualquier compra.',
        'MAX Limpieza es una tienda en linea dedicada a la venta de articulos y productos de limpieza para el hogar, la industria y el automotor. Nos reservamos el derecho de modificar estos terminos en cualquier momento, y los cambios entraran en vigor inmediatamente despues de su publicacion.',
        'El uso del sitio implica la aceptacion plena de estas condiciones. Si no esta de acuerdo con alguno de los terminos, le pedimos que no utilice nuestros servicios.',
      ],
    },
    {
      id: 'compra-pago',
      title: '2. Terminos de Compra y Pago',
      content: [
        'Todos los precios publicados en el sitio estan expresados en moneda local e incluyen IVA, salvo indicacion contraria. Los precios pueden ser modificados sin previo aviso.',
        'Medios de pago aceptados: transferencia bancaria, tarjetas de credito y debito, y pago contra entrega (segun disponibilidad en su zona).',
        'Una vez confirmado el pago, recibira un comprobante de compra a traves del correo electronico registrado. La confirmacion del pago puede demorar hasta 24 horas habiles dependiendo del metodo de pago utilizado.',
        'En caso de problemas con el procesamiento del pago, nos reservamos el derecho de cancelar el pedido y notificar al cliente.',
      ],
    },
    {
      id: 'envio-entrega',
      title: '3. Envio y Entrega',
      content: [
        'Realizamos envios a todo el pais. Los tiempos de entrega estimados son de 3 a 7 dias habiles dependiendo de la ubicacion geografica.',
        'Los costos de envio se calculan al momento de finalizar la compra y dependen del peso del pedido y la direccion de entrega. Envios gratuitos para compras que superen el monto minimo establecido.',
        'MAX Limpieza no se responsabiliza por retrasos en la entrega causados por terceros (empresas de transporte, condiciones climaticas, etc.). En caso de demoras significativas, nos comunicaremos con usted para ofrecer alternativas.',
        'El cliente es responsable de proporcionar una direccion de entrega correcta y completa. Los reenvios por errores en la direccion podran generar costos adicionales.',
      ],
    },
    {
      id: 'devolucion-reembolso',
      title: '4. Politica de Devolucion y Reembolso',
      content: [
        'Aceptamos devoluciones dentro de los 15 dias corridos posteriores a la recepcion del producto. El producto debe encontrarse en su empaque original y sin uso.',
        'Para iniciar un proceso de devolucion, contactenos a traves de los canales indicados al final de este documento con su numero de pedido y motivo de la devolucion.',
        'Los reembolsos se procesaran dentro de los 10 dias habiles siguientes a la recepcion del producto devuelto. El monto sera acreditado en el mismo medio de pago utilizado en la compra original.',
        'No se aceptan devoluciones de productos que hayan sido abiertos, usados o que no se encuentren en condiciones optimas para su reventa. Los productos en oferta o liquidacion podran tener condiciones especiales de devolucion.',
      ],
    },
    {
      id: 'informacion-producto',
      title: '5. Aviso sobre Informacion del Producto',
      content: [
        'Nos esforzamos por proporcionar informacion precisa y actualizada sobre todos los productos publicados. Sin embargo, no garantizamos que las descripciones, imagenes, precios o disponibilidad sean completamente exactos.',
        'Las imagenes de los productos son representativas y pueden variar ligeramente del producto real. Las especificaciones tecnicas pueden ser modificadas por los fabricantes sin previo aviso.',
        'En caso de que un producto publicado contenga un error de precio o informacion, nos reservamos el derecho de cancelar el pedido y notificar al cliente antes de realizar el envio.',
        'Recomendamos verificar las instrucciones de uso y composicion de cada producto antes de su aplicacion, especialmente en entornos industriales o profesionales.',
      ],
    },
    {
      id: 'propiedad-intelectual',
      title: '6. Propiedad Intelectual',
      content: [
        'Todo el contenido de este sitio web, incluyendo pero no limitado a textos, imagenes, logotipos, disenos, marcas comerciales, y codigo fuente, es propiedad de MAX Limpieza o de sus respectivos duenos, y esta protegido por las leyes de propiedad intelectual.',
        'Queda prohibida la reproduccion, distribucion, modificacion o uso no autorizado de cualquier contenido de este sitio sin el consentimiento previo y por escrito de MAX Limpieza.',
        'Las marcas comerciales de terceros mencionadas en el sitio pertenecen a sus respectivos duenos y se utilizan unicamente con fines identificativos.',
      ],
    },
    {
      id: 'limitacion-responsabilidad',
      title: '7. Limitacion de Responsabilidad',
      content: [
        'MAX Limpieza no sera responsable por danos directos, indirectos, incidentales o consecuentes que resulten del uso o la imposibilidad de uso de nuestros productos o del sitio web.',
        'El uso de los productos de limpieza es bajo responsabilidad del usuario. Recomendamos seguir siempre las instrucciones del fabricante y utilizar el equipo de proteccion adecuado.',
        'No nos hacemos responsables por alergias, reacciones adversas o danos causados por el uso incorrecto de los productos. Ante cualquier duda, consulte las fichas de seguridad disponibles para cada producto.',
        'La responsabilidad maxima de MAX Limpieza en cualquier reclamo se limitara al monto total pagado por el cliente en el pedido en cuestion.',
      ],
    },
    {
      id: 'contacto',
      title: '8. Informacion de Contacto',
      content: [
        'Para cualquier consulta relacionada con estos Terminos y Condiciones, puede contactarnos a traves de:',
        'Email: admin@maxlimpieza.com',
        'WhatsApp: disponible a traves del boton de contacto en nuestro sitio web',
        'Horario de atencion: lunes a viernes de 9:00 a 18:00 hs',
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Terminos y Condiciones</h1>
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
                Estos Terminos y Condiciones regulan el uso del sitio web de MAX Limpieza y la compra de productos a traves de nuestra plataforma. Al utilizar nuestro sitio, usted acepta estos terminos en su totalidad. Si no esta de acuerdo, le pedimos que no utilice nuestros servicios.
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-10">
              {sections.map((section) => (
                <section key={section.id} id={section.id}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                  <div className="space-y-4">
                    {section.content.map((paragraph, index) => (
                      <p
                        key={index}
                        className={`text-gray-700 leading-relaxed ${
                          section.id === 'contacto' && index > 0
                            ? 'pl-6 border-l-4 border-sky-400 font-medium text-gray-800'
                            : ''
                        }`}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Divider */}
            <hr className="my-12 border-gray-200" />

            {/* CTA */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                ¿Tiene preguntas sobre nuestros terminos?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contacto"
                  className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-8 py-3 rounded-md transition"
                >
                  Contactanos
                </Link>
                <Link
                  href="/tienda"
                  className="bg-white border-2 border-sky-600 text-sky-600 hover:bg-sky-50 font-semibold px-8 py-3 rounded-md transition"
                >
                  Ver Productos
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
