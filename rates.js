// Vercel serverless function: /api/rates
// Returns today's international gold and silver price converted to INR per gram.
// Sources: gold-api.com (spot, USD per troy ounce) and open.er-api.com (USD to INR).
// This is the international price before Indian import duty and local premium,
// so the app lets the admin add an adjustment percentage.
module.exports = async (req, res) => {
  try {
    const get = u => fetch(u).then(r => { if (!r.ok) throw new Error(u); return r.json(); });
    const [g, s, fx] = await Promise.all([
      get("https://api.gold-api.com/price/XAU"),
      get("https://api.gold-api.com/price/XAG"),
      get("https://open.er-api.com/v6/latest/USD")
    ]);
    const OZ = 31.1034768;
    const inr = fx && fx.rates && fx.rates.INR;
    const gp = +(g.price != null ? g.price : g.priceUsd);
    const sp = +(s.price != null ? s.price : s.priceUsd);
    if (!(inr > 0) || !(gp > 0)) throw new Error("bad data");
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
    res.status(200).json({
      gold24: Math.round(gp * inr / OZ * 100) / 100,
      silver: sp > 0 ? Math.round(sp * inr / OZ * 100) / 100 : null,
      usdInr: inr,
      updated: new Date().toISOString()
    });
  } catch (e) {
    res.status(502).json({ error: "Rate source unavailable" });
  }
};
