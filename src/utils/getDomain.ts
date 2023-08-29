export const getDomain = () => {
  if (typeof window === 'undefined') {
    throw new Error('getDomain() must be called from the browser');
  }
  console.log(window.location.origin, 'window.location.origin');
  return window.location.origin;
};
