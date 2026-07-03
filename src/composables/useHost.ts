const host = window.location.host;
const khudroshopHosts = ['khudroshop.com', 'localhost:5123', 'localhost:3123'];
const isKhudroshopHost = khudroshopHosts.includes(host);

export function useHost() {
  return {
    host,
    isKhudroshopHost
  };
}
