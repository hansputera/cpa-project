import { Client, SessionManager } from "gampang";
import { configEnv } from "./config/config.js";
import { prismaClient } from "./database/prisma.js";
import { twitter, twitterTargets } from "./streams/twitter.js";

const sessionManager = new SessionManager(configEnv.SESSION_PATH, "folder");
const client = new Client(sessionManager, {
	prefixes: [">"],
	qr: {
		store: "file",
		options: {
			dest: "./qr.png",
		},
	},
});
client.on("ready", () => {
	console.log(
		`WhatsApp Bot ${client.raw?.user?.name ?? client.raw?.user?.id} is ready`,
	);
});

twitter.on("fetchTweet", async (data) => {
	if (!data.user) {
		return;
	}

	const groupDataDBs = await prismaClient.twitterGroupSubscribe.findMany({
		where: {
			subscribes: {
				has: data.user.username,
			},
		},
	});

	const news = data.tweets[0];

	for (const group of groupDataDBs) {
		await client.raw?.sendMessage(group.groupJid, {
			text: `TWITTER NEWS FROM *${news?.username ?? news.name}*\n\n${news.text}`,
			image: news.photos.length
				? {
						url: news.photos[0].url,
					}
				: undefined,
		});
	}
});

client.command("twtu", async (ctx) => {
	const usernames = ctx.args.map((n) => n.trim());
	if (!usernames.length) {
		return;
	}

	const data = await prismaClient.twitterGroupSubscribe.findFirst({
		where: {
			groupJid: ctx.raw.key.remoteJid ?? "",
		},
		select: {
			subscribes: true,
			id: true,
		},
	});

	const newUsernames = data?.subscribes.filter((n) => !usernames.includes(n));
	await prismaClient.twitterGroupSubscribe.update({
		where: {
			groupJid: ctx.raw.key.remoteJid ?? "",
			id: data?.id,
		},
		data: {
			subscribes: {
				set: newUsernames,
			},
		},
	});

	await ctx.reply("updated.");
});

client.command(
	"twts",
	async (ctx) => {
		const usernames = ctx.args.map((n) => n.trim());
		if (!usernames.length) {
			await ctx.reply("Masukin usnnya bg");
			return;
		}

		const notFoundUsername = usernames.filter(
			(u) => !twitterTargets.includes(u),
		);

		if (notFoundUsername.length) {
			await ctx.reply(`Not in whitelist: ${notFoundUsername.join(", ")}`);
		}

		const data = await prismaClient.$transaction(async (tx) => {
			const prevData = await tx.twitterGroupSubscribe.findFirst({
				where: {
					groupJid: ctx.raw.key.remoteJid ?? "",
				},
			});

			const existingUser = usernames.find((u) =>
				prevData?.subscribes.includes(u),
			);

			if (existingUser) {
				await ctx.reply(`This username ${existingUser} is already subscribed`);
				return undefined;
			}

			return prismaClient.twitterGroupSubscribe.upsert({
				where: {
					groupJid: ctx.raw.key.remoteJid ?? "",
					id: 0,
				},
				update: {
					subscribes: {
						push: usernames.filter((u) => twitterTargets.includes(u)),
					},
				},
				create: {
					groupJid: ctx.raw.key.remoteJid ?? "",
					subscribes: usernames.filter((u) => twitterTargets.includes(u)),
				},
			});
		});

		if (data) {
			await ctx.reply(
				`Saved as ${data.groupJid} (subs: ${usernames.filter((u) => twitterTargets.includes(u))})`,
			);
		}
	},
	{
		aliases: ["twtsub", "subtwt"],
		category: "Twitter",
		groupOnly: true,
		cooldown: 10_000,
	},
);

await client.launch().then(async () => {
	await twitter.init();
});
