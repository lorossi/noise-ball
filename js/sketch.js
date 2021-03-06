class Sketch extends Engine {
  preload() {
    this._radius = this.height / 4; // ball radius
    this._scl = 1; // coloured square size
    this._noise_scl = 0.0015 * this._scl;
    this._time_scl = 1;
    this._background_color = "rgb(240, 240, 240)";
    this._border_color = "rgb(15, 15, 15)";
    this._palette = ["#006980", "#009f9f", "#20b7b0", "#f3af35", "#ed6e34", "#e83236"]; // colors that will fill the center of the ball
    this._line_width = 8;

    this._recording = false;
    this._duration = 900;
  }

  setup() {
    console.clear();
    // setup capturer
    if (this._recording) {
      this._capturer = new CCapture({ format: "png" });
      this._capturer_started = false;
    }
    // setup noise
    this._simplex = new SimplexNoise(new Date().getTime());
    // pre calculate square radius (not that makes one heck of a difference, it's still slow as heck)
    this._radius_sq = Math.pow(this._radius, 2);
  }

  draw() {
    // setup capturer
    if (!this._capturer_started && this._recording) {
      this._capturer_started = true;
      this._capturer.start();
      console.log("%c Recording started", "color: green; font-size: 2rem");
    }

    // time calculation
    const percent = (this.frameCount % this._duration) / this._duration;
    const time_theta = percent * Math.PI * 2;

    const time_x = (1 + Math.cos(time_theta)) * this._time_scl;
    const time_y = (1 + Math.sin(time_theta)) * this._time_scl;

    // draw
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this._background_color;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);

    // iterate through each square and calculate a noise value
    // it is then mapped to a color from the palette
    for (let x = -this._radius; x < this._radius; x += this._scl) {
      for (let y = -this._radius; y < this._radius; y += this._scl) {
        // skip squares outside the circle
        if (distSq(0, 0, x, y) < this._radius_sq) {
          // compute noise and get color from the palette
          const n = this._noise(x * this._noise_scl, y * this._noise_scl, time_x, time_y);
          const index = Math.floor(n * this._palette.length);
          const fill_c = this._palette[index];

          this.ctx.save();
          this.ctx.translate(x, y);
          this.ctx.fillStyle = fill_c;
          this.ctx.fillRect(0, 0, this._scl, this._scl);
          this.ctx.restore();
        }
      }
    }

    // draw the outer circle
    this.ctx.strokeStyle = this._border_color;
    this.ctx.lineWidth = this._line_width;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this._radius, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.ctx.restore();


    if (this.frameCount % 30 == 0 && this._recording) console.log(Math.floor(percent * 100) + "%");

    // record
    if (this._recording) {
      if (this.frameCount < this._duration) {
        this._capturer.capture(this._canvas);
      } else {
        this._recording = false;
        this._capturer.stop();
        this._capturer.save();
        console.log("%c Recording ended", "color: red; font-size: 2rem");
      }
    }
  }

  // easier way to generate a random noise
  _noise(x, y, z = 0, w = 0) {
    return (1 + this._simplex.noise4D(x, y, z, w)) / 2;
  }
}


const distSq = (x1, y1, x2, y2) => {
  return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
};