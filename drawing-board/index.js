class DrawingBoard {

  constructor(param = {}) {
    this.width = param?.width ?? 400;
    this.height = param?.height ?? 300;
    this.color = param?.color ?? 'red';
    this.size = param?.size ?? 2;
    this.speed = param?.speed ?? 10;
    this.isOutStop = param?.isOutStop ?? true;

    /**
     * drawRecord: 绘制历史列表中，即每一笔的记录集合
     *             这是一个二维数组，里面的每一条数据都是一次起笔到抬起的路径集合，
     *             二级数组中的数据为这一笔划过的路径的坐标信息
     * coords: 每一笔划过路径的坐标信息
     * timerId: 存放定时器ID，用于随时取消回放
     * isDrag: 设置开始绘画的开关
     */
    this.drawRecord = [];
    this.coords = [];
    this.timerId = null;
    this.isDrag = false;
    this.isPlay = false;

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
    const {canvas, ctx, color, size} = this;

    ctx.lineWidth = size;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.shadowColor = color;

    canvas.onmousedown = this.onmouseDown.bind(this);

    canvas.onmousemove = this.onmouseMove.bind(this);
    
    canvas.onmouseup = this.onmouseUp.bind(this);

    canvas.onmouseout = this.onmouseout.bind(this)
  };
  /**
   * 绘制线条
   */
  draw([x, y] = []) {
    this.ctx.lineTo(x, y)
    this.ctx.stroke();
  };

  onmouseDown() {
    if (this.isPlay) return;
    this.isDrag = true;
    this.ctx.beginPath();
  };

  onmouseMove(e) {
    if (this.isDrag) {
      const x = e.offsetX;
      const y = e.offsetY;

      this.draw([x, y])
      /**
       * 将当前画笔的路径坐标暂存起来，
       * 在鼠标抬起后将这一条绘制记录放入绘制历史列表中
       */
      this.coords.push([x, y])
    } 
  };

  onmouseUp() {
    this.isDrag = false;
    /**
     * 将当前绘画的这一笔存入到绘制历史记录中,
     * 并清空画笔坐标记录列表，避免下次重复记录到下一笔中
     */
    this.drawRecord.push([...this.coords]);
    this.coords = []
  };
  /**
   * 鼠标在绘制过程中超出画布是否要停止绘画
   * 超出后停止绘画的前提是鼠标必须处于按下的状态
   */
  onmouseout() {
    if (this.isOutStop && this.isDrag) {
      this.onmouseUp()
    }
  };
  /**
   * 清空画布
   */
  clear(resetDrawRecord = true) {
    if (resetDrawRecord) {
      this.drawRecord = []
    };
    // 清除定时器，避免在点击清空是正在回放的绘制未结束，导致不能正常清空内容
    clearTimeout(this.timerId)

    this.ctx.clearRect(0, 0, this.width, this.height)
  };

  /**
   * 播放绘制路径
   * @param { number } speed - 播放速度
   * 如果传入的speed为0，应当直接同步绘制，不需要定时器
   */
  playback(speed = this.speed) {
    // 播放前清空画布，但不清空记录
    this.clear(false);
    
    // 判断当前是否有绘制记录
    if (!this.drawRecord?.length) return;

    this.ctx.beginPath();
    
    const allCoord = this.collectAllCoords();

    this.isPlay = true;

    /**
     * 通过递归是便于控制播放的速度
     */
    const reDraw = (i) => {
      this.draw(allCoord[i]);
      
      clearTimeout(this.timerId);
      /**
       * 如果coord不存在说明已经超出数组范围了，则可以停止继续绘制了
       */
      const coord = allCoord[i + 1];
      if (!coord) {
        this.isPlay = false;
        return
      };
      /**
       * 当coord为reBeginPath时说明已经绘制到了新的一笔
       */
      if (coord === 'reBeginPath') {
        this.ctx.beginPath();
      };

      if (speed === 0) {
        reDraw(i + 1);
        return
      };

      this.timerId = setTimeout(() => {
        reDraw(i + 1)
      }, speed)
    }

    reDraw(0)
  };

  /**
   * 将画笔历史记录中每一笔的路径坐标按顺序放在一个数组中
   * 在每一此记录被放入时在前面添加一个重新起笔的标识reBeginPath
   * 播放书写过程中，如果不设置重新起笔
   * 所有的笔画都将被连接起来
   */
  collectAllCoords() {
    const allCoord = [];

    this.drawRecord.forEach((coords) => {
      allCoord.push('reBeginPath');
      allCoord.push(...coords);
    });

    return allCoord
  };
  /**
   * 返回上一笔
   */
  revoke() {
    this.drawRecord.pop();
    this.playback(0)
  };
  /**
   * 保存图片
   */
  saveImg() {
    if (this.drawRecord.length === 0) return;

    const a = document.createElement('a');
    a.download = 'user_name';
    a.style.display = 'none';

    a.href = this.canvas.toDataURL();
    document.body.appendChild(a);

    a.click();
    document.body.removeChild(a);
  };
  /**
   * 利用requestAnimationFrame实现setTimeout功能
   */
  _setTimeout(callback, delay) {

    let start = 0, timeStamp = new Date().getTime();

    const implement = (t) => {

      if (start === 0) {
        start = t
      };

      if (t >= (delay + start)) {
        window.cancelAnimationFrame(window[timeStamp]);
        delete window[timeStamp];
        callback();
        return
      };

      window.cancelAnimationFrame(window[timeStamp]);
      delete window[timeStamp];

      window[timeStamp] = window.requestAnimationFrame(implement);
    };

    window[timeStamp] = window.requestAnimationFrame(implement);

    return timeStamp
  };

  _clearTimeout(id) {
    window.cancelAnimationFrame(window[id]);
    delete window[id]
  }
};

