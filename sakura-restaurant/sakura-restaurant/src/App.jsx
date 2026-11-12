import { useEffect, useState } from 'react'
import { CURRENCY, NAV, FEATURES, MENU } from './data'

const money = (n) => `${n.toLocaleString('ru-RU')} ${CURRENCY}`

function Header() {
  const [open, setOpen] = useState(false)
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header${stuck || open ? ' stuck' : ''}`}>
      <div className="container bar">
        <a href="#top" className="logo">
          桜 <span>Сакура</span>
        </a>
        <nav className={`nav${open ? ' open' : ''}`}>
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
        <button className="burger" aria-label="Меню" aria-expanded={open} onClick={() => setOpen(!open)}>
          <i />
          <i />
        </button>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="hero">
      <div className="container hero-grid">
        <div>
          <h1>
            Японская кухня
            <br />
            без спешки
          </h1>
          <p className="lead">
            Свежая рыба, правильный рис и бульоны, которые томятся двенадцать часов.
          </p>
          <div className="actions">
            <a className="btn" href="#reserve">Забронировать стол</a>
            <a className="btn ghost" href="#menu">Открыть меню</a>
          </div>
        </div>
        <p className="tate" lang="ja" aria-hidden="true">旬の味を、静かに</p>
      </div>
    </section>
  )
}

function About() {
  return (
    <section id="about" className="section">
      <div className="container about">
        <div>
          <h2>Просто, свежо, по-японски</h2>
          <p className="text">
            Мы открылись в 2016 году как маленький суши-бар на двенадцать мест. Сегодня меню
            стало шире, но принцип прежний: несколько хороших продуктов и аккуратная работа руками.
          </p>
        </div>
        <ul className="feat">
          {FEATURES.map(([kanji, title, text]) => (
            <li key={title}>
              <span className="k" lang="ja">{kanji}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Menu() {
  const [tab, setTab] = useState(MENU[0].id)
  const current = MENU.find((c) => c.id === tab)

  return (
    <section id="menu" className="section menu">
      <div className="container">
        <h2>Меню</h2>
        <div className="tabs" role="tablist">
          {MENU.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={tab === c.id}
              className={tab === c.id ? 'on' : ''}
              onClick={() => setTab(c.id)}
            >
              {c.title}
            </button>
          ))}
        </div>
        <ul className="dishes">
          {current.items.map((it) => (
            <li key={it.name} className="dish">
              <div className="dish-top">
                <h3>{it.name}</h3>
                <i />
                <b>{money(it.price)}</b>
              </div>
              <span className="jp" lang="ja">{it.jp}</span>
              <p>{it.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Reserve() {
  const [form, setForm] = useState({ name: '', phone: '', date: '', guests: '2' })
  const [sent, setSent] = useState(false)
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    // Здесь можно отправить данные на свой API или в Telegram-бота
    setSent(true)
  }

  return (
    <section id="reserve" className="section dark">
      <div className="container narrow">
        <h2>Забронировать стол</h2>
        {sent ? (
          <p className="ok">
            Спасибо, {form.name}! Мы позвоним на {form.phone} и подтвердим бронь на {form.date}.
          </p>
        ) : (
          <form className="form" onSubmit={submit}>
            <input required placeholder="Ваше имя" value={form.name} onChange={set('name')} />
            <input required type="tel" placeholder="Телефон" value={form.phone} onChange={set('phone')} />
            <input required type="date" value={form.date} onChange={set('date')} />
            <select value={form.guests} onChange={set('guests')} aria-label="Количество гостей">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}
                </option>
              ))}
            </select>
            <button className="btn" type="submit">Забронировать</button>
          </form>
        )}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer id="contacts" className="foot">
      <div className="container">
        <div className="foot-grid">
          <div>
            <h3>Адрес</h3>
            <p>ул. Сакура, 12</p>
          </div>
          <div>
            <h3>Часы работы</h3>
            <p>Пн–Чт 12:00–23:00<br />Пт–Вс 12:00–01:00</p>
          </div>
          <div>
            <h3>Связаться</h3>
            <p>+7 000 000-00-00<br />hello@sakura.example</p>
          </div>
        </div>
        <p className="copy">© 2026 Сакура. Демо-проект для портфолио.</p>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Menu />
        <Reserve />
      </main>
      <Footer />
    </>
  )
}
