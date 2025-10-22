import { Md5 } from 'ts-md5';

export const encryptText = (text: string): string => {
	return text != null ? String(new Md5().appendStr(text).end(false)) : text;
};
