// @ts-nocheck
// dmFigure extension: NEW shoes (see extras-contract.md for ctx).
// draw(ctx) returns BOTH feet. Feet: ankle x = ctx.cx ± ctx.K.ankCx, rows K.ankle
// (ankle) → K.floor (ground). Study dmFigure.drawShoes() for the house language
// (sneaker/boot/loafer/slide) and match its weight and softness.

const ids = new Set([
  "classicSneaker", "runner", "skateShoe", "combatBoot",
  "chelseaBoot", "mary", "balletFlat", "hikingShoe",
]);

export default {
  ids,
  draw(ctx) {
    const { K, cx, R, line, stitch, shade, fills } = ctx;
    const dk = "#352e28", crm = "#f6f1e7", shoeC = "#473b30", olive = "#7d8254";
    const fShoe = fills.shoe, lace = shade(shoeC, 0.35);

    const one = (s) => {
      const ax = R(cx + s * K.ankCx), ank = K.ankle, fl = K.floor;
      // bare instep peeking above low shoes (mary/balletFlat) — cf. loafer's footSkin
      const skinTop = `<ellipse cx="${ax}" cy="${R(ank + 4.5)}" rx="8.5" ry="9.5" fill="${fills.skin}"/>`;

      if (ctx.shoesId === "classicSneaker")
        return `<path d="M${ax - 11} ${ank - 6} q11 -4 22 0 l1 15 h-24 z" fill="#fbf7ee"/>
                <path d="M${ax - 3} ${ank - 7.4} h6 l-.8 3.4 h-4.4 z" fill="#cdbfb0"/>
                <path d="M${ax - 12} ${ank + 8} h25 q5 0 6 4 l0 2 q0 5 -6 5 h-25 q-6 0 -6 -5 l0 -1 q0 -4 6 -5 z" fill="#efe6d3"/>
                ${line(`M${ax - 8} ${ank} q8 -3 16 0`, "#d8cfc0", 1.4, .9)}`;

      if (ctx.shoesId === "runner")
        return `<path d="M${ax - 11} ${ank - 8} q11 -5 22 0 l2 18 h-26 z" fill="${fShoe}"/>
                ${line(`M${ax - 8} ${ank - 2.5} q8 -3 16 0 M${ax - 8} ${ank + 2} q8 -3 16 0`, lace, 1.3, .85)}
                <path d="M${ax - 13} ${ank + 8} q6.5 4 13 0 t13 0 q6 .5 6 6.5 q0 6.5 -6.5 6.5 h-25 q-6.5 0 -6.5 -6.5 q0 -6 6 -6.5 z" fill="${crm}"/>
                ${line(`M${ax - 10} ${ank + 16.5} q10 3 20 0`, "#ddd2bd", 1.2, .8)}`;

      if (ctx.shoesId === "skateShoe")
        return `<path d="M${ax - 13} ${ank + 1} q13 -5 26 0 l1 10 h-28 z" fill="${fShoe}"/>
                <path d="M${ax - 5} ${ank + .6} q5 -1.6 10 0 l.8 4.4 q-5.8 -2 -11.6 0 z" fill="${shade(shoeC, 0.16)}"/>
                ${stitch(`M${ax - 10} ${ank + 5.5} q10 -3 20 0`, "#e8dfcc", .85)}
                <path d="M${ax - 14} ${ank + 11} h28 q4 0 4 3 t-4 3 h-28 q-4 0 -4 -3 t4 -3 z" fill="${crm}"/>`;

      if (ctx.shoesId === "combatBoot")
        return `<path d="M${ax - 11} ${ank - 16} h22 q3 0 3 3 v${R(fl - 14 - (ank - 13))} q0 8 -8 8 h-13 q-8 0 -8 -7 q0 -4 6 -5 z" fill="${fShoe}"/>
                ${line(`M${ax - 5} ${ank - 13} l10 3.4 M${ax + 5} ${ank - 13} l-10 3.4 M${ax - 5} ${ank - 8} l10 3.4 M${ax + 5} ${ank - 8} l-10 3.4 M${ax - 5} ${ank - 3} l10 3.4 M${ax + 5} ${ank - 3} l-10 3.4`, lace, 1.3, .8)}
                <path d="M${ax - 15} ${fl - 7} h30 q4 0 4 3 t-4 3 h-30 q-4 0 -4 -3 t4 -3 z" fill="${dk}"/>`;

      if (ctx.shoesId === "chelseaBoot")
        return `<path d="M${ax - 10} ${ank - 14} h20 q3 0 3 3 v${R(fl - 13 - (ank - 11))} q0 8 -8 8 h-13 q-8 0 -8 -7 q0 -4 6 -5 z" fill="${fShoe}"/>
                <rect x="${ax + 4}" y="${ank - 11}" width="6" height="12" rx="2.6" fill="${shade(shoeC, -0.28)}" opacity=".9"/>
                ${line(`M${ax - 9} ${fl - 16} q9 3 18 0`, shade(shoeC, 0.22), 1.2, .7)}
                <path d="M${ax - 14} ${fl - 5} h27 q3 0 3 2.5 t-3 2.5 h-27 q-3 0 -3 -2.5 t3 -2.5 z" fill="${dk}"/>`;

      if (ctx.shoesId === "mary")
        return skinTop + `<path d="M${ax - 10} ${fl - 15} q10 -5 20 0 l1 7 q0 8 -8 8 h-12 q-7 0 -7 -7 q0 -4 6 -8 z" fill="${fShoe}"/>
                ${line(`M${ax - 11} ${fl - 17} q11 -4.5 22 0`, shade(shoeC, -0.12), 2.6, .9)}
                <circle cx="${R(ax + s * 7.5)}" cy="${R(fl - 17.2)}" r="1.5" fill="${shade(shoeC, 0.4)}"/>
                <path d="M${ax - 12} ${fl - 4} h25 q3 0 3 2 t-3 2 h-25 q-3 0 -3 -2 t3 -2 z" fill="${dk}"/>`;

      if (ctx.shoesId === "balletFlat")
        return skinTop + `<path d="M${ax - 10} ${fl - 12} q10 -4 20 0 l1 5 q0 7 -7 7 h-13 q-7 0 -7 -6 q0 -3 6 -6 z" fill="${fShoe}"/>
                ${line(`M${ax - 6} ${fl - 11} q6 2.6 12 0`, shade(shoeC, -0.2), 1.2, .7)}
                <path d="M${ax - 0.4} ${fl - 12.4} l-4.2 -2.3 l.5 4.7 z" fill="${shade(shoeC, 0.32)}"/>
                <path d="M${ax + 0.4} ${fl - 12.4} l4.2 -2.3 l-.5 4.7 z" fill="${shade(shoeC, 0.32)}"/>
                <circle cx="${ax}" cy="${R(fl - 12.2)}" r="1.1" fill="${shade(shoeC, 0.5)}"/>`;

      if (ctx.shoesId === "hikingShoe")
        return `<path d="M${ax - 11} ${ank - 10} q11 -4 22 0 l2 19 h-26 z" fill="${fShoe}"/>
                <path d="M${R(ax + s * 4)} ${ank - 9.6} Q${R(ax + s * 9.5)} ${ank - 8.5} ${R(ax + s * 11)} ${ank - 4} L${R(ax + s * 12.6)} ${ank + 9} L${R(ax + s * 4)} ${ank + 9} Z" fill="${olive}" opacity=".9"/>
                ${line(`M${ax - 7} ${ank - 4} q7 -3 14 0 M${ax - 7} ${ank + .5} q7 -3 14 0`, lace, 1.4, .85)}
                <path d="M${ax - 14} ${ank + 9} h28 q5 0 5 4.5 t-5 4.5 h-28 q-5 0 -5 -4.5 t5 -4.5 z" fill="${dk}"/>
                ${line(`M${ax - 8} ${ank + 11.5} v4 M${ax} ${ank + 11.5} v4 M${ax + 8} ${ank + 11.5} v4`, shade(dk, 0.28), 1.4, .7)}`;

      return "";
    };
    return one(-1) + one(1);
  },
};
