const host = window.location.host;
const khudroshopHosts = ['khudroshop.com', 'localhost:5124', 'localhost:3124'];
const isKhudroshopHost = khudroshopHosts.includes(host);

export function useHost() {
  return {
    host,
    isKhudroshopHost
  };
}
