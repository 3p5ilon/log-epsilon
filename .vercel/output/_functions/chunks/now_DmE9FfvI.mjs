import { r as __exportAll } from "./rolldown-runtime_DWOOXAbm.mjs";
import { XMLParser } from "fast-xml-parser";
//#region src/lib/now.ts
function decodeEntities(str) {
	if (!str) return "";
	return str.replace(/&#39;/g, "'").replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
function formatRating(rating) {
	if (rating === void 0 || rating === null || rating === "") return "";
	const num = typeof rating === "number" ? rating : parseFloat(rating);
	return isNaN(num) ? "" : "★".repeat(Math.floor(num)) + (num % 1 >= .5 ? "½" : "");
}
function fetchTimeout(url, ms = 4e3, init = {}) {
	return fetch(url, {
		...init,
		signal: AbortSignal.timeout(ms)
	});
}
async function getGoodreadsReading(userId = "128272854") {
	try {
		const res = await fetchTimeout(`https://www.goodreads.com/review/list_rss/${userId}?shelf=currently-reading`, 4e3, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" } });
		if (!res.ok) return null;
		const rawItems = new XMLParser({
			ignoreAttributes: false,
			cdataPropName: "__cdata"
		}).parse(await res.text())?.rss?.channel?.item;
		const item = rawItems ? Array.isArray(rawItems) ? rawItems[0] : rawItems : null;
		if (!item) return null;
		const cdata = (v) => v && typeof v === "object" ? v.__cdata || "" : String(v ?? "");
		const title = decodeEntities(cdata(item.title)).trim();
		if (!title) return null;
		const author = decodeEntities(cdata(item.author_name)).trim();
		const link = decodeEntities(cdata(item.link)).trim();
		let image = cdata(item.book_image_url).trim();
		if (image) image = image.replace(/_SY\d+_\./, "_SX300_.").replace(/_SX\d+_\./, "_SX300_.");
		return {
			title,
			author: author || void 0,
			image: image || void 0,
			link: link || `https://www.goodreads.com/user/show/${userId}`
		};
	} catch (err) {
		console.error("[now/goodreads] Failed to fetch reading feed:", err);
		return null;
	}
}
async function getLetterboxdWatching(username = "3p5ilon") {
	try {
		const res = await fetchTimeout(`https://letterboxd.com/${username}/rss/`, 4e3, { headers: { "User-Agent": "Mozilla/5.0" } });
		if (!res.ok) return null;
		const rawItems = new XMLParser({
			ignoreAttributes: false,
			removeNSPrefix: true
		}).parse(await res.text())?.rss?.channel?.item;
		const item = rawItems ? Array.isArray(rawItems) ? rawItems[0] : rawItems : null;
		if (!item) return null;
		const title = decodeEntities(String(item.filmTitle || item.title || "")).trim();
		if (!title) return null;
		const year = item.filmYear ? String(item.filmYear) : void 0;
		const stars = formatRating(item.memberRating);
		const link = String(item.link || `https://letterboxd.com/${username}/`).trim();
		let image;
		if (item.description) {
			const imgMatch = String(item.description).match(/<img[^>]+src="([^"]+)"/);
			if (imgMatch) image = imgMatch[1];
		}
		return {
			title,
			year,
			stars: stars || void 0,
			image,
			link
		};
	} catch (err) {
		console.error("[now/letterboxd] Failed to fetch watching feed:", err);
		return null;
	}
}
async function getLastfmListening(username = "log3p5ilon") {
	const apiKey = (Object.assign({
		"ASSETS_PREFIX": void 0,
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SITE": "https://3p5ilon.vercel.app",
		"SSR": true
	}, {})?.LASTFM_API_KEY || process.env?.LASTFM_API_KEY || "").trim();
	if (apiKey) try {
		const res = await fetchTimeout(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`, 4e3);
		if (res.ok) {
			const raw = (await res.json())?.recenttracks?.track?.[0];
			if (raw) {
				const title = decodeEntities(String(raw.name || "")).trim();
				const artist = decodeEntities(String(raw.artist?.["#text"] || raw.artist?.name || "")).trim();
				const link = String(raw.url || `https://www.last.fm/user/${username}`).trim();
				const images = raw.image ?? [];
				const image = (images.find((i) => i.size === "extralarge" || i.size === "large") ?? images.at(-1))?.["#text"]?.replace(/\/64s\//, "/300x300/") || void 0;
				if (title && artist) return {
					title,
					artist,
					image,
					link
				};
			}
		}
	} catch (err) {
		console.error("[now/lastfm-api] API request failed:", err);
	}
	try {
		const res = await fetchTimeout(`https://www.last.fm/user/${username}`, 4e3, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" } });
		if (res.ok) {
			const html = await res.text();
			const trackLink = html.match(/class="chartlist-name"[\s\S]*?href="(\/music[^"]+)"/)?.[1];
			const title = html.match(/class="chartlist-name"[\s\S]*?title="([^"]+)"/)?.[1];
			const artist = html.match(/class="chartlist-artist"[\s\S]*?title="([^"]+)"/)?.[1];
			const imgSrc = html.match(/class="chartlist-image"[\s\S]*?<img[^>]+src="([^"]+)"/)?.[1];
			if (title && artist) return {
				title: decodeEntities(title),
				artist: decodeEntities(artist),
				image: imgSrc?.replace(/\/64s\//, "/300x300/"),
				link: trackLink ? `https://www.last.fm${trackLink}` : `https://www.last.fm/user/${username}`
			};
		}
	} catch (err) {
		console.error("[now/lastfm-html] Scraping fallback failed:", err);
	}
	return null;
}
async function getNowFeeds() {
	const [bookResult, movieResult, trackResult] = await Promise.allSettled([
		getGoodreadsReading(),
		getLetterboxdWatching(),
		getLastfmListening()
	]);
	return {
		book: bookResult.status === "fulfilled" ? bookResult.value : null,
		movie: movieResult.status === "fulfilled" ? movieResult.value : null,
		track: trackResult.status === "fulfilled" ? trackResult.value : null
	};
}
//#endregion
//#region src/pages/api/now.json.ts
var now_json_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var GET = async () => {
	const data = await getNowFeeds();
	return new Response(JSON.stringify(data), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120"
		}
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/now.json@_@ts
var page = () => now_json_exports;
//#endregion
export { page };
