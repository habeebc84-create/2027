/* eslint-disable */
// Delivered by Originkit · stack: nextjs · styling: tailwind
// Set these props to match the Originkit preview:
//   advanced={{"haze":85,"push":3,"seed":1,"drift":3,"grain":0,"stray":9,"hazeLow":"#3A2A6A","shimmer":30,"flakeLav":"#AE89B5","glintArm":34,"topBoost":266,"topDepth":57,"topWidth":89,"vignette":0,"fallSpeed":9,"flakeBlue":"#A0B0FF","flakePink":"#E070D0","flakeSize":4,"flakeWarm":"#E8A080","glintBlue":"#8A8AFF","glintCore":3,"glintHalo":12,"glintLife":450,"glintPink":"#FF7AD0","glintRise":150,"glintWarm":7,"hazeDepth":22,"hazeWidth":86,"warmShare":6,"fallSpread":63,"pushRadius":12,"coreDensity":76,"flakeBright":120,"glintBright":100,"sizeVariance":60}}
"use client";

const addPropertyControls = () => {};

/**
 * GlitterCascade — Recreate the reference exactly. No description was given — read what it is and how it moves from the clip itself.
 *
 * Built on the Background template (lib/templates/BackgroundTemplate.tsx).
 * Only the EFFECT block and the effect controls are specific to this component.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 800
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
import { useEffect, useRef, type CSSProperties } from "react"

// ── moments-kit v1 ──
// Shared by every moments/ component. Canonical copy: moments/kit/moments-kit.v1.ts.
// Edit there, then paste verbatim into each component; moments/checks/kit-sync.mjs enforces it.

type RGBA = [number, number, number, number]

const COLOR_CACHE = new Map<string, RGBA | null>()

function parseColor(input: string | undefined, fallback: RGBA): RGBA {
    if (typeof input !== "string") return fallback
    let hit = COLOR_CACHE.get(input)
    if (hit === undefined) {
        hit = parseColorRaw(input)
        COLOR_CACHE.set(input, hit)
    }
    return hit ?? fallback
}

function parseColorRaw(raw: string): RGBA | null {
    let s = raw.trim()
    const v = /^var\(\s*--[^,]+,\s*(.+)\)$/.exec(s)
    if (v) s = v[1].trim()
    if (s[0] === "#") {
        const h = s.slice(1)
        const x = (a: string) => parseInt(a, 16)
        let r: number, g: number, b: number, a = 255
        if (h.length === 3 || h.length === 4) {
            r = x(h[0] + h[0]); g = x(h[1] + h[1]); b = x(h[2] + h[2])
            if (h.length === 4) a = x(h[3] + h[3])
        } else if (h.length === 6 || h.length === 8) {
            r = x(h.slice(0, 2)); g = x(h.slice(2, 4)); b = x(h.slice(4, 6))
            if (h.length === 8) a = x(h.slice(6, 8))
        } else return null
        const out: RGBA = [r / 255, g / 255, b / 255, a / 255]
        return out.every(Number.isFinite) ? out : null
    }
    const m = /^(rgba?|hsla?)\(([^)]*)\)$/i.exec(s)
    if (!m) return null
    const parts = m[2].split(/[\s,/]+/).filter(Boolean)
    if (parts.length < 3) return null
    const num = (p: string, scale: number) =>
        p.endsWith("%") ? (parseFloat(p) / 100) * scale : parseFloat(p)
    const alpha = parts.length > 3 ? num(parts[3], 1) : 1
    let rgb: [number, number, number]
    if (m[1].toLowerCase().startsWith("rgb")) {
        rgb = [num(parts[0], 255) / 255, num(parts[1], 255) / 255, num(parts[2], 255) / 255]
    } else {
        const hh = (((parseFloat(parts[0]) % 360) + 360) % 360) / 360
        const ss = num(parts[1], 1), ll = num(parts[2], 1)
        const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss
        const p = 2 * ll - q
        const f = (t: number) => {
            t = (t + 1) % 1
            if (t < 1 / 6) return p + (q - p) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
            return p
        }
        rgb = [f(hh + 1 / 3), f(hh), f(hh - 1 / 3)]
    }
    const out: RGBA = [rgb[0], rgb[1], rgb[2], alpha]
    return out.every(Number.isFinite) ? out.map((c) => Math.min(1, Math.max(0, c))) as RGBA : null
}

function cssRgba(c: RGBA): string {
    return `rgba(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}, ${c[3]})`
}

interface FramerFont {
    fontFamily?: string
    fontWeight?: number | string
    fontStyle?: string
    fontSize?: number | string
    lineHeight?: number | string
    letterSpacing?: number | string
}

const FALLBACK_FAMILY = "Inter, system-ui, sans-serif"

function quoteFamily(family: string): string {
    return family
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean)
        .map((n) => (n[0] === "'" || n[0] === '"' || /^[a-z-]+$/i.test(n) ? n : `"${n.replace(/"/g, '\\"')}"`))
        .join(", ")
}

function fontShorthand(font: FramerFont | undefined, fallbackSize: number, fallbackWeight: number) {
    const f = font || {}
    let size = fallbackSize
    if (typeof f.fontSize === "number" && Number.isFinite(f.fontSize)) size = f.fontSize
    else if (typeof f.fontSize === "string") {
        const n = parseFloat(f.fontSize)
        if (Number.isFinite(n)) size = f.fontSize.includes("rem") ? n * 16 : n
    }
    let lineHeight = size * 1.3
    if (typeof f.lineHeight === "number" && Number.isFinite(f.lineHeight))
        lineHeight = f.lineHeight <= 4 ? f.lineHeight * size : f.lineHeight
    else if (typeof f.lineHeight === "string") {
        const n = parseFloat(f.lineHeight)
        if (Number.isFinite(n))
            lineHeight = f.lineHeight.endsWith("%") ? (n / 100) * size : f.lineHeight.endsWith("em") ? n * size : n <= 4 ? n * size : n
    }
    const family = f.fontFamily ? quoteFamily(f.fontFamily) : FALLBACK_FAMILY
    const shorthand = `${f.fontStyle || "normal"} ${f.fontWeight || fallbackWeight} ${size}px ${family}`
    return { shorthand, size, lineHeight }
}

function wrapLines(measure: (s: string) => number, text: string, maxWidth: number): string[] {
    const out: string[] = []
    for (const para of String(text ?? "").split("\n")) {
        const words = para.split(/ +/)
        let line = ""
        for (const w of words) {
            const next = line ? `${line} ${w}` : w
            if (line && measure(next) > maxWidth) {
                out.push(line)
                line = w
            } else line = next
        }
        out.push(line)
    }
    return out
}

function radiusPx(w: number, h: number, pct: number): number {
    return (Math.min(w, h) / 2) * Math.min(1, Math.max(0, pct / 100))
}

type Phase = "idle" | "playing" | "held" | "restoring"
interface TriggerState { phase: Phase; t: number; timer: number; prevPlay: boolean | undefined }
interface TriggerInput {
    dt: number; animDt: number; playDur: number; restoreDur: number; holdS: number
    play: boolean | undefined; clicked: boolean; onCanvas: boolean
}
interface TriggerEvents { started: boolean; completed: boolean; restored: boolean }

const TRIGGER_IDLE: TriggerState = { phase: "idle", t: 0, timer: 0, prevPlay: undefined }
const CANVAS_IDLE_S = 1
// R3 ruling: compare with epsilon everywhere a float accumulator (dt/animDt
// summed frame by frame) is checked against a duration boundary — repeated
// 0.1 additions land on 0.9999999999999999, not 1, so a strict >= misses the
// transition for exactly one extra frame and the reducer's own tests (which
// assert phase after an exact frame count) go red on that alone.
const EPS = 1e-9

// I2 ruling: controlled mode (play !== undefined) reacts to the play LEVEL
// each step, not an edge against prevPlay — an uncontrolled run (play was
// undefined, so prevPlay never became true) that switches straight to
// play:false must still interrupt on that very frame. prevPlay stays on the
// state shape (set below every step) but is no longer read for a decision.
// I1 ruling: only the two *interrupt* transitions — playing→restoring and
// restoring→playing — mirror progress (t = 1 - s.t) so a controlled toggle
// keeps the visual position continuous. held→restoring and idle→playing are
// normal starts and still begin at t = 0.
function stepTrigger(s: TriggerState, i: TriggerInput): { s: TriggerState; e: TriggerEvents } {
    const e: TriggerEvents = { started: false, completed: false, restored: false }
    const n: TriggerState = { ...s, prevPlay: i.play }
    const controlled = i.play !== undefined
    const start = (t = 0) => { n.phase = "playing"; n.t = t; n.timer = 0; e.started = true }
    const restore = (t = 0) => { n.phase = "restoring"; n.t = t; n.timer = 0 }

    switch (s.phase) {
        case "idle":
            n.timer = s.timer + i.dt
            if (controlled ? i.play === true : i.clicked || (i.onCanvas && n.timer >= CANVAS_IDLE_S - EPS)) start()
            break
        case "playing":
            if (controlled && i.play === false) { restore(1 - s.t); break }
            n.t = Math.min(1, s.t + i.animDt / Math.max(1e-3, i.playDur))
            if (n.t >= 1 - EPS) { n.t = 1; n.phase = "held"; n.timer = 0; e.completed = true }
            break
        case "held":
            if (controlled) { if (i.play === false) restore(0); break }
            n.timer = s.timer + i.dt
            if (n.timer >= i.holdS - EPS) restore(0)
            break
        case "restoring":
            if (controlled && i.play === true) { start(1 - s.t); break }
            n.t = Math.min(1, s.t + i.animDt / Math.max(1e-3, i.restoreDur))
            if (n.t >= 1 - EPS) { n.phase = "idle"; n.t = 0; n.timer = 0; e.restored = true }
            break
    }
    return { s: n, e }
}

interface CardSpec {
    w: number; h: number; dpr: number; fill: string; rounded: number
    title: string; body: string; font: FramerFont | undefined; textColor: string
    image: HTMLImageElement | null; pad: number
}
interface GlyphBox { ch: string; x: number; y: number; w: number; h: number }

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
}

/** Paints the card into ctx (canvas already sized w*dpr × h*dpr). Returns glyph boxes in CSS px when asked. */
function drawCard(ctx: CanvasRenderingContext2D, spec: CardSpec, wantGlyphs: boolean): GlyphBox[] {
    const { w, h, dpr, pad } = spec
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    const r = radiusPx(w, h, spec.rounded)
    roundRectPath(ctx, 0, 0, w, h, r)
    ctx.fillStyle = cssRgba(parseColor(spec.fill, [1, 1, 1, 1]))
    ctx.fill()
    ctx.save()
    roundRectPath(ctx, 0, 0, w, h, r)
    ctx.clip()
    let y = pad
    if (spec.image && spec.image.naturalWidth > 0) {
        const ih = Math.round(h * 0.5)
        const s = Math.max(w / spec.image.naturalWidth, ih / spec.image.naturalHeight)
        const dw = spec.image.naturalWidth * s, dh = spec.image.naturalHeight * s
        ctx.save()
        ctx.beginPath(); ctx.rect(0, 0, w, ih); ctx.clip()
        ctx.drawImage(spec.image, (w - dw) / 2, (ih - dh) / 2, dw, dh)
        ctx.restore()
        y = ih + pad
    }
    const glyphs: GlyphBox[] = []
    const color = cssRgba(parseColor(spec.textColor, [0, 0, 0, 1]))
    const title = fontShorthand(spec.font, 22, 700)
    const body = fontShorthand(spec.font ? { ...spec.font, fontSize: title.size * 0.68, fontWeight: 400 } : undefined, 15, 400)
    const block = (text: string, f: { shorthand: string; size: number; lineHeight: number }) => {
        if (!text) return
        ctx.font = f.shorthand
        ctx.fillStyle = color
        ctx.textBaseline = "top"
        ctx.textAlign = "left"
        for (const line of wrapLines((s) => ctx.measureText(s).width, text, w - pad * 2)) {
            if (y + f.size > h - pad * 0.5) break
            ctx.fillText(line, pad, y)
            if (wantGlyphs) {
                // Prefix measures, so kerning between neighbours is respected.
                let prefix = ""
                for (const ch of line) {
                    const x = pad + ctx.measureText(prefix).width
                    const cw = pad + ctx.measureText(prefix + ch).width - x
                    if (ch.trim()) glyphs.push({ ch, x, y, w: cw, h: f.lineHeight })
                    prefix += ch
                }
            }
            y += f.lineHeight
        }
        y += f.size * 0.4
    }
    block(spec.title, title)
    block(spec.body, body)
    ctx.restore()
    return glyphs
}

function loadImage(src: string | undefined): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
        if (!src || typeof Image === "undefined") return resolve(null)
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
        img.src = src
    })
}

function createProgram<U extends string>(gl: WebGL2RenderingContext, vs: string, fs: string, uniforms: readonly U[]) {
    const sh = (type: number, src: string) => {
        const s = gl.createShader(type)!
        gl.shaderSource(s, src)
        gl.compileShader(s)
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            const log = gl.getShaderInfoLog(s) || "shader compile failed"
            gl.deleteShader(s)
            throw new Error(log)
        }
        return s
    }
    const program = gl.createProgram()!
    const vsh = sh(gl.VERTEX_SHADER, vs)
    const fsh = sh(gl.FRAGMENT_SHADER, fs)
    gl.attachShader(program, vsh)
    gl.attachShader(program, fsh)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(program) || "link failed"
        gl.deleteShader(vsh)
        gl.deleteShader(fsh)
        gl.deleteProgram(program)
        throw new Error(log)
    }
    // Shaders are flagged for deletion once linked; the GL driver frees them
    // for real after they're detached, which happens when the program itself
    // is eventually deleted. No reason to keep the compile units around.
    gl.deleteShader(vsh)
    gl.deleteShader(fsh)
    const u = {} as Record<U, WebGLUniformLocation>
    for (const name of uniforms) {
        const loc = gl.getUniformLocation(program, name)
        if (!loc) {
            gl.deleteProgram(program)
            throw new Error(`uniform ${name} not found`)
        }
        u[name] = loc
    }
    return { program, u }
}
// ── /moments-kit ──

// ══ EFFECT — replace from here ══════════════════════════════════════════════

/** Tuning values. Stripped at publish; the tuned values are baked in here. */
const ADVANCED_DEFAULTS = {
    fallSpeed: 9,
    fallSpread: 63,
    drift: 3,
    topWidth: 89,
    coreDensity: 76,
    topBoost: 266,
    topDepth: 57,
    stray: 9,
    flakeSize: 4,
    sizeVariance: 60,
    flakeBright: 120,
    shimmer: 30,
    warmShare: 6,
    glintLife: 450,
    glintRise: 150,
    glintArm: 34,
    glintCore: 3,
    glintHalo: 12,
    glintBright: 100,
    glintWarm: 7,
    haze: 85,
    hazeWidth: 86,
    hazeDepth: 22,
    hazeLow: "#3A2A6A",
    flakeLav: "#AE89B5",
    flakePink: "#E070D0",
    flakeBlue: "#A0B0FF",
    flakeWarm: "#E8A080",
    glintPink: "#FF7AD0",
    glintBlue: "#8A8AFF",
    pushRadius: 12,
    seed: 1,
    hover: 66,
    grain: 0,
    vignette: 0,
}

// ── moved controls (builder) ──
/**
 * Controls moved in the builder: into Advanced, out of it, or into groups of
 * their own. The code reads each one where it was first written, so the props
 * are put back in that shape before anything reads them.
 */
const MOVED_CONTROLS: { into: Record<string, string>; out: Record<string, string> } = {"into":{},"out":{"hover":"advanced"}}
const GROUP_FALLBACKS: Record<string, any> = { advanced: ADVANCED_DEFAULTS }
function withMovedControls(props: any): any {
    const out = { ...props }
    for (const [k, g] of Object.entries(MOVED_CONTROLS.into)) out[k] = props?.[g]?.[k] ?? GROUP_FALLBACKS[g]?.[k]
    for (const [k, g] of Object.entries(MOVED_CONTROLS.out)) {
        if (out[k] !== undefined) out[g] = { ...(out[g] ?? {}), [k]: out[k] }
    }
    return out
}
// ── /moved controls ──

/** Effect-only props (≤ 3). Add matching rows at the end of addPropertyControls. */
interface EffectProps {
    direction?: "down" | "up" | "right" | "left"
    density?: number
    spread?: number
    glints?: number
    advanced?: Partial<typeof ADVANCED_DEFAULTS>
}

/** Extra uniforms for this effect. Uploaded only when props change, not every frame. */
function effectUniforms(gl: WebGL2RenderingContext, u: (name: string) => WebGLUniformLocation | null, p: Props): void {
    const adv = { ...ADVANCED_DEFAULTS, ...(p.advanced ?? {}) }
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
    const f = (name: string, v: number) => gl.uniform1f(u(name), v)
    const c3 = (name: string, v: string | undefined, fb: RGBA) => {
        const c = parseColor(v, fb)
        gl.uniform3f(u(name), c[0], c[1], c[2])
    }
    f("uDensity", clamp(num(p.density, 700), 100, 1500) / 700)
    f("uWBot", (clamp(num(p.spread, 70), 20, 150) / 100) * 0.25)
    f("uGlintRate", clamp(num(p.glints, 20), 0, 60))
    f("uHoverAmt", clamp(num(adv.hover, 50), 0, 100) / 50)
    f("uFall", Math.max(0.2, num(adv.fallSpeed, 7)) / 100)
    f("uFallSpread", clamp(num(adv.fallSpread, 50), 0, 90) / 100)
    f("uDrift", num(adv.drift, 2) / 1000)
    f("uWTop", Math.max(5, num(adv.topWidth, 70)) / 1000)
    f("uCoreDen", clamp(num(adv.coreDensity, 42), 0, 100) / 100)
    f("uTopBoost", Math.max(0, num(adv.topBoost, 150)) / 100)
    f("uTopDepth", Math.max(1, num(adv.topDepth, 30)) / 100)
    f("uStray", clamp(num(adv.stray, 3), 0, 100) / 100)
    f("uFlakeR", Math.max(0.5, num(adv.flakeSize, 3)) / 1600)
    f("uSizeVar", clamp(num(adv.sizeVariance, 60), 0, 200) / 100)
    f("uFlakeBright", Math.max(0, num(adv.flakeBright, 100)) / 100)
    f("uShimmer", clamp(num(adv.shimmer, 30), 0, 100) / 100)
    f("uWarmShare", clamp(num(adv.warmShare, 1), 0, 100) / 100)
    f("uGlintLife", Math.max(50, num(adv.glintLife, 450)) / 1000)
    f("uGlintRise", Math.max(10, num(adv.glintRise, 150)) / 1000)
    f("uGlintArm", Math.max(1, num(adv.glintArm, 34)) / 1000)
    f("uGlintCore", Math.max(0.5, num(adv.glintCore, 3)) / 1000)
    f("uGlintHalo", Math.max(0.5, num(adv.glintHalo, 9)) / 1000)
    f("uGlintBright", Math.max(0, num(adv.glintBright, 100)) / 100)
    f("uGlintWarm", clamp(num(adv.glintWarm, 7), 0, 100) / 100)
    f("uHaze", Math.max(0, num(adv.haze, 85)) / 100)
    f("uHazeW", Math.max(5, num(adv.hazeWidth, 50)) / 1000)
    f("uHazeDepth", Math.max(1, num(adv.hazeDepth, 22)) / 100)
    c3("uHazeLow", adv.hazeLow, [0.23, 0.16, 0.42, 1])
    c3("uLav", adv.flakeLav, [0.68, 0.54, 0.71, 1])
    c3("uPink", adv.flakePink, [0.88, 0.44, 0.82, 1])
    c3("uBlue", adv.flakeBlue, [0.63, 0.69, 1, 1])
    c3("uWarm", adv.flakeWarm, [0.91, 0.63, 0.5, 1])
    c3("uGPink", adv.glintPink, [1, 0.48, 0.82, 1])
    c3("uGBlue", adv.glintBlue, [0.54, 0.54, 1, 1])
    f("uPushR", Math.max(1, num(adv.pushRadius, 12)) / 100)

    f("uSeed", Math.round(clamp(num(adv.seed, 1), 0, 999)))
    f("uGrain", clamp(num(adv.grain, 0), 0, 100) / 100)
    f("uVignette", clamp(num(adv.vignette, 0), 0, 100) / 100)
}

/* Falling glitter cone: 4 parallax layers of flakes in a cone-normalised falling grid,
   a sparse glint grid of 4-point star flares, and a soft purple haze at the top centre.

   Drawn in passes. The original was one fullscreen shader in which every pixel
   hashed 4 layers × 3×3 flake cells plus 3×3 glint cells: 68 ms a frame at 2×
   on an integrated GPU (~12 fps, and worse once the laptop heats and throttles,
   which is the "lags after some time"). Here the haze is a cheap fullscreen
   pass, and each flake and glint is its own small quad, placed in the vertex
   shader from its grid cell with the original hash, so a flake only shades the
   handful of pixels it covers. The per-pixel maths inside each quad is the
   original's, line for line, and the sums blend additively, so the picture is
   the same. */
const GLSL_COMMON = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform vec3 uBg;
uniform vec3 uBase;
uniform vec3 uAccent;
uniform float uScale;
uniform float uDensity, uWTop, uWBot, uGlintRate, uHoverAmt;
uniform float uFall, uFallSpread, uDrift, uCoreDen, uTopBoost, uTopDepth, uStray;
uniform float uFlakeR, uSizeVar, uFlakeBright, uShimmer, uWarmShare;
uniform float uGlintLife, uGlintRise, uGlintArm, uGlintCore, uGlintHalo, uGlintBright, uGlintWarm;
uniform float uHaze, uHazeW, uHazeDepth;
uniform vec3 uHazeLow, uLav, uPink, uBlue, uWarm, uGPink, uGBlue;
uniform float uPushR, uPush, uSeed, uGrain, uVignette;
// How far each flake layer / the glint grid has fallen, and the glint cycle
// phase. Accumulated on the CPU in float64 and wrapped (see wrapRow), where the
// original computed uTime * v in the shader: uTime grew without bound, float32
// lost precision on it, and it snapped back at 3600 s.
uniform vec4 uScroll;
uniform float uGScroll, uGPhase;
// Direction: scene = D·f + O, f in height units from the frame's top centre
// (x right, y down). D is row-major and orthonormal, so its inverse is its transpose.
uniform vec4 uDir;
uniform vec2 uDirO;

const int OFS = 1048576;

uvec3 pcg3(uvec3 v) {
    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
    v ^= v >> 16u;
    v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
    return v;
}
vec3 rnd3(ivec3 c) { return vec3(pcg3(uvec3(c))) * (1.0 / 4294967295.0); }

float wAt(float y) { return max(mix(uWTop, uWBot, clamp(y, 0.0, 3.0)), 1e-3); }

// Rows are hashed modulo 4096, so a fall offset wrapped by exactly 4096 rows on
// the CPU lands on the very same flakes: the offsets stay small and float32-exact
// however long the page stays open. Rows -2048..2047 hash exactly as before, so
// the layout is unchanged.
int wrapRow(int y) { return ((y + 2048) & 4095) - 2048; }

// Frame pixel <-> scene point, exactly as the original's main() mapped them.
float sceneScale() { return max(uScale, 0.05); }
vec2 dirFwd(vec2 f) { return vec2(uDir.x * f.x + uDir.y * f.y, uDir.z * f.x + uDir.w * f.y) + uDirO; }
vec2 dirInv(vec2 q) { q -= uDirO; return vec2(uDir.x * q.x + uDir.z * q.y, uDir.y * q.x + uDir.w * q.y); }
vec2 toScene(vec2 fc) {
    float Hp = max(uRes.y, 1.0);
    return dirFwd(vec2((fc.x - 0.5 * uRes.x) / Hp, (uRes.y - fc.y) / Hp)) / sceneScale();
}
vec2 toFrag(vec2 p) {
    float Hp = max(uRes.y, 1.0);
    vec2 f = dirInv(p * sceneScale()) * Hp;
    return vec2(f.x + 0.5 * uRes.x, uRes.y - f.y);
}
float pxSize() { return 1.0 / (max(uRes.y, 1.0) * sceneScale()); }
vec2 mouseScene() {
    float Hp = max(uRes.y, 1.0);
    return dirFwd(vec2((uMouse.x - 0.5) * uRes.x / Hp, 1.0 - uMouse.y)) / sceneScale();
}
float vignette(vec2 fc) {
    if (uVignette <= 0.0) return 1.0;
    float Hp = max(uRes.y, 1.0);
    vec2 vc = (fc / uRes - 0.5) * vec2(uRes.x / Hp, 1.0);
    return 1.0 - uVignette * smoothstep(0.35, 1.0, length(vc) * 1.1);
}

// Pointer reach. Items stay exactly where they are and keep their size (no push,
// no lens stretch: P = X, J = 1, K = 0); near is how close the pointer is, 0..hv.
void pushed(vec2 X, out vec2 P, out float J, out float K, out float near) {
    float hv = uHover * uHoverAmt;
    P = X; J = 1.0; K = 0.0; near = 0.0;
    if (hv <= 0.0) return;
    vec2 d = X - mouseScene();
    near = hv * exp(-dot(d, d) / max(uPushR * uPushR, 1e-5));
}

// Places one corner of a quad of half-size (hx, hy) around scene point P.
vec4 corner(vec2 P, float hx, float hy, int k) {
    vec2 c = vec2((k == 1 || k == 4 || k == 5) ? 1.0 : -1.0, (k == 2 || k == 3 || k == 5) ? 1.0 : -1.0);
    vec2 fc = toFrag(P + c * vec2(hx, hy));
    return vec4(fc / max(uRes, vec2(1.0)) * 2.0 - 1.0, 0.0, 1.0);
}
`

/** Fullscreen triangle with no buffer. */
const VERT_FULL = `#version 300 es
void main() {
    vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
    gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

/** Ground: background, haze and the pointer's accent wash, under the vignette. */
const FRAG_BASE = GLSL_COMMON + `
out vec4 outColor;

vec3 haze(vec2 p, float t) {
    float y = max(p.y, 0.0);
    float sig = uHazeW * (1.0 - 0.25 * clamp(y, 0.0, 1.0));
    float ix = exp(-p.x * p.x / max(2.0 * sig * sig, 1e-6));
    float iy = exp(-y / max(uHazeDepth, 1e-3));
    float trail = exp(-y / max(uHazeDepth * 2.2, 1e-3)) * 0.18;
    vec3 c = mix(uBase, uHazeLow, smoothstep(0.05, 0.5, y));
    float breathe = 1.0 + 0.07 * sin(t * 0.9) + 0.03 * sin(t * 2.3 + 1.0);
    vec3 col = c * ix * (iy + trail) * breathe;
    float sc = sig * 0.6;
    col += mix(uLav, uAccent, 0.3) * exp(-p.x * p.x / max(2.0 * sc * sc, 1e-6)) * exp(-y / 0.035) * 0.35;
    return col * uHaze;
}

void main() {
    vec2 fc = gl_FragCoord.xy;
    vec2 p = toScene(fc);
    vec2 dm = p - mouseScene();
    float near = uHover * uHoverAmt * exp(-dot(dm, dm) / max(uPushR * uPushR, 1e-5));
    vec3 col = uBg + haze(p, uTime) + uAccent * near * 0.04;
    outColor = vec4(clamp(col * vignette(fc), 0.0, 1.0), 1.0);
}`

/** One flake per cell. aRow = (layer, cell row, first cell column, column count). */
const VERT_FLAKE = GLSL_COMMON + `
layout(location = 0) in ivec4 aRow;
flat out vec4 vPush;  // P.xy, J, K
flat out vec4 vShape; // rr, reach, cos(an), sin(an)
flat out vec2 vWarp;  // e.y stretch, wobble phase
flat out vec3 vCol;

void main() {
    int col = gl_VertexID / 6;
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    if (col >= aRow.w) return;
    const float cu = 0.16;
    const float cy = 0.03;
    int sd = int(uSeed) * 131;
    int L = aRow.x;
    ivec2 c = ivec2(aRow.z + col, aRow.y);
    float fl = float(L);
    float v = max(uFall * (1.0 + (fl - 1.5) / 1.5 * uFallSpread), 1e-3);
    float sz = 0.75 + 0.2 * fl;
    float lb = 0.6 + 0.14 * fl;
    vec2 sh = vec2(fl * 0.37, fl * 0.61);
    int wy = wrapRow(c.y);
    vec3 r = rnd3(ivec3(c.x + OFS, wy + OFS, L * 7919 + sd));
    float u0 = (float(c.x) + 0.15 + 0.7 * r.x - sh.x) * cu;
    float yy0 = (float(c.y) + 0.15 + 0.7 * r.y - sh.y) * cy;
    float y0 = yy0 + uScroll[L];
    float top = 1.0 - smoothstep(0.0, uTopDepth, y0);
    float ex = uCoreDen * exp(-1.2 * u0 * u0) * (1.0 + uTopBoost * top)
             + uStray * exp(-max(abs(u0) - 1.5, 0.0));
    ex *= uDensity;
    if (r.z > ex) return;
    float x0 = u0 * wAt(y0) - uDrift * y0 / v;
    float px = pxSize();
    vec3 r2 = rnd3(ivec3(wy + OFS, c.x + OFS, L * 7919 + 4099 + sd));
    float rad = uFlakeR * sz * mix(1.0 - uSizeVar * 0.4, 1.0 + uSizeVar, r2.x * r2.x) * (1.0 + 0.4 * top);
    float rr = max(rad, 0.6 * px);
    float reach = rr * 1.8 + 2.0 * px;
    float an = r2.y * 6.2832;
    vec3 r3 = rnd3(ivec3(c.x + OFS, wy + OFS, L * 7919 + 8191 + sd));
    float k = r3.x;
    vec3 colr;
    if (k < 0.38) colr = uAccent;
    else if (k < 0.58) colr = uLav;
    else if (k < 0.70) colr = uPink;
    else if (k < 0.80) colr = mix(uBase, uLav, 0.5);
    else if (k < 0.90) colr = uBlue;
    else if (k < 1.0 - uWarmShare) colr = uBase * 1.4;
    else colr = uWarm;
    float bright = mix(0.3, 1.0, r3.y) * lb * uFlakeBright;
    float sm = (1.0 + uShimmer * sin(uTime * (10.0 + 20.0 * r3.z) + r3.x * 40.0)) / (1.0 + uShimmer);
    vec2 P; float J; float K; float near;
    pushed(vec2(x0, y0), P, J, K, near);
    // Near the pointer each flake blinks on its own fast beat: dim most of the
    // time, flashing bright at the peak. Same flake, same place, same size.
    float tw = 0.5 + 0.5 * sin(uTime * (14.0 + 26.0 * r3.z) + r3.y * 50.0);
    float blink = tw * tw * tw * tw;
    vCol = colr * bright * sm * mix(1.0, 0.3 + 3.4 * blink, clamp(near, 0.0, 1.0));
    vPush = vec4(P, J, K);
    vShape = vec4(rr, reach, cos(an), sin(an));
    vWarp = vec2(1.0 + 0.6 * r2.z, r.x * 20.0);
    // Lit only where dd < rr + px, and dd >= 0.82·|d| (the wobble's low point; the
    // stretch only grows |e|), so nothing beyond that radius can show.
    float lit = min(reach, (rr + px) / 0.82) + px;
    gl_Position = corner(P, lit * (1.0 + abs(K)) / max(J, 0.3), lit, gl_VertexID - col * 6);
}`

const FRAG_FLAKE = GLSL_COMMON + `
flat in vec4 vPush;
flat in vec4 vShape;
flat in vec2 vWarp;
flat in vec3 vCol;
out vec4 outColor;

void main() {
    vec2 fc = gl_FragCoord.xy;
    float px = pxSize();
    vec2 dp = toScene(fc) - vPush.xy;
    vec2 d = vec2(dp.x * vPush.z + dp.y * vPush.w, dp.y);
    float rr = vShape.x;
    float reach = vShape.y;
    if (dot(d, d) > reach * reach) discard;
    vec2 e = mat2(vShape.z, vShape.w, -vShape.w, vShape.z) * d;
    e.y *= vWarp.x;
    float ang = atan(e.y, e.x);
    float dd = length(e) * (1.0 + 0.18 * sin(3.0 * ang + vWarp.y));
    float a = 1.0 - smoothstep(rr - 0.5 * px, rr + px, dd);
    if (a <= 0.0) discard;
    outColor = vec4(vCol * a * vignette(fc), 0.0);
}`

/** One glint per cell, same row table shape as the flakes (layer unused). */
const VERT_GLINT = GLSL_COMMON + `
layout(location = 0) in ivec4 aRow;
flat out vec4 vPush;  // P.xy, J, K
flat out vec4 vShape; // Lr, bound, bright * env
flat out vec3 vTint;

void main() {
    int col = gl_VertexID / 6;
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    if (col >= aRow.w || uGlintRate <= 0.0) return;
    const float cu = 0.55;
    const float cy = 0.11;
    int sd = int(uSeed) * 131;
    float v = max(uFall, 1e-3);
    float P = 35.0 / max(uGlintRate, 0.5);
    ivec2 c = ivec2(aRow.z + col, aRow.y);
    int wy = wrapRow(c.y);
    vec3 r = rnd3(ivec3(c.x + OFS, wy + OFS, 991 + sd));
    float ph = uGPhase + r.y;
    float k = floor(ph);
    int kk = int(k) & 4095;
    float lt = fract(ph) * P;
    vec3 q = rnd3(ivec3(c.x + OFS, wy + OFS, kk * 3 + 77777 + sd));
    float life = uGlintLife * mix(0.67, 1.33, q.z);
    if (lt > life) return;
    float u0 = (float(c.x) + 0.1 + 0.8 * q.x) * cu;
    float yy0 = (float(c.y) + 0.1 + 0.8 * q.y) * cy;
    float y0 = yy0 + uGScroll;
    float x0 = u0 * wAt(y0) - uDrift * y0 / v;
    float act = exp(-0.45 * u0 * u0) * mix(0.5, 1.0, smoothstep(0.3, 1.0, abs(u0)));
    if (r.x > act) return;
    float px = pxSize();
    vec3 q2 = rnd3(ivec3(wy + OFS, c.x + OFS, kk * 3 + 33331 + sd));
    float rise = min(uGlintRise, life * 0.6);
    float env = lt < rise ? smoothstep(0.0, 1.0, lt / rise)
                          : pow(max(0.0, 1.0 - (lt - rise) / max(life - rise, 1e-3)), 2.0);
    float Lr = uGlintArm * 0.5 * (0.8 + 0.2 * env) * mix(0.75, 1.2, q2.x);
    float bound = max(Lr, uGlintHalo * 3.0) + 2.0 * px;
    vec3 tint;
    if (q2.y < uGlintWarm) tint = mix(uWarm, vec3(1.0, 0.45, 0.25), 0.5);
    else if (q2.y < 0.4) tint = uGBlue;
    else if (q2.y < 0.7) tint = uGPink;
    else tint = mix(uAccent, vec3(0.78, 0.72, 1.0), 0.5);
    vec2 Pp; float J; float K; float near;
    pushed(vec2(x0, y0), Pp, J, K, near);
    // A glint already lit near the pointer flickers fast instead of glowing steadily.
    float gb = 0.5 + 0.5 * sin(uTime * 40.0 + q2.x * 30.0);
    float bright = mix(0.65, 1.0, q2.z) * uGlintBright * env * mix(1.0, 0.35 + 1.6 * gb * gb, clamp(near, 0.0, 1.0));
    vPush = vec4(Pp, J, K);
    vShape = vec4(Lr, bound, bright, 1.0);
    vTint = tint;
    gl_Position = corner(Pp, bound * (1.0 + abs(K)) / max(J, 0.3) + px, bound + px, gl_VertexID - col * 6);
}`

const FRAG_GLINT = GLSL_COMMON + `
flat in vec4 vPush;
flat in vec4 vShape;
flat in vec3 vTint;
out vec4 outColor;

void main() {
    vec2 fc = gl_FragCoord.xy;
    float px = pxSize();
    vec2 dp = toScene(fc) - vPush.xy;
    vec2 d = vec2(dp.x * vPush.z + dp.y * vPush.w, dp.y);
    float Lr = vShape.x;
    if (max(abs(d.x), abs(d.y)) > vShape.y) discard;
    float th = 0.7 * px + 0.0006;
    float armH = pow(max(0.0, 1.0 - abs(d.x) / max(Lr, 1e-4)), 2.0) * exp(-(d.y * d.y) / (th * th));
    float armV = pow(max(0.0, 1.0 - abs(d.y) / max(Lr, 1e-4)), 2.0) * exp(-(d.x * d.x) / (th * th));
    float r2 = dot(d, d);
    float core = exp(-r2 / max(uGlintCore * uGlintCore, 1e-8));
    float halo = exp(-r2 / max(uGlintHalo * uGlintHalo, 1e-8));
    vec3 tint = vTint;
    vec3 acc = vShape.z * (vec3(1.0) * core * 1.2 + mix(vec3(1.0), tint, 0.5) * (armH + armV) * 0.9 + tint * halo * 0.45 * vShape.w);
    outColor = vec4(acc * vignette(fc), 0.0);
}`

/** Film grain, added (uSign 1) then subtracted (uSign -1) because blending cannot add a signed value. */
const FRAG_GRAIN = GLSL_COMMON + `
uniform float uSign;
out vec4 outColor;
void main() {
    vec2 fc = gl_FragCoord.xy;
    float gn = float(pcg3(uvec3(uvec2(fc), uint(uTime * 60.0))).x) / 4294967295.0 - 0.5;
    outColor = vec4(vec3(max(gn * uSign, 0.0) * uGrain * 0.22), 0.0);
}`

// ══ /EFFECT ═════════════════════════════════════════════════════════════════

interface Props extends EffectProps {
    background?: string
    baseColor?: string
    accentColor?: string
    speed?: number
    scale?: number
    style?: CSSProperties
}

function num(v: unknown, d: number): number {
    return typeof v === "number" && Number.isFinite(v) ? v : d
}

/** The frame the composition was designed in (the intrinsic size above). */
const REF_ASPECT = 1200 / 800
const MAX_DPR = 2
/** Drawn-pixel cap. Covers the reference frame at 2× (3.84 M) untouched. */
const MAX_PIXELS = 4.2e6
/** Resolution steps taken when the GPU runs long, and won back once it is quick. */
const LADDER = [1, 0.85, 0.72, 0.6]
/** Rows the shaders hash modulo (wrapRow in GLSL_COMMON), and each grid's row height. */
const HASH_ROWS = 4096
const FLAKE_ROW = 0.03
const GLINT_ROW = 0.11
/**
 * uTime now drives only shimmer, haze breathing and grain. It wraps where both
 * haze sines (0.9 and 2.3 rad/s) finish whole cycles, so the haze never jumps.
 */
const TIME_WRAP = 20 * Math.PI * 16

interface DirFrame {
    m: [number, number, number, number]
    o: [number, number]
}

/**
 * Scene axes for each Direction (uDir / uDirO in GLSL_COMMON): the cone starts
 * at the edge it flows away from, centred on it, and falls across the frame.
 * scene = m·f + o, f in height units from the top centre (x right, y down).
 */
function dirFrame(dir: unknown, aspect: number): DirFrame {
    const h = aspect / 2
    switch (dir) {
        case "up": return { m: [1, 0, 0, -1], o: [0, 1] }
        case "right": return { m: [0, 1, 1, 0], o: [-0.5, h] }
        case "left": return { m: [0, 1, -1, 0], o: [-0.5, h] }
        default: return { m: [1, 0, 0, 1], o: [0, 0] }
    }
}

interface TimerExt {
    TIME_ELAPSED_EXT: number
    GPU_DISJOINT_EXT: number
}

type LocName = "res" | "time" | "scroll" | "gScroll" | "gPhase" | "mouse" | "hover" | "scale" | "bg" | "base" | "accent" | "sign"

interface Prog {
    prog: WebGLProgram
    u: (name: string) => WebGLUniformLocation | null
    loc: Record<LocName, WebGLUniformLocation | null>
}

/** A grid's per-row instance table: (layer, cell row, first cell column, column count). */
interface Rows {
    vao: WebGLVertexArrayObject
    buf: WebGLBuffer
    cap: number
    data: Int32Array
    n: number
    max: number
}

interface GLState {
    gl: WebGL2RenderingContext
    base: Prog
    flake: Prog
    glint: Prog
    grain: Prog
    empty: WebGLVertexArrayObject
    flakes: Rows
    glints: Rows
    timer: TimerExt | null
    pending: WebGLQuery[]
}

function buildGL(gl: WebGL2RenderingContext): GLState | null {
    const sh = (type: number, src: string) => {
        const s = gl.createShader(type)
        if (!s) return null
        gl.shaderSource(s, src)
        gl.compileShader(s)
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            if (!gl.isContextLost()) console.error("GlitterCascade shader:", gl.getShaderInfoLog(s))
            return null
        }
        return s
    }
    const link = (vsSrc: string, fsSrc: string): Prog | null => {
        const vs = sh(gl.VERTEX_SHADER, vsSrc)
        const fs = sh(gl.FRAGMENT_SHADER, fsSrc)
        const prog = gl.createProgram()
        if (!vs || !fs || !prog) return null
        gl.attachShader(prog, vs)
        gl.attachShader(prog, fs)
        gl.linkProgram(prog)
        gl.deleteShader(vs)
        gl.deleteShader(fs)
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            if (!gl.isContextLost()) console.error("GlitterCascade link:", gl.getProgramInfoLog(prog))
            return null
        }
        const cache = new Map<string, WebGLUniformLocation | null>()
        const u = (name: string) => {
            if (!cache.has(name)) cache.set(name, gl.getUniformLocation(prog, name))
            return cache.get(name) ?? null
        }
        return {
            prog,
            u,
            loc: {
                res: u("uRes"), time: u("uTime"), scroll: u("uScroll"), gScroll: u("uGScroll"), gPhase: u("uGPhase"),
                mouse: u("uMouse"), hover: u("uHover"), scale: u("uScale"), bg: u("uBg"), base: u("uBase"),
                accent: u("uAccent"), sign: u("uSign"),
            },
        }
    }
    const rows = (): Rows | null => {
        const vao = gl.createVertexArray()
        const buf = gl.createBuffer()
        if (!vao || !buf) return null
        gl.bindVertexArray(vao)
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        gl.bufferData(gl.ARRAY_BUFFER, 4096, gl.DYNAMIC_DRAW)
        gl.enableVertexAttribArray(0)
        gl.vertexAttribIPointer(0, 4, gl.INT, 0, 0)
        gl.vertexAttribDivisor(0, 1)
        gl.bindVertexArray(null)
        return { vao, buf, cap: 4096, data: new Int32Array(1024), n: 0, max: 0 }
    }
    const base = link(VERT_FULL, FRAG_BASE)
    const flake = link(VERT_FLAKE, FRAG_FLAKE)
    const glint = link(VERT_GLINT, FRAG_GLINT)
    const grain = link(VERT_FULL, FRAG_GRAIN)
    const empty = gl.createVertexArray()
    const flakes = rows()
    const glints = rows()
    if (!base || !flake || !glint || !grain || !empty || !flakes || !glints) return null
    return {
        gl, base, flake, glint, grain, empty, flakes, glints,
        timer: gl.getExtension("EXT_disjoint_timer_query_webgl2") as TimerExt | null,
        pending: [],
    }
}

/** Live numbers the CPU needs to list visible cells; refreshed with the uniforms. */
interface Cfg {
    fall: number
    spread: number
    drift: number
    wTop: number
    wBot: number
    flakeR: number
    sizeVar: number
    glintReach: number
    glintsOn: boolean
    uCap: number
    pushMax: number
    scale: number
    grain: number
    dir: DirFrame
}

/**
 * Lists the grid cells of one layer whose item can land in the frame, one row
 * of cells per entry. An item sits frac f0..f1 into its cell (plus the layer's
 * shift), at y0 = row·cy + S and x0 = u0·wAt(y0) − D·y0. Rows from the window's
 * y range; per row, the u range where x0 stays inside the window, which is
 * monotone in y along each straight piece of wAt, so the row's ends and the
 * cone's two kinks bound it. One cell of slack each way. Columns beyond |u0| =
 * uCap are skipped: a flake's odds there are under 1e-6 a cell, which matters
 * at low Scale, where a wide frame would otherwise list ~1000 empty columns a row.
 */
function fillRows(
    R: Rows, L: number, S: number, cy: number, cu: number, shx: number, shy: number, f0: number, f1: number,
    reach: number, D: number, x0: number, x1: number, y0: number, y1: number, wTop: number, wBot: number, uCap: number
) {
    const wAt = (y: number) => Math.max(wTop + (wBot - wTop) * Math.min(3, Math.max(0, y)), 1e-3)
    const rowLo = Math.ceil((y0 - reach - S) / cy + shy - f1) - 1
    const rowHi = Math.floor((y1 + reach - S) / cy + shy - f0) + 1
    for (let row = rowLo; row <= rowHi; row++) {
        const ya = (row + f0 - shy) * cy + S
        const yb = (row + f1 - shy) * cy + S
        let lo = Infinity
        let hi = -Infinity
        for (let k = 0; k < 4; k++) {
            const y = k === 0 ? ya : k === 1 ? yb : k === 2 ? 0 : 3
            if (k >= 2 && !(y > ya && y < yb)) continue
            const w = wAt(y)
            lo = Math.min(lo, (x0 - reach + D * y) / w)
            hi = Math.max(hi, (x1 + reach + D * y) / w)
        }
        lo = Math.max(lo, -uCap)
        hi = Math.min(hi, uCap)
        if (lo > hi) continue
        const c0 = Math.ceil(lo / cu + shx - f1) - 1
        const c1 = Math.floor(hi / cu + shx - f0) + 1
        const count = c1 - c0 + 1
        if (count <= 0) continue
        if ((R.n + 1) * 4 > R.data.length) {
            const grown = new Int32Array(R.data.length * 2)
            grown.set(R.data)
            R.data = grown
        }
        const o = R.n * 4
        R.data[o] = L
        R.data[o + 1] = row
        R.data[o + 2] = c0
        R.data[o + 3] = count
        R.n++
        if (count > R.max) R.max = count
    }
}

/** Uploads a row table, growing the GPU buffer only when it outgrows it. */
function uploadRows(gl: WebGL2RenderingContext, R: Rows) {
    gl.bindBuffer(gl.ARRAY_BUFFER, R.buf)
    const bytes = R.n * 16
    if (bytes > R.cap) {
        R.cap = R.data.byteLength
        gl.bufferData(gl.ARRAY_BUFFER, R.data, gl.DYNAMIC_DRAW)
    } else if (bytes > 0) gl.bufferSubData(gl.ARRAY_BUFFER, 0, R.data, 0, R.n * 4)
}

/** Median of the first n values, sorted in a reused scratch array (no allocation). */
function median(src: Float64Array, n: number, scratch: Float64Array): number {
    for (let i = 0; i < n; i++) {
        const v = src[i]
        let j = i - 1
        while (j >= 0 && scratch[j] > v) {
            scratch[j + 1] = scratch[j]
            j--
        }
        scratch[j + 1] = v
    }
    return scratch[n >> 1]
}

export default function GlitterCascade(props: Props) {
    props = withMovedControls(props)
    // Read live from propsRef; destructured here so their defaults sit in the signature.
    const { background = "#000000", baseColor = "#FF6500", accentColor = "#E0C1E3", speed = 100, scale = 100, direction = "down", style } = props
    void [baseColor, accentColor, speed, scale, direction]
    const rootRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const propsRef = useRef(props)
    propsRef.current = props
    const wakeRef = useRef<(() => void) | null>(null)

    useEffect(() => {
        const root = rootRef.current
        const canvas = canvasRef.current
        if (!root || !canvas) return
        const reduced = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

        // Frame and buffer.
        let W = 0
        let H = 0
        let shown = 1
        let level = 0
        let dirty = true

        // Motion, accumulated in float64 and wrapped so the shader only ever sees small values.
        const scroll = new Float64Array(4)
        const fallV = new Float64Array(4)
        let gScroll = 0
        let gPhase = 0
        let clock = 0
        let rate = 0
        let gFall = 0.09
        let glintP = 1
        const cfg: Cfg = {
            fall: 0.09, spread: 0.63, drift: 0.003, wTop: 0.089, wBot: 0.175, flakeR: 0.0025, sizeVar: 0.6,
            glintReach: 0.036, glintsOn: true, uCap: Infinity, pushMax: 0, scale: 1, grain: 0,
            dir: dirFrame("down", REF_ASPECT),
        }

        // Pointer, as a 0..1 share of the frame (v runs down).
        let cx = 0
        let cy = 0
        let moved = false
        let scrolled = false
        let inside = false
        let tu = 0.5
        let tv = 0.5
        let mx = 0.5
        let my = 0.5
        let hov = 0

        // Pacing and quality.
        const gaps = new Float64Array(15)
        const draws = new Float64Array(9)
        const costs = new Float64Array(9)
        const scratch = new Float64Array(15)
        let gapN = 0
        let drawN = 0
        let costN = 0
        let period = 1000 / 60
        let basePeriod = 1000
        let tick = 0
        let lastTick = -1
        let lastDraw = -1
        let drawn = 0
        let slowSince = -1
        let fastSince = -1
        let lastRaise = -1e9
        let bannedUntil = 0
        let running = false
        let visible = true
        let raf = 0

        let G: GLState | null = null
        const init = () => {
            const gl = canvas.getContext("webgl2", {
                alpha: false,
                antialias: false,
                depth: false,
                stencil: false,
                powerPreference: "low-power",
                preserveDrawingBuffer: false,
            })
            G = gl && !gl.isContextLost() ? buildGL(gl) : null
            // Without WebGL the root's Background shows through instead of a black canvas.
            canvas.style.visibility = G ? "visible" : "hidden"
            dirty = true
        }

        const sizeCanvas = () => {
            if (!G || W <= 0 || H <= 0) return
            const dpr = Math.min(MAX_DPR, (window.devicePixelRatio || 1) * Math.min(2, Math.max(1, shown)))
            let k = dpr * LADDER[level]
            const px = W * H * k * k
            if (px > MAX_PIXELS) k *= Math.sqrt(MAX_PIXELS / px)
            const bw = Math.max(1, Math.round(W * k))
            const bh = Math.max(1, Math.round(H * k))
            if (canvas.width !== bw || canvas.height !== bh) {
                canvas.width = bw
                canvas.height = bh
            }
            G.gl.viewport(0, 0, bw, bh)
            for (const P of [G.base, G.flake, G.glint, G.grain]) {
                G.gl.useProgram(P.prog)
                G.gl.uniform2f(P.loc.res, bw, bh)
            }
            dirty = true
        }

        /** Props → uniforms and motion rates. Runs on a prop change or resize, never per frame. */
        const applyProps = (g: GLState) => {
            const p = propsRef.current
            const adv = { ...ADVANCED_DEFAULTS, ...(p.advanced ?? {}) }
            const fall = Math.max(0.2, num(adv.fallSpeed, 7)) / 100
            const spread = Math.max(0, Math.min(90, num(adv.fallSpread, 50))) / 100
            for (let L = 0; L < 4; L++) fallV[L] = Math.max(fall * (1 + ((L - 1.5) / 1.5) * spread), 1e-3)
            gFall = Math.max(fall, 1e-3)
            glintP = 35 / Math.max(Math.max(0, Math.min(60, num(p.glints, 20))), 0.5)
            rate = (Math.max(0, Math.min(100, num(p.speed, 50))) / 50) * (reduced ? 0.25 : 1)
            const gl = g.gl
            const bg = parseColor(p.background, [0.03, 0.03, 0.04, 1])
            const base = parseColor(p.baseColor, [0.23, 0.18, 0.55, 1])
            const acc = parseColor(p.accentColor, [0.91, 0.42, 0.57, 1])
            // Contain: in a frame narrower than the reference the whole cone shrinks
            // to fit the width (and keeps falling below) instead of losing its sides.
            const fit = H > 0 ? Math.min(1, W / H / REF_ASPECT) : 1
            cfg.scale = Math.max(0.05, (Math.max(10, Math.min(300, num(p.scale, 100))) / 100) * fit)
            const D = dirFrame(p.direction, canvas.width / Math.max(1, canvas.height))
            cfg.dir = D
            for (const P of [g.base, g.flake, g.glint, g.grain]) {
                gl.useProgram(P.prog)
                gl.uniform4f(P.u("uDir"), D.m[0], D.m[1], D.m[2], D.m[3])
                gl.uniform2f(P.u("uDirO"), D.o[0], D.o[1])
                gl.uniform3f(P.loc.bg, bg[0], bg[1], bg[2])
                gl.uniform3f(P.loc.base, base[0], base[1], base[2])
                gl.uniform3f(P.loc.accent, acc[0], acc[1], acc[2])
                gl.uniform1f(P.loc.scale, cfg.scale)
                effectUniforms(gl, P.u, p)
            }
            // The same values effectUniforms hands the shaders, for listing visible cells.
            const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
            cfg.fall = fall
            cfg.spread = spread
            cfg.drift = num(adv.drift, 2) / 1000
            cfg.wTop = Math.max(5, num(adv.topWidth, 70)) / 1000
            cfg.wBot = (clamp(num(p.spread, 70), 20, 150) / 100) * 0.25
            cfg.flakeR = Math.max(0.5, num(adv.flakeSize, 3)) / 1600
            cfg.sizeVar = clamp(num(adv.sizeVariance, 60), 0, 200) / 100
            cfg.glintReach = Math.max(
                (Math.max(1, num(adv.glintArm, 34)) / 1000) * 0.6,
                (Math.max(0.5, num(adv.glintHalo, 9)) / 1000) * 3
            )
            cfg.glintsOn = clamp(num(p.glints, 20), 0, 60) > 0
            // Where a cell's flake odds (the shader's ex) fall under 1e-6, for both of its terms.
            const density = clamp(num(p.density, 700), 100, 1500) / 700
            const core = (clamp(num(adv.coreDensity, 42), 0, 100) / 100) * (1 + Math.max(0, num(adv.topBoost, 150)) / 100) * density
            const stray = (clamp(num(adv.stray, 3), 0, 100) / 100) * density
            cfg.uCap = Math.max(
                core > 1e-6 ? Math.sqrt(Math.log(core / 1e-6) / 1.2) : 0,
                stray > 1e-6 ? 1.5 + Math.log(stray / 1e-6) : 0
            ) + 0.2
            // The pointer no longer moves items, so no extra listing slack.
            cfg.pushMax = 0
            cfg.grain = clamp(num(adv.grain, 0), 0, 100) / 100
        }

        /** Lists the visible flake and glint cells for this frame's fall offsets. */
        const listCells = (g: GLState) => {
            const bw = canvas.width
            const bh = Math.max(1, canvas.height)
            const s = cfg.scale
            const px = 1 / (bh * s)
            // The frame's corners in scene space bound the window to list cells in.
            const D = cfg.dir
            const ha = (0.5 * bw) / bh
            let wx0 = Infinity
            let wx1 = -Infinity
            let wy0 = Infinity
            let wy1 = -Infinity
            for (let k = 0; k < 4; k++) {
                const fx = k & 1 ? ha : -ha
                const fy = k >> 1
                const qx = (D.m[0] * fx + D.m[1] * fy + D.o[0]) / s
                const qy = (D.m[2] * fx + D.m[3] * fy + D.o[1]) / s
                wx0 = Math.min(wx0, qx)
                wx1 = Math.max(wx1, qx)
                wy0 = Math.min(wy0, qy)
                wy1 = Math.max(wy1, qy)
            }
            const M = cfg.pushMax * hov
            const F = g.flakes
            F.n = 0
            F.max = 0
            for (let L = 0; L < 4; L++) {
                const sz = 0.75 + 0.2 * L
                const reach = Math.max(cfg.flakeR * sz * (1 + cfg.sizeVar) * 1.4, 0.6 * px) * 1.8 + 2 * px
                fillRows(F, L, scroll[L], FLAKE_ROW, 0.16, L * 0.37, L * 0.61, 0.15, 0.85,
                    2 * reach + M + 2 * px, cfg.drift / fallV[L], wx0, wx1, wy0, wy1, cfg.wTop, cfg.wBot, cfg.uCap)
            }
            const Gl = g.glints
            Gl.n = 0
            Gl.max = 0
            if (cfg.glintsOn) {
                fillRows(Gl, 0, gScroll, GLINT_ROW, 0.55, 0, 0, 0.1, 0.9,
                    2 * (cfg.glintReach + 2 * px) + M + 2 * px, cfg.drift / gFall, wx0, wx1, wy0, wy1, cfg.wTop, cfg.wBot, Infinity)
            }
        }

        /** Per-frame uniforms: the clock, fall offsets and pointer. */
        const set = (gl: WebGL2RenderingContext, P: Prog) => {
            gl.useProgram(P.prog)
            gl.uniform1f(P.loc.time, clock)
            gl.uniform4f(P.loc.scroll, scroll[0], scroll[1], scroll[2], scroll[3])
            gl.uniform1f(P.loc.gScroll, gScroll)
            gl.uniform1f(P.loc.gPhase, gPhase)
            gl.uniform2f(P.loc.mouse, mx, 1 - my)
            // Raw 0..1: the shaders scale it by the Advanced `hover` row (RULES.md).
            gl.uniform1f(P.loc.hover, hov)
        }

        const draw = (g: GLState) => {
            const gl = g.gl
            const ext = g.timer
            if (ext) {
                // Collect finished GPU timings (a few frames late, never stalling).
                while (g.pending.length) {
                    const q = g.pending[0]
                    if (!gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE)) break
                    const ok = !gl.getParameter(ext.GPU_DISJOINT_EXT)
                    const ns = gl.getQueryParameter(q, gl.QUERY_RESULT) as number
                    gl.deleteQuery(q)
                    g.pending.shift()
                    if (ok) costs[costN++ % costs.length] = ns / 1e6
                }
            }
            listCells(g)
            uploadRows(gl, g.flakes)
            uploadRows(gl, g.glints)
            let q: WebGLQuery | null = null
            if (ext && g.pending.length < 4) {
                q = gl.createQuery()
                if (q) gl.beginQuery(ext.TIME_ELAPSED_EXT, q)
            }
            // Ground, then flakes and glints added on top (the original summed them per pixel).
            gl.disable(gl.BLEND)
            set(gl, g.base)
            gl.bindVertexArray(g.empty)
            gl.drawArrays(gl.TRIANGLES, 0, 3)
            gl.enable(gl.BLEND)
            gl.blendEquation(gl.FUNC_ADD)
            gl.blendFunc(gl.ONE, gl.ONE)
            if (g.flakes.n > 0) {
                set(gl, g.flake)
                gl.bindVertexArray(g.flakes.vao)
                gl.drawArraysInstanced(gl.TRIANGLES, 0, 6 * g.flakes.max, g.flakes.n)
            }
            if (g.glints.n > 0) {
                set(gl, g.glint)
                gl.bindVertexArray(g.glints.vao)
                gl.drawArraysInstanced(gl.TRIANGLES, 0, 6 * g.glints.max, g.glints.n)
            }
            if (cfg.grain > 0) {
                set(gl, g.grain)
                gl.bindVertexArray(g.empty)
                gl.uniform1f(g.grain.loc.sign, 1)
                gl.drawArrays(gl.TRIANGLES, 0, 3)
                gl.blendEquation(gl.FUNC_REVERSE_SUBTRACT)
                gl.uniform1f(g.grain.loc.sign, -1)
                gl.drawArrays(gl.TRIANGLES, 0, 3)
                gl.blendEquation(gl.FUNC_ADD)
            }
            gl.bindVertexArray(null)
            if (q && ext) {
                gl.endQuery(ext.TIME_ELAPSED_EXT)
                g.pending.push(q)
            }
            drawn++
        }

        /**
         * Step resolution on measured GPU time, or without the timer on draws
         * arriving late against the display's own period. Drops after 0.5 s
         * slow, wins back after 2.5 s quick, and a level that had to be dropped
         * again right after a raise stays down for 20 s (no ping-pong).
         */
        const adapt = (now: number, interval: number) => {
            if (!G || drawn < 30) return
            let slow = false
            let fast = false
            if (G.timer) {
                if (costN < costs.length) return
                const med = median(costs, costs.length, scratch)
                slow = med > 0.85 * interval
                fast = med < 0.4 * interval
            } else {
                if (drawN < draws.length) return
                const N = Math.max(1, Math.floor(1000 / 60 / Math.max(basePeriod, 4) + 0.25))
                const med = median(draws, draws.length, scratch)
                slow = med > N * basePeriod * 1.4
                fast = med < N * basePeriod * 1.1
            }
            if (slow) {
                fastSince = -1
                if (slowSince < 0) slowSince = now
                if (now - slowSince > 500 && level < LADDER.length - 1) {
                    if (now - lastRaise < 3000) bannedUntil = now + 20000
                    level++
                    slowSince = -1
                    costN = 0
                    drawN = 0
                    sizeCanvas()
                }
            } else {
                slowSince = -1
                if (fast && level > 0 && now > bannedUntil) {
                    if (fastSince < 0) fastSince = now
                    if (now - fastSince > 2500) {
                        level--
                        lastRaise = now
                        fastSince = -1
                        costN = 0
                        drawN = 0
                        sizeCanvas()
                    }
                } else fastSince = -1
            }
        }

        const frame = (now: number) => {
            raf = 0
            if (!running || !G) return
            raf = requestAnimationFrame(frame)
            if (lastTick >= 0) {
                const gap = now - lastTick
                if (gap > 0 && gap < 200) {
                    gaps[gapN++ % gaps.length] = gap
                    if (gapN >= gaps.length && gapN % 15 === 0) {
                        period = median(gaps, gaps.length, scratch)
                        basePeriod = Math.min(basePeriod, period)
                    }
                }
            }
            lastTick = now
            tick++
            // Pace by vsync count: every Nth tick for a steady ~60 fps at any
            // refresh rate (90 Hz → every tick, 120/144 → every 2nd, 165 → 3rd),
            // so a fast screen neither speeds the fall up nor doubles GPU work.
            const N = Math.max(1, Math.floor(1000 / 60 / Math.max(period, 4) + 0.25))

            // Pointer: read the rect only when the pointer moved or the page scrolled.
            if ((moved || scrolled) && inside) {
                const r = root.getBoundingClientRect()
                if (r.width > 0 && r.height > 0) {
                    tu = (cx - r.left) / r.width
                    tv = (cy - r.top) / r.height
                    if (W > 0) shown = r.width / W
                }
            }
            moved = false
            scrolled = false
            if (tick % N !== 0 && !dirty) return

            const dt = lastDraw < 0 ? 0 : Math.min((now - lastDraw) / 1000, 0.05)
            if (lastDraw >= 0) draws[drawN++ % draws.length] = now - lastDraw
            lastDraw = now
            if (dirty) {
                applyProps(G)
                dirty = false
            }

            const ad = dt * rate
            if (ad > 0) {
                for (let L = 0; L < 4; L++) scroll[L] = (scroll[L] + ad * fallV[L]) % (HASH_ROWS * FLAKE_ROW)
                gScroll = (gScroll + ad * gFall) % (HASH_ROWS * GLINT_ROW)
                gPhase = (gPhase + ad / glintP) % HASH_ROWS

                clock = (clock + ad) % TIME_WRAP
            }
            // The push follows the cursor in ~60 ms (it was ~170 ms, which read as lag);
            // the hover strength still fades in and out at the original rate.
            const target = inside ? 1 : 0
            const kp = 1 - Math.exp(-dt / 0.06)
            if (hov < 0.01 && inside) {
                mx = tu
                my = tv
            } else {
                mx += (tu - mx) * kp
                my += (tv - my) * kp
            }
            hov += (target - hov) * (1 - Math.exp(-dt * 6))

            draw(G)
            if (drawn % 60 === 0 && W > 0) {
                const r = root.getBoundingClientRect()
                const s = r.width / W
                if (r.width > 0 && Math.abs(Math.min(2, Math.max(1, s)) - Math.min(2, Math.max(1, shown))) > 0.05) {
                    shown = s
                    sizeCanvas()
                }
            }
            adapt(now, N * period)

            const settled = Math.abs(target - hov) < 0.003 && Math.abs(tu - mx) < 1e-3 && Math.abs(tv - my) < 1e-3
            if (rate <= 0 && settled && !dirty) stop()
        }

        const start = () => {
            if (running || !visible || document.hidden || !G) return
            running = true
            lastTick = -1
            lastDraw = -1
            raf = requestAnimationFrame(frame)
        }
        const stop = () => {
            running = false
            if (raf) cancelAnimationFrame(raf)
            raf = 0
        }
        wakeRef.current = () => {
            dirty = true
            start()
        }

        init()
        const ro = new ResizeObserver((entries) => {
            const cr = entries[entries.length - 1].contentRect
            if (cr.width === W && cr.height === H) return
            W = cr.width
            H = cr.height
            const r = root.getBoundingClientRect()
            if (W > 0 && r.width > 0) shown = r.width / W
            sizeCanvas()
            start()
        })
        ro.observe(root)

        const io =
            typeof IntersectionObserver !== "undefined"
                ? new IntersectionObserver((es) => {
                      visible = es[es.length - 1].isIntersecting
                      if (visible) start()
                      else stop()
                  })
                : null
        io?.observe(root)
        const onVis = () => {
            if (document.hidden) stop()
            else start()
        }
        document.addEventListener("visibilitychange", onVis)

        const onMove = (e: PointerEvent) => {
            cx = e.clientX
            cy = e.clientY
            moved = true
            inside = true
            start()
        }
        const onLeave = () => {
            inside = false
            start()
        }
        const onScroll = () => {
            scrolled = true
        }
        root.addEventListener("pointermove", onMove, { passive: true })
        root.addEventListener("pointerleave", onLeave)
        root.addEventListener("pointercancel", onLeave)
        window.addEventListener("scroll", onScroll, { passive: true, capture: true })

        // Survive a lost GPU context: pause, then rebuild on restore.
        const onLost = (e: Event) => {
            e.preventDefault()
            stop()
            G = null
        }
        const onRestored = () => {
            init()
            sizeCanvas()
            start()
        }
        canvas.addEventListener("webglcontextlost", onLost)
        canvas.addEventListener("webglcontextrestored", onRestored)

        return () => {
            stop()
            wakeRef.current = null
            ro.disconnect()
            io?.disconnect()
            document.removeEventListener("visibilitychange", onVis)
            root.removeEventListener("pointermove", onMove)
            root.removeEventListener("pointerleave", onLeave)
            root.removeEventListener("pointercancel", onLeave)
            window.removeEventListener("scroll", onScroll, { capture: true })
            canvas.removeEventListener("webglcontextlost", onLost)
            canvas.removeEventListener("webglcontextrestored", onRestored)
        }
    }, [])

    // A render carries new props: upload them on the next frame, waking the loop if it had settled.
    useEffect(() => {
        wakeRef.current?.()
    })

    return (
        // No minWidth/minHeight (they cut the component off in a smaller frame):
        // it fills its frame and keeps the 1200×800 shape when the height is open.
        <div ref={rootRef} style={{ position: "relative", width: "100%", height: "100%", aspectRatio: "1200 / 800", overflow: "hidden", background, ...style }}>
            <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
        </div>
    )
}

