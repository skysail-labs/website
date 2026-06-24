"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  SMAAEffect,
  SMAAPreset,
} from "postprocessing";

const DEFAULT_EFFECT_OPTIONS = {
  distortion: "turbulentDistortion",
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [400 * 0.03, 400 * 0.2],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0xc5a059, // Gold
    brokenLines: 0xc5a059, // Gold
    leftCars: [0xc5a059, 0xd6be8b, 0x1d1b28], // Gold/Cobalt
    rightCars: [0x5e4b6c, 0xa37482, 0x111111], // Purple/Slate
    sticks: 0xc5a059, // Gold sticks
  },
};

interface HyperspeedProps {
  effectOptions?: any;
  scrollProgress?: number;
  scrollVelocity?: number;
}

export default function Hyperspeed({
  effectOptions = DEFAULT_EFFECT_OPTIONS,
  scrollProgress = 0,
  scrollVelocity = 0,
}: HyperspeedProps) {
  const hyperspeedRef = useRef<HTMLDivElement>(null);
  const appInstanceRef = useRef<any>(null);
  const progressRef = useRef(scrollProgress);
  const velocityRef = useRef(scrollVelocity);

  // Sync scroll values into refs to read inside loop
  useEffect(() => {
    progressRef.current = scrollProgress;
    velocityRef.current = scrollVelocity;
  }, [scrollProgress, scrollVelocity]);

  useEffect(() => {
    const container = hyperspeedRef.current;
    if (!container) return;

    // Clean up previous scene if any
    if (appInstanceRef.current) {
      appInstanceRef.current.dispose();
      appInstanceRef.current = null;
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    }

    // -------------------------------------------------------------
    // Distortion Formulas
    // -------------------------------------------------------------
    const turbulentUniforms = {
      uFreq: { value: new THREE.Vector4(4, 8, 8, 1) },
      uAmp: { value: new THREE.Vector4(25, 5, 10, 10) },
    };

    const nsin = (val: number) => Math.sin(val) * 0.5 + 0.5;

    const distortions: Record<string, any> = {
      turbulentDistortion: {
        uniforms: turbulentUniforms,
        getDistortion: `
          uniform vec4 uFreq;
          uniform vec4 uAmp;
          float nsin(float val){
            return sin(val) * 0.5 + 0.5;
          }
          #define PI 3.14159265358979
          float getDistortionX(float progress){
            return (
              cos(PI * progress * uFreq.r + uTime) * uAmp.r +
              pow(cos(PI * progress * uFreq.g + uTime * (uFreq.g / uFreq.r)), 2. ) * uAmp.g
            );
          }
          float getDistortionY(float progress){
            return (
              -nsin(PI * progress * uFreq.b + uTime) * uAmp.b +
              -pow(nsin(PI * progress * uFreq.a + uTime / (uFreq.b / uFreq.a)), 5.) * uAmp.a
            );
          }
          vec3 getDistortion(float progress){
            return vec3(
              getDistortionX(progress) - getDistortionX(0.0125),
              getDistortionY(progress) - getDistortionY(0.0125),
              0.
            );
          }
        `,
        getJS: (progress: number, time: number) => {
          const uFreq = turbulentUniforms.uFreq.value;
          const uAmp = turbulentUniforms.uAmp.value;

          const getX = (p: number) =>
            Math.cos(Math.PI * p * uFreq.x + time) * uAmp.x +
            Math.pow(
              Math.cos(Math.PI * p * uFreq.y + time * (uFreq.y / uFreq.x)),
              2
            ) * uAmp.y;

          const getY = (p: number) =>
            -nsin(Math.PI * p * uFreq.z + time) * uAmp.z -
            Math.pow(
              nsin(Math.PI * p * uFreq.w + time / (uFreq.z / uFreq.w)),
              5
            ) * uAmp.w;

          const distortion = new THREE.Vector3(
            getX(progress) - getX(progress + 0.007),
            getY(progress) - getY(progress + 0.007),
            0
          );
          const lookAtAmp = new THREE.Vector3(-2, -5, 0);
          const lookAtOffset = new THREE.Vector3(0, 0, -10);
          return distortion.multiply(lookAtAmp).add(lookAtOffset);
        },
      },
    };

    // Helper functions
    const random = (base: any) => {
      if (Array.isArray(base))
        return Math.random() * (base[1] - base[0]) + base[0];
      return Math.random() * base;
    };

    const pickRandom = (arr: any) => {
      if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)];
      return arr;
    };

    function lerp(
      current: number,
      target: number,
      speed = 0.1,
      limit = 0.001
    ) {
      let change = (target - current) * speed;
      if (Math.abs(change) < limit) {
        change = target - current;
      }
      return change;
    }

    // -------------------------------------------------------------
    // Shaders
    // -------------------------------------------------------------
    const carLightsFragment = `
      #define USE_FOG;
      ${THREE.ShaderChunk["fog_pars_fragment"]}
      varying vec3 vColor;
      varying vec2 vUv; 
      uniform vec2 uFade;
      void main() {
        vec3 color = vec3(vColor);
        float alpha = smoothstep(uFade.x, uFade.y, vUv.x);
        gl_FragColor = vec4(color, alpha);
        if (gl_FragColor.a < 0.0001) discard;
        ${THREE.ShaderChunk["fog_fragment"]}
      }
    `;

    const carLightsVertex = `
      #define USE_FOG;
      ${THREE.ShaderChunk["fog_pars_vertex"]}
      attribute vec3 aOffset;
      attribute vec3 aMetrics;
      attribute vec3 aColor;
      uniform float uTravelLength;
      uniform float uTime;
      varying vec2 vUv; 
      varying vec3 vColor; 
      #include <getDistortion_vertex>
      void main() {
        vec3 transformed = position.xyz;
        float radius = aMetrics.r;
        float myLength = aMetrics.g;
        float speed = aMetrics.b;

        transformed.xy *= radius;
        transformed.z *= myLength;

        transformed.z += myLength - mod(uTime * speed + aOffset.z, uTravelLength);
        transformed.xy += aOffset.xy;

        float progress = abs(transformed.z / uTravelLength);
        transformed.xyz += getDistortion(progress);

        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
        gl_Position = projectionMatrix * mvPosition;
        vUv = uv;
        vColor = aColor;
        ${THREE.ShaderChunk["fog_vertex"]}
      }
    `;

    const sideSticksVertex = `
      #define USE_FOG;
      ${THREE.ShaderChunk["fog_pars_vertex"]}
      attribute float aOffset;
      attribute vec3 aColor;
      attribute vec2 aMetrics;
      uniform float uTravelLength;
      uniform float uTime;
      varying vec3 vColor;
      mat4 rotationY( in float angle ) {
        return mat4(	cos(angle),		0,		sin(angle),	0,
                     0,		1.0,			 0,	0,
                -sin(angle),	0,		cos(angle),	0,
                0, 		0,				0,	1);
      }
      #include <getDistortion_vertex>
      void main(){
        vec3 transformed = position.xyz;
        float width = aMetrics.x;
        float height = aMetrics.y;

        transformed.xy *= vec2(width, height);
        float time = mod(uTime * 60. * 2. + aOffset, uTravelLength);

        transformed = (rotationY(3.14/2.) * vec4(transformed,1.)).xyz;

        transformed.z += - uTravelLength + time;

        float progress = abs(transformed.z / uTravelLength);
        transformed.xyz += getDistortion(progress);

        transformed.y += height / 2.;
        transformed.x += -width / 2.;
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
        gl_Position = projectionMatrix * mvPosition;
        vColor = aColor;
        ${THREE.ShaderChunk["fog_vertex"]}
      }
    `;

    const sideSticksFragment = `
      #define USE_FOG;
      ${THREE.ShaderChunk["fog_pars_fragment"]}
      varying vec3 vColor;
      void main(){
        vec3 color = vec3(vColor);
        gl_FragColor = vec4(color,1.);
        ${THREE.ShaderChunk["fog_fragment"]}
      }
    `;

    const roadBaseFragment = `
      #define USE_FOG;
      varying vec2 vUv; 
      uniform vec3 uColor;
      uniform float uTime;
      #include <roadMarkings_vars>
      ${THREE.ShaderChunk["fog_pars_fragment"]}
      void main() {
        vec2 uv = vUv;
        vec3 color = vec3(uColor);
        #include <roadMarkings_fragment>
        gl_FragColor = vec4(color, 1.);
        ${THREE.ShaderChunk["fog_fragment"]}
      }
    `;

    const islandFragment = roadBaseFragment
      .replace("#include <roadMarkings_fragment>", "")
      .replace("#include <roadMarkings_vars>", "");

    const roadMarkings_vars = `
      uniform float uLanes;
      uniform vec3 uBrokenLinesColor;
      uniform vec3 uShoulderLinesColor;
      uniform float uShoulderLinesWidthPercentage;
      uniform float uBrokenLinesWidthPercentage;
      uniform float uBrokenLinesLengthPercentage;
      highp float random(vec2 co) {
        highp float a = 12.9898;
        highp float b = 78.233;
        highp float c = 43758.5453;
        highp float dt = dot(co.xy, vec2(a, b));
        highp float sn = mod(dt, 3.14);
        return fract(sin(sn) * c);
      }
    `;

    const roadMarkings_fragment = `
      uv.y = mod(uv.y + uTime * 0.05, 1.);
      float laneWidth = 1.0 / uLanes;
      float brokenLineWidth = laneWidth * uBrokenLinesWidthPercentage;
      float laneEmptySpace = 1. - uBrokenLinesLengthPercentage;

      float brokenLines = step(1.0 - brokenLineWidth, fract(uv.x * 2.0)) * step(laneEmptySpace, fract(uv.y * 10.0));
      float sideLines = step(1.0 - brokenLineWidth, fract((uv.x - laneWidth * (uLanes - 1.0)) * 2.0)) + step(brokenLineWidth, uv.x);

      brokenLines = mix(brokenLines, sideLines, uv.x);
    `;

    const roadFragment = roadBaseFragment
      .replace("#include <roadMarkings_fragment>", roadMarkings_fragment)
      .replace("#include <roadMarkings_vars>", roadMarkings_vars);

    const roadVertex = `
      #define USE_FOG;
      uniform float uTime;
      ${THREE.ShaderChunk["fog_pars_vertex"]}
      uniform float uTravelLength;
      varying vec2 vUv; 
      #include <getDistortion_vertex>
      void main() {
        vec3 transformed = position.xyz;
        vec3 distortion = getDistortion((transformed.y + uTravelLength / 2.) / uTravelLength);
        transformed.x += distortion.x;
        transformed.z += distortion.y;
        transformed.y += -1. * distortion.z;  
        
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
        gl_Position = projectionMatrix * mvPosition;
        vUv = uv;
        ${THREE.ShaderChunk["fog_vertex"]}
      }
    `;

    // -------------------------------------------------------------
    // Helper Classes
    // -------------------------------------------------------------
    class CarLights {
      webgl: any;
      options: any;
      colors: any;
      speed: any;
      fade: any;
      mesh!: THREE.Mesh;

      constructor(webgl: any, options: any, colors: any, speed: any, fade: any) {
        this.webgl = webgl;
        this.options = options;
        this.colors = colors;
        this.speed = speed;
        this.fade = fade;
      }

      init() {
        const options = this.options;
        const curve = new THREE.LineCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, -1)
        );
        const geometry = new THREE.TubeGeometry(curve, 40, 1, 8, false);
        const instanced = new THREE.InstancedBufferGeometry().copy(geometry as any);
        instanced.instanceCount = options.lightPairsPerRoadWay * 2;

        const laneWidth = options.roadWidth / options.lanesPerRoad;
        const aOffset = [];
        const aMetrics = [];
        const aColor = [];

        let colorsList = this.colors;
        if (Array.isArray(colorsList)) {
          colorsList = colorsList.map((c: any) => new THREE.Color(c));
        } else {
          colorsList = new THREE.Color(colorsList);
        }

        for (let i = 0; i < options.lightPairsPerRoadWay; i++) {
          const radius = random(options.carLightsRadius);
          const length = random(options.carLightsLength);
          const speed = random(this.speed);

          const carLane = i % options.lanesPerRoad;
          let laneX = carLane * laneWidth - options.roadWidth / 2 + laneWidth / 2;

          const carWidth = random(options.carWidthPercentage) * laneWidth;
          const carShiftX = random(options.carShiftX) * laneWidth;
          laneX += carShiftX;

          const offsetY = random(options.carFloorSeparation) + radius * 1.3;
          const offsetZ = -random(options.length);

          // Left headlight
          aOffset.push(laneX - carWidth / 2);
          aOffset.push(offsetY);
          aOffset.push(offsetZ);

          // Right headlight
          aOffset.push(laneX + carWidth / 2);
          aOffset.push(offsetY);
          aOffset.push(offsetZ);

          aMetrics.push(radius, length, speed);
          aMetrics.push(radius, length, speed);

          const color = pickRandom(colorsList);
          aColor.push(color.r, color.g, color.b);
          aColor.push(color.r, color.g, color.b);
        }

        instanced.setAttribute(
          "aOffset",
          new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 3, false)
        );
        instanced.setAttribute(
          "aMetrics",
          new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 3, false)
        );
        instanced.setAttribute(
          "aColor",
          new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false)
        );

        const material = new THREE.ShaderMaterial({
          fragmentShader: carLightsFragment,
          vertexShader: carLightsVertex,
          transparent: true,
          uniforms: Object.assign(
            {
              uTime: { value: 0 },
              uTravelLength: { value: options.length },
              uFade: { value: this.fade },
            },
            this.webgl.fogUniforms,
            options.distortion.uniforms
          ),
        });

        material.onBeforeCompile = (shader) => {
          shader.vertexShader = shader.vertexShader.replace(
            "#include <getDistortion_vertex>",
            options.distortion.getDistortion
          );
        };

        this.mesh = new THREE.Mesh(instanced, material);
        this.mesh.frustumCulled = false;
        this.webgl.scene.add(this.mesh);
      }

      update(time: number) {
        this.mesh.material.uniforms.uTime.value = time;
      }
    }

    class LightsSticks {
      webgl: any;
      options: any;
      mesh!: THREE.Mesh;

      constructor(webgl: any, options: any) {
        this.webgl = webgl;
        this.options = options;
      }

      init() {
        const options = this.options;
        const geometry = new THREE.PlaneGeometry(1, 1);
        const instanced = new THREE.InstancedBufferGeometry().copy(geometry as any);
        const totalSticks = options.totalSideLightSticks;
        instanced.instanceCount = totalSticks;

        const stickoffset = options.length / (totalSticks - 1);
        const aOffset = [];
        const aColor = [];
        const aMetrics = [];

        let colorsList = options.colors.sticks;
        if (Array.isArray(colorsList)) {
          colorsList = colorsList.map((c: any) => new THREE.Color(c));
        } else {
          colorsList = new THREE.Color(colorsList);
        }

        for (let i = 0; i < totalSticks; i++) {
          const width = random(options.lightStickWidth);
          const height = random(options.lightStickHeight);
          aOffset.push((i - 1) * stickoffset * 2 + stickoffset * Math.random());

          const color = pickRandom(colorsList);
          aColor.push(color.r, color.g, color.b);
          aMetrics.push(width, height);
        }

        instanced.setAttribute(
          "aOffset",
          new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 1, false)
        );
        instanced.setAttribute(
          "aColor",
          new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false)
        );
        instanced.setAttribute(
          "aMetrics",
          new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 2, false)
        );

        const material = new THREE.ShaderMaterial({
          fragmentShader: sideSticksFragment,
          vertexShader: sideSticksVertex,
          side: THREE.DoubleSide,
          uniforms: Object.assign(
            {
              uTravelLength: { value: options.length },
              uTime: { value: 0 },
            },
            this.webgl.fogUniforms,
            options.distortion.uniforms
          ),
        });

        material.onBeforeCompile = (shader) => {
          shader.vertexShader = shader.vertexShader.replace(
            "#include <getDistortion_vertex>",
            options.distortion.getDistortion
          );
        };

        this.mesh = new THREE.Mesh(instanced, material);
        this.mesh.frustumCulled = false;
        this.webgl.scene.add(this.mesh);
      }

      update(time: number) {
        this.mesh.material.uniforms.uTime.value = time;
      }
    }

    class Road {
      webgl: any;
      options: any;
      uTime: { value: number };
      leftRoadWay!: THREE.Mesh;
      rightRoadWay!: THREE.Mesh;
      island!: THREE.Mesh;

      constructor(webgl: any, options: any) {
        this.webgl = webgl;
        this.options = options;
        this.uTime = { value: 0 };
      }

      createPlane(side: number, width: number, isRoad: boolean) {
        const options = this.options;
        const segments = 100;
        const geometry = new THREE.PlaneGeometry(
          isRoad ? options.roadWidth : options.islandWidth,
          options.length,
          20,
          segments
        );
        let uniforms: any = {
          uTravelLength: { value: options.length },
          uColor: {
            value: new THREE.Color(
              isRoad ? options.colors.roadColor : options.colors.islandColor
            ),
          },
          uTime: this.uTime,
        };

        if (isRoad) {
          uniforms = Object.assign(uniforms, {
            uLanes: { value: options.lanesPerRoad },
            uBrokenLinesColor: { value: new THREE.Color(options.colors.brokenLines) },
            uShoulderLinesColor: {
              value: new THREE.Color(options.colors.shoulderLines),
            },
            uShoulderLinesWidthPercentage: {
              value: options.shoulderLinesWidthPercentage,
            },
            uBrokenLinesLengthPercentage: {
              value: options.brokenLinesLengthPercentage,
            },
            uBrokenLinesWidthPercentage: {
              value: options.brokenLinesWidthPercentage,
            },
          });
        }

        const material = new THREE.ShaderMaterial({
          fragmentShader: isRoad ? roadFragment : islandFragment,
          vertexShader: roadVertex,
          side: THREE.DoubleSide,
          uniforms: Object.assign(
            uniforms,
            this.webgl.fogUniforms,
            options.distortion.uniforms
          ),
        });

        material.onBeforeCompile = (shader) => {
          shader.vertexShader = shader.vertexShader.replace(
            "#include <getDistortion_vertex>",
            options.distortion.getDistortion
          );
        };

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.z = -options.length / 2;
        mesh.position.x += (this.options.islandWidth / 2 + options.roadWidth / 2) * side;
        this.webgl.scene.add(mesh);

        return mesh;
      }

      init() {
        this.leftRoadWay = this.createPlane(-1, this.options.roadWidth, true);
        this.rightRoadWay = this.createPlane(1, this.options.roadWidth, true);
        this.island = this.createPlane(0, this.options.islandWidth, false);
      }

      update(time: number) {
        this.uTime.value = time;
      }
    }

    class App {
      options: any;
      container: HTMLDivElement;
      hasValidSize: boolean;
      renderer: THREE.WebGLRenderer;
      composer: EffectComposer;
      camera: THREE.PerspectiveCamera;
      scene: THREE.Scene;
      fogUniforms: any;
      clock: THREE.Clock;
      assets: any;
      disposed: boolean;
      road: Road;
      leftCarLights: CarLights;
      rightCarLights: CarLights;
      leftSticks: LightsSticks;
      fovTarget: number;
      speedUpTarget: number;
      speedUp: number;
      timeOffset: number;
      renderPass!: RenderPass;
      bloomPass!: EffectPass;

      hasValidContext: boolean;

      constructor(container: HTMLDivElement, options: any = {}) {
        this.options = options;
        this.container = container;
        this.hasValidSize = false;

        const initW = Math.max(1, container.offsetWidth);
        const initH = Math.max(1, container.offsetHeight);

        this.renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
        });

        const gl = this.renderer.getContext();
        if (!gl || !this.renderer.capabilities) {
          console.warn("WebGL capabilities not supported or context creation failed.");
          this.hasValidContext = false;
          this.composer = null as any;
          this.camera = null as any;
          this.scene = null as any;
          this.road = null as any;
          this.leftCarLights = null as any;
          this.rightCarLights = null as any;
          this.leftSticks = null as any;
          this.fovTarget = 0;
          this.speedUpTarget = 0;
          this.speedUp = 0;
          this.timeOffset = 0;
          this.tick = () => {};
          this.init = () => {};
          this.setSize = () => {};
          this.onWindowResize = () => {};
          return;
        }
        this.hasValidContext = true;

        this.renderer.setSize(initW, initH, false);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.composer = new EffectComposer(this.renderer);
        container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
          options.fov,
          initW / initH,
          0.1,
          10000
        );
        this.camera.position.z = -5;
        this.camera.position.y = 8;
        this.camera.position.x = 0;
        this.scene = new THREE.Scene();
        this.scene.background = null;

        const fog = new THREE.Fog(
          options.colors.background,
          options.length * 0.2,
          options.length * 500
        );
        this.scene.fog = fog;
        this.fogUniforms = {
          fogColor: { value: fog.color },
          fogNear: { value: fog.near },
          fogFar: { value: fog.far },
        };
        this.clock = new THREE.Clock();
        this.assets = {};
        this.disposed = false;

        this.road = new Road(this, options);
        this.leftCarLights = new CarLights(
          this,
          options,
          options.colors.leftCars,
          options.movingAwaySpeed,
          new THREE.Vector2(0, 1 - options.carLightsFade)
        );
        this.rightCarLights = new CarLights(
          this,
          options,
          options.colors.rightCars,
          options.movingCloserSpeed,
          new THREE.Vector2(1, 0 + options.carLightsFade)
        );
        this.leftSticks = new LightsSticks(this, options);

        this.fovTarget = options.fov;
        this.speedUpTarget = 0.5;
        this.speedUp = 0.5;
        this.timeOffset = 0;

        this.tick = this.tick.bind(this);
        this.init = this.init.bind(this);
        this.setSize = this.setSize.bind(this);

        this.onWindowResize = this.onWindowResize.bind(this);
        window.addEventListener("resize", this.onWindowResize);

        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
          this.hasValidSize = true;
        }
      }

      onWindowResize() {
        if (!this.hasValidContext) return;
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;

        if (width <= 0 || height <= 0) {
          this.hasValidSize = false;
          return;
        }

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.composer.setSize(width, height);
        this.hasValidSize = true;
      }

      initPasses() {
        if (!this.hasValidContext) return;
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.bloomPass = new EffectPass(
          this.camera,
          new BloomEffect({
            luminanceThreshold: 0.2,
            luminanceSmoothing: 0,
            resolutionScale: 0.5,
          })
        );

        const smaaPass = new EffectPass(
          this.camera,
          new SMAAEffect({
            preset: SMAAPreset.MEDIUM,
            searchImage: SMAAEffect.searchImageDataURL,
            areaImage: SMAAEffect.areaImageDataURL,
          })
        );
        this.renderPass.renderToScreen = false;
        this.bloomPass.renderToScreen = false;
        smaaPass.renderToScreen = true;
        this.composer.addPass(this.renderPass);
        this.composer.addPass(this.bloomPass);
        this.composer.addPass(smaaPass);
      }

      loadAssets() {
        if (!this.hasValidContext) return Promise.resolve();
        const assets = this.assets;
        return new Promise<void>((resolve) => {
          const manager = new THREE.LoadingManager(resolve);

          const searchImage = new Image();
          const areaImage = new Image();
          assets.smaa = {};
          searchImage.addEventListener("load", function () {
            assets.smaa.search = this;
            manager.itemEnd("smaa-search");
          });

          areaImage.addEventListener("load", function () {
            assets.smaa.area = this;
            manager.itemEnd("smaa-area");
          });
          manager.itemStart("smaa-search");
          manager.itemStart("smaa-area");

          searchImage.src = SMAAEffect.searchImageDataURL;
          areaImage.src = SMAAEffect.areaImageDataURL;
        });
      }

      init() {
        if (!this.hasValidContext) return;
        this.initPasses();
        const options = this.options;
        this.road.init();
        this.leftCarLights.init();

        this.leftCarLights.mesh.position.setX(
          -options.roadWidth / 2 - options.islandWidth / 2
        );
        this.rightCarLights.init();
        this.rightCarLights.mesh.position.setX(
          options.roadWidth / 2 + options.islandWidth / 2
        );
        this.leftSticks.init();
        this.leftSticks.mesh.position.setX(
          -(options.roadWidth + options.islandWidth / 2)
        );

        this.tick();
      }

      update(delta: number) {
        const lerpPercentage = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);
        
        const scrollProg = progressRef.current;
        const scrollVel = velocityRef.current;

        const targetSpeed = 0.5 + Math.min(6, scrollVel * 16);
        this.speedUpTarget = targetSpeed;
        
        this.speedUp += lerp(this.speedUp, this.speedUpTarget, lerpPercentage, 0.00001);
        this.timeOffset += this.speedUp * delta;

        const time = this.clock.elapsedTime + this.timeOffset;

        this.rightCarLights.update(time);
        this.leftCarLights.update(time);
        this.leftSticks.update(time);
        this.road.update(time);

        let updateCamera = false;
        
        const targetFov = 90 + Math.min(50, scrollVel * 120);
        const fovChange = lerp(this.camera.fov, targetFov, lerpPercentage);
        if (fovChange !== 0) {
          this.camera.fov += fovChange * delta * 6;
          updateCamera = true;
        }

        const targetCamX = (scrollProg - 0.5) * 14;
        const targetCamZ = (scrollProg - 0.5) * -0.3;

        this.camera.position.x += lerp(this.camera.position.x, targetCamX, lerpPercentage);
        this.camera.rotation.z += lerp(this.camera.rotation.z, targetCamZ, lerpPercentage);

        if (this.options.distortion.getJS) {
          const distortion = this.options.distortion.getJS(0.025, time);

          this.camera.lookAt(
            new THREE.Vector3(
              this.camera.position.x + distortion.x,
              this.camera.position.y + distortion.y,
              this.camera.position.z + distortion.z
            )
          );
          updateCamera = true;
        }
        if (updateCamera) {
          this.camera.updateProjectionMatrix();
        }
      }

      render(delta: number) {
        if (!this.hasValidContext) return;
        this.composer.render(delta);
      }

      dispose() {
        this.disposed = true;
        window.removeEventListener("resize", this.onWindowResize);

        if (!this.hasValidContext) return;

        if (this.scene) {
          this.scene.traverse((object: any) => {
            if (!object.isMesh) return;
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((mat) => mat.dispose());
              } else {
                object.material.dispose();
              }
            }
          });
          this.scene.clear();
        }

        if (this.renderer) {
          this.renderer.dispose();
          this.renderer.forceContextLoss();
          if (this.renderer.domElement && this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
          }
        }
        if (this.composer) {
          this.composer.dispose();
        }
      }

      setSize(width: number, height: number, updateStyles: boolean) {
        if (!this.hasValidContext) return;
        if (width <= 0 || height <= 0) {
          this.hasValidSize = false;
          return;
        }
        this.composer.setSize(width, height, updateStyles);
        this.hasValidSize = true;
      }

      tick() {
        if (this.disposed) return;

        if (!this.hasValidSize) {
          const w = this.container.offsetWidth;
          const h = this.container.offsetHeight;
          if (w > 0 && h > 0) {
            this.renderer.setSize(w, h, false);
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.composer.setSize(w, h);
            this.hasValidSize = true;
          } else {
            requestAnimationFrame(this.tick);
            return;
          }
        }

        if (
          resizeRendererToDisplaySize(this.renderer, this.setSize as any)
        ) {
          const canvas = renderer.domElement;
          if (this.hasValidSize) {
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
          }
        }

        if (this.hasValidSize) {
          const delta = this.clock.getDelta();
          this.render(delta);
          this.update(delta);
        }

        requestAnimationFrame(this.tick);
      }
    }

    function resizeRendererToDisplaySize(
      renderer: THREE.WebGLRenderer,
      setSize: (w: number, h: number, updateStyles: boolean) => void
    ) {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width <= 0 || height <= 0) return false;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        setSize(width, height, false);
      }
      return needResize;
    }

    const options = {
      ...DEFAULT_EFFECT_OPTIONS,
      ...effectOptions,
      colors: { ...DEFAULT_EFFECT_OPTIONS.colors, ...effectOptions.colors },
    };
    options.distortion = distortions[options.distortion];

    const myApp = new App(container, options);
    appInstanceRef.current = myApp;
    myApp.loadAssets().then(myApp.init);

    return () => {
      if (appInstanceRef.current) {
        appInstanceRef.current.dispose();
        appInstanceRef.current = null;
      }
    };
  }, [effectOptions]);

  return (
    <div
      ref={hyperspeedRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.75,
      }}
    />
  );
}
