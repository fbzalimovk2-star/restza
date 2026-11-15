import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { CURRENCY, DISHES } from '../data'

const N = DISHES.length
const SWING = 38 // на сколько градусов тарелка уезжает по орбите
const REST = [[74, 112], [70, 118], [78, 116], [72, 108], [76, 120]] // положение цветной дуги для каждого блюда
const SWEEP = [58, 130] // дуга растягивается в момент смены блюда
const CX = 329, CY = -696, R = 974 // центр и радиус орбиты в координатах сцены 520×520
const HIDE1 = 'inset(0% 0% 0% 100%)'
const HIDE2 = 'inset(0% 100% 0% 0%)'
const SHOW = 'inset(0% 0% 0% 0%)'

const wrap = (i) => ((i % N) + N) % N
const money = (n) => `${n.toLocaleString('ru-RU')} ${CURRENCY}`

// Цветная дуга: толстая линия вдоль орбиты, сужающаяся к концам
function arcPath(a0, a1, w = 140, steps = 40) {
  const out = []
  const inn = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = ((a0 + (a1 - a0) * t) * Math.PI) / 180
    const h = (w / 2) * Math.pow(Math.sin(Math.PI * t), 0.45)
    out.push(`${(CX + Math.cos(a) * (R + h)).toFixed(1)} ${(CY + Math.sin(a) * (R + h)).toFixed(1)}`)
    inn.push(`${(CX + Math.cos(a) * (R - h)).toFixed(1)} ${(CY + Math.sin(a) * (R - h)).toFixed(1)}`)
  }
  return `M${out.join('L')}L${inn.reverse().join('L')}Z`
}

export default function DishCarousel() {
  const [index, setIndex] = useState(0)
  const idx = useRef(0)
  const dir = useRef(1)
  const shown = useRef(-1)
  const tl = useRef(null)
  const plates = useRef([])
  const slides = useRef([])
  const arcEl = useRef(null)
  const arc = useRef({ a0: 0, a1: 0 })
  const swipe = useRef(null)

  useLayoutEffect(() => {
    const from = shown.current
    const to = index
    const part = (i) => {
      const s = slides.current[i]
      return {
        plate: plates.current[i],
        slide: s,
        t1: s.querySelector('.t1'),
        t2: s.querySelector('.t2'),
        rows: [...s.querySelectorAll('.jp, .dsh-card > *')],
      }
    }
    const draw = () => arcEl.current.setAttribute('d', arcPath(arc.current.a0, arc.current.a1))
    const rest = REST[to % REST.length]
    const tint = DISHES[to].accent
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (tl.current) tl.current.progress(1).kill()
    const b = part(to)

    // первый показ или без анимации: просто выставляем нужное состояние
    if (from === -1 || from === to || reduced) {
      DISHES.forEach((_, i) => {
        if (i !== to) gsap.set([part(i).plate, part(i).slide], { autoAlpha: 0 })
      })
      gsap.set([b.plate, b.slide], { autoAlpha: 1, rotation: 0 })
      gsap.set([b.t1, b.t2], { clipPath: SHOW })
      gsap.set(b.rows, { autoAlpha: 1, y: 0 })
      arc.current.a0 = rest[0]
      arc.current.a1 = rest[1]
      draw()
      gsap.set(arcEl.current, { fill: tint })
      shown.current = to
      return
    }

    const a = part(from)
    const d = dir.current
    const t = gsap.timeline({ onComplete: () => { tl.current = null } })
    tl.current = t
    // тарелка уезжает по орбите, следующая приезжает с другой стороны
    t.to(a.plate, { rotation: SWING * d, duration: 0.6, ease: 'power2.in' }, 0)
      .set(a.plate, { autoAlpha: 0, rotation: 0 }, 0.6)
      .fromTo(b.plate, { autoAlpha: 1, rotation: -SWING * d }, { rotation: 0, duration: 0.95, ease: 'power3.out' }, 0.3)
    // название: тонкая строка уходит вправо, жирная влево, затем новые «выезжают»
    t.to(a.t1, { clipPath: HIDE1, duration: 0.4, ease: 'power2.in' }, 0)
      .to(a.t2, { clipPath: HIDE2, duration: 0.4, ease: 'power2.in' }, 0.06)
      .to(a.rows, { autoAlpha: 0, duration: 0.25 }, 0.05)
      .set(a.slide, { autoAlpha: 0 }, 0.5)
      .set(b.slide, { autoAlpha: 1 }, 0.5)
      .fromTo(b.t1, { clipPath: HIDE1 }, { clipPath: SHOW, duration: 0.7, ease: 'power3.out' }, 0.55)
      .fromTo(b.t2, { clipPath: HIDE2 }, { clipPath: SHOW, duration: 0.7, ease: 'power3.out' }, 0.62)
      .fromTo(b.rows, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, 0.5)
    // цветная дуга растягивается и принимает цвет нового блюда
    t.to(arc.current, { a0: SWEEP[0], a1: SWEEP[1], duration: 0.6, ease: 'power2.inOut', onUpdate: draw }, 0)
      .to(arc.current, { a0: rest[0], a1: rest[1], duration: 0.85, ease: 'power3.out', onUpdate: draw }, 0.6)
      .to(arcEl.current, { fill: tint, duration: 1.1, ease: 'power1.inOut' }, 0.1)
    shown.current = to
  }, [index])

  const go = (to, d) => {
    const next = wrap(to)
    if (next === idx.current) return
    const fwd = wrap(next - idx.current)
    dir.current = d ?? (fwd <= N - fwd ? 1 : -1)
    idx.current = next
    setIndex(next)
  }

  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(idx.current + 1, 1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx.current - 1, -1) }
  }
  const onDown = (e) => { swipe.current = { x: e.clientX, y: e.clientY } }
  const onUp = (e) => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const dx = e.clientX - s.x
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.4) go(idx.current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1)
  }

  return (
    <section id="hits" className="section dsh-sec">
      <div className="container">
        <h2>Хиты кухни</h2>
        <div className="dsh" tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Фирменные блюда" onKeyDown={onKey}>
          <div className="dsh-main">
            <div className="dsh-plates" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => (swipe.current = null)}>
              <svg className="dsh-arc" viewBox="0 0 520 520" aria-hidden="true">
                <path ref={arcEl} style={{ opacity: 0.34 }} />
              </svg>
              {DISHES.map((x, i) => (
                <div key={x.id} ref={(el) => (plates.current[i] = el)} className="dsh-orbit" aria-hidden={i !== index}>
                  <div className="dsh-plate"><span aria-hidden="true">{x.emoji}</span></div>
                </div>
              ))}
            </div>

            <div className="dsh-slides" aria-live="polite">
              {DISHES.map((x, i) => (
                <div key={x.id} ref={(el) => (slides.current[i] = el)} className="dsh-slide" aria-hidden={i !== index}>
                  <p className="jp" lang="ja">{x.jp}</p>
                  <h3><span className="t1">{x.t1}</span><span className="t2">{x.t2}</span></h3>
                  <div className="dsh-card">
                    <div className="dsh-rate">
                      <b style={{ background: x.accent }}>{x.rating.toFixed(1)}</b>
                      <div><strong>{x.chef}</strong><small>{x.place}</small></div>
                    </div>
                    <p>{x.desc}</p>
                    <ul className="dsh-ing">{x.ing.map((g) => <li key={g}>{g}</li>)}</ul>
                    <div className="dsh-buy">
                      <span>{money(x.price)}</span>
                      <a className="btn" href="#reserve" tabIndex={i === index ? 0 : -1}>Забронировать</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dsh-strip">
            <button type="button" className="dsh-arrow" aria-label="Предыдущее блюдо" onClick={() => go(index - 1, -1)}>‹</button>
            <div className="dsh-thumbs">
              {DISHES.map((x, i) => (
                <button key={x.id} type="button" aria-current={i === index ? 'true' : undefined} onClick={() => go(i)}>
                  <span aria-hidden="true">{x.emoji}</span>
                  {x.t1} {x.t2}
                </button>
              ))}
            </div>
            <button type="button" className="dsh-arrow" aria-label="Следующее блюдо" onClick={() => go(index + 1, 1)}>›</button>
          </div>
        </div>
      </div>
    </section>
  )
}
