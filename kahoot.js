const axios = require("axios");

const extractMessageAndOffset = e => {
  const t = /'(\d*[a-z]*[A-Z]*)\w+'/;
  const o = e.search("=");
  const s = e.slice(o + 1);
  const r = s.search(";");
  const a = s.slice(0, Math.max(0, r)).trim();
  const n = e.match(t);
  return {
    message: (n && n.length > 0 ? n[0] : "").slice(1, -1),
    offsetEquation: a
  };
};

// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// + config + 

const gameId = "000000";
const unix = Math.floor(Date.now() / 1000);
const url = `https://kahoot.it/reserve/session/${gameId}/?${unix}`;

// + config +
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-


axios
  .get(url)
  .then(function(response) {
    const o = response.headers["x-kahoot-session-token"];
    const { message: a, offsetEquation: n } = extractMessageAndOffset(
      response.data.challenge
    );
    console.log("o: " + o + "\n" + "a: " + a + "\n" + "n: " + n);

    const base64Decode = e => atob(e);

    const xorString = (e, t) => {
      let o = "";
      for (let s = 0; s < e.length; s++) {
        const r = e.charCodeAt(s);
        const a = t.charCodeAt(s % t.length);
        const n = r ^ a;
        o += String.fromCharCode(n);
      }
      return o;
    };

    const reserveChallengeToAnswer = (message, offsetEquation) => {
      const decode = message =>
        message.replace(
          /./g,
          (char, position) =>
            String.fromCharCode(
              (char.charCodeAt(0) * position + eval(offsetEquation)) % 77 + 48
            )
        );
      return decode(message);
    };

    const decodeSessionToken = (e, t, o) => {
      const s = reserveChallengeToAnswer(t, o);
      const r = base64Decode(e);
      return xorString(r, s);
    };

    const i = decodeSessionToken(o, a, n);

    console.log("SessionToken: " + i);
  })
  .catch(function(error) {
    console.error(error);
  });
