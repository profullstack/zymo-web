import view from 'primate/handler/view';
import MLBTV from '../../../modules/providers/mlb.js';

const mlbTv = new MLBTV();

async function getLiveStreams() {
	return await mlbTv.getLiveStreams();
}

async function playStream(contentId) {
	const streams = await mlbTv.getLiveStreams();
	const stream = streams.find((s) => s.contentId === contentId);

	return stream.url;
}

export default {
	async get(request) {
		const mlb = new MLB();
		const { store, session, query } = request;
		const {
			m3u: { M3U }
		} = store;

		const liveStreams = await getLiveStreams();
		return view('streaming/MLB.svelte', { liveStreams });
	}
};
