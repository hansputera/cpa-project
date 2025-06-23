import { cleanEnv, host, port, str, url } from "envalid";

export const configEnv = cleanEnv(process.env, {
	POSTGRESQL_DB: str(),
	POSTGRESQL_USER: str(),
	POSTGRESQL_PASSWORD: str(),
	POSTGRESQL_HOST: host(),
	POSTGRESQL_PORT: port(),
});
