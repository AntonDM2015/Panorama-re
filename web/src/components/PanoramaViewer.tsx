import React, { useEffect, useRef, useState, useCallback } from 'react';

import './PanoramaViewer.css';

// ============================================================
//  TYPES
// ============================================================

export interface CustomHotspot {
  id: string;
  heading: number;
  pitch: number;
  label: string;
}

interface PanoramaViewerProps {
  imageUrl: string;
  hotspots?: CustomHotspot[];
  onNavigate?: (hotspotId: string) => void;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

interface HotspotState {
  id: string;
  label: string;
  heading: number;   // degrees from North
  pitch: number;     // degrees
  screenX: number;
  screenY: number;
  visible: boolean;
  scale: number;
}

// ============================================================
//  MATH UTILITIES
// ============================================================

function createMat4(): Float32Array {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
}

function mat4Perspective(out: Float32Array, fovY: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1.0 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = 2 * far * near * nf;
  out[15] = 0;
  return out;
}

function mat4LookAt(out: Float32Array, eye: number[], center: number[], up: number[]): Float32Array {
  let x0: number, x1: number, x2: number;
  let y0: number, y1: number, y2: number;
  let z0: number, z1: number, z2: number;
  let len: number;

  z0 = eye[0] - center[0];
  z1 = eye[1] - center[1];
  z2 = eye[2] - center[2];
  len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
  z0 *= len; z1 *= len; z2 *= len;

  x0 = up[1] * z2 - up[2] * z1;
  x1 = up[2] * z0 - up[0] * z2;
  x2 = up[0] * z1 - up[1] * z0;
  len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
  if (len === 0) { x0 = 0; x1 = 0; x2 = 0; }
  else { len = 1 / len; x0 *= len; x1 *= len; x2 *= len; }

  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
  if (len === 0) { y0 = 0; y1 = 0; y2 = 0; }
  else { len = 1 / len; y0 *= len; y1 *= len; y2 *= len; }

  out[0] = x0;  out[1] = y0;  out[2] = z0;  out[3] = 0;
  out[4] = x1;  out[5] = y1;  out[6] = z1;  out[7] = 0;
  out[8] = x2;  out[9] = y2;  out[10] = z2; out[11] = 0;
  out[12] = -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]);
  out[13] = -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]);
  out[14] = -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]);
  out[15] = 1;

  return out;
}

function mat4Multiply(out: Float32Array, a: Float32Array, b: Float32Array): Float32Array {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      out[i * 4 + j] =
        a[0 * 4 + j] * b[i * 4 + 0] +
        a[1 * 4 + j] * b[i * 4 + 1] +
        a[2 * 4 + j] * b[i * 4 + 2] +
        a[3 * 4 + j] * b[i * 4 + 3];
    }
  }
  return out;
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}


// ============================================================
//  PANORAMA ENGINE (WebGL2)
// ============================================================

class PanoramaEngine {
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject | null = null;
  private indexCount: number = 0;
  private texture: WebGLTexture | null = null;
  private nextTexture: WebGLTexture | null = null;

  // Uniform locations (cached)
  private uProjection: WebGLUniformLocation | null = null;
  private uView: WebGLUniformLocation | null = null;
  private uTexture: WebGLUniformLocation | null = null;
  private uOpacity: WebGLUniformLocation | null = null;

  // Camera state
  public heading: number = 0;     // degrees, 0=north, CW
  public pitch: number = 0;       // degrees, 0=horizon, +up
  public hfov: number = 90;       // horizontal field of view degrees

  // Interaction state
  private isDragging: boolean = false;
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;
  private velocityX: number = 0;
  private velocityY: number = 0;

  // Touch state
  private touchStartDist: number = 0;
  private touchStartFov: number = 90;
  private activeTouches: Map<number, { x: number; y: number }> = new Map();

  // Keyboard state
  private keysPressed: Set<string> = new Set();

  // Animation
  private animFrameId: number = 0;
  private needsRender: boolean = true;
  private isAnimating: boolean = false;
  private opacity: number = 1.0;

  // Transition
  private transitionState: 'idle' | 'fadeout' | 'fadein' = 'idle';
  private transitionProgress: number = 0;
  private onTransitionMidpoint: (() => void) | null = null;
  private onTransitionComplete: (() => void) | null = null;

  // Constants
  private static readonly FRICTION = 0.93;
  private static readonly MIN_VELOCITY = 0.05;
  private static readonly KEYBOARD_SPEED_HEADING = 2.0;
  private static readonly KEYBOARD_SPEED_PITCH = 1.5;
  private static readonly ZOOM_SPEED = 3.0;
  private static readonly MIN_FOV = 30;
  private static readonly MAX_FOV = 120;
  private static readonly MIN_PITCH = -85;
  private static readonly MAX_PITCH = 85;
  private static readonly SPHERE_RADIUS = 500;
  private static readonly SPHERE_W_SEGMENTS = 96;
  private static readonly SPHERE_H_SEGMENTS = 48;
  private static readonly TRANSITION_SPEED = 0.04; // per frame

  // Shaders
  private static readonly VERT_SRC = `#version 300 es
    precision highp float;
    in vec3 aPosition;
    in vec2 aTexCoord;
    uniform mat4 uProjection;
    uniform mat4 uView;
    out vec2 vTexCoord;
    void main() {
      gl_Position = uProjection * uView * vec4(aPosition, 1.0);
      vTexCoord = aTexCoord;
    }
  `;

  private static readonly FRAG_SRC = `#version 300 es
    precision highp float;
    in vec2 vTexCoord;
    uniform sampler2D uTexture;
    uniform float uOpacity;
    out vec4 fragColor;
    void main() {
      vec4 c = texture(uTexture, vTexCoord);
      fragColor = vec4(c.rgb, c.a * uOpacity);
    }
  `;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: true,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });
    if (!gl) throw new Error('WebGL2 is not supported');
    this.gl = gl;

    // Compile program
    this.program = this.createProgram(PanoramaEngine.VERT_SRC, PanoramaEngine.FRAG_SRC);
    gl.useProgram(this.program);

    // Cache uniform locations
    this.uProjection = gl.getUniformLocation(this.program, 'uProjection');
    this.uView = gl.getUniformLocation(this.program, 'uView');
    this.uTexture = gl.getUniformLocation(this.program, 'uTexture');
    this.uOpacity = gl.getUniformLocation(this.program, 'uOpacity');

    // Build sphere geometry with VAO
    this.buildSphere(
      PanoramaEngine.SPHERE_RADIUS,
      PanoramaEngine.SPHERE_W_SEGMENTS,
      PanoramaEngine.SPHERE_H_SEGMENTS,
    );

    // GL state
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 1);

    // Event listeners
    this.attachEvents();

    // Start loop
    this.startLoop();
  }

  // ---- Shader compilation ----

  private compileShader(type: number, src: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error('Shader compile error: ' + log);
    }
    return shader;
  }

  private createProgram(vertSrc: string, fragSrc: string): WebGLProgram {
    const gl = this.gl;
    const vs = this.compileShader(gl.VERTEX_SHADER, vertSrc);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fragSrc);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(prog);
      gl.deleteProgram(prog);
      throw new Error('Program link error: ' + log);
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return prog;
  }

  // ---- Sphere Geometry ----

  private buildSphere(radius: number, wSeg: number, hSeg: number): void {
    const gl = this.gl;
    const positions: number[] = [];
    const texCoords: number[] = [];
    const indices: number[] = [];

    for (let lat = 0; lat <= hSeg; lat++) {
      const theta = (lat * Math.PI) / hSeg;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      for (let lon = 0; lon <= wSeg; lon++) {
        const phi = (lon * 2 * Math.PI) / wSeg;
        const sinP = Math.sin(phi);
        const cosP = Math.cos(phi);

        const x = radius * sinT * cosP;
        const y = radius * cosT;
        const z = radius * sinT * sinP;

        positions.push(x, y, z);
        // S is inverted so the texture is seen correctly from inside
        texCoords.push(1 - lon / wSeg, lat / hSeg);
      }
    }

    for (let lat = 0; lat < hSeg; lat++) {
      for (let lon = 0; lon < wSeg; lon++) {
        const a = lat * (wSeg + 1) + lon;
        const b = a + wSeg + 1;
        indices.push(a, b, a + 1);
        indices.push(b, b + 1, a + 1);
      }
    }

    this.indexCount = indices.length;

    // Create VAO
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    this.vao = vao;

    // Position buffer
    const posBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(this.program, 'aPosition');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

    // TexCoord buffer
    const tcBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, tcBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
    const aTc = gl.getAttribLocation(this.program, 'aTexCoord');
    gl.enableVertexAttribArray(aTc);
    gl.vertexAttribPointer(aTc, 2, gl.FLOAT, false, 0, 0);

    // Index buffer — Uint32 to support large meshes
    const idxBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);

    gl.bindVertexArray(null);
  }

  // ---- Texture loading ----

  private createTextureSourceForMobile(img: HTMLImageElement): TexImageSource {
    const gl = this.gl;
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;

    if (width <= maxTextureSize && height <= maxTextureSize) {
      return img;
    }

    const scale = Math.min(maxTextureSize / width, maxTextureSize / height);
    const targetWidth = Math.max(1, Math.floor(width * scale));
    const targetHeight = Math.max(1, Math.floor(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return img;
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    return canvas;
  }

  loadTexture(url: string): Promise<WebGLTexture> {
    return new Promise((resolve, reject) => {
      const gl = this.gl;
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);

      // Placeholder 1x1 black pixel
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0, 255]));

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        const source = this.createTextureSourceForMobile(img);
        const { width, height } = getTextureSourceSize(source);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

        const textureError = gl.getError();
        if (textureError !== gl.NO_ERROR) {
          gl.deleteTexture(tex);
          reject(new Error(`Failed to upload panorama texture (WebGL error ${textureError})`));
          return;
        }

        // Use MIPMAP for quality
        if (isPowerOf2(width) && isPowerOf2(height)) {
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        } else {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Enable anisotropic filtering if available
        const ext = gl.getExtension('EXT_texture_filter_anisotropic');
        if (ext) {
          const maxAniso = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
          gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(4, maxAniso));
        }

        resolve(tex);
      };
      img.onerror = () => reject(new Error('Failed to load image: ' + url));
      img.src = url;
    });
  }

  setTexture(tex: WebGLTexture): void {
    if (this.texture) {
      this.gl.deleteTexture(this.texture);
    }
    this.texture = tex;
    this.needsRender = true;
  }

  // ---- Transition ----

  startTransition(onMidpoint: () => void, onComplete?: () => void): void {
    this.transitionState = 'fadeout';
    this.transitionProgress = 0;
    this.onTransitionMidpoint = onMidpoint;
    this.onTransitionComplete = onComplete || null;
    this.isAnimating = true;
    this.needsRender = true;
  }

  // ---- Camera ----

  setDirection(heading: number, pitch: number): void {
    this.heading = normalizeAngle(heading);
    this.pitch = clamp(pitch, PanoramaEngine.MIN_PITCH, PanoramaEngine.MAX_PITCH);
    this.needsRender = true;
  }

  setFov(fov: number): void {
    this.hfov = clamp(fov, PanoramaEngine.MIN_FOV, PanoramaEngine.MAX_FOV);
    this.needsRender = true;
  }

  // Project a world-space direction (heading,pitch in degrees) -> screen coords
  projectToScreen(h: number, p: number): { x: number; y: number; visible: boolean; scale: number } {
    const canvas = this.canvas;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const fovY = degToRad(this.hfov) / aspect;

    const projMat = createMat4();
    mat4Perspective(projMat, fovY, aspect, 0.1, 1000);

    const viewMat = this.computeViewMatrix();

    const mvp = createMat4();
    mat4Multiply(mvp, projMat, viewMat);

    // Direction from heading/pitch
    const hr = degToRad(h);
    const pr = degToRad(p);
    const r = PanoramaEngine.SPHERE_RADIUS * 0.9; // slightly inside sphere
    const x = r * Math.cos(pr) * Math.sin(hr);
    const y = r * Math.sin(pr);
    const z = r * Math.cos(pr) * Math.cos(hr);

    // Homogeneous clip coords
    const cx = mvp[0] * x + mvp[4] * y + mvp[8] * z + mvp[12];
    const cy = mvp[1] * x + mvp[5] * y + mvp[9] * z + mvp[13];
    const cz = mvp[2] * x + mvp[6] * y + mvp[10] * z + mvp[14];
    const cw = mvp[3] * x + mvp[7] * y + mvp[11] * z + mvp[15];

    if (cw <= 0) return { x: -9999, y: -9999, visible: false, scale: 0 };

    const ndcX = cx / cw;
    const ndcY = cy / cw;
    const ndcZ = cz / cw;

    const visible = ndcX >= -1.2 && ndcX <= 1.2 && ndcY >= -1.2 && ndcY <= 1.2 && ndcZ >= -1 && ndcZ <= 1;

    // Screen coords
    const sx = (ndcX * 0.5 + 0.5) * canvas.clientWidth;
    const sy = (1 - (ndcY * 0.5 + 0.5)) * canvas.clientHeight;

    // Scale based on distance from center of screen (perspective)
    const dist = Math.sqrt(ndcX * ndcX + ndcY * ndcY);
    const scale = clamp(1 - dist * 0.3, 0.5, 1.2);

    return { x: sx, y: sy, visible, scale };
  }

  // ---- Internals ----

  private computeViewMatrix(): Float32Array {
    const hr = degToRad(this.heading);
    const pr = degToRad(this.pitch);

    const cx = Math.cos(pr) * Math.sin(hr);
    const cy = Math.sin(pr);
    const cz = Math.cos(pr) * Math.cos(hr);

    const viewMat = createMat4();
    mat4LookAt(viewMat, [0, 0, 0], [cx, cy, cz], [0, 1, 0]);
    return viewMat;
  }

  private render(): void {
    const gl = this.gl;
    const canvas = this.canvas;

    // DPR-aware resize
    const dpr = window.devicePixelRatio || 1;
    const dw = Math.floor(canvas.clientWidth * dpr);
    const dh = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== dw || canvas.height !== dh) {
      canvas.width = dw;
      canvas.height = dh;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (!this.texture) return;

    gl.useProgram(this.program);

    // Projection
    const aspect = canvas.width / canvas.height;
    const projMat = createMat4();
    mat4Perspective(projMat, degToRad(this.hfov), aspect, 0.1, 1000);

    // View
    const viewMat = this.computeViewMatrix();

    // Uniforms
    gl.uniformMatrix4fv(this.uProjection, false, projMat);
    gl.uniformMatrix4fv(this.uView, false, viewMat);
    gl.uniform1i(this.uTexture, 0);
    gl.uniform1f(this.uOpacity, this.opacity);

    // Texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    // Draw sphere
    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_INT, 0);
    gl.bindVertexArray(null);
  }

  private updatePhysics(): void {
    // Inertia / momentum
    if (!this.isDragging && (Math.abs(this.velocityX) > PanoramaEngine.MIN_VELOCITY || Math.abs(this.velocityY) > PanoramaEngine.MIN_VELOCITY)) {
      this.heading += this.velocityX;
      this.pitch -= this.velocityY;
      this.pitch = clamp(this.pitch, PanoramaEngine.MIN_PITCH, PanoramaEngine.MAX_PITCH);
      this.heading = normalizeAngle(this.heading);

      this.velocityX *= PanoramaEngine.FRICTION;
      this.velocityY *= PanoramaEngine.FRICTION;

      if (Math.abs(this.velocityX) < PanoramaEngine.MIN_VELOCITY) this.velocityX = 0;
      if (Math.abs(this.velocityY) < PanoramaEngine.MIN_VELOCITY) this.velocityY = 0;

      this.needsRender = true;
      this.isAnimating = Math.abs(this.velocityX) > PanoramaEngine.MIN_VELOCITY || Math.abs(this.velocityY) > PanoramaEngine.MIN_VELOCITY;
    }

    // Keyboard input
    let kbActive = false;
    if (this.keysPressed.has('ArrowLeft') || this.keysPressed.has('KeyA')) {
      this.heading -= PanoramaEngine.KEYBOARD_SPEED_HEADING;
      this.heading = normalizeAngle(this.heading);
      this.needsRender = true;
      kbActive = true;
    }
    if (this.keysPressed.has('ArrowRight') || this.keysPressed.has('KeyD')) {
      this.heading += PanoramaEngine.KEYBOARD_SPEED_HEADING;
      this.heading = normalizeAngle(this.heading);
      this.needsRender = true;
      kbActive = true;
    }
    if (this.keysPressed.has('ArrowUp') || this.keysPressed.has('KeyW')) {
      this.pitch = clamp(this.pitch + PanoramaEngine.KEYBOARD_SPEED_PITCH, PanoramaEngine.MIN_PITCH, PanoramaEngine.MAX_PITCH);
      this.needsRender = true;
      kbActive = true;
    }
    if (this.keysPressed.has('ArrowDown') || this.keysPressed.has('KeyS')) {
      this.pitch = clamp(this.pitch - PanoramaEngine.KEYBOARD_SPEED_PITCH, PanoramaEngine.MIN_PITCH, PanoramaEngine.MAX_PITCH);
      this.needsRender = true;
      kbActive = true;
    }
    if (this.keysPressed.has('Equal') || this.keysPressed.has('NumpadAdd')) {
      this.hfov = clamp(this.hfov - PanoramaEngine.ZOOM_SPEED, PanoramaEngine.MIN_FOV, PanoramaEngine.MAX_FOV);
      this.needsRender = true;
      kbActive = true;
    }
    if (this.keysPressed.has('Minus') || this.keysPressed.has('NumpadSubtract')) {
      this.hfov = clamp(this.hfov + PanoramaEngine.ZOOM_SPEED, PanoramaEngine.MIN_FOV, PanoramaEngine.MAX_FOV);
      this.needsRender = true;
      kbActive = true;
    }
    if (kbActive) this.isAnimating = true;

    // Transition animation
    if (this.transitionState !== 'idle') {
      this.transitionProgress += PanoramaEngine.TRANSITION_SPEED;
      this.needsRender = true;
      this.isAnimating = true;

      if (this.transitionState === 'fadeout') {
        this.opacity = clamp(1 - this.transitionProgress, 0, 1);
        if (this.transitionProgress >= 1) {
          this.transitionState = 'fadein';
          this.transitionProgress = 0;
          this.onTransitionMidpoint?.();
          this.onTransitionMidpoint = null;
        }
      } else if (this.transitionState === 'fadein') {
        this.opacity = clamp(this.transitionProgress, 0, 1);
        if (this.transitionProgress >= 1) {
          this.transitionState = 'idle';
          this.opacity = 1;
          this.onTransitionComplete?.();
          this.onTransitionComplete = null;
        }
      }
    }
  }

  private startLoop(): void {
    const tick = () => {
      this.animFrameId = requestAnimationFrame(tick);
      this.updatePhysics();
      if (this.needsRender || this.isAnimating) {
        this.render();
        if (!this.isAnimating && !this.isDragging) {
          this.needsRender = false;
        }
      }
    };
    tick();
  }

  // ---- Event handling ----

  private attachEvents(): void {
    const c = this.canvas;

    // Pointer events (unified mouse + touch)
    c.addEventListener('pointerdown', this.onPointerDown);
    c.addEventListener('pointermove', this.onPointerMove);
    c.addEventListener('pointerup', this.onPointerUp);
    c.addEventListener('pointerleave', this.onPointerUp);
    c.addEventListener('pointercancel', this.onPointerUp);

    // Scroll zoom
    c.addEventListener('wheel', this.onWheel, { passive: false });

    // Touch gestures (for pinch-to-zoom)
    c.addEventListener('touchstart', this.onTouchStart, { passive: false });
    c.addEventListener('touchmove', this.onTouchMove, { passive: false });
    c.addEventListener('touchend', this.onTouchEnd, { passive: false });

    // Keyboard
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    // Context menu
    c.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private detachEvents(): void {
    const c = this.canvas;
    c.removeEventListener('pointerdown', this.onPointerDown);
    c.removeEventListener('pointermove', this.onPointerMove);
    c.removeEventListener('pointerup', this.onPointerUp);
    c.removeEventListener('pointerleave', this.onPointerUp);
    c.removeEventListener('pointercancel', this.onPointerUp);
    c.removeEventListener('wheel', this.onWheel);
    c.removeEventListener('touchstart', this.onTouchStart);
    c.removeEventListener('touchmove', this.onTouchMove);
    c.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  private onPointerDown = (e: PointerEvent): void => {
    // Only handle primary button for drag (ignore pinch touches handled separately)
    if (e.pointerType === 'touch') return; // touch handled via touch events
    if (e.button !== 0) return;

    this.isDragging = true;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    this.velocityX = 0;
    this.velocityY = 0;
    this.canvas.setPointerCapture(e.pointerId);
    this.isAnimating = true;
    this.needsRender = true;
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') return;
    if (!this.isDragging) return;

    const dx = e.clientX - this.lastPointerX;
    const dy = e.clientY - this.lastPointerY;

    const sensitivity = this.hfov / this.canvas.clientWidth;
    const dHeading = -dx * sensitivity;
    const dPitch = dy * sensitivity;

    this.heading = normalizeAngle(this.heading + dHeading);
    this.pitch = clamp(this.pitch + dPitch, PanoramaEngine.MIN_PITCH, PanoramaEngine.MAX_PITCH);

    // Compute velocity for inertia (weighted moving average)
    const alpha = 0.4;
    this.velocityX = this.velocityX * (1 - alpha) + dHeading * alpha;
    this.velocityY = this.velocityY * (1 - alpha) + (-dPitch) * alpha;

    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    this.needsRender = true;
  };

  private onPointerUp = (e: PointerEvent): void => {
    if (e.pointerType === 'touch') return;
    if (!this.isDragging) return;
    this.isDragging = false;
    this.isAnimating = true; // keep animating for inertia
    this.needsRender = true;
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? PanoramaEngine.ZOOM_SPEED : -PanoramaEngine.ZOOM_SPEED;
    this.hfov = clamp(this.hfov + delta, PanoramaEngine.MIN_FOV, PanoramaEngine.MAX_FOV);
    this.needsRender = true;
  };

  // Touch handling for single-finger drag + pinch-to-zoom
  private onTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      this.activeTouches.set(t.identifier, { x: t.clientX, y: t.clientY });
    }

    if (this.activeTouches.size === 1) {
      // Single touch - start drag
      const t = e.changedTouches[0];
      this.isDragging = true;
      this.lastPointerX = t.clientX;
      this.lastPointerY = t.clientY;
      this.velocityX = 0;
      this.velocityY = 0;
      this.isAnimating = true;
    } else if (this.activeTouches.size === 2) {
      // Pinch start
      this.isDragging = false;
      const touches = Array.from(this.activeTouches.values());
      this.touchStartDist = Math.hypot(
        touches[1].x - touches[0].x,
        touches[1].y - touches[0].y,
      );
      this.touchStartFov = this.hfov;
    }
  };

  private onTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      this.activeTouches.set(t.identifier, { x: t.clientX, y: t.clientY });
    }

    if (this.activeTouches.size === 1 && this.isDragging) {
      const t = e.changedTouches[0];

      const dx = t.clientX - this.lastPointerX;
      const dy = t.clientY - this.lastPointerY;

      const sensitivity = this.hfov / this.canvas.clientWidth;
      const dHeading = -dx * sensitivity;
      const dPitch = dy * sensitivity;

      this.heading = normalizeAngle(this.heading + dHeading);
      this.pitch = clamp(this.pitch + dPitch, PanoramaEngine.MIN_PITCH, PanoramaEngine.MAX_PITCH);

      const alpha = 0.4;
      this.velocityX = this.velocityX * (1 - alpha) + dHeading * alpha;
      this.velocityY = this.velocityY * (1 - alpha) + (-dPitch) * alpha;

      this.lastPointerX = t.clientX;
      this.lastPointerY = t.clientY;
      this.needsRender = true;
    } else if (this.activeTouches.size === 2) {
      // Pinch zoom
      const touches = Array.from(this.activeTouches.values());
      const dist = Math.hypot(
        touches[1].x - touches[0].x,
        touches[1].y - touches[0].y,
      );
      if (this.touchStartDist > 0) {
        const ratio = this.touchStartDist / dist;
        this.hfov = clamp(
          this.touchStartFov * ratio,
          PanoramaEngine.MIN_FOV,
          PanoramaEngine.MAX_FOV,
        );
        this.needsRender = true;
      }
    }
  };

  private onTouchEnd = (e: TouchEvent): void => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      this.activeTouches.delete(e.changedTouches[i].identifier);
    }
    if (this.activeTouches.size === 0) {
      this.isDragging = false;
      this.isAnimating = true;
    } else if (this.activeTouches.size === 1) {
      // Switch back to single-finger drag
      const remaining = Array.from(this.activeTouches.values())[0];
      this.isDragging = true;
      this.lastPointerX = remaining.x;
      this.lastPointerY = remaining.y;
      this.velocityX = 0;
      this.velocityY = 0;
    }
    this.needsRender = true;
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keysPressed.add(e.code);
    this.isAnimating = true;
    this.needsRender = true;
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keysPressed.delete(e.code);
  };

  // ---- Cleanup ----

  dispose(): void {
    cancelAnimationFrame(this.animFrameId);
    this.detachEvents();
    const gl = this.gl;
    if (this.texture) gl.deleteTexture(this.texture);
    if (this.nextTexture) gl.deleteTexture(this.nextTexture);
    if (this.vao) gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.program);
  }

  // Force a render (for resize, etc)
  invalidate(): void {
    this.needsRender = true;
  }
}

function isPowerOf2(value: number): boolean {
  return (value & (value - 1)) === 0 && value !== 0;
}

function getTextureSourceSize(source: TexImageSource): { width: number; height: number } {
  if ('videoWidth' in source && 'videoHeight' in source) {
    return { width: source.videoWidth, height: source.videoHeight };
  }
  if ('naturalWidth' in source && 'naturalHeight' in source) {
    return { width: source.naturalWidth, height: source.naturalHeight };
  }
  if ('width' in source && 'height' in source) {
    return { width: source.width, height: source.height };
  }
  return { width: 0, height: 0 };
}

// ============================================================
//  REACT COMPONENT
// ============================================================

const PanoramaViewer: React.FC<PanoramaViewerProps> = ({
  imageUrl,
  hotspots = [],
  onNavigate,
  onLoad,
  onError,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PanoramaEngine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeHotspots, setActiveHotspots] = useState<HotspotState[]>([]);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [compassAngle, setCompassAngle] = useState(0);
  const [currentFov, setCurrentFov] = useState(90);

  // Update hotspot positions periodically
  const updateHotspots = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !hotspots.length) {
      setActiveHotspots([]);
      return;
    }

    const newHotspots: HotspotState[] = hotspots.map((spot) => {
      const proj = engine.projectToScreen(spot.heading, spot.pitch);

      return {
        id: spot.id,
        label: spot.label,
        heading: spot.heading,
        pitch: spot.pitch,
        screenX: proj.x,
        screenY: proj.y,
        visible: proj.visible,
        scale: proj.scale,
      };
    });

    setActiveHotspots(newHotspots);
    setCompassAngle(engine.heading);
    setCurrentFov(engine.hfov);
  }, [hotspots]);

  // Animation loop for hotspot updates
  useEffect(() => {
    let rafId: number;
    const tick = () => {
      updateHotspots();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [updateHotspots]);

  // Initialize engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const engine = new PanoramaEngine(canvas);
      engineRef.current = engine;
    } catch (err: any) {
      setError(err.message || 'WebGL2 не поддерживается');
      onError?.(err.message);
      return;
    }

    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  // Load texture when URL changes
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const tex = await engine.loadTexture(imageUrl);
        if (cancelled) return;

        engine.setTexture(tex);
        engine.invalidate();

        setIsLoading(false);
        onLoad?.();
      } catch (err: any) {
        if (cancelled) return;
        setError(err.message || 'Не удалось загрузить панораму');
        setIsLoading(false);
        onError?.(err.message);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [imageUrl, onLoad, onError]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      engineRef.current?.invalidate();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigate to another panorama
  const handleNavigate = useCallback((hotspotId: string) => {
    if (isTransitioning) return;
    const engine = engineRef.current;
    if (!engine) return;

    setIsTransitioning(true);

    engine.startTransition(
      () => {
        // Midpoint: trigger navigation
        onNavigate?.(hotspotId);
      },
      () => {
        // Complete
        setIsTransitioning(false);
      },
    );
  }, [onNavigate, isTransitioning]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setFov(engine.hfov - 10);
  }, []);

  const handleZoomOut = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setFov(engine.hfov + 10);
  }, []);

  // Fullscreen toggle
  const handleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen?.();
    }
  }, []);

  return (
    <div className="pv-container" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="pv-canvas"
      />

      {/* 3D Hotspots (navigation arrows) */}
      {activeHotspots.map((hs) =>
        hs.visible ? (
          <div
            key={hs.id}
            className={`pv-hotspot ${hoveredHotspot === hs.id ? 'pv-hotspot-hovered' : ''}`}
            style={{
              left: `${hs.screenX}px`,
              top: `${hs.screenY}px`,
              transform: `translate(-50%, -50%) scale(${hs.scale})`,
            }}
            onClick={() => handleNavigate(hs.id)}
            onMouseEnter={() => setHoveredHotspot(hs.id)}
            onMouseLeave={() => setHoveredHotspot(null)}
          >
            <div className="pv-hotspot-arrow">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 14h5v8h6v-8h5L12 2z" fill="white" />
              </svg>
            </div>
            {hoveredHotspot === hs.id && (
              <div className="pv-hotspot-tooltip">
                {hs.label}
              </div>
            )}
          </div>
        ) : null,
      )}

      {/* Controls overlay */}
      <div className="pv-controls">
        {/* Compass */}
        <div className="pv-compass" title="Компас">
          <div
            className="pv-compass-needle"
            style={{ transform: `rotate(${-compassAngle}deg)` }}
          >
            <div className="pv-compass-n">N</div>
            <div className="pv-compass-arrow" />
          </div>
        </div>

        {/* Zoom buttons */}
        <div className="pv-zoom-controls">
          <button className="pv-zoom-btn" onClick={handleZoomIn} title="Приблизить">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <div className="pv-zoom-divider" />
          <button className="pv-zoom-btn" onClick={handleZoomOut} title="Отдалить">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Fullscreen */}
        <button className="pv-fullscreen-btn" onClick={handleFullscreen} title="Полный экран">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
          </svg>
        </button>
      </div>

      {/* FOV indicator */}
      <div className="pv-fov-indicator">
        {Math.round(currentFov)}°
      </div>

      {/* Loading overlay */}
      {isLoading && !error && (
        <div className="pv-loader">
          <div className="pv-loader-spinner" />
          <p className="pv-loader-text">Загрузка панорамы...</p>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="pv-error">
          <p className="pv-error-title">Ошибка загрузки</p>
          <p className="pv-error-text">{error}</p>
        </div>
      )}
    </div>
  );
};

export default PanoramaViewer;
