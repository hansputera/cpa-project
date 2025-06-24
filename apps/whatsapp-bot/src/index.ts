import {
	Browsers,
	DisconnectReason,
	makeWASocket,
	useMultiFileAuthState,
} from "baileys";
import { configEnv } from "./config/config.js";
import type { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import { prismaClient } from "./database/prisma.js";
import { twitter } from "./streams/twitter.js";

let socket: ReturnType<typeof makeWASocket>;

async function botWa() {
	const { state, saveCreds } = await useMultiFileAuthState(
		configEnv.SESSION_PATH,
	);
	socket = makeWASocket({
		browser: Browsers.windows("WhatsApp"),
		auth: state,
		syncFullHistory: true,
	});

	socket.ev.on("connection.update", (conn) => {
		if (conn.qr) {
			qrcode.generate(
				conn.qr,
				{
					small: true,
				},
				(qrcode) => {
					console.log(qrcode);
				},
			);
		}
		if (conn.connection === "close") {
			const shouldReconnect =
				(conn.lastDisconnect as Boom | undefined)?.output?.statusCode !==
				DisconnectReason.loggedOut;
			if (shouldReconnect) {
				botWa();
			}
		}
	});

	socket.ev.on("messages.upsert", async (c) => {
		const { messages } = c;

		const message = messages.at(0);
		if (!message) {
			return;
		}

		const textConversation =
			message.message?.conversation ??
			message.message?.extendedTextMessage?.text;
		const splitted = textConversation?.split(" ");

		const [cmd, args] = [
			splitted?.at(0)?.toLowerCase() ?? "",
			splitted
				?.slice(1)
				.map((n) => n.trim())
				.filter((n) => n.length) ?? [],
		];

		if (cmd === ">twts") {
			if (!message.key.participant) {
				await socket.sendMessage(
					message.key.remoteJid ?? "",
					{
						text: "Jalanin di grup bang",
					},
					{
						quoted: message,
					},
				);
				return;
			}

			const currentTwitterData =
				await prismaClient.twitterGroupSubscribe.findFirst({
					where: {
						groupJid: message.key.remoteJid ?? "",
					},
					select: {
						subscribes: true,
						id: true,
					},
				});

			const notExistingUsernames = args.filter(
				(usn) => !currentTwitterData?.subscribes.includes(usn),
			);

			if (!notExistingUsernames.length) {
				await socket.sendMessage(
					message.key.remoteJid ?? "",
					{
						text: "Kamu mau subscribe twitternya siaoa bang? Soalny ntu username udh kedaftar wkwk",
					},
					{
						quoted: message,
					},
				);
				return;
			}

			const twitterProfiles = await Promise.all<
				Awaited<ReturnType<typeof twitter.fetchUser>>
			>(notExistingUsernames.map((u) => twitter.fetchUser.bind(twitter)(u)));
			if (!twitterProfiles.length) {
				await socket.sendMessage(
					message.key.remoteJid ?? "",
					{
						text: "Masbro itu usernamenya dah pada bener semua kah? Kok aku gk nemu y? :(",
					},
					{
						quoted: message,
					},
				);
				return;
			}

			const result = await prismaClient.twitterGroupSubscribe.upsert({
				create: {
					subscribes: notExistingUsernames,
					groupJid: message.key.remoteJid ?? "",
				},
				update: {
					subscribes: {
						push: notExistingUsernames,
					},
				},
				where: {
					groupJid: message.key.remoteJid ?? "",
				},
				select: {
					subscribes: true,
				},
			});

			await twitter.register(
				result.subscribes.map((s) => ({
					username: s,
					intervalPool: 90_000,
				})),
			);

			await socket.sendMessage(
				message.key.remoteJid ?? "",
				{
					text: `Oke deh, udah gwe simpen ${result.subscribes.join(", ")} ke database yak. Jangan lu tambahin lagi nanti\n${twitterProfiles.map((u, i) => `${i + 1}. ${u?.name ?? u?.username}`).join("\n")}`,
				},
				{
					quoted: message,
				},
			);
			return;
		}

		if (cmd === ">twtu") {
			if (!message.key.participant) {
				await socket.sendMessage(
					message.key.remoteJid ?? "",
					{
						text: "Jalanin di grup bang",
					},
					{
						quoted: message,
					},
				);
				return;
			}

			const currentTwitterData =
				await prismaClient.twitterGroupSubscribe.findFirst({
					where: {
						groupJid: message.key.remoteJid ?? "",
					},
					select: {
						subscribes: true,
						id: true,
					},
				});

			if (!currentTwitterData) {
				await socket.sendMessage(
					message.key.remoteJid ?? "",
					{
						text: "Pake twts dulu bang, baru twtu. Soalnya data ni grup kagak ada njay",
					},
					{
						quoted: message,
					},
				);

				return;
			}

			const existingUsernames =
				currentTwitterData?.subscribes.filter((usn) => !args.includes(usn)) ??
				[];

			const result = await prismaClient.twitterGroupSubscribe.update({
				where: {
					id: currentTwitterData?.id,
				},
				data: {
					subscribes: {
						set: existingUsernames,
					},
				},
				select: {
					subscribes: true,
				},
			});

			const unregisteredUsns =
				currentTwitterData?.subscribes.filter((usn) => args.includes(usn)) ??
				[];

			await twitter.unreg(
				unregisteredUsns.map((n) => ({
					username: n,
					intervalPool: 90_000,
				})),
			);

			await socket.sendMessage(
				message.key.remoteJid ?? "",
				{
					text: `Ngokeh bg, udh gwe update. Yang tersisa sekarang tuh cuman ${result.subscribes.length ? existingUsernames.join(", ") : "0, gada bjir aowaowk"}`,
				},
				{
					quoted: message,
				},
			);
			return;
		}

		if (cmd === ">twtc") {
			const data = await prismaClient.twitterGroupSubscribe.findFirst({
				where: {
					groupJid: message.key.remoteJid ?? "",
				},
				select: {
					subscribes: true,
				},
			});

			if (!data) {
				await socket.sendMessage(
					message.key.remoteJid ?? "",
					{
						text: "ah bete gw, belum ada data buat ni grup njay",
					},
					{
						quoted: message,
					},
				);

				return;
			}

			await socket.sendMessage(
				message.key.remoteJid ?? "",
				{
					text: `nih, ni grup ngikutin:\n${data.subscribes.length ? data.subscribes.map((n, i) => `${i + 1}. ${n}`).join("\n") : "F, gada yg diikutin bjir. Tambahin kuy"}`,
				},
				{
					quoted: message,
				},
			);
			return;
		}
	});

	socket.ev.on("creds.update", saveCreds);
}

twitter.on("fetchTweet", async (data) => {
	console.log(data);
	if (!data.user) {
		return;
	}

	const groupSubscribeds = await prismaClient.twitterGroupSubscribe.findMany({
		where: {
			subscribes: {
				has: data.user.username,
			},
		},
	});

	const tweet = data.tweets.at(0);
	if (tweet) {
		for (const group of groupSubscribeds) {
			const photo = tweet.photos.at(0)?.url ?? undefined;
			await socket.sendMessage(group.groupJid, {
				text: `Ada kabar baru dari *${tweet.username ?? data.user.username}*\nhttps://x.com/${tweet.username ?? data.user.username}/status/${tweet.id}\nLinks: ${tweet.urls.length ? tweet.urls.join(", ") : "-"}\n\n${tweet.text}`,
				image: photo
					? {
							url: photo,
						}
					: undefined,
			});
		}
	}
});

await twitter.init().then(async () => {
	const data = await prismaClient.twitterGroupSubscribe.findMany({
		select: {
			subscribes: true,
		},
	});

	for (const g of data) {
		if (g.subscribes.length) {
			await twitter.register(
				g.subscribes.map((u) => ({
					username: u,
					intervalPool: 90_000,
				})),
			);
		}
	}

	await botWa();
});
