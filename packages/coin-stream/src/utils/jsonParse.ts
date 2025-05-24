export const jsonParse = <T>(content: string): T | undefined => {
	try {
		return JSON.parse(content);
	} catch {
		return undefined;
	}
};
