/** @type {HTMLCanvasElement} */
const cvs = document.querySelector('#canvas');

const ctx = cvs.getContext('2d');

  // 获取设备dpi
const dpr =
  window.devicePixelRatio ||
  window.webkitDevicePixelRatio ||
  window.mozDevicePixelRatio ||
  1;

cvs.width = cvs.height = 300 * dpr;
cvs.style.width = '300px';
cvs.style.height = '300px';
// ctx.scale(dpr, dpr);
  
const fontSize = 15;
const lineHeight = fontSize * 2;
const space = 10;
ctx.lineWidth = 10;
ctx.font = `${fontSize}px 微软雅黑`;
ctx.lineCap = 'round';

const data = [
  {
    text: '项目1',
    rate: 50,
    color: '#ff8800',
    unit: '万'
  },
  {
    text: '项目2',
    rate: 70,
    color: 'green',
    unit: '%'
  },
  {
    text: '项目3',
    rate: 90,
    color: 'red',
    unit: '%'
  }
];

data.forEach((v) => {
  v.runRate = 2;
  v.step = v.rate / 100;
});

function render() {

  ctx.clearRect(0, 0, ctx.width,ctx.height);

  data.forEach((v, i) => {
    const mt = i * ctx.lineWidth + ctx.lineWidth + i * space;
    const r = cvs.width / 2;

    ctx.beginPath();
    ctx.strokeStyle = '#eeeeee';
    ctx.arc(r, r, r - mt, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = v.color;
    ctx.arc(r, r, r - mt, 0, Math.PI / 180 * (360 * v.runRate / 100));
    ctx.stroke();

    if (v.runRate > v.rate) {
      v.runRate = v.rate;
      // return
    } else if (v.runRate < v.rate) {
      v.runRate += v.step;
    };

    ctx.fillStyle = v.color;
    const { width } = ctx.measureText(`${v.text}: ${v.rate.toFixed(0)}%`);
    const pointX = cvs.height / 2;
    const pointY = cvs.height / 2 - lineHeight / 2;
    ctx.fillText(`${v.text}: ${v.rate.toFixed(0)}${v.unit}`, pointX - width / 2, pointY + i * lineHeight);

  });

  requestAnimationFrame(render)
}

render()