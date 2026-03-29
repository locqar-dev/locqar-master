import React from "react";
import { T } from "../theme/themes";

export default function QRCode(props) {
  var sz = props.size || 120, data = props.data || '', bg = props.bg || '#fff', fg = props.fg || T.text;
  var grid = 21, cell = sz / grid;
  var seed = 0; for (var i = 0; i < data.length; i++) seed = ((seed << 5) - seed + data.charCodeAt(i)) | 0;
  var rng = function () { seed = (seed * 16807 + 0) % 2147483647; return (seed & 1) === 1; };
  var m = []; for (var r = 0; r < grid; r++) { m[r] = []; for (var c = 0; c < grid; c++) m[r][c] = false; }
  var finder = function (sr, sc) { for (var r = 0; r < 7; r++) for (var c = 0; c < 7; c++) { if (r === 0 || r === 6 || c === 0 || c === 6) m[sr + r][sc + c] = true; else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) m[sr + r][sc + c] = true; else m[sr + r][sc + c] = false; } };
  finder(0, 0); finder(0, 14); finder(14, 0);
  for (var r = 0; r < grid; r++) for (var c = 0; c < grid; c++) { var inF = (r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8); if (!inF) { if (r === 6 || c === 6) m[r][c] = (r + c) % 2 === 0; else m[r][c] = rng(); } }
  var rects = [];
  for (var r = 0; r < grid; r++) for (var c = 0; c < grid; c++) if (m[r][c]) rects.push(React.createElement('rect', { key: r + '-' + c, x: c * cell, y: r * cell, width: cell + 0.5, height: cell + 0.5, rx: cell * 0.15, fill: fg }));
  return (
    <div style={{ background: bg, borderRadius: props.radius || 16, padding: props.padding || 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>
      <svg width={sz} height={sz} viewBox={'0 0 ' + sz + ' ' + sz}>{rects}</svg>
    </div>
  );
}
