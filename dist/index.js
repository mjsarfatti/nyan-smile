let nyanGif = document.getElementById('_nyan');
let nyanAudio = document.getElementById('_audio');
let nyanTip = document.getElementById('_tip');
let smiling = {};
let neutral = {};
let inited = false;
let smiled = false;

function tip() {
  setTimeout(() => {
    if (!smiled) {
      nyanTip.style.display = 'flex';
    }
  }, 2000);
}

// BRFv4DemoMinimal.js defines: var handleTrackingResults = function(brfv4, faces, imageDataCtx)
// Here we overwrite it. The initialization code for BRFv4 should always be similar,
// that's why we put it into its own file.
handleTrackingResults = function(
  brfv4, // namespace
  faces, // tracked faces
  imageDataCtx // canvas context to draw into
) {
  var p0 = new brfv4.Point();
  var p1 = new brfv4.Point();
  var setPoint = brfv4.BRFv4PointUtils.setPoint;
  var calcDistance = brfv4.BRFv4PointUtils.calcDistance;

  if (!inited) {
    inited = true;
    tip();
  }

  for (var i = 0; i < faces.length; i++) {
    var face = faces[i];
    if (
      face.state === brfv4.BRFState.FACE_TRACKING_START ||
      face.state === brfv4.BRFState.FACE_TRACKING
    ) {
      // Smile Detection

      setPoint(face.vertices, 48, p0); // mouth corner left
      setPoint(face.vertices, 54, p1); // mouth corner right

      var mouthWidth = calcDistance(p0, p1);

      setPoint(face.vertices, 39, p1); // left eye inner corner
      setPoint(face.vertices, 42, p0); // right eye outer corner

      var eyeDist = calcDistance(p0, p1);
      var smileFactor = mouthWidth / eyeDist;

      smileFactor -= 1.4; // 1.40 - neutral, 1.70 smiling

      if (smileFactor > 0.25) smileFactor = 0.25;
      if (smileFactor < 0.0) smileFactor = 0.0;

      smileFactor *= 4.0;

      if (smileFactor > 0.5) {
        smiling['face' + 1] += 1;
        neutral['face' + 1] = 0;
        if (smiling['face' + 1] > 2) {
          smiled = true;
          nyanTip.style.display = 'none';
          nyanGif.style.display = 'block';
          if (nyanAudio.paused) {
            nyanAudio.fastSeek(5.4);
            nyanAudio.play();
          }
        }
      } else {
        smiling['face' + 1] = 0;
        neutral['face' + 1] += 1;
        if (neutral['face' + 1] > 5) {
          nyanGif.style.display = 'none';
          nyanAudio.pause();
        }
      }
    }
  }
};

onResize = function() {
  // fill whole browser
  var imageData = document.getElementById('_imageData');
  var ww = window.innerWidth;
  var wh = window.innerHeight;
  var s = wh / imageData.height;
  if (imageData.width * s < ww) {
    s = ww / imageData.width;
  }
  var iw = imageData.width * s;
  var ih = imageData.height * s;
  var ix = (ww - iw) * 0.5;
  var iy = (wh - ih) * 0.5;
  imageData.style.transformOrigin = '0% 0%';
  imageData.style.transform =
    'matrix(' + s + ', 0, 0, ' + s + ', ' + ix + ', ' + iy + ')';
};
