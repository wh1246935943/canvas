class PlaybackBoard {

  constructor(param = {}) {
    this.width = param?.width ?? 400;
    this.height = param?.height ?? 300;
    this.color = param?.color ?? 'red';
    this.size = param?.size ?? 2;
    this.isOutStop = param?.isOutStop ?? true;

    /**
     * 记录播放时的定时器id
     * 记录鼠标按下划过的路径的每一个像素的坐标
     * 设置开始绘画的开关
     */
    this.timerId = null;
    this.coords = [];
    this.isDrag = false;

    /** @type {HTMLCanvasElement} */
    this.canvas = document.querySelector(param.selecter);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.cursor = 'crosshair';

    this.ctx = this.canvas.getContext('2d');
  };

  /**
   * 初始化画笔样式
   * 为画布添加鼠标交互监听事件
   */
  init() {
    const {canvas, ctx, color, isOutStop, size} = this;

    ctx.lineWidth = size;
    // 画笔拐角的连接模式,round为圆角
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.shadowColor = color;

    canvas.onmousedown = this.onmouseDown.bind(this);

    canvas.onmousemove = this.onmouseMove.bind(this);
    
    canvas.onmouseup = this.onmouseUp.bind(this);

    if (isOutStop) {
      canvas.onmouseout = this.onmouseUp.bind(this)
    }
    
  };

  draw([x, y] = []) {
    this.ctx.lineTo(x, y)
    this.ctx.stroke();
  };

  onmouseDown() {
    this.isDrag = true;
    // 画笔重新起笔
    this.ctx.beginPath();
  };

  onmouseMove(e) {
    const { isDrag, coords } = this;

    if (isDrag) {
      const x = e.offsetX;
      const y = e.offsetY;
      this.draw([x, y])
      /**
       * 记录每一个点的坐标
       * 用于点击播放按钮时重新绘制曲线
       */
      coords.push([x, y])
    } 
  };

  onmouseUp() {
    this.isDrag = false;
    /**
     * 这里向数组中添加reBeginPath为了在后面回放时分割重新起笔
     * 否则所有记录在数组中的点都将被连接为一条线
     */
    this.coords.push('reBeginPath')
  };

  /**
   * 清空画布
   */
  clear(resetCoords = true) {
    if (resetCoords) {
      this.coords = [];
    };
    // 清除定时器，避免在点击清空是正在回放的绘制未结束，导致不能正常清空内容
    clearTimeout(this.timerId)

    this.ctx.clearRect(0, 0, this.width, this.height)
  };

  /**
   * 播放绘制路径
   */
  playback() {
    const { coords, ctx } = this;

    // 判断当前是否有绘制记录
    if (!coords?.length) return;
    // 播放前清空画布
    this.clear(false);
    
    ctx.beginPath();
    /**
     * 通过递归是便于控制播放的速度
     */
    const reDraw = (i) => {
      this.draw(coords[i]);

      const coord = coords[i + 1];
      if (!coord) return;

      if (coord === 'reBeginPath') {
        ctx.beginPath();
      };

      this.timerId = setTimeout(() => {
        reDraw(i + 1)
      }, 5)
    }

    reDraw(0)
  }
};

