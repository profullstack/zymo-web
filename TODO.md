# todo

-   add library Id to files collections
-   add favorites for each type of media
-   add scan status page
-   add transcode api with ffmpeg

-   namespace emby stuff to account for more providers later
-   document api for end users (see markdown stuff)
-   password reset link
-   crypto payments (one-time)
-   switch fonts to .woff2 instead of .ttf
-   autoblogger: search google for top 5 articles and combine them into one new article rewritten with ai
-   switch to ollama llama:8b instead of openai for all ai calls, keep openai calls but make a call method for custom instance (ie: ai.profullstack.com)
-   add ability to rewrite manual blog posts with AI (via /admin/blog/new) with ai inline. so a user can cut-n-paste an article and rewrite it with ai.


- parse media info from file:

```
/**
 * Pattern should contain either none or two capturing groups.
 * In case of two groups - 1st is raw, 2nd is clean.
 */
var patterns = {
  season: /([Ss]?([0-9]{1,2}))[Eex]/,
  episode: /([Eex]([0-9]{2})(?:[^0-9]|$))/,
  year: /([\[\(]?((?:19[0-9]|20[01])[0-9])[\]\)]?)/,
  resolution: /(([0-9]{3,4}p))[^M]/,
  quality: /(?:PPV\.)?[HP]DTV|(?:HD)?CAM|B[rR]Rip|TS|(?:PPV )?WEB-?DL(?: DVDRip)?|H[dD]Rip|DVDRip|DVDRiP|DVDRIP|CamRip|W[EB]B[rR]ip|[Bb]lu[Rr]ay|DvDScr|hdtv/,
  codec: /xvid|x264|h\.?264/i,
  audio: /MP3|DD5\.?1|Dual[\- ]Audio|LiNE|DTS|AAC(?:\.?2\.0)?|AC3(?:\.5\.1)?/,
  group: /(- ?([^-]+(?:-={[^-]+-?$)?))$/,
  region: /R[0-9]/,
  extended: /EXTENDED/,
  hardcoded: /HC/,
  proper: /PROPER/,
  repack: /REPACK/,
  container: /MKV|AVI/,
  widescreen: /WS/,
  website: /^(\[ ?([^\]]+?) ?\])/,
  language: /rus\.eng/,
  garbage: /1400Mb|3rd Nov| ((Rip))/
};
var types = {
  season: 'integer',
  episode: 'integer',
  year: 'integer',
  extended: 'boolean',
  hardcoded: 'boolean',
  proper: 'boolean',
  repack: 'boolean',
  widescreen: 'boolean'
};
```
