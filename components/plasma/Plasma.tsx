"use client";

import React, { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Color } from "ogl";

interface PlasmaProps {
  color?: string;
  speed?: number;
  direction?: "forward" | "reverse" | "pingpong";
  scale?: number;
  opacity?: number;
  mouseInteractive?: boolean;
}

const vertex = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uScale;
  uniform vec2 uMouse;

  #define MAX_ITER 60

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float minRes = min(uResolution.x, uResolution.y);
    if (minRes < 1.0) minRes = 1.0;
    vec2 p = (gl_FragCoord.xy * 2.0 - uResolution.xy) / minRes;
    p *= uScale;

    // Apply mouse interaction
    p -= (uMouse * 2.0 - 1.0) * 0.2;

    float t = uTime;
    
    // Fluid generation
    vec2 pos = p;
    float intensity = 0.0;

    for (int i = 0; i < MAX_ITER; i++) {
        float fi = float(i);
        vec2 newPos = pos;
        newPos.x += 0.1 / fi * sin(fi * p.y + t + 0.3 * fi) + 1.0;
        newPos.y += 0.1 / fi * cos(fi * p.x + t + 0.3 * fi) - 1.0;
        pos = newPos;
        intensity += 1.0 / length(vec2(p.x / (sin(pos.x + t) / fi), p.y / (cos(pos.y + t) / fi)));
    }

    intensity = 1.5 - (intensity / float(MAX_ITER));

    // Base color tinting
    vec3 col = uColor * intensity * intensity;
    
    // Add subtle ambient
    col += vec3(0.05, 0.05, 0.08) * (1.0 - intensity);

    gl_FragColor = vec4(col, uOpacity);
  }
`;

export default function Plasma({
  color = "#00d4ff",
  speed = 1.0,
  direction = "forward",
  scale = 1.0,
  opacity = 1.0,
  mouseInteractive = true,
}: PlasmaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Renderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    rendererRef.current = renderer;
    containerRef.current.appendChild(gl.canvas);

    gl.clearColor(0, 0, 0, 0);

    const geometry = new Triangle(gl);
    
    const parsedColor = new Color(color);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Float32Array([0, 0]) },
        uColor: { value: parsedColor },
        uOpacity: { value: opacity },
        uScale: { value: scale },
        uMouse: { value: new Float32Array([0.5, 0.5]) }
      },
      transparent: true
    });

    const mesh = new Mesh(gl, { geometry, program });

    let animationId: number;
    let time = 0;

    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      renderer.setSize(width, height);
      program.uniforms.uResolution.value[0] = width;
      program.uniforms.uResolution.value[1] = height;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    handleResize();

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseInteractive) return;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      program.uniforms.uMouse.value[0] = x;
      program.uniforms.uMouse.value[1] = y;
    };

    if (mouseInteractive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    const update = (t: number) => {
      animationId = requestAnimationFrame(update);
      const dt = 0.01 * speed;
      if (direction === "forward") time += dt;
      else if (direction === "reverse") time -= dt;
      else time += Math.sin(t * 0.001 * speed) * 0.01; // pingpong
      
      program.uniforms.uTime.value = time;
      renderer.render({ scene: mesh });
    };
    
    animationId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      if (mouseInteractive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (containerRef.current && gl.canvas.parentNode === containerRef.current) {
        containerRef.current.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [color, speed, direction, scale, opacity, mouseInteractive]);

  return <div ref={containerRef} className="w-full h-full" />;
}
