class User {
  constructor(id, name, pose, isLocal) {
    /**
     * The user's name.
     * @type {string} 
     **/
    this._name = null;

    /**
     * An HTML element to display the user's name.
     * @type {HTMLDivElement} 
     **/
    this._nameEl = null;

    /**
     * Calla will eventually give us a video stream for the user.
     * @type {MediaStream}
     **/
    this._videoStream = null;

    /**
     * An HTML element for displaying the user's video.
     * @type {HTMLVideoElement}
     **/
    this._video = null;

    /**
     * An HTML element for showing the user name and video together.
     **/
    this.container = document.createElement("div");
    this.container.className = "user";
    if (isLocal) {
      this.container.className = "localUser";
      /* name += " (Me)"; */
    }
    this.id = id;
    this.name = name;
    this.pose = pose;

  }
  dispose() {
    this.container.parentElement.removeChild(this.container);

  }
  get name() {
    return this._name;
  }

  set name(v) {
    if (this._nameEl) {
      this.container.removeChild(this._nameEl);
      this._nameEl = null;
    }
    this._name = v;
    this._nameEl = document.createElement("div");
    this._nameEl.className = "userName";
    this._nameEl.append(document.createTextNode(this.name));
    this.container.append(this._nameEl);
  }
  get videoStream() {
    return this._videoStream;
  }

  set videoStream(v) {
    // make sure to remove any existing video elements, first. This
    // will occur if the user changes their video input device.
    if (this._video) {
      this.container.removeChild(this._video);
      this._video = null;
    }

    this._videoStream = v;

    if (this._videoStream) {
      this._video = document.createElement("video");
      this._video.className = "userVideo";
      this.container.append(this._video);

      // a bunch of settings to make the video play right
      this._video.playsInline = true;
      this._video.autoplay = true;
      this._video.controls = false;
      this._video.muted = true;
      this._video.volume = 0;

      // now start the video
      this._video.srcObject = this._videoStream;
      this._video.play();

    }
  }
  update() {
    const dx = this.container.parentElement.clientLeft - this.container.clientWidth / 2;
    const dy = this.container.parentElement.clientTop - this.container.clientHeight / 2;
    this.container.style.left = (100 * this.pose.current.p.x + dx) + "px";
    this.container.style.zIndex = this.pose.current.p.y;
    this.container.style.top = (100 * this.pose.current.p.z + dy) + "px";

  }
}

export default User