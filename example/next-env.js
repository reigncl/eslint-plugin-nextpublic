// Ejemplo de archivo en un proyecto Next.js con variables de entorno

// Esta variable está justificada en .nextpublicrc
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const featureFlag = process.env.NEXT_PUBLIC_FEATURE_FLAG;
const apiKey = process.env.NEXT_PUBLIC_API_KEY;

// Esta variable no está justificada y generará un error con el plugin
const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;

function getConfig() {
  return {
    apiUrl,
    featureFlag,
    apiKey,
    analyticsId
  };
}

export default getConfig;