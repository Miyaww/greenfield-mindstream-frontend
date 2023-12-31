export const trimLongStr = (
  str: string,
  maxLength = 12,
  headLen = 6,
  footLen = 6,
) => {
  if (!str) {
    return '';
  }
  if (str.length > maxLength) {
    const head = str.substring(0, headLen);
    const foot = str.substring(str.length - footLen, str.length);
    return `${head}...${foot}`;
  }
  return str;
};

export const trimAddress = (
  address: string,
  maxLength = 12,
  headLen = 6,
  footLen = 6,
) => {
  return trimLongStr(formatAddress(address), maxLength, headLen, footLen);
};

export const formatAddress = (address = '') => {
  if (!address) return address;
  return isAddress(address) ? address : `0x${address}`;
};

export const isAddress = (address = '') => {
  return address.startsWith('0x');
};

export const encodeObjectName = (obj: string) => {
  return obj.split('/').map(encodeURIComponent).join('/');
};

export const decodeObjectName = (obj: string) => {
  return obj.split('/').map(decodeURIComponent).join('/');
};

export const formatId = (id: number) => {
  const hex = Number(id).toString(16).replace('0x', '');
  const value = `0x${hex.padStart(64, '0')}`;
  return value;
};

export const copy = (text: string) => {
  const range = document.createRange();
  const div = document.createElement('div');
  div.innerText = text;
  div.style.position = 'absolute';
  div.style.left = '-99999px';
  div.style.top = '-99999px';
  document.body.appendChild(div);
  range.selectNode(div);

  const selection = document.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);

  document.execCommand('copy');
  range.detach();
  document.body.removeChild(div);
};

const getObjectPath = (bucketName: string, objectName: string) => {
  return [bucketName, encodeObjectName(objectName)].join('/');
};

export const getShareLink = (bucketName: string, objectName: string) => {
  return `${location.origin}/share?file=${encodeURIComponent(
    getObjectPath(bucketName, objectName),
  )}`;
};
export const getChannelName = (
  address: string,
  chainId: number,
  type: string,
) => {
  return `b-mindstream-${trimAddress(address)
    .toLocaleLowerCase()
    .replaceAll('.', '')}${chainId}-${type}`;
};
