import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { File, Paths } from "expo-file-system";

const { width, height } = Dimensions.get("window");

export default function PanoramaViewer({
  imageSource,
  style,
  onLoad,
}: {
  imageSource: string;
  style?: any;
  onLoad?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cachedImageUri, setCachedImageUri] = useState<string | null>(null);
  const [previousCachedUri, setPreviousCachedUri] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  // Cache image and manage blur
  useEffect(() => {
    let mounted = true;
    
    const cacheImage = async () => {
      try {
        console.log("Caching image:", imageSource);
        const filename = imageSource.split("/").pop() || "panorama.jpg";
        const cacheFile = new File(Paths.cache, filename);
        
        // Check if already cached
        const fileInfo = await cacheFile.info();
        
        if (fileInfo.exists) {
          console.log("Image already cached:", cacheFile.uri);
          if (mounted) {
            // Save previous for blur
            setPreviousCachedUri(cachedImageUri);
            setCachedImageUri(cacheFile.uri);
            return;
          }
        }
        
        // Download image
        console.log("Downloading image...");
        const response = await fetch(imageSource);
        const blob = await response.blob();
        
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = reject;
          reader.readAsArrayBuffer(blob);
        });
        
        const writer = cacheFile.writableStream().getWriter();
        await writer.write(new Uint8Array(arrayBuffer));
        await writer.close();
        
        if (mounted) {
          console.log("Image cached:", cacheFile.uri);
          setPreviousCachedUri(cachedImageUri);
          setCachedImageUri(cacheFile.uri);
        }
      } catch (error) {
        console.error("Error caching image:", error);
        if (mounted) {
          // If caching fails, use URL directly
          setPreviousCachedUri(cachedImageUri);
          setCachedImageUri(imageSource);
        }
      }
    };

    cacheImage();

    return () => {
      mounted = false;
    };
  }, [imageSource]);

  console.log("PanoramaViewer - imageSource:", imageSource);

  // HTML content with custom WebGL panorama renderer (no Pannellum)
  const htmlContent = useMemo(() => {
    if (!cachedImageUri) {
      console.log("No cached image yet");
      return "";
    }
    
    console.log("=== Generating WebGL Panorama HTML ===");
    console.log("Original URL:", imageSource);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { width: 100%; height: 100%; overflow: hidden; background: #000; touch-action: none; }
          canvas { width: 100vw; height: 100vh; display: block; }
        </style>
      </head>
      <body>
        <canvas id="c"></canvas>
        <script>
        (function() {
          'use strict';

          // ---- Math utilities ----
          function createMat4() {
            return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
          }

          function mat4Perspective(out, fovY, aspect, near, far) {
            var f = 1.0 / Math.tan(fovY / 2);
            var nf = 1 / (near - far);
            out[0]=f/aspect; out[1]=0; out[2]=0; out[3]=0;
            out[4]=0; out[5]=f; out[6]=0; out[7]=0;
            out[8]=0; out[9]=0; out[10]=(far+near)*nf; out[11]=-1;
            out[12]=0; out[13]=0; out[14]=2*far*near*nf; out[15]=0;
            return out;
          }

          function mat4LookAt(out, eye, center, up) {
            var z0=eye[0]-center[0], z1=eye[1]-center[1], z2=eye[2]-center[2];
            var len=1/Math.sqrt(z0*z0+z1*z1+z2*z2);
            z0*=len; z1*=len; z2*=len;
            var x0=up[1]*z2-up[2]*z1, x1=up[2]*z0-up[0]*z2, x2=up[0]*z1-up[1]*z0;
            len=Math.sqrt(x0*x0+x1*x1+x2*x2);
            if(len===0){x0=0;x1=0;x2=0;}
            else{len=1/len;x0*=len;x1*=len;x2*=len;}
            var y0=z1*x2-z2*x1, y1=z2*x0-z0*x2, y2=z0*x1-z1*x0;
            len=Math.sqrt(y0*y0+y1*y1+y2*y2);
            if(len===0){y0=0;y1=0;y2=0;}
            else{len=1/len;y0*=len;y1*=len;y2*=len;}
            out[0]=x0;out[1]=y0;out[2]=z0;out[3]=0;
            out[4]=x1;out[5]=y1;out[6]=z1;out[7]=0;
            out[8]=x2;out[9]=y2;out[10]=z2;out[11]=0;
            out[12]=-(x0*eye[0]+x1*eye[1]+x2*eye[2]);
            out[13]=-(y0*eye[0]+y1*eye[1]+y2*eye[2]);
            out[14]=-(z0*eye[0]+z1*eye[1]+z2*eye[2]);
            out[15]=1;
            return out;
          }

          function degToRad(d){return d*Math.PI/180;}
          function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
          function normalizeAngle(d){return((d%360)+360)%360;}

          // ---- Constants ----
          var FRICTION = 0.93;
          var MIN_VEL = 0.05;
          var MIN_FOV = 30;
          var MAX_FOV = 120;
          var MIN_PITCH = -85;
          var MAX_PITCH = 85;
          var RADIUS = 500;
          var W_SEG = 96;
          var H_SEG = 48;

          // ---- Camera state ----
          var heading = 0;
          var pitch = 0;
          var hfov = 90;
          var isDragging = false;
          var lastX = 0, lastY = 0;
          var velX = 0, velY = 0;
          var needsRender = true;
          var isAnimating = false;

          // Touch
          var activeTouches = {};
          var touchCount = 0;
          var pinchStartDist = 0;
          var pinchStartFov = 90;

          // ---- Canvas & WebGL ----
          var canvas = document.getElementById('c');
          var gl = canvas.getContext('webgl2', {
            alpha: false,
            antialias: true,
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance'
          });

          if (!gl) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error', message: 'WebGL2 not supported'
            }));
            return;
          }

          // ---- Shaders ----
          var vsSrc = '#version 300 es\\n' +
            'precision highp float;\\n' +
            'in vec3 aP;\\n' +
            'in vec2 aT;\\n' +
            'uniform mat4 uProj;\\n' +
            'uniform mat4 uView;\\n' +
            'out vec2 vT;\\n' +
            'void main(){gl_Position=uProj*uView*vec4(aP,1.0);vT=aT;}';

          var fsSrc = '#version 300 es\\n' +
            'precision highp float;\\n' +
            'in vec2 vT;\\n' +
            'uniform sampler2D uTex;\\n' +
            'out vec4 fc;\\n' +
            'void main(){fc=texture(uTex,vT);}';

          function compileShader(type, src) {
            var s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
              console.error('Shader error:', gl.getShaderInfoLog(s));
              gl.deleteShader(s);
              return null;
            }
            return s;
          }

          var vs = compileShader(gl.VERTEX_SHADER, vsSrc);
          var fs = compileShader(gl.FRAGMENT_SHADER, fsSrc);
          if (!vs || !fs) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error', message: 'Shader compilation failed'
            }));
            return;
          }

          var prog = gl.createProgram();
          gl.attachShader(prog, vs);
          gl.attachShader(prog, fs);
          gl.linkProgram(prog);
          if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error', message: 'Program link failed'
            }));
            return;
          }
          gl.useProgram(prog);
          gl.deleteShader(vs);
          gl.deleteShader(fs);

          var uProj = gl.getUniformLocation(prog, 'uProj');
          var uView = gl.getUniformLocation(prog, 'uView');
          var uTex = gl.getUniformLocation(prog, 'uTex');

          // ---- Sphere geometry ----
          var positions = [];
          var texCoords = [];
          var indices = [];

          for (var lat = 0; lat <= H_SEG; lat++) {
            var theta = lat * Math.PI / H_SEG;
            var sinT = Math.sin(theta);
            var cosT = Math.cos(theta);
            for (var lon = 0; lon <= W_SEG; lon++) {
              var phi = lon * 2 * Math.PI / W_SEG;
              var sinP = Math.sin(phi);
              var cosP = Math.cos(phi);
              positions.push(RADIUS*sinT*cosP, RADIUS*cosT, RADIUS*sinT*sinP);
              texCoords.push(1 - lon/W_SEG, lat/H_SEG);
            }
          }

          for (var lat = 0; lat < H_SEG; lat++) {
            for (var lon = 0; lon < W_SEG; lon++) {
              var a = lat*(W_SEG+1)+lon;
              var b = a+W_SEG+1;
              indices.push(a,b,a+1, b,b+1,a+1);
            }
          }

          var indexCount = indices.length;

          // VAO
          var vao = gl.createVertexArray();
          gl.bindVertexArray(vao);

          var posBuf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
          var aP = gl.getAttribLocation(prog, 'aP');
          gl.enableVertexAttribArray(aP);
          gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 0, 0);

          var tcBuf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, tcBuf);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
          var aT = gl.getAttribLocation(prog, 'aT');
          gl.enableVertexAttribArray(aT);
          gl.vertexAttribPointer(aT, 2, gl.FLOAT, false, 0, 0);

          var idxBuf = gl.createBuffer();
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);

          gl.bindVertexArray(null);

          // GL state
          gl.enable(gl.DEPTH_TEST);
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
          gl.clearColor(0, 0, 0, 1);

          // ---- Texture ----
          var texture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([0,0,0,255]));

          var img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.onload = function() {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

            var isPow2 = function(v){return(v&(v-1))===0&&v!==0;};
            if (isPow2(img.width)&&isPow2(img.height)) {
              gl.generateMipmap(gl.TEXTURE_2D);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            } else {
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            var ext = gl.getExtension('EXT_texture_filter_anisotropic');
            if (ext) {
              var maxA = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
              gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(4, maxA));
            }

            needsRender = true;
            console.log('Texture loaded:', img.width, 'x', img.height);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'loaded', success: true
            }));
          };
          img.onerror = function() {
            console.error('Image load error');
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error', message: 'Failed to load panorama image'
            }));
          };
          img.src = '${imageSource}';

          // ---- Render ----
          function render() {
            var dpr = window.devicePixelRatio || 1;
            var dw = Math.floor(canvas.clientWidth * dpr);
            var dh = Math.floor(canvas.clientHeight * dpr);
            if (canvas.width !== dw || canvas.height !== dh) {
              canvas.width = dw;
              canvas.height = dh;
            }
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            gl.useProgram(prog);

            var aspect = canvas.width / canvas.height;
            var projMat = createMat4();
            mat4Perspective(projMat, degToRad(hfov), aspect, 0.1, 1000);

            var hr = degToRad(heading);
            var pr = degToRad(pitch);
            var cx = Math.cos(pr)*Math.sin(hr);
            var cy = Math.sin(pr);
            var cz = Math.cos(pr)*Math.cos(hr);
            var viewMat = createMat4();
            mat4LookAt(viewMat, [0,0,0], [cx,cy,cz], [0,1,0]);

            gl.uniformMatrix4fv(uProj, false, projMat);
            gl.uniformMatrix4fv(uView, false, viewMat);
            gl.uniform1i(uTex, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);

            gl.bindVertexArray(vao);
            gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_INT, 0);
            gl.bindVertexArray(null);
          }

          // ---- Physics ----
          function updatePhysics() {
            if (!isDragging && (Math.abs(velX)>MIN_VEL || Math.abs(velY)>MIN_VEL)) {
              heading += velX;
              pitch -= velY;
              pitch = clamp(pitch, MIN_PITCH, MAX_PITCH);
              heading = normalizeAngle(heading);
              velX *= FRICTION;
              velY *= FRICTION;
              if (Math.abs(velX)<MIN_VEL) velX=0;
              if (Math.abs(velY)<MIN_VEL) velY=0;
              needsRender = true;
              isAnimating = Math.abs(velX)>MIN_VEL||Math.abs(velY)>MIN_VEL;
            }
          }

          // ---- Main loop ----
          function tick() {
            requestAnimationFrame(tick);
            updatePhysics();
            if (needsRender || isAnimating) {
              render();
              if (!isAnimating && !isDragging) needsRender = false;
            }
          }
          tick();

          // ---- Touch events ----
          function getTouchCount() {
            var c = 0;
            for (var k in activeTouches) c++;
            return c;
          }

          canvas.addEventListener('touchstart', function(e) {
            e.preventDefault();
            for (var i = 0; i < e.changedTouches.length; i++) {
              var t = e.changedTouches[i];
              activeTouches[t.identifier] = {x: t.clientX, y: t.clientY};
            }
            touchCount = getTouchCount();

            if (touchCount === 1) {
              var t = e.changedTouches[0];
              isDragging = true;
              lastX = t.clientX;
              lastY = t.clientY;
              velX = 0; velY = 0;
              isAnimating = true;
            } else if (touchCount === 2) {
              isDragging = false;
              var keys = Object.keys(activeTouches);
              var t0 = activeTouches[keys[0]];
              var t1 = activeTouches[keys[1]];
              pinchStartDist = Math.hypot(t1.x-t0.x, t1.y-t0.y);
              pinchStartFov = hfov;
            }
          }, {passive: false});

          canvas.addEventListener('touchmove', function(e) {
            e.preventDefault();
            for (var i = 0; i < e.changedTouches.length; i++) {
              var t = e.changedTouches[i];
              activeTouches[t.identifier] = {x: t.clientX, y: t.clientY};
            }
            touchCount = getTouchCount();

            if (touchCount === 1 && isDragging) {
              var t = e.changedTouches[0];
              var dx = t.clientX - lastX;
              var dy = t.clientY - lastY;
              var sens = hfov / canvas.clientWidth;
              var dH = -dx * sens;
              var dP = dy * sens;
              heading = normalizeAngle(heading + dH);
              pitch = clamp(pitch + dP, MIN_PITCH, MAX_PITCH);
              var alpha = 0.4;
              velX = velX*(1-alpha) + dH*alpha;
              velY = velY*(1-alpha) + (-dP)*alpha;
              lastX = t.clientX;
              lastY = t.clientY;
              needsRender = true;
            } else if (touchCount === 2) {
              var keys = Object.keys(activeTouches);
              var t0 = activeTouches[keys[0]];
              var t1 = activeTouches[keys[1]];
              var dist = Math.hypot(t1.x-t0.x, t1.y-t0.y);
              if (pinchStartDist > 0) {
                var ratio = pinchStartDist / dist;
                hfov = clamp(pinchStartFov * ratio, MIN_FOV, MAX_FOV);
                needsRender = true;
              }
            }
          }, {passive: false});

          canvas.addEventListener('touchend', function(e) {
            for (var i = 0; i < e.changedTouches.length; i++) {
              delete activeTouches[e.changedTouches[i].identifier];
            }
            touchCount = getTouchCount();
            if (touchCount === 0) {
              isDragging = false;
              isAnimating = true;
            } else if (touchCount === 1) {
              isDragging = true;
              var keys = Object.keys(activeTouches);
              var rem = activeTouches[keys[0]];
              lastX = rem.x;
              lastY = rem.y;
              velX = 0; velY = 0;
            }
            needsRender = true;
          }, {passive: false});

          // ---- DeviceOrientation (gyroscope) ----
          var gyroEnabled = false;
          var initialAlpha = null;
          var initialBeta = null;

          function handleOrientation(e) {
            if (!gyroEnabled) return;
            if (e.alpha === null) return;
            if (initialAlpha === null) {
              initialAlpha = e.alpha;
              initialBeta = e.beta;
            }
            var dAlpha = e.alpha - initialAlpha;
            var dBeta = e.beta - initialBeta;
            heading = normalizeAngle(-dAlpha);
            pitch = clamp(-(dBeta - 90), MIN_PITCH, MAX_PITCH);
            needsRender = true;
          }

          if (window.DeviceOrientationEvent) {
            // Try requesting permission (iOS 13+)
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
              // Will be requested on user gesture
            } else {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          }

          console.log('WebGL Panorama Engine initialized');
        })();
        </script>
      </body>
      </html>
    `;
  }, [cachedImageUri]);

  // Handle messages from WebView
  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("WebView message:", data);
      
      if (data.type === 'loaded') {
        console.log("✓ Panorama loaded successfully");
        setIsLoading(false);
        onLoad?.();
      } else if (data.type === 'error') {
        console.error("✗ Panorama error:", data.message);
        setErrorMessage(data.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }, [onLoad]);

  // Handle WebView errors
  const handleWebViewError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView error:", nativeEvent);
    setErrorMessage(`WebView error: ${nativeEvent.description || nativeEvent.message || 'Unknown'}`);
    setIsLoading(false);
  }, []);

  return (
    <View style={[styles.container, style]}>
      {/* Loading overlay - centered on screen */}
      {isLoading && !errorMessage && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size={48} color="#38BDF8" />
          <Text style={styles.loadingText}>Загрузка панорамы...</Text>
        </View>
      )}

      {/* Blur background from previous image */}
      {isLoading && previousCachedUri && (
        <Image
          source={{ uri: previousCachedUri }}
          style={styles.blurBackground}
          blurRadius={20}
        />
      )}

      {/* WebView with WebGL panorama */}
      {cachedImageUri && (
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={{ flex: 1, backgroundColor: 'transparent' }}
          onMessage={handleMessage}
          onError={handleWebViewError}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          mixedContentMode="always"
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={false}
          bounces={false}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          cacheEnabled={true}
          cacheMode="LOAD_CACHE_ELSE_NETWORK"
        />
      )}

      {/* Error overlay */}
      {!!errorMessage && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorTitle}>Ошибка загрузки</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E1A",
    overflow: "hidden",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0A0E1A",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    zIndex: 100,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  webView: {
    flex: 1,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  errorTitle: {
    color: "#FCA5A5",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  errorText: {
    color: "#E2E8F0",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
