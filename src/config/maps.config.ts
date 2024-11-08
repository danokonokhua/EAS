// Basic maps configuration
export const mapsConfig = {
  // Add your maps configuration here
  defaultZoom: 15,
  defaultCenter: {
    latitude: 0,
    longitude: 0
  },
  // Add any other map-related configuration you need
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
};

export default mapsConfig;
